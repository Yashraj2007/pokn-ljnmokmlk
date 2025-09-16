const request = require("supertest")
const app = require("../../src/index")
const Candidate = require("../../src/models/Candidate")
const createTestCandidate = require("../../src/utils/createTestCandidate") // Import createTestCandidate function

describe("Candidates API", () => {
  describe("POST /api/candidates", () => {
    test("should create a new candidate", async () => {
      const candidateData = createTestCandidate()

      const response = await request(app).post("/api/candidates").send(candidateData).expect(201)

      expect(response.body.success).toBe(true)
      expect(response.body.data.name).toBe(candidateData.name)
      expect(response.body.data.email).toBe(candidateData.email)
    })

    test("should return validation error for invalid data", async () => {
      const invalidData = { name: "Test" } // Missing required fields

      const response = await request(app).post("/api/candidates").send(invalidData).expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toContain("validation")
    })
  })

  describe("GET /api/candidates", () => {
    beforeEach(async () => {
      // Create test candidates
      await Candidate.create([
        createTestCandidate({ name: "John Doe", email: "john@example.com" }),
        createTestCandidate({ name: "Jane Smith", email: "jane@example.com" }),
      ])
    })

    test("should get all candidates", async () => {
      const response = await request(app).get("/api/candidates").expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.length).toBe(2)
      expect(response.body.pagination).toBeDefined()
    })

    test("should filter candidates by skills", async () => {
      const response = await request(app).get("/api/candidates?skills=JavaScript").expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.length).toBeGreaterThan(0)
    })

    test("should paginate results", async () => {
      const response = await request(app).get("/api/candidates?page=1&limit=1").expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.length).toBe(1)
      expect(response.body.pagination.page).toBe(1)
      expect(response.body.pagination.limit).toBe(1)
    })
  })

  describe("GET /api/candidates/:id", () => {
    test("should get candidate by ID", async () => {
      const candidate = await Candidate.create(createTestCandidate())

      const response = await request(app).get(`/api/candidates/${candidate._id}`).expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data._id).toBe(candidate._id.toString())
    })

    test("should return 404 for non-existent candidate", async () => {
      const fakeId = "507f1f77bcf86cd799439011"

      const response = await request(app).get(`/api/candidates/${fakeId}`).expect(404)

      expect(response.body.success).toBe(false)
    })
  })

  describe("PUT /api/candidates/:id", () => {
    test("should update candidate", async () => {
      const candidate = await Candidate.create(createTestCandidate())
      const updateData = { name: "Updated Name" }

      const response = await request(app).put(`/api/candidates/${candidate._id}`).send(updateData).expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.name).toBe("Updated Name")
    })
  })

  describe("DELETE /api/candidates/:id", () => {
    test("should delete candidate", async () => {
      const candidate = await Candidate.create(createTestCandidate())

      const response = await request(app).delete(`/api/candidates/${candidate._id}`).expect(200)

      expect(response.body.success).toBe(true)

      // Verify deletion
      const deletedCandidate = await Candidate.findById(candidate._id)
      expect(deletedCandidate).toBeNull()
    })
  })
})
