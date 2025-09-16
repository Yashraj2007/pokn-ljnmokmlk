/**
 * Authentication routes
 * Handles user authentication and authorization
 */

const express = require("express")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")
const config = require("../config")
const { authMiddleware, optionalAuth } = require("../middlewares/authMiddleware")
const { logger } = require("../logger/logger")
const User = require("../models/User")

const router = express.Router()

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post("/register", async (req, res) => {
  try {
    console.log('📥 [SERVER] Received registration data:', req.body);

    const { name, email, mobile, password, role = "candidate" } = req.body;

    // Validation (keep existing validation code)
    if (!name || name.trim().length === 0) {
      console.log('❌ [SERVER] Name validation failed');
      return res.status(400).json({
        success: false,
        message: "Name is required",
        correlationId: req.correlationId,
      });
    }

    if (!email || email.trim().length === 0) {
      console.log('❌ [SERVER] Email validation failed');
      return res.status(400).json({
        success: false,
        message: "Email is required",
        correlationId: req.correlationId,
      });
    }

    if (!password || password.length < 6) {
      console.log('❌ [SERVER] Password validation failed');
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
        correlationId: req.correlationId,
      });
    }

    console.log('✅ [SERVER] Validation passed, creating user...');

    // Check if user already exists
    console.log('🔍 [SERVER] Checking if user exists...');
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      console.log('❌ [SERVER] User already exists');
      return res.status(400).json({
        success: false,
        message: "An account with this email already exists",
        correlationId: req.correlationId,
      });
    }

    // Create user (password will be automatically hashed by pre-save hook)
    console.log('👤 [SERVER] Creating new user...');
    const user = new User({
      name: name.trim(),  // ← Now matches schema field name
      email: email.toLowerCase().trim(),
      mobile: mobile?.trim() || '',
      password: password,  // ← Don't hash manually, let pre-save hook handle it
      role,
    });

    console.log('💾 [SERVER] Saving user to database...');
    const savedUser = await user.save();
    console.log('✅ [SERVER] User saved successfully:', savedUser._id);

    // Generate JWT token
    console.log('🔑 [SERVER] Generating JWT token...');
    const token = jwt.sign(
      {
        sub: savedUser._id,
        userId: savedUser._id,
        email: savedUser.email,
        name: savedUser.name,  // ← Now correctly references 'name' field
        role: savedUser.role,
        iat: Math.floor(Date.now() / 1000),
      },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn },
    );

    console.log('🎉 [SERVER] Registration completed successfully');
    res.status(201).json({
      success: true,
      message: "Registration successful! Welcome to PMIS!",
      data: {
        token,
        user: {
          userId: savedUser._id,
          email: savedUser.email,
          name: savedUser.name,  // ← Consistent field naming
          role: savedUser.role,
        },
        expiresIn: config.jwt.expiresIn,
      },
      correlationId: req.correlationId,
    });

  } catch (error) {
    console.error('💥 [SERVER] Registration error:', error);
    
    // Handle specific MongoDB errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      console.error('💥 [SERVER] Validation errors:', validationErrors);
      return res.status(400).json({
        success: false,
        message: validationErrors.join('. '),
        correlationId: req.correlationId,
      });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "An account with this email already exists",
        correlationId: req.correlationId,
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Registration failed",
      correlationId: req.correlationId,
    });
  }
});



/**
 * POST /api/auth/login
 * Login user
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body

    console.log('🔍 [LOGIN] Attempting login for:', email);

    // Validation
    if (!email || !password) {
      console.log('❌ [LOGIN] Missing email or password');
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
        correlationId: req.correlationId,
      })
    }

    // Find user - FIX: Convert email to lowercase
    const user = await User.findOne({ email: email.toLowerCase() })
    console.log('👤 [LOGIN] User found:', user ? 'YES' : 'NO');
    
    if (!user) {
      console.log('❌ [LOGIN] User not found');
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
        correlationId: req.correlationId,
      })
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password)
    console.log('🔑 [LOGIN] Password valid:', isPasswordValid);
    
    if (!isPasswordValid) {
      console.log('❌ [LOGIN] Invalid password');
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
        correlationId: req.correlationId,
      })
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        sub: user._id,
        userId: user._id,
        email: user.email,
        mobile: user.mobile,
        name: user.name,
        role: user.role,
        iat: Math.floor(Date.now() / 1000),
      },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn },
    )

    console.log('✅ [LOGIN] Login successful for user:', user._id);
    logger.info("User logged in successfully", { userId: user._id, email })

    res.json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: {
          userId: user._id,
          email: user.email,
          mobile: user.mobile,
          name: user.name,
          role: user.role,
        },
        expiresIn: config.jwt.expiresIn,
      },
      correlationId: req.correlationId,
    })
  } catch (error) {
    console.error('💥 [LOGIN] Error:', error);
    logger.error("Login error", error)
    res.status(500).json({
      success: false,
      message: "Login failed",
      correlationId: req.correlationId,
    })
  }
})


/**
 * POST /api/auth/logout
 * Logout user
 */
