/**
 * Main application entry point
 * Sets up Express server with all middleware and routes
 */

const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const compression = require("compression");
const morgan = require("morgan");
const mongoose = require("mongoose");

const config = require("./config");
const { logger } = require("./logger/logger");
const errorHandler = require("./middlewares/errorHandler");
const rateLimiter = require("./middlewares/rateLimiter");

// Import routes
const healthRoutes = require("./routes/health");
const authRoutes = require("./routes/auth");
const candidatesRoutes = require("./routes/candidates");
const internshipsRoutes = require("./routes/internships");
const recommendationsRoutes = require("./routes/recommendations");
const applicationsRoutes = require("./routes/applications");
// const adminRoutes = require("./routes/admin");
const webhooksRoutes = require("./routes/webhooks");
const notificationsRoutes = require("./routes/notifications");
const mlRoutes = require("./routes/ml");

// Create Express app
const app = express();
let server; // Declare server variable
// MongoDB connection with better error handling
mongoose.connect(config.mongodb.uri, config.mongodb.options)
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    console.log('📊 Database:', mongoose.connection.name);
    console.log('🌐 Host:', mongoose.connection.host);
  })
  .catch((error) => {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  });

// Monitor connection events
mongoose.connection.on('error', (error) => {
  console.error('💥 MongoDB connection error:', error);
});

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ MongoDB disconnected');
});

// Trust proxy for rate limiting
app.set("trust proxy", 1);

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "http://localhost:5173", "ws://localhost:5173"],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

// CORS configuration - FIXED: Removed invalid z.string() reference
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      const allowedOrigins = [
        config.FRONTEND_URL || "http://localhost:5173",
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173"
      ];
      
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      
      // Allow in development
      if (config.NODE_ENV === 'development') {
        return callback(null, true);
      }
      
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: [
      "Content-Type", 
      "Authorization", 
      "x-dev-user", 
      "x-correlation-id",
      "Accept",
      "Origin",
      "X-Requested-With"
    ],
  })
);

// Compression middleware
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Request logging - FIXED: Added fallback if morgan fails
try {
  app.use(
    morgan("combined", {
      stream: {
        write: (message) => {
          if (logger && logger.info) {
            logger.info(message.trim(), { type: "http" });
          } else {
            console.log(message.trim());
          }
        },
      },
    })
  );
} catch (error) {
  console.warn("Morgan logging middleware failed to initialize:", error.message);
  // Continue without morgan if it fails
}

// Rate limiting - FIXED: Added error handling
try {
  app.use("/api/", rateLimiter);
} catch (error) {
  console.warn("Rate limiting middleware failed to initialize:", error.message);
}

