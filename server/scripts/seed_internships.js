/**
 * Seed script for internships
 * Creates sample internship data for testing and development
 */

const mongoose = require("mongoose")
const config = require("../src/config")
const Internship = require("../src/models/Internship")
const { logger } = require("../src/logger/logger")

// Sample data
const companies = [
  { name: "TechCorp Solutions", logo: "https://via.placeholder.com/100x100?text=TC", rating: 4.2, reliability: 85 },
  { name: "InnovateLabs", logo: "https://via.placeholder.com/100x100?text=IL", rating: 4.5, reliability: 90 },
  { name: "DataDriven Inc", logo: "https://via.placeholder.com/100x100?text=DD", rating: 4.0, reliability: 80 },
  { name: "WebWorks Studio", logo: "https://via.placeholder.com/100x100?text=WW", rating: 4.3, reliability: 88 },
  {
    name: "CloudFirst Technologies",
    logo: "https://via.placeholder.com/100x100?text=CF",
    rating: 4.1,
    reliability: 82,
  },
  { name: "MobileMax Solutions", logo: "https://via.placeholder.com/100x100?text=MM", rating: 4.4, reliability: 87 },
  { name: "AI Ventures", logo: "https://via.placeholder.com/100x100?text=AI", rating: 4.6, reliability: 92 },
  { name: "StartupHub", logo: "https://via.placeholder.com/100x100?text=SH", rating: 3.9, reliability: 75 },
]

const locations = [
  { district: "Pune", state: "Maharashtra", coordinates: [73.8567, 18.5204] },
  { district: "Mumbai", state: "Maharashtra", coordinates: [72.8777, 19.076] },
  { district: "Kolhapur", state: "Maharashtra", coordinates: [74.2433, 16.705] },
  { district: "Nashik", state: "Maharashtra", coordinates: [73.7898, 19.9975] },
  { district: "Nagpur", state: "Maharashtra", coordinates: [79.0882, 21.1458] },
  { district: "Bangalore", state: "Karnataka", coordinates: [77.5946, 12.9716] },
  { district: "Hyderabad", state: "Telangana", coordinates: [78.4867, 17.385] },
  { district: "Chennai", state: "Tamil Nadu", coordinates: [80.2707, 13.0827] },
]

const sectors = ["Technology", "Finance", "Healthcare", "Education", "Marketing", "Sales", "Operations", "Design"]

const skillSets = {
  Technology: ["javascript", "python", "react", "nodejs", "html", "css", "mongodb", "sql", "git"],
  Finance: ["excel", "accounting", "financial-analysis", "tally", "sap", "powerbi"],
  Healthcare: ["medical-knowledge", "patient-care", "medical-software", "healthcare-management"],
  Education: ["teaching", "curriculum-development", "educational-technology", "assessment"],
  Marketing: ["digital-marketing", "social-media", "content-writing", "seo", "google-ads", "analytics"],
  Sales: ["sales", "crm", "lead-generation", "customer-service", "negotiation"],
  Operations: ["project-management", "process-improvement", "supply-chain", "logistics"],
  Design: ["photoshop", "illustrator", "figma", "ui-design", "ux-design", "graphic-design"],
}

const jobTitles = {
  Technology: [
    "Frontend Developer Intern",
    "Backend Developer Intern",
    "Full Stack Developer Intern",
    "Mobile App Developer Intern",
    "Data Analyst Intern",
    "QA Testing Intern",
    "DevOps Intern",
    "UI/UX Designer Intern",
    "Machine Learning Intern",
  ],
  Finance: [
    "Financial Analyst Intern",
    "Accounting Intern",
    "Investment Research Intern",
    "Risk Management Intern",
    "Tax Consultant Intern",
    "Audit Intern",
  ],
  Healthcare: [
    "Healthcare Management Intern",
    "Medical Research Intern",
    "Clinical Data Intern",
    "Healthcare IT Intern",
    "Pharmaceutical Intern",
  ],
  Education: [
    "Teaching Assistant Intern",
    "Curriculum Development Intern",
    "EdTech Intern",
    "Training Coordinator Intern",
    "Educational Content Intern",
  ],
  Marketing: [
    "Digital Marketing Intern",
    "Content Marketing Intern",
    "Social Media Intern",
    "SEO Specialist Intern",
    "Brand Management Intern",
    "Market Research Intern",
  ],
  Sales: [
    "Sales Development Intern",
    "Business Development Intern",
    "Customer Success Intern",
    "Inside Sales Intern",
    "Account Management Intern",
  ],
  Operations: [
    "Operations Management Intern",
    "Supply Chain Intern",
    "Project Coordinator Intern",
    "Process Improvement Intern",
    "Logistics Intern",
  ],
  Design: [
    "Graphic Design Intern",
    "UI/UX Design Intern",
    "Product Design Intern",
    "Visual Design Intern",
    "Brand Design Intern",
  ],
}

