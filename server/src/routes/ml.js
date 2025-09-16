const express = require("express")
const router = express.Router()
const MLTrainer = require("../ml/train")
const FeatureExtractor = require("../ml/features")
const { authMiddleware, adminAuth } = require("../middlewares/authMiddleware");
const logger = require("../logger/logger")

const mlTrainer = new MLTrainer()
const featureExtractor = new FeatureExtractor()

// Initialize ML models on startup
mlTrainer.loadModels().catch((err) => {
  logger.warn("Could not load existing ML models:", err.message)
})

// Admin routes for ML management
router.post("/train/recommendation", authMiddleware, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" })
    }

    logger.info("Starting recommendation model training...")
    const model = await mlTrainer.trainRecommendationModel()

    if (!model) {
      return res.status(400).json({
        error: "Insufficient training data",
        message: "Need at least 100 application records to train the model",
      })
    }

    res.json({
      success: true,
      message: "Recommendation model trained successfully",
      modelInfo: await mlTrainer.getModelInfo(),
    })
  } catch (error) {
    logger.error("Error training recommendation model:", error)
    res.status(500).json({ error: "Failed to train recommendation model" })
  }
})

router.post("/train/attrition", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" })
    }

    logger.info("Starting attrition model training...")
    const model = await mlTrainer.trainAttritionModel()

    if (!model) {
      return res.status(400).json({
        error: "Insufficient training data",
        message: "Need at least 50 completed application records to train the model",
      })
    }

    res.json({
      success: true,
      message: "Attrition model trained successfully",
      modelInfo: await mlTrainer.getModelInfo(),
    })
  } catch (error) {
    logger.error("Error training attrition model:", error)
    res.status(500).json({ error: "Failed to train attrition model" })
  }
})

// Prediction endpoints
router.post("/predict/match", authMiddleware, async (req, res) => {
  try {
    const { candidateId, internshipId } = req.body

    if (!candidateId || !internshipId) {
      return res.status(400).json({ error: "candidateId and internshipId are required" })
    }

    const Candidate = require("../models/Candidate")
    const Internship = require("../models/Internship")

    const candidate = await Candidate.findById(candidateId)
    const internship = await Internship.findById(internshipId)

    if (!candidate || !internship) {
      return res.status(404).json({ error: "Candidate or internship not found" })
    }

    const features = featureExtractor.extractInteractionFeatures(candidate, internship)
    if (!features) {
      return res.status(400).json({ error: "Could not extract features" })
    }

    const matchProbability = await mlTrainer.predict("recommendation", features)
    const attritionProbability = await mlTrainer.predict("attrition", features)

    res.json({
      candidateId,
      internshipId,
      predictions: {
        matchProbability: matchProbability || 0.5,
        attritionProbability: attritionProbability || 0.3,
        riskLevel: attritionProbability > 0.7 ? "high" : attritionProbability > 0.4 ? "medium" : "low",
      },
      features: {
        skillMatch: features.skillMatch,
        locationMatch: features.locationMatch,
        stipendMatch: features.stipendMatch,
        profileCompleteness: features.profileCompleteness,
      },
    })
  } catch (error) {
    logger.error("Error making ML prediction:", error)
    res.status(500).json({ error: "Failed to make prediction" })
  }
})

// Batch prediction for multiple candidates
router.post("/predict/batch", authMiddleware, async (req, res) => {
  try {
    const { internshipId, candidateIds } = req.body

    if (!internshipId || !Array.isArray(candidateIds)) {
      return res.status(400).json({ error: "internshipId and candidateIds array are required" })
    }

    const Candidate = require("../models/Candidate")
    const Internship = require("../models/Internship")

    const internship = await Internship.findById(internshipId)
    if (!internship) {
      return res.status(404).json({ error: "Internship not found" })
    }

    const candidates = await Candidate.find({ _id: { $in: candidateIds } })
    const predictions = []

    for (const candidate of candidates) {
      const features = featureExtractor.extractInteractionFeatures(candidate, internship)
      if (features) {
        const matchProbability = await mlTrainer.predict("recommendation", features)
        const attritionProbability = await mlTrainer.predict("attrition", features)

        predictions.push({
          candidateId: candidate._id,
          candidateName: candidate.name,
          matchProbability: matchProbability || 0.5,
          attritionProbability: attritionProbability || 0.3,
          riskLevel: attritionProbability > 0.7 ? "high" : attritionProbability > 0.4 ? "medium" : "low",
          skillMatch: features.skillMatch,
          locationMatch: features.locationMatch,
        })
      }
    }

    // Sort by match probability
    predictions.sort((a, b) => b.matchProbability - a.matchProbability)

    res.json({
      internshipId,
      totalCandidates: predictions.length,
      predictions,
    })
  } catch (error) {
    logger.error("Error making batch predictions:", error)
    res.status(500).json({ error: "Failed to make batch predictions" })
  }
})

// Model management endpoints
router.get("/models", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" })
    }

    const modelInfo = await mlTrainer.getModelInfo()
    const modelList = await mlTrainer.modelStore.listModels()

    res.json({
      loadedModels: modelInfo,
      availableModels: modelList,
    })
  } catch (error) {
    logger.error("Error getting model information:", error)
    res.status(500).json({ error: "Failed to get model information" })
  }
})

router.delete("/models/:modelName", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" })
    }

    const { modelName } = req.params
    await mlTrainer.modelStore.deleteModel(modelName)

    // Remove from memory
    delete mlTrainer.models[modelName]

    res.json({
      success: true,
      message: `Model ${modelName} deleted successfully`,
    })
  } catch (error) {
    logger.error("Error deleting model:", error)
    res.status(500).json({ error: "Failed to delete model" })
  }
})

// Model evaluation endpoint
router.post("/evaluate/:modelName", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" })
    }

    const { modelName } = req.params

    // Prepare test data (similar to training data preparation)
    let testData = []
    if (modelName === "recommendation") {
      testData = await mlTrainer.prepareRecommendationData()
    } else if (modelName === "attrition") {
      testData = await mlTrainer.prepareAttritionData()
    }

    // Use last 20% as test data
    const testSize = Math.floor(testData.length * 0.2)
    const testSet = testData.slice(-testSize)

    const evaluation = await mlTrainer.evaluateModel(modelName, testSet)

    res.json({
      modelName,
      testSamples: testSet.length,
      evaluation,
    })
  } catch (error) {
    logger.error("Error evaluating model:", error)
    res.status(500).json({ error: "Failed to evaluate model" })
  }
})

module.exports = router
