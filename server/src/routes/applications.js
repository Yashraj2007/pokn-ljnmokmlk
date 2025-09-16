/**
 * Applications routes
 * Handles internship applications
 */

const express = require("express")
const { z } = require("zod")
const Application = require("../models/Application")
const Candidate = require("../models/Candidate")
const Internship = require("../models/Internship")
const EventLog = require("../models/EventLog")
const { authMiddleware, optionalAuth } = require("../middlewares/authMiddleware")
const { logger } = require("../logger/logger")

const router = express.Router()

// Validation schemas
const applicationSchema = z.object({
  candidateId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid candidate ID"),
  internshipId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid internship ID"),
  source: z.enum(["web", "mobile", "sms", "ussd", "referral"]).optional(),
  coverLetter: z.string().max(1000).optional(),
})

const feedbackSchema = z.object({
  candidateId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid candidate ID"),
  internshipId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid internship ID"),
  rating: z.number().int().min(1).max(5).optional(),
  joined: z.boolean(),
  reason: z.string().max(500).optional(),
  notes: z.string().max(1000).optional(),
})

/**
 * POST /api/applications
 * Create new application
 */
router.post("/", optionalAuth, async (req, res) => {
  try {
    // Validate request body
    const validatedData = applicationSchema.parse(req.body)
    const { candidateId, internshipId, source = "web", coverLetter } = validatedData

    // Check if candidate exists
    const candidate = await Candidate.findById(candidateId)
    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found",
        correlationId: req.correlationId,
      })
    }

    // Check if internship exists and is active
    const internship = await Internship.findById(internshipId)
    if (!internship) {
      return res.status(404).json({
        success: false,
        message: "Internship not found",
        correlationId: req.correlationId,
      })
    }

    if (internship.status !== "active" || internship.isExpired) {
      return res.status(400).json({
        success: false,
        message: "Internship is not available for applications",
        correlationId: req.correlationId,
      })
    }

    // Check if application already exists
    const existingApplication = await Application.findOne({
      candidateId,
      internshipId,
    })

    if (existingApplication) {
      return res.status(409).json({
        success: false,
        message: "Application already exists",
        data: {
          applicationId: existingApplication._id,
          status: existingApplication.status,
        },
        correlationId: req.correlationId,
      })
    }

    // Calculate match score (basic implementation - will be enhanced with ML)
    const matchScore = calculateBasicMatchScore(candidate, internship)

    // Calculate dropout probability (basic implementation - will be enhanced with ML)
    const dropoutProb = calculateBasicDropoutProbability(candidate, internship)

    // Create new application
    const newApplication = new Application({
      candidateId,
      internshipId,
      source,
      coverLetter,
      matchScore,
      dropoutProbAtApply: dropoutProb,
      metadata: {
        userAgent: req.headers["user-agent"],
        ipAddress: req.ip,
        correlationId: req.correlationId,
      },
    })

    await newApplication.save()

    // Update analytics
    await Promise.all([
      candidate.updateOne({ $inc: { "analytics.totalApplications": 1 } }),
      internship.incrementApplications(),
    ])

    // Log event for ML training
    await EventLog.logEvent(
      "application",
      {
        applicationId: newApplication._id,
        candidateId,
        internshipId,
        matchScore,
        dropoutProb,
        source,
      },
      {
        correlationId: req.correlationId,
        candidateId,
        internshipId,
        applicationId: newApplication._id,
      },
    )

    logger.info("New application created", {
      applicationId: newApplication._id,
      candidateId,
      internshipId,
      matchScore,
      dropoutProb,
    })

    res.status(201).json({
      success: true,
      data: {
        applicationId: newApplication._id,
        status: newApplication.status,
        matchScore,
        dropoutProb,
        appliedAt: newApplication.appliedAt,
      },
      correlationId: req.correlationId,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.errors,
        correlationId: req.correlationId,
      })
    }

    logger.error("Create application error", error)
    res.status(500).json({
      success: false,
      message: "Failed to create application",
      correlationId: req.correlationId,
    })
  }
})

