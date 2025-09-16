"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
  IconButton,
  Menu,
  MenuItem,
  Button,
  Tooltip,
  Badge,
  Avatar,
  LinearProgress,
  Switch,
  FormControlLabel,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  TablePagination,
  Snackbar,
} from "@mui/material"
import { styled, alpha, keyframes } from "@mui/material/styles"
import { motion, AnimatePresence } from "framer-motion"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts"
import {
  TrendingUp,
  People,
  Business,
  CheckCircle,
  Assessment,
  Search,
  FilterList,
  Refresh,
  Download,
  NotificationsActive,
  Visibility,
  Speed,
  Analytics,
  Timeline,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  ShowChart,
  TableChart,
  Home,
  Close,
} from "@mui/icons-material"
import { useNavigate } from "react-router-dom"

import { applicationsAPI, internshipsAPI, recommendationsAPI, mlAPI } from "../services/api"
import { useAPI } from "../hooks/useAPI"

// Professional color palette
const colors = {
  primary: "#1e3a5f",
  secondary: "#f6a821",
  success: "#16a085",
  error: "#e74c3c",
  warning: "#f39c12",
  gradient: {
    primary: "linear-gradient(135deg, #1e3a5f 0%, #2c5282 50%, #3d5a80 100%)",
    secondary: "linear-gradient(135deg, #f6a821 0%, #ff8c42 100%)",
    success: "linear-gradient(135deg, #16a085 0%, #1abc9c 100%)",
    hero: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  },
}

// Enhanced Styled Components
const GlassCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)}, ${alpha(theme.palette.background.paper, 0.7)})`,
  backdropFilter: "blur(20px)",
  borderRadius: "20px",
  border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
  boxShadow: `0 20px 40px ${alpha(theme.palette.common.black, 0.1)}`,
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: `0 32px 64px ${alpha(theme.palette.common.black, 0.15)}`,
  },
}))

const StatCard = styled(Card)(({ theme, cardcolor = "primary" }) => ({
  position: "relative",
  overflow: "hidden",
  background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)}, ${alpha(theme.palette.background.paper, 0.7)})`,
  backdropFilter: "blur(20px)",
  borderRadius: "20px",
  border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
  boxShadow: `0 20px 40px ${alpha(theme.palette.common.black, 0.1)}`,
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  "&:hover": {
    transform: "translateY(-8px)",
    boxShadow: `0 32px 64px ${alpha(theme.palette.common.black, 0.15)}`,
  },
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "4px",
    background: colors.gradient[cardcolor] || colors.gradient.primary,
    borderRadius: "20px 20px 0 0",
  },
}))

const AnimatedNumber = styled(motion.div)({
  fontWeight: 700,
  fontSize: "2.5rem",
  background: colors.gradient.hero,
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
})

const pulse = keyframes`
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.8; }
  100% { transform: scale(1); opacity: 1; }
`

const LiveIndicator = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
  "& .pulse-dot": {
    width: 8,
    height: 8,
    borderRadius: "50%",
    backgroundColor: colors.success,
    animation: `${pulse} 2s infinite`,
  },
}))