router.post("/logout", authMiddleware({ required: true }), async (req, res) => {
  try {
    logger.info("User logged out", { userId: req.user.id })
    
    res.json({
      success: true,
      message: "Logged out successfully",
      correlationId: req.correlationId,
    })
  } catch (error) {
    logger.error("Logout error", error)
    res.status(500).json({
      success: false,
      message: "Logout failed",
      correlationId: req.correlationId,
    })
  }
})

/**
 * GET /api/auth/me
 * Get current user information
 */
router.get("/me", authMiddleware({ required: true }), async (req, res) => {
  try {
    const user = req.user

    res.json({
      success: true,
      data: {
        user: {
          userId: user.id,
          email: user.email,
          mobile: user.mobile,
          name: user.name,
          role: user.role || "user",
          clerkId: user.clerkId,
        }
      },
      correlationId: req.correlationId,
    })
  } catch (error) {
    logger.error("Get user info error", error)
    res.status(500).json({
      success: false,
      message: "Failed to get user information",
      correlationId: req.correlationId,
    })
  }
})

/**
 * POST /api/auth/token
 * Generate JWT token for development/testing
 */
router.post("/token", async (req, res) => {
  try {
    const { userId, email, mobile, name, role = "user" } = req.body

    if (!userId || !email) {
      return res.status(400).json({
        success: false,
        message: "userId and email are required",
        correlationId: req.correlationId,
      })
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        sub: userId,
        userId,
        email,
        mobile,
        name,
        role,
        iat: Math.floor(Date.now() / 1000),
      },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn },
    )

    logger.info("JWT token generated", { userId, email, role })

    res.json({
      success: true,
      data: {
        token,
        user: {
          userId,
          email,
          mobile,
          name,
          role,
        },
        expiresIn: config.jwt.expiresIn,
      },
      correlationId: req.correlationId,
    })
  } catch (error) {
    logger.error("Token generation error", error)
    res.status(500).json({
      success: false,
      message: "Failed to generate token",
      correlationId: req.correlationId,
    })
  }
})

/**
 * POST /api/auth/verify
 * Verify JWT token
 */
router.post("/verify", async (req, res) => {
  try {
    const { token } = req.body

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Token is required",
        correlationId: req.correlationId,
      })
    }

    try {
      const decoded = jwt.verify(token, config.jwt.secret)

      res.json({
        success: true,
        data: {
          valid: true,
          user: {
            userId: decoded.sub || decoded.userId,
            email: decoded.email,
            mobile: decoded.mobile,
            name: decoded.name,
            role: decoded.role,
          },
          expiresAt: new Date(decoded.exp * 1000),
        },
        correlationId: req.correlationId,
      })
    } catch (jwtError) {
      res.json({
        success: true,
        data: {
          valid: false,
          error: jwtError.message,
        },
        correlationId: req.correlationId,
      })
    }
  } catch (error) {
    logger.error("Token verification error", error)
    res.status(500).json({
      success: false,
      message: "Failed to verify token",
      correlationId: req.correlationId,
    })
  }
})

/**
 * GET /api/auth/status
 * Check authentication status
 */
router.get("/status", optionalAuth, async (req, res) => {
  try {
    const isAuthenticated = !!req.user

    res.json({
      success: true,
      data: {
        authenticated: isAuthenticated,
        user: isAuthenticated
          ? {
              userId: req.user.id,
              email: req.user.email,
              name: req.user.name,
              role: req.user.role,
            }
          : null,
      },
      correlationId: req.correlationId,
    })
  } catch (error) {
    logger.error("Auth status check error", error)
    res.status(500).json({
      success: false,
      message: "Failed to check authentication status",
      correlationId: req.correlationId,
    })
  }
})

module.exports = router
