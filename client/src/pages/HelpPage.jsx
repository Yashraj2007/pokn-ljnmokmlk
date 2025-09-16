import { 
                Container, 
                Typography, 
                Button, 
                Box, 
                Card, 
                CardContent, 
                Grid,
                Chip,
                Alert,
                Accordion,
                AccordionSummary,
                AccordionDetails,
                List,
                ListItem,
                ListItemIcon,
                ListItemText,
                Paper,
                Divider,
                Avatar,
                TextField,
                InputAdornment,
                Tabs,
                Tab,
                IconButton,
                Stepper,
                Step,
                StepLabel,
                StepContent
              } from "@mui/material"
              import { motion, useInView } from "framer-motion"
              import { useNavigate } from "react-router-dom"
              import { useState, useRef } from "react"
              import { 
                Help,
                SmartToy,
                AccessibilityNew,
                Analytics,
                Language,
                Phone,
                Sms,
                WhatsApp,
                VolumeUp,
                Search,
                ExpandMore,
                CheckCircle,
                Warning,
                Info,
                School,
                Business,
                Psychology,
                Speed,
                Security,
                ArrowBack,
                Download,
                PlayCircleOutline,
                QuestionAnswer,
                SupportAgent,
                LocationOn,
                Schedule,
                TrendingUp,
                Assignment,
                Group,
                Policy
              } from "@mui/icons-material"
              
              // Using the same color system from HomePage
              const colors = {
                primary: 'var(--color-primary, #1e3a5f)',
                primaryLight: 'var(--color-primary-light, #2c5282)',
                secondary: 'var(--color-secondary, #f6a821)',
                accent: 'var(--color-accent, #3d5a80)',
                success: 'var(--color-success, #16a085)',
                error: 'var(--color-error, #e74c3c)',
                warning: 'var(--color-warning, #f39c12)',
                background: 'var(--color-background, #f8fafc)',
                surface: 'var(--color-surface, #ffffff)',
                text: 'var(--color-text, #2d3748)',
                textSecondary: 'var(--color-text-secondary, #718096)',
                gradient: {
                  primary: 'var(--gradient-primary, linear-gradient(135deg, #1e3a5f 0%, #2c5282 50%, #3d5a80 100%))',
                  secondary: 'var(--gradient-secondary, linear-gradient(135deg, #f6a821 0%, #ff8c42 100%))',
                  success: 'var(--gradient-success, linear-gradient(135deg, #16a085 0%, #1abc9c 100%))',
                  hero: 'var(--gradient-hero, linear-gradient(135deg, #667eea 0%, #764ba2 100%))'
                }
              }
              
              const HelpPage = () => {
                const navigate = useNavigate()
                const [activeTab, setActiveTab] = useState(0)
                const [searchQuery, setSearchQuery] = useState("")
                const [activeStep, setActiveStep] = useState(0)
                
                const headerRef = useRef(null)
                const isHeaderInView = useInView(headerRef, { once: true })
              
                // Comprehensive feature documentation
                const features = [
                  {
                    id: 'ai-predictor',
                    icon: <SmartToy sx={{ fontSize: 40 }} />,
                    title: "AI Attrition Predictor",
                    description: "Machine learning system that predicts dropout risk with 92% accuracy",
                    color: colors.success,
                    details: {
                      overview: "Our XGBoost-powered AI analyzes 15+ factors including distance, stipend, duration, past performance, and student profile to predict completion likelihood.",
                      benefits: [
                        "67% reduction in internship dropouts",
                        "Prevents mismatched placements before they happen",
                        "Explainable AI provides reasoning for each prediction",
                        "Continuous learning improves accuracy over time"
                      ],
                      howToUse: [
                        "System automatically analyzes your profile",
                        "Receives risk score for each internship match",
                        "Shows explanation: 'High completion probability due to skills match + proximity'",
                        "Recommends only high-success-probability positions"
                      ],
                      techSpecs: "XGBoost ML model + SHAP explainability framework"
                    }
                  },
                  {
                    id: 'multi-channel',
                    icon: <AccessibilityNew sx={{ fontSize: 40 }} />,
                    title: "Multi-Channel Access Hub",
                    description: "Reach every youth through SMS, WhatsApp, USSD, and voice calls",
                    color: colors.primary,
                    details: {
                      overview: "Revolutionary accessibility system ensuring no eligible youth is excluded due to device or connectivity limitations.",
                      benefits: [
                        "85% rural penetration achieved",
                        "Works on basic feature phones",
                        "Multiple language support",
                        "Offline capability through USSD"
                      ],
                      howToUse: [
                        "SMS: Send 'PMIS' to 9876543210",
                        "WhatsApp: Message +91-98765-43210",
                        "USSD: Dial *123# on any phone",
                        "Voice: Call 1800-PMIS-HELP"
                      ],
                      techSpecs: "Twilio API + USSD Gateway + Multi-provider redundancy"
                    }
                  },
                  {
                    id: 'analytics',
                    icon: <Analytics sx={{ fontSize: 40 }} />,
                    title: "Government Analytics Dashboard",
                    description: "Real-time policy insights and district-wise performance metrics",
                    color: colors.accent,
                    details: {
                      overview: "Comprehensive analytics platform providing actionable insights for policy makers and administrators.",
                      benefits: [
                        "Real-time internship fill rates by district",
                        "Skill gap analysis and recommendations",
                        "Predictive modeling for future demand",
                        "Export reports for policy decisions"
                      ],
                      howToUse: [
                        "Access through Government Portal login",
                        "Select district/state for detailed view",
                        "Generate custom reports with filters",
                        "Download data in Excel/PDF format"
                      ],
                      techSpecs: "Recharts visualization + Real-time data pipeline"
                    }
                  },
                  {
                    id: 'explainable-ai',
                    icon: <Psychology sx={{ fontSize: 40 }} />,
                    title: "Explainable AI Engine",
                    description: "Transparent recommendations with clear reasoning",
                    color: colors.secondary,
                    details: {
                      overview: "Every recommendation includes detailed explanation of why it was suggested, building trust and understanding.",
                      benefits: [
                        "92% user satisfaction with explanations",
                        "Transparent decision-making process",
                        "Helps users understand their strengths",
                        "Builds confidence in AI recommendations"
                      ],
                      howToUse: [
                        "Each recommendation shows match percentage",
                        "Click 'Why recommended?' for detailed explanation",
                        "View skills alignment and success factors",
                        "Understand what makes a good match"
                      ],
                      techSpecs: "SHAP explainability + Natural Language Generation"
                    }
                  }
                ]
              
                // Comprehensive FAQ data
                const faqs = [
                  {
                    category: "Getting Started",
                    questions: [
                      {
                        q: "How do I create my profile on PMIS SmartMatch+?",
                        a: "Visit the platform, click 'Get Smart Recommendations', fill out your skills, location, and preferences. Our AI will immediately start generating personalized matches."
                      },
                      {
                        q: "What devices can I use to access PMIS SmartMatch+?",
                        a: "Any device! Use smartphones/computers for full experience, or basic phones via SMS (*123#), WhatsApp, or voice calls. No internet? Use USSD on any mobile phone."
                      },
                      {
                        q: "Is the platform available in regional languages?",
                        a: "Yes! Currently supports Hindi, Marathi, and English with more languages being added. Voice support available in 8 Indian languages."
                      }
                    ]
                  },
                  {
                    category: "AI Recommendations",
                    questions: [
                      {
                        q: "How accurate are the AI recommendations?",
                        a: "Our AI achieves 92% match accuracy and has reduced dropouts by 67%. The system learns from successful placements to continuously improve."
                      },
                      {
                        q: "Why was I recommended this specific internship?",
                        a: "Click 'Why recommended?' on any suggestion. You'll see detailed reasoning like: 'Matches your React skills (85%), 12km from home, 89% of similar students completed successfully.'"
                      },
                      {
                        q: "Can I filter recommendations based on my preferences?",
                        a: "Absolutely! Set preferences for location radius, stipend range, duration, and company type. AI respects all your filters while optimizing for success probability."
                      }
                    ]
                  },
                  {
                    category: "Multi-Channel Access",
                    questions: [
                      {
                        q: "How do I apply for internships via SMS?",
                        a: "Send 'PMIS' to 9876543210. You'll receive top matches via SMS. Reply with 'APPLY [number]' to apply, or 'MORE' for additional options."
                      },
                      {
                        q: "What is USSD and how do I use it?",
                        a: "USSD works on any mobile phone without internet. Dial *123# → Select 'Internships' → Browse and apply. Works even on basic Nokia phones!"
                      },
                      {
                        q: "Can I use WhatsApp to get internship updates?",
                        a: "Yes! Message our WhatsApp Bot at +91-98765-43210. Get personalized matches, apply directly, and receive status updates all through WhatsApp."
                      }
                    ]
                  },
                  {
                    category: "Government Users",
                    questions: [
                      {
                        q: "How can I access district-wise analytics?",
                        a: "Government users get special dashboard access. Login with official credentials → Analytics → Select your district/state for detailed metrics and reports."
                      },
                      {
                        q: "Can I export data for policy reports?",
                        a: "Yes! Generate custom reports with date ranges, filters, and export in Excel/PDF. Perfect for policy presentations and administrative reviews."
                      },
                      {
                        q: "How often is the data updated?",
                        a: "Real-time updates! Dashboard refreshes every 5 minutes with latest applications, completions, and analytics. Historical data available for trend analysis."
                      }
                    ]
                  }
                ]
              
                // Step-by-step guides
                const userGuides = [
                  {
                    title: "For Students - Getting Your First AI Match",
                    steps: [
                      {
                        label: "Create Your Profile",
                        description: "Fill out skills, education, location, and preferences. The more detailed, the better your matches!",
                        icon: <School />
                      },
                      {
                        label: "Review AI Recommendations",
                        description: "Get personalized matches with success probability and detailed explanations for each suggestion.",
                        icon: <SmartToy />
                      },
                      {
                        label: "Apply with Confidence",
                        description: "Apply to high-probability matches. Track application status and get interview preparation tips.",
                        icon: <Assignment />
                      },
                      {
                        label: "Complete Successfully",
                        description: "Follow our completion tips and contribute to the 67% improvement in success rates!",
                        icon: <CheckCircle />
                      }
                    ]
                  },
                  {
                    title: "For Government Officials - Analytics Dashboard",
                    steps: [
                      {
                        label: "Access Dashboard",
                        description: "Login with government credentials to access district/state level analytics and insights.",
                        icon: <Analytics />
                      },
                      {
                        label: "Analyze Performance",
                        description: "View real-time fill rates, skill gaps, and success metrics for your jurisdiction.",
                        icon: <TrendingUp />
                      },
                      {
                        label: "Generate Reports",
                        description: "Create custom reports with filters for dates, districts, and sectors. Export for presentations.",
                        icon: <Policy />
                      },
                      {
                        label: "Make Data-Driven Decisions",
                        description: "Use predictive insights to optimize internship programs and policy interventions.",
                        icon: <Business />
                      }
                    ]
                  }
                ]
              
                // Contact methods
                const contactMethods = [
                  {
                    icon: <SupportAgent sx={{ fontSize: 40 }} />,
                    title: "Live Chat Support",
                    description: "Instant help from our AI assistant",
                    action: "Start Chat",
                    available: "24/7 Available",
                    color: colors.success
                  },
                  {
                    icon: <Phone sx={{ fontSize: 40 }} />,
                    title: "Helpline",
                    description: "1800-PMIS-HELP (Free)",
                    action: "Call Now",
                    available: "9 AM - 9 PM",
                    color: colors.primary
                  },
                  {
                    icon: <WhatsApp sx={{ fontSize: 40 }} />,
                    title: "WhatsApp Support",
                    description: "+91-98765-43210",
                    action: "Message",
                    available: "Instant Response",
                    color: '#25D366'
                  },
                  {
                    icon: <Sms sx={{ fontSize: 40 }} />,
                    title: "SMS Help",
                    description: "Send HELP to 9876543210",
                    action: "Send SMS",
                    available: "Auto-Reply",
                    color: colors.secondary
                  }
                ]
              
                const handleTabChange = (event, newValue) => {
                  setActiveTab(newValue)
                }
              
                const filteredFAQs = faqs.map(category => ({
                  ...category,
                  questions: category.questions.filter(faq =>
                    faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    faq.a.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                })).filter(category => category.questions.length > 0)
              
                return (
                  <Box 
                    sx={{ 
                      background: `linear-gradient(180deg, ${colors.background} 0%, ${colors.surface} 100%)`, 
                      minHeight: '100vh',
                      color: colors.text
                    }}
                  >
                    <Container maxWidth="xl" sx={{ py: 4 }}>
                      {/* Header Section */}
                      <motion.div
                        ref={headerRef}
                        initial={{ y: -30, opacity: 0 }}
                        animate={isHeaderInView ? { y: 0, opacity: 1 } : {}}
                        transition={{ duration: 0.8 }}
                      >
                        <Box mb={6}>
                          <Button
                            startIcon={<ArrowBack />}
                            onClick={() => navigate("/")}
                            sx={{ mb: 3, color: colors.primary }}
                          >
                            Back to Home
                          </Button>
                          
                          <Box textAlign="center">
                            <Typography 
                              variant="h2" 
                              gutterBottom
                              sx={{ 
                                fontWeight: 800,
                                background: colors.gradient.hero,
                                backgroundClip: 'text',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                fontSize: { xs: '3rem', md: '4rem' }
                              }}
                            >
                              Help & Support Center
                            </Typography>
                            <Typography variant="h6" color="text.secondary" mb={4}>
                              Everything you need to master PMIS SmartMatch+ and revolutionize your internship experience
                            </Typography>
                            
                            {/* Search Bar */}
                            <Paper sx={{ maxWidth: 600, mx: 'auto', mb: 4 }}>
                              <TextField
                                fullWidth
                                placeholder="Search for help articles, features, or FAQs..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      <Search color="action" />
                                    </InputAdornment>
                                  ),
                                }}
                                sx={{ 
                                  '& .MuiOutlinedInput-root': {
                                    borderRadius: '12px',
                                    '& fieldset': { border: 'none' },
                                  }
                                }}
                              />
                            </Paper>
                          </Box>
                        </Box>
                      </motion.div>
              
                      {/* Quick Action Cards */}
                      <motion.div
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                      >
                        <Grid container spacing={3} mb={8}>
                          {contactMethods.map((method, index) => (
                            <Grid item xs={12} sm={6} md={3} key={index}>
                              <Card
                                sx={{
                                  p: 3,
                                  textAlign: 'center',
                                  height: '100%',
                                  cursor: 'pointer',
                                  transition: 'all 0.3s ease',
                                  border: `2px solid transparent`,
                                  '&:hover': {
                                    transform: 'translateY(-8px)',
                                    border: `2px solid ${method.color}`,
                                    boxShadow: `0 12px 40px ${method.color}30`
                                  }
                                }}
                              >
                                <Avatar
                                  sx={{
                                    bgcolor: method.color,
                                    width: 60,
                                    height: 60,
                                    mx: 'auto',
                                    mb: 2
                                  }}
                                >
                                  {method.icon}
                                </Avatar>
                                <Typography variant="h6" fontWeight="bold" mb={1}>
                                  {method.title}
                                </Typography>
                                <Typography color="text.secondary" mb={2}>
                                  {method.description}
                                </Typography>
                                <Chip 
                                  label={method.available}
                                  size="small"
                                  sx={{ 
                                    bgcolor: `${method.color}20`,
                                    color: method.color,
                                    fontWeight: 'bold',
                                    mb: 2
                                  }}
                                />
                                <Button
                                  variant="contained"
                                  fullWidth
                                  sx={{
                                    bgcolor: method.color,
                                    '&:hover': { bgcolor: method.color }
                                  }}
                                >
                                  {method.action}
                                </Button>
                              </Card>
                            </Grid>
                          ))}
                        </Grid>
                      </motion.div>
              
                      {/* Main Content Tabs */}
                      <Card sx={{ borderRadius: '20px', overflow: 'hidden' }}>
                        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                          <Tabs 
                            value={activeTab} 
                            onChange={handleTabChange}
                            variant="scrollable"
                            scrollButtons="auto"
                            sx={{
                              '& .MuiTab-root': {
                                fontWeight: 600,
                                fontSize: '1rem',
                                textTransform: 'none'
                              }
                            }}
                          >
                            <Tab icon={<Help />} label="Platform Features" />
                            <Tab icon={<QuestionAnswer />} label="FAQs" />
                            <Tab icon={<PlayCircleOutline />} label="User Guides" />
                            <Tab icon={<Download />} label="Resources" />
                          </Tabs>
                        </Box>
              
                        {/* Tab Content */}
                        <CardContent sx={{ p: 4 }}>
                          {/* Features Tab */}
                          {activeTab === 0 && (
                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.5 }}
                            >
                              <Typography variant="h4" fontWeight="bold" mb={4} textAlign="center">
                                🚀 Comprehensive Platform Features
                              </Typography>
                              <Grid container spacing={4}>
                                {features.map((feature, index) => (
                                  <Grid item xs={12} key={feature.id}>
                                    <motion.div
                                      initial={{ x: index % 2 === 0 ? -30 : 30, opacity: 0 }}
                                      animate={{ x: 0, opacity: 1 }}
                                      transition={{ duration: 0.6, delay: index * 0.1 }}
                                    >
                                      <Card 
                                        sx={{ 
                                          p: 4, 
                                          border: `2px solid ${feature.color}30`,
                                          borderRadius: '16px',
                                          '&:hover': {
                                            border: `2px solid ${feature.color}`,
                                            transform: 'translateY(-4px)',
                                            boxShadow: `0 12px 40px ${feature.color}20`
                                          },
                                          transition: 'all 0.3s ease'
                                        }}
                                      >
                                        <Grid container spacing={4} alignItems="center">
                                          <Grid item xs={12} md={2} textAlign="center">
                                            <Avatar
                                              sx={{
                                                bgcolor: feature.color,
                                                width: 80,
                                                height: 80,
                                                mx: 'auto'
                                              }}
                                            >
                                              {feature.icon}
                                            </Avatar>
                                          </Grid>
                                          <Grid item xs={12} md={10}>
                                            <Typography variant="h5" fontWeight="bold" mb={2}>
                                              {feature.title}
                                            </Typography>
                                            <Typography color="text.secondary" mb={3} fontSize="1.1rem">
                                              {feature.description}
                                            </Typography>
                                            
                                            <Accordion>
                                              <AccordionSummary expandIcon={<ExpandMore />}>
                                                <Typography fontWeight="bold">View Complete Details</Typography>
                                              </AccordionSummary>
                                              <AccordionDetails>
                                                <Grid container spacing={3}>
                                                  <Grid item xs={12} md={6}>
                                                    <Typography variant="h6" fontWeight="bold" mb={2}>
                                                      📋 Overview
                                                    </Typography>
                                                    <Typography color="text.secondary" mb={3}>
                                                      {feature.details.overview}
                                                    </Typography>
                                                    
                                                    <Typography variant="h6" fontWeight="bold" mb={2}>
                                                      ✅ Key Benefits
                                                    </Typography>
                                                    <List dense>
                                                      {feature.details.benefits.map((benefit, idx) => (
                                                        <ListItem key={idx} sx={{ py: 0.5 }}>
                                                          <ListItemIcon>
                                                            <CheckCircle sx={{ color: colors.success, fontSize: 20 }} />
                                                          </ListItemIcon>
                                                          <ListItemText 
                                                            primary={benefit}
                                                            primaryTypographyProps={{ fontSize: '0.95rem' }}
                                                          />
                                                        </ListItem>
                                                      ))}
                                                    </List>
                                                  </Grid>
                                                  
                                                  <Grid item xs={12} md={6}>
                                                    <Typography variant="h6" fontWeight="bold" mb={2}>
                                                      🎯 How to Use
                                                    </Typography>
                                                    <List dense>
                                                      {feature.details.howToUse.map((step, idx) => (
                                                        <ListItem key={idx} sx={{ py: 0.5 }}>
                                                          <ListItemIcon>
                                                            <Box 
                                                              sx={{ 
                                                                width: 24, 
                                                                height: 24, 
                                                                borderRadius: '50%', 
                                                                bgcolor: feature.color,
                                                                color: 'white',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                fontSize: '0.8rem',
                                                                fontWeight: 'bold'
                                                              }}
                                                            >
                                                              {idx + 1}
                                                            </Box>
                                                          </ListItemIcon>
                                                          <ListItemText 
                                                            primary={step}
                                                            primaryTypographyProps={{ fontSize: '0.95rem' }}
                                                          />
                                                        </ListItem>
                                                      ))}
                                                    </List>
                                                    
                                                    <Paper sx={{ p: 2, mt: 2, bgcolor: `${feature.color}10` }}>
                                                      <Typography variant="subtitle2" fontWeight="bold" mb={1}>
                                                        🔧 Technical Implementation:
                                                      </Typography>
                                                      <Typography variant="body2" color="text.secondary">
                                                        {feature.details.techSpecs}
                                                      </Typography>
                                                    </Paper>
                                                  </Grid>
                                                </Grid>
                                              </AccordionDetails>
                                            </Accordion>
                                          </Grid>
                                        </Grid>
                                      </Card>
                                    </motion.div>
                                  </Grid>
                                ))}
                              </Grid>
                            </motion.div>
                          )}
              
                          {/* FAQs Tab */}
                          {activeTab === 1 && (
                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.5 }}
                            >
                              <Typography variant="h4" fontWeight="bold" mb={4} textAlign="center">
                                ❓ Frequently Asked Questions
                              </Typography>
                              
                              {searchQuery && (
                                <Alert severity="info" sx={{ mb: 4 }}>
                                  {filteredFAQs.reduce((total, cat) => total + cat.questions.length, 0)} results found for "{searchQuery}"
                                </Alert>
                              )}
                              
                              {(searchQuery ? filteredFAQs : faqs).map((category, categoryIndex) => (
                                <motion.div
                                  key={category.category}
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: categoryIndex * 0.1 }}
                                >
                                  <Typography variant="h5" fontWeight="bold" mb={3} color={colors.primary}>
                                    📚 {category.category}
                                  </Typography>
                                  {category.questions.map((faq, faqIndex) => (
                                    <Accordion key={faqIndex} sx={{ mb: 2, borderRadius: '8px' }}>
                                      <AccordionSummary 
                                        expandIcon={<ExpandMore />}
                                        sx={{ '& .MuiTypography-root': { fontWeight: 600 } }}
                                      >
                                        <Typography>{faq.q}</Typography>
                                      </AccordionSummary>
                                      <AccordionDetails>
                                        <Typography color="text.secondary" lineHeight={1.7}>
                                          {faq.a}
                                        </Typography>
                                      </AccordionDetails>
                                    </Accordion>
                                  ))}
                                  <Divider sx={{ my: 4 }} />
                                </motion.div>
                              ))}
                            </motion.div>
                          )}
              
                          {/* User Guides Tab */}
                          {activeTab === 2 && (
                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.5 }}
                            >
                              <Typography variant="h4" fontWeight="bold" mb={4} textAlign="center">
                                📖 Step-by-Step User Guides
                              </Typography>
                              
                              <Grid container spacing={4}>
                                {userGuides.map((guide, guideIndex) => (
                                  <Grid item xs={12} md={6} key={guideIndex}>
                                    <Card sx={{ p: 4, height: '100%', borderRadius: '16px' }}>
                                      <Typography variant="h5" fontWeight="bold" mb={3} color={colors.primary}>
                                        {guide.title}
                                      </Typography>
                                      
                                      <Stepper activeStep={activeStep} orientation="vertical">
                                        {guide.steps.map((step, stepIndex) => (
                                          <Step key={stepIndex}>
                                            <StepLabel
                                              StepIconComponent={() => (
                                                <Avatar
                                                  sx={{
                                                    bgcolor: colors.secondary,
                                                    width: 32,
                                                    height: 32
                                                  }}
                                                >
                                                  {step.icon}
                                                </Avatar>
                                              )}
                                            >
                                              <Typography fontWeight="bold">
                                                {step.label}
                                              </Typography>
                                            </StepLabel>
                                            <StepContent>
                                              <Typography color="text.secondary" mb={2}>
                                                {step.description}
                                              </Typography>
                                            </StepContent>
                                          </Step>
                                        ))}
                                      </Stepper>
                                    </Card>
                                  </Grid>
                                ))}
                              </Grid>
                            </motion.div>
                          )}
              
                          {/* Resources Tab */}
                          {activeTab === 3 && (
                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.5 }}
                            >
                              <Typography variant="h4" fontWeight="bold" mb={4} textAlign="center">
                                📚 Downloads & Resources
                              </Typography>
                              
                              <Grid container spacing={4}>
                                {[
                                  {
                                    title: "PMIS SmartMatch+ User Manual",
                                    description: "Complete guide with screenshots and examples",
                                    type: "PDF",
                                    size: "2.5 MB",
                                    icon: <Assignment />,
                                    color: colors.error
                                  },
                                  {
                                    title: "Multi-Channel Access Guide",
                                    description: "How to use SMS, WhatsApp, USSD, and Voice features",
                                    type: "PDF",
                                    size: "1.8 MB", 
                                    icon: <Phone />,
                                    color: colors.primary
                                  },
                                  {
                                    title: "Government Analytics Manual",
                                    description: "Dashboard usage for policy makers and administrators",
                                    type: "PDF",
                                    size: "3.2 MB",
                                    icon: <Analytics />,
                                    color: colors.accent
                                  },
                                  {
                                    title: "AI Explanation Examples",
                                    description: "Sample AI recommendations with detailed explanations",
                                    type: "PDF",
                                    size: "1.5 MB",
                                    icon: <SmartToy />,
                                    color: colors.success
                                  },
                                  {
                                    title: "Video Tutorial Series",
                                    description: "Complete video walkthrough in Hindi & English",
                                    type: "Video",
                                    size: "Watch Online",
                                    icon: <PlayCircleOutline />,
                                    color: colors.secondary
                                  },
                                  {
                                    title: "Accessibility Features Guide",
                                    description: "High contrast, screen reader, and multilingual support",
                                    type: "PDF",
                                    size: "1.2 MB",
                                    icon: <AccessibilityNew />,
                                    color: colors.warning
                                  }
                                ].map((resource, index) => (
                                  <Grid item xs={12} md={4} key={index}>
                                    <Card
                                      sx={{
                                        p: 3,
                                        height: '100%',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                          transform: 'translateY(-8px)',
                                          boxShadow: `0 12px 40px ${resource.color}20`
                                        }
                                      }}
                                    >
                                      <Avatar
                                        sx={{
                                          bgcolor: resource.color,
                                          width: 60,
                                          height: 60,
                                          mb: 2
                                        }}
                                      >
                                        {resource.icon}
                                      </Avatar>
                                      <Typography variant="h6" fontWeight="bold" mb={2}>
                                        {resource.title}
                                      </Typography>
                                      <Typography color="text.secondary" mb={3}>
                                        {resource.description}
                                      </Typography>
                                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                        <Chip 
                                          label={resource.type}
                                          size="small"
                                          sx={{ bgcolor: `${resource.color}20`, color: resource.color }}
                                        />
                                        <Typography variant="caption" color="text.secondary">
                                          {resource.size}
                                        </Typography>
                                      </Box>
                                      <Button
                                        variant="contained"
                                        fullWidth
                                        startIcon={<Download />}
                                        sx={{
                                          bgcolor: resource.color,
                                          '&:hover': { bgcolor: resource.color }
                                        }}
                                      >
                                        {resource.type === 'Video' ? 'Watch Now' : 'Download'}
                                      </Button>
                                    </Card>
                                  </Grid>
                                ))}
                              </Grid>
                            </motion.div>
                          )}
                        </CardContent>
                      </Card>
              
                      {/* Emergency Support */}
                      <motion.div
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                      >
                        <Card 
                          sx={{ 
                            mt: 6,
                            p: 4, 
                            background: colors.gradient.error,
                            color: 'white',
                            borderRadius: '16px'
                          }}
                        >
                          <Grid container spacing={3} alignItems="center">
                            <Grid item xs={12} md={8}>
                              <Typography variant="h5" fontWeight="bold" mb={2}>
                                🚨 Need Immediate Help?
                              </Typography>
                              <Typography mb={3}>
                                Our support team is available 24/7 for critical issues. Government users get priority support for district-level problems.
                              </Typography>
                              <Box display="flex" gap={2} flexWrap="wrap">
                                <Button 
                                  variant="contained" 
                                  sx={{ bgcolor: 'white', color: colors.error }}
                                  startIcon={<Phone />}
                                >
                                  Emergency Helpline
                                </Button>
                                <Button 
                                  variant="outlined" 
                                  sx={{ borderColor: 'white', color: 'white' }}
                                  startIcon={<SupportAgent />}
                                >
                                  Priority Chat
                                </Button>
                              </Box>
                            </Grid>
                            <Grid item xs={12} md={4} textAlign="center">
                              <Avatar sx={{ bgcolor: 'white', width: 80, height: 80, mx: 'auto' }}>
                                <SupportAgent sx={{ fontSize: 40, color: colors.error }} />
                              </Avatar>
                            </Grid>
                          </Grid>
                        </Card>
                      </motion.div>
                    </Container>
                  </Box>
                )
              }
              
              export default HelpPage
              