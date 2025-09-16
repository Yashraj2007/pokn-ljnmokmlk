/**
 * Candidates routes
 * Handles candidate profile management
 */

const express = require("express")
const { z } = require("zod")
const Candidate = require("../models/Candidate")
const { authMiddleware, optionalAuth } = require("../middlewares/authMiddleware")
const { logger } = require("../logger/logger")

const router = express.Router()

// Validation schemas
const candidateSchema = z.object({
  mobile: z.string().regex(/^\+91\d{10}$/, "Invalid mobile number format"),
  name: z.string().min(2).max(100),
  language: z.enum(["en", "hi", "mr"]).optional(),
  education: z.object({
    level: z.enum(["10th", "12th", "Diploma", "UG", "PG", "PhD"]),
    field: z.string().min(2).max(100),
    year: z
      .number()
      .int()
      .min(1990)
      .max(new Date().getFullYear() + 5),
    verified: z.boolean().optional(),
    institution: z.string().max(200).optional(),
    percentage: z.number().min(0).max(100).optional(),
  }),
  skills: z
    .array(
      z.object({
        name: z.string().min(1).max(50),
        canonical: z.string().min(1).max(50),
        confidence: z.number().min(0).max(1).optional(),
        source: z.enum(["user", "inferred", "verified"]).optional(),
      }),
    )
    .min(1),
  location: z.object({
    district: z.string().min(2).max(100),
    state: z.string().min(2).max(100),
    lat: z.number().min(-90).max(90),
    lon: z.number().min(-180).max(180),
    pincode: z.string().optional(),
  }),
  preferences: z
    .object({
      distancePref: z.enum(["local", "state", "any"]).optional(),
      workType: z.enum(["onsite", "remote", "either"]).optional(),
      minStipend: z.number().min(0).optional(),
      sectors: z.array(z.string()).optional(),
      startDate: z.string().datetime().optional(),
      duration: z
        .object({
          min: z.number().int().min(1).optional(),
          max: z.number().int().min(1).optional(),
        })
        .optional(),
    })
    .optional(),
})

/**
 * GET /api/candidates/profile
 * Get current user's candidate profile
 */
router.get("/profile", authMiddleware({ required: true }), async (req, res) => {
  try {
    console.log('🔍 [CANDIDATES] Profile request for user:', req.user?.userId || req.user?.sub);
    console.log('🔍 [CANDIDATES] Full user object:', req.user);
    
    const userId = req.user.userId || req.user.sub || req.user.id;
    
    if (!userId) {
      console.log('❌ [CANDIDATES] No userId found in token');
      return res.status(400).json({
        success: false,
        message: "User ID not found in token",
        correlationId: req.correlationId,
      });
    }

    // Find candidate by userId
    let candidate = await Candidate.findOne({ userId: userId });
    
    console.log('👤 [CANDIDATES] Found candidate:', candidate ? 'YES' : 'NO');
    
    if (!candidate) {
      console.log('⚠️ [CANDIDATES] No candidate profile found, returning empty profile');
      return res.json({
        success: true,
        message: "No profile found - please complete your profile",
        data: {
          personalInfo: { 
            fullName: req.user.name || "", 
            email: req.user.email || "", 
            phone: "", 
            location: "",
            github: "",
            linkedin: "",
            portfolio: ""
          },
          education: { college: "", course: "", year: "" },
          skills: [],
          interests: [],
          experience: { level: "" },
          preferences: { preferredLocations: [], workTypes: [] },
          resumeUploaded: false
        },
        correlationId: req.correlationId,
      });
    }
    
    console.log('✅ [CANDIDATES] Returning candidate profile');
    
    // Update last active
    try {
      await candidate.updateLastActive();
    } catch (updateError) {
      console.warn('⚠️ [CANDIDATES] Failed to update last active:', updateError.message);
    }

    res.json({
      success: true,
      data: candidate,
      correlationId: req.correlationId,
    });
    
  } catch (error) {
    console.error('💥 [CANDIDATES] Profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get candidate profile',
      error: error.message,
      correlationId: req.correlationId,
    });
  }
});

