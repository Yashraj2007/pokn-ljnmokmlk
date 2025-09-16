// MongoDB initialization script for PMIS SmartMatch+
// Creates indexes and initial data

// Import necessary modules
const { ObjectId } = require("mongodb")

// Switch to pmis database
const db = db.getSiblingDB("pmis")

// Create collections with validation
db.createCollection("candidates", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["mobile", "name", "education", "location"],
      properties: {
        mobile: { bsonType: "string" },
        name: { bsonType: "string" },
        education: {
          bsonType: "object",
          required: ["level", "field", "year"],
        },
        location: {
          bsonType: "object",
          required: ["type", "coordinates", "district", "state"],
        },
      },
    },
  },
})

db.createCollection("internships", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: [
        "title",
        "companyName",
        "description",
        "location",
        "stipend",
        "durationMonths",
        "requiredSkills",
        "sector",
        "expiresAt",
      ],
      properties: {
        title: { bsonType: "string" },
        companyName: { bsonType: "string" },
        stipend: { bsonType: "number", minimum: 0 },
        durationMonths: { bsonType: "number", minimum: 1, maximum: 24 },
      },
    },
  },
})

// Create indexes for better performance
print("Creating indexes...")

// Candidates indexes
db.candidates.createIndex({ mobile: 1 }, { unique: true })
db.candidates.createIndex({ location: "2dsphere" })
db.candidates.createIndex({ "skills.canonical": 1 })
db.candidates.createIndex({ createdAt: -1 })
db.candidates.createIndex({ status: 1 })
db.candidates.createIndex({ "metadata.lastActive": -1 })

// Internships indexes
db.internships.createIndex({ location: "2dsphere" })
db.internships.createIndex({ requiredSkills: 1 })
db.internships.createIndex({ sector: 1 })
db.internships.createIndex({ stipend: 1 })
db.internships.createIndex({ durationMonths: 1 })
db.internships.createIndex({ "flags.remote": 1 })
db.internships.createIndex({ "flags.beginner": 1 })
db.internships.createIndex({ status: 1, expiresAt: 1 })
db.internships.createIndex({ createdAt: -1 })
db.internships.createIndex({ companyName: 1 })

// Applications indexes
db.createCollection("applications", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["candidateId", "internshipId", "status", "appliedAt"],
      properties: {
        candidateId: { bsonType: "objectId" },
        internshipId: { bsonType: "objectId" },
        status: { bsonType: "string" },
        appliedAt: { bsonType: "date" },
      },
    },
  },
})
db.applications.createIndex({ candidateId: 1, internshipId: 1 }, { unique: true })
db.applications.createIndex({ candidateId: 1, status: 1 })
db.applications.createIndex({ internshipId: 1, status: 1 })
db.applications.createIndex({ appliedAt: -1 })
db.applications.createIndex({ status: 1, appliedAt: -1 })

// EventLogs indexes
db.createCollection("eventlogs", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["type", "eventTime", "processed", "metadata", "candidateId", "internshipId", "applicationId"],
      properties: {
        type: { bsonType: "string" },
        eventTime: { bsonType: "date" },
        processed: { bsonType: "bool" },
        metadata: {
          bsonType: "object",
          required: ["correlationId"],
        },
        candidateId: { bsonType: "objectId" },
        internshipId: { bsonType: "objectId" },
        applicationId: { bsonType: "objectId" },
      },
    },
  },
})
db.eventlogs.createIndex({ type: 1, eventTime: -1 })
db.eventlogs.createIndex({ processed: 1, type: 1 })
db.eventlogs.createIndex({ createdAt: -1 })
db.eventlogs.createIndex({ "metadata.correlationId": 1 })
db.eventlogs.createIndex({ candidateId: 1 })
db.eventlogs.createIndex({ internshipId: 1 })
db.eventlogs.createIndex({ applicationId: 1 })

// TTL index for eventlogs (expire after 2 years)
db.eventlogs.createIndex({ createdAt: 1 }, { expireAfterSeconds: 63072000 })

print("Indexes created successfully!")

// Create initial admin user (optional)
db.createCollection("users", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["email", "name", "role", "status", "createdAt", "updatedAt"],
      properties: {
        email: { bsonType: "string" },
        name: { bsonType: "string" },
        role: { bsonType: "string" },
        status: { bsonType: "string" },
        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" },
      },
    },
  },
})
db.users.insertOne({
  _id: new ObjectId(),
  email: "admin@pmis.gov.in",
  name: "PMIS Administrator",
  role: "admin",
  status: "active",
  createdAt: new Date(),
  updatedAt: new Date(),
})

print("MongoDB initialization completed!")
