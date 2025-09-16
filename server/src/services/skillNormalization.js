/**
 * Skill Normalization Service
 * Handles skill text cleaning, normalization, and fuzzy matching
 */

const Fuse = require("fuse.js")
const natural = require("natural")
const fs = require("fs").promises
const path = require("path")
const { logger } = require("../logger/logger")

// Load skill mapping data
let skillMap = null
let fuseInstance = null

// Initialize skill normalization
async function initializeSkillNormalization() {
  try {
    const skillMapPath = path.join(__dirname, "../utils/skillMap.json")
    const skillMapData = await fs.readFile(skillMapPath, "utf8")
    skillMap = JSON.parse(skillMapData)

    // Create Fuse instance for fuzzy matching
    const fuseOptions = {
      keys: ["canonical", "aliases"],
      threshold: 0.3, // Lower = more strict matching
      distance: 100,
      includeScore: true,
      includeMatches: true,
    }

    // Prepare data for Fuse
    const fuseData = Object.entries(skillMap).map(([canonical, data]) => ({
      canonical,
      aliases: data.aliases || [],
      category: data.category,
      weight: data.weight || 1,
    }))

    fuseInstance = new Fuse(fuseData, fuseOptions)

    logger.info("Skill normalization initialized", {
      skillCount: Object.keys(skillMap).length,
    })
  } catch (error) {
    logger.error("Failed to initialize skill normalization", error)
    // Create default skill map if file doesn't exist
    skillMap = {}
    fuseInstance = new Fuse([], { keys: ["canonical"] })
  }
}

/**
 * Clean and normalize text input
 */
