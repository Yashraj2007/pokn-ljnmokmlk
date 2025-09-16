// import { useState, useEffect } from "react"
// import {
//   Box,
//   IconButton,
//   Drawer,
//   Typography,
//   Switch,
//   FormControlLabel,
//   Slider,
//   Button,
//   Divider,
//   Tooltip,
// } from "@mui/material"
// import { Accessibility, VolumeUp, Close, KeyboardVoice, Sms } from "@mui/icons-material"
// import { motion } from "framer-motion"

// const AccessibilityToolbar = () => {
//   const [isOpen, setIsOpen] = useState(false)
//   const [settings, setSettings] = useState({
//     highContrast: false,
//     textToSpeech: false,
//     fontSize: 16,
//     language: "en",
//     voiceEnabled: false,
//   })

//   useEffect(() => {
//     // Load saved accessibility settings
//     const savedSettings = localStorage.getItem("pmis-accessibility")
//     if (savedSettings) {
//       try {
//         const parsed = JSON.parse(savedSettings)
//         setSettings(parsed)
//         applySettings(parsed)
//       } catch (error) {
//         console.warn("Failed to load accessibility settings:", error)
//       }
//     }
//   }, [])

//   const applySettings = (newSettings) => {
//     const root = document.documentElement
//     const body = document.body

//     // High contrast mode with professional styling
//     if (newSettings.highContrast) {
//       root.classList.add("high-contrast")
//       body.classList.add("high-contrast-body")
//     } else {
//       root.classList.remove("high-contrast")
//       body.classList.remove("high-contrast-body")
//     }

//     // Font size adjustment
//     root.style.setProperty("--accessibility-font-size", `${newSettings.fontSize}px`)
//     root.style.setProperty("--accessibility-font-scale", newSettings.fontSize / 16)

//     // Language setting
//     root.setAttribute("lang", newSettings.language)

//     // Save to localStorage
//     try {
//       localStorage.setItem("pmis-accessibility", JSON.stringify(newSettings))
//     } catch (error) {
//       console.warn("Failed to save accessibility settings:", error)
//     }
//   }

//   const updateSetting = (key, value) => {
//     const newSettings = { ...settings, [key]: value }
//     setSettings(newSettings)
//     applySettings(newSettings)
//   }

//   const speakText = (text) => {
//     if (settings.textToSpeech && "speechSynthesis" in window) {
//       // Stop any ongoing speech
//       speechSynthesis.cancel()
      
//       const utterance = new SpeechSynthesisUtterance(text)
//       utterance.lang = settings.language === "hi" ? "hi-IN" : "en-US"
//       utterance.rate = 0.8
//       utterance.pitch = 1
//       utterance.volume = 0.8
      
//       // Handle errors gracefully
//       utterance.onerror = (event) => {
//         console.warn("Speech synthesis error:", event.error)
//       }
      
//       speechSynthesis.speak(utterance)
//     }
//   }

//   const resetSettings = () => {
//     const defaultSettings = {
//       highContrast: false,
//       textToSpeech: false,
//       fontSize: 16,
//       language: "en",
//       voiceEnabled: false,
//     }
//     setSettings(defaultSettings)
//     applySettings(defaultSettings)
//   }

//   const handleDrawerClose = () => {
//     setIsOpen(false)
//   }

//   return (
//     <>
//       {/* Floating Accessibility Button */}
//       <motion.div
//         initial={{ scale: 0, opacity: 0 }}
//         animate={{ scale: 1, opacity: 1 }}
//         transition={{ 
//           delay: 1, 
//           type: "spring", 
//           stiffness: 260, 
//           damping: 20 
//         }}
//         style={{
//           position: "fixed",
//           bottom: 24,
//           right: 24,
//           zIndex: 1300,
//         }}
//       >
//         <Tooltip 
//           title="Open Accessibility Settings" 
//           placement="left"
//           arrow
//         >
//           <IconButton
//             onClick={() => setIsOpen(true)}
//             aria-label="Open accessibility settings"
//             sx={{
//               bgcolor: "primary.main",
//               color: "white",
//               width: 64,
//               height: 64,
//               "&:hover": { 
//                 bgcolor: "primary.dark",
//                 transform: "scale(1.05)",
//                 transition: "all 0.2s ease-in-out"
//               },
//               boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
//               border: "2px solid transparent",
//               "&:focus": {
//                 border: "2px solid #fff",
//                 outline: "2px solid",
//                 outlineColor: "primary.main",
//                 outlineOffset: "2px"
//               }
//             }}
//           >
//             <Accessibility sx={{ fontSize: 28 }} />
//           </IconButton>
//         </Tooltip>
//       </motion.div>

