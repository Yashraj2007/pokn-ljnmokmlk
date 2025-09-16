const Candidate = require("../../src/models/Candidate")
const createTestCandidate = require("./utils/createTestCandidate") // Assuming createTestCandidate is defined in a utils file

describe("Candidate Model", () => {
  describe("Validation", () => {
    test("should create a valid candidate", async () => {
      const candidateData = createTestCandidate()
      const candidate = new Candidate(candidateData)
      const savedCandidate = await candidate.save()

      expect(savedCandidate._id).toBeDefined()
      expect(savedCandidate.name).toBe(candidateData.name)
      expect(savedCandidate.email).toBe(candidateData.email)
    })

    test("should require name field", async () => {
      const candidateData = createTestCandidate({ name: undefined })
      const candidate = new Candidate(candidateData)

      await expect(candidate.save()).rejects.toThrow("Path `name` is required")
    })

    test("should require valid email format", async () => {
      const candidateData = createTestCandidate({ email: "invalid-email" })
      const candidate = new Candidate(candidateData)

      await expect(candidate.save()).rejects.toThrow()
    })

    test("should require unique email", async () => {
      const candidateData = createTestCandidate()
      await new Candidate(candidateData).save()

      const duplicateCandidate = new Candidate(candidateData)
      await expect(duplicateCandidate.save()).rejects.toThrow()
    })

    test("should validate CGPA range", async () => {
      const candidateData = createTestCandidate({ cgpa: 11 })
      const candidate = new Candidate(candidateData)

      await expect(candidate.save()).rejects.toThrow()
    })
  })

  describe("Methods", () => {
    test("should calculate profile completeness", async () => {
      const candidateData = createTestCandidate()
      const candidate = new Candidate(candidateData)

      const completeness = candidate.calculateProfileCompleteness()
      expect(completeness).toBeGreaterThan(0.8)
    })

    test("should get skill categories", async () => {
      const candidateData = createTestCandidate({
        skills: ["JavaScript", "React", "Photoshop", "Digital Marketing"],
      })
      const candidate = new Candidate(candidateData)

      const categories = candidate.getSkillCategories()
      expect(categories.technical).toBeGreaterThan(0)
      expect(categories.design).toBeGreaterThan(0)
      expect(categories.marketing).toBeGreaterThan(0)
    })
  })
})
