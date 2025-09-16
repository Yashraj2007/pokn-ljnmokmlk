const logger = require("../logger/logger")

class FeatureExtractor {
  constructor() {
    this.skillCategories = {
      technical: ["javascript", "python", "java", "react", "node.js", "sql", "mongodb", "aws", "docker", "git"],
      design: ["figma", "photoshop", "ui/ux", "adobe", "sketch", "canva"],
      marketing: ["digital marketing", "seo", "social media", "content writing", "analytics"],
      business: ["excel", "powerpoint", "project management", "communication", "leadership"],
      data: ["data analysis", "machine learning", "statistics", "tableau", "power bi"],
    }
  }

  extractCandidateFeatures(candidate) {
    try {
      const features = {
        // Basic demographics
        age: this.calculateAge(candidate.dateOfBirth),
        genderEncoded: candidate.gender === "Male" ? 1 : candidate.gender === "Female" ? 0 : 0.5,

        // Education features
        cgpa: candidate.cgpa || 0,
        educationLevel: this.encodeEducationLevel(candidate.education),

        // Skills features
        skillCount: candidate.skills?.length || 0,
        technicalSkillsCount: this.countSkillsByCategory(candidate.skills, "technical"),
        designSkillsCount: this.countSkillsByCategory(candidate.skills, "design"),
        marketingSkillsCount: this.countSkillsByCategory(candidate.skills, "marketing"),
        businessSkillsCount: this.countSkillsByCategory(candidate.skills, "business"),
        dataSkillsCount: this.countSkillsByCategory(candidate.skills, "data"),

        // Experience features
        hasExperience: candidate.experience && candidate.experience.length > 0 ? 1 : 0,
        experienceCount: candidate.experience?.length || 0,

        // Location features
        locationTier: this.getLocationTier(candidate.location),

        // Preferences
        preferredStipendMin: candidate.preferences?.stipendRange?.min || 0,
        preferredStipendMax: candidate.preferences?.stipendRange?.max || 50000,
        flexibleLocation: candidate.preferences?.remoteWork ? 1 : 0,

        // Profile completeness
        profileCompleteness: this.calculateProfileCompleteness(candidate),
      }

      return features
    } catch (error) {
      logger.error("Error extracting candidate features:", error)
      return null
    }
  }

  extractInternshipFeatures(internship) {
    try {
      const features = {
        // Basic internship info
        stipend: internship.stipend || 0,
        duration: internship.duration || 0,
        isRemote: internship.location?.toLowerCase().includes("remote") ? 1 : 0,

        // Requirements
        requiredSkillsCount: internship.requiredSkills?.length || 0,
        technicalRequirements: this.countSkillsByCategory(internship.requiredSkills, "technical"),
        designRequirements: this.countSkillsByCategory(internship.requiredSkills, "design"),
        marketingRequirements: this.countSkillsByCategory(internship.requiredSkills, "marketing"),
        businessRequirements: this.countSkillsByCategory(internship.requiredSkills, "business"),
        dataRequirements: this.countSkillsByCategory(internship.requiredSkills, "data"),

        // Company features
        companySize: this.encodeCompanySize(internship.companySize),
        sectorEncoded: this.encodeSector(internship.sector),

        // Location features
        locationTier: this.getLocationTier(internship.location),

        // Opportunity features
        hasPerformanceBonus: internship.benefits?.includes("Performance Bonus") ? 1 : 0,
        hasCertificate: internship.benefits?.includes("Certificate") ? 1 : 0,
        hasFlexibleHours: internship.benefits?.includes("Flexible Hours") ? 1 : 0,

        // Application stats (if available)
        applicationCount: internship.applicationCount || 0,
        competitiveness: Math.min((internship.applicationCount || 0) / 100, 1),
      }

      return features
    } catch (error) {
      logger.error("Error extracting internship features:", error)
      return null
    }
  }

  extractInteractionFeatures(candidate, internship, application = null) {
    try {
      const candidateFeatures = this.extractCandidateFeatures(candidate)
      const internshipFeatures = this.extractInternshipFeatures(internship)

      if (!candidateFeatures || !internshipFeatures) {
        return null
      }

      const features = {
        ...candidateFeatures,
        ...internshipFeatures,

        // Interaction-specific features
        skillMatch: this.calculateSkillMatch(candidate.skills, internship.requiredSkills),
        locationMatch: this.calculateLocationMatch(candidate.location, internship.location),
        stipendMatch: this.calculateStipendMatch(candidate.preferences, internship.stipend),
        sectorMatch: candidate.preferences?.sectors?.includes(internship.sector) ? 1 : 0,

        // Application features (if available)
        hasApplied: application ? 1 : 0,
        applicationStatus: application ? this.encodeApplicationStatus(application.status) : 0,
        daysSinceApplication: application ? this.daysBetween(application.appliedAt, new Date()) : 0,
      }

      return features
    } catch (error) {
      logger.error("Error extracting interaction features:", error)
      return null
    }
  }