//       {/* Accessibility Settings Drawer */}
//       <Drawer 
//         anchor="right" 
//         open={isOpen} 
//         onClose={handleDrawerClose}
//         PaperProps={{
//           sx: {
//             borderRadius: "16px 0 0 16px",
//             boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)"
//           }
//         }}
//       >
//         <Box sx={{ width: 360, p: 3, height: "100%" }} className="accessibility-drawer-content">
//           {/* Header */}
//           <Box 
//             display="flex" 
//             alignItems="center" 
//             justifyContent="space-between" 
//             mb={3}
//             pb={2}
//             borderBottom="1px solid"
//             borderColor="divider"
//           >
//             <Typography variant="h5" fontWeight="600" color="primary.main">
//               Accessibility Center
//             </Typography>
//             <IconButton 
//               onClick={handleDrawerClose}
//               aria-label="Close accessibility settings"
//               sx={{
//                 "&:hover": { bgcolor: "action.hover" },
//                 "&:focus": {
//                   outline: "2px solid",
//                   outlineColor: "primary.main"
//                 }
//               }}
//             >
//               <Close />
//             </IconButton>
//           </Box>

//           {/* Visual Accessibility Section */}
//           <Box mb={4}>
//             <Typography 
//               variant="h6" 
//               gutterBottom 
//               color="text.primary"
//               fontWeight="500"
//               mb={2}
//             >
//               Visual Settings
//             </Typography>

//             <FormControlLabel
//               control={
//                 <Switch
//                   checked={settings.highContrast}
//                   onChange={(e) => updateSetting("highContrast", e.target.checked)}
//                   color="primary"
//                 />
//               }
//               label={
//                 <Box>
//                   <Typography variant="body1" fontWeight="500">
//                     High Contrast Mode
//                   </Typography>
//                   <Typography variant="caption" color="text.secondary">
//                     Improves visibility with enhanced contrast
//                   </Typography>
//                 </Box>
//               }
//               sx={{ mb: 3, alignItems: "flex-start" }}
//             />

//             <Box mb={3}>
//               <Typography variant="body1" fontWeight="500" gutterBottom>
//                 Font Size: {settings.fontSize}px
//               </Typography>
//               <Typography variant="caption" color="text.secondary" mb={2} display="block">
//                 Adjust base font size for better readability
//               </Typography>
//               <Slider
//                 value={settings.fontSize}
//                 onChange={(e, value) => updateSetting("fontSize", value)}
//                 min={12}
//                 max={24}
//                 step={1}
//                 marks={[
//                   { value: 12, label: '12px' },
//                   { value: 16, label: '16px' },
//                   { value: 20, label: '20px' },
//                   { value: 24, label: '24px' }
//                 ]}
//                 valueLabelDisplay="auto"
//                 color="primary"
//               />
//             </Box>
//           </Box>

//           <Divider sx={{ my: 3 }} />

//           {/* Audio Accessibility Section */}
//           <Box mb={4}>
//             <Typography 
//               variant="h6" 
//               gutterBottom 
//               color="text.primary"
//               fontWeight="500"
//               mb={2}
//             >
//               Audio Settings
//             </Typography>

//             <FormControlLabel
//               control={
//                 <Switch
//                   checked={settings.textToSpeech}
//                   onChange={(e) => updateSetting("textToSpeech", e.target.checked)}
//                   color="primary"
//                 />
//               }
//               label={
//                 <Box>
//                   <Typography variant="body1" fontWeight="500">
//                     Text-to-Speech
//                   </Typography>
//                   <Typography variant="caption" color="text.secondary">
//                     Enable voice narration of text content
//                   </Typography>
//                 </Box>
//               }
//               sx={{ mb: 3, alignItems: "flex-start" }}
//             />

//             <Button
//               variant="outlined"
//               startIcon={<VolumeUp />}
//               onClick={() => speakText("This is a test of the text-to-speech feature. The voice system is working correctly.")}
//               disabled={!settings.textToSpeech}
//               fullWidth
//               sx={{ 
//                 mb: 3,
//                 py: 1.5,
//                 textTransform: "none",
//                 fontSize: "0.95rem",
//                 "&:disabled": {
//                   opacity: 0.6
//                 }
//               }}
//             >
//               Test Voice Feature
//             </Button>
//           </Box>

//           <Divider sx={{ my: 3 }} />

//           {/* Language Settings Section */}
//           <Box mb={4}>
//             <Typography 
//               variant="h6" 
//               gutterBottom 
//               color="text.primary"
//               fontWeight="500"
//               mb={2}
//             >
//               Language / भाषा
//             </Typography>

//             <Box display="flex" gap={1.5} mb={3}>
//               <Button
//                 variant={settings.language === "en" ? "contained" : "outlined"}
//                 onClick={() => updateSetting("language", "en")}
//                 size="medium"
//                 sx={{
//                   flex: 1,
//                   py: 1.5,
//                   textTransform: "none",
//                   fontSize: "0.95rem",
//                   fontWeight: "500"
//                 }}
//               >
//                 English
//               </Button>
//               <Button
//                 variant={settings.language === "hi" ? "contained" : "outlined"}
//                 onClick={() => updateSetting("language", "hi")}
//                 size="medium"
//                 sx={{
//                   flex: 1,
//                   py: 1.5,
//                   textTransform: "none",
//                   fontSize: "0.95rem",
//                   fontWeight: "500"
//                 }}
//               >
//                 हिंदी
//               </Button>
//             </Box>
//           </Box>

