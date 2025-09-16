/**
 * Seed script for candidates
 * Creates sample candidate data for testing and development
 */

const mongoose = require("mongoose")
const config = require("../src/config")
const Candidate = require("../src/models/Candidate")
const { logger } = require("../src/logger/logger")

// Sample data
const names = [
  "Aarav Sharma",
  "Vivaan Patel",
  "Aditya Kumar",
  "Vihaan Singh",
  "Arjun Gupta",
  "Sai Reddy",
  "Reyansh Joshi",
  "Ayaan Khan",
  "Krishna Yadav",
  "Ishaan Verma",
  "Ananya Agarwal",
  "Diya Mehta",
  "Aadhya Jain",
  "Kavya Nair",
  "Arya Desai",
  "Myra Shah",
  "Anika Bansal",
  "Navya Iyer",
  "Kiara Malhotra",
  "Saanvi Kapoor",
  "Riya Pandey",
  "Priya Sinha",
  "Shreya Tiwari",
  "Pooja Mishra",
  "Neha Saxena",
  "Rahul Bhatt",
  "Amit Chandra",
  "Rohit Kulkarni",
  "Vikash Rao",
  "Suresh Pillai",
]

const locations = [
  { district: "Pune", state: "Maharashtra", coordinates: [73.8567, 18.5204] },
  { district: "Mumbai", state: "Maharashtra", coordinates: [72.8777, 19.076] },
  { district: "Kolhapur", state: "Maharashtra", coordinates: [74.2433, 16.705] },
  { district: "Nashik", state: "Maharashtra", coordinates: [73.7898, 19.9975] },
  { district: "Nagpur", state: "Maharashtra", coordinates: [79.0882, 21.1458] },
  { district: "Aurangabad", state: "Maharashtra", coordinates: [75.3433, 19.8762] },
  { district: "Solapur", state: "Maharashtra", coordinates: [75.9064, 17.6599] },
  { district: "Sangli", state: "Maharashtra", coordinates: [74.5815, 16.8524] },
  { district: "Bangalore", state: "Karnataka", coordinates: [77.5946, 12.9716] },
  { district: "Hyderabad", state: "Telangana", coordinates: [78.4867, 17.385] },
]

const educationFields = [
  "Computer Science",
  "Information Technology",
  "Electronics",
  "Mechanical Engineering",
  "Civil Engineering",
  "Business Administration",
  "Commerce",
  "Arts",
  "Science",
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "Economics",
  "Psychology",
]

const skillSets = {
  "Computer Science": ["javascript", "python", "java", "react", "nodejs", "html", "css", "sql", "git", "mongodb"],
  "Information Technology": [
    "networking",
    "cybersecurity",
    "database-management",
    "system-administration",
    "cloud-computing",
  ],
  Electronics: ["circuit-design", "embedded-systems", "arduino", "raspberry-pi", "pcb-design"],
  "Mechanical Engineering": ["autocad", "solidworks", "manufacturing", "quality-control", "project-management"],
  "Civil Engineering": ["autocad", "structural-design", "construction-management", "surveying", "project-planning"],
  "Business Administration": ["management", "leadership", "strategic-planning", "business-analysis", "operations"],
  Commerce: ["accounting", "finance", "taxation", "auditing", "financial-analysis", "excel", "tally"],
  Arts: ["creative-writing", "graphic-design", "photography", "content-creation", "social-media"],
  Science: ["research", "data-analysis", "laboratory-skills", "scientific-writing", "statistics"],
  Mathematics: ["statistics", "data-analysis", "mathematical-modeling", "problem-solving", "excel"],
}

const commonSkills = [
  "communication",
  "teamwork",
  "problem-solving",
  "time-management",
  "leadership",
  "microsoft-office",
  "excel",
  "powerpoint",
  "english",
  "hindi",
  "marathi",
]

