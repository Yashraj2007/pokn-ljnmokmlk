/**
 * Application model - represents candidate applications to internships
 */

const mongoose = require("mongoose")

const applicationSchema = new mongoose.Schema(
  {
    // References
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Candidate",
      required: true,
      index: true,
    },
    internshipId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Internship",
      required: true,
      index: true,
    },

    // Application Status
    status: {
      type: String,
      enum: [
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
      ],
      default: "applied",
      index: true,
    },

    // ML Predictions
    dropoutProbAtApply: {
      type: Number,
      min: 0,
      max: 1,
      required: true,
    },
    matchScore: {
      type: Number,
      min: 0,
      max: 100,
      required: true,
    },

    // Application Details
    source: {
      type: String,
      enum: ["web", "mobile", "sms", "ussd", "referral"],
      default: "web",
    },

    // Communication
    notes: {
      type: String,
      trim: true,
    },
    feedback: {
      rating: {
        type: Number,
        min: 1,
        max: 5,
      },
      comment: {
        type: String,
        trim: true,
      },
      wouldRecommend: {
        type: Boolean,
      },
    },

    // Event History
    eventHistory: [
      {
        status: {
          type: String,
          required: true,
        },
        at: {
          type: Date,
          default: Date.now,
        },
        by: {
          type: String, // user ID or system
          default: "system",
        },
        notes: {
          type: String,
          trim: true,
        },
        metadata: {
          type: mongoose.Schema.Types.Mixed,
        },
      },
    ],

    // Dates
    appliedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    reviewedAt: {
      type: Date,
    },
    interviewDate: {
      type: Date,
    },
    offerDate: {
      type: Date,
    },
    joinDate: {
      type: Date,
    },
    completionDate: {
      type: Date,
    },

    // Additional Information
    coverLetter: {
      type: String,
      trim: true,
    },
    resume: {
      url: {
        type: String,
        trim: true,
      },
      filename: {
        type: String,
        trim: true,
      },
    },

    // Metadata
    metadata: {
      userAgent: {
        type: String,
        trim: true,
      },
      ipAddress: {
        type: String,
        trim: true,
      },
      referrer: {
        type: String,
        trim: true,
      },
      correlationId: {
        type: String,
        trim: true,
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

// Compound indexes
applicationSchema.index({ candidateId: 1, internshipId: 1 }, { unique: true })
applicationSchema.index({ candidateId: 1, status: 1 })
applicationSchema.index({ internshipId: 1, status: 1 })
applicationSchema.index({ appliedAt: -1 })
applicationSchema.index({ status: 1, appliedAt: -1 })

// Virtual for duration in current status
applicationSchema.virtual("statusDuration").get(function () {
  const lastEvent = this.eventHistory[this.eventHistory.length - 1]
  if (!lastEvent) return 0

  const now = new Date()
  const diffTime = now - lastEvent.at
  return Math.floor(diffTime / (1000 * 60 * 60 * 24)) // days
})

// Virtual for total application duration
applicationSchema.virtual("totalDuration").get(function () {
  if (!this.completionDate && !this.updatedAt) return 0

  const endDate = this.completionDate || this.updatedAt
  const diffTime = endDate - this.appliedAt
  return Math.floor(diffTime / (1000 * 60 * 60 * 24)) // days
})

// Pre-save middleware to add event history
applicationSchema.pre("save", function (next) {
  if (this.isModified("status")) {
    this.eventHistory.push({
      status: this.status,
      at: new Date(),
      by: this.metadata?.userId || "system",
    })

    // Update relevant dates
    switch (this.status) {
      case "under_review":
        this.reviewedAt = new Date()
        break
      case "offered":
        this.offerDate = new Date()
        break
      case "joined":
        this.joinDate = new Date()
        break
      case "completed":
        this.completionDate = new Date()
        break
    }
  }
  next()
})

// Static methods
applicationSchema.statics.findByCandidate = function (candidateId, status = null) {
  const query = { candidateId }
  if (status) query.status = status
  return this.find(query).populate("internshipId")
}

applicationSchema.statics.findByInternship = function (internshipId, status = null) {
  const query = { internshipId }
  if (status) query.status = status
  return this.find(query).populate("candidateId")
}

applicationSchema.statics.getApplicationStats = function (dateRange = {}) {
  const matchStage = {}
  if (dateRange.from) matchStage.appliedAt = { $gte: new Date(dateRange.from) }
  if (dateRange.to) {
    matchStage.appliedAt = { ...matchStage.appliedAt, $lte: new Date(dateRange.to) }
  }

  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
        avgMatchScore: { $avg: "$matchScore" },
        avgDropoutProb: { $avg: "$dropoutProbAtApply" },
      },
    },
  ])
}

// Instance methods
applicationSchema.methods.updateStatus = function (newStatus, notes = "", userId = "system") {
  this.status = newStatus
  this.metadata = { ...this.metadata, userId }

  if (notes) {
    this.notes = notes
  }

  return this.save()
}

applicationSchema.methods.addFeedback = function (rating, comment, wouldRecommend) {
  this.feedback = {
    rating,
    comment,
    wouldRecommend,
  }
  return this.save()
}

applicationSchema.methods.isSuccessful = function () {
  return ["joined", "completed"].includes(this.status)
}

applicationSchema.methods.isDroppedOut = function () {
  return ["withdrawn", "no_show", "dropped_out"].includes(this.status)
}

module.exports = mongoose.model("Application", applicationSchema)
