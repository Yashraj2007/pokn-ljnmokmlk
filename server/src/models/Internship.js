/**
 * Internship model - represents available internship opportunities
 */

const mongoose = require("mongoose")

const internshipSchema = new mongoose.Schema(
  {
    // Basic Information
    title: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    companyName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    companyLogoUrl: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },

    // Location (GeoJSON Point)
    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
        validate: {
          validator: (coords) => {
            return (
              coords.length === 2 &&
              coords[0] >= -180 &&
              coords[0] <= 180 && // longitude
              coords[1] >= -90 &&
              coords[1] <= 90
            ) // latitude
          },
          message: "Invalid coordinates",
        },
      },
      district: {
        type: String,
        required: true,
        trim: true,
      },
      state: {
        type: String,
        required: true,
        trim: true,
      },
      address: {
        type: String,
        trim: true,
      },
      pincode: {
        type: String,
        trim: true,
      },
    },

    // Compensation & Duration
    stipend: {
      type: Number,
      required: true,
      min: 0,
    },
    durationMonths: {
      type: Number,
      required: true,
      min: 1,
      max: 24,
    },

    // Requirements
    requiredSkills: [
      {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
      },
    ],

    // Classification
    sector: {
      type: String,
      required: true,
      trim: true,
      enum: [
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
      ],
    },

    // Flags
    flags: {
      remote: {
        type: Boolean,
        default: false,
      },
      beginner: {
        type: Boolean,
        default: false,
      },
      partTime: {
        type: Boolean,
        default: false,
      },
      urgent: {
        type: Boolean,
        default: false,
      },
      verified: {
        type: Boolean,
        default: false,
      },
    },

    // Dates
    postedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    startDate: {
      type: Date,
    },

    // Contact Information
    extra: {
      contactEmail: {
        type: String,
        trim: true,
        lowercase: true,
      },
      contactPhone: {
        type: String,
        trim: true,
      },
      applicationUrl: {
        type: String,
        trim: true,
      },
      requirements: [
        {
          type: String,
          trim: true,
        },
      ],
      benefits: [
        {
          type: String,
          trim: true,
        },
      ],
      workingHours: {
        type: String,
        trim: true,
      },
    },

    // Status
    status: {
      type: String,
      enum: ["active", "paused", "closed", "expired"],
      default: "active",
      index: true,
    },

    // Analytics
    analytics: {
      totalApplications: {
        type: Number,
        default: 0,
      },
      totalViews: {
        type: Number,
        default: 0,
      },
      successfulHires: {
        type: Number,
        default: 0,
      },
      averageMatchScore: {
        type: Number,
        min: 0,
        max: 100,
      },
      completionRate: {
        type: Number,
        min: 0,
        max: 100,
        default: 75, // Default completion rate
      },
    },

    // Company Information
    company: {
      size: {
        type: String,
        enum: ["startup", "small", "medium", "large", "enterprise"],
      },
      industry: {
        type: String,
        trim: true,
      },
      website: {
        type: String,
        trim: true,
      },
      rating: {
        type: Number,
        min: 1,
        max: 5,
      },
      reliability: {
        type: Number,
        min: 0,
        max: 100,
        default: 80,
      },
    },

    // Metadata
    metadata: {
      source: {
        type: String,
        enum: ["manual", "api", "scraper", "partner"],
        default: "manual",
      },
      createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      tags: [
        {
          type: String,
          trim: true,
        },
      ],
      priority: {
        type: Number,
        min: 1,
        max: 10,
        default: 5,
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

// Indexes
internshipSchema.index({ location: "2dsphere" }) // Geospatial index
internshipSchema.index({ requiredSkills: 1 })
internshipSchema.index({ sector: 1 })
internshipSchema.index({ stipend: 1 })
internshipSchema.index({ durationMonths: 1 })
internshipSchema.index({ "flags.remote": 1 })
internshipSchema.index({ "flags.beginner": 1 })
internshipSchema.index({ status: 1, expiresAt: 1 })
internshipSchema.index({ createdAt: -1 })

// Virtual for expired status
internshipSchema.virtual("isExpired").get(function () {
  return this.expiresAt < new Date()
})

// Virtual for days remaining
internshipSchema.virtual("daysRemaining").get(function () {
  const now = new Date()
  const diffTime = this.expiresAt - now
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
})

// Pre-save middleware to update status based on expiry
internshipSchema.pre("save", function (next) {
  if (this.expiresAt < new Date() && this.status === "active") {
    this.status = "expired"
  }
  next()
})

// Static methods
internshipSchema.statics.findActive = function () {
  return this.find({
    status: "active",
    expiresAt: { $gt: new Date() },
  })
}

internshipSchema.statics.findBySkills = function (skills) {
  return this.find({
    requiredSkills: { $in: skills },
    status: "active",
    expiresAt: { $gt: new Date() },
  })
}

internshipSchema.statics.findNearby = function (coordinates, maxDistance = 50000) {
  return this.find({
    location: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates,
        },
        $maxDistance: maxDistance, // meters
      },
    },
    status: "active",
    expiresAt: { $gt: new Date() },
  })
}

internshipSchema.statics.findByFilters = function (filters = {}) {
  const query = {
    status: "active",
    expiresAt: { $gt: new Date() },
  }

  if (filters.sector) query.sector = filters.sector
  if (filters.remote !== undefined) query["flags.remote"] = filters.remote
  if (filters.beginner !== undefined) query["flags.beginner"] = filters.beginner
  if (filters.minStipend) query.stipend = { $gte: filters.minStipend }
  if (filters.maxStipend) query.stipend = { ...query.stipend, $lte: filters.maxStipend }
  if (filters.maxDuration) query.durationMonths = { $lte: filters.maxDuration }
  if (filters.skills && filters.skills.length > 0) {
    query.requiredSkills = { $in: filters.skills }
  }

  return this.find(query)
}

// Instance methods
internshipSchema.methods.incrementViews = function () {
  this.analytics.totalViews += 1
  return this.save()
}

internshipSchema.methods.incrementApplications = function () {
  this.analytics.totalApplications += 1
  return this.save()
}

internshipSchema.methods.isEligibleFor = function (candidate) {
  // Basic eligibility checks
  if (this.isExpired || this.status !== "active") return false

  // Check if candidate has any required skills
  const candidateSkills = candidate.skills.map((s) => s.canonical)
  const hasRequiredSkills = this.requiredSkills.some((skill) => candidateSkills.includes(skill))

  return hasRequiredSkills
}

module.exports = mongoose.model("Internship", internshipSchema)
