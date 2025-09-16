const twilio = require("twilio")
const { google } = require("googleapis")
const axios = require("axios")
const logger = require("../logger/logger")
const config = require("../config")

class NotificationService {
  constructor() {
    // Initialize Twilio client
    if (config.TWILIO_ACCOUNT_SID && config.TWILIO_AUTH_TOKEN) {
      this.twilioClient = twilio(config.TWILIO_ACCOUNT_SID, config.TWILIO_AUTH_TOKEN)
    }

    // Initialize Google Sheets API
    this.initializeGoogleSheets()
  }

  async initializeGoogleSheets() {
    try {
      if (config.GOOGLE_SHEETS_CREDENTIALS_JSON) {
        const credentials = JSON.parse(config.GOOGLE_SHEETS_CREDENTIALS_JSON)
        const auth = new google.auth.GoogleAuth({
          credentials,
          scopes: ["https://www.googleapis.com/auth/spreadsheets"],
        })

        this.sheetsClient = google.sheets({ version: "v4", auth })
        logger.info("Google Sheets API initialized")
      }
    } catch (error) {
      logger.error("Error initializing Google Sheets API:", error)
    }
  }

  // SMS Notifications via Twilio
  async sendSMS(to, message, templateData = {}) {
    try {
      if (!this.twilioClient) {
        logger.warn("Twilio not configured, skipping SMS")
        return { success: false, error: "Twilio not configured" }
      }

      // Replace template variables in message
      let finalMessage = message
      Object.keys(templateData).forEach((key) => {
        finalMessage = finalMessage.replace(`{{${key}}}`, templateData[key])
      })

      const result = await this.twilioClient.messages.create({
        body: finalMessage,
        from: config.TWILIO_FROM_NUMBER,
        to: to,
      })

      logger.info(`SMS sent successfully to ${to}, SID: ${result.sid}`)
      return { success: true, sid: result.sid }
    } catch (error) {
      logger.error("Error sending SMS:", error)
      return { success: false, error: error.message }
    }
  }

  // Application status notifications
  async notifyApplicationStatus(application, candidate, internship) {
    try {
      const templates = {
        pending:
          "Hi {{candidateName}}, your application for {{internshipTitle}} at {{companyName}} has been received and is under review.",
        reviewed:
          "Hi {{candidateName}}, your application for {{internshipTitle}} at {{companyName}} has been reviewed.",
        shortlisted:
          "Congratulations {{candidateName}}! You have been shortlisted for {{internshipTitle}} at {{companyName}}. Next steps will be communicated soon.",
        interview_scheduled:
          "Hi {{candidateName}}, an interview has been scheduled for {{internshipTitle}} at {{companyName}}. Check your email for details.",
        selected:
          "Congratulations {{candidateName}}! You have been selected for {{internshipTitle}} at {{companyName}}. Welcome aboard!",
        rejected:
          "Hi {{candidateName}}, thank you for your interest in {{internshipTitle}} at {{companyName}}. Unfortunately, we cannot proceed with your application at this time.",
        withdrawn:
          "Hi {{candidateName}}, your application for {{internshipTitle}} at {{companyName}} has been withdrawn as requested.",
      }

      const message = templates[application.status]
      if (!message) {
        logger.warn(`No SMS template found for status: ${application.status}`)
        return
      }

      const templateData = {
        candidateName: candidate.name,
        internshipTitle: internship.title,
        companyName: internship.companyName,
      }

      // Send SMS notification
      if (candidate.phone) {
        await this.sendSMS(candidate.phone, message, templateData)
      }

      // Log notification event
      const EventLog = require("../models/EventLog")
      await EventLog.create({
        type: "notification_sent",
        entityType: "application",
        entityId: application._id,
        data: {
          candidateId: candidate._id,
          internshipId: internship._id,
          status: application.status,
          notificationType: "sms",
          phone: candidate.phone,
        },
      })
    } catch (error) {
      logger.error("Error sending application status notification:", error)
    }
  }

  // New internship notifications
  async notifyNewInternship(internship, matchedCandidates = []) {
    try {
      const message =
        "New internship opportunity: {{internshipTitle}} at {{companyName}} in {{location}}. Stipend: ₹{{stipend}}. Apply now!"

      const templateData = {
        internshipTitle: internship.title,
        companyName: internship.companyName,
        location: internship.location,
        stipend: internship.stipend || "Not specified",
      }

      // Send to matched candidates
      for (const candidate of matchedCandidates) {
        if (candidate.phone && candidate.preferences?.notifications?.sms) {
          await this.sendSMS(candidate.phone, message, templateData)
        }
      }

      logger.info(`New internship notifications sent to ${matchedCandidates.length} candidates`)
    } catch (error) {
      logger.error("Error sending new internship notifications:", error)
    }
  }

  // Google Sheets integration
  async updateGoogleSheet(data, sheetName = "Applications") {
    try {
      if (!this.sheetsClient || !config.GOOGLE_SHEETS_ID) {
        logger.warn("Google Sheets not configured")
        return { success: false, error: "Google Sheets not configured" }
      }

      // Prepare row data
      const values = [
        [
          data.applicationId || "",
          data.candidateName || "",
          data.candidateEmail || "",
          data.candidatePhone || "",
          data.internshipTitle || "",
          data.companyName || "",
          data.status || "",
          data.appliedAt || "",
          data.stipend || "",
          data.location || "",
        ],
      ]

      const request = {
        spreadsheetId: config.GOOGLE_SHEETS_ID,
        range: `${sheetName}!A:J`,
        valueInputOption: "RAW",
        resource: { values },
      }

      const response = await this.sheetsClient.spreadsheets.values.append(request)
      logger.info("Data added to Google Sheets successfully")
      return { success: true, updatedRows: response.data.updates.updatedRows }
    } catch (error) {
      logger.error("Error updating Google Sheets:", error)
      return { success: false, error: error.message }
    }
  }

