/**
 * Global error handling middleware
 */

const { logger } = require("../logger/logger")
const config = require("../config")

const errorHandler = (err, req, res, next) => {
  // Log error with correlation ID
  logger.error("Unhandled error", {
    error: err.stack,
    correlationId: req.correlationId,
    method: req.method,
    url: req.url,
    body: req.body,
  })

  // Default error response
  let statusCode = 500
  let message = "Internal Server Error"
  let details = null

  // Handle specific error types
  if (err.name === "ValidationError") {
    statusCode = 400
    message = "Validation Error"
    details = Object.values(err.errors).map((e) => e.message)
  } else if (err.name === "CastError") {
    statusCode = 400
    message = "Invalid ID format"
  } else if (err.code === 11000) {
    statusCode = 409
    message = "Duplicate entry"
    const field = Object.keys(err.keyValue)[0]
    details = `${field} already exists`
  } else if (err.name === "JsonWebTokenError") {
    statusCode = 401
    message = "Invalid token"
  } else if (err.name === "TokenExpiredError") {
    statusCode = 401
    message = "Token expired"
  } else if (err.statusCode) {
    statusCode = err.statusCode
    message = err.message
  }

  // Send error response
  const errorResponse = {
    success: false,
    message,
    correlationId: req.correlationId,
    ...(details && { details }),
    ...(config.isDevelopment && { stack: err.stack }),
  }

  res.status(statusCode).json(errorResponse)
}

module.exports = errorHandler
