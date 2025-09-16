// const express = require("express")
// const router = express.Router()
// const NotificationService = require("../services/notificationService")
// const { authMiddleware, adminAuth } = require("../middlewares/authMiddleware");
// const logger = require("../logger/logger")

// const notificationService = new NotificationService()

// // Send manual SMS notification
// router.post("/sms/send", authMiddleware, async (req, res) => {
//   try {
//     if (req.user.role !== "admin") {
//       return res.status(403).json({ error: "Admin access required" })
//     }

//     const { to, message, templateData } = req.body

//     if (!to || !message) {
//       return res.status(400).json({ error: "Phone number and message are required" })
//     }

//     const result = await notificationService.sendSMS(to, message, templateData)

//     if (result.success) {
//       res.json({
//         success: true,
//         message: "SMS sent successfully",
//         sid: result.sid,
//       })
//     } else {
//       res.status(400).json({
//         success: false,
//         error: result.error,
//       })
//     }
//   } catch (error) {
//     logger.error("Error sending SMS:", error)
//     res.status(500).json({ error: "Failed to send SMS" })
//   }
// })

// // Send bulk SMS notifications
// router.post("/sms/bulk", authMiddleware, async (req, res) => {
//   try {
//     if (req.user.role !== "admin") {
//       return res.status(403).json({ error: "Admin access required" })
//     }

//     const { recipients, message, templateData } = req.body

//     if (!Array.isArray(recipients) || !message) {
//       return res.status(400).json({ error: "Recipients array and message are required" })
//     }

//     const results = await notificationService.sendBulkSMS(recipients, message, templateData)

//     const successCount = results.filter((r) => r.success).length
//     const failureCount = results.length - successCount

//     res.json({
//       success: true,
//       message: `Bulk SMS completed: ${successCount} sent, ${failureCount} failed`,
//       results,
//       summary: {
//         total: results.length,
//         successful: successCount,
//         failed: failureCount,
//       },
//     })
//   } catch (error) {
//     logger.error("Error sending bulk SMS:", error)
//     res.status(500).json({ error: "Failed to send bulk SMS" })
//   }
// })

// // Trigger n8n workflow manually
// router.post("/n8n/trigger", authMiddleware, async (req, res) => {
//   try {
//     if (req.user.role !== "admin") {
//       return res.status(403).json({ error: "Admin access required" })
//     }

//     const { workflowType, data } = req.body

//     if (!workflowType) {
//       return res.status(400).json({ error: "workflowType is required" })
//     }

//     const result = await notificationService.triggerN8nWorkflow(workflowType, data)

//     if (result.success) {
//       res.json({
//         success: true,
//         message: "n8n workflow triggered successfully",
//         response: result.response,
//       })
//     } else {
//       res.status(400).json({
//         success: false,
//         error: result.error,
//       })
//     }
//   } catch (error) {
//     logger.error("Error triggering n8n workflow:", error)
//     res.status(500).json({ error: "Failed to trigger n8n workflow" })
//   }
// })

// // Update Google Sheets manually
// router.post("/sheets/update", authMiddleware, async (req, res) => {
//   try {
//     if (req.user.role !== "admin") {
//       return res.status(403).json({ error: "Admin access required" })
//     }

//     const { data, sheetName } = req.body

//     if (!data) {
//       return res.status(400).json({ error: "Data is required" })
//     }

//     const result = await notificationService.updateGoogleSheet(data, sheetName)

//     if (result.success) {
//       res.json({
//         success: true,
//         message: "Google Sheets updated successfully",
//         updatedRows: result.updatedRows,
//       })
//     } else {
//       res.status(400).json({
//         success: false,
//         error: result.error,
//       })
//     }
//   } catch (error) {
//     logger.error("Error updating Google Sheets:", error)
//     res.status(500).json({ error: "Failed to update Google Sheets" })
//   }
// })

// // Get notification statistics
// router.get("/stats", authMiddleware, async (req, res) => {
//   try {
//     if (req.user.role !== "admin") {
//       return res.status(403).json({ error: "Admin access required" })
//     }