/**
 * GET /api/applications/:candidateId
 * Get applications for a candidate
 */
router.get("/:candidateId", optionalAuth, async (req, res) => {
  try {
    const { candidateId } = req.params
    const { status, page = 1, limit = 20 } = req.query

    // Build query
    const query = { candidateId }
    if (status) query.status = status

    // Execute query with pagination
    const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit)
    const applications = await Application.find(query)
      .populate("internshipId", "title companyName location stipend durationMonths sector flags")
      .sort({ appliedAt: -1 })
      .skip(skip)
      .limit(Number.parseInt(limit))

    const total = await Application.countDocuments(query)

    res.json({
      success: true,
      data: {
        applications,
        pagination: {
          page: Number.parseInt(page),
          limit: Number.parseInt(limit),
          total,
          pages: Math.ceil(total / Number.parseInt(limit)),
        },
      },
      correlationId: req.correlationId,
    })
  } catch (error) {
    logger.error("Get candidate applications error", error)
    res.status(500).json({
      success: false,
      message: "Failed to get applications",
      correlationId: req.correlationId,
    })
  }
})

/**
 * PUT /api/applications/:id/status
 * Update application status
 */
router.put("/:id/status", authMiddleware({ required: true }), async (req, res) => {
  try {
    const { id } = req.params
    const { status, notes } = req.body

    const validStatuses = [
      "applied",
      "under_review",
      "shortlisted",
      "interview_scheduled",
      "interviewed",
      "offered",
      "accepted",
      "joined",
      "completed",
      "withdrawn",
      "rejected",
      "no_show",
      "dropped_out",
    ]

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
        validStatuses,
        correlationId: req.correlationId,
      })
    }

    const application = await Application.findById(id)
    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
        correlationId: req.correlationId,
      })
    }

    const oldStatus = application.status
    await application.updateStatus(status, notes, req.user.id)

    // Log event for ML training
    await EventLog.logEvent(
      "application_status_change",
      {
        applicationId: application._id,
        oldStatus,
        newStatus: status,
        notes,
        changedBy: req.user.id,
      },
      {
        correlationId: req.correlationId,
        candidateId: application.candidateId,
        internshipId: application.internshipId,
        applicationId: application._id,
      },
    )

    logger.info("Application status updated", {
      applicationId: application._id,
      oldStatus,
      newStatus: status,
      updatedBy: req.user.id,
    })

    res.json({
      success: true,
      data: application,
      correlationId: req.correlationId,
    })
  } catch (error) {
    logger.error("Update application status error", error)
    res.status(500).json({
      success: false,
      message: "Failed to update application status",
      correlationId: req.correlationId,
    })
  }
})

/**
 * POST /api/applications/feedback
 * Submit feedback for an application
 */
router.post("/feedback", optionalAuth, async (req, res) => {
  try {
    // Validate request body
    const validatedData = feedbackSchema.parse(req.body)
    const { candidateId, internshipId, rating, joined, reason, notes } = validatedData

    // Find the application
    const application = await Application.findOne({
      candidateId,
      internshipId,
    })

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
        correlationId: req.correlationId,
      })
    }

    // Add feedback to application
    if (rating) {
      await application.addFeedback(rating, notes, joined)
    }

    // Update application status based on feedback
    if (joined) {
      await application.updateStatus("joined", "Candidate joined based on feedback")
    } else if (application.status === "offered") {
      await application.updateStatus("withdrawn", reason || "Candidate declined offer")
    }

    // Log event for ML training
    await EventLog.logEvent(
      "feedback",
      {
        candidateId,
        internshipId,
        applicationId: application._id,
        rating,
        joined,
        reason,
        notes,
      },
      {
        correlationId: req.correlationId,
        candidateId,
        internshipId,
        applicationId: application._id,
      },
    )

    logger.info("Feedback submitted", {
      applicationId: application._id,
      candidateId,
      internshipId,
      joined,
      rating,
    })

    res.json({
      success: true,
      message: "Feedback submitted successfully",
      data: {
        applicationId: application._id,
        status: application.status,
      },
      correlationId: req.correlationId,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.errors,
        correlationId: req.correlationId,
      })
    }

    logger.error("Submit feedback error", error)
    res.status(500).json({
      success: false,
      message: "Failed to submit feedback",
      correlationId: req.correlationId,
    })
  }
})

