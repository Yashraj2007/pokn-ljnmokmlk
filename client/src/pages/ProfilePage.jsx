"use client"

import {
  Container,
  Typography,
  Button,
  Box,
  Card,
  CardContent,
  Grid,
  Chip,
  Alert,
  TextField,
  Avatar,
  Paper,
  Stepper,
  Step,
  StepLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  Autocomplete,
  IconButton,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Badge,
  Snackbar,
  CircularProgress,
} from "@mui/material"
import { motion, useInView } from "framer-motion"
import { useNavigate } from "react-router-dom"
import {
  Person,
  LocationOn,
  Work,
  School,
  Code,
  Psychology,
  Email,
  ArrowForward,
  ArrowBack,
  CheckCircle,
  SmartToy,
  TrendingUp,
  AccessibilityNew,
  Security,
  Analytics,
  CloudUpload,
  Description,
  Delete,
  Add,
  Dashboard,
  Star,
  Verified,
  Assignment,
  Business,
  Groups,
  Rocket,
  Warning,
} from "@mui/icons-material"
import { useState, useRef, useEffect } from "react"

// Same color palette as homepage
const colors = {
  primary: "#1e3a5f",
  primaryLight: "#2c5282",
  secondary: "#f6a821",
  accent: "#3d5a80",
  success: "#16a085",
  error: "#e74c3c",
  warning: "#f39c12",
  background: "#f8fafc",
  surface: "#ffffff",
  text: "#2d3748",
  textSecondary: "#718096",
  gradient: {
    primary: "linear-gradient(135deg, #1e3a5f 0%, #2c5282 50%, #3d5a80 100%)",
    secondary: "linear-gradient(135deg, #f6a821 0%, #ff8c42 100%)",
    success: "linear-gradient(135deg, #16a085 0%, #1abc9c 100%)",
    hero: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  },
}

import { candidatesAPI } from "../services/api"
import { useAPI } from "../hooks/useAPI"


