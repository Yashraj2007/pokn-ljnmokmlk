/**
 * Recommendation Service
 * Provides intelligent internship recommendations using rule-based and ML approaches
 */

const Candidate = require("../models/Candidate")
const Internship = require("../models/Internship")
const Application = require("../models/Application")
const EventLog = require("../models/EventLog")
const { logger } = require("../logger/logger")
const config = require("../config")

// Recommendation weights configuration
const WEIGHTS = {
  skills: 0.6,
  location: 0.2,
  education: 0.1,
  preferences: 0.05,
  company: 0.05,
}

// Distance calculation helper (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371 // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

/**
 * Calculate skill match score between candidate and internship
 */
function calculateSkillScore(candidateSkills, requiredSkills) {
  if (!requiredSkills || requiredSkills.length === 0) return 50

  const candidateSkillSet = new Set(candidateSkills.map((s) => s.canonical.toLowerCase()))
  const requiredSkillSet = new Set(requiredSkills.map((s) => s.toLowerCase()))

  // Exact matches
  const exactMatches = [...requiredSkillSet].filter((skill) => candidateSkillSet.has(skill))

  // Fuzzy matches (simplified - could use more sophisticated matching)
  const fuzzyMatches = []
  for (const reqSkill of requiredSkillSet) {
    if (!candidateSkillSet.has(reqSkill)) {
      for (const candSkill of candidateSkillSet) {
        if (candSkill.includes(reqSkill) || reqSkill.includes(candSkill)) {
          fuzzyMatches.push(reqSkill)
          break
        }
      }
    }
  }

  const exactScore = (exactMatches.length / requiredSkills.length) * 100
  const fuzzyScore = (fuzzyMatches.length / requiredSkills.length) * 50

  return Math.min(exactScore + fuzzyScore, 100)
}

/**
 * Calculate location score based on distance and preferences
 */
function calculateLocationScore(candidate, internship) {
  const candidateCoords = candidate.location.coordinates
  const internshipCoords = internship.location.coordinates

  // Same district = perfect score
  if (candidate.location.district === internship.location.district) {
    return 100
  }

  // Same state = good score
  if (candidate.location.state === internship.location.state) {
    return 80
  }

  // Calculate distance
  const distance = calculateDistance(candidateCoords[1], candidateCoords[0], internshipCoords[1], internshipCoords[0])

  // Distance-based scoring
  if (distance <= 50) return 70
  if (distance <= 100) return 50
  if (distance <= 200) return 30
  return 10
}

/**
 * Calculate education compatibility score
 */
function calculateEducationScore(candidate, internship) {
  const educationLevels = ["10th", "12th", "Diploma", "UG", "PG", "PhD"]
  const candidateLevel = educationLevels.indexOf(candidate.education.level)

  // Base score based on education level
  let score = Math.min(candidateLevel * 15 + 40, 100)

  // Bonus for relevant field
  const relevantFields = {
    Technology: ["Computer Science", "Information Technology", "Electronics"],
    Finance: ["Commerce", "Economics", "Business Administration"],
    Healthcare: ["Biology", "Chemistry", "Medical"],
    Engineering: ["Mechanical Engineering", "Civil Engineering", "Electronics"],
  }

  const sectorFields = relevantFields[internship.sector] || []
  if (sectorFields.some((field) => candidate.education.field.includes(field))) {
    score += 20
  }

  return Math.min(score, 100)
}

/**
 * Calculate preferences compatibility score
 */
function calculatePreferencesScore(candidate, internship) {
  let score = 50 // Base score

  // Stipend preference
  if (candidate.preferences.minStipend) {
    if (internship.stipend >= candidate.preferences.minStipend) {
      score += 25
    } else {
      score -= 15
    }
  }

  // Work type preference
  if (candidate.preferences.workType === "remote" && internship.flags.remote) {
    score += 15
  } else if (candidate.preferences.workType === "onsite" && !internship.flags.remote) {
    score += 10
  }

  // Sector preference
  if (candidate.preferences.sectors && candidate.preferences.sectors.includes(internship.sector)) {
    score += 10
  }

  return Math.max(Math.min(score, 100), 0)
}

/**
 * Calculate company reliability score
 */
function calculateCompanyScore(internship) {
  let score = 50 // Base score

  // Company reliability
  if (internship.company.reliability) {
    score = internship.company.reliability
  }

  // Company rating
  if (internship.company.rating) {
    score += (internship.company.rating - 3) * 10 // 3 is neutral
  }

  // Completion rate
  if (internship.analytics.completionRate) {
    score = (score + internship.analytics.completionRate) / 2
  }

  return Math.max(Math.min(score, 100), 0)
}

/**
 * Generate explanation for the match score
 */
