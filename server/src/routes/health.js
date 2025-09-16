/**
 * Health check routes
 * Provides system health and status information
 */

const express = require("express")
const mongoose = require("mongoose")
const { logger } = require("../logger/logger")

const router = express.Router()

/**
 * GET /api/health
 * Basic health check endpoint
 */
router.get("/", async (req, res) => {
  try {
    const startTime = process.hrtime()

    // Check database connection
    let dbStatus = "ok"
    try {
      await mongoose.connection.db.admin().ping()
    } catch (error) {
      dbStatus = "error"
      logger.error("Database health check failed", error)
    }

    const [seconds, nanoseconds] = process.hrtime(startTime)
    const responseTime = seconds * 1000 + nanoseconds / 1000000 // Convert to milliseconds

    const healthData = {
      status: dbStatus === "ok" ? "ok" : "degraded",
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      responseTime: `${responseTime.toFixed(2)}ms`,
      database: {
        mongodb: dbStatus,
        connectionState: mongoose.connection.readyState,
      },
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        external: Math.round(process.memoryUsage().external / 1024 / 1024),
      },
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        pid: process.pid,
      },
      environment: process.env.NODE_ENV,
    }

    const statusCode = healthData.status === "ok" ? 200 : 503
    res.status(statusCode).json(healthData)
  } catch (error) {
    logger.error("Health check error", error)
    res.status(500).json({
      status: "error",
      message: "Health check failed",
      timestamp: new Date().toISOString(),
    })
  }
})

/**
 * GET /api/health/detailed
 * Detailed health check with additional metrics
 */
router.get("/detailed", async (req, res) => {
  try {
    const startTime = process.hrtime()

    // Database checks
    const dbChecks = {
      mongodb: { status: "ok", responseTime: 0 },
    }

    try {
      const dbStart = process.hrtime()
      await mongoose.connection.db.admin().ping()
      const [dbSeconds, dbNanoseconds] = process.hrtime(dbStart)
      dbChecks.mongodb.responseTime = dbSeconds * 1000 + dbNanoseconds / 1000000
    } catch (error) {
      dbChecks.mongodb.status = "error"
      dbChecks.mongodb.error = error.message
    }

    // Collection counts
    const collections = {}
    try {
      const candidatesCount = await mongoose.connection.db.collection("candidates").countDocuments()
      const internshipsCount = await mongoose.connection.db.collection("internships").countDocuments()
      const applicationsCount = await mongoose.connection.db.collection("applications").countDocuments()
      const eventLogsCount = await mongoose.connection.db.collection("eventlogs").countDocuments()

      collections.candidates = candidatesCount
      collections.internships = internshipsCount
      collections.applications = applicationsCount
      collections.eventlogs = eventLogsCount
    } catch (error) {
      collections.error = error.message
    }

    const [seconds, nanoseconds] = process.hrtime(startTime)
    const totalResponseTime = seconds * 1000 + nanoseconds / 1000000

    const detailedHealth = {
      status: dbChecks.mongodb.status === "ok" ? "ok" : "degraded",
      timestamp: new Date().toISOString(),
      responseTime: `${totalResponseTime.toFixed(2)}ms`,
      uptime: Math.floor(process.uptime()),
      checks: dbChecks,
      collections,
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        pid: process.pid,
        loadavg: process.platform !== "win32" ? process.loadavg() : null,
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        port: process.env.PORT,
        mongoUri: process.env.MONGO_URI ? "configured" : "not configured",
      },
    }

    const statusCode = detailedHealth.status === "ok" ? 200 : 503
    res.status(statusCode).json(detailedHealth)
  } catch (error) {
    logger.error("Detailed health check error", error)
    res.status(500).json({
      status: "error",
      message: "Detailed health check failed",
      timestamp: new Date().toISOString(),
    })
  }
})

module.exports = router