/**
 * GET /api/applications/internship/:internshipId
 * Get applications for an internship (admin only)
 */
router.get("/internship/:internshipId", authMiddleware({ required: true, roles: ["admin"] }), async (req, res) => {
  try {
    const { internshipId } = req.params
    const { status, page = 1, limit = 20 } = req.query

    // Build query
    const query = { internshipId }
    if (status) query.status = status

    // Execute query with pagination
    const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit)
    const applications = await Application.find(query)
      .populate("candidateId", "name education skills location preferences")
      .sort({ appliedAt: -1 })
      .skip(skip)
      .limit(Number.parseInt(limit))

    const total = await Application.countDocuments(query)

    res.json({
      success: true,
      data: {
        applications,
        pagination: {
          page: Number.parseInt(page),
          limit: Number.parseInt(limit),
          total,
          pages: Math.ceil(total / Number.parseInt(limit)),
        },
      },
      correlationId: req.correlationId,
    })
  } catch (error) {
    logger.error("Get internship applications error", error)
    res.status(500).json({
      success: false,
      message: "Failed to get applications",
      correlationId: req.correlationId,
    })
  }
})

// Helper functions
function calculateBasicMatchScore(candidate, internship) {
  let score = 0
  const weights = {
    skills: 0.6,
    location: 0.2,
    education: 0.1,
    preferences: 0.1,
  }

  // Skill matching
  const candidateSkills = candidate.skills.map((s) => s.canonical)
  const matchingSkills = internship.requiredSkills.filter((skill) => candidateSkills.includes(skill))
  const skillScore = (matchingSkills.length / internship.requiredSkills.length) * 100
  score += skillScore * weights.skills

  // Location matching (simplified)
  if (candidate.location.district === internship.location.district) {
    score += 100 * weights.location
  } else if (candidate.location.state === internship.location.state) {
    score += 70 * weights.location
  } else {
    score += 30 * weights.location
  }

  // Education level matching
  const educationLevels = ["10th", "12th", "Diploma", "UG", "PG", "PhD"]
  const candidateLevel = educationLevels.indexOf(candidate.education.level)
  const educationScore = candidateLevel >= 2 ? 100 : 70 // Diploma+ gets full score
  score += educationScore * weights.education

  // Preferences matching
  let prefScore = 50 // Base score
  if (candidate.preferences.minStipend && internship.stipend >= candidate.preferences.minStipend) {
    prefScore += 25
  }
  if (candidate.preferences.workType === "remote" && internship.flags.remote) {
    prefScore += 25
  }
  score += prefScore * weights.preferences

  return Math.min(Math.round(score), 100)
}

function calculateBasicDropoutProbability(candidate, internship) {
  let prob = 0.1 // Base probability

  // Distance factor
  if (candidate.location.district !== internship.location.district) {
    prob += 0.15
  }
  if (candidate.location.state !== internship.location.state) {
    prob += 0.1
  }

  // Stipend factor
  if (candidate.preferences.minStipend && internship.stipend < candidate.preferences.minStipend) {
    prob += 0.2
  }

  // Experience factor
  const educationLevels = ["10th", "12th", "Diploma", "UG", "PG", "PhD"]
  const candidateLevel = educationLevels.indexOf(candidate.education.level)
  if (candidateLevel < 2 && !internship.flags.beginner) {
    prob += 0.15
  }

  // Remote preference mismatch
  if (candidate.preferences.workType === "remote" && !internship.flags.remote) {
    prob += 0.1
  }

  return Math.min(prob, 0.9)
}

module.exports = router
