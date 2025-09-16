/**
 * Candidate model - represents job seekers/students
 * Updated to include userId field for authentication linking
 */

const mongoose = require("mongoose")

const candidateSchema = new mongoose.Schema(
  {
    // Authentication - ADDED userId field
    clerkId: {
      type: String,
      sparse: true,
      index: true,
    },

    // NEW: Link to User model from authentication system
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      sparse: true,
      index: true,
    },

    // Personal Information
    mobile: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    language: {
      type: String,
      enum: ["en", "hi", "mr"],
      default: "en",
    },

    // Education
    education: {
      level: {
        type: String,
        enum: ["10th", "12th", "Diploma", "UG", "PG", "PhD"],
        required: true,
      },
      field: {
        type: String,
        required: true,
        trim: true,
      },
      year: {
        type: Number,
        required: true,
        min: 1990,
        max: new Date().getFullYear() + 5,
      },
      verified: {
        type: Boolean,
        default: false,
      },
      institution: {
        type: String,
        trim: true,
      },
      percentage: {
        type: Number,
        min: 0,
        max: 100,
      },
    },

    // Skills
    skills: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
        },
        canonical: {
          type: String,
          required: true,
          trim: true,
          lowercase: true,
        },
        confidence: {
          type: Number,
          min: 0,
          max: 1,
          default: 1,
        },
        source: {
          type: String,
          enum: ["user", "inferred", "verified"],
          default: "user",
        },
      },
    ],

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
      pincode: {
        type: String,
        trim: true,
      },
    },

    // Preferences
    preferences: {
      distancePref: {
        type: String,
        enum: ["local", "state", "any"],
        default: "local",
      },
      workType: {
        type: String,
        enum: ["onsite", "remote", "either"],
        default: "either",
      },
      minStipend: {
        type: Number,
        min: 0,
      },
      sectors: [
        {
          type: String,
          trim: true,
        },
      ],
      startDate: {
        type: Date,
      },
      duration: {
        min: Number, // months
        max: Number, // months
      },
    },

    // Profile Status
    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
    },

    // Metadata
    metadata: {
      deviceInfo: {
        type: String,
        trim: true,
      },
      anonId: {
        type: String,
        trim: true,
      },
      source: {
        type: String,
        enum: ["web", "mobile", "sms", "ussd"],
        default: "web",
      },
      lastActive: {
        type: Date,
        default: Date.now,
      },
      profileCompleteness: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },
    },

    // Analytics
    analytics: {
      totalApplications: {
        type: Number,
        default: 0,
      },
      successfulApplications: {
        type: Number,
        default: 0,
      },
      averageMatchScore: {
        type: Number,
        min: 0,
        max: 100,
      },
      lastRecommendationAt: {
        type: Date,
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
candidateSchema.index({ location: "2dsphere" }) // Geospatial index
candidateSchema.index({ "skills.canonical": 1 })
candidateSchema.index({ createdAt: -1 })
candidateSchema.index({ "metadata.lastActive": -1 })
candidateSchema.index({ status: 1 })
candidateSchema.index({ userId: 1 }) // NEW: Index for userId lookups

// Virtual for masked mobile
candidateSchema.virtual("maskedMobile").get(function () {
  if (!this.mobile) return null
  return this.mobile.replace(/(\+\d{1,3})\d+(\d{2})/, "$1****$2")
})

// Pre-save middleware to calculate profile completeness
candidateSchema.pre("save", function (next) {
  let completeness = 0
  const fields = [
    "name",
    "mobile",
    "education.level",
    "education.field",
    "education.year",
    "location.district",
    "location.state",
    "skills",
    "preferences.distancePref",
  ]

  fields.forEach((field) => {
    const value = field.split(".").reduce((obj, key) => obj?.[key], this)
    if (value && (Array.isArray(value) ? value.length > 0 : true)) {
      completeness += 100 / fields.length
    }
  })

  this.metadata.profileCompleteness = Math.round(completeness)
  next()
})

// Static methods
candidateSchema.statics.findByMobile = function (mobile) {
  return this.findOne({ mobile })
}

// NEW: Static method to find by userId
candidateSchema.statics.findByUserId = function (userId) {
  return this.findOne({ userId })
}

candidateSchema.statics.findNearby = function (coordinates, maxDistance = 50000) {
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
  })
}

// Instance methods
candidateSchema.methods.updateLastActive = function () {
  this.metadata.lastActive = new Date()
  return this.save()
}

candidateSchema.methods.addSkill = function (skillName, canonical, confidence = 1) {
  const existingSkill = this.skills.find((s) => s.canonical === canonical)
  if (!existingSkill) {
    this.skills.push({ name: skillName, canonical, confidence })
  }
  return this.save()
}

module.exports = mongoose.model("Candidate", candidateSchema)
