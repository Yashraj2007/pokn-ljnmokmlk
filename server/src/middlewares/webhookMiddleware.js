const crypto = require("crypto")
const logger = require("../logger/logger")
const config = require("../config")

// Webhook signature verification middleware
const verifyWebhookSignature = (req, res, next) => {
  try {
    const signature = req.headers["x-webhook-signature"]
    const timestamp = req.headers["x-webhook-timestamp"]

    if (!signature || !timestamp) {
      return res.status(401).json({ error: "Missing webhook signature or timestamp" })
    }

    // Check timestamp to prevent replay attacks (5 minute window)
    const currentTime = Math.floor(Date.now() / 1000)
    const webhookTime = Number.parseInt(timestamp)

    if (Math.abs(currentTime - webhookTime) > 300) {
      return res.status(401).json({ error: "Webhook timestamp too old" })
    }

    // Verify signature
    const secret = config.N8N_WEBHOOK_SECRET || "default-secret"
    const payload = JSON.stringify(req.body)
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(timestamp + payload)
      .digest("hex")

    if (signature !== expectedSignature) {
      return res.status(401).json({ error: "Invalid webhook signature" })
    }

    next()
  } catch (error) {
    logger.error("Error verifying webhook signature:", error)
    res.status(500).json({ error: "Webhook verification failed" })
  }
}

// Rate limiting for webhooks
const webhookRateLimit = (req, res, next) => {
  // Simple in-memory rate limiting (in production, use Redis)
  const clientIP = req.ip
  const now = Date.now()
  const windowMs = 60 * 1000 // 1 minute
  const maxRequests = 100

  if (!global.webhookRateLimit) {
    global.webhookRateLimit = new Map()
  }

  const clientData = global.webhookRateLimit.get(clientIP) || { count: 0, resetTime: now + windowMs }

  if (now > clientData.resetTime) {
    clientData.count = 1
    clientData.resetTime = now + windowMs
  } else {
    clientData.count++
  }

  global.webhookRateLimit.set(clientIP, clientData)

  if (clientData.count > maxRequests) {
    return res.status(429).json({ error: "Too many webhook requests" })
  }

  next()
}

module.exports = {
  verifyWebhookSignature,
  webhookRateLimit,
}
