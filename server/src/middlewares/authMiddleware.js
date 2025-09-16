/**
 * Authentication middleware
 * Supports both Clerk JWT tokens, custom JWT tokens, and development mode
 * Enhanced with better error handling and User model integration
 */

const jwt = require("jsonwebtoken")
const config = require("../config")
const { logger } = require("../logger/logger")
const User = require("../models/User")

/**
 * Verify JWT token (Clerk or custom)
 */
const verifyToken = (token) => {
  try {
    // If Clerk public key is available, use it for Clerk tokens
    if (config.CLERK_JWT_PUBLIC_KEY) {
      try {
        return jwt.verify(token, config.CLERK_JWT_PUBLIC_KEY, { algorithms: ["RS256"] })
      } catch (clerkError) {
        // If Clerk verification fails, try custom JWT as fallback
        logger.debug("Clerk token verification failed, trying custom JWT", { error: clerkError.message })
      }
    }

    // Fallback to custom JWT secret
    return jwt.verify(token, config.jwt.secret)
  } catch (error) {
    logger.warn("Token verification failed", { error: error.message })
    throw new Error("Invalid or expired token")
  }
}

/**
 * Enhanced authentication middleware with User model integration
 */
const authMiddleware = (options = {}) => {
  const { required = true, roles = [], allowDev = true } = options

  return async (req, res, next) => {
    try {
      let user = null
      let authMethod = 'none'

      // Development mode: check for dev header
      if (allowDev && config.isDevelopment && req.headers["x-dev-user"]) {
        try {
          const devUserData = JSON.parse(req.headers["x-dev-user"])
          user = {
            id: devUserData.id || 'dev-user-123',
            email: devUserData.email || 'dev@example.com',
            mobile: devUserData.mobile || '+91 9876543210',
            name: devUserData.name || 'Dev User',
            role: devUserData.role || 'candidate',
            clerkId: devUserData.clerkId || null,
            isDev: true
          }
          authMethod = 'dev-header'
          logger.debug("Using dev user from header", { userId: user.id, email: user.email })
        } catch (error) {
          logger.warn("Invalid dev user header", { 
            header: req.headers["x-dev-user"], 
            error: error.message 
          })
        }
      }

      // Production mode: check for JWT token
      if (!user) {
        const authHeader = req.headers.authorization
        
        if (authHeader && authHeader.startsWith("Bearer ")) {
          const token = authHeader.substring(7)
          
          try {
            const decoded = verifyToken(token)
            authMethod = 'jwt-token'

            // Create user object from decoded token
            user = {
              id: decoded.sub || decoded.userId || decoded.id,
              email: decoded.email,
              mobile: decoded.mobile || decoded.phone_number,
              name: decoded.name || decoded.full_name,
              role: decoded.role || "candidate",
              clerkId: decoded.sub,
              tokenExp: decoded.exp,
              tokenIat: decoded.iat
            }

            // Optional: Validate user exists in database
            if (config.VALIDATE_USER_EXISTS && user.id && user.id !== 'dev-user-123') {
              try {
                const dbUser = await User.findById(user.id)
                if (!dbUser) {
                  logger.warn("Token valid but user not found in database", { userId: user.id })
                  user = null
                  authMethod = 'user-not-found'
                }
              } catch (dbError) {
                logger.error("Database error during user validation", { 
                  userId: user.id, 
                  error: dbError.message 
                })
                // Continue without DB validation in case of DB issues
              }
            }

            if (user) {
              logger.debug("User authenticated via JWT", { 
                userId: user.id, 
                email: user.email, 
                role: user.role,
                method: authMethod
              })
            }
          } catch (tokenError) {
            logger.warn("JWT token verification failed", { 
              error: tokenError.message,
              token: token.substring(0, 20) + '...' // Log only first 20 chars for security
            })
          }
        } else if (authHeader) {
          logger.warn("Invalid authorization header format", { 
            header: authHeader.substring(0, 20) + '...' 
          })
        }
      }

      // Development fallback: create mock user if no auth in dev mode
      if (!user && allowDev && config.isDevelopment && !required) {
        user = {
          id: 'dev-fallback-user',
          email: 'dev-fallback@example.com',
          mobile: '+91 9876543210',
          name: 'Dev Fallback User',
          role: 'candidate',
          isDev: true,
          isFallback: true
        }
        authMethod = 'dev-fallback'
        logger.debug("Using dev fallback user")
      }

      // Check if authentication is required
      if (required && !user) {
        logger.warn("Authentication required but not provided", { 
          method: req.method,
          url: req.url,
          userAgent: req.headers['user-agent'],
          correlationId: req.correlationId
        })
        
        return res.status(401).json({
          success: false,
          message: "Authentication required",
          error: "AUTHENTICATION_REQUIRED",
          correlationId: req.correlationId,
        })
      }

      // Check role permissions
      if (user && roles.length > 0 && !roles.includes(user.role)) {
        logger.warn("Insufficient permissions", { 
          userId: user.id,
          userRole: user.role,
          requiredRoles: roles,
          method: req.method,
          url: req.url,
          correlationId: req.correlationId
        })
        
        return res.status(403).json({
          success: false,
          message: "Insufficient permissions",
          error: "INSUFFICIENT_PERMISSIONS",
          required: roles,
          current: user.role,
          correlationId: req.correlationId,
        })
      }

      // Attach user and auth info to request
      req.user = user
      req.authMethod = authMethod
      req.isAuthenticated = !!user
      
      // Add helper methods
      req.hasRole = (role) => user && user.role === role
      req.hasAnyRole = (rolesList) => user && rolesList.includes(user.role)
      req.isAdmin = () => user && user.role === 'admin'
      req.isCandidate = () => user && user.role === 'candidate'
      req.isRecruiter = () => user && user.role === 'recruiter'

      // Log successful authentication
      if (user) {
        logger.info("Request authenticated", {
          userId: user.id,
          role: user.role,
          method: authMethod,
          endpoint: `${req.method} ${req.url}`,
          correlationId: req.correlationId
        })
      }

      next()
    } catch (error) {
      logger.error("Authentication middleware error", { 
        error: error.message,
        stack: error.stack,
        method: req.method,
        url: req.url,
        correlationId: req.correlationId
      })

      if (required) {
        return res.status(500).json({
          success: false,
          message: "Authentication system error",
          error: "AUTHENTICATION_ERROR",
          correlationId: req.correlationId,
        })
      }

      // If auth is not required, continue without user
      req.user = null
      req.authMethod = 'error'
      req.isAuthenticated = false
      next()
    }
  }
}

