import { useState } from "react"
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Box,
  useMediaQuery,
  useTheme,
  Chip,
  Tooltip,
  Fade,
  Slide,
  Avatar,
  Menu,
  MenuItem,
  Divider,
} from "@mui/material"
import { 
  Menu as MenuIcon, 
  Close as CloseIcon, 
  Translate,
  Home,
  Person,
  Recommend,
  AdminPanelSettings,
  AccountCircle,
  Logout,
  Settings,
  Login,
  PersonAdd
} from "@mui/icons-material"
import { motion, AnimatePresence } from "framer-motion"
import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext" // Import your auth context

const Navigation = () => {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [language, setLanguage] = useState("EN")
  const [userMenuAnchor, setUserMenuAnchor] = useState(null) // For user dropdown menu
  const navigate = useNavigate()
  const location = useLocation()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  
  // Get auth state
  const { user, logout, isAuthenticated } = useAuth()

  // Enhanced color palette with CSS custom properties support
  const colors = {
    primary: 'var(--nav-primary, #1e3a5f)',
    primaryLight: 'var(--nav-primary-light, #2c5282)',
    secondary: 'var(--nav-secondary, #f6a821)',
    accent: 'var(--nav-accent, #3d5a80)',
    background: 'var(--nav-background, #f8fafc)',
    surface: 'var(--nav-surface, #ffffff)',
    text: 'var(--nav-text, #2d3748)',
    textSecondary: 'var(--nav-text-secondary, #718096)',
    gradient: {
      primary: 'var(--nav-gradient-primary, linear-gradient(135deg, #1e3a5f 0%, #2c5282 50%, #3d5a80 100%))',
      secondary: 'var(--nav-gradient-secondary, linear-gradient(45deg, #ffffff 30%, #f6a821 90%))'
    }
  }

  // Language toggle function
  const toggleLanguage = () => {
    setLanguage(prev => {
      if (prev === "EN") return "HI"
      if (prev === "HI") return "MR"
      return "EN"
    })
  }

  // User menu handlers
  const handleUserMenuOpen = (event) => {
    setUserMenuAnchor(event.currentTarget)
  }

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null)
  }

  const handleLogout = async () => {
    handleUserMenuClose()
    await logout()
    navigate("/")
  }

  // Enhanced content with icons
  const getContent = () => {
    const iconMap = {
      home: <Home sx={{ mr: 1, fontSize: '20px' }} />,
      profile: <Person sx={{ mr: 1, fontSize: '20px' }} />,
      recommendations: <Recommend sx={{ mr: 1, fontSize: '20px' }} />,
      admin: <AdminPanelSettings sx={{ mr: 1, fontSize: '20px' }} />
    }

    switch(language) {
      case "HI":
        return {
          title: "PMIS सिफारिश इंजन",
          signIn: "साइन इन",
          signUp: "साइन अप",
          logout: "लॉग आउट",
          profile: "प्रोफाइल",
          settings: "सेटिंग्स",
          hello: "नमस्ते",
          menuItems: [
            { label: "होम", path: "/", icon: iconMap.home },
            { label: "प्रोफाइल", path: "/profile", icon: iconMap.profile },
            { label: "सिफारिशें", path: "/recommendations", icon: iconMap.recommendations },
            { label: "एडमिन", path: "/admin", icon: iconMap.admin },
          ]
        }
      case "MR":
        return {
          title: "PMIS शिफारस इंजिन",
          signIn: "साइन इन",
          signUp: "साइन अप",
          logout: "लॉग आउट",
          profile: "प्रोफाईल",
          settings: "सेटिंग्स",
          hello: "नमस्कार",
          menuItems: [
            { label: "होम", path: "/", icon: iconMap.home },
            { label: "प्रोफाईल", path: "/profile", icon: iconMap.profile },
            { label: "शिफारसे", path: "/recommendations", icon: iconMap.recommendations },
            { label: "अॅडमिन", path: "/admin", icon: iconMap.admin },
          ]
        }
      default:
        return {
          title: "PMIS Recommendation Engine",
          signIn: "Sign In",
          signUp: "Sign Up", 
          logout: "Logout",
          profile: "Profile",
          settings: "Settings",
          hello: "Hello",
          menuItems: [
            { label: "Home", path: "/", icon: iconMap.home },
            { label: "Profile", path: "/profile", icon: iconMap.profile },
            { label: "Recommendations", path: "/recommendations", icon: iconMap.recommendations },
            { label: "Admin", path: "/admin", icon: iconMap.admin },
          ]
        }
    }
  }

  const content = getContent()

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const handleNavigation = (path) => {
    navigate(path)
    setMobileOpen(false)
  }

  // Get user display name
  const getUserDisplayName = () => {
    if (!user) return ""
    return user.name || user.email || "User"
  }

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user) return "?"
    const name = user.name || user.email || "User"
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2)
  }

  // Auth buttons component
  const AuthButtons = ({ isMobile = false }) => {
    if (isAuthenticated && user) {
      return (
        <Box display="flex" alignItems="center" gap={isMobile ? 1 : 2}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Tooltip title={`${content.hello}, ${getUserDisplayName()}`}>
              <Box display="flex" alignItems="center" gap={1}>
                <Avatar
                  sx={{
                    bgcolor: colors.secondary,
                    color: 'white',
                    width: 40,
                    height: 40,
                    fontSize: '0.9rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'scale(1.1)',
                      boxShadow: '0 4px 20px rgba(246, 168, 33, 0.4)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                  onClick={handleUserMenuOpen}
                >
                  {getUserInitials()}
                </Avatar>
                {!isMobile && (
                  <Typography
                    variant="body1"
                    sx={{
                      color: 'white',
                      fontWeight: 500,
                      cursor: 'pointer',
                      '&:hover': { color: colors.secondary }
                    }}
                    onClick={handleUserMenuOpen}
                  >
                    {content.hello}, {getUserDisplayName()}
                  </Typography>
                )}
              </Box>
            </Tooltip>
          </motion.div>
        </Box>
      )
    }

    return (
      <Box display="flex" gap={isMobile ? 1 : 1}>
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Button
            color="inherit"
            onClick={() => navigate("/login")}
            startIcon={<Login />}
            sx={{
              px: isMobile ? 2 : 2.5,
              py: 1.2,
              borderRadius: '12px',
              fontWeight: 600,
              fontSize: '0.9rem',
              textTransform: 'none',
              bgcolor: 'rgba(255,255,255,0.1)',
              border: `2px solid ${colors.secondary}40`,
              "&:hover": {
                bgcolor: 'rgba(255,255,255,0.2)',
                borderColor: colors.secondary,
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 25px rgba(255,255,255,0.15)'
              },
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            {content.signIn}
          </Button>
        </motion.div>
        <motion.div
          initial={{ x: 30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Button
            color="inherit"
            onClick={() => navigate("/register")}
            startIcon={<PersonAdd />}
            sx={{
              px: isMobile ? 2 : 2.5,
              py: 1.2,
              borderRadius: '12px',
              fontWeight: 600,
              fontSize: '0.9rem',
              textTransform: 'none',
              bgcolor: colors.secondary,
              color: 'white',
              "&:hover": {
                bgcolor: colors.accent,
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 25px rgba(246, 168, 33, 0.4)'
              },
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            {content.signUp}
          </Button>
        </motion.div>
      </Box>
    )
  }

  // Enhanced drawer with authentication
  const drawer = (
    <Box 
      className="nav-drawer"
      sx={{ 
        width: 280, 
        height: '100%',
        background: `linear-gradient(135deg, ${colors.surface} 0%, #f1f5f9 100%)`,
        borderLeft: `3px solid ${colors.secondary}`,
      }}
    >
      {/* Drawer Header */}
      <Box 
        className="nav-drawer-header"
        sx={{
          p: 3,
          borderBottom: `1px solid ${colors.accent}20`,
          background: colors.gradient.primary,
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <Tooltip title={`Switch Language - Current: ${language}`}>
              <IconButton 
                onClick={toggleLanguage}
                className="nav-language-toggle-mobile"
                sx={{ 
                  bgcolor: colors.secondary,
                  color: 'white',
                  '&:hover': { 
                    bgcolor: colors.secondary,
                    transform: 'scale(1.1) rotate(360deg)',
                    boxShadow: '0 8px 25px rgba(246, 168, 33, 0.3)'
                  },
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  width: 40,
                  height: 40
                }}
              >
                <Translate fontSize="small" />
              </IconButton>
            </Tooltip>
            <Chip 
              label={language} 
              className="nav-language-chip-mobile"
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.15)',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '12px',
                borderRadius: '12px',
                minWidth: '50px',
                backdropFilter: 'blur(10px)'
              }}
            />
          </Box>
          <IconButton 
            onClick={handleDrawerToggle}
            className="nav-close-button"
            sx={{
              color: 'white',
              '&:hover': { 
                bgcolor: 'rgba(255,255,255,0.1)',
                transform: 'rotate(90deg)'
              },
              transition: 'all 0.2s ease'
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        {/* User info or auth buttons in drawer */}
        {isAuthenticated && user ? (
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <Avatar
              sx={{
                bgcolor: colors.secondary,
                color: 'white',
                width: 45,
                height: 45,
                fontSize: '1rem',
                fontWeight: 'bold'
              }}
            >
              {getUserInitials()}
            </Avatar>
            <Box>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: 'white', 
                  fontWeight: 600,
                  fontSize: '0.95rem'
                }}
              >
                {content.hello}!
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'rgba(255,255,255,0.8)', 
                  fontSize: '0.85rem'
                }}
              >
                {getUserDisplayName()}
              </Typography>
            </Box>
          </Box>
        ) : (
          <Box sx={{ mt: 2 }}>
            <AuthButtons isMobile={true} />
          </Box>
        )}

        <Typography 
          variant="h6" 
          sx={{ 
            color: 'white', 
            fontWeight: 600,
            fontSize: '1.1rem'
          }}
        >
          Navigation
        </Typography>
      </Box>

      {/* Menu Items */}
      <List sx={{ p: 2 }}>
        <AnimatePresence>
          {content.menuItems.map((item, index) => (
            <motion.div
              key={item.path}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ delay: index * 0.1 }}
            >
              <ListItem
                button
                onClick={() => handleNavigation(item.path)}
                className={`nav-menu-item ${location.pathname === item.path ? 'nav-menu-item-active' : ''}`}
                sx={{
                  mb: 1,
                  borderRadius: '12px',
                  bgcolor: location.pathname === item.path ? 
                    `${colors.secondary}15` : "transparent",
                  border: location.pathname === item.path ? 
                    `2px solid ${colors.secondary}` : '2px solid transparent',
                  "&:hover": { 
                    bgcolor: `${colors.primary}10`,
                    transform: 'translateX(8px)',
                    boxShadow: `0 4px 20px ${colors.primary}20`
                  },
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                <Box display="flex" alignItems="center" width="100%">
                  <Box 
                    className="nav-menu-icon"
                    sx={{ 
                      color: location.pathname === item.path ? colors.secondary : colors.text 
                    }}
                  >
                    {item.icon}
                  </Box>
                  <ListItemText 
                    primary={item.label}
                    sx={{
                      '& .MuiListItemText-primary': {
                        fontWeight: location.pathname === item.path ? 600 : 500,
                        color: location.pathname === item.path ? colors.secondary : colors.text,
                        fontSize: '0.95rem'
                      }
                    }}
                  />
                </Box>
              </ListItem>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Logout button in mobile drawer */}
        {isAuthenticated && user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Divider sx={{ my: 2, bgcolor: `${colors.accent}30` }} />
            <ListItem
              button
              onClick={handleLogout}
              sx={{
                borderRadius: '12px',
                bgcolor: 'rgba(239, 68, 68, 0.1)',
                border: '2px solid rgba(239, 68, 68, 0.3)',
                "&:hover": { 
                  bgcolor: 'rgba(239, 68, 68, 0.2)',
                  transform: 'translateX(8px)',
                  boxShadow: '0 4px 20px rgba(239, 68, 68, 0.2)'
                },
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              <Box display="flex" alignItems="center" width="100%">
                <Logout sx={{ mr: 1, fontSize: '20px', color: '#ef4444' }} />
                <ListItemText 
                  primary={content.logout}
                  sx={{
                    '& .MuiListItemText-primary': {
                      fontWeight: 600,
                      color: '#ef4444',
                      fontSize: '0.95rem'
                    }
                  }}
                />
              </Box>
            </ListItem>
          </motion.div>
        )}
      </List>
    </Box>
  )

  return (
    <>
      <AppBar 
        position="sticky" 
        elevation={0}
        className="nav-appbar"
        sx={{
          background: colors.gradient.primary,
          backdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${colors.secondary}30`,
          boxShadow: '0 8px 32px rgba(30, 58, 95, 0.15)',
        }}
      >
        <Toolbar sx={{ minHeight: '70px !important', px: { xs: 2, md: 4 } }}>
          <motion.div 
            initial={{ x: -30, opacity: 0 }} 
            animate={{ x: 0, opacity: 1 }} 
            transition={{ duration: 0.6, ease: "easeOut" }}
            whileHover={{ scale: 1.02 }}
          >
            <Typography
              variant="h5"
              component="div"
              className="nav-title"
              sx={{ 
                cursor: "pointer",
                fontWeight: 700,
                background: colors.gradient.secondary,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: { xs: '1.3rem', md: '1.5rem' },
                letterSpacing: '0.5px',
                transition: 'all 0.3s ease'
              }}
              onClick={() => navigate("/")}
            >
              {content.title}
            </Typography>
          </motion.div>

          <Box sx={{ flexGrow: 1 }} />

          {isMobile ? (
            <Box display="flex" alignItems="center" gap={1}>
              {/* Auth buttons for mobile - show in header if not authenticated */}
              {!isAuthenticated && (
                <Box display="flex" gap={0.5} mr={1}>
                  <Button
                    size="small"
                    onClick={() => navigate("/login")}
                    sx={{
                      color: 'white',
                      fontSize: '0.75rem',
                      minWidth: 'auto',
                      px: 1.5,
                      py: 0.5,
                      borderRadius: '8px',
                      bgcolor: 'rgba(255,255,255,0.1)',
                      '&:hover': {
                        bgcolor: 'rgba(255,255,255,0.2)',
                      }
                    }}
                  >
                    {content.signIn}
                  </Button>
                  <Button
                    size="small"
                    onClick={() => navigate("/register")}
                    sx={{
                      color: 'white',
                      fontSize: '0.75rem',
                      minWidth: 'auto',
                      px: 1.5,
                      py: 0.5,
                      borderRadius: '8px',
                      bgcolor: colors.secondary,
                      '&:hover': {
                        bgcolor: colors.accent,
                      }
                    }}
                  >
                    {content.signUp}
                  </Button>
                </Box>
              )}
              
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                <IconButton 
                  color="inherit" 
                  aria-label="open drawer" 
                  edge="start" 
                  onClick={handleDrawerToggle}
                  className="nav-mobile-menu-button"
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.1)',
                    '&:hover': { 
                      bgcolor: 'rgba(255,255,255,0.2)',
                      transform: 'scale(1.1)',
                      boxShadow: '0 4px 20px rgba(255,255,255,0.2)'
                    },
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    width: 48,
                    height: 48
                  }}
                >
                  <MenuIcon />
                </IconButton>
              </motion.div>
            </Box>
          ) : (
            <Box display="flex" alignItems="center" gap={2}>
              {/* Desktop Menu Items */}
              <Box display="flex" gap={1}>
                {content.menuItems.map((item, index) => (
                  <motion.div
                    key={item.path}
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 + 0.2 }}
                    whileHover={{ y: -2 }}
                  >
                    <Button
                      color="inherit"
                      onClick={() => handleNavigation(item.path)}
                      startIcon={item.icon}
                      className={`nav-desktop-button ${location.pathname === item.path ? 'nav-desktop-button-active' : ''}`}
                      sx={{
                        px: 2.5,
                        py: 1.2,
                        borderRadius: '12px',
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        textTransform: 'none',
                        position: 'relative',
                        bgcolor: location.pathname === item.path ? 
                          'rgba(255,255,255,0.15)' : "transparent",
                        color: location.pathname === item.path ? colors.secondary : 'white',
                        "&:hover": { 
                          bgcolor: 'rgba(255,255,255,0.2)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 8px 25px rgba(255,255,255,0.15)'
                        },
                        "&:after": {
                          content: '""',
                          position: 'absolute',
                          bottom: 0,
                          left: '50%',
                          width: location.pathname === item.path ? '80%' : '0%',
                          height: '3px',
                          bgcolor: colors.secondary,
                          transform: 'translateX(-50%)',
                          borderRadius: '2px',
                          transition: 'width 0.3s ease'
                        },
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      }}
                    >
                      {item.label}
                    </Button>
                  </motion.div>
                ))}
              </Box>

              {/* Auth Section - Desktop */}
              <Box display="flex" alignItems="center" gap={2} ml={2}>
                <AuthButtons />
                
                {/* Language Toggle - Desktop */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <Box display="flex" alignItems="center" gap={1.5}>
                    <Tooltip title={`Switch Language - Current: ${language}`} arrow>
                      <IconButton 
                        onClick={toggleLanguage}
                        className="nav-language-toggle-desktop"
                        sx={{ 
                          bgcolor: 'rgba(255,255,255,0.1)',
                          color: 'white',
                          backdropFilter: 'blur(10px)',
                          border: `2px solid ${colors.secondary}40`,
                          '&:hover': { 
                            bgcolor: colors.secondary,
                            transform: 'scale(1.1) rotate(360deg)',
                            boxShadow: '0 8px 25px rgba(246, 168, 33, 0.4)'
                          },
                          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                          width: 48,
                          height: 48
                        }}
                      >
                        <Translate />
                      </IconButton>
                    </Tooltip>
                    <Chip 
                      label={language} 
                      variant="outlined"
                      size="medium"
                      className="nav-language-chip-desktop"
                      sx={{ 
                        color: 'white',
                        borderColor: colors.secondary,
                        bgcolor: 'rgba(246, 168, 33, 0.1)',
                        fontSize: '13px',
                        fontWeight: 'bold',
                        minWidth: '55px',
                        backdropFilter: 'blur(10px)',
                        '&:hover': {
                          bgcolor: 'rgba(246, 168, 33, 0.2)',
                          transform: 'scale(1.05)'
                        },
                        transition: 'all 0.2s ease'
                      }}
                    />
                  </Box>
                </motion.div>
              </Box>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* User Menu Dropdown */}
      <Menu
        anchorEl={userMenuAnchor}
        open={Boolean(userMenuAnchor)}
        onClose={handleUserMenuClose}
        onClick={handleUserMenuClose}
        PaperProps={{
          elevation: 8,
          sx: {
            mt: 1.5,
            borderRadius: 2,
            minWidth: 200,
            border: `1px solid ${colors.secondary}30`,
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {isAuthenticated && user && (
          <div>
            <MenuItem onClick={() => navigate('/profile')}>
              <Avatar sx={{ bgcolor: colors.secondary }}>{getUserInitials()}</Avatar>
              {content.profile}
            </MenuItem>
            <MenuItem onClick={() => navigate('/settings')}>
              <Avatar sx={{ bgcolor: colors.accent }}>
                <Settings fontSize="small" />
              </Avatar>
              {content.settings}
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout} sx={{ color: '#ef4444' }}>
              <Avatar sx={{ bgcolor: '#ef4444' }}>
                <Logout fontSize="small" />
              </Avatar>
              {content.logout}
            </MenuItem>
          </div>
        )}
      </Menu>

      <Drawer
        variant="temporary"
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        SlideProps={{
          direction: "left"
        }}
        sx={{
          '& .MuiDrawer-paper': {
            boxShadow: '-10px 0 30px rgba(0,0,0,0.15)',
            backdropFilter: 'blur(20px)',
          }
        }}
      >
        <Slide direction="left" in={mobileOpen} mountOnEnter unmountOnExit>
          {drawer}
        </Slide>
      </Drawer>

      {/* Your existing CSS styles remain the same */}
      <style jsx global>{`
        /* CSS Custom Properties for Navigation Color System */
        :root {
          --nav-primary: #1e3a5f;
          --nav-primary-light: #2c5282;
          --nav-secondary: #f6a821;
          --nav-accent: #3d5a80;
          --nav-background: #f8fafc;
          --nav-surface: #ffffff;
          --nav-text: #2d3748;
          --nav-text-secondary: #718096;
          --nav-gradient-primary: linear-gradient(135deg, #1e3a5f 0%, #2c5282 50%, #3d5a80 100%);
          --nav-gradient-secondary: linear-gradient(45deg, #ffffff 30%, #f6a821 90%);
        }

        /* Your existing high contrast and other styles remain the same */
        .high-contrast {
          --nav-primary: var(--background-paper) !important;
          --nav-primary-light: var(--background-paper) !important;
          --nav-secondary: var(--accent-color) !important;
          --nav-accent: var(--accent-color) !important;
          --nav-background: var(--background-default) !important;
          --nav-surface: var(--background-paper) !important;
          --nav-text: var(--text-primary) !important;
          --nav-text-secondary: var(--text-secondary) !important;
          --nav-gradient-primary: var(--background-paper) !important;
          --nav-gradient-secondary: var(--accent-color) !important;
        }

        /* All your existing CSS styles remain unchanged */
      `}</style>
    </>
  )
}

export default Navigation
