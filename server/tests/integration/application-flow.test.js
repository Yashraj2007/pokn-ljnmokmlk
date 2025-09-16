const request = require("supertest")
const app = require("../../src/index")
const Candidate = require("../../src/models/Candidate")
const Internship = require("../../src/models/Internship")
const Application = require("../../src/models/Application")
const { createTestCandidate, createTestInternship } = require("../../src/utils/testUtils")

describe("Application Flow Integration", () => {
  let candidate
  let internship
  const adminToken = "admin-test-token"

  beforeEach(async () => {
    // Create test candidate
    candidate = await Candidate.create(
      createTestCandidate({
        name: "Integration Test Candidate",
        email: "integration@test.com",
        skills: ["JavaScript", "React", "Node.js"],
      }),
    )

    // Create test internship
    internship = await Internship.create(
      createTestInternship({
        title: "Integration Test Internship",
        requiredSkills: ["JavaScript", "React"],
        companyName: "Test Company",
      }),
    )
  })

  test("complete application workflow", async () => {
    // Step 1: Get recommendations for candidate
    const recommendationsResponse = await request(app)
      .get(`/api/recommendations/candidate/${candidate._id}`)
      .set("x-dev-user", JSON.stringify({ id: "test-user", role: "candidate" }))
      .expect(200)

    expect(recommendationsResponse.body.success).toBe(true)
    expect(recommendationsResponse.body.data.recommendations.length).toBeGreaterThan(0)

    // Step 2: Submit application
    const applicationResponse = await request(app)
      .post("/api/applications")
      .set("x-dev-user", JSON.stringify({ id: "test-user", role: "candidate" }))
      .send({
        candidateId: candidate._id,
        internshipId: internship._id,
        coverLetter: "Test cover letter",
      })
      .expect(201)

    expect(applicationResponse.body.success).toBe(true)
    const applicationId = applicationResponse.body.data._id

    // Step 3: Admin reviews application
    const statusUpdateResponse = await request(app)
      .put(`/api/applications/${applicationId}/status`)
      .set("x-dev-user", JSON.stringify({ id: "admin-user", role: "admin" }))
      .send({
        status: "reviewed",
        feedback: "Application looks good",
      })
      .expect(200)

    expect(statusUpdateResponse.body.success).toBe(true)
    expect(statusUpdateResponse.body.data.status).toBe("reviewed")

    // Step 4: Shortlist candidate
    await request(app)
      .put(`/api/applications/${applicationId}/status`)
      .set("x-dev-user", JSON.stringify({ id: "admin-user", role: "admin" }))
      .send({
        status: "shortlisted",
        feedback: "Candidate shortlisted for interview",
      })
      .expect(200)

    // Step 5: Verify application history
    const historyResponse = await request(app)
      .get(`/api/applications/candidate/${candidate._id}`)
      .set("x-dev-user", JSON.stringify({ id: "test-user", role: "candidate" }))
      .expect(200)

    expect(historyResponse.body.success).toBe(true)
    expect(historyResponse.body.data.length).toBe(1)
    expect(historyResponse.body.data[0].status).toBe("shortlisted")
  })

  test("ML prediction integration", async () => {
    // Create application first
    const application = await Application.create({
      candidateId: candidate._id,
      internshipId: internship._id,
      status: "pending",
    })

    // Test ML prediction
    const predictionResponse = await request(app)
      .post("/api/ml/predict/match")
      .set("x-dev-user", JSON.stringify({ id: "admin-user", role: "admin" }))
      .send({
        candidateId: candidate._id,
        internshipId: internship._id,
      })
      .expect(200)

    expect(predictionResponse.body.candidateId).toBe(candidate._id.toString())
    expect(predictionResponse.body.internshipId).toBe(internship._id.toString())
    expect(predictionResponse.body.predictions).toBeDefined()
    expect(predictionResponse.body.predictions.matchProbability).toBeDefined()
  })
})
