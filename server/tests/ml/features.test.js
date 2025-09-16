const FeatureExtractor = require("../../src/ml/features")
const Candidate = require("../../src/models/Candidate")
const Internship = require("../../src/models/Internship")
const { createTestCandidate, createTestInternship } = require("../../src/utils/testUtils")

describe("FeatureExtractor", () => {
  let featureExtractor
  let testCandidate
  let testInternship

  beforeEach(async () => {
    featureExtractor = new FeatureExtractor()

    testCandidate = await Candidate.create(createTestCandidate())
    testInternship = await Internship.create(createTestInternship())
  })

  describe("extractCandidateFeatures", () => {
    test("should extract candidate features correctly", () => {
      const features = featureExtractor.extractCandidateFeatures(testCandidate)

      expect(features).toBeDefined()
      expect(features.age).toBeDefined()
      expect(features.cgpa).toBe(testCandidate.cgpa)
      expect(features.skillCount).toBe(testCandidate.skills.length)
      expect(features.profileCompleteness).toBeGreaterThan(0)
    })

    test("should handle missing data gracefully", () => {
      const incompleteCandidate = {
        name: "Test",
        email: "test@example.com",
      }

      const features = featureExtractor.extractCandidateFeatures(incompleteCandidate)

      expect(features).toBeDefined()
      expect(features.age).toBeDefined()
      expect(features.cgpa).toBe(0)
      expect(features.skillCount).toBe(0)
    })
  })

  describe("extractInternshipFeatures", () => {
    test("should extract internship features correctly", () => {
      const features = featureExtractor.extractInternshipFeatures(testInternship)

      expect(features).toBeDefined()
      expect(features.stipend).toBe(testInternship.stipend)
      expect(features.duration).toBe(testInternship.duration)
      expect(features.requiredSkillsCount).toBe(testInternship.requiredSkills.length)
    })
  })

  describe("extractInteractionFeatures", () => {
    test("should extract interaction features correctly", () => {
      const features = featureExtractor.extractInteractionFeatures(testCandidate, testInternship)

      expect(features).toBeDefined()
      expect(features.skillMatch).toBeDefined()
      expect(features.locationMatch).toBeDefined()
      expect(features.stipendMatch).toBeDefined()
      expect(features.skillMatch).toBeGreaterThan(0)
    })
  })

  describe("featuresToTensor", () => {
    test("should convert features to tensor format", () => {
      const features = featureExtractor.extractInteractionFeatures(testCandidate, testInternship)

      const tensor = featureExtractor.featuresToTensor(features)

      expect(Array.isArray(tensor)).toBe(true)
      expect(tensor.length).toBe(37) // Expected number of features
      expect(tensor.every((val) => typeof val === "number")).toBe(true)
    })
  })
})