//     const { startDate, endDate } = req.query

//     if (!startDate || !endDate) {
//       return res.status(400).json({ error: "startDate and endDate are required" })
//     }

//     const stats = await notificationService.getNotificationStats(startDate, endDate)

//     res.json({
//       success: true,
//       period: { startDate, endDate },
//       stats,
//     })
//   } catch (error) {
//     logger.error("Error getting notification stats:", error)
//     res.status(500).json({ error: "Failed to get notification stats" })
//   }
// })

// // Test notification services
// router.post("/test", authMiddleware, async (req, res) => {
//   try {
//     if (req.user.role !== "admin") {
//       return res.status(403).json({ error: "Admin access required" })
//     }

//     const { service, testData } = req.body
//     const results = {}

//     if (service === "sms" || service === "all") {
//       const testPhone = testData?.phone || "+919999999999"
//       const smsResult = await notificationService.sendSMS(
//         testPhone,
//         "Test SMS from PMIS SmartMatch+ system. Time: {{timestamp}}",
//         { timestamp: new Date().toISOString() },
//       )
//       results.sms = smsResult
//     }

//     if (service === "n8n" || service === "all") {
//       const n8nResult = await notificationService.triggerN8nWorkflow("test", {
//         message: "Test workflow trigger",
//         timestamp: new Date().toISOString(),
//       })
//       results.n8n = n8nResult
//     }

//     if (service === "sheets" || service === "all") {
//       const sheetsResult = await notificationService.updateGoogleSheet(
//         {
//           applicationId: "TEST-" + Date.now(),
//           candidateName: "Test Candidate",
//           candidateEmail: "test@example.com",
//           candidatePhone: "+919999999999",
//           internshipTitle: "Test Internship",
//           companyName: "Test Company",
//           status: "test",
//           appliedAt: new Date().toISOString(),
//           stipend: "10000",
//           location: "Test Location",
//         },
//         "Test_Data",
//       )
//       results.sheets = sheetsResult
//     }

//     res.json({
//       success: true,
//       message: "Notification services tested",
//       results,
//     })
//   } catch (error) {
//     logger.error("Error testing notification services:", error)
//     res.status(500).json({ error: "Failed to test notification services" })
//   }
// })

// module.exports = router

const express = require("express");
const router = express.Router();
const NotificationService = require("../services/notificationService");
const { authMiddleware } = require("../middlewares/authMiddleware");
const logger = require("../logger/logger");

// Initialize notification service
const notificationService = new NotificationService();

/**
 * Send manual SMS notification
 * POST /api/notifications/sms/send
 */
router.post("/sms/send", authMiddleware, async (req, res) => {
  try {
    // Check admin privileges
    if (req.user.role !== "admin") {
      return res.status(403).json({ 
        success: false,
        error: "Admin access required" 
      });
    }

    const { to, message, templateData } = req.body;

    // Validate required fields
    if (!to || !message) {
      return res.status(400).json({ 
        success: false,
        error: "Phone number and message are required" 
      });
    }

    // Send SMS
    const result = await notificationService.sendSMS(to, message, templateData);

    if (result.success) {
      logger.info(`SMS sent successfully to ${to}`, { sid: result.sid });
      res.json({
        success: true,
        message: "SMS sent successfully",
        sid: result.sid,
      });
    } else {
      logger.warn(`SMS failed to ${to}`, { error: result.error });
      res.status(400).json({
        success: false,
        error: result.error,
      });
    }
  } catch (error) {
    logger.error("Error sending SMS:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to send SMS" 
    });
  }
});

/**
 * Send bulk SMS notifications
 * POST /api/notifications/sms/bulk
 */
