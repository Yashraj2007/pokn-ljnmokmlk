/**
 * Rate limiting middleware using express-rate-limit
 */

const rateLimit = require("express-rate-limit")
const { RateLimiterRedis } = require("rate-limiter-flexible")
const Redis = require("redis")
const config = require("../config")
const { logger } = require("../logger/logger")

let redisClient = null
let rateLimiterRedis = null

// Initialize Redis client if available
if (config.redis) {
  try {
    redisClient = Redis.createClient(config.redis)
    redisClient.on("error", (err) => {
      logger.warn("Redis client error", { error: err.message })
    })

    rateLimiterRedis = new RateLimiterRedis({
      storeClient: redisClient,
      keyPrefix: "pmis_rl",
      points: config.rateLimit.max,
      duration: Math.floor(config.rateLimit.windowMs / 1000),
    })

    logger.info("✅ Redis rate limiter initialized")
  } catch (error) {
    logger.warn("Failed to initialize Redis rate limiter, falling back to memory", { error: error.message })
  }
}

// Redis-based rate limiter middleware
const redisRateLimiter = async (req, res, next) => {
  if (!rateLimiterRedis) {
    return next()
  }

  try {
    const key = req.ip
    await rateLimiterRedis.consume(key)
    next()
  } catch (rejRes) {
    const secs = Math.round(rejRes.msBeforeNext / 1000) || 1
    res.set("Retry-After", String(secs))
    res.status(429).json({
      success: false,
      message: "Too many requests, please try again later.",
      retryAfter: secs,
    })
  }
}

// Memory-based rate limiter (fallback)
const memoryRateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: {
    success: false,
    message: config.rateLimit.message,
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn("Rate limit exceeded", {
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      correlationId: req.correlationId,
    })

    res.status(429).json({
      success: false,
      message: config.rateLimit.message,
    })
  },
})

// Export appropriate rate limiter
module.exports = rateLimiterRedis ? redisRateLimiter : memoryRateLimiter