  // n8n webhook integration
  async triggerN8nWorkflow(workflowType, data) {
    try {
      if (!config.N8N_WEBHOOK_URL) {
        logger.warn("n8n webhook not configured")
        return { success: false, error: "n8n webhook not configured" }
      }

      const payload = {
        workflowType,
        timestamp: new Date().toISOString(),
        data,
        signature: this.generateWebhookSignature(data),
      }

      const response = await axios.post(config.N8N_WEBHOOK_URL, payload, {
        headers: {
          "Content-Type": "application/json",
          "X-Webhook-Source": "pmis-smartmatch",
        },
        timeout: 10000,
      })

      logger.info(`n8n workflow triggered: ${workflowType}`)
      return { success: true, response: response.data }
    } catch (error) {
      logger.error("Error triggering n8n workflow:", error)
      return { success: false, error: error.message }
    }
  }

  generateWebhookSignature(data) {
    const crypto = require("crypto")
    const secret = config.N8N_WEBHOOK_SECRET || "default-secret"
    return crypto.createHmac("sha256", secret).update(JSON.stringify(data)).digest("hex")
  }

  // Workflow triggers for different events
  async onApplicationSubmitted(application, candidate, internship) {
    try {
      // Update Google Sheets
      await this.updateGoogleSheet({
        applicationId: application._id.toString(),
        candidateName: candidate.name,
        candidateEmail: candidate.email,
        candidatePhone: candidate.phone,
        internshipTitle: internship.title,
        companyName: internship.companyName,
        status: application.status,
        appliedAt: application.appliedAt.toISOString(),
        stipend: internship.stipend,
        location: internship.location,
      })

      // Trigger n8n workflow
      await this.triggerN8nWorkflow("application_submitted", {
        applicationId: application._id,
        candidateId: candidate._id,
        internshipId: internship._id,
        candidateData: {
          name: candidate.name,
          email: candidate.email,
          phone: candidate.phone,
          skills: candidate.skills,
          location: candidate.location,
        },
        internshipData: {
          title: internship.title,
          companyName: internship.companyName,
          location: internship.location,
          stipend: internship.stipend,
        },
      })

      // Send confirmation SMS
      await this.notifyApplicationStatus(application, candidate, internship)
    } catch (error) {
      logger.error("Error in onApplicationSubmitted workflow:", error)
    }
  }

  async onApplicationStatusChanged(application, candidate, internship, oldStatus) {
    try {
      // Trigger n8n workflow
      await this.triggerN8nWorkflow("application_status_changed", {
        applicationId: application._id,
        candidateId: candidate._id,
        internshipId: internship._id,
        oldStatus,
        newStatus: application.status,
        changedAt: new Date().toISOString(),
      })

      // Send status notification
      await this.notifyApplicationStatus(application, candidate, internship)

      // Update Google Sheets with status change
      await this.updateGoogleSheet(
        {
          applicationId: application._id.toString(),
          candidateName: candidate.name,
          candidateEmail: candidate.email,
          candidatePhone: candidate.phone,
          internshipTitle: internship.title,
          companyName: internship.companyName,
          status: application.status,
          appliedAt: application.appliedAt.toISOString(),
          stipend: internship.stipend,
          location: internship.location,
        },
        "Status_Updates",
      )
    } catch (error) {
      logger.error("Error in onApplicationStatusChanged workflow:", error)
    }
  }

  async onNewInternshipPosted(internship, matchedCandidates = []) {
    try {
      // Trigger n8n workflow
      await this.triggerN8nWorkflow("new_internship_posted", {
        internshipId: internship._id,
        internshipData: {
          title: internship.title,
          companyName: internship.companyName,
          location: internship.location,
          stipend: internship.stipend,
          requiredSkills: internship.requiredSkills,
          sector: internship.sector,
        },
        matchedCandidatesCount: matchedCandidates.length,
        postedAt: internship.createdAt,
      })

      // Send notifications to matched candidates
      await this.notifyNewInternship(internship, matchedCandidates)
    } catch (error) {
      logger.error("Error in onNewInternshipPosted workflow:", error)
    }
  }

  // Bulk notification methods
  async sendBulkSMS(recipients, message, templateData = {}) {
    try {
      const results = []

      for (const recipient of recipients) {
        const result = await this.sendSMS(recipient.phone, message, {
          ...templateData,
          ...recipient.data,
        })
        results.push({
          phone: recipient.phone,
          ...result,
        })
      }

      return results
    } catch (error) {
      logger.error("Error sending bulk SMS:", error)
      return []
    }
  }

  // Analytics and reporting
  async getNotificationStats(startDate, endDate) {
    try {
      const EventLog = require("../models/EventLog")

      const stats = await EventLog.aggregate([
        {
          $match: {
            type: "notification_sent",
            createdAt: {
              $gte: new Date(startDate),
              $lte: new Date(endDate),
            },
          },
        },
        {
          $group: {
            _id: "$data.notificationType",
            count: { $sum: 1 },
            successCount: {
              $sum: {
                $cond: [{ $eq: ["$data.success", true] }, 1, 0],
              },
            },
          },
        },
      ])

      return stats
    } catch (error) {
      logger.error("Error getting notification stats:", error)
      return []
    }
  }
}

module.exports = NotificationService
