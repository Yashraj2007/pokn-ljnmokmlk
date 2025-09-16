const NotificationService = require("../../src/services/notificationService")
const EventLog = require("../../src/models/EventLog")
const jest = require("jest")

// Mock external services
jest.mock("twilio", () => ({
  __esModule: true,
  default: jest.fn(() => ({
    messages: {
      create: jest.fn().mockResolvedValue({ sid: "test-sid" }),
    },
  })),
}))

jest.mock("googleapis", () => ({
  google: {
    auth: {
      GoogleAuth: jest.fn(),
    },
    sheets: jest.fn(() => ({
      spreadsheets: {
        values: {
          append: jest.fn().mockResolvedValue({
            data: { updates: { updatedRows: 1 } },
          }),
        },
      },
    })),
  },
}))

const axios = require("axios")

describe("NotificationService", () => {
  let notificationService
  let mockCandidate
  let mockInternship
  let mockApplication

  beforeEach(() => {
    notificationService = new NotificationService()

    mockCandidate = {
      _id: "candidate123",
      name: "Test Candidate",
      email: "test@example.com",
      phone: "+919999999999",
      preferences: { notifications: { sms: true } },
    }

    mockInternship = {
      _id: "internship123",
      title: "Test Internship",
      companyName: "Test Company",
      location: "Mumbai",
      stipend: 25000,
    }

    mockApplication = {
      _id: "application123",
      status: "pending",
      appliedAt: new Date(),
    }
  })

  describe("sendSMS", () => {
    test("should send SMS successfully", async () => {
      const result = await notificationService.sendSMS("+919999999999", "Test message with {{name}}", { name: "John" })

      expect(result.success).toBe(true)
      expect(result.sid).toBe("test-sid")
    })

    test("should handle SMS sending failure", async () => {
      const twilio = require("twilio")
      twilio().messages.create.mockRejectedValueOnce(new Error("SMS failed"))

      const result = await notificationService.sendSMS("+919999999999", "Test message")

      expect(result.success).toBe(false)
      expect(result.error).toBe("SMS failed")
    })
  })

  describe("notifyApplicationStatus", () => {
    test("should send application status notification", async () => {
      await notificationService.notifyApplicationStatus(mockApplication, mockCandidate, mockInternship)

      // Verify event log was created
      const eventLog = await EventLog.findOne({
        type: "notification_sent",
        entityId: mockApplication._id,
      })

      expect(eventLog).toBeTruthy()
      expect(eventLog.data.candidateId).toBe(mockCandidate._id)
    })
  })

  describe("triggerN8nWorkflow", () => {
    test("should trigger n8n workflow successfully", async () => {
      axios.post.mockResolvedValueOnce({
        data: { success: true, workflowId: "workflow123" },
      })

      const result = await notificationService.triggerN8nWorkflow("test_workflow", {
        testData: "value",
      })

      expect(result.success).toBe(true)
      expect(axios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          workflowType: "test_workflow",
          data: { testData: "value" },
        }),
        expect.any(Object),
      )
    })

    test("should handle n8n workflow failure", async () => {
      axios.post.mockRejectedValueOnce(new Error("Network error"))

      const result = await notificationService.triggerN8nWorkflow("test_workflow", {})

      expect(result.success).toBe(false)
      expect(result.error).toBe("Network error")
    })
  })

  describe("updateGoogleSheet", () => {
    test("should update Google Sheets successfully", async () => {
      const result = await notificationService.updateGoogleSheet({
        applicationId: "app123",
        candidateName: "Test Candidate",
        candidateEmail: "test@example.com",
      })

      expect(result.success).toBe(true)
      expect(result.updatedRows).toBe(1)
    })
  })

  describe("getNotificationStats", () => {
    beforeEach(async () => {
      // Create test event logs
      await EventLog.create([
        {
          type: "notification_sent",
          data: { notificationType: "sms", success: true },
          createdAt: new Date(),
        },
        {
          type: "notification_sent",
          data: { notificationType: "email", success: true },
          createdAt: new Date(),
        },
      ])
    })

    test("should return notification statistics", async () => {
      const startDate = new Date(Date.now() - 24 * 60 * 60 * 1000)
      const endDate = new Date()

      const stats = await notificationService.getNotificationStats(startDate.toISOString(), endDate.toISOString())

      expect(Array.isArray(stats)).toBe(true)
      expect(stats.length).toBeGreaterThan(0)
    })
  })
})