//           <Divider sx={{ my: 3 }} />

//           {/* Support Section */}
//           <Box mb={4}>
//             <Typography 
//               variant="h6" 
//               gutterBottom 
//               color="text.primary"
//               fontWeight="500"
//               mb={2}
//             >
//               Support Options
//             </Typography>

//             <Button 
//               variant="outlined" 
//               startIcon={<Sms />} 
//               fullWidth 
//               sx={{ 
//                 mb: 2,
//                 py: 1.5,
//                 textTransform: "none",
//                 fontSize: "0.95rem",
//                 justifyContent: "flex-start"
//               }}
//             >
//               SMS Support: Send "HELP" to 9876543210
//             </Button>

//             <Button 
//               variant="outlined" 
//               startIcon={<KeyboardVoice />} 
//               fullWidth 
//               sx={{ 
//                 mb: 3,
//                 py: 1.5,
//                 textTransform: "none",
//                 fontSize: "0.95rem",
//                 justifyContent: "flex-start"
//               }}
//             >
//               Voice Support: Call 1800-123-4567
//             </Button>
//           </Box>

//           {/* Reset Button */}
//           <Box mt="auto" pt={3} borderTop="1px solid" borderColor="divider">
//             <Button 
//               variant="text" 
//               onClick={resetSettings} 
//               fullWidth 
//               color="secondary"
//               sx={{
//                 py: 1.5,
//                 textTransform: "none",
//                 fontSize: "0.95rem",
//                 fontWeight: "500"
//               }}
//             >
//               Reset All Settings
//             </Button>
//           </Box>
//         </Box>
//       </Drawer>

//       {/* Enhanced Global Styles for Accessibility */}
//       <style jsx global>{`
//         /* Exclude accessibility drawer content from font scaling */
//         .accessibility-drawer-content,
//         .accessibility-drawer-content *,
//         .accessibility-drawer-content .MuiTypography-root,
//         .accessibility-drawer-content .MuiButton-root,
//         .accessibility-drawer-content .MuiFormControlLabel-label,
//         .accessibility-drawer-content .MuiSlider-markLabel {
//           font-size: initial !important;
//         }

//         /* High Contrast DARK Theme */
//         .high-contrast {
//           --text-primary: #ffffff !important;
//           --text-secondary: #e0e0e0 !important;
//           --background-default: #121212 !important;
//           --background-paper: #1e1e1e !important;
//           --primary-main: #90caf9 !important;
//           --primary-dark: #64b5f6 !important;
//           --border-color: #ffffff !important;
//           --shadow-color: rgba(255, 255, 255, 0.3) !important;
//           --accent-color: #ffeb3b !important;
//         }

//         .high-contrast-body {
//           background-color: #121212 !important;
//           color: #ffffff !important;
//         }

//         .high-contrast * {
//           color: #ffffff !important;
//           border-color: var(--border-color) !important;
//         }

//         .high-contrast .MuiCard-root {
//           border: 3px solid var(--border-color) !important;
//           background-color: var(--background-paper) !important;
//           box-shadow: 0 4px 12px var(--shadow-color) !important;
//         }

//         .high-contrast .MuiPaper-root {
//           background-color: var(--background-paper) !important;
//           color: var(--text-primary) !important;
//         }

//         .high-contrast .MuiDrawer-paper {
//           background-color: var(--background-paper) !important;
//           border-left: 3px solid var(--border-color) !important;
//         }

//         .high-contrast .MuiButton-root {
//           border-width: 2px !important;
//           font-weight: 700 !important;
//           color: var(--accent-color) !important;
//         }

//         .high-contrast .MuiButton-contained {
//           background-color: var(--primary-main) !important;
//           color: #000000 !important;
//           border: 2px solid var(--accent-color) !important;
//         }

//         .high-contrast .MuiButton-outlined {
//           border-color: var(--accent-color) !important;
//           color: var(--accent-color) !important;
//           background-color: rgba(255, 235, 59, 0.1) !important;
//         }

//         .high-contrast .MuiTypography-root {
//           color: var(--text-primary) !important;
//         }

//         .high-contrast .MuiInputBase-root {
//           border: 2px solid var(--border-color) !important;
//           background-color: var(--background-default) !important;
//           color: var(--text-primary) !important;
//         }

//         .high-contrast .MuiOutlinedInput-notchedOutline {
//           border-width: 3px !important;
//           border-color: var(--accent-color) !important;
//         }

//         .high-contrast .MuiSwitch-track {
//           background-color: #424242 !important;
//         }

//         .high-contrast .MuiSwitch-thumb {
//           background-color: var(--accent-color) !important;
//           border: 2px solid var(--border-color) !important;
//         }

//         .high-contrast .MuiSlider-rail {
//           background-color: #424242 !important;
//         }

//         .high-contrast .MuiSlider-track {
//           background-color: var(--accent-color) !important;
//         }

//         .high-contrast .MuiSlider-thumb {
//           background-color: var(--accent-color) !important;
//           border: 3px solid var(--border-color) !important;
//         }

