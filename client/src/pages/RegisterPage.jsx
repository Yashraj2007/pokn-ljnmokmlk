import React, { useState } from "react";
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Grid,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
  PersonOutlined,
  EmailOutlined,
  LockOutlined,
  PhoneOutlined,
  Visibility,
  VisibilityOff,
  BusinessCenterOutlined,
  ShieldOutlined,
  VerifiedUserOutlined,
  TrendingUpOutlined,
  GroupOutlined,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
    role: 'candidate'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError("");
  };

  const validate = () => {
    if (!formData.name || formData.name.trim().length === 0) {
      setError("Name is required");
      return false;
    }
    
    if (!formData.email || formData.email.trim().length === 0) {
      setError("Email is required");
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }
    
    if (!formData.password) {
      setError("Password is required");
      return false;
    }
    
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!validate()) return;
    
    setLoading(true);

    try {
      const registrationData = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        mobile: formData.mobile?.trim() || '',
        password: formData.password,
        role: formData.role
      };

      console.log('🚀 [FRONTEND] Registration data:', registrationData);

      await register(registrationData);
      navigate("/", { replace: true });
    } catch (error) {
      console.error('❌ [FRONTEND] Registration error:', error);
      setError(
        error.response?.data?.message || 
        error.message || 
        "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const leftPanelVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  const rightPanelVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <Box
        sx={{
          minHeight: "100vh",
          background: `
            linear-gradient(135deg, #fafbfc 0%, #f8fafc 25%, #ffffff 50%, #fafbfc 75%, #f5f7fa 100%),
            radial-gradient(ellipse at top left, rgba(38, 71, 114, 0.05) 0%, transparent 50%),
            radial-gradient(ellipse at bottom right, rgba(246, 168, 33, 0.03) 0%, transparent 50%)
          `,
          position: "relative",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `
              linear-gradient(90deg, rgba(38, 71, 114, 0.02) 1px, transparent 1px),
              linear-gradient(rgba(38, 71, 114, 0.02) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
          },
        }}
      >
        <Container maxWidth="xl" sx={{ position: "relative", zIndex: 1 }}>
          <Grid container sx={{ minHeight: "100vh" }}>
            {/* Left Side - Branding */}
            <Grid 
              item 
              xs={false} 
              md={7} 
              sx={{
                background: `linear-gradient(135deg, #264772 0%, #1e3a5f 50%, #264772 100%)`,
                position: "relative",
                display: { xs: "none", md: "flex" },
                alignItems: "center",
                justifyContent: "center",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: `
                    radial-gradient(circle at 30% 20%, rgba(246, 168, 33, 0.1) 0%, transparent 50%),
                    radial-gradient(circle at 70% 80%, rgba(246, 168, 33, 0.08) 0%, transparent 50%)
                  `,
                },
              }}
            >
              <motion.div
                variants={leftPanelVariants}
                style={{ position: "relative", zIndex: 2, textAlign: "center", padding: "0 4rem" }}
              >
                <motion.div
                  initial={{ scale: 0.8, rotate: -10 }}
                  animate={{ 
                    scale: 1, 
                    rotate: 0,
                    transition: {
                      duration: 1,
                      ease: "easeOut",
                      delay: 0.3
                    }
                  }}
                  whileHover={{ 
                    scale: 1.05,
                    transition: { duration: 0.3 }
                  }}
                >
                  <Box
                    sx={{
                      width: 120,
                      height: 120,
                      borderRadius: 4,
                      background: `linear-gradient(135deg, #f6a821 0%, #fbbf24 100%)`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mx: "auto",
                      mb: 6,
                      boxShadow: `
                        0 25px 60px rgba(0, 0, 0, 0.3),
                        inset 0 1px 0 rgba(255, 255, 255, 0.2)
                      `,
                    }}
                  >
                    <GroupOutlined sx={{ fontSize: 60, color: "#ffffff" }} />
                  </Box>
                </motion.div>

                <motion.div
                  variants={itemVariants}
                >
                  <Typography
                    variant="h2"
                    sx={{
                      color: "#ffffff",
                      fontWeight: 800,
                      mb: 3,
                      fontSize: { md: "3rem", lg: "3.5rem" },
                      lineHeight: 1.1,
                      letterSpacing: "-0.02em",
                      textShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
                    }}
                  >
                    Join Our Community
                    <Box component="span" sx={{ display: "block", color: "#f6a821" }}>
                      Start Your Journey
                    </Box>
                  </Typography>
                </motion.div>

                <motion.div
                  variants={itemVariants}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      color: "rgba(255, 255, 255, 0.9)",
                      fontWeight: 400,
                      mb: 8,
                      fontSize: "1.25rem",
                      lineHeight: 1.6,
                      maxWidth: 500,
                      mx: "auto",
                    }}
                  >
                    Create your account to access exclusive internship opportunities and career growth resources
                  </Typography>
                </motion.div>

                <motion.div
                  variants={itemVariants}
                >
                  <Box sx={{ display: "flex", justifyContent: "center", gap: 6 }}>
                    {[
                      { icon: <ShieldOutlined />, text: "Secure Platform" },
                      { icon: <VerifiedUserOutlined />, text: "Verified Companies" },
                      { icon: <TrendingUpOutlined />, text: "Career Growth" },
                    ].map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ 
                          opacity: 1, 
                          y: 0,
                          transition: {
                            duration: 0.6,
                            delay: 0.8 + index * 0.2,
                            ease: "easeOut"
                          }
                        }}
                        whileHover={{
                          scale: 1.1,
                          transition: { duration: 0.2 }
                        }}
                        style={{ textAlign: "center" }}
                      >
                        <Box
                          sx={{
                            width: 64,
                            height: 64,
                            borderRadius: 2,
                            background: "rgba(255, 255, 255, 0.1)",
                            backdropFilter: "blur(10px)",
                            border: "1px solid rgba(255, 255, 255, 0.2)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            mx: "auto",
                            mb: 2,
                          }}
                        >
                          {React.cloneElement(item.icon, { 
                            sx: { fontSize: 28, color: "#f6a821" } 
                          })}
                        </Box>
                        <Typography
                          variant="caption"
                          sx={{
                            color: "rgba(255, 255, 255, 0.8)",
                            fontWeight: 600,
                            fontSize: "0.75rem",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                          }}
                        >
                          {item.text}
                        </Typography>
                      </motion.div>
                    ))}
                  </Box>
                </motion.div>
              </motion.div>
            </Grid>

            {/* Right Side - Registration Form */}
            <Grid 
              item 
              xs={12} 
              md={5} 
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                py: { xs: 4, md: 6 },
                px: { xs: 2, md: 4 },
              }}
            >
              <motion.div
                variants={rightPanelVariants}
                style={{ width: "100%", maxWidth: 480 }}
              >
                <motion.div
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  animate={{ 
                    opacity: 1, 
                    y: 0, 
                    scale: 1,
                    transition: {
                      duration: 0.7,
                      ease: "easeOut",
                      delay: 0.4
                    }
                  }}
                >
                  <Paper
                    elevation={0}
                    sx={{
                      p: { xs: 4, sm: 5, md: 6 },
                      borderRadius: 4,
                      background: "#ffffff",
                      border: "1px solid rgba(38, 71, 114, 0.08)",
                      boxShadow: `
                        0 32px 64px rgba(38, 71, 114, 0.08),
                        0 16px 32px rgba(38, 71, 114, 0.04),
                        0 8px 16px rgba(0, 0, 0, 0.04)
                      `,
                      position: "relative",
                      "&::before": {
                        content: '""',
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 4,
                        borderRadius: "16px 16px 0 0",
                        background: `linear-gradient(90deg, #264772 0%, #f6a821 100%)`,
                      },
                    }}
                  >
                    {/* Header */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ 
                        opacity: 1, 
                        y: 0,
                        transition: {
                          duration: 0.5,
                          delay: 0.6
                        }
                      }}
                    >
                      <Box sx={{ mb: 4 }}>
                        <Typography
                          variant="h3"
                          sx={{
                            fontWeight: 700,
                            color: "#111827",
                            mb: 1,
                            fontSize: { xs: "1.75rem", sm: "2.25rem" },
                            lineHeight: 1.2,
                            letterSpacing: "-0.025em",
                          }}
                        >
                          Create Account
                        </Typography>
                        
                        <Typography
                          variant="body1"
                          sx={{
                            color: "#6b7280",
                            fontSize: "1rem",
                            lineHeight: 1.5,
                            fontWeight: 500,
                          }}
                        >
                          Join PMIS and unlock your career potential
                        </Typography>
                      </Box>
                    </motion.div>

                    {/* Error Alert */}
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Alert
                          severity="error"
                          sx={{
                            mb: 4,
                            borderRadius: 2,
                            backgroundColor: "#fef2f2",
                            border: "1px solid #fecaca",
                            "& .MuiAlert-message": {
                              color: "#dc2626",
                              fontWeight: 500,
                              fontSize: "0.9rem",
                            },
                            "& .MuiAlert-icon": {
                              color: "#dc2626",
                            },
                          }}
                        >
                          {error}
                        </Alert>
                      </motion.div>
                    )}

                    {/* Registration Form */}
                    <Box component="form" onSubmit={handleSubmit}>
                      {/* Name Field */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ 
                          opacity: 1, 
                          y: 0,
                          transition: {
                            duration: 0.5,
                            delay: 0.8
                          }
                        }}
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Box sx={{ mb: 3 }}>
                          <Typography
                            component="label"
                            sx={{
                              display: "block",
                              fontSize: "0.875rem",
                              fontWeight: 600,
                              color: "#374151",
                              mb: 1.5,
                              letterSpacing: "0.025em",
                            }}
                          >
                            FULL NAME
                          </Typography>
                          <TextField
                            fullWidth
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                            placeholder="Enter your full name"
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                backgroundColor: "#fafbfc",
                                borderRadius: 3,
                                fontSize: "1rem",
                                fontWeight: 500,
                                transition: "all 0.3s ease",
                                "& fieldset": {
                                  borderColor: "#e5e7eb",
                                  borderWidth: "2px",
                                },
                                "&:hover": {
                                  backgroundColor: "#ffffff",
                                  transform: "translateY(-1px)",
                                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                                  "& fieldset": {
                                    borderColor: "#d1d5db",
                                  },
                                },
                                "&.Mui-focused": {
                                  backgroundColor: "#ffffff",
                                  transform: "translateY(-1px)",
                                  boxShadow: "0 4px 12px rgba(38, 71, 114, 0.15)",
                                  "& fieldset": {
                                    borderColor: "#264772",
                                    borderWidth: "2px",
                                  },
                                },
                              },
                              "& .MuiInputBase-input": {
                                py: 2.5,
                                px: 3,
                                "&::placeholder": {
                                  color: "#9ca3af",
                                  opacity: 1,
                                  fontWeight: 400,
                                },
                              },
                            }}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <PersonOutlined sx={{ color: "#6b7280", fontSize: 22 }} />
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Box>
                      </motion.div>

                      {/* Email Field */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ 
                          opacity: 1, 
                          y: 0,
                          transition: {
                            duration: 0.5,
                            delay: 0.9
                          }
                        }}
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Box sx={{ mb: 3 }}>
                          <Typography
                            component="label"
                            sx={{
                              display: "block",
                              fontSize: "0.875rem",
                              fontWeight: 600,
                              color: "#374151",
                              mb: 1.5,
                              letterSpacing: "0.025em",
                            }}
                          >
                            EMAIL ADDRESS
                          </Typography>
                          <TextField
                            fullWidth
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            placeholder="Enter your email address"
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                backgroundColor: "#fafbfc",
                                borderRadius: 3,
                                fontSize: "1rem",
                                fontWeight: 500,
                                transition: "all 0.3s ease",
                                "& fieldset": {
                                  borderColor: "#e5e7eb",
                                  borderWidth: "2px",
                                },
                                "&:hover": {
                                  backgroundColor: "#ffffff",
                                  transform: "translateY(-1px)",
                                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                                  "& fieldset": {
                                    borderColor: "#d1d5db",
                                  },
                                },
                                "&.Mui-focused": {
                                  backgroundColor: "#ffffff",
                                  transform: "translateY(-1px)",
                                  boxShadow: "0 4px 12px rgba(38, 71, 114, 0.15)",
                                  "& fieldset": {
                                    borderColor: "#264772",
                                    borderWidth: "2px",
                                  },
                                },
                              },
                              "& .MuiInputBase-input": {
                                py: 2.5,
                                px: 3,
                                "&::placeholder": {
                                  color: "#9ca3af",
                                  opacity: 1,
                                  fontWeight: 400,
                                },
                              },
                            }}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <EmailOutlined sx={{ color: "#6b7280", fontSize: 22 }} />
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Box>
                      </motion.div>

                      {/* Mobile & Role Row */}
                      <Grid container spacing={2} sx={{ mb: 3 }}>
                        {/* Mobile Field */}
                        <Grid item xs={12} sm={6}>
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ 
                              opacity: 1, 
                              y: 0,
                              transition: {
                                duration: 0.5,
                                delay: 1.0
                              }
                            }}
                            whileHover={{ scale: 1.02 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Typography
                              component="label"
                              sx={{
                                display: "block",
                                fontSize: "0.875rem",
                                fontWeight: 600,
                                color: "#374151",
                                mb: 1.5,
                                letterSpacing: "0.025em",
                              }}
                            >
                              MOBILE (OPTIONAL)
                            </Typography>
                            <TextField
                              fullWidth
                              name="mobile"
                              value={formData.mobile}
                              onChange={handleInputChange}
                              placeholder="Enter mobile number"
                              sx={{
                                "& .MuiOutlinedInput-root": {
                                  backgroundColor: "#fafbfc",
                                  borderRadius: 3,
                                  fontSize: "1rem",
                                  fontWeight: 500,
                                  transition: "all 0.3s ease",
                                  "& fieldset": {
                                    borderColor: "#e5e7eb",
                                    borderWidth: "2px",
                                  },
                                  "&:hover": {
                                    backgroundColor: "#ffffff",
                                    transform: "translateY(-1px)",
                                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                                    "& fieldset": {
                                      borderColor: "#d1d5db",
                                    },
                                  },
                                  "&.Mui-focused": {
                                    backgroundColor: "#ffffff",
                                    transform: "translateY(-1px)",
                                    boxShadow: "0 4px 12px rgba(38, 71, 114, 0.15)",
                                    "& fieldset": {
                                      borderColor: "#264772",
                                      borderWidth: "2px",
                                    },
                                  },
                                },
                                "& .MuiInputBase-input": {
                                  py: 2.5,
                                  px: 3,
                                  "&::placeholder": {
                                    color: "#9ca3af",
                                    opacity: 1,
                                    fontWeight: 400,
                                  },
                                },
                              }}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <PhoneOutlined sx={{ color: "#6b7280", fontSize: 22 }} />
                                  </InputAdornment>
                                ),
                              }}
                            />
                          </motion.div>
                        </Grid>

                        {/* Role Field */}
                        <Grid item xs={12} sm={6}>
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ 
                              opacity: 1, 
                              y: 0,
                              transition: {
                                duration: 0.5,
                                delay: 1.1
                              }
                            }}
                            whileHover={{ scale: 1.02 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Typography
                              component="label"
                              sx={{
                                display: "block",
                                fontSize: "0.875rem",
                                fontWeight: 600,
                                color: "#374151",
                                mb: 1.5,
                                letterSpacing: "0.025em",
                              }}
                            >
                              I AM A
                            </Typography>
                            <FormControl fullWidth>
                              <Select
                                name="role"
                                value={formData.role}
                                onChange={handleInputChange}
                                sx={{
                                  backgroundColor: "#fafbfc",
                                  borderRadius: 3,
                                  fontSize: "1rem",
                                  fontWeight: 500,
                                  transition: "all 0.3s ease",
                                  "& fieldset": {
                                    borderColor: "#e5e7eb",
                                    borderWidth: "2px",
                                  },
                                  "&:hover": {
                                    backgroundColor: "#ffffff",
                                    transform: "translateY(-1px)",
                                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                                    "& fieldset": {
                                      borderColor: "#d1d5db",
                                    },
                                  },
                                  "&.Mui-focused": {
                                    backgroundColor: "#ffffff",
                                    transform: "translateY(-1px)",
                                    boxShadow: "0 4px 12px rgba(38, 71, 114, 0.15)",
                                    "& fieldset": {
                                      borderColor: "#264772",
                                      borderWidth: "2px",
                                    },
                                  },
                                  "& .MuiSelect-select": {
                                    py: 2.5,
                                    px: 3,
                                  },
                                }}
                              >
                                <MenuItem value="candidate">Student/Job Seeker</MenuItem>
                                <MenuItem value="recruiter">Recruiter/Company</MenuItem>
                              </Select>
                            </FormControl>
                          </motion.div>
                        </Grid>
                      </Grid>

                      {/* Password Fields */}
                      <Grid container spacing={2} sx={{ mb: 4 }}>
                        {/* Password Field */}
                        <Grid item xs={12} sm={6}>
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ 
                              opacity: 1, 
                              y: 0,
                              transition: {
                                duration: 0.5,
                                delay: 1.2
                              }
                            }}
                            whileHover={{ scale: 1.02 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Typography
                              component="label"
                              sx={{
                                display: "block",
                                fontSize: "0.875rem",
                                fontWeight: 600,
                                color: "#374151",
                                mb: 1.5,
                                letterSpacing: "0.025em",
                              }}
                            >
                              PASSWORD
                            </Typography>
                            <TextField
                              fullWidth
                              name="password"
                              type={showPassword ? "text" : "password"}
                              value={formData.password}
                              onChange={handleInputChange}
                              required
                              placeholder="Enter password"
                              sx={{
                                "& .MuiOutlinedInput-root": {
                                  backgroundColor: "#fafbfc",
                                  borderRadius: 3,
                                  fontSize: "1rem",
                                  fontWeight: 500,
                                  transition: "all 0.3s ease",
                                  "& fieldset": {
                                    borderColor: "#e5e7eb",
                                    borderWidth: "2px",
                                  },
                                  "&:hover": {
                                    backgroundColor: "#ffffff",
                                    transform: "translateY(-1px)",
                                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                                    "& fieldset": {
                                      borderColor: "#d1d5db",
                                    },
                                  },
                                  "&.Mui-focused": {
                                    backgroundColor: "#ffffff",
                                    transform: "translateY(-1px)",
                                    boxShadow: "0 4px 12px rgba(38, 71, 114, 0.15)",
                                    "& fieldset": {
                                      borderColor: "#264772",
                                      borderWidth: "2px",
                                    },
                                  },
                                },
                                "& .MuiInputBase-input": {
                                  py: 2.5,
                                  px: 3,
                                  "&::placeholder": {
                                    color: "#9ca3af",
                                    opacity: 1,
                                    fontWeight: 400,
                                  },
                                },
                              }}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <LockOutlined sx={{ color: "#6b7280", fontSize: 22 }} />
                                  </InputAdornment>
                                ),
                                endAdornment: (
                                  <InputAdornment position="end">
                                    <IconButton
                                      onClick={() => setShowPassword(!showPassword)}
                                      edge="end"
                                      sx={{
                                        color: "#6b7280",
                                        "&:hover": {
                                          backgroundColor: "rgba(107, 114, 128, 0.1)",
                                        },
                                      }}
                                    >
                                      {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                  </InputAdornment>
                                ),
                              }}
                            />
                          </motion.div>
                        </Grid>

                        {/* Confirm Password Field */}
                        <Grid item xs={12} sm={6}>
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ 
                              opacity: 1, 
                              y: 0,
                              transition: {
                                duration: 0.5,
                                delay: 1.3
                              }
                            }}
                            whileHover={{ scale: 1.02 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Typography
                              component="label"
                              sx={{
                                display: "block",
                                fontSize: "0.875rem",
                                fontWeight: 600,
                                color: "#374151",
                                mb: 1.5,
                                letterSpacing: "0.025em",
                              }}
                            >
                              CONFIRM PASSWORD
                            </Typography>
                            <TextField
                              fullWidth
                              name="confirmPassword"
                              type={showConfirmPassword ? "text" : "password"}
                              value={formData.confirmPassword}
                              onChange={handleInputChange}
                              required
                              placeholder="Confirm password"
                              sx={{
                                "& .MuiOutlinedInput-root": {
                                  backgroundColor: "#fafbfc",
                                  borderRadius: 3,
                                  fontSize: "1rem",
                                  fontWeight: 500,
                                  transition: "all 0.3s ease",
                                  "& fieldset": {
                                    borderColor: "#e5e7eb",
                                    borderWidth: "2px",
                                  },
                                  "&:hover": {
                                    backgroundColor: "#ffffff",
                                    transform: "translateY(-1px)",
                                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                                    "& fieldset": {
                                      borderColor: "#d1d5db",
                                    },
                                  },
                                  "&.Mui-focused": {
                                    backgroundColor: "#ffffff",
                                    transform: "translateY(-1px)",
                                    boxShadow: "0 4px 12px rgba(38, 71, 114, 0.15)",
                                    "& fieldset": {
                                      borderColor: "#264772",
                                      borderWidth: "2px",
                                    },
                                  },
                                },
                                "& .MuiInputBase-input": {
                                  py: 2.5,
                                  px: 3,
                                  "&::placeholder": {
                                    color: "#9ca3af",
                                    opacity: 1,
                                    fontWeight: 400,
                                  },
                                },
                              }}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <LockOutlined sx={{ color: "#6b7280", fontSize: 22 }} />
                                  </InputAdornment>
                                ),
                                endAdornment: (
                                  <InputAdornment position="end">
                                    <IconButton
                                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                      edge="end"
                                      sx={{
                                        color: "#6b7280",
                                        "&:hover": {
                                          backgroundColor: "rgba(107, 114, 128, 0.1)",
                                        },
                                      }}
                                    >
                                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                  </InputAdornment>
                                ),
                              }}
                            />
                          </motion.div>
                        </Grid>
                      </Grid>

                      {/* Submit Button */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ 
                          opacity: 1, 
                          y: 0,
                          transition: {
                            duration: 0.5,
                            delay: 1.4
                          }
                        }}
                        whileHover={{ 
                          scale: 1.02,
                          transition: { duration: 0.2 }
                        }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          type="submit"
                          fullWidth
                          variant="contained"
                          disabled={loading}
                          sx={{
                            py: 3,
                            fontSize: "1.125rem",
                            fontWeight: 700,
                            textTransform: "none",
                            borderRadius: 3,
                            background: `linear-gradient(135deg, #264772 0%, #1e3a5f 100%)`,
                            color: "#ffffff",
                            letterSpacing: "0.025em",
                            boxShadow: `
                              0 10px 20px rgba(38, 71, 114, 0.2),
                              0 4px 8px rgba(38, 71, 114, 0.1)
                            `,
                            transition: "all 0.3s ease",
                            "&:hover": {
                              background: `linear-gradient(135deg, #1e3a5f 0%, #264772 100%)`,
                              boxShadow: `
                                0 16px 32px rgba(38, 71, 114, 0.25),
                                0 8px 16px rgba(38, 71, 114, 0.15)
                              `,
                              transform: "translateY(-2px)",
                            },
                            "&:focus": {
                              outline: "3px solid rgba(246, 168, 33, 0.5)",
                              outlineOffset: "2px",
                            },
                            "&:disabled": {
                              background: "#9ca3af",
                              color: "#ffffff",
                              transform: "none",
                              boxShadow: "none",
                            },
                          }}
                        >
                          {loading ? (
                            <CircularProgress size={24} sx={{ color: "#ffffff" }} />
                          ) : (
                            "Create Account"
                          )}
                        </Button>
                      </motion.div>
                    </Box>

                    <Divider sx={{ my: 4, borderColor: "rgba(38, 71, 114, 0.1)" }} />

                    {/* Footer */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ 
                        opacity: 1,
                        transition: {
                          duration: 0.5,
                          delay: 1.6
                        }
                      }}
                    >
                      <Box sx={{ textAlign: "center" }}>
                        <Typography
                          variant="body2"
                          sx={{
                            color: "#6b7280",
                            fontSize: "0.9rem",
                            fontWeight: 500,
                          }}
                        >
                          Already have an account?{" "}
                          <Link
                            to="/login"
                            style={{
                              color: "#264772",
                              textDecoration: "none",
                              fontWeight: 700,
                            }}
                          >
                            Sign in here
                          </Link>
                        </Typography>
                      </Box>
                    </motion.div>
                  </Paper>
                </motion.div>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </motion.div>
  );
};

export default RegisterPage;
