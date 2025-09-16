const RecommendService = require("../../src/services/recommendService")
const Candidate = require("../../src/models/Candidate")
const Internship = require("../../src/models/Internship")
const { createTestCandidate, createTestInternship } = require("./utils") // Assuming utils file contains these functions

describe("RecommendService", () => {
  let recommendService
  let testCandidate
  let testInternship

  beforeEach(async () => {
    recommendService = new RecommendService()

    testCandidate = await Candidate.create(
      createTestCandidate({
        skills: ["JavaScript", "React", "Node.js"],
        location: "Mumbai",
        preferences: {
          sectors: ["Technology"],
          stipendRange: { min: 20000, max: 40000 },
        },
      }),
    )

    testInternship = await Internship.create(
      createTestInternship({
        requiredSkills: ["JavaScript", "React"],
        location: "Mumbai",
        stipend: 30000,
        sector: "Technology",
      }),
    )
  })

  describe("calculateMatchScore", () => {
    test("should calculate high match score for well-matched candidate", async () => {
      const score = await recommendService.calculateMatchScore(testCandidate, testInternship)

      expect(score).toBeGreaterThan(0.7)
      expect(score).toBeLessThanOrEqual(1)
    })

    test("should calculate low match score for poorly matched candidate", async () => {
      const poorCandidate = await Candidate.create(
        createTestCandidate({
          skills: ["Cooking", "Dancing"],
          location: "Delhi",
          preferences: {
            sectors: ["Healthcare"],
            stipendRange: { min: 5000, max: 10000 },
          },
        }),
      )

      const score = await recommendService.calculateMatchScore(poorCandidate, testInternship)

      expect(score).toBeLessThan(0.3)
    })
  })

  describe("getRecommendations", () => {
    test("should return recommendations for candidate", async () => {
      const recommendations = await recommendService.getRecommendations(testCandidate._id, {
        limit: 5,
      })

      expect(recommendations).toBeDefined()
      expect(Array.isArray(recommendations.recommendations)).toBe(true)
      expect(recommendations.recommendations.length).toBeGreaterThan(0)

      const firstRec = recommendations.recommendations[0]
      expect(firstRec.internship).toBeDefined()
      expect(firstRec.matchScore).toBeDefined()
      expect(firstRec.reasons).toBeDefined()
    })

    test("should sort recommendations by match score", async () => {
      // Create multiple internships
      await Internship.create([
        createTestInternship({
          title: "Low Match",
          requiredSkills: ["Python", "Django"],
          stipend: 15000,
        }),
        createTestInternship({
          title: "High Match",
          requiredSkills: ["JavaScript", "React", "Node.js"],
          stipend: 35000,
        }),
      ])

      const recommendations = await recommendService.getRecommendations(testCandidate._id, {
        limit: 10,
      })

      const scores = recommendations.recommendations.map((r) => r.matchScore)
      const sortedScores = [...scores].sort((a, b) => b - a)

      expect(scores).toEqual(sortedScores)
    })
  })

  describe("explainRecommendation", () => {
    test("should provide explanation for recommendation", async () => {
      const explanation = await recommendService.explainRecommendation(testCandidate._id, testInternship._id)

      expect(explanation).toBeDefined()
      expect(explanation.matchScore).toBeDefined()
      expect(explanation.factors).toBeDefined()
      expect(explanation.factors.skills).toBeDefined()
      expect(explanation.factors.location).toBeDefined()
      expect(explanation.factors.stipend).toBeDefined()
    })
  })
})