//         .high-contrast .MuiIconButton-root {
//           color: var(--accent-color) !important;
//           border: 1px solid var(--accent-color) !important;
//         }

//         /* Normal font sizes for regular mode - responsive to slider changes (EXCLUDING drawer) */
//         .MuiTypography-body1:not(.accessibility-drawer-content *) {
//           font-size: calc(1rem * var(--accessibility-font-scale, 1)) !important;
//           line-height: 1.6 !important;
//         }

//         .MuiTypography-body2:not(.accessibility-drawer-content *) {
//           font-size: calc(0.875rem * var(--accessibility-font-scale, 1)) !important;
//           line-height: 1.6 !important;
//         }

//         .MuiTypography-caption:not(.accessibility-drawer-content *) {
//           font-size: calc(0.75rem * var(--accessibility-font-scale, 1)) !important;
//           line-height: 1.5 !important;
//         }

//         .MuiTypography-h1:not(.accessibility-drawer-content *) {
//           font-size: calc(2.5rem * var(--accessibility-font-scale, 1)) !important;
//           line-height: 1.2 !important;
//         }

//         .MuiTypography-h2:not(.accessibility-drawer-content *) {
//           font-size: calc(2rem * var(--accessibility-font-scale, 1)) !important;
//           line-height: 1.3 !important;
//         }

//         .MuiTypography-h3:not(.accessibility-drawer-content *) {
//           font-size: calc(1.75rem * var(--accessibility-font-scale, 1)) !important;
//           line-height: 1.3 !important;
//         }

//         .MuiTypography-h4:not(.accessibility-drawer-content *) {
//           font-size: calc(1.5rem * var(--accessibility-font-scale, 1)) !important;
//           line-height: 1.4 !important;
//         }

//         .MuiTypography-h5:not(.accessibility-drawer-content *) {
//           font-size: calc(1.25rem * var(--accessibility-font-scale, 1)) !important;
//           line-height: 1.4 !important;
//         }

//         .MuiTypography-h6:not(.accessibility-drawer-content *) {
//           font-size: calc(1.125rem * var(--accessibility-font-scale, 1)) !important;
//           line-height: 1.4 !important;
//         }

//         .MuiButton-root:not(.accessibility-drawer-content *) {
//           font-size: calc(0.875rem * var(--accessibility-font-scale, 1)) !important;
//           padding: calc(10px * var(--accessibility-font-scale, 1)) calc(20px * var(--accessibility-font-scale, 1)) !important;
//           min-height: calc(40px * var(--accessibility-font-scale, 1)) !important;
//         }

//         body {
//           font-size: var(--accessibility-font-size, 16px) !important;
//         }

//         /* Focus Management for Better Accessibility */
//         *:focus-visible {
//           outline: 3px solid #ffeb3b !important;
//           outline-offset: 3px !important;
//           border-radius: 4px !important;
//           box-shadow: 0 0 0 6px rgba(255, 235, 59, 0.3) !important;
//         }

//         .high-contrast *:focus-visible {
//           outline: 4px solid var(--accent-color) !important;
//           outline-offset: 3px !important;
//           box-shadow: 0 0 0 8px rgba(255, 235, 59, 0.4) !important;
//         }

//         /* Smooth Transitions */
//         * {
//           transition: font-size 0.3s ease, padding 0.3s ease, color 0.2s ease, background-color 0.2s ease, border-color 0.2s ease !important;
//         }

//         /* Enhanced Button Interactions */
//         .MuiButton-root:hover {
//           transform: translateY(-2px) !important;
//           box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15) !important;
//         }

//         .high-contrast .MuiButton-root:hover {
//           transform: translateY(-3px) !important;
//           box-shadow: 0 8px 20px var(--shadow-color) !important;
//           background-color: var(--accent-color) !important;
//           color: #000000 !important;
//         }

        
//       `}</style>
//     </>
//   )
// }

// export default AccessibilityToolbar






"use client"

import React, { useState, useEffect, useCallback } from 'react'
import {
  Box, IconButton, Drawer, Typography, Switch, FormControlLabel, Slider, Button,
  Divider, Tooltip, Snackbar, Alert, Card, CardContent, LinearProgress, Chip
} from '@mui/material'
import {
  Accessibility, Settings, Assessment, Visibility, MicNone, Language, HelpOutline,
  Sms, Phone, Refresh, VolumeUp, CheckCircle, Close, SpeedOutlined, TuneOutlined
} from '@mui/icons-material'
import { styled, alpha, keyframes } from '@mui/material/styles'
import { motion, AnimatePresence } from 'framer-motion'

// Professional color palette
const colors = {
  primary: '#1e3a5f',
  secondary: '#f6a821',
  success: '#16a085',
  error: '#e74c3c',
  warning: '#f39c12'
}

// Smooth pulse animation
const pulse = keyframes`
  0%, 100% { 
    opacity: 1; 
    transform: scale(1); 
  }
  50% { 
    opacity: 0.7; 
    transform: scale(1.05); 
  }
`