/**
 * PUT /api/candidates/profile  
 * Update current user's candidate profile - ENHANCED WITH BETTER ERROR HANDLING
 */
router.put("/profile", authMiddleware({ required: true }), async (req, res) => {
  try {
    console.log('🔍 [CANDIDATES] Profile update request started');
    console.log('🔍 [CANDIDATES] Request body:', JSON.stringify(req.body, null, 2));
    console.log('🔍 [CANDIDATES] User:', req.user);
    
    const userId = req.user.userId || req.user.sub || req.user.id;
    
    if (!userId) {
      console.log('❌ [CANDIDATES] No userId in token');
      return res.status(400).json({
        success: false,
        message: "User ID not found in token",
        correlationId: req.correlationId,
      });
    }

    console.log('🔍 [CANDIDATES] Looking for candidate with userId:', userId);

    // Find existing candidate
    let candidate = await Candidate.findOne({ userId: userId });
    console.log('👤 [CANDIDATES] Existing candidate found:', candidate ? 'YES' : 'NO');
    
    if (candidate) {
      console.log('✅ [CANDIDATES] Updating existing candidate');
      
      // Safely update existing candidate
      try {
        // Update basic info
        if (req.body.personalInfo) {
          candidate.name = req.body.personalInfo.fullName || candidate.name;
          if (req.body.personalInfo.phone && req.body.personalInfo.phone.trim()) {
            candidate.mobile = req.body.personalInfo.phone;
          }
        }
        
        // Update education
        if (req.body.education) {
          candidate.education = {
            ...candidate.education,
            field: req.body.education.course || candidate.education.field,
            institution: req.body.education.college || candidate.education.institution,
            level: candidate.education.level || 'UG',
            year: candidate.education.year || new Date().getFullYear()
          };
        }
        
        // Update skills
        if (req.body.skills && Array.isArray(req.body.skills)) {
          candidate.skills = req.body.skills.map(skill => ({
            name: skill,
            canonical: skill.toLowerCase().replace(/[^a-z0-9]/g, ''),
            confidence: 1,
            source: 'user'
          }));
        }
        
        candidate.updatedAt = new Date();
        await candidate.save();
        console.log('✅ [CANDIDATES] Existing candidate updated successfully');
        
      } catch (updateError) {
        console.error('❌ [CANDIDATES] Error updating existing candidate:', updateError);
        throw updateError;
      }
      
    } else {
      console.log('🆕 [CANDIDATES] Creating new candidate');
      
      // Create new candidate with all required fields
      try {
        const candidateData = {
          userId: userId,
          
          // Required fields
          mobile: req.body.personalInfo?.phone || "+911234567890",
          name: req.body.personalInfo?.fullName || req.user.name || "User",
          
          // Required education object
          education: {
            level: "UG",
            field: req.body.education?.course || "Computer Science",
            year: new Date().getFullYear(),
            institution: req.body.education?.college || "University",
          },
          
          // Skills array (can be empty)
          skills: (req.body.skills || []).map(skill => ({
            name: skill,
            canonical: skill.toLowerCase().replace(/[^a-z0-9]/g, ''),
            confidence: 1,
            source: 'user'
          })),
          
          // Required location object
          location: {
            type: "Point",
            coordinates: [77.5946, 12.9716], // Bangalore coordinates
            district: "Bangalore",
            state: "Karnataka",
          },
          
          // Optional preferences
          preferences: {
            distancePref: "any",
            workType: "either",
            sectors: req.body.interests || []
          },
          
          // Metadata
          metadata: {
            source: "web",
            lastActive: new Date(),
            profileCompleteness: 0
          }
        };
        
        console.log('🔍 [CANDIDATES] Creating candidate with data:', JSON.stringify(candidateData, null, 2));
        
        candidate = new Candidate(candidateData);
        await candidate.save();
        console.log('✅ [CANDIDATES] New candidate created successfully');
        
      } catch (createError) {
        console.error('❌ [CANDIDATES] Error creating new candidate:', createError);
        throw createError;
      }
    }

    console.log('🎉 [CANDIDATES] Profile operation completed successfully');

    res.json({
      success: true,
      data: candidate,
      message: "Profile saved successfully",
      correlationId: req.correlationId,
    });
    
  } catch (error) {
    console.error('💥 [CANDIDATES] Profile save error details:');
    console.error('💥 Error message:', error.message);
    console.error('💥 Error stack:', error.stack);
    console.error('💥 Request body was:', req.body);
    
    // Handle specific mongoose errors
    if (error.name === 'ValidationError') {
      console.error('💥 Validation Error Details:', error.errors);
      return res.status(400).json({
        success: false,
        message: `Validation failed: ${Object.values(error.errors).map(e => e.message).join(', ')}`,
        correlationId: req.correlationId,
      });
    }
    
    if (error.code === 11000) {
      console.error('💥 Duplicate Key Error:', error.keyPattern);
      return res.status(409).json({
        success: false,
        message: "A profile with this information already exists",
        correlationId: req.correlationId,
      });
    }
    
    res.status(500).json({
      success: false,
      message: `Failed to save profile: ${error.message}`,
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      correlationId: req.correlationId,
    });
  }
});

