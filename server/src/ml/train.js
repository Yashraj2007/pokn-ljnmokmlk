const tf = require("@tensorflow/tfjs")
const logger = require("../logger/logger")
const FeatureExtractor = require("./features")
const ModelStore = require("./modelStore")
const Candidate = require("../models/Candidate")
const Internship = require("../models/Internship")
const Application = require("../models/Application")

class MLTrainer {
  constructor() {
    this.featureExtractor = new FeatureExtractor()
    this.modelStore = new ModelStore()
    this.models = {}
  }

  async trainRecommendationModel() {
    try {
      logger.info("Starting recommendation model training...")

      // Prepare training data
      const trainingData = await this.prepareRecommendationData()
      if (trainingData.length < 100) {
        logger.warn("Insufficient training data for recommendation model")
        return null
      }

      // Create and train model
      const model = this.createRecommendationModel()
      const { xs, ys } = this.prepareTrainingTensors(trainingData)

      await model.fit(xs, ys, {
        epochs: 50,
        batchSize: 32,
        validationSplit: 0.2,
        callbacks: {
          onEpochEnd: (epoch, logs) => {
            if (epoch % 10 === 0) {
              logger.info(`Epoch ${epoch}: loss = ${logs.loss.toFixed(4)}, val_loss = ${logs.val_loss.toFixed(4)}`)
            }
          },
        },
      })

      // Save model
      await this.modelStore.saveModel(model, "recommendation")
      this.models.recommendation = model

      logger.info("Recommendation model training completed")
      return model
    } catch (error) {
      logger.error("Error training recommendation model:", error)
      throw error
    }
  }

  async trainAttritionModel() {
    try {
      logger.info("Starting attrition model training...")

      // Prepare training data
      const trainingData = await this.prepareAttritionData()
      if (trainingData.length < 50) {
        logger.warn("Insufficient training data for attrition model")
        return null
      }

      // Create and train model
      const model = this.createAttritionModel()
      const { xs, ys } = this.prepareAttritionTensors(trainingData)

      await model.fit(xs, ys, {
        epochs: 30,
        batchSize: 16,
        validationSplit: 0.2,
        callbacks: {
          onEpochEnd: (epoch, logs) => {
            if (epoch % 5 === 0) {
              logger.info(`Attrition Epoch ${epoch}: loss = ${logs.loss.toFixed(4)}, accuracy = ${logs.acc.toFixed(4)}`)
            }
          },
        },
      })

      // Save model
      await this.modelStore.saveModel(model, "attrition")
      this.models.attrition = model

      logger.info("Attrition model training completed")
      return model
    } catch (error) {
      logger.error("Error training attrition model:", error)
      throw error
    }
  }

  createRecommendationModel() {
    const model = tf.sequential({
      layers: [
        tf.layers.dense({
          inputShape: [37], // Number of features
          units: 128,
          activation: "relu",
          kernelRegularizer: tf.regularizers.l2({ l2: 0.001 }),
        }),
        tf.layers.dropout({ rate: 0.3 }),
        tf.layers.dense({
          units: 64,
          activation: "relu",
          kernelRegularizer: tf.regularizers.l2({ l2: 0.001 }),
        }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({
          units: 32,
          activation: "relu",
        }),
        tf.layers.dense({
          units: 1,
          activation: "sigmoid", // Output probability of good match
        }),
      ],
    })

    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: "binaryCrossentropy",
      metrics: ["accuracy"],
    })