// Professional styled components
const GlassDrawer = styled(Drawer)(({ theme }) => ({
  '& .MuiDrawer-paper': {
    backdropFilter: 'blur(20px)',
    backgroundColor: alpha(theme.palette.background.paper, 0.9),
    width: 400,
    borderTopRightRadius: 24,
    borderBottomRightRadius: 24,
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
    border: '1px solid ' + alpha(theme.palette.divider, 0.2)
  }
}))

const SettingCard = styled(Card)(({ theme }) => ({
  backgroundColor: alpha(theme.palette.background.paper, 0.8),
  backdropFilter: 'blur(10px)',
  borderRadius: 16,
  border: '1px solid ' + alpha(theme.palette.divider, 0.1),
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.12)'
  }
}))

const FloatingButton = styled(IconButton)(({ theme }) => ({
  position: 'fixed',
  bottom: 24,
  left: 24,
  zIndex: 1300,
  width: 64,
  height: 64,
  backgroundColor: colors.primary,
  color: 'white',
  boxShadow: '0 8px 32px rgba(30, 58, 95, 0.3)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    backgroundColor: colors.secondary,
    transform: 'scale(1.05) translateY(-2px)',
    boxShadow: '0 12px 40px rgba(246, 168, 33, 0.4)'
  },
  '&:focus-visible': {
    outline: '3px solid ' + colors.secondary,
    outlineOffset: '2px'
  }
}))

const PulseIndicator = styled(Box)(() => ({
  width: 8,
  height: 8,
  borderRadius: '50%',
  backgroundColor: colors.success,
  animation: pulse + ' 2s ease-in-out infinite'
}))

const AccessibilityToolbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [settings, setSettings] = useState({
    highContrast: false,
    textToSpeech: false,
    fontSize: 16,
    language: 'en',
    voiceSpeed: 1.0,
    voicePitch: 1.0,
    reducedMotion: false,
    keyboardNavigation: true
  })
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
  const [isApplying, setIsApplying] = useState(false)

  // Load saved settings on mount
  useEffect(() => {
    loadSettings()
  }, [])

  // Debounced save function
  const debouncedSave = useCallback(
    debounce((newSettings) => {
      try {
        localStorage.setItem('pmis-accessibility', JSON.stringify(newSettings))
      } catch (error) {
        console.warn('Failed to save accessibility settings:', error)
      }
    }, 300),
    []
  )

  // Utility functions
  function debounce(func, wait) {
    let timeout
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout)
        func(...args)
      }
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
    }
  }

  const loadSettings = () => {
    try {
      const saved = localStorage.getItem('pmis-accessibility')
      if (saved) {
        const parsed = JSON.parse(saved)
        setSettings(prevSettings => ({
          ...prevSettings,
          ...parsed
        }))
        applySettings(parsed)
      }
    } catch (error) {
      console.warn('Failed to load accessibility settings:', error)
    }
  }

  const applySettings = (newSettings) => {
    setIsApplying(true)
    const root = document.documentElement
    const body = document.body

    // High contrast mode
    if (newSettings.highContrast) {
      root.classList.add('accessibility-high-contrast')
      body.classList.add('accessibility-high-contrast-body')
    } else {
      root.classList.remove('accessibility-high-contrast')
      body.classList.remove('accessibility-high-contrast-body')
    }

    // Font scaling
    const fontScale = (newSettings.fontSize || 16) / 16
    root.style.setProperty('--accessibility-font-scale', fontScale.toString())
    root.style.setProperty('--accessibility-base-font', (newSettings.fontSize || 16) + 'px')

    // Reduced motion
    if (newSettings.reducedMotion) {
      root.classList.add('accessibility-reduced-motion')
    } else {
      root.classList.remove('accessibility-reduced-motion')
    }

    // Enhanced keyboard navigation
    if (newSettings.keyboardNavigation) {
      root.classList.add('accessibility-enhanced-focus')
    } else {
      root.classList.remove('accessibility-enhanced-focus')
    }

    // Language
    root.setAttribute('lang', newSettings.language || 'en')

    debouncedSave(newSettings)
    
    setTimeout(() => setIsApplying(false), 500)
  }

  const updateSetting = (key, value) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
    applySettings(newSettings)
    
    // Voice feedback for important changes
    if (key === 'textToSpeech' && value) {
      setTimeout(() => speakText('Text to speech is now enabled'), 300)
    }
  }

  const speakText = (text) => {
    if (!settings.textToSpeech || !('speechSynthesis' in window)) return

    try {
      speechSynthesis.cancel()
      
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = settings.language === 'hi' ? 'hi-IN' : 'en-US'
      utterance.rate = settings.voiceSpeed || 1.0
      utterance.pitch = settings.voicePitch || 1.0
      utterance.volume = 0.8
      
      utterance.onstart = () => showSnackbar('Speaking...', 'info')
      utterance.onend = () => showSnackbar('Speech completed', 'success')
      utterance.onerror = (event) => {
        console.warn('Speech error:', event.error)
        showSnackbar('Speech failed', 'error')
      }
      
      speechSynthesis.speak(utterance)
    } catch (error) {
      console.error('Speech synthesis error:', error)
      showSnackbar('Voice feature unavailable', 'error')
    }
  }

  const resetSettings = () => {
    const defaultSettings = {
      highContrast: false,
      textToSpeech: false,
      fontSize: 16,
      language: 'en',
      voiceSpeed: 1.0,
      voicePitch: 1.0,
      reducedMotion: false,
      keyboardNavigation: true
    }
    setSettings(defaultSettings)
    applySettings(defaultSettings)
    showSnackbar('Settings reset to defaults', 'success')
  }

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity })
  }

  const getAccessibilityScore = () => {
    let score = 0
    if (settings.highContrast) score += 25
    if (settings.textToSpeech) score += 25
    if ((settings.fontSize || 16) > 16) score += 20
    if (settings.keyboardNavigation) score += 15
    if (settings.reducedMotion) score += 15
    return Math.min(100, score)
  }

  const getScoreColor = () => {
    const score = getAccessibilityScore()
    if (score >= 80) return 'success'
    if (score >= 50) return 'warning'
    return 'primary'
  }

  const getScoreMessage = () => {
    const score = getAccessibilityScore()
    if (score >= 80) return 'Excellent accessibility setup!'
    if (score >= 50) return 'Good configuration'
    return 'Enable more features for better accessibility'
  }

  // Safe number formatting functions
  const formatVoiceSpeed = () => {
    const speed = settings.voiceSpeed
    return (typeof speed === 'number' && !isNaN(speed)) ? speed.toFixed(1) : '1.0'
  }

  const formatVoicePitch = () => {
    const pitch = settings.voicePitch
    return (typeof pitch === 'number' && !isNaN(pitch)) ? pitch.toFixed(1) : '1.0'
  }

  return (
    <>
      {/* Floating Accessibility Button */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ 
          delay: 1.2,
          type: 'spring',
          stiffness: 260,
          damping: 20
        }}
      >
        <Tooltip 
          title="Accessibility Settings - Make PMIS work for everyone" 
          placement="right"
          arrow
        >
          <FloatingButton
            onClick={() => setIsOpen(true)}
            aria-label="Open accessibility settings"
          >
            <Accessibility sx={{ fontSize: 32 }} />
          </FloatingButton>
        </Tooltip>
      </motion.div>

      {/* Accessibility Settings Drawer */}
      <GlassDrawer
        anchor="left"
        open={isOpen}
        onClose={() => setIsOpen(false)}
        transitionDuration={400}
      >
        <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
          
          {/* Header */}
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
            <Box display="flex" alignItems="center">
              <Settings sx={{ mr: 2, color: colors.primary }} />
              <Box>
                <Typography 
                  variant="h5" 
                  fontWeight={800}
                  sx={{ color: colors.primary }}
                >
                  Accessibility Center
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Personalize your PMIS experience
                </Typography>
              </Box>
            </Box>
            <IconButton
              onClick={() => setIsOpen(false)}
              aria-label="Close accessibility settings"
              sx={{
                bgcolor: colors.primary,
                color: 'white',
                '&:hover': { bgcolor: colors.primary, transform: 'scale(1.05)' }
              }}
            >
              <Close />
            </IconButton>
          </Box>

          {/* Accessibility Score */}
          <SettingCard sx={{ mb: 3 }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="between" mb={2}>
                <Box display="flex" alignItems="center">
                  <Assessment sx={{ mr: 2, color: colors.primary }} />
                  <Typography variant="h6" fontWeight={600}>
                    Accessibility Score
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <PulseIndicator />
                  <Chip 
                    label={getAccessibilityScore() + '%'}
                    color={getScoreColor()}
                    sx={{ fontWeight: 'bold' }}
                  />
                </Box>
              </Box>
              <LinearProgress
                variant="determinate"
                value={getAccessibilityScore()}
                color={getScoreColor()}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  mb: 1
                }}
              />
              <Typography variant="caption" color="text.secondary">
                {getScoreMessage()}
              </Typography>
            </CardContent>
          </SettingCard>

          <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                
                {/* Visual Settings */}
                <SettingCard sx={{ mb: 3 }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={3}>
                      <Visibility sx={{ mr: 2, color: colors.primary }} />
                      <Typography variant="h6" fontWeight={600} color={colors.primary}>
                        Visual Settings
                      </Typography>
                    </Box>

                    <FormControlLabel
                      control={
                        <Switch
                          checked={Boolean(settings.highContrast)}
                          onChange={(e) => updateSetting('highContrast', e.target.checked)}
                          sx={{
                            '& .MuiSwitch-switchBase.Mui-checked': { color: colors.success },
                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: colors.success }
                          }}
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="body1" fontWeight={500}>High Contrast Mode</Typography>
                          <Typography variant="caption" color="text.secondary">
                            Dark theme with enhanced visibility
                          </Typography>
                        </Box>
                      }
                      sx={{ mb: 3, width: '100%', alignItems: 'flex-start' }}
                    />

                    <FormControlLabel
                      control={
                        <Switch
                          checked={Boolean(settings.reducedMotion)}
                          onChange={(e) => updateSetting('reducedMotion', e.target.checked)}
                          color="primary"
                        />
                      }
                      label={
                        <Box>
                          <Box display="flex" alignItems="center">
                            <SpeedOutlined sx={{ mr: 1, fontSize: 20 }} />
                            <Typography variant="body1" fontWeight={500}>Reduce Motion</Typography>
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            Minimize animations for better focus
                          </Typography>
                        </Box>
                      }
                      sx={{ mb: 3, width: '100%', alignItems: 'flex-start' }}
                    />

                    <Box>
                      <Box display="flex" alignItems="center" mb={2}>
                        <TuneOutlined sx={{ mr: 1, fontSize: 20 }} />
                        <Typography variant="body1" fontWeight={500}>
                          Font Size: {settings.fontSize || 16}px
                        </Typography>
                      </Box>
                      <Slider
                        value={settings.fontSize || 16}
                        onChange={(e, value) => updateSetting('fontSize', value)}
                        min={12}
                        max={24}
                        step={2}
                        marks={[
                          { value: 12, label: 'Small' },
                          { value: 16, label: 'Normal' },
                          { value: 20, label: 'Large' },
                          { value: 24, label: 'XL' }
                        ]}
                        valueLabelDisplay="auto"
                        sx={{ color: colors.primary }}
                      />
                    </Box>
                  </CardContent>
                </SettingCard>

                {/* Audio Settings */}
                <SettingCard sx={{ mb: 3 }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={3}>
                      <MicNone sx={{ mr: 2, color: colors.secondary }} />
                      <Typography variant="h6" fontWeight={600} color={colors.secondary}>
                        Audio Settings
                      </Typography>
                    </Box>

                    <FormControlLabel
                      control={
                        <Switch
                          checked={Boolean(settings.textToSpeech)}
                          onChange={(e) => updateSetting('textToSpeech', e.target.checked)}
                          sx={{
                            '& .MuiSwitch-switchBase.Mui-checked': { color: colors.secondary },
                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: colors.secondary }
                          }}
                        />
                      }
                      label={
                        <Box>
                          <Box display="flex" alignItems="center">
                            <VolumeUp sx={{ mr: 1, fontSize: 20 }} />
                            <Typography variant="body1" fontWeight={500}>Text-to-Speech</Typography>
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            Voice narration of content
                          </Typography>
                        </Box>
                      }
                      sx={{ mb: 3, width: '100%', alignItems: 'flex-start' }}
                    />

                    {settings.textToSpeech && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        transition={{ duration: 0.3 }}
                      >
                        <Box mb={2}>
                          <Typography variant="body2" gutterBottom>
                            Voice Speed: {formatVoiceSpeed()}x
                          </Typography>
                          <Slider
                            value={settings.voiceSpeed || 1.0}
                            onChange={(e, value) => updateSetting('voiceSpeed', value)}
                            min={0.5}
                            max={2.0}
                            step={0.1}
                            valueLabelDisplay="auto"
                            sx={{ color: colors.secondary }}
                          />
                        </Box>

                        <Box mb={3}>
                          <Typography variant="body2" gutterBottom>
                            Voice Pitch: {formatVoicePitch()}
                          </Typography>
                          <Slider
                            value={settings.voicePitch || 1.0}
                            onChange={(e, value) => updateSetting('voicePitch', value)}
                            min={0.5}
                            max={2.0}
                            step={0.1}
                            valueLabelDisplay="auto"
                            sx={{ color: colors.secondary }}
                          />
                        </Box>

                        <Button
                          variant="contained"
                          startIcon={<VolumeUp />}
                          onClick={() => speakText('This is a test of the PMIS accessibility voice feature. The system is working perfectly.')}
                          fullWidth
                          sx={{
                            bgcolor: colors.secondary,
                            py: 1.5,
                            fontSize: '0.95rem',
                            fontWeight: 600
                          }}
                        >
                          Test Voice
                        </Button>
                      </motion.div>
                    )}
                  </CardContent>
                </SettingCard>

                {/* Language Settings */}
                <SettingCard sx={{ mb: 3 }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={3}>
                      <Language sx={{ mr: 2, color: colors.warning }} />
                      <Typography variant="h6" fontWeight={600} color={colors.warning}>
                        Language Settings
                      </Typography>
                    </Box>

                    <Box display="flex" gap={2}>
                      <Button
                        variant={(settings.language || 'en') === 'en' ? 'contained' : 'outlined'}
                        onClick={() => updateSetting('language', 'en')}
                        fullWidth
                        sx={{
                          py: 1.5,
                          fontWeight: 600
                        }}
                      >
                        English
                      </Button>
                      <Button
                        variant={(settings.language || 'en') === 'hi' ? 'contained' : 'outlined'}
                        onClick={() => updateSetting('language', 'hi')}
                        fullWidth
                        sx={{
                          py: 1.5,
                          fontWeight: 600
                        }}
                      >
                        हिंदी
                      </Button>
                    </Box>
                  </CardContent>
                </SettingCard>

                {/* Support Section */}
                <SettingCard sx={{ mb: 3 }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={3}>
                      <HelpOutline sx={{ mr: 2, color: colors.success }} />
                      <Typography variant="h6" fontWeight={600} color={colors.success}>
                        Support & Help
                      </Typography>
                    </Box>

                    <Alert 
                      severity="info" 
                      sx={{ mb: 3, borderRadius: '12px' }}
                      icon={<Phone />}
                    >
                      24/7 accessibility support available for all PMIS users
                    </Alert>

                    <Box display="flex" flexDirection="column" gap={2}>
                      <Button
                        variant="outlined"
                        startIcon={<Sms />}
                        fullWidth
                        sx={{
                          py: 1.5,
                          justifyContent: 'flex-start',
                          borderColor: colors.primary,
                          color: colors.primary
                        }}
                      >
                        SMS: Send "HELP" to 9876543210
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<Phone />}
                        fullWidth
                        sx={{
                          py: 1.5,
                          justifyContent: 'flex-start',
                          borderColor: colors.success,
                          color: colors.success
                        }}
                      >
                        Call: 1800-PMIS-HELP (Free)
                      </Button>
                    </Box>
                  </CardContent>
                </SettingCard>

              </motion.div>
            </AnimatePresence>
          </Box>

          {/* Action Buttons */}
          <Box mt={3} pt={3} borderTop="2px solid" borderColor="divider">
            <Box display="flex" gap={2}>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={resetSettings}
                sx={{
                  flex: 1,
                  py: 1.5,
                  fontWeight: 600,
                  borderColor: colors.warning,
                  color: colors.warning
                }}
              >
                Reset
              </Button>
              <Button
                variant="contained"
                startIcon={<CheckCircle />}
                onClick={() => setIsOpen(false)}
                disabled={isApplying}
                sx={{
                  flex: 2,
                  py: 1.5,
                  fontWeight: 600,
                  bgcolor: colors.success
                }}
              >
                {isApplying ? 'Applying...' : 'Save & Close'}
              </Button>
            </Box>
          </Box>
        </Box>
      </GlassDrawer>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          sx={{
            borderRadius: '12px',
            fontWeight: 'bold',
            minWidth: '300px'
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Global Accessibility Styles */}
      <style jsx global>{`
        .MuiDrawer-paper *,
        .MuiSnackbar-root * {
          font-size: initial !important;
        }

        .accessibility-high-contrast {
          --text-primary: #ffffff !important;
          --text-secondary: #e0e0e0 !important;
          --background-default: #000000 !important;
          --background-paper: #1a1a1a !important;
          --primary-main: #90caf9 !important;
          --border-color: #ffffff !important;
          --accent-color: #ffeb3b !important;
        }

        .accessibility-high-contrast-body {
          background-color: #000000 !important;
          color: #ffffff !important;
        }

        .accessibility-high-contrast * {
          color: #ffffff !important;
          border-color: var(--border-color) !important;
        }

        .accessibility-high-contrast .MuiCard-root,
        .accessibility-high-contrast .MuiPaper-root {
          background-color: var(--background-paper) !important;
          color: var(--text-primary) !important;
          border: 2px solid var(--accent-color) !important;
        }

        .accessibility-high-contrast .MuiButton-contained {
          background-color: var(--accent-color) !important;
          color: #000000 !important;
          border: 2px solid var(--border-color) !important;
        }

        .accessibility-high-contrast .MuiButton-outlined {
          border: 2px solid var(--accent-color) !important;
          color: var(--accent-color) !important;
          background-color: rgba(255, 235, 59, 0.1) !important;
        }

        .accessibility-reduced-motion *,
        .accessibility-reduced-motion *::before,
        .accessibility-reduced-motion *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
          scroll-behavior: auto !important;
        }

        .accessibility-enhanced-focus *:focus-visible {
          outline: 4px solid ${colors.secondary} !important;
          outline-offset: 4px !important;
          border-radius: 8px !important;
          box-shadow: 0 0 0 8px rgba(246, 168, 33, 0.2) !important;
        }

        .MuiTypography-body1:not(.MuiDrawer-paper *):not(.MuiSnackbar-root *) {
          font-size: calc(1rem * var(--accessibility-font-scale, 1)) !important;
        }

        .MuiTypography-h1:not(.MuiDrawer-paper *):not(.MuiSnackbar-root *) {
          font-size: calc(2.5rem * var(--accessibility-font-scale, 1)) !important;
        }

        .MuiButton-root:not(.MuiDrawer-paper *):not(.MuiSnackbar-root *) {
          font-size: calc(0.875rem * var(--accessibility-font-scale, 1)) !important;
          min-height: calc(48px * var(--accessibility-font-scale, 1)) !important;
        }

        * {
          transition: font-size 0.3s ease, color 0.2s ease, background-color 0.2s ease !important;
        }

        .accessibility-reduced-motion * {
          transition: none !important;
        }
      `}</style>
    </>
  )
}

export default AccessibilityToolbar
