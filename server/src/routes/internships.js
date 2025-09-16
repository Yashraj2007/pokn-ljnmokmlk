/**
 * Internships routes
 * Handles internship listing and management
 */

const express = require("express")
const { z } = require("zod")
const Internship = require("../models/Internship")
const { authMiddleware, adminAuth, optionalAuth } = require("../middlewares/authMiddleware")
const { logger } = require("../logger/logger")

const router = express.Router()

// Validation schemas
const internshipSchema = z.object({
  title: z.string().min(5).max(200),
  companyName: z.string().min(2).max(100),
  companyLogoUrl: z.string().url().optional(),
  description: z.string().min(50).max(2000),
  location: z.object({
    district: z.string().min(2).max(100),
    state: z.string().min(2).max(100),
    lat: z.number().min(-90).max(90),
    lon: z.number().min(-180).max(180),
    address: z.string().max(300).optional(),
    pincode: z.string().optional(),
  }),
  stipend: z.number().min(0),
  durationMonths: z.number().int().min(1).max(24),
  requiredSkills: z.array(z.string().min(1).max(50)).min(1),
  sector: z.enum([
    "Technology",
    "Finance",
    "Healthcare",
    "Education",
    "Marketing",
    "Sales",
    "Operations",
    "HR",
    "Design",
    "Content",
    "Research",
    "Manufacturing",
    "Retail",
    "Consulting",
    "Non-Profit",
    "Government",
  ]),
  flags: z
    .object({
      remote: z.boolean().optional(),
      beginner: z.boolean().optional(),
      partTime: z.boolean().optional(),
      urgent: z.boolean().optional(),
      verified: z.boolean().optional(),
    })
    .optional(),
  expiresAt: z.string().datetime(),
  startDate: z.string().datetime().optional(),
  extra: z
    .object({
      contactEmail: z.string().email().optional(),
      contactPhone: z.string().optional(),
      applicationUrl: z.string().url().optional(),
      requirements: z.array(z.string()).optional(),
      benefits: z.array(z.string()).optional(),
      workingHours: z.string().optional(),
    })
    .optional(),
  company: z
    .object({
      size: z.enum(["startup", "small", "medium", "large", "enterprise"]).optional(),
      industry: z.string().optional(),
      website: z.string().url().optional(),
      rating: z.number().min(1).max(5).optional(),
      reliability: z.number().min(0).max(100).optional(),
    })
    .optional(),
})

/**
 * GET /api/internships
 * List internships with filtering and search
 */
router.get("/", optionalAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      q, // search query
      district,
      state,
      sector,
      remote,
      beginner,
      minStipend,
      maxStipend,
      maxDuration,
      skills,
      lat,
      lon,
      radius = 50, // km
    } = req.query

    // Build query
    const query = {
      status: "active",
      expiresAt: { $gt: new Date() },
    }

    // Text search
    if (q) {
      query.$or = [
        { title: { $regex: q, $options: "i" } },
        { companyName: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
        { requiredSkills: { $in: [new RegExp(q, "i")] } },
      ]
    }

    // Location filters
    if (district) query["location.district"] = district
    if (state) query["location.state"] = state

    // Geospatial search
    if (lat && lon) {
      const radiusInMeters = Number.parseFloat(radius) * 1000
      query.location = {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [Number.parseFloat(lon), Number.parseFloat(lat)],
          },
          $maxDistance: radiusInMeters,
        },
      }
    }

    // Other filters
    if (sector) query.sector = sector
    if (remote !== undefined) query["flags.remote"] = remote === "true"
    if (beginner !== undefined) query["flags.beginner"] = beginner === "true"
    if (minStipend) query.stipend = { $gte: Number.parseInt(minStipend) }
    if (maxStipend) query.stipend = { ...query.stipend, $lte: Number.parseInt(maxStipend) }
    if (maxDuration) query.durationMonths = { $lte: Number.parseInt(maxDuration) }
    if (skills) {
      const skillsArray = skills.split(",").map((s) => s.trim().toLowerCase())
      query.requiredSkills = { $in: skillsArray }
    }

    // Execute query with pagination
    const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit)
    const internships = await Internship.find(query)
      .sort({ "flags.urgent": -1, postedAt: -1 })
      .skip(skip)
      .limit(Number.parseInt(limit))

    const total = await Internship.countDocuments(query)

    // Increment view counts
    const internshipIds = internships.map((i) => i._id)
    await Internship.updateMany({ _id: { $in: internshipIds } }, { $inc: { "analytics.totalViews": 1 } })

    res.json({
      success: true,
      data: {
        internships,
        pagination: {
          page: Number.parseInt(page),
          limit: Number.parseInt(limit),
          total,
          pages: Math.ceil(total / Number.parseInt(limit)),
        },
        filters: {
          q,
          district,
          state,
          sector,
          remote,
          beginner,
          minStipend,
          maxStipend,
          maxDuration,
          skills,
        },
      },
      correlationId: req.correlationId,
    })
  } catch (error) {
    logger.error("List internships error", error)
    res.status(500).json({
      success: false,
      message: "Failed to list internships",
      correlationId: req.correlationId,
    })
  }
})

/**
 * GET /api/internships/:id
 * Get internship details by ID
 */
