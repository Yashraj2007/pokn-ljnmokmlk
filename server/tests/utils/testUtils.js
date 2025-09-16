const mongoose = require("mongoose")
const expect = require("expect") // Import expect

// Test data generators
const createTestCandidate = (overrides = {}) => ({
  name: "Test Candidate",
  email: `test${Date.now()}@example.com`,
  phone: "+919999999999",
  location: "Mumbai",
  education: "Bachelor",
  cgpa: 8.5,
  skills: ["JavaScript", "React", "Node.js"],
  dateOfBirth: new Date("2000-01-01"),
  gender: "Male",
  preferences: {
    sectors: ["Technology"],
    stipendRange: { min: 10000, max: 50000 },
    remoteWork: false,
    notifications: { sms: true, email: true },
  },
  ...overrides,
})

const createTestInternship = (overrides = {}) => ({
  title: "Software Development Intern",
  companyName: "Test Company",
  location: "Mumbai",
  stipend: 25000,
  duration: 3,
  requiredSkills: ["JavaScript", "React"],
  sector: "Technology",
  companySize: "Medium (201-1000)",
  benefits: ["Certificate", "Flexible Hours"],
  description: "Test internship description",
  requirements: "Test requirements",
  applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  ...overrides,
})

const createTestApplication = (candidateId, internshipId, overrides = {}) => ({
  candidateId,
  internshipId,
  status: "pending",
  appliedAt: new Date(),
  ...overrides,
})

// Test database helpers
const clearDatabase = async () => {
  const collections = mongoose.connection.collections
  for (const key in collections) {
    const collection = collections[key]
    await collection.deleteMany({})
  }
}

const createTestUser = (role = "candidate") => ({
  id: `test-user-${Date.now()}`,
  role,
  email: `testuser${Date.now()}@example.com`,
})

// Mock data generators
const generateMockCandidates = (count = 10) => {
  const candidates = []
  const skills = [
    ["JavaScript", "React", "Node.js"],
    ["Python", "Django", "PostgreSQL"],
    ["Java", "Spring", "MySQL"],
    ["PHP", "Laravel", "MongoDB"],
    ["C#", ".NET", "SQL Server"],
  ]

  const locations = ["Mumbai", "Delhi", "Bangalore", "Chennai", "Pune"]
  const sectors = ["Technology", "Finance", "Healthcare", "Education"]

  for (let i = 0; i < count; i++) {
    candidates.push(
      createTestCandidate({
        name: `Test Candidate ${i + 1}`,
        email: `candidate${i + 1}@example.com`,
        skills: skills[i % skills.length],
        location: locations[i % locations.length],
        preferences: {
          sectors: [sectors[i % sectors.length]],
          stipendRange: { min: 15000 + i * 1000, max: 35000 + i * 1000 },
        },
      }),
    )
  }

  return candidates
}

const generateMockInternships = (count = 10) => {
  const internships = []
  const titles = [
    "Software Development Intern",
    "Data Science Intern",
    "Marketing Intern",
    "Finance Intern",
    "Design Intern",
  ]

  const companies = ["TechCorp", "DataSoft", "MarketPro", "FinanceHub", "DesignStudio"]
  const locations = ["Mumbai", "Delhi", "Bangalore", "Chennai", "Pune"]

  for (let i = 0; i < count; i++) {
    internships.push(
      createTestInternship({
        title: titles[i % titles.length],
        companyName: companies[i % companies.length],
        location: locations[i % locations.length],
        stipend: 20000 + i * 2000,
        requiredSkills: ["JavaScript", "React"].concat(i % 2 === 0 ? ["Node.js"] : ["Python"]),
      }),
    )
  }

  return internships
}

// API test helpers
const makeAuthenticatedRequest = (app, method, url, data = {}, user = null) => {
  const request = require("supertest")(app)[method](url)

  if (user) {
    request.set("x-dev-user", JSON.stringify(user))
  }

  if (data && (method === "post" || method === "put")) {
    request.send(data)
  }

  return request
}

const expectValidationError = (response, field) => {
  expect(response.status).toBe(400)
  expect(response.body.success).toBe(false)
  expect(response.body.error).toContain("validation")
  if (field) {
    expect(response.body.error).toContain(field)
  }
}

const expectNotFoundError = (response) => {
  expect(response.status).toBe(404)
  expect(response.body.success).toBe(false)
}

const expectUnauthorizedError = (response) => {
  expect(response.status).toBe(401)
  expect(response.body.success).toBe(false)
}

const expectForbiddenError = (response) => {
  expect(response.status).toBe(403)
  expect(response.body.success).toBe(false)
}

module.exports = {
  createTestCandidate,
  createTestInternship,
  createTestApplication,
  clearDatabase,
  createTestUser,
  generateMockCandidates,
  generateMockInternships,
  makeAuthenticatedRequest,
  expectValidationError,
  expectNotFoundError,
  expectUnauthorizedError,
  expectForbiddenError,
}