router.post("/sms/bulk", authMiddleware, async (req, res) => {
  try {
    // Check admin privileges
    if (req.user.role !== "admin") {
      return res.status(403).json({ 
        success: false,
        error: "Admin access required" 
      });
    }

    const { recipients, message, templateData } = req.body;

    // Validate required fields
    if (!Array.isArray(recipients) || !message) {
      return res.status(400).json({ 
        success: false,
        error: "Recipients array and message are required" 
      });
    }

    if (recipients.length === 0) {
      return res.status(400).json({ 
        success: false,
        error: "Recipients array cannot be empty" 
      });
    }

    // Send bulk SMS
    const results = await notificationService.sendBulkSMS(recipients, message, templateData);

    const successCount = results.filter((r) => r.success).length;
    const failureCount = results.length - successCount;

    logger.info(`Bulk SMS completed: ${successCount} sent, ${failureCount} failed`);

    res.json({
      success: true,
      message: `Bulk SMS completed: ${successCount} sent, ${failureCount} failed`,
      results,
      summary: {
        total: results.length,
        successful: successCount,
        failed: failureCount,
      },
    });
  } catch (error) {
    logger.error("Error sending bulk SMS:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to send bulk SMS" 
    });
  }
});

/**
 * Trigger n8n workflow manually
 * POST /api/notifications/n8n/trigger
 */
router.post("/n8n/trigger", authMiddleware, async (req, res) => {
  try {
    // Check admin privileges
    if (req.user.role !== "admin") {
      return res.status(403).json({ 
        success: false,
        error: "Admin access required" 
      });
    }

    const { workflowType, data } = req.body;

    // Validate required fields
    if (!workflowType) {
      return res.status(400).json({ 
        success: false,
        error: "workflowType is required" 
      });
    }

    // Trigger n8n workflow
    const result = await notificationService.triggerN8nWorkflow(workflowType, data);

    if (result.success) {
      logger.info(`n8n workflow '${workflowType}' triggered successfully`);
      res.json({
        success: true,
        message: "n8n workflow triggered successfully",
        response: result.response,
      });
    } else {
      logger.warn(`n8n workflow '${workflowType}' failed`, { error: result.error });
      res.status(400).json({
        success: false,
        error: result.error,
      });
    }
  } catch (error) {
    logger.error("Error triggering n8n workflow:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to trigger n8n workflow" 
    });
  }
});

/**
 * Update Google Sheets manually
 * POST /api/notifications/sheets/update
 */
router.post("/sheets/update", authMiddleware, async (req, res) => {
  try {
    // Check admin privileges
    if (req.user.role !== "admin") {
      return res.status(403).json({ 
        success: false,
        error: "Admin access required" 
      });
    }

    const { data, sheetName } = req.body;

    // Validate required fields
    if (!data) {
      return res.status(400).json({ 
        success: false,
        error: "Data is required" 
      });
    }

    // Update Google Sheet
    const result = await notificationService.updateGoogleSheet(data, sheetName);

    if (result.success) {
      logger.info(`Google Sheet '${sheetName || 'Default'}' updated successfully`);
      res.json({
        success: true,
        message: "Google Sheets updated successfully",
        updatedRows: result.updatedRows,
        sheetName: result.sheetName,
      });
    } else {
      logger.warn(`Google Sheets update failed`, { error: result.error });
      res.status(400).json({
        success: false,
        error: result.error,
      });
    }
  } catch (error) {
    logger.error("Error updating Google Sheets:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to update Google Sheets" 
    });
  }
});

/**
 * Get notification statistics
 * GET /api/notifications/stats?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
 */
router.get("/stats", authMiddleware, async (req, res) => {
  try {
    // Check admin privileges
    if (req.user.role !== "admin") {
      return res.status(403).json({ 
        success: false,
        error: "Admin access required" 
      });
    }

    const { startDate, endDate } = req.query;

    // Validate required query parameters
    if (!startDate || !endDate) {
      return res.status(400).json({ 
        success: false,
        error: "startDate and endDate query parameters are required (format: YYYY-MM-DD)" 
      });
    }

    // Validate date format
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);

    if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
      return res.status(400).json({ 
        success: false,
        error: "Invalid date format. Use YYYY-MM-DD format" 
      });
    }

    if (startDateObj > endDateObj) {
      return res.status(400).json({ 
        success: false,
        error: "startDate cannot be after endDate" 
      });
    }

    // Get notification statistics
    const stats = await notificationService.getNotificationStats(startDate, endDate);

    logger.info(`Notification stats retrieved for period ${startDate} to ${endDate}`);

    res.json({
      success: true,
      period: { startDate, endDate },
      stats,
    });
  } catch (error) {
    logger.error("Error getting notification stats:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to get notification stats" 
    });
  }
});

