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
} from "@mui/material";
import {
  EmailOutlined,
  LockOutlined,
  Visibility,
  VisibilityOff,
  BusinessCenterOutlined,
  ShieldOutlined,
  VerifiedUserOutlined,
  TrendingUpOutlined,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
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
    if (!formData.email.trim()) {
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
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!validate()) return;
    
    setLoading(true);

    try {
      await login(formData);
      navigate("/", { replace: true });
    } catch (error) {
      setError(
        error.response?.data?.message || 
        error.message || 
        "Authentication failed. Please verify your credentials."
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
                    <BusinessCenterOutlined sx={{ fontSize: 60, color: "#ffffff" }} />
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
                    Project Management
                    <Box component="span" sx={{ display: "block", color: "#f6a821" }}>
                      Information System
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
                    Enterprise-grade project management platform trusted by leading organizations worldwide
                  </Typography>
                </motion.div>

                <motion.div
                  variants={itemVariants}
                >
                  <Box sx={{ display: "flex", justifyContent: "center", gap: 6 }}>
                    {[
                      { icon: <ShieldOutlined />, text: "Enterprise Security" },
                      { icon: <VerifiedUserOutlined />, text: "ISO 27001 Certified" },
                      { icon: <TrendingUpOutlined />, text: "99.9% Uptime SLA" },
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

            {/* Right Side - Login Form */}
            <Grid 
              item 
              xs={12} 
              md={5} 
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                py: { xs: 4, md: 8 },
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
                      p: { xs: 4, sm: 6, md: 8 },
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
                      <Box sx={{ mb: 6 }}>
                        <Typography
                          variant="h3"
                          sx={{
                            fontWeight: 700,
                            color: "#111827",
                            mb: 2,
                            fontSize: { xs: "2rem", sm: "2.5rem" },
                            lineHeight: 1.2,
                            letterSpacing: "-0.025em",
                          }}
                        >
                          Sign In
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

                    {/* Form */}
                    <Box component="form" onSubmit={handleSubmit}>
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
                        <Box sx={{ mb: 4 }}>
                          <Typography
                            component="label"
                            sx={{
                              display: "block",
                              fontSize: "0.875rem",
                              fontWeight: 600,
                              color: "#374151",
                              mb: 2,
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
                            placeholder="Enter your corporate email"
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                backgroundColor: "#fafbfc",
                                borderRadius: 3,
                                fontSize: "1.125rem",
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
                                "&.Mui-error fieldset": {
                                  borderColor: "#dc2626",
                                },
                              },
                              "& .MuiInputBase-input": {
                                py: 3,
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

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ 
                          opacity: 1, 
                          y: 0,
                          transition: {
                            duration: 0.5,
                            delay: 1
                          }
                        }}
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Box sx={{ mb: 6 }}>
                          <Typography
                            component="label"
                            sx={{
                              display: "block",
                              fontSize: "0.875rem",
                              fontWeight: 600,
                              color: "#374151",
                              mb: 2,
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
                            placeholder="Enter your password"
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                backgroundColor: "#fafbfc",
                                borderRadius: 3,
                                fontSize: "1.125rem",
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
                                "&.Mui-error fieldset": {
                                  borderColor: "#dc2626",
                                },
                              },
                              "& .MuiInputBase-input": {
                                py: 3,
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
                        </Box>
                      </motion.div>

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
                            "Access Dashboard"
                          )}
                        </Button>
                      </motion.div>
                    </Box>

                    <Divider sx={{ my: 6, borderColor: "rgba(38, 71, 114, 0.1)" }} />

                    {/* Footer */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ 
                        opacity: 1,
                        transition: {
                          duration: 0.5,
                          delay: 1.4
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
                          New to PMIS?{" "}
                          <Link
                            to="/register"
                            style={{
                              color: "#264772",
                              textDecoration: "none",
                              fontWeight: 700,
                            }}
                          >
                            Create account
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

export default LoginPage;
