"use client"
import { useEffect, useState, Suspense, lazy } from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { ThemeProvider, createTheme, alpha } from "@mui/material/styles"
import CssBaseline from "@mui/material/CssBaseline"
import { motion, AnimatePresence } from "framer-motion"
import { Box, CircularProgress, Typography, Alert, Snackbar, Backdrop } from "@mui/material"
import { ErrorBoundary } from "react-error-boundary"

// Import Authentication Context and Protected Route
import { AuthProvider } from "./contexts/AuthContext"
import ProtectedRoute from "./components/ProtectedRoute"

// Lazy load components for better performance
const HomePage = lazy(() => import("./pages/HomePage"))
const LoginPage = lazy(() => import("./pages/LoginPage"))
const RegisterPage = lazy(() => import("./pages/RegisterPage"))
const HelpPage = lazy(() => import("./pages/HelpPage"))
const ProfilePage = lazy(() => import("./pages/ProfilePage"))
const RecommendationsPage = lazy(() => import("./pages/RecommendationsPage"))
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"))
// const DashboardPage = lazy(() => import("./pages/DashboardPage"))
const Navigation = lazy(() => import("./components/Navigation"))
const AccessibilityToolbar = lazy(() => import("./components/AccessibilityToolbar"))
const PWAInstallPrompt = lazy(() => import("./components/PWAInstallPrompt"))
const OfflineIndicator = lazy(() => import("./components/OfflineIndicator"))

// Your existing theme configuration
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: "#667eea",
      light: "#8b9aff",
      dark: "#4f63d2",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#764ba2",
      light: "#9575cd",
      dark: "#5e35b1",
      contrastText: "#ffffff",
    },
    success: {
      main: "#10b981",
      light: "#34d399",
      dark: "#059669",
    },
    error: {
      main: "#ef4444",
      light: "#f87171",
      dark: "#dc2626",
    },
    warning: {
      main: "#f59e0b",
      light: "#fbbf24",
      dark: "#d97706",
    },
    info: {
      main: "#3b82f6",
      light: "#60a5fa",
      dark: "#2563eb",
    },
    background: {
      default: "#f8fafc",
      paper: "#ffffff",
    },
    text: {
      primary: "#1e293b",
      secondary: "#475569",
    },
    divider: alpha("#e2e8f0", 0.4),
  },
  typography: {
    fontFamily: '"Inter", "SF Pro Display", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: "3rem",
      fontWeight: 800,
      lineHeight: 1.1,
      letterSpacing: "-0.025em",
      background: "linear-gradient(45deg, #667eea 30%, #764ba2 90%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
    },
    h2: {
      fontSize: "2.25rem",
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: "-0.02em",
    },
    h3: {
      fontSize: "1.875rem",
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h4: {
      fontSize: "1.5rem",
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: "1.25rem",
      fontWeight: 600,
      lineHeight: 1.5,
    },
    h6: {
      fontSize: "1.125rem",
      fontWeight: 600,
      lineHeight: 1.5,
    },
    body1: {
      fontSize: "1rem",
      lineHeight: 1.6,
      color: "#475569",
    },
    body2: {
      fontSize: "0.875rem",
      lineHeight: 1.5,
      color: "#64748b",
    },
    button: {
      fontWeight: 600,
      textTransform: "none",
      fontSize: "0.875rem",
    },
  },
  shape: {
    borderRadius: 16,
  },
  shadows: [
    "none",
    "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
    "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
    ...Array(18).fill("0 25px 50px -12px rgba(0, 0, 0, 0.25)"),
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: "none",
          fontWeight: 600,
          boxShadow: "none",
          "&:hover": {
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            transform: "translateY(-1px)",
          },
        },
        contained: {
          background: "linear-gradient(45deg, #667eea 30%, #764ba2 90%)",
          "&:hover": {
            background: "linear-gradient(45deg, #764ba2 30%, #667eea 90%)",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          border: `1px solid ${alpha("#e2e8f0", 0.3)}`,
          backdropFilter: "blur(20px)",
          background: alpha("#ffffff", 0.8),
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
          },
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: `1px solid ${alpha("#e2e8f0", 0.2)}`,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
        },
      },
    },
  },
})

