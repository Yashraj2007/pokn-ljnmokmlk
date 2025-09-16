import { useState, useEffect } from "react"
import { IconButton, Dialog, DialogContent, Typography, Box, Button } from "@mui/material"
import { Mic, MicOff, VolumeUp } from "@mui/icons-material"
import { motion } from "framer-motion"

const VoiceAssistant = () => {
  const [isListening, setIsListening] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [response, setResponse] = useState("")
  const [recognition, setRecognition] = useState(null)

  useEffect(() => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      const recognitionInstance = new SpeechRecognition()

      recognitionInstance.continuous = false
      recognitionInstance.interimResults = false
      recognitionInstance.lang = "en-IN"

      recognitionInstance.onresult = (event) => {
        const speechResult = event.results[0][0].transcript
        setTranscript(speechResult)
        processVoiceCommand(speechResult)
      }

      recognitionInstance.onerror = (event) => {
        console.error("Speech recognition error:", event.error)
        setIsListening(false)
      }

      recognitionInstance.onend = () => {
        setIsListening(false)
      }

      setRecognition(recognitionInstance)
    }
  }, [])

  const startListening = () => {
    if (recognition) {
      setIsListening(true)
      setIsOpen(true)
      setTranscript("")
      setResponse("")
      recognition.start()
    }
  }

  const stopListening = () => {
    if (recognition) {
      recognition.stop()
      setIsListening(false)
    }
  }

  const processVoiceCommand = (command) => {
    const lowerCommand = command.toLowerCase()
    let responseText = ""

    if (lowerCommand.includes("internship") || lowerCommand.includes("job")) {
      responseText = "I can help you find internships. You can browse available positions on the recommendations page."
    } else if (lowerCommand.includes("profile")) {
      responseText =
        "To complete your profile, go to the profile page and fill in your details including skills and location."
    } else if (lowerCommand.includes("help")) {
      responseText =
        "I'm here to help! You can ask about internships, profile setup, or application status. You can also use SMS by sending HELP to 9876543210."
    } else if (lowerCommand.includes("apply")) {
      responseText =
        "To apply for internships, first complete your profile, then browse recommendations and click apply on positions that interest you."
    } else if (lowerCommand.includes("hindi") || lowerCommand.includes("हिंदी")) {
      responseText = "आप हिंदी में सहायता के लिए 9876543210 पर SMS भेज सकते हैं या 1800-123-4567 पर कॉल कर सकते हैं।"
    } else {
      responseText =
        "I didn't understand that. You can ask about internships, profile setup, applications, or say 'help' for more options."
    }

    setResponse(responseText)
    speakResponse(responseText)
  }

  const speakResponse = (text) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = text.includes("हिंदी") || text.includes("आप") ? "hi-IN" : "en-IN"
      utterance.rate = 0.8
      speechSynthesis.speak(utterance)
    }
  }

  if (!recognition) {
    return null // Voice recognition not supported
  }

  return (
    <>
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1.5, type: "spring", stiffness: 200 }}
        style={{
          position: "fixed",
          bottom: 90,
          right: 20,
          zIndex: 1000,
        }}
      >
        <IconButton
          onClick={isListening ? stopListening : startListening}
          sx={{
            bgcolor: isListening ? "error.main" : "secondary.main",
            color: "white",
            width: 56,
            height: 56,
            "&:hover": { bgcolor: isListening ? "error.dark" : "secondary.dark" },
            boxShadow: 3,
          }}
        >
          {isListening ? <MicOff /> : <Mic />}
        </IconButton>
      </motion.div>

      <Dialog open={isOpen} onClose={() => setIsOpen(false)} maxWidth="sm" fullWidth>
        <DialogContent sx={{ textAlign: "center", p: 4 }}>
          <Box mb={3}>
            <motion.div
              animate={isListening ? { scale: [1, 1.2, 1] } : {}}
              transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1 }}
            >
              <Mic sx={{ fontSize: 60, color: isListening ? "error.main" : "text.secondary" }} />
            </motion.div>
          </Box>

          <Typography variant="h6" gutterBottom>
            {isListening ? "Listening..." : "Voice Assistant"}
          </Typography>

          {transcript && (
            <Box mb={2}>
              <Typography variant="subtitle2" color="text.secondary">
                You said:
              </Typography>
              <Typography variant="body1" sx={{ fontStyle: "italic", mb: 2 }}>
                "{transcript}"
              </Typography>
            </Box>
          )}

          {response && (
            <Box mb={2}>
              <Typography variant="subtitle2" color="text.secondary">
                Response:
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {response}
              </Typography>
              <Button startIcon={<VolumeUp />} onClick={() => speakResponse(response)} size="small">
                Repeat
              </Button>
            </Box>
          )}

          <Typography variant="caption" color="text.secondary">
            Try saying: "Show me internships", "Help with profile", or "Apply for jobs"
          </Typography>

          <Box mt={3}>
            <Button onClick={() => setIsOpen(false)} variant="outlined">
              Close
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default VoiceAssistant
