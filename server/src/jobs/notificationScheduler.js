const cron = require("node-cron")
const NotificationService = require("../services/notificationService")
const logger = require("../logger/logger")

class NotificationScheduler {
  constructor() {
    this.notificationService = new NotificationService()
  }

  start() {
    // Daily summary notifications at 9 AM
    cron.schedule("0 9 * * *", async () => {
      await this.sendDailySummary()
    })

    // Weekly analytics report on Mondays at 10 AM
    cron.schedule("0 10 * * 1", async () => {
      await this.sendWeeklyReport()
    })

    // Reminder notifications for pending applications (every 2 hours during business hours)
    cron.schedule("0 9-17/2 * * 1-5", async () => {
      await this.sendPendingApplicationReminders()
    })

    logger.info("Notification scheduler started")
  }

  async sendDailySummary() {
    try {
      logger.info("Sending daily summary notifications...")

      const Application = require("../models/Application")
      const Candidate = require("../models/Candidate")
      const Internship = require("../models/Internship")

      // Get yesterday's stats
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      yesterday.setHours(0, 0, 0, 0)

      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const stats = {
        newApplications: await Application.countDocuments({
          createdAt: { $gte: yesterday, $lt: today },
        }),
        newCandidates: await Candidate.countDocuments({
          createdAt: { $gte: yesterday, $lt: today },
        }),
        newInternships: await Internship.countDocuments({
          createdAt: { $gte: yesterday, $lt: today },
        }),
        selectedApplications: await Application.countDocuments({
          status: "selected",
          updatedAt: { $gte: yesterday, $lt: today },
        }),
      }

      // Trigger n8n workflow for daily summary
      await this.notificationService.triggerN8nWorkflow("daily_summary", {
        date: yesterday.toISOString().split("T")[0],
        stats,
      })

      logger.info("Daily summary sent:", stats)
    } catch (error) {
      logger.error("Error sending daily summary:", error)
    }
  }

  async sendWeeklyReport() {
    try {
      logger.info("Sending weekly analytics report...")

      const Application = require("../models/Application")

      // Get last week's data
      const lastWeek = new Date()
      lastWeek.setDate(lastWeek.getDate() - 7)

      const weeklyStats = await Application.aggregate([
        {
          $match: {
            createdAt: { $gte: lastWeek },
          },
        },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ])

      // Get notification stats
      const notificationStats = await this.notificationService.getNotificationStats(
        lastWeek.toISOString(),
        new Date().toISOString(),
      )

      // Trigger n8n workflow for weekly report
      await this.notificationService.triggerN8nWorkflow("weekly_report", {
        weekStarting: lastWeek.toISOString().split("T")[0],
        applicationStats: weeklyStats,
        notificationStats,
      })

      logger.info("Weekly report sent")
    } catch (error) {
      logger.error("Error sending weekly report:", error)
    }
  }

  async sendPendingApplicationReminders() {
    try {
      logger.info("Sending pending application reminders...")

      const Application = require("../models/Application")

      // Find applications pending for more than 24 hours
      const oneDayAgo = new Date()
      oneDayAgo.setHours(oneDayAgo.getHours() - 24)

      const pendingApplications = await Application.find({
        status: "pending",
        createdAt: { $lte: oneDayAgo },
      })
        .populate("candidateId")
        .populate("internshipId")
        .limit(50)

      for (const application of pendingApplications) {
        if (application.candidateId && application.internshipId) {
          // Trigger n8n workflow for reminder
          await this.notificationService.triggerN8nWorkflow("application_reminder", {
            applicationId: application._id,
            candidateId: application.candidateId._id,
            internshipId: application.internshipId._id,
            daysPending: Math.floor((Date.now() - application.createdAt) / (1000 * 60 * 60 * 24)),
          })
        }
      }

      logger.info(`Sent reminders for ${pendingApplications.length} pending applications`)
    } catch (error) {
      logger.error("Error sending pending application reminders:", error)
    }
  }

  async sendCustomNotification(type, recipients, data) {
    try {
      logger.info(`Sending custom notification: ${type}`)

      for (const recipient of recipients) {
        if (recipient.phone) {
          await this.notificationService.sendSMS(recipient.phone, data.message, {
            ...data.templateData,
            ...recipient.data,
          })
        }
      }

      // Trigger n8n workflow
      await this.notificationService.triggerN8nWorkflow("custom_notification", {
        type,
        recipientCount: recipients.length,
        data,
      })

      logger.info(`Custom notification sent to ${recipients.length} recipients`)
    } catch (error) {
      logger.error("Error sending custom notification:", error)
    }
  }
}

module.exports = NotificationScheduler
