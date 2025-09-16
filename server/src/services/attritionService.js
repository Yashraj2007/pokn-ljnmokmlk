/**
 * Attrition Service
 * Handles dropout probability prediction and analysis
 */

const Application = require("../models/Application")
const Candidate = require("../models/Candidate")
const Internship = require("../models/Internship")
const EventLog = require("../models/EventLog")
const { logger } = require("../logger/logger")
const { calculateDistance } = require("./recommendService")

/**
 * Calculate basic dropout probability using rule-based approach
 */
function calculateBasicDropoutProbability(candidate, internship, application = null) {
  let prob = 0.1 // Base probability

  // Distance factor
  const candidateCoords = candidate.location.coordinates
  const internshipCoords = internship.location.coordinates
  const distance = calculateDistance(candidateCoords[1], candidateCoords[0], internshipCoords[1], internshipCoords[0])

  if (distance > 200) prob += 0.25
  else if (distance > 100) prob += 0.15
  else if (distance > 50) prob += 0.1

  // Stipend mismatch factor
  if (candidate.preferences.minStipend && internship.stipend < candidate.preferences.minStipend) {
    const stipendGap = (candidate.preferences.minStipend - internship.stipend) / candidate.preferences.minStipend
    prob += Math.min(stipendGap * 0.3, 0.2)
  }

  // Education level vs internship requirements
  const educationLevels = ["10th", "12th", "Diploma", "UG", "PG", "PhD"]
  const candidateLevel = educationLevels.indexOf(candidate.education.level)

  if (candidateLevel < 2 && !internship.flags.beginner) {
    prob += 0.15 // Underqualified for non-beginner roles
  }

  // Work type preference mismatch
  if (candidate.preferences.workType === "remote" && !internship.flags.remote) {
    prob += 0.1
  } else if (candidate.preferences.workType === "onsite" && internship.flags.remote) {
    prob += 0.05
  }

  // Company reliability factor
  if (internship.company && internship.company.reliability < 70) {
    prob += 0.1
  }

  // Duration mismatch
  if (candidate.preferences.duration && candidate.preferences.duration.max) {
    if (internship.durationMonths > candidate.preferences.duration.max) {
      prob += 0.05
    }
  }

  // Historical performance of candidate
  if (candidate.analytics.totalApplications > 0) {
    const successRate = candidate.analytics.successfulApplications / candidate.analytics.totalApplications
    if (successRate < 0.3) {
      prob += 0.1 // Low historical success rate
    }
  }

  // Sector mismatch
  if (candidate.preferences.sectors && candidate.preferences.sectors.length > 0) {
    if (!candidate.preferences.sectors.includes(internship.sector)) {
      prob += 0.05
    }
  }

  // Application timing (if application exists)
  if (application) {
    const daysSincePosted = (application.appliedAt - internship.postedAt) / (1000 * 60 * 60 * 24)
    if (daysSincePosted > 14) {
      prob += 0.05 // Late applications have higher dropout
    }
  }

  return Math.min(prob, 0.9)
}

/**
 * Predict dropout probability for a candidate-internship pair
 */
async function predictDropoutProbability(candidateId, internshipId, applicationId = null) {
  try {
    const [candidate, internship, application] = await Promise.all([
      Candidate.findById(candidateId),
      Internship.findById(internshipId),
      applicationId ? Application.findById(applicationId) : null,
    ])

    if (!candidate || !internship) {
      throw new Error("Candidate or internship not found")
    }

    // Use rule-based approach for now
    const dropoutProb = calculateBasicDropoutProbability(candidate, internship, application)

    // Log prediction for ML training
    await EventLog.logEvent(
      "model_prediction",
      {
        type: "dropout_probability",
        candidateId,
        internshipId,
        applicationId,
        prediction: dropoutProb,
        algorithm: "rule_based_v1",
        features: {
          distance: calculateDistance(
            candidate.location.coordinates[1],
            candidate.location.coordinates[0],
            internship.location.coordinates[1],
            internship.location.coordinates[0],
          ),
          stipendMatch: candidate.preferences.minStipend
            ? internship.stipend >= candidate.preferences.minStipend
            : true,
          educationLevel: candidate.education.level,
          workTypeMatch:
            candidate.preferences.workType === "either" ||
            (candidate.preferences.workType === "remote") === internship.flags.remote,
          companyReliability: internship.company?.reliability || 80,
        },
      },
      {
        candidateId,
        internshipId,
        applicationId,
      },
    )

    return {
      dropoutProbability: dropoutProb,
      riskLevel: dropoutProb > 0.7 ? "high" : dropoutProb > 0.4 ? "medium" : "low",
      factors: getDropoutFactors(candidate, internship, dropoutProb),
      algorithm: "rule_based_v1",
      predictedAt: new Date(),
    }
  } catch (error) {
    logger.error("Error predicting dropout probability", error)
    throw error
  }
}

/**
 * Get factors contributing to dropout risk
 */