/**
 * Test notification services
 * POST /api/notifications/test
 */
router.post("/test", authMiddleware, async (req, res) => {
  try {
    // Check admin privileges
    if (req.user.role !== "admin") {
      return res.status(403).json({ 
        success: false,
        error: "Admin access required" 
      });
    }

    const { service, testData } = req.body;
    const results = {};

    // Validate service parameter
    const validServices = ["sms", "n8n", "sheets", "all"];
    if (service && !validServices.includes(service)) {
      return res.status(400).json({ 
        success: false,
        error: `Invalid service. Must be one of: ${validServices.join(", ")}` 
      });
    }

    const serviceToTest = service || "all";

    // Test SMS service
    if (serviceToTest === "sms" || serviceToTest === "all") {
      try {
        const testPhone = testData?.phone || "+919999999999";
        const smsResult = await notificationService.sendSMS(
          testPhone,
          "Test SMS from PMIS SmartMatch+ system. Time: {{timestamp}}",
          { timestamp: new Date().toISOString() }
        );
        results.sms = smsResult;
        logger.info(`SMS service test completed for ${testPhone}`);
      } catch (error) {
        results.sms = { success: false, error: error.message };
        logger.error("SMS service test failed:", error);
      }
    }

    // Test n8n service
    if (serviceToTest === "n8n" || serviceToTest === "all") {
      try {
        const n8nResult = await notificationService.triggerN8nWorkflow("test", {
          message: "Test workflow trigger",
          timestamp: new Date().toISOString(),
        });
        results.n8n = n8nResult;
        logger.info("n8n service test completed");
      } catch (error) {
        results.n8n = { success: false, error: error.message };
        logger.error("n8n service test failed:", error);
      }
    }

    // Test Google Sheets service
    if (serviceToTest === "sheets" || serviceToTest === "all") {
      try {
        const sheetsResult = await notificationService.updateGoogleSheet(
          {
            applicationId: "TEST-" + Date.now(),
            candidateName: "Test Candidate",
            candidateEmail: "test@example.com",
            candidatePhone: "+919999999999",
            internshipTitle: "Test Internship",
            companyName: "Test Company",
            status: "test",
            appliedAt: new Date().toISOString(),
            stipend: "10000",
            location: "Test Location",
          },
          "Test_Data"
        );
        results.sheets = sheetsResult;
        logger.info("Google Sheets service test completed");
      } catch (error) {
        results.sheets = { success: false, error: error.message };
        logger.error("Google Sheets service test failed:", error);
      }
    }

    // Calculate overall success
    const allResults = Object.values(results);
    const successfulTests = allResults.filter(r => r.success).length;
    const totalTests = allResults.length;

    logger.info(`Notification services test completed: ${successfulTests}/${totalTests} successful`);

    res.json({
      success: true,
      message: `Notification services tested: ${successfulTests}/${totalTests} successful`,
      testSummary: {
        total: totalTests,
        successful: successfulTests,
        failed: totalTests - successfulTests,
      },
      results,
    });
  } catch (error) {
    logger.error("Error testing notification services:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to test notification services" 
    });
  }
});

/**
 * Health check for notification service
 * GET /api/notifications/health
 */
router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Notification service is healthy",
    timestamp: new Date().toISOString(),
    services: {
      sms: "ready",
      n8n: "ready", 
      sheets: "ready"
    }
  });
});

module.exports = router;