// Enhanced error fallback component
const ErrorFallback = ({ error, resetErrorBoundary }) => (
  <Box
    display="flex"
    flexDirection="column"
    alignItems="center"
    justifyContent="center"
    minHeight="100vh"
    p={4}
    textAlign="center"
  >
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Typography variant="h4" gutterBottom color="error.main" fontWeight={700}>
        Oops! Something went wrong
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={3} maxWidth={500}>
        We encountered an unexpected error. Don't worry, our team has been notified and we're working on a fix.
      </Typography>
      <Box display="flex" gap={2} justifyContent="center">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={resetErrorBoundary}
          style={{
            padding: "12px 24px",
            borderRadius: "12px",
            border: "none",
            background: "linear-gradient(45deg, #667eea 30%, #764ba2 90%)",
            color: "white",
            fontWeight: 600,
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          Try Again
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => window.location.href = "/"}
          style={{
            padding: "12px 24px",
            borderRadius: "12px",
            border: "2px solid #667eea",
            background: "transparent",
            color: "#667eea",
            fontWeight: 600,
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          Go Home
        </motion.button>
      </Box>
      <Typography variant="caption" color="text.secondary" mt={4}>
        Error: {error.message}
      </Typography>
    </motion.div>
  </Box>
)

// Enhanced loading component
const LoadingScreen = ({ message = "Loading amazing content..." }) => (
  <Backdrop open={true} sx={{ color: '#fff', zIndex: 9999 }}>
    <Box display="flex" flexDirection="column" alignItems="center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <CircularProgress 
          size={60} 
          thickness={4} 
          sx={{ 
            color: 'white',
            mb: 2,
            '& .MuiCircularProgress-circle': {
              strokeLinecap: 'round',
            }
          }} 
        />
      </motion.div>
      <Typography variant="h6" color="white" fontWeight={600}>
        {message}
      </Typography>
      <Typography variant="body2" color="rgba(255,255,255,0.7)" mt={1}>
        Please wait while we prepare your experience
      </Typography>
    </Box>
  </Backdrop>
)

function App() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [showOfflineAlert, setShowOfflineAlert] = useState(false)
  const [swUpdateAvailable, setSwUpdateAvailable] = useState(false)

  useEffect(() => {
    // Enhanced service worker registration
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", async () => {
        try {
          const registration = await navigator.serviceWorker.register("/sw.js")
          console.log("🚀 SW registered successfully:", registration)

          // Check for updates
          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing
            newWorker?.addEventListener("statechange", () => {
              if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                setSwUpdateAvailable(true)
              }
            })
          })
        } catch (error) {
          console.error("❌ SW registration failed:", error)
        }
      })
    }

    // Enhanced notification permission with better UX
    if ("Notification" in window && Notification.permission === "default") {
      setTimeout(() => {
        Notification.requestPermission().then((permission) => {
          console.log("🔔 Notification permission:", permission)
          if (permission === "granted") {
            new Notification("PMIS SmartMatch+ Ready!", {
              body: "You'll receive real-time updates about your internship applications.",
              icon: "/icon-192x192.png",
              badge: "/icon-192x192.png",
            })
          }
        })
      }, 3000)
    }

    // Online/offline detection
    const handleOnline = () => {
      setIsOnline(true)
      setShowOfflineAlert(false)
    }

    const handleOffline = () => {
      setIsOnline(false)
      setShowOfflineAlert(true)
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  const handleSwUpdate = () => {
    window.location.reload()
  }

  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, errorInfo) => {
        console.error("🚨 Error caught by boundary:", error, errorInfo)
      }}
    >
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <Router
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true,
            }}
          >
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <Suspense fallback={<div />}>
                <OfflineIndicator />
                <Navigation />
              </Suspense>

              <AnimatePresence mode="wait">
                <Routes>
                  {/* Public Routes */}
                  <Route 
                    path="/" 
                    element={
                      <Suspense fallback={<LoadingScreen message="Loading Home..." />}>
                        <HomePage />
                      </Suspense>
                    } 
                  />
                  <Route 
                    path="/login" 
                    element={
                      <Suspense fallback={<LoadingScreen message="Loading Login..." />}>
                        <LoginPage />
                      </Suspense>
                    } 
                  />
                  <Route 
                    path="/register" 
                    element={
                      <Suspense fallback={<LoadingScreen message="Loading Register..." />}>
                        <RegisterPage />
                      </Suspense>
                    } 
                  />
                  <Route 
                    path="/help" 
                    element={
                      <Suspense fallback={<LoadingScreen message="Loading Help Center..." />}>
                        <HelpPage />
                      </Suspense>
                    } 
                  />

                  {/* Protected Routes - Redirect to login if not authenticated */}
                  <Route 
                    path="/profile" 
                    element={
                      <ProtectedRoute>
                        <Suspense fallback={<LoadingScreen message="Loading Profile..." />}>
                          <ProfilePage />
                        </Suspense>
                      </ProtectedRoute>
                    } 
                  />
                  {/* <Route 
                    path="/dashboard" 
                    element={
                      <ProtectedRoute>
                        <Suspense fallback={<LoadingScreen message="Loading Dashboard..." />}>
                          <DashboardPage />
                        </Suspense>
                      </ProtectedRoute>
                    } 
                  /> */}
                  <Route 
                    path="/recommendations" 
                    element={
                      <ProtectedRoute>
                        <Suspense fallback={<LoadingScreen message="Loading Recommendations..." />}>
                          <RecommendationsPage />
                        </Suspense>
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/admin" 
                    element={
                      <ProtectedRoute>
                        <Suspense fallback={<LoadingScreen message="Loading Admin Dashboard..." />}>
                          <AdminDashboard />
                        </Suspense>
                      </ProtectedRoute>
                    } 
                  />

                  {/* Catch all route */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </AnimatePresence>

              <Suspense fallback={<div />}>
                <AccessibilityToolbar />
                <PWAInstallPrompt />
              </Suspense>
            </motion.div>
          </Router>
        </AuthProvider>

        {/* Enhanced Notifications */}
        <Snackbar
          open={showOfflineAlert}
          message="You're currently offline. Some features may be limited."
          action={
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => setShowOfflineAlert(false)}
              style={{
                background: "none",
                border: "none",
                color: "white",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Dismiss
            </motion.button>
          }
          sx={{
            "& .MuiSnackbarContent-root": {
              backgroundColor: "#f59e0b",
              borderRadius: "12px",
            },
          }}
        />

        <Snackbar
          open={swUpdateAvailable}
          message="A new version is available!"
          action={
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={handleSwUpdate}
              style={{
                background: "white",
                border: "none",
                color: "#667eea",
                padding: "8px 16px",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Update
            </motion.button>
          }
          sx={{
            "& .MuiSnackbarContent-root": {
              background: "linear-gradient(45deg, #667eea 30%, #764ba2 90%)",
              borderRadius: "12px",
            },
          }}
        />
      </ThemeProvider>
    </ErrorBoundary>
  )
}

export default App
