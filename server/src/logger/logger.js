/**
 * Centralized logging configuration using Pino
 */

const pino = require("pino")
const config = require("../config")

// Create logger instance
const logger = pino({
  level: config.isDevelopment ? "debug" : "info",
  transport: config.isDevelopment
    ? {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:standard",
          ignore: "pid,hostname",
        },
      }
    : undefined,
  formatters: {
    level: (label) => ({ level: label }),
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  redact: {
    paths: ["password", "token", "authorization", "cookie", "mobile", "phone", "email"],
    censor: "[REDACTED]",
  },
})

// Add request correlation ID support
const createChildLogger = (correlationId) => {
  return logger.child({ correlationId })
}

// Mask sensitive data in logs
const maskSensitiveData = (data) => {
  if (typeof data !== "object" || data === null) return data

  const masked = { ...data }

  // Mask mobile numbers (show only last 2 digits)
  if (masked.mobile) {
    masked.mobile = masked.mobile.replace(/(\+\d{1,3})\d+(\d{2})/, "$1****$2")
  }

  // Mask email addresses
  if (masked.email) {
    masked.email = masked.email.replace(/(.{2}).*@/, "$1***@")
  }

  return masked
}

// Export logger with utility functions
module.exports = {
  logger,
  createChildLogger,
  maskSensitiveData,

  // Convenience methods
  info: (msg, data) => logger.info(maskSensitiveData(data), msg),
  error: (msg, error) => logger.error({ error: error?.stack || error }, msg),
  warn: (msg, data) => logger.warn(maskSensitiveData(data), msg),
  debug: (msg, data) => logger.debug(maskSensitiveData(data), msg),
}
