const cron = require("node-cron")
const MLTrainer = require("../ml/train")
const logger = require("../logger/logger")
const config = require("../config")

class MLScheduler {
  constructor() {
    this.mlTrainer = new MLTrainer()
    this.isTraining = false
  }

  start() {
    // Retrain models weekly on Sundays at 2 AM
    cron.schedule("0 2 * * 0", async () => {
      await this.retrainModels()
    })

    // Daily model performance check at 1 AM
    cron.schedule("0 1 * * *", async () => {
      await this.checkModelPerformance()
    })

    logger.info("ML scheduler started")
  }

  async retrainModels() {
    if (this.isTraining) {
      logger.warn("Model training already in progress, skipping scheduled retrain")
      return
    }

    try {
      this.isTraining = true
      logger.info("Starting scheduled model retraining...")

      // Load existing models first
      await this.mlTrainer.loadModels()

      // Retrain recommendation model
      try {
        await this.mlTrainer.trainRecommendationModel()
        logger.info("Recommendation model retrained successfully")
      } catch (error) {
        logger.error("Failed to retrain recommendation model:", error)
      }

      // Retrain attrition model
      try {
        await this.mlTrainer.trainAttritionModel()
        logger.info("Attrition model retrained successfully")
      } catch (error) {
        logger.error("Failed to retrain attrition model:", error)
      }

      logger.info("Scheduled model retraining completed")
    } catch (error) {
      logger.error("Error during scheduled model retraining:", error)
    } finally {
      this.isTraining = false
    }
  }

  async checkModelPerformance() {
    try {
      logger.info("Checking model performance...")

      const Application = require("../models/Application")

      // Check recent application data for model drift
      const recentApplications = await Application.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      })

      const threshold = Number.parseInt(config.RETRAIN_THRESHOLD) || 100

      if (recentApplications >= threshold) {
        logger.info(`Found ${recentApplications} new applications, triggering model retrain`)
        await this.retrainModels()
      } else {
        logger.info(`Only ${recentApplications} new applications, no retrain needed`)
      }

      // Log model info
      const modelInfo = await this.mlTrainer.getModelInfo()
      logger.info("Current model status:", modelInfo)
    } catch (error) {
      logger.error("Error checking model performance:", error)
    }
  }

  async forceRetrain() {
    logger.info("Force retraining models...")
    await this.retrainModels()
  }

  getStatus() {
    return {
      isTraining: this.isTraining,
      lastCheck: new Date().toISOString(),
    }
  }
}

module.exports = MLScheduler