function generateExplanation(candidate, internship, scores) {
  const explanations = []

  // Skill explanation
  const candidateSkills = candidate.skills.map((s) => s.canonical)
  const matchingSkills = internship.requiredSkills.filter((skill) =>
    candidateSkills.some((cs) => cs.toLowerCase() === skill.toLowerCase()),
  )

  if (matchingSkills.length > 0) {
    explanations.push(`Matches ${matchingSkills.length}/${internship.requiredSkills.length} skills`)
  }

  // Location explanation
  if (candidate.location.district === internship.location.district) {
    explanations.push("Same district")
  } else if (candidate.location.state === internship.location.state) {
    explanations.push("Same state")
  } else {
    const distance = calculateDistance(
      candidate.location.coordinates[1],
      candidate.location.coordinates[0],
      internship.location.coordinates[1],
      internship.location.coordinates[0],
    )
    explanations.push(`${Math.round(distance)} km away`)
  }

  // Special flags
  if (internship.flags.beginner) {
    explanations.push("Beginner-friendly")
  }

  if (internship.flags.remote && candidate.preferences.workType === "remote") {
    explanations.push("Remote work available")
  }

  if (internship.flags.urgent) {
    explanations.push("Urgent hiring")
  }

  // Stipend
  if (candidate.preferences.minStipend && internship.stipend >= candidate.preferences.minStipend) {
    explanations.push("Meets stipend expectation")
  }

  return explanations.slice(0, 4) // Limit to 4 explanations
}

/**
 * Calculate dropout probability for a candidate-internship pair
 */
function calculateDropoutProbability(candidate, internship) {
  let prob = 0.1 // Base probability

  // Distance factor
  const distance = calculateDistance(
    candidate.location.coordinates[1],
    candidate.location.coordinates[0],
    internship.location.coordinates[1],
    internship.location.coordinates[0],
  )

  if (distance > 200) prob += 0.25
  else if (distance > 100) prob += 0.15
  else if (distance > 50) prob += 0.1

  // Stipend mismatch
  if (candidate.preferences.minStipend && internship.stipend < candidate.preferences.minStipend) {
    prob += 0.2
  }

  // Education level vs internship requirements
  const educationLevels = ["10th", "12th", "Diploma", "UG", "PG", "PhD"]
  const candidateLevel = educationLevels.indexOf(candidate.education.level)

  if (candidateLevel < 2 && !internship.flags.beginner) {
    prob += 0.15 // Underqualified for non-beginner roles
  }

  // Work type mismatch
  if (candidate.preferences.workType === "remote" && !internship.flags.remote) {
    prob += 0.1
  }

  // Company reliability
  if (internship.company.reliability < 70) {
    prob += 0.1
  }

  // Duration mismatch
  if (candidate.preferences.duration && candidate.preferences.duration.max) {
    if (internship.durationMonths > candidate.preferences.duration.max) {
      prob += 0.05
    }
  }

  return Math.min(prob, 0.9)
}

/**
 * Score a single candidate-internship pair
 */
function scoreCandidateInternship(candidate, internship) {
  // Calculate individual scores
  const skillScore = calculateSkillScore(candidate.skills, internship.requiredSkills)
  const locationScore = calculateLocationScore(candidate, internship)
  const educationScore = calculateEducationScore(candidate, internship)
  const preferencesScore = calculatePreferencesScore(candidate, internship)
  const companyScore = calculateCompanyScore(internship)

  // Calculate weighted total score
  const totalScore = Math.round(
    skillScore * WEIGHTS.skills +
      locationScore * WEIGHTS.location +
      educationScore * WEIGHTS.education +
      preferencesScore * WEIGHTS.preferences +
      companyScore * WEIGHTS.company,
  )

  // Generate explanation
  const explanation = generateExplanation(candidate, internship, {
    skill: skillScore,
    location: locationScore,
    education: educationScore,
    preferences: preferencesScore,
    company: companyScore,
  })

  // Calculate dropout probability
  const dropoutProb = calculateDropoutProbability(candidate, internship)

  return {
    matchScore: totalScore,
    explainReasons: explanation,
    dropoutProb,
    scores: {
      skill: skillScore,
      location: locationScore,
      education: educationScore,
      preferences: preferencesScore,
      company: companyScore,
    },
  }
}

/**
 * Get top K recommendations for a candidate
 */