/**
 * GET /api/candidates/:id
 * Get candidate profile by ID
 */
router.get("/:id", optionalAuth, async (req, res) => {
  try {
    const { id } = req.params

    const candidate = await Candidate.findById(id)
    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found",
        correlationId: req.correlationId,
      })
    }

    // Update last active timestamp
    await candidate.updateLastActive()

    res.json({
      success: true,
      data: candidate,
      correlationId: req.correlationId,
    })
  } catch (error) {
    logger.error("Get candidate error", error)
    res.status(500).json({
      success: false,
      message: "Failed to get candidate",
      correlationId: req.correlationId,
    })
  }
})

/**
 * POST /api/candidates
 * Create or update candidate profile
 */
router.post("/", optionalAuth, async (req, res) => {
  try {
    // Validate request body
    const validatedData = candidateSchema.parse(req.body)

    // Check if candidate already exists
    const existingCandidate = await Candidate.findByMobile(validatedData.mobile)

    if (existingCandidate) {
      // Update existing candidate
      Object.assign(existingCandidate, {
        ...validatedData,
        location: {
          type: "Point",
          coordinates: [validatedData.location.lon, validatedData.location.lat],
          district: validatedData.location.district,
          state: validatedData.location.state,
          pincode: validatedData.location.pincode,
        },
        updatedAt: new Date(),
      })

      await existingCandidate.save()

      logger.info("Candidate profile updated", {
        candidateId: existingCandidate._id,
        mobile: existingCandidate.maskedMobile,
      })

      return res.json({
        success: true,
        data: {
          candidateId: existingCandidate._id,
          isNew: false,
          candidate: existingCandidate,
        },
        correlationId: req.correlationId,
      })
    }

    // Create new candidate
    const newCandidate = new Candidate({
      ...validatedData,
      location: {
        type: "Point",
        coordinates: [validatedData.location.lon, validatedData.location.lat],
        district: validatedData.location.district,
        state: validatedData.location.state,
        pincode: validatedData.location.pincode,
      },
      clerkId: req.user?.clerkId,
      metadata: {
        ...validatedData.metadata,
        source: "web",
        lastActive: new Date(),
      },
    })

    await newCandidate.save()

    logger.info("New candidate created", {
      candidateId: newCandidate._id,
      mobile: newCandidate.maskedMobile,
    })

    res.status(201).json({
      success: true,
      data: {
        candidateId: newCandidate._id,
        isNew: true,
        candidate: newCandidate,
      },
      correlationId: req.correlationId,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.errors,
        correlationId: req.correlationId,
      })
    }

    logger.error("Create candidate error", error)
    res.status(500).json({
      success: false,
      message: "Failed to create candidate",
      correlationId: req.correlationId,
    })
  }
})

/**
 * PUT /api/candidates/:id
 * Update candidate profile
 */
