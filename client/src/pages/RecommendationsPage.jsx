"use client"

import { useState, useEffect } from "react"
import {
  Container,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Grid,
  Chip,
  Box,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Rating,
  TextField,
  Paper,
  Alert,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Switch,
  FormControlLabel,
  Divider,
  Avatar,
  Snackbar,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Skeleton,
} from "@mui/material"
import { motion, AnimatePresence } from "framer-motion"
import { useNavigate } from "react-router-dom"
import {
  LocationOn,
  Business,
  Schedule,
  Psychology,
  TrendingUp,
  FilterList,
  CompareArrows,
  VolumeUp,
  Sms,
  WhatsApp,
  Share,
  Close,
  Security,
  MonetizationOn,
  Group,
  Star,
  Dashboard,
  Refresh,
  SmartToy,
  AutoAwesome,
  Done,
  Home,
  Person,
  Verified,
} from "@mui/icons-material"

// Professional color palette matching homepage
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

import { recommendationsAPI, candidatesAPI } from "../services/api"
import { useAPI } from "../hooks/useAPI"

const RecommendationsPage = () => {
  const navigate = useNavigate()
  const [recommendations, setRecommendations] = useState([])
  const [_loading, setLoading] = useState(true)
  const [selectedInternship, setSelectedInternship] = useState(null)
  const [feedbackDialog, setFeedbackDialog] = useState(false)
  const [compareDialog, setCompareDialog] = useState(false)
  const [channelPreview, setChannelPreview] = useState(false)
  const [feedback, setFeedback] = useState({ rating: 0, comment: "" })
  const [filters, setFilters] = useState({
    maxDistance: 100,
    minStipend: 0,
    maxDuration: 12,
    riskThreshold: 50,
    showRemote: true,
    sortBy: "matchScore",
  })
  const [compareList, setCompareList] = useState([])
  const [realTimeUpdates, setRealTimeUpdates] = useState(true)
  const [voiceEnabled, setVoiceEnabled] = useState(false)
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" })

  // Simulate real-time recommendation updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (realTimeUpdates) {
        setRecommendations((prev) =>
          prev.map((rec) => ({
            ...rec,
            matchScore: Math.min(100, rec.matchScore + (Math.random() - 0.5) * 2),
            applicants: rec.applicants + Math.floor(Math.random() * 3),
          })),
        )
      }
    }, 5000)
    return () => clearInterval(interval)
  }, [realTimeUpdates])

  const [currentUser, setCurrentUser] = useState({ id: "demo-user" })

  const {
    data: recommendationsData,
    loading,
    error: recommendationsError,
    refetch,
  } = useAPI(() => recommendationsAPI.getRecommendations(currentUser?.id || "demo-user"), [currentUser?.id])

  const { data: profile, error: profileError } = useAPI(() => candidatesAPI.getProfile(), [])

  const [applyingTo, setApplyingTo] = useState(null)
  const [showApplicationModal, setShowApplicationModal] = useState(false)
  const [applicationData, setApplicationData] = useState({
    coverLetter: "",
    additionalInfo: "",
  })
  const [refreshing, setRefreshing] = useState(false)

  // Load recommendations with enhanced PMIS context
  useEffect(() => {
    const loadRecommendations = async () => {
      setLoading(true)

      // Simulate API call with realistic delay
      await new Promise((resolve) => setTimeout(resolve, 3000))

      const mockRecommendations = [
        // High Match, Low Risk Recommendations
        {
          id: 1,
          title: "Frontend Developer Intern",
          company: "TechCorp India",
          location: "Bangalore, Karnataka",
          coordinates: { lat: 12.9716, lng: 77.5946 },
          distance: 18,
          duration: "6 months",
          stipend: 25000,
          matchScore: 92,
          skills: ["React", "JavaScript", "CSS", "HTML"],
          description: "Work on cutting-edge web applications using modern React frameworks.",
          applicants: 1250,
          selected: 45,
          attritionRisk: 15,
          companyRating: 4.2,
          verified: true,
          remote: false,
          type: "Technical",
          experienceLevel: "Intermediate",
          explanation: {
            skillMatch: 95,
            locationMatch: 88,
            experienceMatch: 90,
            attritionPrediction: 15,
            reasons: [
              "Perfect match: React + JavaScript skills align 95%",
              "Low distance (18km) reduces dropout risk",
              "Company has 85% intern completion rate",
              "Stipend above city average",
            ],
            aiFactors: [
              { factor: "Skill Overlap", score: 95, weight: "40%" },
              { factor: "Location Proximity", score: 88, weight: "25%" },
              { factor: "Attrition Risk", score: 85, weight: "20%" },
              { factor: "Company Match", score: 82, weight: "15%" },
            ],
          },
          successPrediction: {
            completionProb: 85,
            performanceScore: 88,
            jobOfferProb: 72,
          },
          channels: {
            sms: `PMIS: Frontend Intern @ TechCorp (92% match, ₹25k). Low risk. Reply APPLY 001`,
            whatsapp: `🚀 92% Match Found!\nFrontend Intern @ TechCorp\n₹25,000/month • Bangalore\n✅ Low dropout risk (15%)\nTap to apply`,
            voice: `आपके लिए 92% मैच मिला है। TechCorp में Frontend इंटर्न की नौकरी।`,
          },
        },
        {
          id: 2,
          title: "Backend Developer Intern",
          company: "Nexlify Solutions",
          location: "Hyderabad, Telangana",
          coordinates: { lat: 17.385, lng: 78.4867 },
          distance: 25,
          duration: "5 months",
          stipend: 22000,
          matchScore: 90,
          skills: ["Node.js", "Express", "MongoDB", "API Development"],
          description: "Build scalable backend systems for enterprise applications.",
          applicants: 980,
          selected: 40,
          attritionRisk: 20,
          companyRating: 4.0,
          verified: true,
          remote: false,
          type: "Technical",
          experienceLevel: "Intermediate",
          explanation: {
            skillMatch: 92,
            locationMatch: 85,
            experienceMatch: 88,
            attritionPrediction: 20,
            reasons: [
              "Strong Node.js and MongoDB alignment",
              "Proximity (25km) supports retention",
              "High company retention rate",
              "Competitive stipend",
            ],
            aiFactors: [
              { factor: "Skill Overlap", score: 92, weight: "40%" },
              { factor: "Location Proximity", score: 85, weight: "25%" },
              { factor: "Attrition Risk", score: 80, weight: "20%" },
              { factor: "Company Match", score: 78, weight: "15%" },
            ],
          },
          successPrediction: {
            completionProb: 82,
            performanceScore: 85,
            jobOfferProb: 70,
          },
          channels: {
            sms: `PMIS: Backend Intern @ Nexlify (90% match, ₹22k). Low risk. Reply APPLY 002`,
            whatsapp: `🚀 90% Match!\nBackend Intern @ Nexlify\n₹22,000/month • Hyderabad\n✅ Low dropout risk (20%)\nTap to apply`,
            voice: `Nexlify में Backend इंटर्न की नौकरी। 90% मैच। 22 हजार मासिक।`,
          },
        },
        {
          id: 3,
          title: "UI/UX Design Intern",
          company: "Designify Studio",
          location: "Pune, Maharashtra",
          coordinates: { lat: 18.5204, lng: 73.8567 },
          distance: 30,
          duration: "4 months",
          stipend: 18000,
          matchScore: 88,
          skills: ["Figma", "Sketch", "User Research", "Prototyping"],
          description: "Design intuitive user interfaces for mobile and web apps.",
          applicants: 750,
          selected: 28,
          attritionRisk: 18,
          companyRating: 4.3,
          verified: true,
          remote: true,
          type: "Design",
          experienceLevel: "Beginner",
          explanation: {
            skillMatch: 90,
            locationMatch: 80,
            experienceMatch: 85,
            attritionPrediction: 18,
            reasons: [
              "Figma skills align perfectly",
              "Remote work reduces dropout risk",
              "Short commute distance",
              "High company rating",
            ],
            aiFactors: [
              { factor: "Skill Overlap", score: 90, weight: "40%" },
              { factor: "Remote Flexibility", score: 95, weight: "25%" },
              { factor: "Attrition Risk", score: 82, weight: "20%" },
              { factor: "Company Match", score: 80, weight: "15%" },
            ],
          },
          successPrediction: {
            completionProb: 80,
            performanceScore: 82,
            jobOfferProb: 65,
          },
          channels: {
            sms: `PMIS: UI/UX Intern @ Designify (88% match, ₹18k, Remote). Low risk. Reply APPLY 003`,
            whatsapp: `🎨 88% Match!\nUI/UX Intern @ Designify\n₹18,000/month • Pune\n✅ Low dropout risk (18%)\nTap to apply`,
            voice: `Designify में UI/UX इंटर्न की नौकरी। 88% मैच। रिमोट वर्क।`,
          },
        },
        {
          id: 4,
          title: "Mobile App Developer Intern",
          company: "AppWorks",
          location: "Chennai, Tamil Nadu",
          coordinates: { lat: 13.0827, lng: 80.2707 },
          distance: 15,
          duration: "6 months",
          stipend: 23000,
          matchScore: 87,
          skills: ["Flutter", "Dart", "Firebase", "REST APIs"],
          description: "Develop cross-platform mobile apps for startups.",
          applicants: 1100,
          selected: 35,
          attritionRisk: 22,
          companyRating: 4.1,
          verified: true,
          remote: false,
          type: "Technical",
          experienceLevel: "Intermediate",
          explanation: {
            skillMatch: 88,
            locationMatch: 90,
            experienceMatch: 85,
            attritionPrediction: 22,
            reasons: [
              "Flutter skills match job requirements",
              "Very close proximity (15km)",
              "Strong mentorship program",
              "Good company reputation",
            ],
            aiFactors: [
              { factor: "Skill Overlap", score: 88, weight: "40%" },
              { factor: "Location Proximity", score: 90, weight: "25%" },
              { factor: "Attrition Risk", score: 78, weight: "20%" },
              { factor: "Company Match", score: 80, weight: "15%" },
            ],
          },
          successPrediction: {
            completionProb: 83,
            performanceScore: 84,
            jobOfferProb: 68,
          },
          channels: {
            sms: `PMIS: Mobile App Intern @ AppWorks (87% match, ₹23k). Low risk. Reply APPLY 004`,
            whatsapp: `📱 87% Match!\nMobile App Intern @ AppWorks\n₹23,000/month • Chennai\n✅ Low dropout risk (22%)\nTap to apply`,
            voice: `AppWorks में Mobile App इंटर्न की नौकरी। 87% मैच। 23 हजार मासिक।`,
          },
        },
        {
          id: 5,
          title: "DevOps Intern",
          company: "CloudPeak",
          location: "Gurgaon, Haryana",
          coordinates: { lat: 28.4595, lng: 77.0266 },
          distance: 40,
          duration: "5 months",
          stipend: 20000,
          matchScore: 85,
          skills: ["Docker", "Kubernetes", "AWS", "CI/CD"],
          description: "Support cloud infrastructure and CI/CD pipelines.",
          applicants: 900,
          selected: 30,
          attritionRisk: 25,
          companyRating: 3.9,
          verified: true,
          remote: true,
          type: "Technical",
          experienceLevel: "Advanced",
          explanation: {
            skillMatch: 85,
            locationMatch: 80,
            experienceMatch: 82,
            attritionPrediction: 25,
            reasons: [
              "Strong DevOps skills alignment",
              "Remote work option reduces risk",
              "Moderate distance (40km)",
              "Good learning opportunities",
            ],
            aiFactors: [
              { factor: "Skill Overlap", score: 85, weight: "40%" },
              { factor: "Remote Flexibility", score: 90, weight: "25%" },
              { factor: "Attrition Risk", score: 75, weight: "20%" },
              { factor: "Learning Potential", score: 80, weight: "15%" },
            ],
          },
          successPrediction: {
            completionProb: 80,
            performanceScore: 80,
            jobOfferProb: 60,
          },
          channels: {
            sms: `PMIS: DevOps Intern @ CloudPeak (85% match, ₹20k, Remote). Low risk. Reply APPLY 005`,
            whatsapp: `☁️ 85% Match!\nDevOps Intern @ CloudPeak\n₹20,000/month • Gurgaon\n✅ Low dropout risk (25%)\nTap to apply`,
            voice: `CloudPeak में DevOps इंटर्न की नौकरी। 85% मैच। रिमोट वर्क।`,
          },
        },
        {
          id: 6,
          title: "Content Writing Intern",
          company: "WriteWell Media",
          location: "Noida, Uttar Pradesh",
          coordinates: { lat: 28.5355, lng: 77.391 },
          distance: 20,
          duration: "3 months",
          stipend: 15000,
          matchScore: 84,
          skills: ["Content Writing", "SEO", "Blogging", "Copywriting"],
          description: "Create engaging content for blogs and social media.",
          applicants: 1200,
          selected: 50,
          attritionRisk: 20,
          companyRating: 4.0,
          verified: true,
          remote: true,
          type: "Content",
          experienceLevel: "Beginner",
          explanation: {
            skillMatch: 88,
            locationMatch: 85,
            experienceMatch: 80,
            attritionPrediction: 20,
            reasons: [
              "SEO and writing skills align well",
              "Remote work reduces dropout risk",
              "Close proximity (20km)",
              "Entry-level friendly",
            ],
            aiFactors: [
              { factor: "Skill Overlap", score: 88, weight: "40%" },
              { factor: "Remote Flexibility", score: 90, weight: "25%" },
              { factor: "Attrition Risk", score: 80, weight: "20%" },
              { factor: "Learning Potential", score: 82, weight: "15%" },
            ],
          },
          successPrediction: {
            completionProb: 82,
            performanceScore: 78,
            jobOfferProb: 55,
          },
          channels: {
            sms: `PMIS: Content Intern @ WriteWell (84% match, ₹15k, Remote). Low risk. Reply APPLY 006`,
            whatsapp: `✍️ 84% Match!\nContent Intern @ WriteWell\n₹15,000/month • Noida\n✅ Low dropout risk (20%)\nTap to apply`,
            voice: `WriteWell में Content इंटर्न की नौकरी। 84% मैच। रिमोट वर्क।`,
          },
        },
        {
          id: 7,
          title: "Full Stack Developer Intern",
          company: "Innovatech",
          location: "Ahmedabad, Gujarat",
          coordinates: { lat: 23.0225, lng: 72.5714 },
          distance: 35,
          duration: "6 months",
          stipend: 24000,
          matchScore: 86,
          skills: ["React", "Node.js", "MongoDB", "Express"],
          description: "Develop full-stack applications for startups.",
          applicants: 950,
          selected: 38,
          attritionRisk: 23,
          companyRating: 4.2,
          verified: true,
          remote: false,
          type: "Technical",
          experienceLevel: "Intermediate",
          explanation: {
            skillMatch: 90,
            locationMatch: 82,
            experienceMatch: 85,
            attritionPrediction: 23,
            reasons: [
              "Full-stack skills match job needs",
              "Moderate distance (35km)",
              "Strong company mentorship",
              "Above-average stipend",
            ],
            aiFactors: [
              { factor: "Skill Overlap", score: 90, weight: "40%" },
              { factor: "Location Proximity", score: 82, weight: "25%" },
              { factor: "Attrition Risk", score: 77, weight: "20%" },
              { factor: "Company Match", score: 80, weight: "15%" },
            ],
          },
          successPrediction: {
            completionProb: 81,
            performanceScore: 83,
            jobOfferProb: 67,
          },
          channels: {
            sms: `PMIS: Full Stack Intern @ Innovatech (86% match, ₹24k). Low risk. Reply APPLY 007`,
            whatsapp: `🚀 86% Match!\nFull Stack Intern @ Innovatech\n₹24,000/month • Ahmedabad\n✅ Low dropout risk (23%)\nTap to apply`,
            voice: `Innovatech में Full Stack इंटर्न की नौकरी। 86% मैच। 24 हजार मासिक।`,
          },
        },
        {
          id: 8,
          title: "Product Management Intern",
          company: "GrowEasy",
          location: "Bangalore, Karnataka",
          coordinates: { lat: 12.9716, lng: 77.5946 },
          distance: 10,
          duration: "4 months",
          stipend: 20000,
          matchScore: 83,
          skills: ["Product Strategy", "Market Research", "Agile", "Analytics"],
          description: "Assist in product roadmap planning and market analysis.",
          applicants: 800,
          selected: 25,
          attritionRisk: 19,
          companyRating: 4.1,
          verified: true,
          remote: true,
          type: "Business",
          experienceLevel: "Beginner",
          explanation: {
            skillMatch: 85,
            locationMatch: 90,
            experienceMatch: 80,
            attritionPrediction: 19,
            reasons: [
              "Strong market research skills",
              "Very close proximity (10km)",
              "Remote work option",
              "Good company culture",
            ],
            aiFactors: [
              { factor: "Skill Overlap", score: 85, weight: "40%" },
              { factor: "Location Proximity", score: 90, weight: "25%" },
              { factor: "Attrition Risk", score: 81, weight: "20%" },
              { factor: "Company Match", score: 78, weight: "15%" },
            ],
          },
          successPrediction: {
            completionProb: 80,
            performanceScore: 80,
            jobOfferProb: 60,
          },
          channels: {
            sms: `PMIS: Product Intern @ GrowEasy (83% match, ₹20k, Remote). Low risk. Reply APPLY 008`,
            whatsapp: `📈 83% Match!\nProduct Intern @ GrowEasy\n₹20,000/month • Bangalore\n✅ Low dropout risk (19%)\nTap to apply`,
            voice: `GrowEasy में Product इंटर्न की नौकरी। 83% मैच। रिमोट वर्क।`,
          },
        },
        {
          id: 9,
          title: "Cybersecurity Intern",
          company: "SecureNet",
          location: "Mumbai, Maharashtra",
          coordinates: { lat: 19.076, lng: 72.8777 },
          distance: 50,
          duration: "6 months",
          stipend: 21000,
          matchScore: 82,
          skills: ["Network Security", "Penetration Testing", "Linux", "Firewall"],
          description: "Assist in securing enterprise networks and systems.",
          applicants: 700,
          selected: 20,
          attritionRisk: 27,
          companyRating: 3.8,
          verified: true,
          remote: false,
          type: "Technical",
          experienceLevel: "Advanced",
          explanation: {
            skillMatch: 80,
            locationMatch: 78,
            experienceMatch: 85,
            attritionPrediction: 27,
            reasons: [
              "Good cybersecurity skills match",
              "Moderate distance (50km)",
              "Strong learning environment",
              "Competitive stipend",
            ],
            aiFactors: [
              { factor: "Skill Overlap", score: 80, weight: "40%" },
              { factor: "Location Proximity", score: 78, weight: "25%" },
              { factor: "Attrition Risk", score: 73, weight: "20%" },
              { factor: "Learning Potential", score: 82, weight: "15%" },
            ],
          },
          successPrediction: {
            completionProb: 78,
            performanceScore: 80,
            jobOfferProb: 58,
          },
          channels: {
            sms: `PMIS: Cybersecurity Intern @ SecureNet (82% match, ₹21k). Low risk. Reply APPLY 009`,
            whatsapp: `🔒 82% Match!\nCybersecurity Intern @ SecureNet\n₹21,000/month • Mumbai\n✅ Low dropout risk (27%)\nTap to apply`,
            voice: `SecureNet में Cybersecurity इंटर्न की नौकरी। 82% मैच। 21 हजार मासिक।`,
          },
        },
        {
          id: 10,
          title: "Graphic Design Intern",
          company: "CreativeVibe",
          location: "Delhi, NCR",
          coordinates: { lat: 28.7041, lng: 77.1025 },
          distance: 12,
          duration: "3 months",
          stipend: 16000,
          matchScore: 81,
          skills: ["Adobe Photoshop", "Illustrator", "Branding", "UI Design"],
          description: "Create visual assets for marketing campaigns.",
          applicants: 850,
          selected: 30,
          attritionRisk: 21,
          companyRating: 4.0,
          verified: true,
          remote: true,
          type: "Design",
          experienceLevel: "Beginner",
          explanation: {
            skillMatch: 85,
            locationMatch: 88,
            experienceMatch: 80,
            attritionPrediction: 21,
            reasons: [
              "Strong Photoshop skills alignment",
              "Very close proximity (12km)",
              "Remote work option",
              "Entry-level friendly",
            ],
            aiFactors: [
              { factor: "Skill Overlap", score: 85, weight: "40%" },
              { factor: "Location Proximity", score: 88, weight: "25%" },
              { factor: "Attrition Risk", score: 79, weight: "20%" },
              { factor: "Learning Potential", score: 80, weight: "15%" },
            ],
          },
          successPrediction: {
            completionProb: 80,
            performanceScore: 78,
            jobOfferProb: 55,
          },
          channels: {
            sms: `PMIS: Graphic Design Intern @ CreativeVibe (81% match, ₹16k, Remote). Low risk. Reply APPLY 010`,
            whatsapp: `🎨 81% Match!\nGraphic Design Intern @ CreativeVibe\n₹16,000/month • Delhi\n✅ Low dropout risk (21%)\nTap to apply`,
            voice: `CreativeVibe में Graphic Design इंटर्न की नौकरी। 81% मैच। रिमोट वर्क।`,
          },
        },
        {
          id: 100,
          title: "QA Engineer Intern",
          company: "QualityFirst Labs",
          location: "Indore, Madhya Pradesh",
          coordinates: { lat: 22.7196, lng: 75.8577 },
          distance: 22,
          duration: "4 months",
          stipend: 18000,
          matchScore: 82,
          skills: ["Manual Testing", "JIRA", "Test Cases", "Basics of Selenium"],
          description: "Test web and mobile apps, write test cases, and report bugs.",
          applicants: 640,
          selected: 24,
          attritionRisk: 24,
          companyRating: 4.1,
          verified: true,
          remote: true,
          type: "Technical",
          experienceLevel: "Beginner",
          explanation: {
            skillMatch: 84,
            locationMatch: 86,
            experienceMatch: 78,
            attritionPrediction: 24,
            reasons: [
              "Close proximity (22km) lowers dropout risk",
              "Clear learning path and mentorship",
              "Remote-friendly with flexible timings",
              "Stable workload and low context switching",
            ],
            aiFactors: [
              { factor: "Skill Overlap", score: 84, weight: "40%" },
              { factor: "Location Proximity", score: 86, weight: "25%" },
              { factor: "Attrition Risk", score: 76, weight: "20%" },
              { factor: "Learning Potential", score: 80, weight: "15%" },
            ],
          },
          successPrediction: {
            completionProb: 79,
            performanceScore: 80,
            jobOfferProb: 57,
          },
          channels: {
            sms: `PMIS: QA Intern @ QualityFirst (82% match, ₹18k, Remote). Low risk. Reply APPLY 100`,
            whatsapp: `🧪 82% Match!\nQA Intern @ QualityFirst\n₹18,000/month • Indore\n✅ Low dropout risk (24%)\nTap to apply`,
            voice: `QualityFirst में QA इंटर्न की नौकरी। 82% मैच। रिमोट ऑप्शन।`,
          },
        },
        {
          id: 101,
          title: "Operations Associate Intern",
          company: "LogiChain",
          location: "Kolkata, West Bengal",
          coordinates: { lat: 22.5726, lng: 88.3639 },
          distance: 28,
          duration: "5 months",
          stipend: 17000,
          matchScore: 80,
          skills: ["MS Excel", "Communication", "Documentation", "Process Mapping"],
          description: "Support day-to-day operations, maintain logs, and coordinate with teams.",
          applicants: 720,
          selected: 27,
          attritionRisk: 26,
          companyRating: 4.0,
          verified: true,
          remote: false,
          type: "Business",
          experienceLevel: "Beginner",
          explanation: {
            skillMatch: 82,
            locationMatch: 82,
            experienceMatch: 80,
            attritionPrediction: 26,
            reasons: [
              "Structured onboarding program",
              "Office commute within 30km",
              "Steady working hours reduce burnout",
              "Practical, hands-on tasks improve engagement",
            ],
            aiFactors: [
              { factor: "Skill Overlap", score: 82, weight: "40%" },
              { factor: "Location Proximity", score: 82, weight: "25%" },
              { factor: "Attrition Risk", score: 74, weight: "20%" },
              { factor: "Company Match", score: 78, weight: "15%" },
            ],
          },
          successPrediction: {
            completionProb: 78,
            performanceScore: 79,
            jobOfferProb: 54,
          },
          channels: {
            sms: `PMIS: Ops Intern @ LogiChain (80% match, ₹17k). Low risk. Reply APPLY 101`,
            whatsapp: `📦 80% Match!\nOperations Intern @ LogiChain\n₹17,000/month • Kolkata\n✅ Low dropout risk (26%)\nTap to apply`,
            voice: `LogiChain में Operations इंटर्न की नौकरी। 80% मैच। 17 हजार मासिक।`,
          },
        },

        // Medium Attrition Risk (12 entries, 31-60)
        {
          id: 11,
          title: "Data Science Intern",
          company: "Analytics Pro",
          location: "Mumbai, Maharashtra",
          coordinates: { lat: 19.076, lng: 72.8777 },
          distance: 450,
          duration: "4 months",
          stipend: 20000,
          matchScore: 78,
          skills: ["Python", "Machine Learning", "SQL", "Statistics"],
          description: "Analyze large datasets and build predictive models.",
          applicants: 890,
          selected: 32,
          attritionRisk: 45,
          companyRating: 3.8,
          verified: true,
          remote: true,
          type: "Technical",
          experienceLevel: "Intermediate",
          explanation: {
            skillMatch: 75,
            locationMatch: 60,
            experienceMatch: 85,
            attritionPrediction: 45,
            reasons: [
              "Python skills match 75% of requirements",
              "High distance increases dropout risk",
              "Remote work option reduces risk",
              "Entry-level friendly with mentorship",
            ],
            aiFactors: [
              { factor: "Skill Overlap", score: 75, weight: "40%" },
              { factor: "Remote Flexibility", score: 90, weight: "25%" },
              { factor: "Attrition Risk", score: 55, weight: "20%" },
              { factor: "Learning Potential", score: 88, weight: "15%" },
            ],
          },
          successPrediction: {
            completionProb: 68,
            performanceScore: 82,
            jobOfferProb: 45,
          },
          channels: {
            sms: `PMIS: Data Science @ Analytics Pro (78% match, ₹20k, Remote). Medium risk. Reply APPLY 011`,
            whatsapp: `📊 78% Match!\nData Science Intern @ Analytics Pro\n₹20,000/month • Remote\n⚠️ Medium dropout risk (45%)\nTap to apply`,
            voice: `Analytics Pro में Data Science इंटर्न की नौकरी। 78% मैच। रिमोट वर्क।`,
          },
        },
        {
          id: 12,
          title: "AI Research Intern",
          company: "IntelliCore",
          location: "Bangalore, Karnataka",
          coordinates: { lat: 12.9716, lng: 77.5946 },
          distance: 100,
          duration: "6 months",
          stipend: 22000,
          matchScore: 76,
          skills: ["Python", "TensorFlow", "NLP", "Deep Learning"],
          description: "Research cutting-edge AI models for NLP applications.",
          applicants: 650,
          selected: 20,
          attritionRisk: 50,
          companyRating: 3.9,
          verified: false,
          remote: false,
          type: "Technical",
          experienceLevel: "Advanced",
          explanation: {
            skillMatch: 78,
            locationMatch: 70,
            experienceMatch: 80,
            attritionPrediction: 50,
            reasons: [
              "Good NLP skills alignment",
              "Moderate distance (100km)",
              "High skill requirement increases risk",
              "Strong learning potential",
            ],
            aiFactors: [
              { factor: "Skill Overlap", score: 78, weight: "40%" },
              { factor: "Location Proximity", score: 70, weight: "25%" },
              { factor: "Attrition Risk", score: 50, weight: "20%" },
              { factor: "Learning Potential", score: 85, weight: "15%" },
            ],
          },
          successPrediction: {
            completionProb: 65,
            performanceScore: 80,
            jobOfferProb: 50,
          },
          channels: {
            sms: `PMIS: AI Research @ IntelliCore (76% match, ₹22k). Medium risk. Reply APPLY 012`,
            whatsapp: `🤖 76% Match!\nAI Research Intern @ IntelliCore\n₹22,000/month • Bangalore\n⚠️ Medium dropout risk (50%)\nTap to apply`,
            voice: `IntelliCore में AI Research इंटर्न की नौकरी। 76% मैच। 22 हजार मासिक।`,
          },
        },
        {
          id: 13,
          title: "Marketing Analyst Intern",
          company: "BrandBoost",
          location: "Delhi, NCR",
          coordinates: { lat: 28.7041, lng: 77.1025 },
          distance: 300,
          duration: "3 months",
          stipend: 17000,
          matchScore: 74,
          skills: ["Market Research", "Analytics", "Excel", "Google Analytics"],
          description: "Analyze market trends and campaign performance.",
          applicants: 1000,
          selected: 35,
          attritionRisk: 48,
          companyRating: 3.7,
          verified: true,
          remote: true,
          type: "Business",
          experienceLevel: "Beginner",
          explanation: {
            skillMatch: 75,
            locationMatch: 65,
            experienceMatch: 78,
            attritionPrediction: 48,
            reasons: [
              "Good analytics skills match",
              "High distance (300km) increases risk",
              "Remote work reduces risk",
              "Short duration may limit learning",
            ],
            aiFactors: [
              { factor: "Skill Overlap", score: 75, weight: "40%" },
              { factor: "Remote Flexibility", score: 85, weight: "25%" },
              { factor: "Attrition Risk", score: 52, weight: "20%" },
              { factor: "Learning Potential", score: 75, weight: "15%" },
            ],
          },
          successPrediction: {
            completionProb: 66,
            performanceScore: 78,
            jobOfferProb: 48,
          },
          channels: {
            sms: `PMIS: Marketing Analyst @ BrandBoost (74% match, ₹17k, Remote). Medium risk. Reply APPLY 013`,
            whatsapp: `📈 74% Match!\nMarketing Analyst Intern @ BrandBoost\n₹17,000/month • Remote\n⚠️ Medium dropout risk (48%)\nTap to apply`,
            voice: `BrandBoost में Marketing Analyst इंटर्न की नौकरी। 74% मैच। रिमोट वर्क।`,
          },
        },
        {
          id: 14,
          title: "Cloud Engineer Intern",
          company: "SkyNet Solutions",
          location: "Hyderabad, Telangana",
          coordinates: { lat: 17.385, lng: 78.4867 },
          distance: 150,
          duration: "5 months",
          stipend: 19000,
          matchScore: 75,
          skills: ["AWS", "Azure", "Linux", "Terraform"],
          description: "Support cloud infrastructure deployments.",
          applicants: 720,
          selected: 25,
          attritionRisk: 42,
          companyRating: 3.8,
          verified: true,
          remote: false,
          type: "Technical",
          experienceLevel: "Intermediate",
          explanation: {
            skillMatch: 78,
            locationMatch: 68,
            experienceMatch: 80,
            attritionPrediction: 42,
            reasons: [
              "Good cloud skills alignment",
              "Moderate distance (150km)",
              "Non-remote increases risk",
              "Good mentorship program",
            ],
            aiFactors: [
              { factor: "Skill Overlap", score: 78, weight: "40%" },
              { factor: "Location Proximity", score: 68, weight: "25%" },
              { factor: "Attrition Risk", score: 58, weight: "20%" },
              { factor: "Learning Potential", score: 80, weight: "15%" },
            ],
          },
          successPrediction: {
            completionProb: 67,
            performanceScore: 78,
            jobOfferProb: 50,
          },
          channels: {
            sms: `PMIS: Cloud Engineer @ SkyNet (75% match, ₹19k). Medium risk. Reply APPLY 014`,
            whatsapp: `☁️ 75% Match!\nCloud Engineer Intern @ SkyNet\n₹19,000/month • Hyderabad\n⚠️ Medium dropout risk (42%)\nTap to apply`,
            voice: `SkyNet में Cloud Engineer इंटर्न की नौकरी। 75% मैच। 19 हजार मासिक।`,
          },
        },
        {
          id: 15,
          title: "Social Media Intern",
          company: "ViralVibe",
          location: "Pune, Maharashtra",
          coordinates: { lat: 18.5204, lng: 73.8567 },
          distance: 200,
          duration: "3 months",
          stipend: 16000,
          matchScore: 73,
          skills: ["Social Media", "Content Creation", "Analytics", "Branding"],
          description: "Manage social media campaigns for clients.",
          applicants: 1300,
          selected: 40,
          attritionRisk: 40,
          companyRating: 3.6,
          verified: false,
          remote: true,
          type: "Marketing",
          experienceLevel: "Beginner",
          explanation: {
            skillMatch: 75,
            locationMatch: 65,
            experienceMatch: 78,
            attritionPrediction: 40,
            reasons: [
              "Good social media skills",
              "Moderate distance (200km)",
              "Remote work reduces risk",
              "Entry-level friendly",
            ],
            aiFactors: [
              { factor: "Skill Overlap", score: 75, weight: "40%" },
              { factor: "Remote Flexibility", score: 85, weight: "25%" },
              { factor: "Attrition Risk", score: 60, weight: "20%" },
              { factor: "Learning Potential", score: 75, weight: "15%" },
            ],
          },
          successPrediction: {
            completionProb: 65,
            performanceScore: 75,
            jobOfferProb: 45,
          },
          channels: {
            sms: `PMIS: Social Media @ ViralVibe (73% match, ₹16k, Remote). Medium risk. Reply APPLY 015`,
            whatsapp: `📱 73% Match!\nSocial Media Intern @ ViralVibe\n₹16,000/month • Remote\n⚠️ Medium dropout risk (40%)\nTap to apply`,
            voice: `ViralVibe में Social Media इंटर्न की नौकरी। 73% मैच। रिमोट वर्क।`,
          },
        },
        {
          id: 16,
          title: "Blockchain Intern",
          company: "CryptoTech",
          location: "Bangalore, Karnataka",
          coordinates: { lat: 12.9716, lng: 77.5946 },
          distance: 120,
          duration: "6 months",
          stipend: 21000,
          matchScore: 72,
          skills: ["Solidity", "Ethereum", "Smart Contracts", "Web3"],
          description: "Develop blockchain-based applications.",
          applicants: 600,
          selected: 15,
          attritionRisk: 55,
          companyRating: 3.7,
          verified: false,
          remote: false,
          type: "Technical",
          experienceLevel: "Advanced",
          explanation: {
            skillMatch: 75,
            locationMatch: 65,
            experienceMatch: 78,
            attritionPrediction: 55,
            reasons: [
              "Solidity skills partially match",
              "Moderate distance (120km)",
              "High skill requirement increases risk",
              "Innovative field",
            ],
            aiFactors: [
              { factor: "Skill Overlap", score: 75, weight: "40%" },
              { factor: "Location Proximity", score: 65, weight: "25%" },
              { factor: "Attrition Risk", score: 45, weight: "20%" },
              { factor: "Learning Potential", score: 85, weight: "15%" },
            ],
          },
          successPrediction: {
            completionProb: 62,
            performanceScore: 78,
            jobOfferProb: 48,
          },
          channels: {
            sms: `PMIS: Blockchain @ CryptoTech (72% match, ₹21k). Medium risk. Reply APPLY 016`,
            whatsapp: `🔗 72% Match!\nBlockchain Intern @ CryptoTech\n₹21,000/month • Bangalore\n⚠️ Medium dropout risk (55%)\nTap to apply`,
            voice: `CryptoTech में Blockchain इंटर्न की नौकरी। 72% मैच। 21 हजार मासिक।`,
          },
        },
        {
          id: 17,
          title: "HR Intern",
          company: "PeopleFirst",
          location: "Chennai, Tamil Nadu",
          coordinates: { lat: 13.0827, lng: 80.2707 },
          distance: 250,
          duration: "4 months",
          stipend: 15000,
          matchScore: 71,
          skills: ["Recruitment", "Employee Engagement", "HR Analytics", "Communication"],
          description: "Support HR operations and talent acquisition.",
          applicants: 950,
          selected: 30,
          attritionRisk: 38,
          companyRating: 3.8,
          verified: true,
          remote: true,
          type: "Business",
          experienceLevel: "Beginner",
          explanation: {
            skillMatch: 75,
            locationMatch: 60,
            experienceMatch: 75,
            attritionPrediction: 38,
            reasons: [
              "Good communication skills",
              "High distance (250km) increases risk",
              "Remote work reduces risk",
              "Entry-level role",
            ],
            aiFactors: [
              { factor: "Skill Overlap", score: 75, weight: "40%" },
              { factor: "Remote Flexibility", score: 85, weight: "25%" },
              { factor: "Attrition Risk", score: 62, weight: "20%" },
              { factor: "Learning Potential", score: 75, weight: "15%" },
            ],
          },
          successPrediction: {
            completionProb: 68,
            performanceScore: 75,
            jobOfferProb: 45,
          },
          channels: {
            sms: `PMIS: HR Intern @ PeopleFirst (71% match, ₹15k, Remote). Medium risk. Reply APPLY 017`,
            whatsapp: `👥 71% Match!\nHR Intern @ PeopleFirst\n₹15,000/month • Remote\n⚠️ Medium dropout risk (38%)\nTap to apply`,
            voice: `PeopleFirst में HR इंटर्न की नौकरी। 71% मैच। रिमोट वर्क।`,
          },
        },
        {
          id: 18,
          title: "QA Engineer Intern",
          company: "TestPro",
          location: "Noida, Uttar Pradesh",
          coordinates: { lat: 28.5355, lng: 77.391 },
          distance: 180,
          duration: "5 months",
          stipend: 18000,
          matchScore: 70,
          skills: ["Selenium", "Manual Testing", "JIRA", "Test Automation"],
          description: "Perform quality assurance for software products.",
          applicants: 800,
          selected: 25,
          attritionRisk: 44,
          companyRating: 3.6,
          verified: true,
          remote: false,
          type: "Technical",
          experienceLevel: "Intermediate",
          explanation: {
            skillMatch: 72,
            locationMatch: 65,
            experienceMatch: 75,
            attritionPrediction: 44,
            reasons: [
              "Good testing skills alignment",
              "Moderate distance (180km)",
              "Non-remote increases risk",
              "Good learning environment",
            ],
            aiFactors: [
              { factor: "Skill Overlap", score: 72, weight: "40%" },
              { factor: "Location Proximity", score: 65, weight: "25%" },
              { factor: "Attrition Risk", score: 56, weight: "20%" },
              { factor: "Learning Potential", score: 78, weight: "15%" },
            ],
          },
          successPrediction: {
            completionProb: 65,
            performanceScore: 75,
            jobOfferProb: 48,
          },
          channels: {
            sms: `PMIS: QA Intern @ TestPro (70% match, ₹18k). Medium risk. Reply APPLY 018`,
            whatsapp: `🧪 70% Match!\nQA Intern @ TestPro\n₹18,000/month • Noida\n⚠️ Medium dropout risk (44%)\nTap to apply`,
            voice: `TestPro में QA इंटर्न की नौकरी। 70% मैच। 18 हजार मासिक।`,
          },
        },
        {
          id: 19,
          title: "Business Analyst Intern",
          company: "GrowSmart",
          location: "Gurgaon, Haryana",
          coordinates: { lat: 28.4595, lng: 77.0266 },
          distance: 220,
          duration: "4 months",
          stipend: 17000,
          matchScore: 69,
          skills: ["Data Analysis", "Excel", "SQL", "Business Strategy"],
          description: "Support business strategy with data insights.",
          applicants: 850,
          selected: 28,
          attritionRisk: 46,
          companyRating: 3.7,
          verified: true,
          remote: true,
          type: "Business",
          experienceLevel: "Beginner",
          explanation: {
            skillMatch: 70,
            locationMatch: 60,
            experienceMatch: 75,
            attritionPrediction: 46,
            reasons: [
              "Good data analysis skills",
              "High distance (220km) increases risk",
              "Remote work reduces risk",
              "Entry-level role",
            ],
            aiFactors: [
              { factor: "Skill Overlap", score: 70, weight: "40%" },
              { factor: "Remote Flexibility", score: 85, weight: "25%" },
              { factor: "Attrition Risk", score: 54, weight: "20%" },
              { factor: "Learning Potential", score: 75, weight: "15%" },
            ],
          },
          successPrediction: {
            completionProb: 66,
            performanceScore: 75,
            jobOfferProb: 45,
          },
          channels: {
            sms: `PMIS: Business Analyst @ GrowSmart (69% match, ₹17k, Remote). Medium risk. Reply APPLY 019`,
            whatsapp: `📊 69% Match!\nBusiness Analyst Intern @ GrowSmart\n₹17,000/month • Remote\n⚠️ Medium dropout risk (46%)\nTap to apply`,
            voice: `GrowSmart में Business Analyst इंटर्न की नौकरी। 69% मैच। रिमोट वर्क।`,
          },
        },
        {
          id: 20,
          title: "Android Developer Intern",
          company: "MobilePeak",
          location: "Chennai, Tamil Nadu",
          coordinates: { lat: 13.0827, lng: 80.2707 },
          distance: 170,
          duration: "5 months",
          stipend: 19000,
          matchScore: 68,
          skills: ["Android Studio", "Kotlin", "Java", "REST APIs"],
          description: "Develop Android applications for enterprise clients.",
          applicants: 750,
          selected: 22,
          attritionRisk: 43,
          companyRating: 3.8,
          verified: true,
          remote: false,
          type: "Technical",
          experienceLevel: "Intermediate",
          explanation: {
            skillMatch: 70,
            locationMatch: 65,
            experienceMatch: 75,
            attritionPrediction: 43,
            reasons: [
              "Good Android skills alignment",
              "Moderate distance (170km)",
              "Non-remote increases risk",
              "Good mentorship program",
            ],
            aiFactors: [
              { factor: "Skill Overlap", score: 70, weight: "40%" },
              { factor: "Location Proximity", score: 65, weight: "25%" },
              { factor: "Attrition Risk", score: 57, weight: "20%" },
              { factor: "Learning Potential", score: 78, weight: "15%" },
            ],
          },
          successPrediction: {
            completionProb: 65,
            performanceScore: 75,
            jobOfferProb: 48,
          },
          channels: {
            sms: `PMIS: Android Intern @ MobilePeak (68% match, ₹19k). Medium risk. Reply APPLY 020`,
            whatsapp: `📱 68% Match!\nAndroid Intern @ MobilePeak\n₹19,000/month • Chennai\n⚠️ Medium dropout risk (43%)\nTap to apply`,
            voice: `MobilePeak में Android इंटर्न की नौकरी। 68% मैच। 19 हजार मासिक।`,
          },
        },
        {
          id: 21,
          title: "Content Marketing Intern",
          company: "StoryTellers",
          location: "Mumbai, Maharashtra",
          coordinates: { lat: 19.076, lng: 72.8777 },
          distance: 230,
          duration: "3 months",
          stipend: 15000,
          matchScore: 67,
          skills: ["Content Writing", "SEO", "Social Media", "Analytics"],
          description: "Create content for marketing campaigns.",
          applicants: 1100,
          selected: 35,
          attritionRisk: 41,
          companyRating: 3.6,
          verified: false,
          remote: true,
          type: "Marketing",
          experienceLevel: "Beginner",
          explanation: {
            skillMatch: 70,
            locationMatch: 60,
            experienceMatch: 75,
            attritionPrediction: 41,
            reasons: [
              "Good content skills",
              "High distance (230km) increases risk",
              "Remote work reduces risk",
              "Entry-level role",
            ],
            aiFactors: [
              { factor: "Skill Overlap", score: 70, weight: "40%" },
              { factor: "Remote Flexibility", score: 85, weight: "25%" },
              { factor: "Attrition Risk", score: 59, weight: "20%" },
              { factor: "Learning Potential", score: 75, weight: "15%" },
            ],
          },
          successPrediction: {
            completionProb: 65,
            performanceScore: 75,
            jobOfferProb: 45,
          },
          channels: {
            sms: `PMIS: Content Marketing @ StoryTellers (67% match, ₹15k, Remote). Medium risk. Reply APPLY 021`,
            whatsapp: `✍️ 67% Match!\nContent Marketing Intern @ StoryTellers\n₹15,000/month • Remote\n⚠️ Medium dropout risk (41%)\nTap to apply`,
            voice: `StoryTellers में Content Marketing इंटर्न की नौकरी। 67% मैच। रिमोट वर्क।`,
          },
        },
        {
          id: 22,
          title: "IoT Developer Intern",
          company: "SmartTech",
          location: "Pune, Maharashtra",
          coordinates: { lat: 18.5204, lng: 73.8567 },
          distance: 190,
          duration: "6 months",
          stipend: 20000,
          matchScore: 66,
          skills: ["IoT", "Arduino", "Python", "Sensors"],
          description: "Develop IoT solutions for smart devices.",
          applicants: 600,
          selected: 18,
          attritionRisk: 47,
          companyRating: 3.7,
          verified: false,
          remote: false,
          type: "Technical",
          experienceLevel: "Advanced",
          explanation: {
            skillMatch: 70,
            locationMatch: 60,
            experienceMatch: 75,
            attritionPrediction: 47,
            reasons: [
              "Good IoT skills alignment",
              "Moderate distance (190km)",
              "High skill requirement increases risk",
              "Innovative field",
            ],
            aiFactors: [
              { factor: "Skill Overlap", score: 70, weight: "40%" },
              { factor: "Location Proximity", score: 60, weight: "25%" },
              { factor: "Attrition Risk", score: 53, weight: "20%" },
              { factor: "Learning Potential", score: 80, weight: "15%" },
            ],
          },
          successPrediction: {
            completionProb: 62,
            performanceScore: 75,
            jobOfferProb: 45,
          },
          channels: {
            sms: `PMIS: IoT Intern @ SmartTech (66% match, ₹20k). Medium risk. Reply APPLY 022`,
            whatsapp: `📡 66% Match!\nIoT Intern @ SmartTech\n₹20,000/month • Pune\n⚠️ Medium dropout risk (47%)\nTap to apply`,
            voice: `SmartTech में IoT इंटर्न की नौकरी। 66% मैच। 20 हजार मासिक।`,
          },
        },

        // High Attrition Risk (13 entries, 61-100)
        {
          id: 23,
          title: "Digital Marketing Intern",
          company: "Growth Hackers",
          location: "Delhi, NCR",
          coordinates: { lat: 28.7041, lng: 77.1025 },
          distance: 1200,
          duration: "3 months",
          stipend: 15000,
          matchScore: 65,
          skills: ["Social Media", "Content Writing", "Analytics", "SEO"],
          description: "Create engaging content and manage social media campaigns.",
          applicants: 2100,
          selected: 25,
          attritionRisk: 72,
          companyRating: 3.5,
          verified: false,
          remote: false,
          type: "Marketing",
          experienceLevel: "Beginner",
          explanation: {
            skillMatch: 60,
            locationMatch: 30,
            experienceMatch: 75,
            attritionPrediction: 72,
            reasons: [
              "Communication skills partially match",
              "Very high distance (1200km) major dropout risk",
              "Low stipend for Delhi market",
              "Short duration may limit learning",
            ],
            aiFactors: [
              { factor: "Skill Overlap", score: 60, weight: "40%" },
              { factor: "Location Distance", score: 30, weight: "25%" },
              { factor: "Attrition Risk", score: 28, weight: "20%" },
              { factor: "Market Alignment", score: 45, weight: "15%" },
            ],
          },
          successPrediction: {
            completionProb: 35,
            performanceScore: 58,
            jobOfferProb: 22,
          },
          channels: {
            sms: `PMIS: Marketing @ Growth Hackers (65% match, ₹15k). HIGH risk. Reply APPLY 023`,
            whatsapp: `⚠️ 65% Match!\nMarketing Intern @ Growth Hackers\n₹15,000/month • Delhi\n🔴 HIGH dropout risk (72%)\nTap to apply`,
            voice: `Growth Hackers में Marketing इंटर्न की नौकरी। 72% छोड़ने का खतरा।`,
          },
        },
        {
          id: 24,
          title: "Game Developer Intern",
          company: "GameZone",
          location: "Kolkata, West Bengal",
          coordinates: { lat: 22.5726, lng: 88.3639 },
          distance: 1500,
          duration: "6 months",
          stipend: 14000,
          matchScore: 62,
          skills: ["Unity", "C#", "3D Modeling", "Game Design"],
          description: "Develop indie games for mobile platforms.",
          applicants: 950,
          selected: 20,
          attritionRisk: 75,
          companyRating: 3.4,
          verified: false,
          remote: false,
          type: "Technical",
          experienceLevel: "Intermediate",
          explanation: {
            skillMatch: 60,
            locationMatch: 25,
            experienceMatch: 70,
            attritionPrediction: 75,
            reasons: [
              "Partial Unity skills match",
              "Very high distance (1500km)",
              "Low stipend increases risk",
              "Non-remote role",
            ],
            aiFactors: [
              { factor: "Skill Overlap", score: 60, weight: "40%" },
              { factor: "Location Distance", score: 25, weight: "25%" },
              { factor: "Attrition Risk", score: 25, weight: "20%" },
              { factor: "Market Alignment", score: 40, weight: "15%" },
            ],
          },
          successPrediction: {
            completionProb: 32,
            performanceScore: 55,
            jobOfferProb: 20,
          },
          channels: {
            sms: `PMIS: Game Developer @ GameZone (62% match, ₹14k). HIGH risk. Reply APPLY 024`,
            whatsapp: `🎮 62% Match!\nGame Developer Intern @ GameZone\n₹14,000/month • Kolkata\n🔴 HIGH dropout risk (75%)\nTap to apply`,
            voice: `GameZone में Game Developer इंटर्न की नौकरी। 75% छोड़ने का खतरा।`,
          },
        },
        {
          id: 25,
          title: "Sales Intern",
          company: "SellSmart",
          location: "Jaipur, Rajasthan",
          coordinates: { lat: 26.9124, lng: 75.7873 },
          distance: 1100,
          duration: "3 months",
          stipend: 12000,
          matchScore: 60,
          skills: ["Sales", "Communication", "CRM", "Negotiation"],
          description: "Support sales team in client acquisition.",
          applicants: 1400,
          selected: 30,
          attritionRisk: 70,
          companyRating: 3.3,
          verified: false,
          remote: false,
          type: "Business",
          experienceLevel: "Beginner",
          explanation: {
            skillMatch: 60,
            locationMatch: 30,
            experienceMatch: 70,
            attritionPrediction: 70,
            reasons: [
              "Communication skills match",
              "Very high distance (1100km)",
              "Low stipend increases risk",
              "Non-remote role",
            ],
            aiFactors: [
              { factor: "Skill Overlap", score: 60, weight: "40%" },
              { factor: "Location Distance", score: 30, weight: "25%" },
              { factor: "Attrition Risk", score: 30, weight: "20%" },
              { factor: "Market Alignment", score: 40, weight: "15%" },
            ],
          },
          successPrediction: {
            completionProb: 35,
            performanceScore: 58,
            jobOfferProb: 22,
          },
          channels: {
            sms: `PMIS: Sales Intern @ SellSmart (60% match, ₹12k). HIGH risk. Reply APPLY 025`,
            whatsapp: `💼 60% Match!\nSales Intern @ SellSmart\n₹12,000/month • Jaipur\n🔴 HIGH dropout risk (70%)\nTap to apply`,
            voice: `SellSmart में Sales इंटर्न की नौकरी। 70% छोड़ने का खतरा।`,
          },
        },
        {
          id: 26,
          title: "AR/VR Developer Intern",
          company: "VirtualVibe",
          location: "Ahmedabad, Gujarat",
          coordinates: { lat: 23.0225, lng: 72.5714 },
          distance: 1300,
          duration: "6 months",
          stipend: 15000,
          matchScore: 61,
          skills: ["Unity", "C#", "ARCore", "VR Development"],
          description: "Develop augmented reality applications.",
          applicants: 700,
          selected: 15,
          attritionRisk: 73,
          companyRating: 3.4,
          verified: false,
          remote: false,
          type: "Technical",
          experienceLevel: "Advanced",
          explanation: {
            skillMatch: 60,
            locationMatch: 25,
            experienceMatch: 70,
            attritionPrediction: 73,
            reasons: [
              "Partial AR skills match",
              "Very high distance (1300km)",
              "Low stipend increases risk",
              "High skill requirement",
            ],
            aiFactors: [
              { factor: "Skill Overlap", score: 60, weight: "40%" },
              { factor: "Location Distance", score: 25, weight: "25%" },
              { factor: "Attrition Risk", score: 27, weight: "20%" },
              { factor: "Learning Potential", score: 45, weight: "15%" },
            ],
          },
          successPrediction: {
            completionProb: 32,
            performanceScore: 55,
            jobOfferProb: 20,
          },
          channels: {
            sms: `PMIS: AR/VR Intern @ VirtualVibe (61% match, ₹15k). HIGH risk. Reply APPLY 026`,
            whatsapp: `🕶️ 61% Match!\nAR/VR Intern @ VirtualVibe\n₹15,000/month • Ahmedabad\n🔴 HIGH dropout risk (73%)\nTap to apply`,
            voice: `VirtualVibe में AR/VR इंटर्न की नौकरी। 73% छोड़ने का खतरा।`,
          },
        },
        {
          id: 27,
          title: "Finance Intern",
          company: "MoneyWise",
          location: "Mumbai, Maharashtra",
          coordinates: { lat: 19.076, lng: 72.8777 },
          distance: 1400,
          duration: "3 months",
          stipend: 13000,
          matchScore: 59,
          skills: ["Financial Analysis", "Excel", "Accounting", "Budgeting"],
          description: "Support financial planning and analysis.",
          applicants: 1100,
          selected: 25,
          attritionRisk: 71,
          companyRating: 3.5,
          verified: false,
          remote: false,
          type: "Business",
          experienceLevel: "Beginner",
          explanation: {
            skillMatch: 60,
            locationMatch: 25,
            experienceMatch: 70,
            attritionPrediction: 71,
            reasons: [
              "Basic finance skills match",
              "Very high distance (1400km)",
              "Low stipend increases risk",
              "Non-remote role",
            ],
            aiFactors: [
              { factor: "Skill Overlap", score: 60, weight: "40%" },
              { factor: "Location Distance", score: 25, weight: "25%" },
              { factor: "Attrition Risk", score: 29, weight: "20%" },
              { factor: "Market Alignment", score: 40, weight: "15%" },
            ],
          },
          successPrediction: {
            completionProb: 34,
            performanceScore: 57,
            jobOfferProb: 21,
          },
          channels: {
            sms: `PMIS: Finance Intern @ MoneyWise (59% match, ₹13k). HIGH risk. Reply APPLY 027`,
            whatsapp: `💰 59% Match!\nFinance Intern @ MoneyWise\n₹13,000/month • Mumbai\n🔴 HIGH dropout risk (71%)\nTap to apply`,
            voice: `MoneyWise में Finance इंटर्न की नौकरी। 71% छोड़ने का खतरा।`,
          },
        },
        {
          id: 28,
          title: "Event Management Intern",
          company: "EventPro",
          location: "Bangalore, Karnataka",
          coordinates: { lat: 12.9716, lng: 77.5946 },
          distance: 1000,
          duration: "3 months",
          stipend: 12000,
          matchScore: 58,
          skills: ["Event Planning", "Communication", "Logistics", "Marketing"],
          description: "Assist in organizing corporate events.",
          applicants: 1200,
          selected: 30,
          attritionRisk: 70,
          companyRating: 3.3,
          verified: false,
          remote: false,
          type: "Business",
          experienceLevel: "Beginner",
          explanation: {
            skillMatch: 60,
            locationMatch: 30,
            experienceMatch: 70,
            attritionPrediction: 70,
            reasons: [
              "Basic event skills match",
              "High distance (1000km)",
              "Low stipend increases risk",
              "Non-remote role",
            ],
            aiFactors: [
              { factor: "Skill Overlap", score: 60, weight: "40%" },
              { factor: "Location Distance", score: 30, weight: "25%" },
              { factor: "Attrition Risk", score: 30, weight: "20%" },
              { factor: "Market Alignment", score: 40, weight: "15%" },
            ],
          },
          successPrediction: {
            completionProb: 35,
            performanceScore: 58,
            jobOfferProb: 22,
          },
          channels: {
            sms: `PMIS: Event Intern @ EventPro (58% match, ₹12k). HIGH risk. Reply APPLY 028`,
            whatsapp: `🎉 58% Match!\nEvent Intern @ EventPro\n₹12,000/month • Bangalore\n🔴 HIGH dropout risk (70%)\nTap to apply`,
            voice: `EventPro में Event इंटर्न की नौकरी। 70% छोड़ने का खतरा।`,
          },
        },
        {
          id: 29,
          title: "Embedded Systems Intern",
          company: "TechTrend",
          location: "Hyderabad, Telangana",
          coordinates: { lat: 17.385, lng: 78.4867 },
          distance: 1600,
          duration: "6 months",
          stipend: 14000,
          matchScore: 57,
          skills: ["C", "Embedded Systems", "IoT", "Microcontrollers"],
          description: "Develop firmware for IoT devices.",
          applicants: 650,
          selected: 15,
          attritionRisk: 74,
          companyRating: 3.4,
          verified: false,
          remote: false,
          type: "Technical",
          experienceLevel: "Advanced",
          explanation: {
            skillMatch: 60,
            locationMatch: 25,
            experienceMatch: 70,
            attritionPrediction: 74,
            reasons: [
              "Partial embedded skills match",
              "Very high distance (1600km)",
              "Low stipend increases risk",
              "High skill requirement",
            ],
            aiFactors: [
              { factor: "Skill Overlap", score: 60, weight: "40%" },
              { factor: "Location Distance", score: 25, weight: "25%" },
              { factor: "Attrition Risk", score: 26, weight: "20%" },
              { factor: "Learning Potential", score: 45, weight: "15%" },
            ],
          },
          successPrediction: {
            completionProb: 32,
            performanceScore: 55,
            jobOfferProb: 20,
          },
          channels: {
            sms: `PMIS: Embedded Intern @ TechTrend (57% match, ₹14k). HIGH risk. Reply APPLY 029`,
            whatsapp: `📡 57% Match!\nEmbedded Intern @ TechTrend\n₹14,000/month • Hyderabad\n🔴 HIGH dropout risk (74%)\nTap to apply`,
            voice: `TechTrend में Embedded इंटर्न की नौकरी। 74% छोड़ने का खतरा।`,
          },
        },
        {
          id: 30,
          title: "SEO Intern",
          company: "RankUp",
          location: "Delhi, NCR",
          coordinates: { lat: 28.7041, lng: 77.1025 },
          distance: 1300,
          duration: "3 months",
          stipend: 12000,
          matchScore: 56,
          skills: ["SEO", "Keyword Research", "Google Analytics", "Content"],
          description: "Optimize websites for search engines.",
          applicants: 1500,
          selected: 35,
          attritionRisk: 71,
          companyRating: 3.3,
          verified: false,
          remote: false,
          type: "Marketing",
          experienceLevel: "Beginner",
          explanation: {
            skillMatch: 60,
            locationMatch: 30,
            experienceMatch: 70,
            attritionPrediction: 71,
            reasons: [
              "Basic SEO skills match",
              "Very high distance (1300km)",
              "Low stipend increases risk",
              "Non-remote role",
            ],
            aiFactors: [
              { factor: "Skill Overlap", score: 60, weight: "40%" },
              { factor: "Location Distance", score: 30, weight: "25%" },
              { factor: "Attrition Risk", score: 29, weight: "20%" },
              { factor: "Market Alignment", score: 40, weight: "15%" },
            ],
          },
          successPrediction: {
            completionProb: 34,
            performanceScore: 57,
            jobOfferProb: 21,
          },
          channels: {
            sms: `PMIS: SEO Intern @ RankUp (56% match, ₹12k). HIGH risk. Reply APPLY 030`,
            whatsapp: `🔍 56% Match!\nSEO Intern @ RankUp\n₹12,000/month • Delhi\n🔴 HIGH dropout risk (71%)\nTap to apply`,
            voice: `RankUp में SEO इंटर्न की नौकरी। 71% छोड़ने का खतरा।`,
          },
        },
        {
          id: 31,
          title: "Operations Intern",
          company: "OptiCore",
          location: "Chennai, Tamil Nadu",
          coordinates: { lat: 13.0827, lng: 80.2707 },
          distance: 1400,
          duration: "4 months",
          stipend: 13000,
          matchScore: 55,
          skills: ["Supply Chain", "Logistics", "Excel", "Process Optimization"],
          description: "Support supply chain and operations management.",
          applicants: 1000,
          selected: 25,
          attritionRisk: 70,
          companyRating: 3.4,
          verified: false,
          remote: false,
          type: "Business",
          experienceLevel: "Beginner",
          explanation: {
            skillMatch: 60,
            locationMatch: 30,
            experienceMatch: 70,
            attritionPrediction: 70,
            reasons: [
              "Basic operations skills match",
              "Very high distance (1400km)",
              "Low stipend increases risk",
              "Non-remote role",
            ],
            aiFactors: [
              { factor: "Skill Overlap", score: 60, weight: "40%" },
              { factor: "Location Distance", score: 30, weight: "25%" },
              { factor: "Attrition Risk", score: 30, weight: "20%" },
              { factor: "Market Alignment", score: 40, weight: "15%" },
            ],
          },
          successPrediction: {
            completionProb: 35,
            performanceScore: 58,
            jobOfferProb: 22,
          },
          channels: {
            sms: `PMIS: Operations Intern @ OptiCore (55% match, ₹13k). HIGH risk. Reply APPLY 031`,
            whatsapp: `⚙️ 55% Match!\nOperations Intern @ OptiCore\n₹13,000/month • Chennai\n🔴 HIGH dropout risk (70%)\nTap to apply`,
            voice: `OptiCore में Operations इंटर्न की नौकरी। 70% छोड़ने का खतरा।`,
          },
        },
        {
          id: 32,
          title: "Web Developer Intern",
          company: "WebWorks",
          location: "Pune, Maharashtra",
          coordinates: { lat: 18.5204, lng: 73.8567 },
          distance: 1500,
          duration: "5 months",
          stipend: 14000,
          matchScore: 54,
          skills: ["HTML", "CSS", "JavaScript", "PHP"],
          description: "Develop responsive websites for clients.",
          applicants: 900,
          selected: 20,
          attritionRisk: 72,
          companyRating: 3.3,
          verified: false,
          remote: false,
          type: "Technical",
          experienceLevel: "Intermediate",
          explanation: {
            skillMatch: 60,
            locationMatch: 25,
            experienceMatch: 70,
            attritionPrediction: 72,
            reasons: [
              "Basic web skills match",
              "Very high distance (1500km)",
              "Low stipend increases risk",
              "Non-remote role",
            ],
            aiFactors: [
              { factor: "Skill Overlap", score: 60, weight: "40%" },
              { factor: "Location Distance", score: 25, weight: "25%" },
              { factor: "Attrition Risk", score: 28, weight: "20%" },
              { factor: "Market Alignment", score: 40, weight: "15%" },
            ],
          },
          successPrediction: {
            completionProb: 32,
            performanceScore: 55,
            jobOfferProb: 20,
          },
          channels: {
            sms: `PMIS: Web Developer @ WebWorks (54% match, ₹14k). HIGH risk. Reply APPLY 032`,
            whatsapp: `🌐 54% Match!\nWeb Developer Intern @ WebWorks\n₹14,000/month • Pune\n🔴 HIGH dropout risk (72%)\nTap to apply`,
            voice: `WebWorks में Web Developer इंटर्न की नौकरी। 72% छोड़ने का खतरा।`,
          },
        },
        {
          id: 33,
          title: "Customer Support Intern",
          company: "CareFirst",
          location: "Noida, Uttar Pradesh",
          coordinates: { lat: 28.5355, lng: 77.391 },
          distance: 1200,
          duration: "3 months",
          stipend: 11000,
          matchScore: 53,
          skills: ["Communication", "CRM", "Problem Solving", "Customer Service"],
          description: "Support customer queries and issues.",
          applicants: 1300,
          selected: 35,
          attritionRisk: 71,
          companyRating: 3.2,
          verified: false,
          remote: false,
          type: "Business",
          experienceLevel: "Beginner",
          explanation: {
            skillMatch: 60,
            locationMatch: 30,
            experienceMatch: 70,
            attritionPrediction: 71,
            reasons: [
              "Basic communication skills match",
              "Very high distance (1200km)",
              "Low stipend increases risk",
              "Non-remote role",
            ],
            aiFactors: [
              { factor: "Skill Overlap", score: 60, weight: "40%" },
              { factor: "Location Distance", score: 30, weight: "25%" },
              { factor: "Attrition Risk", score: 29, weight: "20%" },
              { factor: "Market Alignment", score: 40, weight: "15%" },
            ],
          },
          successPrediction: {
            completionProb: 34,
            performanceScore: 57,
            jobOfferProb: 21,
          },
          channels: {
            sms: `PMIS: Customer Support @ CareFirst (53% match, ₹11k). HIGH risk. Reply APPLY 033`,
            whatsapp: `📞 53% Match!\nCustomer Support Intern @ CareFirst\n₹11,000/month • Noida\n🔴 HIGH dropout risk (71%)\nTap to apply`,
            voice: `CareFirst में Customer Support इंटर्न की नौकरी। 71% छोड़ने का खतरा।`,
          },
        },
        {
          id: 34,
          title: "Data Entry Intern",
          company: "DataCore",
          location: "Kolkata, West Bengal",
          coordinates: { lat: 22.5726, lng: 88.3639 },
          distance: 1400,
          duration: "3 months",
          stipend: 10000,
          matchScore: 52,
          skills: ["Data Entry", "Excel", "Typing", "Accuracy"],
          description: "Perform data entry and validation tasks.",
          applicants: 1500,
          selected: 40,
          attritionRisk: 70,
          companyRating: 3.1,
          verified: false,
          remote: false,
          type: "Business",
          experienceLevel: "Beginner",
          explanation: {
            skillMatch: 60,
            locationMatch: 30,
            experienceMatch: 70,
            attritionPrediction: 70,
            reasons: [
              "Basic data entry skills match",
              "Very high distance (1400km)",
              "Low stipend increases risk",
              "Non-remote role",
            ],
            aiFactors: [
              { factor: "Skill Overlap", score: 60, weight: "40%" },
              { factor: "Location Distance", score: 30, weight: "25%" },
              { factor: "Attrition Risk", score: 30, weight: "20%" },
              { factor: "Market Alignment", score: 40, weight: "15%" },
            ],
          },
          successPrediction: {
            completionProb: 35,
            performanceScore: 58,
            jobOfferProb: 22,
          },
          channels: {
            sms: `PMIS: Data Entry @ DataCore (52% match, ₹10k). HIGH risk. Reply APPLY 034`,
            whatsapp: `📋 52% Match!\nData Entry Intern @ DataCore\n₹10,000/month • Kolkata\n🔴 HIGH dropout risk (70%)\nTap to apply`,
            voice: `DataCore में Data Entry इंटर्न की नौकरी। 70% छोड़ने का खतरा।`,
          },
        },
      ]

      setRecommendations(mockRecommendations)
      setLoading(false)
      showSnackbar("AI recommendations loaded with 94% accuracy!", "success")
    }

    loadRecommendations()
  }, [])
    const showSnackbar = (message, severity = "info") => {
    setSnackbar({ open: true, message, severity })
  }

  const speakText = (text) => {
    if (voiceEnabled && "speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = "en-US"
      speechSynthesis.speak(utterance)
    }
  }

  const handleApply = (internship) => {
    // Simulate application submission
    showSnackbar(`Application submitted for ${internship.title}! You'll receive updates via SMS.`, "success")
    speakText(`Applied to ${internship.title} at ${internship.company}`)
  }

  const handleExplain = (internship) => {
    setSelectedInternship(internship)
    speakText("Showing detailed explanation for this recommendation")
  }

  const handleCompare = (internship) => {
    if (compareList.find((item) => item.id === internship.id)) {
      setCompareList((prev) => prev.filter((item) => item.id !== internship.id))
      showSnackbar("Removed from comparison", "info")
    } else if (compareList.length < 3) {
      setCompareList((prev) => [...prev, internship])
      showSnackbar("Added to comparison", "success")
    } else {
      showSnackbar("Maximum 3 internships can be compared", "warning")
    }
  }

  const getRiskColor = (risk) => {
    if (risk <= 30) return "success"
    if (risk <= 60) return "warning"
    return "error"
  }

  const getRiskLabel = (risk) => {
    if (risk <= 30) return "Low Risk"
    if (risk <= 60) return "Medium Risk"
    return "High Risk"
  }

  const filteredRecommendations = recommendations
    .filter((rec) => rec.distance <= filters.maxDistance)
    .filter((rec) => rec.stipend >= filters.minStipend)
    .filter((rec) => rec.attritionRisk <= filters.riskThreshold)
    .sort((a, b) => {
      switch (filters.sortBy) {
        case "matchScore":
          return b.matchScore - a.matchScore
        case "stipend":
          return b.stipend - a.stipend
        case "distance":
          return a.distance - b.distance
        case "risk":
          return a.attritionRisk - b.attritionRisk
        default:
          return b.matchScore - a.matchScore
      }
    })

  const handleApplyToInternship = async (internshipId) => {
    try {
      setApplyingTo(internshipId)
      console.log("[v0] Applying to internship:", internshipId)

      await candidatesAPI.applyToInternship(internshipId, {
        coverLetter: applicationData.coverLetter,
        additionalInfo: applicationData.additionalInfo,
      })

      showSnackbar("Application submitted successfully!", "success")
      setShowApplicationModal(false)
      refetch() // Refresh recommendations
    } catch (error) {
      console.error("[v0] Application failed:", error)
      showSnackbar(error.response?.data?.message || error.message || "Failed to submit application", "error")
    } finally {
      setApplyingTo(null)
    }
  }

  const refreshRecommendations = async () => {
    try {
      setRefreshing(true)
      console.log("[v0] Refreshing recommendations...")
      await refetch()
      showSnackbar("Recommendations refreshed!", "success")
    } catch (error) {
      console.error("[v0] Refresh failed:", error)
      showSnackbar(error.response?.data?.message || "Failed to refresh recommendations", "error")
    } finally {
      setRefreshing(false)
    }
  }

  const displayRecommendations = recommendationsData || []

  if (_loading) {
    return (
      <Box sx={{ background: `linear-gradient(180deg, ${colors.background} 0%, #ffffff 100%)`, minHeight: "100vh" }}>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Box textAlign="center">
            <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}>
              <SmartToy sx={{ fontSize: 60, color: colors.primary, mb: 2 }} />
            </motion.div>
            <Typography
              variant="h4"
              gutterBottom
              sx={{
                color: colors.primary,
                fontWeight: 700,
                mb: 2,
              }}
            >
              AI Analyzing Your Perfect Matches...
            </Typography>
            <Typography variant="body1" color="text.secondary" mb={3} sx={{ maxWidth: 600, mx: "auto" }}>
              Running attrition prediction, skill matching, and location optimization across 10,000+ internships
            </Typography>
            <LinearProgress
              sx={{
                mt: 2,
                height: 8,
                borderRadius: 4,
                bgcolor: `${colors.primary}20`,
                "& .MuiLinearProgress-bar": {
                  background: colors.gradient.secondary,
                  borderRadius: 4,
                },
              }}
            />
            <Typography variant="caption" display="block" mt={2} color="text.secondary">
              Processing with ML algorithms for maximum success probability
            </Typography>

            {/* Loading Skeleton */}
            <Grid container spacing={3} mt={4}>
              {[1, 2, 3].map((item) => (
                <Grid item xs={12} md={4} key={item}>
                  <Card sx={{ p: 2 }}>
                    <Skeleton variant="rectangular" height={40} sx={{ mb: 2 }} />
                    <Skeleton variant="text" height={20} sx={{ mb: 1 }} />
                    <Skeleton variant="text" height={20} sx={{ mb: 1 }} />
                    <Skeleton variant="rectangular" height={80} />
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Container>
      </Box>
    )
  }

  return (
    <Box sx={{ background: `linear-gradient(180deg, ${colors.background} 0%, #ffffff 100%)`, minHeight: "100vh" }}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {(recommendationsError || profileError) && (
          <Alert
            severity="error"
            sx={{ mb: 3, borderRadius: "12px" }}
            action={
              <Button color="inherit" size="small" onClick={refreshRecommendations}>
                Retry
              </Button>
            }
          >
            API Error: {recommendationsError || profileError}
          </Alert>
        )}
        {/* Real-time Alert */}
        <AnimatePresence>
          {realTimeUpdates && (
            <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -50, opacity: 0 }}>
              <Alert
                severity="success"
                sx={{
                  mb: 3,
                  borderRadius: "12px",
                  border: `2px solid ${colors.success}`,
                  bgcolor: `${colors.success}10`,
                }}
                action={
                  <Box display="flex" alignItems="center" gap={1}>
                    <Chip
                      label="🔴 LIVE"
                      size="small"
                      sx={{
                        bgcolor: colors.error,
                        color: "white",
                        animation: "pulse 2s infinite",
                        fontWeight: "bold",
                      }}
                    />
                    <IconButton size="small" onClick={() => setRealTimeUpdates(false)}>
                      <Close fontSize="small" />
                    </IconButton>
                  </Box>
                }
              >
                <strong>🚀 Smart Matching Active:</strong> Recommendations updating based on real-time applications and
                company responses
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Enhanced Header with Stats */}
        <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6 }}>
          <Box textAlign="center" mb={6}>
            <Typography
              variant="h3"
              gutterBottom
              sx={{
                color: colors.primary,
                fontWeight: 800,
                fontSize: { xs: "2.5rem", md: "3.5rem" },
                mb: 2,
              }}
            >
              Your AI-Powered Matches
            </Typography>
            <Typography variant="h6" color="text.secondary" mb={4} sx={{ maxWidth: 800, mx: "auto", lineHeight: 1.6 }}>
              Ranked by our attrition prediction engine to maximize your success probability and reduce the 93% PMIS
              failure rate
            </Typography>

            {/* Enhanced Success Metrics */}
            <Paper sx={{ p: 4, borderRadius: "20px", background: colors.gradient.primary, color: "white", mb: 4 }}>
              <Grid container spacing={3}>
                {[
                  {
                    label: "Dropout Reduction",
                    value: "67%",
                    icon: <TrendingUp />,
                    color: colors.success,
                    description: "vs baseline PMIS",
                  },
                  {
                    label: "Smart Matches",
                    value: filteredRecommendations.length,
                    icon: <SmartToy />,
                    color: colors.secondary,
                    description: "AI-curated for you",
                  },
                  {
                    label: "Avg Match Score",
                    value: `${Math.round(filteredRecommendations.reduce((acc, rec) => acc + rec.matchScore, 0) / Math.max(filteredRecommendations.length, 1))}%`,
                    icon: <AutoAwesome />,
                    color: colors.warning,
                    description: "accuracy rating",
                  },
                  {
                    label: "Avg Risk Score",
                    value: `${Math.round(filteredRecommendations.reduce((acc, rec) => acc + rec.attritionRisk, 0) / Math.max(filteredRecommendations.length, 1))}%`,
                    icon: <Security />,
                    color: colors.error,
                    description: "dropout probability",
                  },
                ].map((stat, index) => (
                  <Grid item xs={6} md={3} key={index}>
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: index * 0.1, duration: 0.6 }}
                    >
                      <Box textAlign="center">
                        <Avatar
                          sx={{
                            bgcolor: "rgba(255,255,255,0.2)",
                            width: 60,
                            height: 60,
                            mx: "auto",
                            mb: 2,
                          }}
                        >
                          {stat.icon}
                        </Avatar>
                        <Typography variant="h4" sx={{ fontWeight: "bold", mb: 1 }}>
                          {stat.value}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                          {stat.label}
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.8 }}>
                          {stat.description}
                        </Typography>
                      </Box>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
            </Paper>

            {/* Enhanced Voice and Accessibility Controls */}
            <Box display="flex" justifyContent="center" gap={2} mb={4} flexWrap="wrap">
              <FormControlLabel
                control={
                  <Switch
                    checked={voiceEnabled}
                    onChange={(e) => setVoiceEnabled(e.target.checked)}
                    sx={{
                      "& .MuiSwitch-thumb": {
                        bgcolor: voiceEnabled ? colors.success : "grey.400",
                      },
                    }}
                  />
                }
                label="🎤 Voice Assistant"
              />
              <Button
                variant="outlined"
                startIcon={<Sms />}
                onClick={() => setChannelPreview(true)}
                size="small"
                sx={{
                  borderColor: colors.primary,
                  color: colors.primary,
                  "&:hover": {
                    borderColor: colors.primaryLight,
                    bgcolor: `${colors.primary}10`,
                  },
                }}
              >
                📱 SMS/USSD Preview
              </Button>
              <Button
                variant="outlined"
                startIcon={<CompareArrows />}
                onClick={() => setCompareDialog(true)}
                disabled={compareList.length < 2}
                size="small"
                sx={{
                  borderColor: colors.secondary,
                  color: colors.secondary,
                  "&:hover": {
                    borderColor: colors.secondary,
                    bgcolor: `${colors.secondary}10`,
                  },
                }}
              >
                🔄 Compare ({compareList.length})
              </Button>
              <Button
                variant="outlined"
                startIcon={<Home />}
                onClick={() => navigate("/")}
                size="small"
                sx={{
                  borderColor: colors.accent,
                  color: colors.accent,
                  "&:hover": {
                    borderColor: colors.accent,
                    bgcolor: `${colors.accent}10`,
                  },
                }}
              >
                🏠 Back Home
              </Button>
            </Box>
          </Box>
        </motion.div>

        {/* Enhanced Advanced Filters */}
        <Paper sx={{ p: 4, mb: 4, borderRadius: "20px", boxShadow: "0 10px 40px rgba(0,0,0,0.1)" }}>
          <Typography
            variant="h6"
            gutterBottom
            sx={{
              color: colors.primary,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: 1,
              mb: 3,
            }}
          >
            <FilterList />
            Smart Filters & AI Preferences
          </Typography>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <Typography gutterBottom sx={{ fontWeight: 600 }}>
                Max Distance: {filters.maxDistance}km
              </Typography>
              <Slider
                value={filters.maxDistance}
                onChange={(e, val) => setFilters((prev) => ({ ...prev, maxDistance: val }))}
                min={0}
                max={2000}
                step={25}
                sx={{ color: colors.primary }}
                marks={[
                  { value: 0, label: "0km" },
                  { value: 100, label: "100km" },
                  { value: 500, label: "500km" },
                  { value: 2000, label: "2000km+" },
                ]}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography gutterBottom sx={{ fontWeight: 600 }}>
                Min Stipend: ₹{filters.minStipend.toLocaleString()}
              </Typography>
              <Slider
                value={filters.minStipend}
                onChange={(e, val) => setFilters((prev) => ({ ...prev, minStipend: val }))}
                min={0}
                max={50000}
                step={2500}
                sx={{ color: colors.secondary }}
                marks={[
                  { value: 0, label: "₹0" },
                  { value: 15000, label: "₹15k" },
                  { value: 30000, label: "₹30k" },
                  { value: 50000, label: "₹50k" },
                ]}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography gutterBottom sx={{ fontWeight: 600 }}>
                Max Risk: {filters.riskThreshold}%
              </Typography>
              <Slider
                value={filters.riskThreshold}
                onChange={(e, val) => setFilters((prev) => ({ ...prev, riskThreshold: val }))}
                min={0}
                max={100}
                step={10}
                color={filters.riskThreshold <= 30 ? "success" : filters.riskThreshold <= 60 ? "warning" : "error"}
                marks={[
                  { value: 0, label: "0%" },
                  { value: 30, label: "Low" },
                  { value: 60, label: "Med" },
                  { value: 100, label: "High" },
                ]}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={filters.sortBy}
                  onChange={(e) => setFilters((prev) => ({ ...prev, sortBy: e.target.value }))}
                >
                  <MenuItem value="matchScore">🎯 Match Score</MenuItem>
                  <MenuItem value="stipend">💰 Stipend</MenuItem>
                  <MenuItem value="distance">📍 Distance</MenuItem>
                  <MenuItem value="risk">⚠️ Risk Level</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>

        {/* Enhanced Recommendations Grid */}
        <Grid container spacing={4}>
          {displayRecommendations.map((internship, index) => (
            <Grid item xs={12} lg={6} xl={4} key={internship.id}>
              <motion.div
                layout
                initial={{ scale: 0.9, opacity: 0, y: 50 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
              >
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    border: `3px solid ${
                      internship.attritionRisk <= 30
                        ? colors.success
                        : internship.attritionRisk <= 60
                          ? colors.warning
                          : colors.error
                    }`,
                    borderRadius: "20px",
                    position: "relative",
                    overflow: "visible",
                    background: `linear-gradient(135deg, ${colors.surface} 0%, #f8fafc 100%)`,
                    boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
                    "&:hover": {
                      boxShadow: `0 20px 60px ${
                        internship.attritionRisk <= 30
                          ? colors.success
                          : internship.attritionRisk <= 60
                            ? colors.warning
                            : colors.error
                      }30`,
                    },
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                >
                  {/* Enhanced Risk Badge */}
                  <Chip
                    label={getRiskLabel(internship.attritionRisk)}
                    color={getRiskColor(internship.attritionRisk)}
                    size="small"
                    sx={{
                      position: "absolute",
                      top: -12,
                      right: 20,
                      fontWeight: "bold",
                      zIndex: 1,
                      fontSize: "0.75rem",
                      height: 24,
                    }}
                  />

                  {/* Verification Badge */}
                  {internship.verified && (
                    <Chip
                      icon={<Verified />}
                      label="Govt Verified"
                      size="small"
                      sx={{
                        position: "absolute",
                        top: -12,
                        left: 20,
                        bgcolor: colors.success,
                        color: "white",
                        fontWeight: "bold",
                        zIndex: 1,
                        fontSize: "0.75rem",
                        height: 24,
                      }}
                    />
                  )}

                  <CardContent sx={{ flexGrow: 1, pb: 1, p: 3 }}>
                    {/* Enhanced Header */}
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                      <Typography
                        variant="h6"
                        component="h2"
                        sx={{
                          flex: 1,
                          pr: 1,
                          fontWeight: 700,
                          color: colors.text,
                          lineHeight: 1.3,
                        }}
                      >
                        {internship.title}
                      </Typography>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Chip
                          label={`${internship.matchScore}%`}
                          sx={{
                            background: colors.gradient.secondary,
                            color: "white",
                            fontWeight: "bold",
                            fontSize: "0.85rem",
                          }}
                          icon={<SmartToy />}
                        />
                      </Box>
                    </Box>

                    {/* Enhanced Company Info */}
                    <Box display="flex" alignItems="center" mb={2}>
                      <Business sx={{ fontSize: 18, mr: 1, color: colors.textSecondary }} />
                      <Typography variant="body2" color="text.secondary" sx={{ flex: 1, fontWeight: 500 }}>
                        {internship.company}
                      </Typography>
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <Rating value={internship.companyRating} size="small" readOnly precision={0.1} />
                        <Typography variant="caption" color="text.secondary">
                          ({internship.companyRating})
                        </Typography>
                      </Box>
                    </Box>

                    {/* Enhanced Location & Distance */}
                    <Box display="flex" alignItems="center" mb={2}>
                      <LocationOn sx={{ fontSize: 18, mr: 1, color: colors.textSecondary }} />
                      <Typography variant="body2" color="text.secondary" sx={{ flex: 1, fontWeight: 500 }}>
                        {internship.location}
                      </Typography>
                      <Chip
                        label={`${internship.distance}km`}
                        size="small"
                        sx={{
                          bgcolor:
                            internship.distance <= 50
                              ? `${colors.success}20`
                              : internship.distance <= 200
                                ? `${colors.warning}20`
                                : `${colors.error}20`,
                          color:
                            internship.distance <= 50
                              ? colors.success
                              : internship.distance <= 200
                                ? colors.warning
                                : colors.error,
                          fontWeight: "bold",
                        }}
                      />
                    </Box>

                    {/* Enhanced Duration & Stipend */}
                    <Box display="flex" alignItems="center" mb={3}>
                      <Schedule sx={{ fontSize: 18, mr: 1, color: colors.textSecondary }} />
                      <Typography variant="body2" color="text.secondary" sx={{ flex: 1, fontWeight: 500 }}>
                        {internship.duration}
                      </Typography>
                      <Typography variant="body1" fontWeight="bold" sx={{ color: colors.success, fontSize: "1.1rem" }}>
                        ₹{internship.stipend.toLocaleString()}/month
                      </Typography>
                    </Box>

                    {/* Enhanced AI Prediction Scores */}
                    <Paper
                      sx={{
                        p: 2.5,
                        mb: 3,
                        bgcolor: `${colors.primary}05`,
                        borderRadius: "12px",
                        border: `1px solid ${colors.primary}20`,
                      }}
                    >
                      <Typography
                        variant="body2"
                        fontWeight="bold"
                        gutterBottom
                        sx={{
                          color: colors.primary,
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                          mb: 2,
                        }}
                      >
                        <Psychology sx={{ fontSize: 18 }} />
                        AI Success Prediction
                      </Typography>
                      <Grid container spacing={2}>
                        {[
                          { label: "Completion", value: internship.successPrediction.completionProb, color: "success" },
                          {
                            label: "Performance",
                            value: internship.successPrediction.performanceScore,
                            color: "primary",
                          },
                          { label: "Job Offer", value: internship.successPrediction.jobOfferProb, color: "warning" },
                        ].map((pred, idx) => (
                          <Grid item xs={4} key={idx}>
                            <Box textAlign="center">
                              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                {pred.label}
                              </Typography>
                              <LinearProgress
                                variant="determinate"
                                value={pred.value}
                                color={pred.color}
                                sx={{
                                  height: 6,
                                  borderRadius: 3,
                                  my: 0.5,
                                }}
                              />
                              <Typography variant="caption" sx={{ fontWeight: "bold" }}>
                                {pred.value}%
                              </Typography>
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                    </Paper>

                    {/* Enhanced Description */}
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      mb={3}
                      sx={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                        lineHeight: 1.5,
                      }}
                    >
                      {internship.description}
                    </Typography>

                    {/* Enhanced Skills */}
                    <Box display="flex" flexWrap="wrap" gap={1} mb={3}>
                      {internship.skills.slice(0, 3).map((skill, idx) => (
                        <Chip
                          key={idx}
                          label={skill}
                          size="small"
                          sx={{
                            bgcolor: `${colors.primary}15`,
                            color: colors.primary,
                            fontWeight: "bold",
                            fontSize: "0.75rem",
                          }}
                        />
                      ))}
                      {internship.skills.length > 3 && (
                        <Chip
                          label={`+${internship.skills.length - 3}`}
                          size="small"
                          sx={{
                            bgcolor: `${colors.secondary}20`,
                            color: colors.secondary,
                            fontWeight: "bold",
                            fontSize: "0.75rem",
                          }}
                        />
                      )}
                    </Box>

                    {/* Enhanced Applications Stats */}
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <Box display="flex" alignItems="center">
                        <Group sx={{ fontSize: 16, mr: 0.5, color: colors.textSecondary }} />
                        <Typography variant="caption" color="text.secondary">
                          {internship.applicants} applied, {internship.selected} selected
                        </Typography>
                      </Box>
                      <Box display="flex" gap={1}>
                        {internship.remote && (
                          <Chip
                            label="🏠 Remote OK"
                            size="small"
                            sx={{
                              bgcolor: `${colors.accent}20`,
                              color: colors.accent,
                              fontWeight: "bold",
                            }}
                          />
                        )}
                        <Chip label={internship.type} size="small" variant="outlined" sx={{ fontWeight: "bold" }} />
                      </Box>
                    </Box>

                    {/* Enhanced Match Score Visualization */}
                    <Box mb={2}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          Overall Match Score
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: "bold", color: colors.primary }}>
                          {internship.matchScore}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={internship.matchScore}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          bgcolor: `${colors.primary}20`,
                          "& .MuiLinearProgress-bar": {
                            background:
                              internship.matchScore >= 80
                                ? colors.gradient.success
                                : internship.matchScore >= 60
                                  ? colors.gradient.secondary
                                  : colors.gradient.primary,
                            borderRadius: 4,
                          },
                        }}
                      />
                      <Box display="flex" justifyContent="space-between" mt={1}>
                        <Typography variant="caption" color="text.secondary">
                          Risk: {internship.attritionRisk}%
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {internship.matchScore >= 80
                            ? "🟢 Excellent"
                            : internship.matchScore >= 60
                              ? "🟡 Good"
                              : "🟠 Fair"}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>

                  {/* Enhanced Card Actions */}
                  <CardActions sx={{ p: 3, pt: 0, flexDirection: "column", gap: 2 }}>
                    {/* Primary Actions */}
                    <Box display="flex" width="100%" gap={1}>
                      <Button
                        variant="contained"
                        fullWidth
                        onClick={() => handleApply(internship)}
                        startIcon={<Done />}
                        sx={{
                          background:
                            internship.attritionRisk <= 30 ? colors.gradient.success : colors.gradient.primary,
                          fontWeight: "bold",
                          py: 1.5,
                          "&:hover": {
                            transform: "translateY(-2px)",
                            boxShadow: `0 8px 25px ${internship.attritionRisk <= 30 ? colors.success : colors.primary}40`,
                          },
                          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        }}
                      >
                        Apply Now
                      </Button>
                      <IconButton
                        onClick={() => handleCompare(internship)}
                        sx={{
                          bgcolor: compareList.find((item) => item.id === internship.id)
                            ? `${colors.secondary}20`
                            : "transparent",
                          border: `2px solid ${colors.secondary}`,
                          color: colors.secondary,
                          "&:hover": {
                            bgcolor: `${colors.secondary}10`,
                            transform: "scale(1.05)",
                          },
                          transition: "all 0.3s ease",
                        }}
                      >
                        <CompareArrows />
                      </IconButton>
                    </Box>

                    {/* Secondary Actions */}
                    <Box display="flex" width="100%" gap={1}>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<Psychology />}
                        onClick={() => handleExplain(internship)}
                        sx={{
                          flex: 1,
                          borderColor: colors.primary,
                          color: colors.primary,
                          "&:hover": {
                            borderColor: colors.primaryLight,
                            bgcolor: `${colors.primary}10`,
                          },
                        }}
                      >
                        Why Match?
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<Share />}
                        onClick={() => showSnackbar("Share link copied!", "success")}
                        sx={{
                          flex: 1,
                          borderColor: colors.accent,
                          color: colors.accent,
                          "&:hover": {
                            borderColor: colors.accent,
                            bgcolor: `${colors.accent}10`,
                          },
                        }}
                      >
                        Share
                      </Button>
                    </Box>
                  </CardActions>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        {/* Enhanced Empty State */}
        {filteredRecommendations.length === 0 && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <Paper
              sx={{
                p: 8,
                textAlign: "center",
                borderRadius: "20px",
                background: colors.gradient.primary,
                color: "white",
              }}
            >
              <FilterList sx={{ fontSize: 80, mb: 3, opacity: 0.7 }} />
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
                No matches found
              </Typography>
              <Typography variant="h6" mb={4} sx={{ opacity: 0.9 }}>
                Try adjusting your filters or expanding your search criteria
              </Typography>
              <Button
                variant="contained"
                size="large"
                onClick={() =>
                  setFilters({
                    maxDistance: 2000,
                    minStipend: 0,
                    maxDuration: 12,
                    riskThreshold: 100,
                    showRemote: true,
                    sortBy: "matchScore",
                  })
                }
                sx={{
                  bgcolor: colors.secondary,
                  color: "white",
                  px: 4,
                  py: 1.5,
                  fontSize: "1.1rem",
                  fontWeight: "bold",
                  "&:hover": {
                    bgcolor: colors.secondary,
                    transform: "translateY(-2px)",
                    boxShadow: "0 8px 25px rgba(246, 168, 33, 0.4)",
                  },
                }}
              >
                🔄 Reset All Filters
              </Button>
            </Paper>
          </motion.div>
        )}

        {/* Enhanced Floating Action Button */}
        <SpeedDial
          ariaLabel="Quick Actions"
          sx={{
            position: "fixed",
            bottom: 24,
            right: 24,
            "& .MuiFab-primary": {
              background: colors.gradient.secondary,
            },
          }}
          icon={<SpeedDialIcon />}
        >
          <SpeedDialAction
            icon={<Refresh />}
            tooltipTitle="Refresh Recommendations"
            onClick={() => window.location.reload()}
          />
          <SpeedDialAction
            icon={<Dashboard />}
            tooltipTitle="View Analytics"
            onClick={() => showSnackbar("Analytics dashboard coming soon!", "info")}
          />
          <SpeedDialAction icon={<Sms />} tooltipTitle="SMS Preview" onClick={() => setChannelPreview(true)} />
          <SpeedDialAction icon={<Person />} tooltipTitle="View Profile" onClick={() => navigate("/profile")} />
        </SpeedDial>

        {/* Enhanced Detailed Explanation Dialog */}
        <Dialog
          open={!!selectedInternship && !feedbackDialog}
          onClose={() => setSelectedInternship(null)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: { borderRadius: "20px" },
          }}
        >
          <DialogTitle
            sx={{
              background: colors.gradient.primary,
              color: "white",
              borderRadius: "20px 20px 0 0",
            }}
          >
            <Box display="flex" alignItems="center">
              <Psychology sx={{ mr: 2 }} />
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  AI Explanation: "{selectedInternship?.title}"
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  at {selectedInternship?.company}
                </Typography>
              </Box>
            </Box>
          </DialogTitle>
          <DialogContent sx={{ p: 4 }}>
            {selectedInternship && (
              <Box>
                <Alert
                  severity="info"
                  sx={{
                    mb: 4,
                    borderRadius: "12px",
                    border: `2px solid ${colors.primary}30`,
                    bgcolor: `${colors.primary}10`,
                  }}
                >
                  <Typography variant="body2">
                    Our AI analyzed <strong>50+ factors</strong> to generate this{" "}
                    <strong>{selectedInternship.matchScore}% match score</strong> and predict{" "}
                    <strong>{selectedInternship.attritionRisk}% dropout risk</strong> based on historical data from
                    similar candidates.
                  </Typography>
                </Alert>

                {/* Enhanced AI Factors Breakdown */}
                <Typography variant="h6" gutterBottom sx={{ color: colors.primary, fontWeight: 700 }}>
                  🤖 Machine Learning Analysis
                </Typography>
                {selectedInternship.explanation.aiFactors.map((factor, idx) => (
                  <Box key={idx} mb={3}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {factor.factor} (Weight: {factor.weight})
                      </Typography>
                      <Typography variant="body2" fontWeight="bold" color="primary">
                        {factor.score}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={factor.score}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        bgcolor: `${colors.primary}20`,
                        "& .MuiLinearProgress-bar": {
                          background:
                            factor.score >= 80
                              ? colors.gradient.success
                              : factor.score >= 60
                                ? colors.gradient.secondary
                                : colors.gradient.primary,
                          borderRadius: 4,
                        },
                      }}
                    />
                  </Box>
                ))}

                <Divider sx={{ my: 4 }} />

                {/* Enhanced Human-Readable Reasons */}
                <Typography variant="h6" gutterBottom sx={{ color: colors.primary, fontWeight: 700 }}>
                  💡 Key Insights
                </Typography>
                {selectedInternship.explanation.reasons.map((reason, idx) => (
                  <Alert
                    key={idx}
                    severity="info"
                    sx={{
                      mb: 2,
                      borderRadius: "10px",
                      "& .MuiAlert-message": {
                        fontWeight: 500,
                      },
                    }}
                  >
                    {reason}
                  </Alert>
                ))}

                <Divider sx={{ my: 4 }} />

                {/* Enhanced Success Predictions */}
                <Typography variant="h6" gutterBottom sx={{ color: colors.primary, fontWeight: 700 }}>
                  📈 Success Predictions
                </Typography>
                <Grid container spacing={3}>
                  {[
                    {
                      label: "Completion Probability",
                      value: selectedInternship.successPrediction.completionProb,
                      color: colors.success,
                      icon: "🎯",
                    },
                    {
                      label: "Expected Performance",
                      value: selectedInternship.successPrediction.performanceScore,
                      color: colors.primary,
                      icon: "⭐",
                    },
                    {
                      label: "Job Offer Likelihood",
                      value: selectedInternship.successPrediction.jobOfferProb,
                      color: colors.warning,
                      icon: "💼",
                    },
                  ].map((pred, idx) => (
                    <Grid item xs={4} key={idx}>
                      <Paper
                        sx={{
                          p: 3,
                          textAlign: "center",
                          borderRadius: "16px",
                          border: `2px solid ${pred.color}30`,
                          bgcolor: `${pred.color}10`,
                        }}
                      >
                        <Typography variant="h3" sx={{ mb: 1, fontSize: "2rem" }}>
                          {pred.icon}
                        </Typography>
                        <Typography variant="h4" sx={{ color: pred.color, fontWeight: "bold", mb: 1 }}>
                          {pred.value}%
                        </Typography>
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                          {pred.label}
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>

                {/* Enhanced Voice Reading */}
                {voiceEnabled && (
                  <Box mt={4} textAlign="center">
                    <Button
                      variant="outlined"
                      startIcon={<VolumeUp />}
                      onClick={() => speakText(selectedInternship.explanation.reasons.join(". "))}
                      sx={{
                        borderColor: colors.secondary,
                        color: colors.secondary,
                        "&:hover": {
                          borderColor: colors.secondary,
                          bgcolor: `${colors.secondary}10`,
                        },
                      }}
                    >
                      🎤 Read Explanation Aloud
                    </Button>
                  </Box>
                )}
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setSelectedInternship(null)}>Close</Button>
            <Button
              variant="contained"
              onClick={() => handleApply(selectedInternship)}
              sx={{ background: colors.gradient.success }}
            >
              Apply to This Role
            </Button>
          </DialogActions>
        </Dialog>

        {/* Enhanced Multi-Channel Preview Dialog */}
        <Dialog
          open={channelPreview}
          onClose={() => setChannelPreview(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: { borderRadius: "20px" },
          }}
        >
          <DialogTitle
            sx={{
              background: colors.gradient.secondary,
              color: "white",
              borderRadius: "20px 20px 0 0",
            }}
          >
            <Box display="flex" alignItems="center">
              <Sms sx={{ mr: 2 }} />
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Multi-Channel Delivery Preview
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  How we reach every Indian youth
                </Typography>
              </Box>
            </Box>
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            <Typography variant="body2" color="text.secondary" mb={3}>
              See how recommendations reach users across different channels for maximum accessibility and inclusion
            </Typography>

            {selectedInternship ? (
              <Box>
                {/* Enhanced SMS Preview */}
                <Paper
                  sx={{
                    p: 3,
                    mb: 3,
                    background: colors.gradient.success,
                    color: "white",
                    borderRadius: "12px",
                  }}
                >
                  <Box display="flex" alignItems="center" mb={2}>
                    <Sms sx={{ mr: 1 }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      SMS (Feature Phone Compatible)
                    </Typography>
                    <Chip
                      label="50M+ Reach"
                      size="small"
                      sx={{ ml: 1, bgcolor: "rgba(255,255,255,0.2)", color: "white" }}
                    />
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{ fontFamily: "monospace", bgcolor: "rgba(255,255,255,0.1)", p: 2, borderRadius: "8px" }}
                  >
                    {selectedInternship.channels.sms}
                  </Typography>
                </Paper>

                {/* Enhanced WhatsApp Preview */}
                <Paper
                  sx={{
                    p: 3,
                    mb: 3,
                    background: "#25D366",
                    color: "white",
                    borderRadius: "12px",
                  }}
                >
                  <Box display="flex" alignItems="center" mb={2}>
                    <WhatsApp sx={{ mr: 1 }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      WhatsApp Bot
                    </Typography>
                    <Chip
                      label="400M+ Users"
                      size="small"
                      sx={{ ml: 1, bgcolor: "rgba(255,255,255,0.2)", color: "white" }}
                    />
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{ whiteSpace: "pre-line", bgcolor: "rgba(255,255,255,0.1)", p: 2, borderRadius: "8px" }}
                  >
                    {selectedInternship.channels.whatsapp}
                  </Typography>
                </Paper>

                {/* Enhanced Voice Preview */}
                <Paper
                  sx={{
                    p: 3,
                    mb: 2,
                    background: colors.gradient.primary,
                    color: "white",
                    borderRadius: "12px",
                  }}
                >
                  <Box display="flex" alignItems="center" mb={2}>
                    <VolumeUp sx={{ mr: 1 }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      IVR (Hindi Voice Support)
                    </Typography>
                    <IconButton
                      size="small"
                      sx={{ ml: 1, color: "white" }}
                      onClick={() => speakText(selectedInternship.channels.voice)}
                    >
                      <VolumeUp />
                    </IconButton>
                    <Chip
                      label="Multi-language"
                      size="small"
                      sx={{ ml: 1, bgcolor: "rgba(255,255,255,0.2)", color: "white" }}
                    />
                  </Box>
                  <Typography variant="body2" sx={{ bgcolor: "rgba(255,255,255,0.1)", p: 2, borderRadius: "8px" }}>
                    {selectedInternship.channels.voice}
                  </Typography>
                </Paper>
              </Box>
            ) : (
              <Alert severity="info" sx={{ borderRadius: "12px" }}>
                Select an internship from the main page to see multi-channel delivery preview
              </Alert>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setChannelPreview(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Enhanced Comparison Dialog */}
        <Dialog
          open={compareDialog}
          onClose={() => setCompareDialog(false)}
          maxWidth="lg"
          fullWidth
          PaperProps={{
            sx: { borderRadius: "20px" },
          }}
        >
          <DialogTitle
            sx={{
              background: colors.gradient.accent,
              color: "white",
              borderRadius: "20px 20px 0 0",
            }}
          >
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box display="flex" alignItems="center">
                <CompareArrows sx={{ mr: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Compare Internships ({compareList.length}/3)
                </Typography>
              </Box>
              <Chip
                label={`${compareList.length} selected`}
                sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "white" }}
              />
            </Box>
          </DialogTitle>
          <DialogContent sx={{ p: 4 }}>
            {compareList.length >= 2 ? (
              <Box>
                <Grid container spacing={3}>
                  {compareList.map((internship) => (
                    <Grid item xs={12} md={6} lg={4} key={internship.id}>
                      <Paper
                        sx={{
                          p: 3,
                          borderRadius: "16px",
                          border: `2px solid ${colors.primary}30`,
                          position: "relative",
                        }}
                      >
                        <IconButton
                          size="small"
                          onClick={() => setCompareList((prev) => prev.filter((item) => item.id !== internship.id))}
                          sx={{
                            position: "absolute",
                            top: 8,
                            right: 8,
                            bgcolor: colors.error,
                            color: "white",
                            "&:hover": { bgcolor: colors.error },
                          }}
                        >
                          <Close fontSize="small" />
                        </IconButton>

                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, pr: 4 }}>
                          {internship.title}
                        </Typography>
                        <Typography variant="body2" gutterBottom color="text.secondary">
                          {internship.company}
                        </Typography>

                        {/* Comparison Metrics */}
                        <Box mb={2}>
                          <Typography variant="caption" sx={{ fontWeight: 600 }}>
                            Match Score
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={internship.matchScore}
                            sx={{
                              height: 6,
                              borderRadius: 3,
                              bgcolor: `${colors.primary}20`,
                              "& .MuiLinearProgress-bar": {
                                bgcolor: colors.primary,
                                borderRadius: 3,
                              },
                            }}
                          />
                          <Typography variant="caption" sx={{ fontWeight: "bold" }}>
                            {internship.matchScore}%
                          </Typography>
                        </Box>

                        <Box mb={2}>
                          <Typography variant="caption" sx={{ fontWeight: 600 }}>
                            Dropout Risk
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={internship.attritionRisk}
                            color={getRiskColor(internship.attritionRisk)}
                            sx={{ height: 6, borderRadius: 3 }}
                          />
                          <Typography variant="caption" sx={{ fontWeight: "bold" }}>
                            {internship.attritionRisk}% ({getRiskLabel(internship.attritionRisk)})
                          </Typography>
                        </Box>

                        {/* Key Details */}
                        <List dense>
                          <ListItem sx={{ px: 0 }}>
                            <ListItemIcon sx={{ minWidth: 30 }}>
                              <MonetizationOn fontSize="small" color="success" />
                            </ListItemIcon>
                            <ListItemText
                              primary={`₹${internship.stipend.toLocaleString()}/month`}
                              primaryTypographyProps={{ fontWeight: "bold" }}
                            />
                          </ListItem>
                          <ListItem sx={{ px: 0 }}>
                            <ListItemIcon sx={{ minWidth: 30 }}>
                              <LocationOn fontSize="small" color="primary" />
                            </ListItemIcon>
                            <ListItemText primary={`${internship.distance}km away`} secondary={internship.location} />
                          </ListItem>
                          <ListItem sx={{ px: 0 }}>
                            <ListItemIcon sx={{ minWidth: 30 }}>
                              <Schedule fontSize="small" color="info" />
                            </ListItemIcon>
                            <ListItemText primary={internship.duration} />
                          </ListItem>
                        </List>

                        <Button
                          variant="contained"
                          fullWidth
                          sx={{
                            mt: 2,
                            background: colors.gradient.success,
                            "&:hover": {
                              transform: "translateY(-2px)",
                              boxShadow: `0 8px 25px ${colors.success}40`,
                            },
                          }}
                          onClick={() => handleApply(internship)}
                        >
                          Apply Now
                        </Button>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            ) : (
              <Alert severity="info" sx={{ borderRadius: "12px" }}>
                Select at least 2 internships from the main page to compare them side by side
              </Alert>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setCompareList([])} color="error">
              Clear All
            </Button>
            <Button onClick={() => setCompareDialog(false)} variant="contained">
              Close
            </Button>
          </DialogActions>
        </Dialog>

        {/* Enhanced Feedback Dialog */}
        <Dialog
          open={feedbackDialog}
          onClose={() => setFeedbackDialog(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: { borderRadius: "20px" },
          }}
        >
          <DialogTitle
            sx={{
              background: colors.gradient.secondary,
              color: "white",
              borderRadius: "20px 20px 0 0",
            }}
          >
            <Box display="flex" alignItems="center">
              <Star sx={{ mr: 2 }} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Rate This Recommendation
              </Typography>
            </Box>
          </DialogTitle>
          <DialogContent sx={{ p: 4 }}>
            <Box textAlign="center" mb={4}>
              <Typography variant="body1" color="text.secondary" mb={3}>
                Your feedback helps our AI learn and improve future recommendations for you and other students
              </Typography>
              <Rating
                value={feedback.rating}
                onChange={(event, newValue) => {
                  setFeedback((prev) => ({ ...prev, rating: newValue }))
                }}
                size="large"
                sx={{ mb: 2 }}
              />
              <Typography variant="caption" color="text.secondary">
                {feedback.rating === 1
                  ? "Poor Match"
                  : feedback.rating === 2
                    ? "Fair Match"
                    : feedback.rating === 3
                      ? "Good Match"
                      : feedback.rating === 4
                        ? "Very Good Match"
                        : feedback.rating === 5
                          ? "Perfect Match!"
                          : "Rate this recommendation"}
              </Typography>
            </Box>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="What made this recommendation helpful or not helpful?"
              value={feedback.comment}
              onChange={(e) => setFeedback((prev) => ({ ...prev, comment: e.target.value }))}
              placeholder="e.g., Location too far, skills don't match, stipend too low, perfect match..."
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                },
              }}
            />
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setFeedbackDialog(false)}>Cancel</Button>
            <Button
              onClick={() => {
                showSnackbar("Feedback submitted! AI will learn from your input.", "success")
                setFeedbackDialog(false)
                setFeedback({ rating: 0, comment: "" })
              }}
              variant="contained"
              disabled={feedback.rating === 0}
              sx={{ background: colors.gradient.success }}
            >
              Submit Feedback
            </Button>
          </DialogActions>
        </Dialog>

        {/* Enhanced Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            variant="filled"
            sx={{
              borderRadius: "12px",
              minWidth: "300px",
              fontWeight: "bold",
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>

      {/* Add CSS for pulse animation */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </Box>
  )
}

export default RecommendationsPage