router.get("/:id", optionalAuth, async (req, res) => {
  try {
    const { id } = req.params

    const internship = await Internship.findById(id)
    if (!internship) {
      return res.status(404).json({
        success: false,
        message: "Internship not found",
        correlationId: req.correlationId,
      })
    }

    // Increment view count
    await internship.incrementViews()

    res.json({
      success: true,
      data: internship,
      correlationId: req.correlationId,
    })
  } catch (error) {
    logger.error("Get internship error", error)
    res.status(500).json({
      success: false,
      message: "Failed to get internship",
      correlationId: req.correlationId,
    })
  }
})

/**
 * POST /api/internships
 * Create new internship (admin only)
 */
router.post("/", adminAuth, async (req, res) => {
  try {
    // Validate request body
    const validatedData = internshipSchema.parse(req.body)

    // Create new internship
    const newInternship = new Internship({
      ...validatedData,
      location: {
        type: "Point",
        coordinates: [validatedData.location.lon, validatedData.location.lat],
        district: validatedData.location.district,
        state: validatedData.location.state,
        address: validatedData.location.address,
        pincode: validatedData.location.pincode,
      },
      expiresAt: new Date(validatedData.expiresAt),
      startDate: validatedData.startDate ? new Date(validatedData.startDate) : undefined,
      metadata: {
        source: "manual",
        createdBy: req.user.id,
      },
    })

    await newInternship.save()

    logger.info("New internship created", {
      internshipId: newInternship._id,
      title: newInternship.title,
      company: newInternship.companyName,
      createdBy: req.user.id,
    })

    res.status(201).json({
      success: true,
      data: newInternship,
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

    logger.error("Create internship error", error)
    res.status(500).json({
      success: false,
      message: "Failed to create internship",
      correlationId: req.correlationId,
    })
  }
})

/**
 * PUT /api/internships/:id
 * Update internship (admin only)
 */
router.put("/:id", adminAuth, async (req, res) => {
  try {
    const { id } = req.params

    // Validate request body (partial update)
    const updateSchema = internshipSchema.partial()
    const validatedData = updateSchema.parse(req.body)

    const internship = await Internship.findById(id)
    if (!internship) {
      return res.status(404).json({
        success: false,
        message: "Internship not found",
        correlationId: req.correlationId,
      })
    }

    // Update internship data
    Object.assign(internship, {
      ...validatedData,
      ...(validatedData.location && {
        location: {
          type: "Point",
          coordinates: [validatedData.location.lon, validatedData.location.lat],
          district: validatedData.location.district,
          state: validatedData.location.state,
          address: validatedData.location.address,
          pincode: validatedData.location.pincode,
        },
      }),
      ...(validatedData.expiresAt && { expiresAt: new Date(validatedData.expiresAt) }),
      ...(validatedData.startDate && { startDate: new Date(validatedData.startDate) }),
      updatedAt: new Date(),
    })

    await internship.save()

    logger.info("Internship updated", {
      internshipId: internship._id,
      title: internship.title,
      updatedBy: req.user.id,
    })

    res.json({
      success: true,
      data: internship,
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

    logger.error("Update internship error", error)
    res.status(500).json({
      success: false,
      message: "Failed to update internship",
      correlationId: req.correlationId,
    })
  }
})

/**
 * DELETE /api/internships/:id
 * Delete internship (admin only)
 */
router.delete("/:id", adminAuth, async (req, res) => {
  try {
    const { id } = req.params

    const internship = await Internship.findById(id)
    if (!internship) {
      return res.status(404).json({
        success: false,
        message: "Internship not found",
        correlationId: req.correlationId,
      })
    }

    // Soft delete by updating status
    internship.status = "closed"
    await internship.save()

    logger.info("Internship deleted", {
      internshipId: internship._id,
      title: internship.title,
      deletedBy: req.user.id,
    })

    res.json({
      success: true,
      message: "Internship deleted successfully",
      correlationId: req.correlationId,
    })
  } catch (error) {
    logger.error("Delete internship error", error)
    res.status(500).json({
      success: false,
      message: "Failed to delete internship",
      correlationId: req.correlationId,
    })
  }
})

/**
 * GET /api/internships/nearby/:lat/:lon
 * Find internships near coordinates
 */
router.get("/nearby/:lat/:lon", optionalAuth, async (req, res) => {
  try {
    const { lat, lon } = req.params
    const { radius = 50, limit = 20 } = req.query // radius in km

    const latitude = Number.parseFloat(lat)
    const longitude = Number.parseFloat(lon)
    const radiusInMeters = Number.parseFloat(radius) * 1000

    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({
        success: false,
        message: "Invalid coordinates",
        correlationId: req.correlationId,
      })
    }

    const internships = await Internship.find({
      status: "active",
      expiresAt: { $gt: new Date() },
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [longitude, latitude],
          },
          $maxDistance: radiusInMeters,
        },
      },
    }).limit(Number.parseInt(limit))

    res.json({
      success: true,
      data: {
        internships,
        center: { lat: latitude, lon: longitude },
        radius: Number.parseFloat(radius),
        count: internships.length,
      },
      correlationId: req.correlationId,
    })
  } catch (error) {
    logger.error("Find nearby internships error", error)
    res.status(500).json({
      success: false,
      message: "Failed to find nearby internships",
      correlationId: req.correlationId,
    })
  }
})

module.exports = router