function getDropoutFactors(candidate, internship, dropoutProb) {
  const factors = []

  // Distance factor
  const distance = calculateDistance(
    candidate.location.coordinates[1],
    candidate.location.coordinates[0],
    internship.location.coordinates[1],
    internship.location.coordinates[0],
  )

  if (distance > 100) {
    factors.push({
      factor: "distance",
      impact: distance > 200 ? "high" : "medium",
      description: `${Math.round(distance)} km from candidate location`,
      value: distance,
    })
  }

  // Stipend mismatch
  if (candidate.preferences.minStipend && internship.stipend < candidate.preferences.minStipend) {
    factors.push({
      factor: "stipend_mismatch",
      impact: "high",
      description: `Stipend below expectation (₹${internship.stipend} vs ₹${candidate.preferences.minStipend})`,
      value: candidate.preferences.minStipend - internship.stipend,
    })
  }

  // Education level mismatch
  const educationLevels = ["10th", "12th", "Diploma", "UG", "PG", "PhD"]
  const candidateLevel = educationLevels.indexOf(candidate.education.level)

  if (candidateLevel < 2 && !internship.flags.beginner) {
    factors.push({
      factor: "education_mismatch",
      impact: "medium",
      description: "May be underqualified for non-beginner role",
      value: candidateLevel,
    })
  }

  // Work type preference
  if (candidate.preferences.workType === "remote" && !internship.flags.remote) {
    factors.push({
      factor: "work_type_mismatch",
      impact: "medium",
      description: "Prefers remote work but role is onsite",
      value: "remote_preference",
    })
  }

  // Company reliability
  if (internship.company && internship.company.reliability < 70) {
    factors.push({
      factor: "company_reliability",
      impact: "medium",
      description: `Low company reliability score (${internship.company.reliability}%)`,
      value: internship.company.reliability,
    })
  }

  return factors
}

/**
 * Analyze dropout patterns for insights
 */
async function analyzeDropoutPatterns(dateRange = {}) {
  try {
    const matchStage = {
      status: { $in: ["withdrawn", "no_show", "dropped_out"] },
    }

    if (dateRange.from) {
      matchStage.appliedAt = { $gte: new Date(dateRange.from) }
    }
    if (dateRange.to) {
      matchStage.appliedAt = { ...matchStage.appliedAt, $lte: new Date(dateRange.to) }
    }

    const patterns = await Application.aggregate([
      { $match: matchStage },
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
      { $unwind: "$candidate" },
      { $unwind: "$internship" },
      {
        $group: {
          _id: {
            status: "$status",
            educationLevel: "$candidate.education.level",
            sector: "$internship.sector",
          },
          count: { $sum: 1 },
          avgDropoutProb: { $avg: "$dropoutProbAtApply" },
          avgMatchScore: { $avg: "$matchScore" },
        },
      },
      { $sort: { count: -1 } },
    ])

    // Calculate overall dropout rate
    const totalApplications = await Application.countDocuments({
      appliedAt: matchStage.appliedAt || { $exists: true },
    })

    const dropoutApplications = await Application.countDocuments(matchStage)
    const dropoutRate = totalApplications > 0 ? (dropoutApplications / totalApplications) * 100 : 0

    return {
      dropoutRate,
      totalApplications,
      dropoutApplications,
      patterns,
      analyzedAt: new Date(),
    }
  } catch (error) {
    logger.error("Error analyzing dropout patterns", error)
    throw error
  }
}

/**
 * Get dropout risk distribution for a set of applications
 */
async function getDropoutRiskDistribution(filters = {}) {
  try {
    const matchStage = { status: "applied" }

    // Apply filters
    if (filters.sector) matchStage["internship.sector"] = filters.sector
    if (filters.educationLevel) matchStage["candidate.education.level"] = filters.educationLevel
    if (filters.dateRange) {
      if (filters.dateRange.from) matchStage.appliedAt = { $gte: new Date(filters.dateRange.from) }
      if (filters.dateRange.to) matchStage.appliedAt = { ...matchStage.appliedAt, $lte: new Date(filters.dateRange.to) }
    }

    const distribution = await Application.aggregate([
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
      { $unwind: "$candidate" },
      { $unwind: "$internship" },
      { $match: matchStage },
      {
        $bucket: {
          groupBy: "$dropoutProbAtApply",
          boundaries: [0, 0.3, 0.5, 0.7, 1.0],
          default: "unknown",
          output: {
            count: { $sum: 1 },
            avgMatchScore: { $avg: "$matchScore" },
            applications: {
              $push: {
                applicationId: "$_id",
                candidateId: "$candidateId",
                internshipId: "$internshipId",
                dropoutProb: "$dropoutProbAtApply",
                matchScore: "$matchScore",
              },
            },
          },
        },
      },
    ])

    // Map bucket boundaries to risk levels
    const riskLevels = {
      0: "low",
      0.3: "medium",
      0.5: "high",
      0.7: "very_high",
    }

    const formattedDistribution = distribution.map((bucket) => ({
      riskLevel: riskLevels[bucket._id] || "unknown",
      range:
        bucket._id === "unknown"
          ? "unknown"
          : `${bucket._id}-${bucket._id === 0.7 ? 1.0 : Object.keys(riskLevels).find((k) => k > bucket._id)}`,
      count: bucket.count,
      avgMatchScore: Math.round(bucket.avgMatchScore || 0),
      applications: bucket.applications.slice(0, 10), // Limit for response size
    }))

    return {
      distribution: formattedDistribution,
      total: distribution.reduce((sum, bucket) => sum + bucket.count, 0),
      analyzedAt: new Date(),
    }
  } catch (error) {
    logger.error("Error getting dropout risk distribution", error)
    throw error
  }
}

module.exports = {
  calculateBasicDropoutProbability,
  predictDropoutProbability,
  getDropoutFactors,
  analyzeDropoutPatterns,
  getDropoutRiskDistribution,
}
