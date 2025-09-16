import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogActions, Button, Typography, Box, IconButton } from "@mui/material"
import { GetApp, Close, Smartphone } from "@mui/icons-material"
import { motion } from "framer-motion"

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true)
      return
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      console.log("PWA install prompt available")
      e.preventDefault()
      setDeferredPrompt(e)

      // Show custom install prompt after a delay
      setTimeout(() => {
        setShowInstallPrompt(true)
      }, 10000) // Show after 10 seconds
    }

    // Listen for app installed event
    const handleAppInstalled = () => {
      console.log("PWA was installed")
      setIsInstalled(true)
      setShowInstallPrompt(false)
      setDeferredPrompt(null)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    window.addEventListener("appinstalled", handleAppInstalled)

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
      window.removeEventListener("appinstalled", handleAppInstalled)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    // Show the install prompt
    deferredPrompt.prompt()

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === "accepted") {
      console.log("User accepted the install prompt")
    } else {
      console.log("User dismissed the install prompt")
    }

    // Clear the deferredPrompt
    setDeferredPrompt(null)
    setShowInstallPrompt(false)
  }

  const handleDismiss = () => {
    setShowInstallPrompt(false)
    // Don't show again for this session
    sessionStorage.setItem("pwa-prompt-dismissed", "true")
  }

  // Don't show if already installed or dismissed
  if (isInstalled || sessionStorage.getItem("pwa-prompt-dismissed")) {
    return null
  }

  return (
    <Dialog
      open={showInstallPrompt}
      onClose={handleDismiss}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          m: 2,
        },
      }}
    >
      <DialogContent sx={{ textAlign: "center", p: 4 }}>
        <Box display="flex" justifyContent="flex-end" mb={2}>
          <IconButton onClick={handleDismiss} size="small">
            <Close />
          </IconButton>
        </Box>

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Smartphone sx={{ fontSize: 60, color: "primary.main", mb: 2 }} />

          <Typography variant="h5" gutterBottom color="primary">
            Install PMIS App
          </Typography>

          <Typography variant="body1" color="text.secondary" mb={3}>
            Get faster access to internship recommendations with our mobile app. Works offline and sends notifications
            for new opportunities.
          </Typography>

          <Box display="flex" flexDirection="column" gap={1} mb={3}>
            <Typography variant="body2" color="text.secondary">
              ✓ Offline access to your profile and recommendations
            </Typography>
            <Typography variant="body2" color="text.secondary">
              ✓ Push notifications for new internships
            </Typography>
            <Typography variant="body2" color="text.secondary">
              ✓ Faster loading and app-like experience
            </Typography>
            <Typography variant="body2" color="text.secondary">
              ✓ Works on low bandwidth connections
            </Typography>
          </Box>
        </motion.div>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button onClick={handleDismiss} color="inherit">
          Maybe Later
        </Button>
        <Button onClick={handleInstallClick} variant="contained" startIcon={<GetApp />} sx={{ ml: 1 }}>
          Install App
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default PWAInstallPrompt