const ProfilePage = () => {
  const navigate = useNavigate()
  const [activeStep, setActiveStep] = useState(0)
  const [resumeFile, setResumeFile] = useState(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [openCollegeDialog, setOpenCollegeDialog] = useState(false)
  const [newCollegeName, setNewCollegeName] = useState("")
  const [validationErrors, setValidationErrors] = useState({})

  // New states for save functionality
  const [saveStatus, setSaveStatus] = useState("idle") // idle, saving, saved, error
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" })


  const [formData, setFormData] = useState({
    // Personal Info
    fullName: "",
    email: "",
    phone: "",
    location: "",

    // Education
    college: "",
    course: "",
    year: "",

    // Skills & Experience
    skills: [],
    interests: [],
    experience: "",

    // Preferences - Updated to arrays for multiple selection
    preferredLocations: [],
    workTypes: [],

    // Additional
    github: "",
    linkedin: "",
    portfolio: "",
    resumeUploaded: false,
  })

  const headerRef = useRef(null)
  const isHeaderInView = useInView(headerRef, { once: true })

  const steps = [
    "Personal Information",
    "Education Details",
    "Skills & Experience",
    "Resume Upload (Optional)",
    "Preferences",
    "Complete Profile",
  ]

  const skillOptions = [
    "React.js",
    "Node.js",
    "Python",
    "JavaScript",
    "HTML5",
    "CSS3",
    "MongoDB",
    "MySQL",
    "Express.js",
    "Vue.js",
    "Angular",
    "TypeScript",
    "Machine Learning",
    "Data Science",
    "AI/ML",
    "Docker",
    "AWS",
    "Git",
    "Java",
    "C++",
    "PHP",
    "Django",
    "Flask",
    "React Native",
    "Flutter",
    "Kotlin",
    "Swift",
    "Go",
    "Rust",
    "Ruby",
    "Laravel",
    "Spring Boot",
    "TensorFlow",
    "PyTorch",
    "Pandas",
    "NumPy",
    "Scikit-learn",
    "Figma",
    "Adobe XD",
    "Photoshop",
    "Canva",
    "WordPress",
  ]

  const interestOptions = [
    "Web Development",
    "Mobile Development",
    "Data Science",
    "Machine Learning",
    "AI Research",
    "Backend Development",
    "Frontend Development",
    "Full-Stack",
    "DevOps",
    "Cloud Computing",
    "Cybersecurity",
    "Game Development",
    "UI/UX Design",
    "Product Management",
    "Digital Marketing",
    "Content Writing",
    "Graphic Design",
    "Video Editing",
    "SEO/SEM",
    "E-commerce",
    "Blockchain",
    "IoT Development",
    "Robotics",
    "AR/VR Development",
    "AR/VR Development",
  ]

  const collegeOptions = [
    // IITs
    "IIT Bombay",
    "IIT Delhi",
    "IIT Madras",
    "IIT Kanpur",
    "IIT Kharagpur",
    "IIT Roorkee",
    "IIT Guwahati",
    "IIT Hyderabad",
    "IIT Indore",
    "IIT Mandi",
    "IIT BHU Varanasi",
    "IIT Bhubaneswar",
    "IIT Gandhinagar",
    "IIT Jodhpur",

    // NITs
    "NIT Trichy",
    "NIT Warangal",
    "NIT Surathkal",
    "NIT Calicut",
    "NIT Durgapur",
    "NIT Rourkela",
    "NIT Jamshedpur",
    "NIT Kurukshetra",
    "NIT Allahabad",
    "NIT Bhopal",

    // Top Private
    "BITS Pilani",
    "VIT Vellore",
    "SRM University",
    "Manipal Institute of Technology",
    "Thapar Institute of Engineering",
    "PES University",
    "Amity University",
    "LPU Punjab",
    "Kalinga University",
    "Chitkara University",
    "Bennett University",

    // State Universities
    "Anna University",
    "Mumbai University",
    "Pune University",
    "Delhi University",
    "Jadavpur University",
    "Bangalore University",
    "Osmania University",
    "Andhra University",
    "Kakatiya University",
    "Rajasthan University",

    // Government Colleges
    "Delhi Technological University (DTU)",
    "Netaji Subhas University of Technology (NSUT)",
    "College of Engineering Pune (COEP)",
    "PSG College of Technology",
    "Thiagarajar College of Engineering",
    "Government College of Technology Coimbatore",
    "BMS College of Engineering",
    "RV College of Engineering",
    "MS Ramaiah Institute",

    // Other categories
    "Other Engineering College",
    "Arts & Science College",
    "Commerce College",
    "Polytechnic College",
    "Open University",
    "Distance Learning",

    // Special option at the end
    "+ Add New College",
  ]

  const locationOptions = [
    "Mumbai",
    "Delhi",
    "Bangalore",
    "Hyderabad",
    "Pune",
    "Chennai",
    "Kolkata",
    "Ahmedabad",
    "Jaipur",
    "Lucknow",
    "Kochi",
    "Coimbatore",
    "Indore",
    "Bhopal",
    "Nagpur",
    "Surat",
    "Vadodara",
    "Remote",
  ]

  const workTypeOptions = ["Remote", "On-site", "Hybrid", "Flexible"]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  }

  const itemVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  }

  const {
    data: profileData,
    loading: profileLoading,
    error: profileError,
    mutate,
  } = useAPI(() => candidatesAPI.getProfile(), [])

  // Email validation helper
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Phone validation helper
  const validatePhone = (phone) => {
    const phoneRegex = /^[+]?[1-9][\d]{0,15}$/
    return phoneRegex.test(phone.replace(/[\s\-$$$$]/g, ""))
  }

  // Step validation
  const validateStep = (step) => {
    const errors = {}

    switch (step) {
      case 0: // Personal Info
        if (!formData.fullName?.trim()) errors.fullName = "Full name is required"
        if (!formData.email?.trim()) {
          errors.email = "Email is required"
        } else if (!validateEmail(formData.email)) {
          errors.email = "Please enter a valid email address"
        }
        if (!formData.phone?.trim()) {
          errors.phone = "Phone number is required"
        } else if (!validatePhone(formData.phone)) {
          errors.phone = "Please enter a valid phone number"
        }
        if (!formData.location?.trim()) errors.location = "Location is required"
        break

      case 1: // Education
        if (!formData.college?.trim()) errors.college = "College/University is required"
        if (!formData.course?.trim()) errors.course = "Course/Degree is required"
        if (!formData.year?.trim()) errors.year = "Current year is required"
        break

      case 2: // Skills
        if (formData.skills.length === 0) errors.skills = "Please add at least one skill"
        if (!formData.experience?.trim()) errors.experience = "Experience level is required"
        break

      case 4: // Preferences
        if (formData.preferredLocations.length === 0) errors.preferredLocations = "Please select at least one location"
        if (formData.workTypes.length === 0) errors.workTypes = "Please select at least one work type"
        break

      default:
        break
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleNext = () => {
    if (!validateStep(activeStep)) {
      showSnackbar("Please fill all required fields correctly", "warning")
      return
    }

    // Save progress to localStorage
    localStorage.setItem(
      "pmis-profile-progress",
      JSON.stringify({
        formData,
        activeStep: activeStep + 1,
      }),
    )

    setActiveStep((prevStep) => prevStep + 1)
  }

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1)
  }

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))

    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  // Handle college selection with custom add option
  const handleCollegeChange = (event, newValue) => {
    if (newValue === "+ Add New College") {
      setOpenCollegeDialog(true)
    } else {
      handleInputChange("college", newValue)
    }
  }

  const handleAddNewCollege = () => {
    if (newCollegeName.trim()) {
      handleInputChange("college", newCollegeName.trim())
      setNewCollegeName("")
      setOpenCollegeDialog(false)
    }
  }

  // Enhanced resume upload handling
  const handleResumeUpload = async (file) => {
    if (!file) return

    // Validate file type and size
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ]

    if (!allowedTypes.includes(file.type)) {
      showSnackbar("Please upload PDF, DOC, or DOCX files only", "error")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      // 5MB limit
      showSnackbar("File size should be less than 5MB", "error")
      return
    }

    setResumeFile(file)
    setUploadProgress(0)

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + 10
        })
      }, 200)

      const formDataUpload = new FormData()
      formDataUpload.append("resume", file)

      await candidatesAPI.uploadResume(formDataUpload)

      clearInterval(progressInterval)
      setUploadProgress(100)
      setFormData((prev) => ({ ...prev, resumeUploaded: true }))
      showSnackbar("Resume uploaded successfully!", "success")
    } catch (error) {
      console.error(" Resume upload failed:", error)
      setResumeFile(null)
      setUploadProgress(0)
      showSnackbar(error.response?.data?.message || error.message || "Failed to upload resume", "error")
    }
  }

  const handleResumeDelete = () => {
    setResumeFile(null)
    setUploadProgress(0)
    setFormData((prev) => ({ ...prev, resumeUploaded: false }))
    showSnackbar("Resume removed", "info")
  }

  // Snackbar helper function
  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity })
  }

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false })
  }

  // Enhanced completion calculation
  const calculateCompletion = () => {
    const checks = [
      formData.fullName?.trim(),
      formData.email?.trim(),
      formData.phone?.trim(),
      formData.location?.trim(),
      formData.college?.trim(),
      formData.course?.trim(),
      formData.year?.trim(),
      formData.skills.length > 0,
      formData.experience?.trim(),
      formData.preferredLocations.length > 0,
      formData.workTypes.length > 0,
      formData.resumeUploaded || resumeFile,
    ]

    const completed = checks.filter(Boolean).length
    return Math.round((completed / checks.length) * 100)
  }



































  // Enhanced submit function
  const handleSubmit = async () => {
    // Final validation
    if (!validateStep(0) || !validateStep(1) || !validateStep(2) || !validateStep(4)) {
      showSnackbar("Please complete all required fields", "error")
      return
    }

    const handleSaveProfile = async () => {
      if (saveStatus === "saving") return

      setSaveStatus("saving")

      try {
        const profilePayload = {
          personalInfo: {
            fullName: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            location: formData.location,
            github: formData.github,
            linkedin: formData.linkedin,
            portfolio: formData.portfolio,
          },
          education: {
            college: formData.college,
            course: formData.course,
            year: formData.year,
          },
          skills: formData.skills,
          interests: formData.interests,
          experience: {
            level: formData.experience,
          },
          preferences: {
            preferredLocations: formData.preferredLocations,
            workTypes: formData.workTypes,
          },
        }

        console.log(" Saving profile:", profilePayload)

        const updatedProfile = await mutate(() => candidatesAPI.updateProfile(profilePayload))

        setSaveStatus("saved")
        showSnackbar("Profile saved successfully! 🎉", "success")

        // Clear localStorage progress
        localStorage.removeItem("pmis-profile-progress")

        // Navigate to dashboard after success
       setTimeout(() => {
  console.log('🚀 About to navigate to /recommendations');
  console.log('🔍 Current location:', window.location.pathname);
  
  navigate("/recommendations");
  
  console.log('✅ Navigate called');
}, 2000)
      } catch (error) {
        console.error(" Profile save failed:", error)
        setSaveStatus("error")
        showSnackbar(error.response?.data?.message || error.message || "Failed to save profile", "error")
        setTimeout(() => setSaveStatus("idle"), 3000)
      }
    }

    handleSaveProfile()
  }

  // Get button content based on save status
  const getSubmitButtonContent = () => {
    switch (saveStatus) {
      case "saving":
        return (
          <>
            <CircularProgress size={20} sx={{ mr: 1, color: "white" }} />
            Saving Profile...
          </>
        )
      case "saved":
        return (
          <>
            <CheckCircle sx={{ mr: 1 }} />
            Profile Saved! Redirecting...
          </>
        )
      case "error":
        return (
          <>
            <Warning sx={{ mr: 1 }} />
            Try Again
          </>
        )
      default:
        return (
          <>
            <Rocket sx={{ mr: 1 }} />
            Create Profile 🎉
          </>
        )
    }
  }

  // Load saved progress from localStorage
  useEffect(() => {
    const savedProgress = localStorage.getItem("pmis-profile-progress")
    if (savedProgress) {
      const { formData: savedFormData, activeStep: savedStep } = JSON.parse(savedProgress)
      setFormData(savedFormData)
      setActiveStep(savedStep || 0)
    }
  }, [])

  useEffect(() => {
    if (profileData) {
      setFormData({
        fullName: profileData.personalInfo?.fullName || "",
        email: profileData.personalInfo?.email || "",
        phone: profileData.personalInfo?.phone || "",
        college: profileData.education?.college || "",
        course: profileData.education?.course || "",
        year: profileData.education?.year || "",
        location: profileData.personalInfo?.location || "",
        skills: profileData.skills || [],
        interests: profileData.interests || [],
        experience: profileData.experience?.level || "",
        preferredLocations: profileData.preferences?.preferredLocations || [],
        workTypes: profileData.preferences?.workTypes || [],
        github: profileData.personalInfo?.github || "",
        linkedin: profileData.personalInfo?.linkedin || "",
        portfolio: profileData.personalInfo?.portfolio || "",
        resumeUploaded: profileData.resumeUploaded || false,
      })
    }
  }, [profileData])

  // Loading state
  if (profileLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor={colors.background}>
        <Box textAlign="center">
          <CircularProgress size={60} sx={{ color: colors.primary }} />
          <Typography variant="h6" sx={{ mt: 2, color: colors.primary }}>
            Loading your profile...
          </Typography>
        </Box>
      </Box>
    )
  }

  if (profileError) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor={colors.background}>
        <Box textAlign="center">
          <Alert severity="error" sx={{ mb: 2 }}>
            Failed to load profile: {profileError}
          </Alert>
          <Button variant="contained" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </Box>
      </Box>
    )
  }

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ color: colors.primary, mb: 2, fontWeight: 600 }}>
                👋 Let's start with your basic information
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Full Name *"
                value={formData.fullName}
                onChange={(e) => handleInputChange("fullName", e.target.value)}
                sx={{ mb: 2 }}
                required
                error={!!validationErrors.fullName}
                helperText={validationErrors.fullName}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email Address *"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                sx={{ mb: 2 }}
                required
                error={!!validationErrors.email}
                helperText={validationErrors.email}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone Number *"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                sx={{ mb: 2 }}
                required
                error={!!validationErrors.phone}
                helperText={validationErrors.phone || "Include country code (e.g., +91 9876543210)"}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="City/Location *"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                sx={{ mb: 2 }}
                required
                error={!!validationErrors.location}
                helperText={validationErrors.location || "City, State (e.g., Mumbai, Maharashtra)"}
              />
            </Grid>
          </Grid>
        )

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ color: colors.primary, mb: 2, fontWeight: 600 }}>
                🎓 Tell us about your education
              </Typography>
              <Alert severity="info" sx={{ mb: 3, borderRadius: "12px" }}>
                💡 Can't find your college? Select "+ Add New College" to add it manually
              </Alert>
            </Grid>
            <Grid item xs={12}>
              <Autocomplete
                options={collegeOptions}
                value={formData.college}
                onChange={handleCollegeChange}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="College/University *"
                    fullWidth
                    required
                    error={!!validationErrors.college}
                    helperText={validationErrors.college || "Select your college or add a new one"}
                  />
                )}
                sx={{ mb: 2 }}
                renderOption={(props, option) => (
                  <Box component="li" {...props}>
                    <Box display="flex" alignItems="center" width="100%">
                      {option === "+ Add New College" ? (
                        <>
                          <Add sx={{ mr: 1, color: colors.secondary }} />
                          <Typography sx={{ color: colors.secondary, fontWeight: 600 }}>{option}</Typography>
                        </>
                      ) : (
                        <Typography>{option}</Typography>
                      )}
                    </Box>
                  </Box>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Course/Degree *"
                value={formData.course}
                onChange={(e) => handleInputChange("course", e.target.value)}
                sx={{ mb: 2 }}
                required
                error={!!validationErrors.course}
                helperText={validationErrors.course || "e.g., Computer Science Engineering, BCA, MCA"}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth sx={{ mb: 2 }} required error={!!validationErrors.year}>
                <InputLabel>Current Year *</InputLabel>
                <Select value={formData.year} onChange={(e) => handleInputChange("year", e.target.value)}>
                  <MenuItem value="1st Year">1st Year</MenuItem>
                  <MenuItem value="2nd Year">2nd Year</MenuItem>
                  <MenuItem value="3rd Year">3rd Year</MenuItem>
                  <MenuItem value="4th Year">4th Year</MenuItem>
                  <MenuItem value="Final Year">Final Year</MenuItem>
                  <MenuItem value="Graduated">Graduated</MenuItem>
                  <MenuItem value="Post Graduate">Post Graduate (Master's)</MenuItem>
                </Select>
                {validationErrors.year && (
                  <Typography variant="caption" color="error" sx={{ mt: 1, ml: 2 }}>
                    {validationErrors.year}
                  </Typography>
                )}
              </FormControl>
            </Grid>
          </Grid>
        )

      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ color: colors.primary, mb: 2, fontWeight: 600 }}>
                💻 Your skills and experience
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Autocomplete
                multiple
                freeSolo
                options={skillOptions}
                value={formData.skills}
                onChange={(event, newValue) => handleInputChange("skills", newValue)}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      key={index}
                      label={option}
                      {...getTagProps({ index })}
                      sx={{ bgcolor: `${colors.primary}20`, color: colors.primary, m: 0.5 }}
                    />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Technical Skills *"
                    placeholder="Type or select your skills"
                    error={!!validationErrors.skills}
                    helperText={
                      validationErrors.skills || "Add skills that match your expertise. You can type custom skills too!"
                    }
                  />
                )}
                sx={{ mb: 3 }}
              />
            </Grid>
            <Grid item xs={12}>
              <Autocomplete
                multiple
                freeSolo
                options={interestOptions}
                value={formData.interests}
                onChange={(event, newValue) => handleInputChange("interests", newValue)}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      key={index}
                      label={option}
                      {...getTagProps({ index })}
                      sx={{ bgcolor: `${colors.secondary}20`, color: colors.secondary, m: 0.5 }}
                    />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Areas of Interest"
                    placeholder="What interests you?"
                    helperText="Select areas you're passionate about working in"
                  />
                )}
                sx={{ mb: 3 }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth error={!!validationErrors.experience}>
                <InputLabel>Experience Level *</InputLabel>
                <Select value={formData.experience} onChange={(e) => handleInputChange("experience", e.target.value)}>
                  <MenuItem value="Fresher">Fresher (No experience)</MenuItem>
                  <MenuItem value="Beginner">Beginner (0-1 years)</MenuItem>
                  <MenuItem value="Intermediate">Intermediate (1-2 years)</MenuItem>
                  <MenuItem value="Advanced">Advanced (2+ years)</MenuItem>
                </Select>
                {validationErrors.experience && (
                  <Typography variant="caption" color="error" sx={{ mt: 1, ml: 2 }}>
                    {validationErrors.experience}
                  </Typography>
                )}
              </FormControl>
            </Grid>
          </Grid>
        )

      case 3:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ color: colors.primary, mb: 2, fontWeight: 600 }}>
                📄 Upload Your Resume (Optional but Recommended)
              </Typography>
              <Alert severity="success" sx={{ mb: 3, borderRadius: "12px" }}>
                🚀 Uploading a resume increases your profile visibility by 73% and match accuracy by 45%!
              </Alert>
            </Grid>

            <Grid item xs={12}>
              {!resumeFile ? (
                <Paper
                  sx={{
                    p: 4,
                    textAlign: "center",
                    border: `2px dashed ${colors.primary}40`,
                    borderRadius: "16px",
                    cursor: "pointer",
                    "&:hover": {
                      bgcolor: `${colors.primary}05`,
                      borderColor: colors.primary,
                    },
                    transition: "all 0.3s ease",
                  }}
                  onClick={() => document.getElementById("resume-upload").click()}
                >
                  <input
                    id="resume-upload"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => e.target.files?.[0] && handleResumeUpload(e.target.files[0])}
                    style={{ display: "none" }}
                  />
                  <CloudUpload sx={{ fontSize: 60, color: colors.primary, mb: 2 }} />
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    Click to Upload Resume
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Supported formats: PDF, DOC, DOCX (Max 5MB)
                  </Typography>
                  <Button
                    variant="contained"
                    sx={{
                      background: colors.gradient.secondary,
                      px: 3,
                    }}
                  >
                    Choose File
                  </Button>
                </Paper>
              ) : (
                <Paper
                  sx={{
                    p: 3,
                    border: `2px solid ${colors.success}`,
                    borderRadius: "16px",
                    bgcolor: `${colors.success}10`,
                  }}
                >
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                    <Box display="flex" alignItems="center">
                      <Description sx={{ color: colors.success, mr: 2, fontSize: 40 }} />
                      <Box>
                        <Typography variant="h6" sx={{ color: colors.success }}>
                          {resumeFile.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {(resumeFile.size / 1024 / 1024).toFixed(2)} MB
                        </Typography>
                      </Box>
                    </Box>
                    <IconButton onClick={handleResumeDelete} sx={{ color: colors.error }}>
                      <Delete />
                    </IconButton>
                  </Box>

                  {uploadProgress < 100 ? (
                    <Box>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        Uploading... {uploadProgress}%
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={uploadProgress}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          bgcolor: "rgba(255,255,255,0.3)",
                          "& .MuiLinearProgress-bar": {
                            bgcolor: colors.success,
                            borderRadius: 4,
                          },
                        }}
                      />
                    </Box>
                  ) : (
                    <Alert severity="success" sx={{ borderRadius: "8px" }}>
                      ✅ Resume uploaded successfully! This will boost your profile visibility.
                    </Alert>
                  )}
                </Paper>
              )}
            </Grid>
          </Grid>
        )

      case 4:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ color: colors.primary, mb: 2, fontWeight: 600 }}>
                🎯 Your internship preferences
              </Typography>
              <Alert severity="info" sx={{ mb: 3, borderRadius: "12px" }}>
                💡 Select multiple options to increase your chances of finding the perfect match!
              </Alert>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth sx={{ mb: 2 }} error={!!validationErrors.preferredLocations}>
                <InputLabel>Preferred Locations *</InputLabel>
                <Select
                  multiple
                  value={formData.preferredLocations}
                  onChange={(e) => handleInputChange("preferredLocations", e.target.value)}
                  renderValue={(selected) => (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip
                          key={value}
                          label={value}
                          size="small"
                          sx={{ bgcolor: `${colors.primary}20`, color: colors.primary }}
                        />
                      ))}
                    </Box>
                  )}
                >
                  {locationOptions.map((location) => (
                    <MenuItem key={location} value={location}>
                      <Checkbox checked={formData.preferredLocations.indexOf(location) > -1} />
                      <LocationOn sx={{ mr: 1, fontSize: 18 }} />
                      {location}
                    </MenuItem>
                  ))}
                </Select>
                {validationErrors.preferredLocations && (
                  <Typography variant="caption" color="error" sx={{ mt: 1, ml: 2 }}>
                    {validationErrors.preferredLocations}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth sx={{ mb: 2 }} error={!!validationErrors.workTypes}>
                <InputLabel>Work Type *</InputLabel>
                <Select
                  multiple
                  value={formData.workTypes}
                  onChange={(e) => handleInputChange("workTypes", e.target.value)}
                  renderValue={(selected) => (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip
                          key={value}
                          label={value}
                          size="small"
                          sx={{ bgcolor: `${colors.secondary}20`, color: colors.secondary }}
                        />
                      ))}
                    </Box>
                  )}
                >
                  {workTypeOptions.map((workType) => (
                    <MenuItem key={workType} value={workType}>
                      <Checkbox checked={formData.workTypes.indexOf(workType) > -1} />
                      <Work sx={{ mr: 1, fontSize: 18 }} />
                      {workType}
                    </MenuItem>
                  ))}
                </Select>
                {validationErrors.workTypes && (
                  <Typography variant="caption" color="error" sx={{ mt: 1, ml: 2 }}>
                    {validationErrors.workTypes}
                  </Typography>
                )}
              </FormControl>
            </Grid>
          </Grid>
        )

      case 5:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ color: colors.primary, mb: 2, fontWeight: 600 }}>
                🔗 Additional Links (Optional)
              </Typography>
              <Alert severity="info" sx={{ mb: 3, borderRadius: "12px" }}>
                Adding portfolio links increases your profile strength and helps recruiters understand your work better!
              </Alert>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="GitHub Username"
                value={formData.github}
                onChange={(e) => handleInputChange("github", e.target.value)}
                sx={{ mb: 2 }}
                helperText="Just the username (e.g., yashrajchavan)"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="LinkedIn Profile"
                value={formData.linkedin}
                onChange={(e) => handleInputChange("linkedin", e.target.value)}
                sx={{ mb: 2 }}
                helperText="Your LinkedIn username or full URL"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Portfolio Website"
                value={formData.portfolio}
                onChange={(e) => handleInputChange("portfolio", e.target.value)}
                sx={{ mb: 2 }}
                helperText="Your personal website, Behance, or any project showcase"
              />
            </Grid>

            {/* Enhanced Profile Dashboard Summary */}
            <Grid item xs={12}>
              <Paper
                sx={{
                  p: 4,
                  mt: 2,
                  background: colors.gradient.primary,
                  color: "white",
                  borderRadius: "20px",
                  position: "relative",
                  overflow: "hidden",
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: "linear-gradient(45deg, rgba(255,255,255,0.1) 0%, transparent 100%)",
                    pointerEvents: "none",
                  },
                }}
              >
                <Box position="relative" zIndex={1}>
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
                    <Typography variant="h5" sx={{ fontWeight: 700, display: "flex", alignItems: "center", gap: 2 }}>
                      <Dashboard /> Profile Dashboard
                    </Typography>
                    <Box textAlign="center">
                      <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
                        {calculateCompletion()}%
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Complete
                      </Typography>
                    </Box>
                  </Box>

                  <LinearProgress
                    variant="determinate"
                    value={calculateCompletion()}
                    sx={{
                      height: 12,
                      borderRadius: 6,
                      bgcolor: "rgba(255,255,255,0.2)",
                      mb: 4,
                      "& .MuiLinearProgress-bar": {
                        bgcolor: colors.secondary,
                        borderRadius: 6,
                      },
                    }}
                  />

                  <Grid container spacing={3}>
                    {/* Personal Info Card */}
                    <Grid item xs={12} md={4}>
                      <Paper sx={{ p: 3, bgcolor: "rgba(255,255,255,0.1)", borderRadius: "16px" }}>
                        <Box display="flex" alignItems="center" mb={2}>
                          <Avatar sx={{ bgcolor: colors.secondary, mr: 2 }}>
                            <Person />
                          </Avatar>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            Personal Info
                          </Typography>
                        </Box>
                        <List dense>
                          <ListItem sx={{ px: 0 }}>
                            <ListItemIcon sx={{ minWidth: 30 }}>
                              {formData.fullName ? (
                                <CheckCircle sx={{ color: colors.success, fontSize: 20 }} />
                              ) : (
                                <Assignment sx={{ color: "rgba(255,255,255,0.5)", fontSize: 20 }} />
                              )}
                            </ListItemIcon>
                            <ListItemText
                              primary={formData.fullName || "Name not provided"}
                              primaryTypographyProps={{ variant: "body2" }}
                            />
                          </ListItem>
                          <ListItem sx={{ px: 0 }}>
                            <ListItemIcon sx={{ minWidth: 30 }}>
                              {formData.email ? (
                                <CheckCircle sx={{ color: colors.success, fontSize: 20 }} />
                              ) : (
                                <Email sx={{ color: "rgba(255,255,255,0.5)", fontSize: 20 }} />
                              )}
                            </ListItemIcon>
                            <ListItemText
                              primary={formData.email || "Email not provided"}
                              primaryTypographyProps={{ variant: "body2" }}
                            />
                          </ListItem>
                          <ListItem sx={{ px: 0 }}>
                            <ListItemIcon sx={{ minWidth: 30 }}>
                              {formData.location ? (
                                <CheckCircle sx={{ color: colors.success, fontSize: 20 }} />
                              ) : (
                                <LocationOn sx={{ color: "rgba(255,255,255,0.5)", fontSize: 20 }} />
                              )}
                            </ListItemIcon>
                            <ListItemText
                              primary={formData.location || "Location not provided"}
                              primaryTypographyProps={{ variant: "body2" }}
                            />
                          </ListItem>
                        </List>
                      </Paper>
                    </Grid>

                    {/* Education Card */}
                    <Grid item xs={12} md={4}>
                      <Paper sx={{ p: 3, bgcolor: "rgba(255,255,255,0.1)", borderRadius: "16px" }}>
                        <Box display="flex" alignItems="center" mb={2}>
                          <Avatar sx={{ bgcolor: colors.success, mr: 2 }}>
                            <School />
                          </Avatar>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            Education
                          </Typography>
                        </Box>
                        <List dense>
                          <ListItem sx={{ px: 0 }}>
                            <ListItemIcon sx={{ minWidth: 30 }}>
                              {formData.college ? (
                                <CheckCircle sx={{ color: colors.success, fontSize: 20 }} />
                              ) : (
                                <Business sx={{ color: "rgba(255,255,255,0.5)", fontSize: 20 }} />
                              )}
                            </ListItemIcon>
                            <ListItemText
                              primary={formData.college || "College not selected"}
                              primaryTypographyProps={{ variant: "body2" }}
                            />
                          </ListItem>
                          <ListItem sx={{ px: 0 }}>
                            <ListItemIcon sx={{ minWidth: 30 }}>
                              {formData.course ? (
                                <CheckCircle sx={{ color: colors.success, fontSize: 20 }} />
                              ) : (
                                <Code sx={{ color: "rgba(255,255,255,0.5)", fontSize: 20 }} />
                              )}
                            </ListItemIcon>
                            <ListItemText
                              primary={formData.course || "Course not provided"}
                              primaryTypographyProps={{ variant: "body2" }}
                            />
                          </ListItem>
                          <ListItem sx={{ px: 0 }}>
                            <ListItemIcon sx={{ minWidth: 30 }}>
                              {formData.year ? (
                                <CheckCircle sx={{ color: colors.success, fontSize: 20 }} />
                              ) : (
                                <Star sx={{ color: "rgba(255,255,255,0.5)", fontSize: 20 }} />
                              )}
                            </ListItemIcon>
                            <ListItemText
                              primary={formData.year || "Year not selected"}
                              primaryTypographyProps={{ variant: "body2" }}
                            />
                          </ListItem>
                        </List>
                      </Paper>
                    </Grid>

                    {/* Skills & Preferences Card */}
                    <Grid item xs={12} md={4}>
                      <Paper sx={{ p: 3, bgcolor: "rgba(255,255,255,0.1)", borderRadius: "16px" }}>
                        <Box display="flex" alignItems="center" mb={2}>
                          <Avatar sx={{ bgcolor: colors.accent, mr: 2 }}>
                            <TrendingUp />
                          </Avatar>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            Profile Strength
                          </Typography>
                        </Box>
                        <List dense>
                          <ListItem sx={{ px: 0 }}>
                            <ListItemIcon sx={{ minWidth: 30 }}>
                              <Badge badgeContent={formData.skills.length} color="secondary">
                                <Psychology sx={{ color: "white", fontSize: 20 }} />
                              </Badge>
                            </ListItemIcon>
                            <ListItemText
                              primary={`${formData.skills.length} Skills Added`}
                              primaryTypographyProps={{ variant: "body2" }}
                            />
                          </ListItem>
                          <ListItem sx={{ px: 0 }}>
                            <ListItemIcon sx={{ minWidth: 30 }}>
                              <Badge badgeContent={formData.preferredLocations.length} color="secondary">
                                <LocationOn sx={{ color: "white", fontSize: 20 }} />
                              </Badge>
                            </ListItemIcon>
                            <ListItemText
                              primary={`${formData.preferredLocations.length} Locations Selected`}
                              primaryTypographyProps={{ variant: "body2" }}
                            />
                          </ListItem>
                          <ListItem sx={{ px: 0 }}>
                            <ListItemIcon sx={{ minWidth: 30 }}>
                              {resumeFile || formData.resumeUploaded ? (
                                <Verified sx={{ color: colors.success, fontSize: 20 }} />
                              ) : (
                                <Description sx={{ color: "rgba(255,255,255,0.5)", fontSize: 20 }} />
                              )}
                            </ListItemIcon>
                            <ListItemText
                              primary={resumeFile || formData.resumeUploaded ? "✅ Resume Uploaded" : "❌ No Resume"}
                              primaryTypographyProps={{ variant: "body2" }}
                            />
                          </ListItem>
                        </List>
                      </Paper>
                    </Grid>
                  </Grid>

                  {/* Quick Stats Row */}
                  <Box mt={4}>
                    <Divider sx={{ bgcolor: "rgba(255,255,255,0.2)", mb: 3 }} />
                    <Grid container spacing={2}>
                      {[
                        {
                          label: "Profile Views Expected",
                          value: `${Math.round(calculateCompletion() * 0.5)}+`,
                          icon: <Analytics />,
                        },
                        {
                          label: "AI Match Accuracy",
                          value: `${Math.min(95, calculateCompletion() + 5)}%`,
                          icon: <SmartToy />,
                        },
                        {
                          label: "Interview Chances",
                          value: `${Math.round(calculateCompletion() * 0.3)}%`,
                          icon: <Groups />,
                        },
                      ].map((stat, index) => (
                        <Grid item xs={4} key={index}>
                          <Box textAlign="center">
                            <Avatar sx={{ bgcolor: "rgba(255,255,255,0.2)", mx: "auto", mb: 1 }}>{stat.icon}</Avatar>
                            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                              {stat.value}
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.8, fontSize: "0.75rem" }}>
                              {stat.label}
                            </Typography>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        )

      default:
        return null
    }
  }

  return (
    <Box sx={{ background: `linear-gradient(180deg, ${colors.background} 0%, #ffffff 100%)`, minHeight: "100vh" }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <motion.div
          ref={headerRef}
          variants={containerVariants}
          initial="hidden"
          animate={isHeaderInView ? "visible" : "hidden"}
        >
          <motion.div variants={itemVariants}>
            <Box textAlign="center" mb={6}>
              <Typography
                variant="h2"
                sx={{
                  background: colors.gradient.hero,
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  fontWeight: 800,
                  fontSize: { xs: "3rem", md: "4rem" },
                  mb: 2,
                }}
              >
                Create Your PMIS Profile
              </Typography>
              <Typography variant="h5" sx={{ color: colors.text, mb: 3 }}>
                Join the AI-powered internship revolution 🚀
              </Typography>
              <Alert
                severity="info"
                sx={{
                  maxWidth: "700px",
                  mx: "auto",
                  borderRadius: "12px",
                  background: `${colors.primary}10`,
                  border: `1px solid ${colors.primary}30`,
                }}
              >
                🎯 Complete profile gets <strong>3x more internship matches</strong> with our AI algorithm
              </Alert>
            </Box>
          </motion.div>
        </motion.div>

        {/* Progress Stepper */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Paper
            sx={{
              p: 3,
              mb: 4,
              borderRadius: "20px",
              background: colors.gradient.primary,
              color: "white",
            }}
          >
            <Stepper
              activeStep={activeStep}
              sx={{
                "& .MuiStepLabel-label": { color: "rgba(255,255,255,0.8)", fontSize: "0.9rem" },
                "& .MuiStepLabel-label.Mui-active": { color: "white", fontWeight: 600 },
                "& .MuiStepLabel-label.Mui-completed": { color: "white" },
              }}
            >
              {steps.map((label, index) => (
                <Step key={label}>
                  <StepLabel
                    StepIconComponent={({ active, completed }) => (
                      <Avatar
                        sx={{
                          bgcolor: completed ? colors.success : active ? colors.secondary : "rgba(255,255,255,0.3)",
                          width: 35,
                          height: 35,
                          fontSize: "0.9rem",
                        }}
                      >
                        {completed ? <CheckCircle /> : index + 1}
                      </Avatar>
                    )}
                  >
                    {label}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </Paper>
        </motion.div>

        {/* Form Content */}
        <motion.div
          key={activeStep}
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -50, opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card sx={{ p: 4, borderRadius: "20px", mb: 4, boxShadow: "0 10px 40px rgba(0,0,0,0.1)" }}>
            <CardContent>{renderStepContent(activeStep)}</CardContent>
          </Card>
        </motion.div>

        {/* Navigation Buttons */}
        <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Button
              onClick={handleBack}
              disabled={activeStep === 0 || saveStatus === "saving"}
              startIcon={<ArrowBack />}
              sx={{
                visibility: activeStep === 0 ? "hidden" : "visible",
                color: colors.primary,
                px: 3,
                py: 1.5,
                "&:hover": {
                  bgcolor: `${colors.primary}10`,
                  transform: "translateY(-2px)",
                },
                transition: "all 0.3s ease",
              }}
            >
              Back
            </Button>

            <Box textAlign="center">
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Step {activeStep + 1} of {steps.length}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={((activeStep + 1) / steps.length) * 100}
                sx={{
                  width: 100,
                  height: 6,
                  borderRadius: 3,
                  bgcolor: `${colors.primary}20`,
                  "& .MuiLinearProgress-bar": {
                    bgcolor: colors.primary,
                    borderRadius: 3,
                  },
                }}
              />
            </Box>

            {activeStep === steps.length - 1 ? (
              <Button
                onClick={handleSubmit}
                variant="contained"
                disabled={saveStatus === "saving" || saveStatus === "saved"}
                sx={{
                  px: 4,
                  py: 1.5,
                  background:
                    saveStatus === "saved"
                      ? colors.gradient.success
                      : saveStatus === "error"
                        ? colors.gradient.error
                        : colors.gradient.success,
                  "&:hover": {
                    transform: saveStatus === "saving" ? "none" : "translateY(-2px)",
                    boxShadow: saveStatus === "saving" ? "none" : `0 8px 25px ${colors.success}40`,
                  },
                  "&:disabled": {
                    background: saveStatus === "saved" ? colors.gradient.success : colors.gradient.primary,
                    color: "white",
                  },
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              >
                {getSubmitButtonContent()}
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                variant="contained"
                endIcon={<ArrowForward />}
                disabled={saveStatus === "saving"}
                sx={{
                  px: 4,
                  py: 1.5,
                  background: colors.gradient.secondary,
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: `0 8px 25px ${colors.secondary}40`,
                  },
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              >
                Next
              </Button>
            )}
          </Box>
        </motion.div>

        {/* Benefits Section */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <Paper
            sx={{
              p: 4,
              mt: 6,
              borderRadius: "20px",
              background: colors.gradient.success,
              color: "white",
              textAlign: "center",
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
              🎯 Why Create Your PMIS Profile?
            </Typography>
            <Grid container spacing={3}>
              {[
                { icon: <SmartToy />, title: "AI-Powered Matching", desc: "92% accuracy in recommendations" },
                { icon: <TrendingUp />, title: "Higher Success Rate", desc: "73% more profile visibility" },
                { icon: <AccessibilityNew />, title: "Multi-Channel Access", desc: "SMS, WhatsApp, Voice support" },
                { icon: <Security />, title: "Government Verified", desc: "Official PMIS integration" },
              ].map((benefit, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    transition={{ delay: index * 0.1, duration: 0.6 }}
                    viewport={{ once: true }}
                  >
                    <Box>
                      <Avatar sx={{ bgcolor: "rgba(255,255,255,0.2)", mx: "auto", mb: 2, width: 60, height: 60 }}>
                        {benefit.icon}
                      </Avatar>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                        {benefit.title}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        {benefit.desc}
                      </Typography>
                    </Box>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </motion.div>
      </Container>

      {/* Add New College Dialog */}
      <Dialog open={openCollegeDialog} onClose={() => setOpenCollegeDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: colors.primary, color: "white" }}>
          <Box display="flex" alignItems="center" gap={2}>
            <Add /> Add New College
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <TextField
            fullWidth
            label="College/University Name"
            value={newCollegeName}
            onChange={(e) => setNewCollegeName(e.target.value)}
            placeholder="Enter the full name of your college"
            sx={{ mb: 2 }}
          />
          <Alert severity="info" sx={{ borderRadius: "8px" }}>
            💡 Make sure to enter the complete and official name of your college/university
          </Alert>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenCollegeDialog(false)}>Cancel</Button>
          <Button
            onClick={handleAddNewCollege}
            variant="contained"
            disabled={!newCollegeName.trim()}
            sx={{ background: colors.gradient.secondary }}
          >
            Add College
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{
            borderRadius: "12px",
            minWidth: "300px",
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default ProfilePage
