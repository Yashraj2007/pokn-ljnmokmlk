/**
 * Webhooks routes
 * Handles external webhook integrations (n8n, etc.)
 */

const express = require("express")
const crypto = require("crypto")
const config = require("../config")
const EventLog = require("../models/EventLog")
const { logger } = require("../logger/logger")

const router = express.Router()

/**
 * Verify webhook signature
 */
const verifyWebhookSignature = (req, res, next) => {
  const signature = req.headers["x-pmis-signature"]
  const secret = config.notifications.n8n.secret

  if (!signature || !secret) {
    return res.status(401).json({
      success: false,
      message: "Missing webhook signature or secret",
    })
  }

  const body = JSON.stringify(req.body)
  const expectedSignature = crypto.createHmac("sha256", secret).update(body).digest("hex")

  const providedSignature = signature.replace("sha256=", "")

  if (!crypto.timingSafeEqual(Buffer.from(expectedSignature, "hex"), Buffer.from(providedSignature, "hex"))) {
    return res.status(401).json({
      success: false,
      message: "Invalid webhook signature",
    })
  }

  next()
}

/**
 * POST /api/webhooks/n8n/application
 * Handle application events from n8n
 */
router.post("/n8n/application", verifyWebhookSignature, async (req, res) => {
  try {
    const { event, application, metadata } = req.body

    if (!event || !application) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: event, application",
      })
    }

    // Log the webhook event
    await EventLog.logEvent(
      "webhook_received",
      {
        source: "n8n",
        event,
        application,
        metadata,
      },
      {
        correlationId: req.correlationId,
        source: "webhook",
        candidateId: application.candidate?.id,
        internshipId: application.internship?.id,
        applicationId: application.applicationId,
      },
    )

    logger.info("n8n webhook received", {
      event,
      applicationId: application.applicationId,
      candidateId: application.candidate?.id,
    })

    // Process different event types
    switch (event) {
      case "application.created":
        await handleApplicationCreated(application)
        break
      case "application.status_changed":
        await handleApplicationStatusChanged(application)
        break
      case "notification.sent":
        await handleNotificationSent(application, metadata)
        break
      default:
        logger.warn("Unknown webhook event type", { event })
    }

    res.json({
      success: true,
      message: "Webhook processed successfully",
      event,
      correlationId: req.correlationId,
    })
  } catch (error) {
    logger.error("n8n webhook error", error)
    res.status(500).json({
      success: false,
      message: "Failed to process webhook",
      correlationId: req.correlationId,
    })
  }
})

/**
 * POST /api/webhooks/n8n/daily-summary
 * Handle daily summary webhook from n8n
 */
router.post("/n8n/daily-summary", verifyWebhookSignature, async (req, res) => {
  try {
    const { date, metrics, actions } = req.body

    // Log the daily summary event
    await EventLog.logEvent(
      "daily_summary_webhook",
      {
        date,
        metrics,
        actions,
      },
      {
        correlationId: req.correlationId,
        source: "webhook",
      },
    )

    logger.info("Daily summary webhook received", { date, metrics })

    res.json({
      success: true,
      message: "Daily summary webhook processed",
      correlationId: req.correlationId,
    })
  } catch (error) {
    logger.error("Daily summary webhook error", error)
    res.status(500).json({
      success: false,
      message: "Failed to process daily summary webhook",
      correlationId: req.correlationId,
    })
  }
})

/**
 * POST /api/webhooks/n8n/retrain
 * Handle model retrain trigger from n8n
 */
router.post("/n8n/retrain", verifyWebhookSignature, async (req, res) => {
  try {
    const { trigger, threshold, eventCount } = req.body

    // Log the retrain trigger
    await EventLog.logEvent(
      "retrain_trigger_webhook",
      {
        trigger,
        threshold,
        eventCount,
      },
      {
        correlationId: req.correlationId,
        source: "webhook",
      },
    )

    logger.info("Retrain trigger webhook received", { trigger, eventCount })

    // Here you would trigger the actual retraining process
    // For now, we'll just log it

    res.json({
      success: true,
      message: "Retrain trigger processed",
      correlationId: req.correlationId,
    })
  } catch (error) {
    logger.error("Retrain webhook error", error)
    res.status(500).json({
      success: false,
      message: "Failed to process retrain webhook",
      correlationId: req.correlationId,
    })
  }
})

/**
 * GET /api/webhooks/health
 * Webhook health check
 */
router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Webhooks endpoint is healthy",
    timestamp: new Date().toISOString(),
    endpoints: ["/api/webhooks/n8n/application", "/api/webhooks/n8n/daily-summary", "/api/webhooks/n8n/retrain"],
  })
})

// Helper functions
async function handleApplicationCreated(application) {
  try {
    // Update application analytics or trigger additional processing
    logger.info("Processing application created event", {
      applicationId: application.applicationId,
    })

    // Here you could trigger additional workflows like:
    // - Send confirmation SMS to candidate
    // - Notify company about new application
    // - Update analytics dashboards
  } catch (error) {
    logger.error("Error handling application created", error)
  }
}

async function handleApplicationStatusChanged(application) {
  try {
    logger.info("Processing application status changed event", {
      applicationId: application.applicationId,
      newStatus: application.status,
    })

    // Here you could trigger status-specific workflows like:
    // - Send interview invitation
    // - Send offer letter
    // - Update candidate profile
  } catch (error) {
    logger.error("Error handling application status changed", error)
  }
}

async function handleNotificationSent(application, metadata) {
  try {
    logger.info("Processing notification sent event", {
      applicationId: application.applicationId,
      notificationType: metadata?.type,
      channel: metadata?.channel,
    })

    // Log notification delivery for analytics
    await EventLog.logEvent(
      "notification_delivered",
      {
        applicationId: application.applicationId,
        type: metadata?.type,
        channel: metadata?.channel,
        success: metadata?.success,
      },
      {
        candidateId: application.candidate?.id,
        internshipId: application.internship?.id,
        applicationId: application.applicationId,
      },
    )
  } catch (error) {
    logger.error("Error handling notification sent", error)
  }
}

module.exports = router