// Add correlation ID to requests
app.use((req, res, next) => {
  req.correlationId = req.headers["x-correlation-id"] || 
    `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  res.setHeader("x-correlation-id", req.correlationId);
  next();
});

// Health check route (before other routes)
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Backend is working perfectly! 🚀',
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: config.NODE_ENV || 'development'
  });
});

// API Routes - FIXED: Added error handling for route imports
const routeHandlers = [
  { path: "/api/health", handler: healthRoutes, name: "health" },
  { path: "/api/auth", handler: authRoutes, name: "auth" },
  { path: "/api/candidates", handler: candidatesRoutes, name: "candidates" },
  { path: "/api/internships", handler: internshipsRoutes, name: "internships" },
  { path: "/api/recommendations", handler: recommendationsRoutes, name: "recommendations" },
  { path: "/api/applications", handler: applicationsRoutes, name: "applications" },
  // { path: "/api/admin", handler: adminRoutes, name: "admin" },
  { path: "/api/webhooks", handler: webhooksRoutes, name: "webhooks" },
  { path: "/api/notifications", handler: notificationsRoutes, name: "notifications" },
  { path: "/api/ml", handler: mlRoutes, name: "ml" },
];

routeHandlers.forEach(({ path, handler, name }) => {
  try {
    if (handler) {
      app.use(path, handler);
      console.log(`✅ ${name} routes loaded`);
    } else {
      console.warn(`⚠️  ${name} routes not found, skipping...`);
    }
  } catch (error) {
    console.error(`❌ Failed to load ${name} routes:`, error.message);
  }
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.originalUrl,
    method: req.method,
    availableRoutes: [
      "GET /api/health",
      "GET /api/test",
      "POST /api/auth/login",
      "GET /api/candidates",
      "GET /api/internships"
    ]
  });
});

// Global error handler
app.use(errorHandler);

// Database connection - FIXED: Added better error handling
const connectDatabase = async () => {
  try {
    // Ensure config exists
    if (!config || !config.mongodb) {
      throw new Error("MongoDB configuration not found");
    }

    const mongoUri = config.mongodb.uri || process.env.MONGODB_URI || "mongodb://localhost:27017/pmis";
    const mongoOptions = config.mongodb.options || {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };

    await mongoose.connect(mongoUri, mongoOptions);
    
    if (logger && logger.info) {
      logger.info("✅ Connected to MongoDB");
    } else {
      console.log("✅ Connected to MongoDB");
    }

    // Handle MongoDB connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected');
    });

  } catch (error) {
    const errorMessage = `❌ MongoDB connection failed: ${error.message}`;
    if (logger && logger.error) {
      logger.error(errorMessage, error);
    } else {
      console.error(errorMessage);
    }
    
    // Don't exit in development - allow testing without DB
    if (config.NODE_ENV === 'production') {
      process.exit(1);
    } else {
      console.warn("⚠️  Continuing without database in development mode");
    }
  }
};

// Graceful shutdown - FIXED: Added better error handling
const gracefulShutdown = (signal) => {
  const message = `Received ${signal}. Starting graceful shutdown...`;
  if (logger && logger.info) {
    logger.info(message);
  } else {
    console.log(message);
  }

  if (server) {
    server.close(() => {
      const msg = "HTTP server closed";
      if (logger && logger.info) {
        logger.info(msg);
      } else {
        console.log(msg);
      }

      if (mongoose.connection.readyState === 1) {
        mongoose.connection.close(false, () => {
          const dbMsg = "MongoDB connection closed";
          if (logger && logger.info) {
            logger.info(dbMsg);
          } else {
            console.log(dbMsg);
          }
          process.exit(0);
        });
      } else {
        process.exit(0);
      }
    });

    // Force close after 10 seconds
    setTimeout(() => {
      const forceMsg = "Could not close connections in time, forcefully shutting down";
      if (logger && logger.error) {
        logger.error(forceMsg);
      } else {
        console.error(forceMsg);
      }
      process.exit(1);
    }, 10000);
  } else {
    process.exit(0);
  }
};

// Start server - FIXED: Better error handling and optional schedulers
const startServer = async () => {
  try {
    await connectDatabase();

    // Optional schedulers - don't fail if they don't exist
    try {
      const NotificationScheduler = require("./jobs/notificationScheduler");
      const MLScheduler = require("./jobs/mlScheduler");

      const notificationScheduler = new NotificationScheduler();
      const mlScheduler = new MLScheduler();

      notificationScheduler.start();
      mlScheduler.start();
      
      console.log("✅ Background schedulers started");
    } catch (schedulerError) {
      console.warn("⚠️  Schedulers not available:", schedulerError.message);
    }

    const PORT = config.PORT || process.env.PORT || 4000;
    const NODE_ENV = config.NODE_ENV || process.env.NODE_ENV || 'development';

    server = app.listen(PORT, () => {
      const messages = [
        `🚀 Server running on port ${PORT} in ${NODE_ENV} mode`,
        `📚 API Documentation: http://localhost:${PORT}/api/health`,
        `🧪 Test endpoint: http://localhost:${PORT}/api/test`,
        `🌐 Ready for frontend connection from: http://localhost:5173`
      ];

      messages.forEach(msg => {
        if (logger && logger.info) {
          logger.info(msg);
        } else {
          console.log(msg);
        }
      });
    });

    // Handle graceful shutdown
    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
    process.on("uncaughtException", (error) => {
      console.error("Uncaught Exception:", error);
      gracefulShutdown("UNCAUGHT_EXCEPTION");
    });
    process.on("unhandledRejection", (reason, promise) => {
      console.error("Unhandled Rejection at:", promise, "reason:", reason);
      gracefulShutdown("UNHANDLED_REJECTION");
    });

    return server;
  } catch (error) {
    const errorMsg = `❌ Failed to start server: ${error.message}`;
    if (logger && logger.error) {
      logger.error(errorMsg, error);
    } else {
      console.error(errorMsg);
    }
    process.exit(1);
  }
};

// Start the application
if (require.main === module) {
  startServer().catch((error) => {
    console.error("Failed to start application:", error);
    process.exit(1);
  });
}

module.exports = app;