/**
 * Admin authentication middleware
 * Requires authentication and admin role
 */
const adminAuth = authMiddleware({ 
  required: true, 
  roles: ["admin"],
  allowDev: true 
})

/**
 * Recruiter authentication middleware
 * Requires authentication and recruiter or admin role
 */
const recruiterAuth = authMiddleware({ 
  required: true, 
  roles: ["recruiter", "admin"],
  allowDev: true 
})

/**
 * Candidate authentication middleware
 * Requires authentication and candidate role (or admin for testing)
 */
const candidateAuth = authMiddleware({ 
  required: true, 
  roles: ["candidate", "admin"],
  allowDev: true 
})

/**
 * Optional authentication middleware
 * Does not require authentication but will populate user if available
 */
const optionalAuth = authMiddleware({ 
  required: false,
  allowDev: true 
})

/**
 * Strict authentication middleware (no dev mode)
 * For production-critical endpoints
 */
const strictAuth = authMiddleware({ 
  required: true,
  allowDev: false 
})

/**
 * Role checker middleware factory
 * Create custom role-based middleware
 */
const requireRoles = (...roles) => {
  return authMiddleware({ 
    required: true, 
    roles: roles.flat(),
    allowDev: true 
  })
}

/**
 * Permission checker middleware
 * More granular permission checking
 */
const requirePermissions = (permissions = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required for permission check",
        correlationId: req.correlationId,
      })
    }

    // Admin has all permissions
    if (req.user.role === 'admin') {
      return next()
    }

    // Check specific permissions based on role
    const rolePermissions = {
      candidate: ['view_profile', 'edit_profile', 'apply_internship', 'view_applications'],
      recruiter: ['view_candidates', 'post_internship', 'manage_applications', 'view_analytics'],
      admin: ['*'] // All permissions
    }

    const userPermissions = rolePermissions[req.user.role] || []
    const hasPermission = permissions.every(perm => 
      userPermissions.includes(perm) || userPermissions.includes('*')
    )

    if (!hasPermission) {
      logger.warn("Permission denied", {
        userId: req.user.id,
        role: req.user.role,
        requiredPermissions: permissions,
        userPermissions: userPermissions,
        correlationId: req.correlationId
      })

      return res.status(403).json({
        success: false,
        message: "Insufficient permissions",
        required: permissions,
        correlationId: req.correlationId,
      })
    }

    next()
  }
}

module.exports = {
  authMiddleware,
  adminAuth,
  recruiterAuth,
  candidateAuth,
  optionalAuth,
  strictAuth,
  requireRoles,
  requirePermissions,
  verifyToken,
}