router.put("/:id", authMiddleware({ required: true }), async (req, res) => {
  try {
    const { id } = req.params

    // Validate request body (partial update)
    const updateSchema = candidateSchema.partial()
    const validatedData = updateSchema.parse(req.body)

    const candidate = await Candidate.findById(id)
    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found",
        correlationId: req.correlationId,
      })
    }

    // Update candidate data
    Object.assign(candidate, {
      ...validatedData,
      ...(validatedData.location && {
        location: {
          type: "Point",
          coordinates: [validatedData.location.lon, validatedData.location.lat],
          district: validatedData.location.district,
          state: validatedData.location.state,
          pincode: validatedData.location.pincode,
        },
      }),
      updatedAt: new Date(),
    })

    await candidate.save()

    logger.info("Candidate updated", {
      candidateId: candidate._id,
      mobile: candidate.maskedMobile,
    })

    res.json({
      success: true,
      data: candidate,
      correlationId: req.correlationId,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.errors,
        correlationId: req.correlationId,
      })
    }

    logger.error("Update candidate error", error)
    res.status(500).json({
      success: false,
      message: "Failed to update candidate",
      correlationId: req.correlationId,
    })
  }
})

/**
 * GET /api/candidates
 * List candidates with filtering and pagination
 */
router.get("/", authMiddleware({ required: true, roles: ["admin"] }), async (req, res) => {
  try {
    const { page = 1, limit = 20, district, state, educationLevel, status = "active", skills, search } = req.query

    // Build query
    const query = {}
    if (district) query["location.district"] = district
    if (state) query["location.state"] = state
    if (educationLevel) query["education.level"] = educationLevel
    if (status) query.status = status
    if (skills) {
      const skillsArray = skills.split(",").map((s) => s.trim().toLowerCase())
      query["skills.canonical"] = { $in: skillsArray }
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { "education.field": { $regex: search, $options: "i" } },
      ]
    }

    // Execute query with pagination
    const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit)
    const candidates = await Candidate.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number.parseInt(limit))

    const total = await Candidate.countDocuments(query)

    res.json({
      success: true,
      data: {
        candidates,
        pagination: {
          page: Number.parseInt(page),
          limit: Number.parseInt(limit),
          total,
          pages: Math.ceil(total / Number.parseInt(limit)),
        },
      },
      correlationId: req.correlationId,
    })
  } catch (error) {
    logger.error("List candidates error", error)
    res.status(500).json({
      success: false,
      message: "Failed to list candidates",
      correlationId: req.correlationId,
    })
  }
})

/**
 * GET /api/candidates/mobile/:mobile
 * Find candidate by mobile number
 */
router.get("/mobile/:mobile", optionalAuth, async (req, res) => {
  try {
    const { mobile } = req.params

    // Validate mobile format
    if (!/^\+91\d{10}$/.test(mobile)) {
      return res.status(400).json({
        success: false,
        message: "Invalid mobile number format",
        correlationId: req.correlationId,
      })
    }

    const candidate = await Candidate.findByMobile(mobile)
    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found",
        correlationId: req.correlationId,
      })
    }

    res.json({
      success: true,
      data: candidate,
      correlationId: req.correlationId,
    })
  } catch (error) {
    logger.error("Find candidate by mobile error", error)
    res.status(500).json({
      success: false,
      message: "Failed to find candidate",
      correlationId: req.correlationId,
    })
  }
})

/**
 * POST /api/candidates/:id/skills
 * Add skill to candidate
 */
router.post("/:id/skills", authMiddleware({ required: true }), async (req, res) => {
  try {
    const { id } = req.params
    const { name, canonical, confidence = 1 } = req.body

    if (!name || !canonical) {
      return res.status(400).json({
        success: false,
        message: "Skill name and canonical name are required",
        correlationId: req.correlationId,
      })
    }

    const candidate = await Candidate.findById(id)
    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found",
        correlationId: req.correlationId,
      })
    }

    await candidate.addSkill(name, canonical, confidence)

    res.json({
      success: true,
      data: candidate,
      correlationId: req.correlationId,
    })
  } catch (error) {
    logger.error("Add skill error", error)
    res.status(500).json({
      success: false,
      message: "Failed to add skill",
      correlationId: req.correlationId,
    })
  }
})

module.exports = router
