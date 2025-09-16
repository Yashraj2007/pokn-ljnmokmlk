/**
 * Application configuration module
 * Loads and validates environment variables
 * Enhanced with authentication and security features
 */

const { z } = require("zod")
require("dotenv").config()

// Configuration schema validation with enhanced auth settings
const configSchema = z.object({
  // Server Configuration
  PORT: z.string().transform(Number).default("4000"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

  // Database Configuration
  MONGO_URI: z.string().default("mongodb://localhost:27017/pmis"),
  PG_CONN: z.string().optional(),
  REDIS_URL: z.string().optional(),

  // Authentication Configuration
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters long"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  JWT_REFRESH_SECRET: z.string().optional(),
  JWT_REFRESH_EXPIRES_IN: z.string().default("30d"),
  
  // Clerk Integration (Optional)
  CLERK_JWT_PUBLIC_KEY: z.string().optional(),
  CLERK_SECRET_KEY: z.string().optional(),

  // Authentication Features
  VALIDATE_USER_EXISTS: z.string().transform(val => val === 'true').default("false"),
  ENABLE_REFRESH_TOKENS: z.string().transform(val => val === 'true').default("true"),
  ALLOW_DEV_AUTH: z.string().transform(val => val === 'true').default("true"),
  
  // Password Security
  BCRYPT_ROUNDS: z.string().transform(Number).default("12"),
  PASSWORD_MIN_LENGTH: z.string().transform(Number).default("6"),
  
  // Session Configuration
  SESSION_TIMEOUT_HOURS: z.string().transform(Number).default("24"),
  MAX_LOGIN_ATTEMPTS: z.string().transform(Number).default("5"),
  LOCKOUT_TIME_MINUTES: z.string().transform(Number).default("15"),

  // External Services
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_FROM_NUMBER: z.string().optional(),

  // Google Services
  GOOGLE_SHEETS_CREDENTIALS_JSON: z.string().optional(),
  GOOGLE_SHEETS_SPREADSHEET_ID: z.string().optional(),

  // n8n Integration
  N8N_WEBHOOK_URL: z.string().optional(),
  N8N_WEBHOOK_SECRET: z.string().default("default_webhook_secret"),

  // ML Configuration
  MODEL_STORAGE_PATH: z.string().default("./models"),
  RETRAIN_THRESHOLD: z.string().transform(Number).default("100"),
  ENABLE_ML_FEATURES: z.string().transform(val => val === 'true').default("true"),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default("60000"),
  RATE_LIMIT_MAX: z.string().transform(Number).default("100"),
  RATE_LIMIT_AUTH_MAX: z.string().transform(Number).default("10"),

  // Security Headers
  ENABLE_HELMET: z.string().transform(val => val === 'true').default("true"),
  ENABLE_CORS: z.string().transform(val => val === 'true').default("true"),

  // CORS Configuration
  FRONTEND_URL: z.string().default("http://localhost:3000"),
  ALLOWED_ORIGINS: z.string().default("http://localhost:3000,http://localhost:5173"),

  // File Upload
  MAX_FILE_SIZE_MB: z.string().transform(Number).default("5"),
  ALLOWED_FILE_TYPES: z.string().default("pdf,doc,docx,jpg,jpeg,png"),
  UPLOAD_DIR: z.string().default("uploads"),

  // Email Configuration (Optional)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().transform(Number).optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  FROM_EMAIL: z.string().optional(),

  // Monitoring & Logging
  SENTRY_DSN: z.string().optional(),
  LOG_LEVEL: z.enum(["error", "warn", "info", "debug"]).default("info"),
  ENABLE_REQUEST_LOGGING: z.string().transform(val => val === 'true').default("true"),

  // Feature Flags
  ENABLE_NOTIFICATIONS: z.string().transform(val => val === 'true').default("true"),
  ENABLE_ANALYTICS: z.string().transform(val => val === 'true').default("true"),
  ENABLE_WEBHOOKS: z.string().transform(val => val === 'true').default("true"),
  ENABLE_API_DOCS: z.string().transform(val => val === 'true').default("true"),
})

// Parse and validate configuration
const parseConfig = () => {
  try {
    const parsed = configSchema.parse(process.env)
    
    // Additional validation for production
    if (parsed.NODE_ENV === 'production') {
      if (parsed.JWT_SECRET === 'default-secret' || parsed.JWT_SECRET.length < 64) {
        throw new Error('Production requires a strong JWT_SECRET (64+ characters)')
      }
      
      if (!parsed.MONGO_URI.includes('mongodb://') && !parsed.MONGO_URI.includes('mongodb+srv://')) {
        throw new Error('Production requires a valid MongoDB URI')
      }
    }
    
    console.log("✅ Configuration loaded successfully")
    return parsed
  } catch (error) {
    console.error("❌ Invalid configuration:")
    if (error.errors) {
      error.errors.forEach(err => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`)
      })
    } else {
      console.error(`  - ${error.message}`)
    }
    process.exit(1)
  }
}

const config = parseConfig()

// Export enhanced configuration
module.exports = {
  // Raw configuration values
  ...config,

  // Environment flags
  isDevelopment: config.NODE_ENV === "development",
  isProduction: config.NODE_ENV === "production",
  isTest: config.NODE_ENV === "test",

  // Database configurations
  mongodb: {
    uri: config.MONGO_URI,
    options: {
      maxPoolSize: config.isProduction ? 20 : 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      retryWrites: true,
      w: "majority"
    },
  },

  postgres: config.PG_CONN
    ? {
        connectionString: config.PG_CONN,
        ssl: config.isProduction ? { rejectUnauthorized: false } : false,
        max: config.isProduction ? 20 : 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      }
    : null,

  redis: config.REDIS_URL
    ? {
        url: config.REDIS_URL,
        retryDelayOnFailover: 100,
        maxRetriesPerRequest: 3,
        connectTimeout: 10000,
        lazyConnect: true,
      }
    : null,

  // Enhanced JWT configuration
  jwt: {
    secret: config.JWT_SECRET,
    expiresIn: config.JWT_EXPIRES_IN,
    refreshSecret: config.JWT_REFRESH_SECRET || config.JWT_SECRET,
    refreshExpiresIn: config.JWT_REFRESH_EXPIRES_IN,
    algorithm: 'HS256',
    issuer: 'pmis-api',
    audience: 'pmis-client'
  },

  // Authentication configuration
  auth: {
    validateUserExists: config.VALIDATE_USER_EXISTS,
    enableRefreshTokens: config.ENABLE_REFRESH_TOKENS,
    allowDevAuth: config.ALLOW_DEV_AUTH && config.isDevelopment,
    bcryptRounds: config.BCRYPT_ROUNDS,
    passwordMinLength: config.PASSWORD_MIN_LENGTH,
    sessionTimeoutHours: config.SESSION_TIMEOUT_HOURS,
    maxLoginAttempts: config.MAX_LOGIN_ATTEMPTS,
    lockoutTimeMinutes: config.LOCKOUT_TIME_MINUTES,
    clerkPublicKey: config.CLERK_JWT_PUBLIC_KEY,
    clerkSecretKey: config.CLERK_SECRET_KEY,
  },

  // Rate limiting configuration
  rateLimit: {
    windowMs: config.RATE_LIMIT_WINDOW_MS,
    max: config.RATE_LIMIT_MAX,
    authMax: config.RATE_LIMIT_AUTH_MAX,
    message: {
      success: false,
      message: "Too many requests from this IP, please try again later.",
      retryAfter: Math.ceil(config.RATE_LIMIT_WINDOW_MS / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
  },

  // CORS configuration
  cors: {
    enabled: config.ENABLE_CORS,
    origin: config.isDevelopment 
      ? ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:3000', 'http://127.0.0.1:5173']
      : config.ALLOWED_ORIGINS.split(','),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type', 
      'Authorization', 
      'x-access-token', 
      'x-dev-user',
      'x-correlation-id'
    ],
    optionsSuccessStatus: 200,
    maxAge: 86400 // 24 hours
  },

  // Security configuration
  security: {
    enableHelmet: config.ENABLE_HELMET,
    helmetOptions: {
      contentSecurityPolicy: config.isProduction,
      crossOriginEmbedderPolicy: false,
    }
  },

  // File upload configuration
  upload: {
    maxSizeMB: config.MAX_FILE_SIZE_MB,
    maxSizeBytes: config.MAX_FILE_SIZE_MB * 1024 * 1024,
    allowedTypes: config.ALLOWED_FILE_TYPES.split(','),
    uploadDir: config.UPLOAD_DIR,
    tempDir: 'temp'
  },

  // ML configuration
  ml: {
    enabled: config.ENABLE_ML_FEATURES,
    modelPath: config.MODEL_STORAGE_PATH,
    retrainThreshold: config.RETRAIN_THRESHOLD,
    features: {
      maxSkills: 50,
      maxDistance: 500, // km
      skillWeights: {
        exact: 1.0,
        fuzzy: 0.7,
        related: 0.5,
      },
      locationWeight: 0.3,
      experienceWeight: 0.4,
      skillWeight: 0.6,
    },
    tensorflow: {
      logLevel: config.isDevelopment ? 'debug' : 'warn',
      enableGPU: false, // Set to true if GPU available
    }
  },

  // Notification configuration
  notifications: {
    enabled: config.ENABLE_NOTIFICATIONS,
    twilio: {
      accountSid: config.TWILIO_ACCOUNT_SID,
      authToken: config.TWILIO_AUTH_TOKEN,
      fromNumber: config.TWILIO_FROM_NUMBER,
    },
    n8n: {
      enabled: !!config.N8N_WEBHOOK_URL,
      webhookUrl: config.N8N_WEBHOOK_URL,
      secret: config.N8N_WEBHOOK_SECRET,
      timeout: 10000,
      retries: 3,
    },
    email: {
      enabled: !!(config.SMTP_HOST && config.SMTP_USER),
      smtp: {
        host: config.SMTP_HOST,
        port: config.SMTP_PORT || 587,
        secure: config.SMTP_PORT === 465,
        auth: config.SMTP_USER ? {
          user: config.SMTP_USER,
          pass: config.SMTP_PASS,
        } : null,
      },
      from: config.FROM_EMAIL || config.SMTP_USER,
    }
  },

  // Analytics and monitoring
  monitoring: {
    sentry: {
      enabled: !!config.SENTRY_DSN,
      dsn: config.SENTRY_DSN,
      environment: config.NODE_ENV,
      tracesSampleRate: config.isProduction ? 0.1 : 1.0,
    },
    logging: {
      level: config.LOG_LEVEL,
      enableRequestLogging: config.ENABLE_REQUEST_LOGGING,
      format: config.isProduction ? 'json' : 'dev',
    }
  },

  // Feature flags
  features: {
    notifications: config.ENABLE_NOTIFICATIONS,
    analytics: config.ENABLE_ANALYTICS,
    webhooks: config.ENABLE_WEBHOOKS,
    apiDocs: config.ENABLE_API_DOCS,
    ml: config.ENABLE_ML_FEATURES,
  },

  // API configuration
  api: {
    version: 'v1',
    prefix: '/api',
    docsPath: '/docs',
    healthPath: '/health',
    timeout: 30000,
    maxBodySize: '10mb',
  },

  // Google Sheets configuration
  googleSheets: {
    enabled: !!config.GOOGLE_SHEETS_CREDENTIALS_JSON,
    credentialsJson: config.GOOGLE_SHEETS_CREDENTIALS_JSON,
    spreadsheetId: config.GOOGLE_SHEETS_SPREADSHEET_ID,
    defaultWorksheet: 'Applications',
  },
}

// Log configuration in development
if (config.isDevelopment) {
  console.log("🔧 Configuration loaded:")
  console.log(`  - Environment: ${config.NODE_ENV}`)
  console.log(`  - Port: ${config.PORT}`)
  console.log(`  - MongoDB: ${config.MONGO_URI}`)
  console.log(`  - JWT Expiry: ${config.JWT_EXPIRES_IN}`)
  console.log(`  - Dev Auth: ${config.ALLOW_DEV_AUTH ? 'Enabled' : 'Disabled'}`)
  console.log(`  - Features: ${Object.entries(module.exports.features).filter(([,v]) => v).map(([k]) => k).join(', ')}`)
}