  // Helper methods
  calculateAge(dateOfBirth) {
    if (!dateOfBirth) return 22 // Default age
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  encodeEducationLevel(education) {
    const levels = {
      "High School": 1,
      Diploma: 2,
      Bachelor: 3,
      Master: 4,
      PhD: 5,
    }
    return levels[education] || 3
  }

  countSkillsByCategory(skills, category) {
    if (!skills || !Array.isArray(skills)) return 0
    const categorySkills = this.skillCategories[category] || []
    return skills.filter((skill) =>
      categorySkills.some((catSkill) => skill.toLowerCase().includes(catSkill.toLowerCase())),
    ).length
  }

  getLocationTier(location) {
    if (!location) return 2
    const tier1Cities = ["mumbai", "delhi", "bangalore", "hyderabad", "chennai", "pune", "kolkata"]
    const tier2Cities = ["ahmedabad", "surat", "jaipur", "lucknow", "kanpur", "nagpur", "indore"]

    const locationLower = location.toLowerCase()
    if (tier1Cities.some((city) => locationLower.includes(city))) return 1
    if (tier2Cities.some((city) => locationLower.includes(city))) return 2
    return 3
  }

  encodeCompanySize(size) {
    const sizes = {
      "Startup (1-50)": 1,
      "Small (51-200)": 2,
      "Medium (201-1000)": 3,
      "Large (1000+)": 4,
    }
    return sizes[size] || 2
  }

  encodeSector(sector) {
    const sectors = {
      Technology: 1,
      Finance: 2,
      Healthcare: 3,
      Education: 4,
      "E-commerce": 5,
      Manufacturing: 6,
      Consulting: 7,
      Media: 8,
      "Non-profit": 9,
    }
    return sectors[sector] || 1
  }

  encodeApplicationStatus(status) {
    const statuses = {
      pending: 0,
      reviewed: 1,
      shortlisted: 2,
      interview_scheduled: 3,
      selected: 4,
      rejected: -1,
      withdrawn: -2,
    }
    return statuses[status] || 0
  }

  calculateProfileCompleteness(candidate) {
    let score = 0
    const fields = ["name", "email", "phone", "location", "education", "cgpa", "skills", "dateOfBirth", "gender"]

    fields.forEach((field) => {
      if (candidate[field] && candidate[field] !== "") {
        score += 1
      }
    })

    if (candidate.experience && candidate.experience.length > 0) score += 1
    if (candidate.preferences) score += 1

    return score / (fields.length + 2)
  }

  calculateSkillMatch(candidateSkills, requiredSkills) {
    if (!candidateSkills || !requiredSkills) return 0

    const candidateSkillsLower = candidateSkills.map((s) => s.toLowerCase())
    const requiredSkillsLower = requiredSkills.map((s) => s.toLowerCase())

    const matches = requiredSkillsLower.filter((skill) =>
      candidateSkillsLower.some((cSkill) => cSkill.includes(skill) || skill.includes(cSkill)),
    ).length

    return matches / requiredSkillsLower.length
  }

  calculateLocationMatch(candidateLocation, internshipLocation) {
    if (!candidateLocation || !internshipLocation) return 0.5

    if (internshipLocation.toLowerCase().includes("remote")) return 1

    const candLoc = candidateLocation.toLowerCase()
    const intLoc = internshipLocation.toLowerCase()

    if (candLoc === intLoc) return 1
    if (candLoc.includes(intLoc) || intLoc.includes(candLoc)) return 0.8

    return 0.2
  }

  calculateStipendMatch(preferences, stipend) {
    if (!preferences || !preferences.stipendRange) return 0.5

    const { min, max } = preferences.stipendRange
    if (stipend >= min && stipend <= max) return 1
    if (stipend < min) return Math.max(0, stipend / min)
    return Math.max(0, max / stipend)
  }

  daysBetween(date1, date2) {
    const oneDay = 24 * 60 * 60 * 1000
    return Math.round(Math.abs((date1 - date2) / oneDay))
  }

  // Convert features to tensor format
  featuresToTensor(features) {
    const featureOrder = [
      "age",
      "genderEncoded",
      "cgpa",
      "educationLevel",
      "skillCount",
      "technicalSkillsCount",
      "designSkillsCount",
      "marketingSkillsCount",
      "businessSkillsCount",
      "dataSkillsCount",
      "hasExperience",
      "experienceCount",
      "locationTier",
      "preferredStipendMin",
      "preferredStipendMax",
      "flexibleLocation",
      "profileCompleteness",
      "stipend",
      "duration",
      "isRemote",
      "requiredSkillsCount",
      "technicalRequirements",
      "designRequirements",
      "marketingRequirements",
      "businessRequirements",
      "dataRequirements",
      "companySize",
      "sectorEncoded",
      "hasPerformanceBonus",
      "hasCertificate",
      "hasFlexibleHours",
      "applicationCount",
      "competitiveness",
      "skillMatch",
      "locationMatch",
      "stipendMatch",
      "sectorMatch",
    ]

    return featureOrder.map((feature) => features[feature] || 0)
  }
}

module.exports = FeatureExtractor
