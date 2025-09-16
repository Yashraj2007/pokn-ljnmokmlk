import { useState, useEffect } from "react"
import { Snackbar, Alert, Box, Typography } from "@mui/material"
import { WifiOff, Wifi } from "@mui/icons-material"
import { motion, AnimatePresence } from "framer-motion"

const OfflineIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [showOfflineMessage, setShowOfflineMessage] = useState(false)
  const [showOnlineMessage, setShowOnlineMessage] = useState(false)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      setShowOfflineMessage(false)
      setShowOnlineMessage(true)
      setTimeout(() => setShowOnlineMessage(false), 3000)
    }

    const handleOffline = () => {
      setIsOnline(false)
      setShowOnlineMessage(false)
      setShowOfflineMessage(true)
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // Show offline message if starting offline
    if (!navigator.onLine) {
      setShowOfflineMessage(true)
    }

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  return (
    <>
      {/* Persistent offline banner */}
      <AnimatePresence>
        {!isOnline && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              zIndex: 1300,
              backgroundColor: "#f57c00",
              color: "white",
              padding: "8px 16px",
              textAlign: "center",
            }}
          >
            <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
              <WifiOff fontSize="small" />
              <Typography variant="body2">
                You're offline. Some features may be limited. Cached content is still available.
              </Typography>
            </Box>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Online/Offline notifications */}
      <Snackbar open={showOfflineMessage} anchorOrigin={{ vertical: "bottom", horizontal: "center" }} sx={{ mb: 2 }}>
        <Alert severity="warning" icon={<WifiOff />} sx={{ width: "100%" }}>
          Connection lost. You can still browse cached content.
        </Alert>
      </Snackbar>

      <Snackbar
        open={showOnlineMessage}
        autoHideDuration={3000}
        onClose={() => setShowOnlineMessage(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        sx={{ mb: 2 }}
      >
        <Alert severity="success" icon={<Wifi />} sx={{ width: "100%" }}>
          Connection restored! Syncing your data...
        </Alert>
      </Snackbar>
    </>
  )
}

export default OfflineIndicator