function cleanText(text) {
  if (!text || typeof text !== "string") return ""

  return (
    text
      .toLowerCase()
      .trim()
      // Remove special characters except hyphens and dots
      .replace(/[^\w\s\-.]/g, " ")
      // Normalize common variations
      .replace(/\bjs\b/g, "javascript")
      .replace(/\breact\.js\b/g, "react")
      .replace(/\bnode\.js\b/g, "nodejs")
      .replace(/\bc\+\+/g, "cpp")
      .replace(/\bc#/g, "csharp")
      // Remove extra spaces
      .replace(/\s+/g, " ")
      .trim()
  )
}

/**
 * Extract skills from text using NLP
 */
function extractSkillsFromText(text) {
  const cleanedText = cleanText(text)
  const words = natural.WordTokenizer().tokenize(cleanedText)
  const phrases = []

  // Extract 1-3 word phrases that might be skills
  for (let i = 0; i < words.length; i++) {
    // Single words
    if (words[i].length > 2) {
      phrases.push(words[i])
    }

    // Two-word phrases
    if (i < words.length - 1) {
      const twoWord = `${words[i]} ${words[i + 1]}`
      if (twoWord.length > 4) {
        phrases.push(twoWord)
      }
    }

    // Three-word phrases
    if (i < words.length - 2) {
      const threeWord = `${words[i]} ${words[i + 1]} ${words[i + 2]}`
      if (threeWord.length > 6) {
        phrases.push(threeWord)
      }
    }
  }

  return [...new Set(phrases)] // Remove duplicates
}

/**
 * Normalize a single skill input
 */
function normalizeSkillInput(rawSkill) {
  if (!rawSkill || typeof rawSkill !== "string") {
    return { canonical: null, confidence: 0, suggestions: [] }
  }

  const cleaned = cleanText(rawSkill)
  if (!cleaned) {
    return { canonical: null, confidence: 0, suggestions: [] }
  }

  // Direct match check
  if (skillMap[cleaned]) {
    return {
      canonical: cleaned,
      confidence: 1.0,
      suggestions: [],
    }
  }

  // Check aliases
  for (const [canonical, data] of Object.entries(skillMap)) {
    if (data.aliases && data.aliases.includes(cleaned)) {
      return {
        canonical,
        confidence: 0.95,
        suggestions: [],
      }
    }
  }

  // Fuzzy matching
  if (fuseInstance) {
    const results = fuseInstance.search(cleaned)

    if (results.length > 0) {
      const bestMatch = results[0]
      const confidence = 1 - bestMatch.score // Fuse score is distance, we want similarity

      if (confidence > 0.7) {
        return {
          canonical: bestMatch.item.canonical,
          confidence,
          suggestions: results.slice(1, 4).map((r) => ({
            canonical: r.item.canonical,
            confidence: 1 - r.score,
          })),
        }
      }
    }
  }

  // No good match found
  return {
    canonical: cleaned, // Use cleaned input as canonical
    confidence: 0.5, // Low confidence for unknown skills
    suggestions: fuseInstance
      ? fuseInstance
          .search(cleaned)
          .slice(0, 3)
          .map((r) => ({
            canonical: r.item.canonical,
            confidence: 1 - r.score,
          }))
      : [],
  }
}

/**
 * Normalize multiple skills from text
 */
function normalizeSkillsFromText(text) {
  const extractedSkills = extractSkillsFromText(text)
  const normalizedSkills = []

  for (const skill of extractedSkills) {
    const normalized = normalizeSkillInput(skill)
    if (normalized.canonical && normalized.confidence > 0.3) {
      normalizedSkills.push({
        original: skill,
        canonical: normalized.canonical,
        confidence: normalized.confidence,
      })
    }
  }

  // Remove duplicates by canonical name
  const uniqueSkills = []
  const seen = new Set()

  for (const skill of normalizedSkills) {
    if (!seen.has(skill.canonical)) {
      seen.add(skill.canonical)
      uniqueSkills.push(skill)
    }
  }

  return uniqueSkills.sort((a, b) => b.confidence - a.confidence)
}

/**
 * Add new skill to the skill map
 */
async function addSkillToMap(canonical, aliases = [], category = "general", weight = 1) {
  try {
    if (!skillMap) {
      await initializeSkillNormalization()
    }

    skillMap[canonical] = {
      aliases,
      category,
      weight,
      addedAt: new Date().toISOString(),
    }

    // Save updated skill map
    const skillMapPath = path.join(__dirname, "../utils/skillMap.json")
    await fs.writeFile(skillMapPath, JSON.stringify(skillMap, null, 2))

    // Reinitialize Fuse instance
    await initializeSkillNormalization()

    logger.info("Added new skill to map", { canonical, aliases, category })

    return true
  } catch (error) {
    logger.error("Failed to add skill to map", error)
    return false
  }
}

/**
 * Get skill suggestions for admin review
 */
async function getSkillSuggestions(limit = 50) {
  try {
    // This would typically query a database of user-submitted skills
    // For now, return empty array
    return []
  } catch (error) {
    logger.error("Failed to get skill suggestions", error)
    return []
  }
}

/**
 * Get skill statistics
 */
function getSkillStats() {
  if (!skillMap) {
    return { totalSkills: 0, categories: {} }
  }

  const categories = {}
  let totalSkills = 0

  for (const [canonical, data] of Object.entries(skillMap)) {
    totalSkills++
    const category = data.category || "general"
    categories[category] = (categories[category] || 0) + 1
  }

  return { totalSkills, categories }
}

/**
 * Validate and normalize skill array
 */
function validateAndNormalizeSkills(skills) {
  if (!Array.isArray(skills)) {
    return []
  }

  const normalizedSkills = []

  for (const skill of skills) {
    if (typeof skill === "string") {
      const normalized = normalizeSkillInput(skill)
      if (normalized.canonical) {
        normalizedSkills.push({
          name: skill,
          canonical: normalized.canonical,
          confidence: normalized.confidence,
          source: "user",
        })
      }
    } else if (skill && typeof skill === "object" && skill.name) {
      const normalized = normalizeSkillInput(skill.name)
      if (normalized.canonical) {
        normalizedSkills.push({
          name: skill.name,
          canonical: normalized.canonical,
          confidence: skill.confidence || normalized.confidence,
          source: skill.source || "user",
        })
      }
    }
  }

  return normalizedSkills
}

// Initialize on module load
initializeSkillNormalization().catch((error) => {
  logger.error("Failed to initialize skill normalization on startup", error)
})

module.exports = {
  initializeSkillNormalization,
  cleanText,
  extractSkillsFromText,
  normalizeSkillInput,
  normalizeSkillsFromText,
  addSkillToMap,
  getSkillSuggestions,
  getSkillStats,
  validateAndNormalizeSkills,
}
