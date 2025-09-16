import { Card, CardContent, Typography, Box, LinearProgress } from "@mui/material"
import { motion } from "framer-motion"

const AnalyticsCard = ({ title, value, subtitle, icon, color = "primary", progress, trend, delay = 0 }) => {
  return (
    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6, delay }}>
      <Card sx={{ height: "100%" }}>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Typography color="text.secondary" variant="subtitle2">
              {title}
            </Typography>
            {icon && <Box color={`${color}.main`}>{icon}</Box>}
          </Box>

          <Typography variant="h4" component="div" color={`${color}.main`} gutterBottom>
            {value}
          </Typography>

          {subtitle && (
            <Typography variant="body2" color="text.secondary" mb={1}>
              {subtitle}
            </Typography>
          )}

          {progress !== undefined && (
            <Box>
              <LinearProgress variant="determinate" value={progress} color={color} sx={{ mb: 1 }} />
              <Typography variant="caption" color="text.secondary">
                {progress}% of target
              </Typography>
            </Box>
          )}

          {trend && (
            <Typography variant="caption" color={trend > 0 ? "success.main" : "error.main"}>
              {trend > 0 ? "↗" : "↘"} {Math.abs(trend)}% from last month
            </Typography>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default AnalyticsCard