const AdminDashboard = () => {
  const navigate = useNavigate()

  // Core States
  const [tabValue, setTabValue] = useState(0)
  const [dashboardData, setDashboardData] = useState(null)
  const [performanceData, setPerformanceData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Filter & Search States
  const [searchQuery, setSearchQuery] = useState("")
  const [filterAnchor, setFilterAnchor] = useState(null)
  const [dateRange, setDateRange] = useState("7d")
  const [statusFilter, setStatusFilter] = useState("all")

  // Table States
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  // UI States
  const [realTimeEnabled, setRealTimeEnabled] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" })
  const [selectedApplications, setSelectedApplications] = useState([])

  // Enhanced data fetching
  const fetchDashboardData = useCallback(async () => {
    try {
      setRefreshing(true)
      setError(null)

      // Simulate API calls - replace with real endpoints
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Load sample data
      loadEnhancedSampleData()
      showSnackbar("Dashboard data refreshed successfully!", "success")
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err)
      setError("Failed to load dashboard data. Using sample data.")
      loadEnhancedSampleData()
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [dateRange])

  // Real-time updates
  useEffect(() => {
    fetchDashboardData()

    let interval = null
    if (realTimeEnabled) {
      interval = setInterval(fetchDashboardData, 30000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [fetchDashboardData, realTimeEnabled])

  const loadEnhancedSampleData = () => {
    setDashboardData({
      stats: {
        totalCandidates: "1,24,567",
        totalInternships: "2,847",
        totalApplications: "89,234",
        successfulPlacements: "67,891",
        matchAccuracy: "92.8%",
        averageResponseTime: "2.4h",
        activeUsers: "15,432",
        conversionRate: "76.1%",
      },
      monthlyTrends: [
        { month: "Jan", applications: 8500, placements: 6800, interviews: 7200, offers: 6900 },
        { month: "Feb", applications: 9200, placements: 7400, interviews: 7800, offers: 7500 },
        { month: "Mar", applications: 11000, placements: 8900, interviews: 9500, offers: 9100 },
        { month: "Apr", applications: 12500, placements: 10200, interviews: 11000, offers: 10400 },
        { month: "May", applications: 14000, placements: 11800, interviews: 12500, offers: 12000 },
        { month: "Jun", applications: 15500, placements: 13200, interviews: 14000, offers: 13400 },
        { month: "Jul", applications: 17200, placements: 14800, interviews: 15600, offers: 15000 },
      ],
      skillsDistribution: [
        { _id: "javascript", count: 15420, trend: "+12%" },
        { _id: "python", count: 12350, trend: "+8%" },
        { _id: "react", count: 11200, trend: "+15%" },
        { _id: "java", count: 9800, trend: "+5%" },
        { _id: "sql", count: 8900, trend: "+3%" },
        { _id: "nodejs", count: 7650, trend: "+18%" },
        { _id: "aws", count: 6800, trend: "+25%" },
      ],
      recentApplications: [
        {
          id: 1,
          candidateName: "Rahul Sharma",
          internshipTitle: "Frontend Developer",
          status: "completed",
          matchScore: 94,
          appliedAt: "2025-09-09T10:30:00Z",
          company: "TechCorp",
          location: "Bangalore",
        },
        {
          id: 2,
          candidateName: "Priya Patel",
          internshipTitle: "Data Analyst",
          status: "active",
          matchScore: 89,
          appliedAt: "2025-09-09T09:15:00Z",
          company: "DataViz Inc",
          location: "Mumbai",
        },
        {
          id: 3,
          candidateName: "Amit Kumar",
          internshipTitle: "UI Designer",
          status: "completed",
          matchScore: 91,
          appliedAt: "2025-09-09T08:45:00Z",
          company: "DesignStudio",
          location: "Delhi",
        },
        {
          id: 4,
          candidateName: "Sneha Singh",
          internshipTitle: "Content Writer",
          status: "pending",
          matchScore: 87,
          appliedAt: "2025-09-09T08:00:00Z",
          company: "ContentWorks",
          location: "Pune",
        },
        {
          id: 5,
          candidateName: "Vikash Yadav",
          internshipTitle: "Python Developer",
          status: "interview",
          matchScore: 93,
          appliedAt: "2025-09-08T16:20:00Z",
          company: "PyTech Solutions",
          location: "Hyderabad",
        },
        {
          id: 6,
          candidateName: "Anita Roy",
          internshipTitle: "Marketing Intern",
          status: "active",
          matchScore: 85,
          appliedAt: "2025-09-08T14:30:00Z",
          company: "AdTech Pro",
          location: "Chennai",
        },
        {
          id: 7,
          candidateName: "Rohit Gupta",
          internshipTitle: "Backend Developer",
          status: "pending",
          matchScore: 88,
          appliedAt: "2025-09-08T12:15:00Z",
          company: "ServerTech",
          location: "Pune",
        },
      ],
      performanceMetrics: {
        weeklyGrowth: [
          { day: "Mon", value: 85 },
          { day: "Tue", value: 92 },
          { day: "Wed", value: 88 },
          { day: "Thu", value: 96 },
          { day: "Fri", value: 91 },
          { day: "Sat", value: 87 },
          { day: "Sun", value: 94 },
        ],
        categoryPerformance: [
          { category: "Engineering", score: 92, applications: 45000 },
          { category: "Design", score: 88, applications: 12000 },
          { category: "Marketing", score: 85, applications: 15000 },
          { category: "Data Science", score: 94, applications: 18000 },
          { category: "Content", score: 79, applications: 8000 },
        ],
      },
    })

    setPerformanceData({
      recommendationPerformance: {
        avgMatchScore: 87.4,
        totalRecommendations: 48921,
        improvementRate: "+12.5%",
      },
      feedbackAnalysis: [
        { _id: 1, count: 234 },
        { _id: 2, count: 567 },
        { _id: 3, count: 1834 },
        { _id: 4, count: 3245 },
        { _id: 5, count: 4567 },
      ],
      geoDistribution: [
        { _id: "tier1", count: 45000, cities: ["Mumbai", "Delhi", "Bangalore"] },
        { _id: "tier2", count: 35000, cities: ["Pune", "Chennai", "Hyderabad"] },
        { _id: "tier3", count: 44567, cities: ["Indore", "Bhopal", "Lucknow"] },
      ],
      realTimeStats: {
        activeUsers: 1547,
        ongoingInterviews: 89,
        newApplications: 234,
        systemHealth: 98.5,
      },
    })
  }

  // Helper Functions
  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity })
  }

  const getStatsConfig = useCallback(() => {
    if (!dashboardData?.stats) return []

    return [
      {
        title: "Total Candidates",
        value: dashboardData.stats.totalCandidates,
        icon: <People />,
        color: "primary",
        trend: "+18.2%",
        description: "Active candidates in system",
      },
      {
        title: "Active Internships",
        value: dashboardData.stats.totalInternships,
        icon: <Business />,
        color: "secondary",
        trend: "+12.5%",
        description: "Live internship opportunities",
      },
      {
        title: "Successful Placements",
        value: dashboardData.stats.successfulPlacements,
        icon: <CheckCircle />,
        color: "success",
        trend: "+24.3%",
        description: "Confirmed placements",
      },
      {
        title: "Match Accuracy",
        value: dashboardData.stats.matchAccuracy,
        icon: <TrendingUp />,
        color: "success",
        trend: "+5.7%",
        description: "AI recommendation accuracy",
      },
      {
        title: "Avg Response Time",
        value: dashboardData.stats.averageResponseTime,
        icon: <Speed />,
        color: "warning",
        trend: "-15.2%",
        description: "System response time",
      },
      {
        title: "Active Users",
        value: dashboardData.stats.activeUsers,
        icon: <NotificationsActive />,
        color: "primary",
        trend: "+8.9%",
        description: "Users online now",
      },
    ]
  }, [dashboardData])

  // Filtered applications
  const filteredApplications = useMemo(() => {
    if (!dashboardData?.recentApplications) return []

    let filtered = dashboardData.recentApplications

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (app) =>
          app.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          app.internshipTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
          app.company.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((app) => app.status === statusFilter)
    }

    return filtered
  }, [dashboardData?.recentApplications, searchQuery, statusFilter])

  // Paginated applications
  const paginatedApplications = useMemo(() => {
    const startIndex = page * rowsPerPage
    return filteredApplications.slice(startIndex, startIndex + rowsPerPage)
  }, [filteredApplications, page, rowsPerPage])

  const getStatusColor = (status) => {
    const statusColors = {
      completed: "success",
      active: "info",
      pending: "warning",
      interview: "secondary",
      rejected: "error",
    }
    return statusColors[status] || "default"
  }

  const exportData = () => {
    if (!dashboardData) return

    const dataStr = JSON.stringify(dashboardData, null, 2)
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)
    const exportFileDefaultName = `pmis-dashboard-${new Date().toISOString().split("T")[0]}.json`

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()

    showSnackbar("📊 Dashboard data exported successfully!", "success")
  }

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(Number.parseInt(event.target.value, 10))
    setPage(0)
  }

  const applyStatusFilter = (status) => {
    setStatusFilter(status)
    setFilterAnchor(null)
    setPage(0)
  }

  const handleStatusUpdate = async (applicationId, newStatus, feedback = "") => {
    try {
      await applicationsAPI.updateStatus(applicationId, newStatus, feedback)

      showSnackbar(`Application ${newStatus.toLowerCase()} successfully!`, "success")
      refetchApplications() // Refresh data
    } catch (error) {
      showSnackbar(error.message || "Failed to update application status", "error")
    }
  }

  const handleBulkAction = async (selectedIds, action) => {
    try {
      const updates = selectedIds.map((id) => ({ id, status: action }))

      await applicationsAPI.bulkUpdate(updates)

      showSnackbar(`${selectedIds.length} applications ${action.toLowerCase()} successfully!`, "success")
      setSelectedApplications([])
      refetchApplications()
    } catch (error) {
      showSnackbar(error.message || "Failed to perform bulk action", "error")
    }
  }

  const refreshDashboard = async () => {
    try {
      setRefreshing(true)

      await Promise.all([
        refetchApplications(),
        // Add other refresh calls as needed
      ])

      showSnackbar("Dashboard data refreshed successfully!", "success")
    } catch (error) {
      showSnackbar("Failed to refresh dashboard data", "error")
    } finally {
      setRefreshing(false)
    }
  }

  const {
    data: applications,
    loading: applicationsLoading,
    refetch: refetchApplications,
  } = useAPI(() => applicationsAPI.getAll({ page: 1, limit: 100 }), [])

  const { data: internships, loading: internshipsLoading } = useAPI(
    () => internshipsAPI.getAll({ page: 1, limit: 100 }),
    [],
  )

  const { data: analytics } = useAPI(() => recommendationsAPI.getAnalytics(), [])

  const { data: mlMetrics } = useAPI(() => mlAPI.getModelMetrics(), [])

  // Loading State
  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Box textAlign="center" mb={4}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            >
              <Analytics sx={{ fontSize: 80, color: colors.primary, mb: 2 }} />
            </motion.div>
            <Typography variant="h4" sx={{ color: colors.primary, fontWeight: 700, mb: 2 }}>
              Loading PMIS Dashboard...
            </Typography>
            <Typography variant="body1" color="text.secondary" mb={3}>
              Initializing advanced analytics and real-time data streams
            </Typography>
            <LinearProgress sx={{ height: 8, borderRadius: 4, mb: 2 }} />
          </Box>

          {/* Loading Skeletons */}
          <Grid container spacing={3} mb={4}>
            {[...Array(6)].map((_, index) => (
              <Grid item xs={12} sm={6} md={4} lg={2} key={index}>
                <Card sx={{ p: 2, borderRadius: "16px" }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Box width="60%" height="20px" bgcolor="grey.300" borderRadius="4px" />
                    <Box width="32px" height="32px" bgcolor="grey.300" borderRadius="50%" />
                  </Box>
                  <Box width="80%" height="40px" bgcolor="grey.200" borderRadius="4px" mb={1} />
                  <Box width="100%" height="16px" bgcolor="grey.300" borderRadius="4px" />
                </Card>
              </Grid>
            ))}
          </Grid>
        </motion.div>
      </Container>
    )
  }

  const displayApplications = applications?.data || []
  const displayInternships = internships?.data || []

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Enhanced Header */}
        <Box mb={4}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Box>
              <Typography
                variant="h3"
                gutterBottom
                sx={{
                  background: colors.gradient.hero,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  fontWeight: 800,
                  letterSpacing: "-0.02em",
                }}
              >
                🎯 PMIS SmartMatch+ Dashboard
              </Typography>
              <Typography variant="h6" color="text.secondary">
                AI-Powered Internship Analytics & Real-time Insights
              </Typography>
            </Box>

            <Box display="flex" alignItems="center" gap={2}>
              <LiveIndicator>
                <div className="pulse-dot" />
                <Typography variant="body2" color="success.main" fontWeight={600}>
                  Live Data
                </Typography>
              </LiveIndicator>

              <FormControlLabel
                control={
                  <Switch
                    checked={realTimeEnabled}
                    onChange={(e) => setRealTimeEnabled(e.target.checked)}
                    color="primary"
                  />
                }
                label="Real-time"
              />

              <Tooltip title="Refresh Data">
                <IconButton
                  onClick={fetchDashboardData}
                  disabled={refreshing}
                  sx={{
                    bgcolor: "background.paper",
                    boxShadow: 1,
                    "&:hover": { boxShadow: 3 },
                  }}
                >
                  <Refresh
                    sx={{
                      animation: refreshing ? "spin 1s linear infinite" : "none",
                      "@keyframes spin": {
                        "0%": { transform: "rotate(0deg)" },
                        "100%": { transform: "rotate(360deg)" },
                      },
                    }}
                  />
                </IconButton>
              </Tooltip>

              <Button
                variant="contained"
                startIcon={<Download />}
                onClick={exportData}
                sx={{
                  borderRadius: "12px",
                  background: colors.gradient.secondary,
                }}
              >
                Export
              </Button>

              <Button
                variant="outlined"
                startIcon={<Home />}
                onClick={() => navigate("/")}
                sx={{ borderRadius: "12px" }}
              >
                Home
              </Button>
            </Box>
          </Box>

          {error && (
            <motion.div initial={{ x: -100, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
              <Alert
                severity="warning"
                sx={{ mb: 3, borderRadius: "12px" }}
                action={
                  <IconButton color="inherit" size="small" onClick={() => setError(null)}>
                    <Close />
                  </IconButton>
                }
              >
                {error}
              </Alert>
            </motion.div>
          )}
        </Box>

        {/* Enhanced Stats Cards */}
        <Grid container spacing={3} mb={4}>
          <AnimatePresence>
            {getStatsConfig().map((stat, index) => (
              <Grid item xs={12} sm={6} md={4} lg={2} key={index}>
                <motion.div
                  initial={{ y: 50, opacity: 0, rotateX: -15 }}
                  animate={{ y: 0, opacity: 1, rotateX: 0 }}
                  transition={{
                    duration: 0.6,
                    delay: index * 0.1,
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                  }}
                  whileHover={{
                    y: -12,
                    transition: { duration: 0.2 },
                  }}
                >
                  <StatCard cardcolor={stat.color}>
                    <CardContent sx={{ pb: "16px !important" }}>
                      <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                        <Typography variant="body2" color="text.secondary" fontWeight={500}>
                          {stat.title}
                        </Typography>
                        <Avatar
                          sx={{
                            bgcolor: `${stat.color}.main`,
                            width: 36,
                            height: 36,
                            "& svg": { fontSize: 18 },
                          }}
                        >
                          {stat.icon}
                        </Avatar>
                      </Box>

                      <AnimatedNumber
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: index * 0.1 + 0.3, type: "spring" }}
                      >
                        {stat.value}
                      </AnimatedNumber>

                      <Box display="flex" alignItems="center" justifyContent="space-between" mt={1}>
                        <Typography variant="caption" color="text.secondary">
                          {stat.description}
                        </Typography>
                        <Chip
                          label={stat.trend}
                          size="small"
                          color={
                            stat.trend.startsWith("+") ? "success" : stat.trend.startsWith("-") ? "error" : "primary"
                          }
                          sx={{ fontSize: "0.7rem", height: 20 }}
                        />
                      </Box>
                    </CardContent>
                  </StatCard>
                </motion.div>
              </Grid>
            ))}
          </AnimatePresence>
        </Grid>

        {/* Real-time Performance Metrics */}
        {performanceData && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <Grid container spacing={3} mb={4}>
              <Grid item xs={12} md={8}>
                <GlassCard>
                  <CardContent>
                    <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
                      <Typography variant="h6" fontWeight={700}>
                        Performance Insights
                      </Typography>
                      <Badge badgeContent={performanceData.realTimeStats?.activeUsers || 0} color="success" max={9999}>
                        <Visibility />
                      </Badge>
                    </Box>

                    <Grid container spacing={2}>
                      <Grid item xs={6} md={3}>
                        <Box textAlign="center" p={2} borderRadius={2} bgcolor="background.default">
                          <Typography variant="h4" color="primary.main" fontWeight={700}>
                            {performanceData.realTimeStats?.ongoingInterviews || 0}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Live Interviews
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <Box textAlign="center" p={2} borderRadius={2} bgcolor="background.default">
                          <Typography variant="h4" color="secondary.main" fontWeight={700}>
                            {performanceData.realTimeStats?.newApplications || 0}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            New Today
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <Box textAlign="center" p={2} borderRadius={2} bgcolor="background.default">
                          <Typography variant="h4" color="success.main" fontWeight={700}>
                            {performanceData.realTimeStats?.systemHealth || 0}%
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            System Health
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <Box textAlign="center" p={2} borderRadius={2} bgcolor="background.default">
                          <Typography variant="h4" color="info.main" fontWeight={700}>
                            {performanceData.recommendationPerformance?.avgMatchScore?.toFixed(1) || 0}%
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            AI Accuracy
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </GlassCard>
              </Grid>

              <Grid item xs={12} md={4}>
                <GlassCard sx={{ height: "100%" }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={2}>
                      <Assessment sx={{ mr: 1, color: "primary.main" }} />
                      <Typography variant="h6" fontWeight={700}>
                        AI Performance
                      </Typography>
                    </Box>
                    <Box mb={2}>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="body2">Match Accuracy</Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {performanceData.recommendationPerformance?.avgMatchScore?.toFixed(1) || 0}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={performanceData.recommendationPerformance?.avgMatchScore || 0}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {performanceData.recommendationPerformance?.totalRecommendations?.toLocaleString() || 0} total
                      recommendations
                    </Typography>
                    <Chip
                      label={performanceData.recommendationPerformance?.improvementRate || "+0%"}
                      color="success"
                      size="small"
                      sx={{ mt: 1 }}
                    />
                  </CardContent>
                </GlassCard>
              </Grid>
            </Grid>
          </motion.div>
        )}

        {/* Enhanced Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          <GlassCard>
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <Tabs
                value={tabValue}
                onChange={(e, newValue) => setTabValue(newValue)}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  "& .MuiTab-root": {
                    minWidth: 120,
                    fontWeight: 600,
                    textTransform: "none",
                    fontSize: "0.95rem",
                  },
                  "& .MuiTabs-indicator": {
                    height: 3,
                    borderRadius: "3px 3px 0 0",
                    background: colors.gradient.secondary,
                  },
                }}
              >
                <Tab icon={<ShowChart />} iconPosition="start" label="Trends Analysis" />
                <Tab icon={<TableChart />} iconPosition="start" label="Live Applications" />
                <Tab icon={<PieChartIcon />} iconPosition="start" label="Skills Intelligence" />
                <Tab icon={<BarChartIcon />} iconPosition="start" label="Performance Metrics" />
                <Tab icon={<Timeline />} iconPosition="start" label="Real-time Analytics" />
              </Tabs>
            </Box>

            <CardContent sx={{ p: 4 }}>
              <AnimatePresence mode="wait">
                {/* Trends Tab */}
                {tabValue === 0 && dashboardData?.monthlyTrends && (
                  <motion.div
                    key="trends"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.4 }}
                  >
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                      <Typography variant="h6" fontWeight={700}>
                        Application & Placement Trends
                      </Typography>
                      <Box display="flex" gap={1}>
                        {["7d", "30d", "90d"].map((range) => (
                          <Chip
                            key={range}
                            label={range}
                            clickable
                            color={dateRange === range ? "primary" : "default"}
                            size="small"
                            onClick={() => setDateRange(range)}
                          />
                        ))}
                      </Box>
                    </Box>

                    <ResponsiveContainer width="100%" height={400}>
                      <AreaChart
                        data={dashboardData.monthlyTrends}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <defs>
                          <linearGradient id="applications" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={colors.primary} stopOpacity={0.8} />
                            <stop offset="95%" stopColor={colors.primary} stopOpacity={0.1} />
                          </linearGradient>
                          <linearGradient id="placements" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={colors.success} stopOpacity={0.8} />
                            <stop offset="95%" stopColor={colors.success} stopOpacity={0.1} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} />
                        <YAxis axisLine={false} tickLine={false} />
                        <RechartsTooltip
                          contentStyle={{
                            backgroundColor: "rgba(255,255,255,0.95)",
                            border: "none",
                            borderRadius: "12px",
                            boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="applications"
                          stroke={colors.primary}
                          fillOpacity={1}
                          fill="url(#applications)"
                          strokeWidth={3}
                        />
                        <Area
                          type="monotone"
                          dataKey="placements"
                          stroke={colors.success}
                          fillOpacity={1}
                          fill="url(#placements)"
                          strokeWidth={3}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </motion.div>
                )}

                {/* Applications Tab */}
                {tabValue === 1 && (
                  <motion.div
                    key="applications"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.4 }}
                  >
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                      <Typography variant="h6" fontWeight={700}>
                        Live Application Stream ({filteredApplications.length})
                      </Typography>
                      <Box display="flex" gap={2} alignItems="center">
                        <TextField
                          size="small"
                          placeholder="🔍 Search applications..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Search />
                              </InputAdornment>
                            ),
                          }}
                          sx={{ minWidth: 250 }}
                        />
                        <IconButton
                          onClick={(e) => setFilterAnchor(e.currentTarget)}
                          sx={{ bgcolor: "background.paper", border: 1, borderColor: "divider" }}
                        >
                          <FilterList />
                        </IconButton>
                      </Box>
                    </Box>

                    {paginatedApplications.length > 0 ? (
                      <>
                        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: "12px" }}>
                          <Table>
                            <TableHead>
                              <TableRow sx={{ bgcolor: "background.default" }}>
                                <TableCell sx={{ fontWeight: 700 }}>Candidate</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Position</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Company</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Match Score</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Applied</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              <AnimatePresence>
                                {paginatedApplications.map((app, index) => (
                                  <motion.tr
                                    key={app.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ delay: index * 0.05 }}
                                    component={TableRow}
                                    sx={{
                                      "&:hover": {
                                        bgcolor: alpha(colors.primary, 0.04),
                                        transform: "scale(1.005)",
                                        transition: "all 0.2s ease",
                                      },
                                    }}
                                  >
                                    <TableCell>
                                      <Box display="flex" alignItems="center" gap={2}>
                                        <Avatar sx={{ width: 32, height: 32, bgcolor: "primary.light" }}>
                                          {app.candidateName.charAt(0)}
                                        </Avatar>
                                        <Box>
                                          <Typography variant="body2" fontWeight={600}>
                                            {app.candidateName}
                                          </Typography>
                                          <Typography variant="caption" color="text.secondary">
                                            {app.location}
                                          </Typography>
                                        </Box>
                                      </Box>
                                    </TableCell>
                                    <TableCell>
                                      <Typography variant="body2" fontWeight={500}>
                                        {app.internshipTitle}
                                      </Typography>
                                    </TableCell>
                                    <TableCell>
                                      <Typography variant="body2" color="text.secondary">
                                        {app.company}
                                      </Typography>
                                    </TableCell>
                                    <TableCell>
                                      <Chip
                                        label={app.status}
                                        color={getStatusColor(app.status)}
                                        size="small"
                                        sx={{
                                          textTransform: "capitalize",
                                          fontWeight: 600,
                                          minWidth: 80,
                                        }}
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <Box display="flex" alignItems="center" gap={1}>
                                        <CircularProgress
                                          variant="determinate"
                                          value={app.matchScore}
                                          size={24}
                                          thickness={4}
                                          color={
                                            app.matchScore > 90
                                              ? "success"
                                              : app.matchScore > 80
                                                ? "primary"
                                                : "warning"
                                          }
                                        />
                                        <Typography variant="body2" fontWeight={600}>
                                          {app.matchScore}%
                                        </Typography>
                                      </Box>
                                    </TableCell>
                                    <TableCell>
                                      <Typography variant="body2" color="text.secondary">
                                        {new Date(app.appliedAt).toLocaleDateString()}
                                      </Typography>
                                    </TableCell>
                                  </motion.tr>
                                ))}
                              </AnimatePresence>
                            </TableBody>
                          </Table>
                        </TableContainer>

                        <TablePagination
                          rowsPerPageOptions={[5, 10, 25]}
                          component="div"
                          count={filteredApplications.length}
                          rowsPerPage={rowsPerPage}
                          page={page}
                          onPageChange={handleChangePage}
                          onRowsPerPageChange={handleChangeRowsPerPage}
                        />
                      </>
                    ) : (
                      <Box textAlign="center" py={4}>
                        <Typography variant="body1" color="text.secondary">
                          No applications found matching your search criteria.
                        </Typography>
                      </Box>
                    )}
                  </motion.div>
                )}

                {/* Skills Tab */}
                {tabValue === 2 && dashboardData?.skillsDistribution && (
                  <motion.div
                    key="skills"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.4 }}
                  >
                    <Typography variant="h6" fontWeight={700} mb={3}>
                      Skills Intelligence & Market Trends
                    </Typography>

                    <Grid container spacing={4}>
                      <Grid item xs={12} md={6}>
                        <ResponsiveContainer width="100%" height={350}>
                          <PieChart>
                            <Pie
                              data={dashboardData.skillsDistribution.slice(0, 7)}
                              cx="50%"
                              cy="50%"
                              outerRadius={120}
                              innerRadius={60}
                              paddingAngle={5}
                              dataKey="count"
                            >
                              {dashboardData.skillsDistribution.slice(0, 7).map((entry, index) => {
                                const chartColors = [
                                  colors.primary,
                                  colors.secondary,
                                  colors.success,
                                  colors.warning,
                                  colors.error,
                                  "#9c27b0",
                                  "#ff9800",
                                ]
                                return <Cell key={`cell-${index}`} fill={chartColors[index]} />
                              })}
                            </Pie>
                            <RechartsTooltip formatter={(value) => [value.toLocaleString(), "Candidates"]} />
                          </PieChart>
                        </ResponsiveContainer>
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <Box height={350} overflow="auto">
                          {dashboardData.skillsDistribution.map((skill, index) => (
                            <motion.div
                              key={skill._id}
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                            >
                              <Box
                                p={2}
                                mb={2}
                                borderRadius={2}
                                bgcolor="background.default"
                                sx={{
                                  border: "1px solid",
                                  borderColor: "divider",
                                  "&:hover": {
                                    borderColor: "primary.main",
                                    transform: "translateY(-2px)",
                                    transition: "all 0.2s ease",
                                  },
                                }}
                              >
                                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                  <Typography variant="body1" fontWeight={600} sx={{ textTransform: "capitalize" }}>
                                    {skill._id}
                                  </Typography>
                                  <Chip label={skill.trend} color="success" size="small" />
                                </Box>
                                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                  <Typography variant="body2" color="text.secondary">
                                    {skill.count.toLocaleString()} candidates
                                  </Typography>
                                  <Typography variant="caption" color="primary.main" fontWeight={600}>
                                    #{index + 1}
                                  </Typography>
                                </Box>
                                <LinearProgress
                                  variant="determinate"
                                  value={(skill.count / dashboardData.skillsDistribution[0].count) * 100}
                                  sx={{ height: 6, borderRadius: 3 }}
                                />
                              </Box>
                            </motion.div>
                          ))}
                        </Box>
                      </Grid>
                    </Grid>
                  </motion.div>
                )}

                {/* Performance Tab */}
                {tabValue === 3 && performanceData && (
                  <motion.div
                    key="performance"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.4 }}
                  >
                    <Typography variant="h6" fontWeight={700} mb={3}>
                      Advanced Performance Analytics
                    </Typography>

                    <Grid container spacing={4}>
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle1" fontWeight={600} mb={2}>
                          User Feedback Analysis
                        </Typography>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart
                            data={
                              performanceData.feedbackAnalysis?.map((item) => ({
                                rating: `${item._id} Star${item._id > 1 ? "s" : ""}`,
                                count: item.count,
                              })) || []
                            }
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="rating" />
                            <YAxis />
                            <RechartsTooltip />
                            <Bar dataKey="count" fill={colors.primary} radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle1" fontWeight={600} mb={2}>
                          Geographic Distribution
                        </Typography>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart
                            data={
                              performanceData.geoDistribution?.map((item) => ({
                                tier: item._id.toUpperCase(),
                                candidates: item.count,
                              })) || []
                            }
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="tier" />
                            <YAxis />
                            <RechartsTooltip />
                            <Bar dataKey="candidates" fill={colors.secondary} radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </Grid>
                    </Grid>
                  </motion.div>
                )}

                {/* Real-time Analytics Tab */}
                {tabValue === 4 && dashboardData?.performanceMetrics && (
                  <motion.div
                    key="realtime"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.4 }}
                  >
                    <Typography variant="h6" fontWeight={700} mb={3}>
                      ⚡ Real-time Performance Dashboard
                    </Typography>

                    <Grid container spacing={4}>
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle1" fontWeight={600} mb={2}>
                          Weekly Growth Pattern
                        </Typography>
                        <ResponsiveContainer width="100%" height={300}>
                          <LineChart data={dashboardData.performanceMetrics.weeklyGrowth}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="day" />
                            <YAxis />
                            <RechartsTooltip />
                            <Line
                              type="monotone"
                              dataKey="value"
                              stroke={colors.primary}
                              strokeWidth={3}
                              dot={{ fill: colors.primary, strokeWidth: 2, r: 6 }}
                              activeDot={{ r: 8, fill: colors.secondary }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle1" fontWeight={600} mb={2}>
                          Category Performance Radar
                        </Typography>
                        <ResponsiveContainer width="100%" height={300}>
                          <RadarChart data={dashboardData.performanceMetrics.categoryPerformance}>
                            <PolarGrid />
                            <PolarAngleAxis dataKey="category" />
                            <PolarRadiusAxis angle={90} domain={[0, 100]} />
                            <Radar
                              name="Performance Score"
                              dataKey="score"
                              stroke={colors.primary}
                              fill={colors.primary}
                              fillOpacity={0.3}
                              strokeWidth={2}
                            />
                            <RechartsTooltip />
                          </RadarChart>
                        </ResponsiveContainer>
                      </Grid>
                    </Grid>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </GlassCard>
        </motion.div>
      </motion.div>

      {/* Enhanced Floating Speed Dial */}
      <SpeedDial
        ariaLabel="Dashboard Actions"
        sx={{ position: "fixed", bottom: 24, right: 24 }}
        icon={<SpeedDialIcon />}
        FabProps={{
          sx: {
            background: colors.gradient.hero,
            "&:hover": {
              background: colors.gradient.secondary,
            },
          },
        }}
      >
        <SpeedDialAction icon={<Refresh />} tooltipTitle="Refresh Data" onClick={fetchDashboardData} />
        <SpeedDialAction icon={<Download />} tooltipTitle="Export Data" onClick={exportData} />
        <SpeedDialAction icon={<Analytics />} tooltipTitle="Advanced Analytics" onClick={() => setTabValue(4)} />
        <SpeedDialAction icon={<Home />} tooltipTitle="Back to Home" onClick={() => navigate("/")} />
      </SpeedDial>

      {/* Enhanced Filter Menu */}
      <Menu
        anchorEl={filterAnchor}
        open={Boolean(filterAnchor)}
        onClose={() => setFilterAnchor(null)}
        PaperProps={{
          sx: { borderRadius: "12px", mt: 1 },
        }}
      >
        <MenuItem onClick={() => applyStatusFilter("all")}>
          <Chip label="All" size="small" sx={{ mr: 1 }} />
          All Applications
        </MenuItem>
        <MenuItem onClick={() => applyStatusFilter("completed")}>
          <Chip label="Completed" color="success" size="small" sx={{ mr: 1 }} />
          Completed Only
        </MenuItem>
        <MenuItem onClick={() => applyStatusFilter("active")}>
          <Chip label="Active" color="info" size="small" sx={{ mr: 1 }} />
          Active Only
        </MenuItem>
        <MenuItem onClick={() => applyStatusFilter("pending")}>
          <Chip label="Pending" color="warning" size="small" sx={{ mr: 1 }} />
          Pending Only
        </MenuItem>
        <MenuItem onClick={() => applyStatusFilter("interview")}>
          <Chip label="Interview" color="secondary" size="small" sx={{ mr: 1 }} />
          Interview Only
        </MenuItem>
      </Menu>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          sx={{ borderRadius: "12px", fontWeight: "bold" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  )
}

export default AdminDashboard