const generateInternshipDescription = (title, company, sector) => {
  const descriptions = {
    Technology: `Join ${company} as a ${title} and work on cutting-edge projects using modern technologies. You'll collaborate with experienced developers, contribute to real products, and gain hands-on experience in software development.`,
    Finance: `${company} is seeking a ${title} to support our finance team. You'll gain exposure to financial analysis, reporting, and strategic planning while working with industry-standard tools and methodologies.`,
    Healthcare: `As a ${title} at ${company}, you'll contribute to improving healthcare outcomes through technology and innovation. This role offers exposure to healthcare systems, patient data management, and medical research.`,
    Education: `Join ${company} as a ${title} and help shape the future of education. You'll work on educational content, learning platforms, and innovative teaching methodologies.`,
    Marketing: `${company} is looking for a creative ${title} to join our marketing team. You'll work on campaigns, content creation, and digital marketing strategies to reach our target audience.`,
    Sales: `As a ${title} at ${company}, you'll learn the fundamentals of sales, customer relationship management, and business development in a supportive environment.`,
    Operations: `Join ${company} as a ${title} and gain experience in operational excellence, process optimization, and project management across various business functions.`,
    Design: `${company} seeks a talented ${title} to join our design team. You'll work on user experience, visual design, and creative projects that impact thousands of users.`,
  }

  return (
    descriptions[sector] ||
    `Join ${company} as a ${title} and gain valuable industry experience in ${sector.toLowerCase()}.`
  )
}

const generateRandomInternship = () => {
  const company = companies[Math.floor(Math.random() * companies.length)]
  const location = locations[Math.floor(Math.random() * locations.length)]
  const sector = sectors[Math.floor(Math.random() * sectors.length)]
  const titles = jobTitles[sector]
  const title = titles[Math.floor(Math.random() * titles.length)]
  const skills = skillSets[sector]

  // Random selection of 2-5 skills
  const requiredSkills = []
  const numSkills = Math.floor(Math.random() * 4) + 2 // 2-5 skills
  const shuffledSkills = [...skills].sort(() => 0.5 - Math.random())
  for (let i = 0; i < Math.min(numSkills, shuffledSkills.length); i++) {
    requiredSkills.push(shuffledSkills[i])
  }

  const stipend = Math.floor(Math.random() * 20000) + 5000 // 5000-25000
  const duration = Math.floor(Math.random() * 6) + 3 // 3-8 months
  const daysFromNow = Math.floor(Math.random() * 60) + 30 // 30-90 days

  return {
    title,
    companyName: company.name,
    companyLogoUrl: company.logo,
    description: generateInternshipDescription(title, company.name, sector),
    location: {
      type: "Point",
      coordinates: location.coordinates,
      district: location.district,
      state: location.state,
      address: `${Math.floor(Math.random() * 999) + 1}, Business District, ${location.district}`,
      pincode: `${Math.floor(Math.random() * 90000) + 10000}`,
    },
    stipend,
    durationMonths: duration,
    requiredSkills,
    sector,
    flags: {
      remote: Math.random() > 0.7, // 30% remote
      beginner: Math.random() > 0.6, // 40% beginner-friendly
      partTime: Math.random() > 0.8, // 20% part-time
      urgent: Math.random() > 0.9, // 10% urgent
      verified: Math.random() > 0.3, // 70% verified
    },
    postedAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000), // Posted within last 30 days
    expiresAt: new Date(Date.now() + daysFromNow * 24 * 60 * 60 * 1000),
    startDate: new Date(Date.now() + (daysFromNow + 7) * 24 * 60 * 60 * 1000),
    extra: {
      contactEmail: `hr@${company.name.toLowerCase().replace(/\s+/g, "")}.com`,
      contactPhone: `+91${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      requirements: [
        "Strong communication skills",
        "Willingness to learn",
        "Team player attitude",
        "Basic computer skills",
      ],
      benefits: ["Certificate of completion", "Mentorship program", "Flexible working hours", "Learning opportunities"],
      workingHours: "9 AM - 6 PM (Monday to Friday)",
    },
    analytics: {
      totalApplications: Math.floor(Math.random() * 50),
      totalViews: Math.floor(Math.random() * 200) + 50,
      successfulHires: Math.floor(Math.random() * 5),
      completionRate: Math.floor(Math.random() * 30) + 70, // 70-100%
    },
    company: {
      size: ["startup", "small", "medium", "large"][Math.floor(Math.random() * 4)],
      industry: sector,
      website: `https://${company.name.toLowerCase().replace(/\s+/g, "")}.com`,
      rating: company.rating,
      reliability: company.reliability,
    },
    metadata: {
      source: "manual",
      tags: [sector.toLowerCase(), location.state.toLowerCase()],
      priority: Math.floor(Math.random() * 5) + 3, // 3-7
    },
  }
}

const seedInternships = async () => {
  try {
    // Connect to database
    await mongoose.connect(config.mongodb.uri, config.mongodb.options)
    logger.info("Connected to MongoDB for seeding internships")

    // Clear existing internships
    await Internship.deleteMany({})
    logger.info("Cleared existing internships")

    // Generate and insert internships
    const internships = []
    const numInternships = 150 // Generate 150 internships

    for (let i = 0; i < numInternships; i++) {
      internships.push(generateRandomInternship())
    }

    await Internship.insertMany(internships)
    logger.info(`✅ Successfully seeded ${numInternships} internships`)

    // Log statistics
    const stats = await Internship.aggregate([
      {
        $group: {
          _id: "$sector",
          count: { $sum: 1 },
          avgStipend: { $avg: "$stipend" },
          remoteCount: { $sum: { $cond: ["$flags.remote", 1, 0] } },
        },
      },
    ])

    logger.info("Internship statistics by sector:", stats)
  } catch (error) {
    logger.error("Error seeding internships:", error)
    process.exit(1)
  } finally {
    await mongoose.connection.close()
    logger.info("Database connection closed")
  }
}

// Run seeding if called directly
if (require.main === module) {
  seedInternships()
}

module.exports = { seedInternships, generateRandomInternship }