    return model
  }

  createAttritionModel() {
    const model = tf.sequential({
      layers: [
        tf.layers.dense({
          inputShape: [37],
          units: 64,
          activation: "relu",
        }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({
          units: 32,
          activation: "relu",
        }),
        tf.layers.dense({
          units: 1,
          activation: "sigmoid", // Output probability of dropout
        }),
      ],
    })

    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: "binaryCrossentropy",
      metrics: ["accuracy"],
    })

    return model
  }

  async prepareRecommendationData() {
    try {
      const applications = await Application.find().populate("candidateId").populate("internshipId").limit(5000)

      const trainingData = []

      for (const app of applications) {
        if (!app.candidateId || !app.internshipId) continue

        const features = this.featureExtractor.extractInteractionFeatures(app.candidateId, app.internshipId, app)

        if (features) {
          // Label: 1 for selected/shortlisted, 0 for rejected/withdrawn
          const label = ["selected", "shortlisted"].includes(app.status) ? 1 : 0
          trainingData.push({ features, label })
        }
      }

      // Add negative samples (candidates who didn't apply to certain internships)
      const candidates = await Candidate.find().limit(100)
      const internships = await Internship.find().limit(100)

      for (let i = 0; i < Math.min(candidates.length, 50); i++) {
        for (let j = 0; j < Math.min(internships.length, 20); j++) {
          const candidate = candidates[i]
          const internship = internships[j]

          // Check if they applied
          const hasApplied = await Application.findOne({
            candidateId: candidate._id,
            internshipId: internship._id,
          })

          if (!hasApplied) {
            const features = this.featureExtractor.extractInteractionFeatures(candidate, internship)

            if (features) {
              // Negative sample with some probability based on match quality
              const matchScore = features.skillMatch * 0.4 + features.locationMatch * 0.3 + features.stipendMatch * 0.3
              const label = matchScore > 0.7 ? 1 : 0
              trainingData.push({ features, label })
            }
          }
        }
      }

      logger.info(`Prepared ${trainingData.length} training samples for recommendation model`)
      return trainingData
    } catch (error) {
      logger.error("Error preparing recommendation data:", error)
      return []
    }
  }

  async prepareAttritionData() {
    try {
      const applications = await Application.find({
        status: { $in: ["selected", "rejected", "withdrawn"] },
      })
        .populate("candidateId")
        .populate("internshipId")
        .limit(2000)

      const trainingData = []

      for (const app of applications) {
        if (!app.candidateId || !app.internshipId) continue

        const features = this.featureExtractor.extractInteractionFeatures(app.candidateId, app.internshipId, app)

        if (features) {
          // Label: 1 for dropout (rejected/withdrawn), 0 for completion (selected)
          const label = ["rejected", "withdrawn"].includes(app.status) ? 1 : 0
          trainingData.push({ features, label })
        }
      }

      logger.info(`Prepared ${trainingData.length} training samples for attrition model`)
      return trainingData
    } catch (error) {
      logger.error("Error preparing attrition data:", error)
      return []
    }
  }

  prepareTrainingTensors(trainingData) {
    const features = trainingData.map((item) => this.featureExtractor.featuresToTensor(item.features))
    const labels = trainingData.map((item) => item.label)

    const xs = tf.tensor2d(features)
    const ys = tf.tensor2d(labels, [labels.length, 1])

    return { xs, ys }
  }

  prepareAttritionTensors(trainingData) {
    return this.prepareTrainingTensors(trainingData)
  }

  async loadModels() {
    try {
      this.models.recommendation = await this.modelStore.loadModel("recommendation")
      this.models.attrition = await this.modelStore.loadModel("attrition")
      logger.info("ML models loaded successfully")
    } catch (error) {
      logger.warn("Could not load existing models, will train new ones:", error.message)
    }
  }

  async predict(modelName, features) {
    try {
      const model = this.models[modelName]
      if (!model) {
        throw new Error(`Model ${modelName} not found`)
      }

      const tensorFeatures = this.featureExtractor.featuresToTensor(features)
      const prediction = model.predict(tf.tensor2d([tensorFeatures]))
      const result = await prediction.data()

      prediction.dispose()

      return result[0]
    } catch (error) {
      logger.error(`Error making prediction with ${modelName} model:`, error)
      return null
    }
  }

  async evaluateModel(modelName, testData) {
    try {
      const model = this.models[modelName]
      if (!model || !testData.length) return null

      const { xs, ys } = this.prepareTrainingTensors(testData)
      const evaluation = await model.evaluate(xs, ys)

      const loss = await evaluation[0].data()
      const accuracy = await evaluation[1].data()

      evaluation[0].dispose()
      evaluation[1].dispose()
      xs.dispose()
      ys.dispose()

      return {
        loss: loss[0],
        accuracy: accuracy[0],
      }
    } catch (error) {
      logger.error(`Error evaluating ${modelName} model:`, error)
      return null
    }
  }

  async getModelInfo() {
    const info = {}

    for (const [name, model] of Object.entries(this.models)) {
      if (model) {
        info[name] = {
          inputShape: model.inputs[0].shape,
          outputShape: model.outputs[0].shape,
          trainableParams: model.countParams(),
          layers: model.layers.length,
        }
      }
    }

    return info
  }
}

module.exports = MLTrainer
