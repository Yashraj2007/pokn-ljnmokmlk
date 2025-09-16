/**
 * EventLog model - stores events for ML training and analytics
 */

const mongoose = require("mongoose")

const eventLogSchema = new mongoose.Schema(
  {
    // Event Type
    type: {
      type: String,
      required: true,
      enum: [
        "feedback",
        "application",
        "join",
        "dropout",
        "internship_posted",
        "candidate_registered",
        "recommendation_generated",
        "skill_normalized",
        "model_prediction",
        "system_event",
      ],
      index: true,
    },

    // Event Payload
    payload: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },

    // References
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Candidate",
      sparse: true,
      index: true,
    },
    internshipId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Internship",
      sparse: true,
      index: true,
    },
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
      sparse: true,
      index: true,
    },

    // Processing Status
    processed: {
      type: Boolean,
      default: false,
      index: true,
    },
    processedAt: {
      type: Date,
      sparse: true,
    },

    // Event Metadata
    metadata: {
      source: {
        type: String,
        enum: ["api", "webhook", "cron", "manual", "system"],
        default: "api",
      },
      correlationId: {
        type: String,
        trim: true,
        index: true,
      },
      userId: {
        type: String,
        trim: true,
      },
      ipAddress: {
        type: String,
        trim: true,
      },
      userAgent: {
        type: String,
        trim: true,
      },
      sessionId: {
        type: String,
        trim: true,
      },
    },

    // ML Training Labels
    labels: {
      successful: {
        type: Boolean,
        sparse: true,
      },
      dropoutRisk: {
        type: String,
        enum: ["low", "medium", "high"],
        sparse: true,
      },
      matchQuality: {
        type: String,
        enum: ["poor", "fair", "good", "excellent"],
        sparse: true,
      },
      outcome: {
        type: String,
        enum: ["positive", "negative", "neutral"],
        sparse: true,
      },
    },

    // Event Timing
    eventTime: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

// Indexes
eventLogSchema.index({ type: 1, eventTime: -1 })
eventLogSchema.index({ processed: 1, type: 1 })
eventLogSchema.index({ createdAt: -1 })
eventLogSchema.index({ "metadata.correlationId": 1 })

// TTL index for automatic cleanup (optional - keep events for 2 years)
eventLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 63072000 }) // 2 years

// Static methods
eventLogSchema.statics.logEvent = function (type, payload, options = {}) {
  const event = new this({
    type,
    payload,
    candidateId: options.candidateId,
    internshipId: options.internshipId,
    applicationId: options.applicationId,
    metadata: {
      source: options.source || "api",
      correlationId: options.correlationId,
      userId: options.userId,
      ipAddress: options.ipAddress,
      userAgent: options.userAgent,
      sessionId: options.sessionId,
    },
    eventTime: options.eventTime || new Date(),
  })

  return event.save()
}

eventLogSchema.statics.getUnprocessedEvents = function (type = null, limit = 1000) {
  const query = { processed: false }
  if (type) query.type = type

  return this.find(query).sort({ eventTime: 1 }).limit(limit)
}

eventLogSchema.statics.getTrainingData = function (options = {}) {
  const pipeline = [
    {
      $match: {
        type: { $in: ["application", "join", "dropout", "feedback"] },
        processed: true,
        ...(options.dateRange && {
          eventTime: {
            $gte: new Date(options.dateRange.from),
            $lte: new Date(options.dateRange.to),
          },
        }),
      },
    },
    {
      $lookup: {
        from: "candidates",
        localField: "candidateId",
        foreignField: "_id",
        as: "candidate",
      },
    },
    {
      $lookup: {
        from: "internships",
        localField: "internshipId",
        foreignField: "_id",
        as: "internship",
      },
    },
    {
      $lookup: {
        from: "applications",
        localField: "applicationId",
        foreignField: "_id",
        as: "application",
      },
    },
    {
      $match: {
        candidate: { $ne: [] },
        internship: { $ne: [] },
      },
    },
  ]

  if (options.limit) {
    pipeline.push({ $limit: options.limit })
  }

  return this.aggregate(pipeline)
}

eventLogSchema.statics.getEventStats = function (dateRange = {}) {
  const matchStage = {}
  if (dateRange.from) matchStage.eventTime = { $gte: new Date(dateRange.from) }
  if (dateRange.to) {
    matchStage.eventTime = { ...matchStage.eventTime, $lte: new Date(dateRange.to) }
  }

  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: {
          type: "$type",
          date: { $dateToString: { format: "%Y-%m-%d", date: "$eventTime" } },
        },
        count: { $sum: 1 },
      },
    },
    {
      $group: {
        _id: "$_id.type",
        totalCount: { $sum: "$count" },
        dailyStats: {
          $push: {
            date: "$_id.date",
            count: "$count",
          },
        },
      },
    },
  ])
}

// Instance methods
eventLogSchema.methods.markProcessed = function () {
  this.processed = true
  this.processedAt = new Date()
  return this.save()
}

eventLogSchema.methods.addLabel = function (labelType, labelValue) {
  this.labels = { ...this.labels, [labelType]: labelValue }
  return this.save()
}

module.exports = mongoose.model("EventLog", eventLogSchema)
