import { Box, CircularProgress, Typography } from "@mui/material"
import { motion } from "framer-motion"

const LoadingSpinner = ({ message = "Loading..." }) => {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="200px" gap={2}>
        <CircularProgress size={60} thickness={4} />
        <Typography variant="body1" color="text.secondary">
          {message}
        </Typography>
      </Box>
    </motion.div>
  )
}

export default LoadingSpinner
