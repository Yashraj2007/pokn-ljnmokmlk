const tf = require("@tensorflow/tfjs")
const fs = require("fs").promises
const path = require("path")
const logger = require("../logger/logger")
const config = require("../config")

class ModelStore {
  constructor() {
    this.modelPath = config.MODEL_STORAGE_PATH || "./models"
    this.ensureModelDirectory()
  }

  async ensureModelDirectory() {
    try {
      await fs.mkdir(this.modelPath, { recursive: true })
    } catch (error) {
      logger.error("Error creating model directory:", error)
    }
  }

  async saveModel(model, modelName) {
    try {
      const modelDir = path.join(this.modelPath, modelName)
      await fs.mkdir(modelDir, { recursive: true })

      const modelUrl = `file://${modelDir}`
      await model.save(modelUrl)

      // Save metadata
      const metadata = {
        name: modelName,
        savedAt: new Date().toISOString(),
        inputShape: model.inputs[0].shape,
        outputShape: model.outputs[0].shape,
        trainableParams: model.countParams(),
        layers: model.layers.length,
        version: "1.0.0",
      }

      await fs.writeFile(path.join(modelDir, "metadata.json"), JSON.stringify(metadata, null, 2))

      logger.info(`Model ${modelName} saved successfully`)
      return true
    } catch (error) {
      logger.error(`Error saving model ${modelName}:`, error)
      throw error
    }
  }

  async loadModel(modelName) {
    try {
      const modelDir = path.join(this.modelPath, modelName)
      const modelUrl = `file://${modelDir}/model.json`

      // Check if model exists
      try {
        await fs.access(path.join(modelDir, "model.json"))
      } catch {
        throw new Error(`Model ${modelName} not found`)
      }

      const model = await tf.loadLayersModel(modelUrl)
      logger.info(`Model ${modelName} loaded successfully`)
      return model
    } catch (error) {
      logger.error(`Error loading model ${modelName}:`, error)
      throw error
    }
  }

  async getModelMetadata(modelName) {
    try {
      const metadataPath = path.join(this.modelPath, modelName, "metadata.json")
      const metadataContent = await fs.readFile(metadataPath, "utf8")
      return JSON.parse(metadataContent)
    } catch (error) {
      logger.error(`Error reading metadata for model ${modelName}:`, error)
      return null
    }
  }

  async listModels() {
    try {
      const entries = await fs.readdir(this.modelPath, { withFileTypes: true })
      const models = []

      for (const entry of entries) {
        if (entry.isDirectory()) {
          const metadata = await this.getModelMetadata(entry.name)
          models.push({
            name: entry.name,
            metadata: metadata || { name: entry.name, savedAt: "Unknown" },
          })
        }
      }

      return models
    } catch (error) {
      logger.error("Error listing models:", error)
      return []
    }
  }

  async deleteModel(modelName) {
    try {
      const modelDir = path.join(this.modelPath, modelName)
      await fs.rmdir(modelDir, { recursive: true })
      logger.info(`Model ${modelName} deleted successfully`)
      return true
    } catch (error) {
      logger.error(`Error deleting model ${modelName}:`, error)
      throw error
    }
  }

  async getModelSize(modelName) {
    try {
      const modelDir = path.join(this.modelPath, modelName)
      const files = await fs.readdir(modelDir)
      let totalSize = 0

      for (const file of files) {
        const filePath = path.join(modelDir, file)
        const stats = await fs.stat(filePath)
        totalSize += stats.size
      }

      return totalSize
    } catch (error) {
      logger.error(`Error calculating size for model ${modelName}:`, error)
      return 0
    }
  }

  async backupModel(modelName) {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
      const backupName = `${modelName}_backup_${timestamp}`
      const sourcePath = path.join(this.modelPath, modelName)
      const backupPath = path.join(this.modelPath, "backups", backupName)

      await fs.mkdir(path.dirname(backupPath), { recursive: true })
      await fs.cp(sourcePath, backupPath, { recursive: true })

      logger.info(`Model ${modelName} backed up as ${backupName}`)
      return backupName
    } catch (error) {
      logger.error(`Error backing up model ${modelName}:`, error)
      throw error
    }
  }

  async restoreModel(modelName, backupName) {
    try {
      const backupPath = path.join(this.modelPath, "backups", backupName)
      const modelPath = path.join(this.modelPath, modelName)

      // Backup current model first
      await this.backupModel(modelName)

      // Restore from backup
      await fs.rmdir(modelPath, { recursive: true })
      await fs.cp(backupPath, modelPath, { recursive: true })

      logger.info(`Model ${modelName} restored from backup ${backupName}`)
      return true
    } catch (error) {
      logger.error(`Error restoring model ${modelName} from backup ${backupName}:`, error)
      throw error
    }
  }
}

module.exports = ModelStore