async function getTopKRecommendations(candidate, limit = 5) {
  try {
    // Get active internships
    const internships = await Internship.find({
      status: "active",
      expiresAt: { $gt: new Date() },
    }).lean()

    if (internships.length === 0) {
      return []
    }

    // Get candidate's existing applications to avoid duplicates
    const existingApplications = await Application.find({
      candidateId: candidate._id,
    })
      .select("internshipId")
      .lean()

    const appliedInternshipIds = new Set(existingApplications.map((app) => app.internshipId.toString()))

    // Filter out already applied internships
    const availableInternships = internships.filter(
      (internship) => !appliedInternshipIds.has(internship._id.toString()),
    )

    // Score all available internships
    const scoredInternships = availableInternships.map((internship) => {
      const scoring = scoreCandidateInternship(candidate, internship)

      return {
        internshipId: internship._id,
        title: internship.title,
        companyName: internship.companyName,
        companyLogoUrl: internship.companyLogoUrl,
        location: internship.location,
        stipend: internship.stipend,
        durationMonths: internship.durationMonths,
        sector: internship.sector,
        flags: internship.flags,
        postedAt: internship.postedAt,
        expiresAt: internship.expiresAt,
        ...scoring,
        completionRateSimilar: internship.analytics.completionRate || 75,
      }
    })

    // Sort by match score (descending) and return top K
    const topRecommendations = scoredInternships.sort((a, b) => b.matchScore - a.matchScore).slice(0, limit)

    // Log recommendation event
    await EventLog.logEvent(
      "recommendation_generated",
      {
        candidateId: candidate._id,
        recommendationCount: topRecommendations.length,
        topScores: topRecommendations.slice(0, 3).map((r) => r.matchScore),
        algorithm: "rule_based_v1",
      },
      {
        candidateId: candidate._id,
      },
    )

    return topRecommendations
  } catch (error) {
    logger.error("Error generating recommendations", error)
    throw error
  }
}

/**
 * Get recommendations with caching
 */
async function getRecommendationsWithCache(candidateId, limit = 5, forceRefresh = false) {
  try {
    const candidate = await Candidate.findById(candidateId)
    if (!candidate) {
      throw new Error("Candidate not found")
    }

    // Check if we need to refresh recommendations
    const lastRecommendationTime = candidate.analytics.lastRecommendationAt
    const cacheExpiry = 24 * 60 * 60 * 1000 // 24 hours
    const shouldRefresh =
      forceRefresh || !lastRecommendationTime || Date.now() - lastRecommendationTime.getTime() > cacheExpiry

    if (shouldRefresh) {
      const recommendations = await getTopKRecommendations(candidate, limit)

      // Update candidate's last recommendation timestamp
      await Candidate.findByIdAndUpdate(candidateId, {
        "analytics.lastRecommendationAt": new Date(),
      })

      return recommendations
    }

    // Return cached recommendations (simplified - in production you'd store these)
    return await getTopKRecommendations(candidate, limit)
  } catch (error) {
    logger.error("Error getting cached recommendations", error)
    throw error
  }
}

/**
 * Get similar candidates for an internship (for analytics)
 */
async function getSimilarCandidates(internshipId, limit = 10) {
  try {
    const internship = await Internship.findById(internshipId)
    if (!internship) {
      throw new Error("Internship not found")
    }

    // Find candidates with matching skills and location preferences
    const candidates = await Candidate.find({
      status: "active",
      "skills.canonical": { $in: internship.requiredSkills },
      $or: [
        { "location.district": internship.location.district },
        { "location.state": internship.location.state },
        { "preferences.distancePref": "any" },
      ],
    }).limit(limit * 2) // Get more to filter

    // Score and sort candidates
    const scoredCandidates = candidates.map((candidate) => {
      const scoring = scoreCandidateInternship(candidate, internship)
      return {
        candidateId: candidate._id,
        name: candidate.name,
        education: candidate.education,
        skills: candidate.skills,
        location: candidate.location,
        ...scoring,
      }
    })

    return scoredCandidates.sort((a, b) => b.matchScore - a.matchScore).slice(0, limit)
  } catch (error) {
    logger.error("Error finding similar candidates", error)
    throw error
  }
}

/**
 * Analyze recommendation performance
 */
async function analyzeRecommendationPerformance(dateRange = {}) {
  try {
    const matchStage = {
      type: "recommendation_generated",
    }

    if (dateRange.from) {
      matchStage.eventTime = { $gte: new Date(dateRange.from) }
    }
    if (dateRange.to) {
      matchStage.eventTime = { ...matchStage.eventTime, $lte: new Date(dateRange.to) }
    }

    const stats = await EventLog.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalRecommendations: { $sum: 1 },
          avgRecommendationCount: { $avg: "$payload.recommendationCount" },
          avgTopScore: { $avg: { $arrayElemAt: ["$payload.topScores", 0] } },
        },
      },
    ])

    return (
      stats[0] || {
        totalRecommendations: 0,
        avgRecommendationCount: 0,
        avgTopScore: 0,
      }
    )
  } catch (error) {
    logger.error("Error analyzing recommendation performance", error)
    throw error
  }
}

module.exports = {
  scoreCandidateInternship,
  getTopKRecommendations,
  getRecommendationsWithCache,
  getSimilarCandidates,
  analyzeRecommendationPerformance,
  calculateDistance,
  calculateSkillScore,
  calculateLocationScore,
  calculateEducationScore,
  calculatePreferencesScore,
  calculateCompanyScore,
  calculateDropoutProbability,
}