const generateRandomCandidate = () => {
  const name = names[Math.floor(Math.random() * names.length)]
  const location = locations[Math.floor(Math.random() * locations.length)]
  const educationField = educationFields[Math.floor(Math.random() * educationFields.length)]
  const educationLevel = ["12th", "Diploma", "UG", "PG"][Math.floor(Math.random() * 4)]
  const currentYear = new Date().getFullYear()
  const educationYear = currentYear - Math.floor(Math.random() * 5) // Graduated in last 5 years

  // Generate skills based on education field
  const fieldSkills = skillSets[educationField] || []
  const allPossibleSkills = [...fieldSkills, ...commonSkills]
  const numSkills = Math.floor(Math.random() * 8) + 3 // 3-10 skills
  const selectedSkills = []

  // Shuffle and select skills
  const shuffledSkills = [...allPossibleSkills].sort(() => 0.5 - Math.random())
  for (let i = 0; i < Math.min(numSkills, shuffledSkills.length); i++) {
    const skill = shuffledSkills[i]
    selectedSkills.push({
      name: skill.charAt(0).toUpperCase() + skill.slice(1).replace("-", " "),
      canonical: skill,
      confidence: Math.random() * 0.3 + 0.7, // 0.7-1.0
      source: Math.random() > 0.8 ? "verified" : "user",
    })
  }

  // Generate mobile number
  const mobileNumber = `+91${Math.floor(Math.random() * 9000000000) + 1000000000}`

  return {
    mobile: mobileNumber,
    name,
    language: ["en", "hi", "mr"][Math.floor(Math.random() * 3)],
    education: {
      level: educationLevel,
      field: educationField,
      year: educationYear,
      verified: Math.random() > 0.7, // 30% verified
      institution: `${location.district} ${["University", "College", "Institute"][Math.floor(Math.random() * 3)]}`,
      percentage: Math.floor(Math.random() * 30) + 60, // 60-90%
    },
    skills: selectedSkills,
    location: {
      type: "Point",
      coordinates: [
        location.coordinates[0] + (Math.random() - 0.5) * 0.1, // Add some variance
        location.coordinates[1] + (Math.random() - 0.5) * 0.1,
      ],
      district: location.district,
      state: location.state,
      pincode: `${Math.floor(Math.random() * 90000) + 10000}`,
    },
    preferences: {
      distancePref: ["local", "state", "any"][Math.floor(Math.random() * 3)],
      workType: ["onsite", "remote", "either"][Math.floor(Math.random() * 3)],
      minStipend: Math.floor(Math.random() * 15000) + 5000, // 5000-20000
      sectors: ["Technology", "Finance", "Healthcare", "Education", "Marketing"].filter(() => Math.random() > 0.7), // Random selection
      startDate: new Date(Date.now() + Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000), // Within 90 days
      duration: {
        min: Math.floor(Math.random() * 3) + 3, // 3-5 months
        max: Math.floor(Math.random() * 6) + 6, // 6-11 months
      },
    },
    status: Math.random() > 0.1 ? "active" : "inactive", // 90% active
    metadata: {
      deviceInfo: ["Android", "iOS", "Web"][Math.floor(Math.random() * 3)],
      anonId: `anon_${Math.random().toString(36).substr(2, 9)}`,
      source: ["web", "mobile", "sms"][Math.floor(Math.random() * 3)],
      lastActive: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000), // Within last 30 days
    },
    analytics: {
      totalApplications: Math.floor(Math.random() * 10),
      successfulApplications: Math.floor(Math.random() * 3),
      averageMatchScore: Math.floor(Math.random() * 40) + 60, // 60-100
      lastRecommendationAt: new Date(Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000), // Within last week
    },
  }
}

const seedCandidates = async () => {
  try {
    // Connect to database
    await mongoose.connect(config.mongodb.uri, config.mongodb.options)
    logger.info("Connected to MongoDB for seeding candidates")

    // Clear existing candidates
    await Candidate.deleteMany({})
    logger.info("Cleared existing candidates")

    // Generate and insert candidates
    const candidates = []
    const numCandidates = 100 // Generate 100 candidates

    for (let i = 0; i < numCandidates; i++) {
      candidates.push(generateRandomCandidate())
    }

    await Candidate.insertMany(candidates)
    logger.info(`✅ Successfully seeded ${numCandidates} candidates`)

    // Log statistics
    const stats = await Candidate.aggregate([
      {
        $group: {
          _id: {
            district: "$location.district",
            educationLevel: "$education.level",
          },
          count: { $sum: 1 },
          avgSkills: { $avg: { $size: "$skills" } },
          activeCount: { $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] } },
        },
      },
    ])

    logger.info("Candidate statistics:", stats.slice(0, 10)) // Show first 10 stats

    // Skills distribution
    const skillStats = await Candidate.aggregate([
      { $unwind: "$skills" },
      {
        $group: {
          _id: "$skills.canonical",
          count: { $sum: 1 },
          avgConfidence: { $avg: "$skills.confidence" },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 20 },
    ])

    logger.info("Top 20 skills:", skillStats)
  } catch (error) {
    logger.error("Error seeding candidates:", error)
    process.exit(1)
  } finally {
    await mongoose.connection.close()
    logger.info("Database connection closed")
  }
}

// Run seeding if called directly
if (require.main === module) {
  seedCandidates()
}

module.exports = { seedCandidates, generateRandomCandidate }
