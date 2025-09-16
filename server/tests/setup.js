const mongoose = require("mongoose")
const { MongoMemoryServer } = require("mongodb-memory-server")

let mongoServer

// Setup test database
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create()
  const mongoUri = mongoServer.getUri()

  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
})

// Clean up after each test
afterEach(async () => {
  const collections = mongoose.connection.collections
  for (const key in collections) {
    const collection = collections[key]
    await collection.deleteMany({})
  }
})

// Cleanup after all tests
afterAll(async () => {
  await mongoose.connection.dropDatabase()
  await mongoose.connection.close()
  await mongoServer.stop()
})

// Test utilities
global.createTestCandidate = (overrides = {}) => ({
  name: "Test Candidate",
  email: "test@example.com",
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

global.createTestInternship = (overrides = {}) => ({
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

global.createTestApplication = (candidateId, internshipId, overrides = {}) => ({
  candidateId,
  internshipId,
  status: "pending",
  appliedAt: new Date(),
  ...overrides,
})
