# PMIS SmartMatch+ Full-Stack Application

A comprehensive internship management system with AI-powered matching, built with React frontend and Node.js backend.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB (or use Docker)
- Redis (optional, for caching)

### Option 1: Full Development Setup
\`\`\`bash
# Install all dependencies
npm run setup

# Start both frontend and backend
npm run dev:full

# Or start individually:
npm run dev:frontend  # Frontend on http://localhost:3000
npm run dev:backend   # Backend on http://localhost:5000
\`\`\`

### Option 2: Docker Setup (Backend Services)
\`\`\`bash
# Start all backend services with Docker
npm run docker:up

# Start frontend separately
npm run dev:frontend
\`\`\`

### Option 3: Manual Setup
\`\`\`bash
# Frontend
npm install
npm run dev

# Backend (in new terminal)
cd server
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
\`\`\`

## 📁 Project Structure

\`\`\`
├── src/                    # React frontend
│   ├── components/         # UI components
│   ├── pages/             # Application pages
│   ├── services/          # API services
│   └── hooks/             # Custom hooks
├── server/                # Node.js backend
│   ├── src/               # Backend source
│   │   ├── models/        # Database models
│   │   ├── routes/        # API endpoints
│   │   ├── services/      # Business logic
│   │   └── ml/            # ML recommendation engine
│   ├── scripts/           # Database seeds
│   └── tests/             # Test suites
└── public/                # Static assets
\`\`\`

## 🛠 Available Scripts

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server

### Backend
- `cd server && npm run dev` - Start backend development
- `cd server && npm run seed:all` - Seed database with sample data
- `cd server && npm test` - Run test suite
- `cd server && npm run train` - Train ML models

### Full-Stack
- `npm run dev:full` - Start both frontend and backend
- `npm run setup` - Install all dependencies and setup environment
- `npm run docker:up` - Start backend services with Docker

## 🔧 Environment Variables

### Frontend (.env.local)
\`\`\`
REACT_APP_API_URL=http://localhost:5000/api
\`\`\`

### Backend (server/.env)
\`\`\`
PORT=5000
MONGO_URI=mongodb://localhost:27017/pmis_smartmatch
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_jwt_secret_here
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
GOOGLE_SHEETS_API_KEY=your_google_api_key
\`\`\`

## 🚀 Features

- **AI-Powered Matching**: TensorFlow.js recommendation engine
- **Real-time Notifications**: SMS, email, and in-app notifications
- **Admin Dashboard**: Comprehensive analytics and management
- **Offline Support**: PWA with offline sync capabilities
- **ML Analytics**: Dropout prediction and success scoring
- **Workflow Automation**: n8n integration for automated processes

## 🧪 Testing

\`\`\`bash
# Frontend tests
npm test

# Backend tests
cd server && npm test

# Coverage report
cd server && npm run test:coverage
\`\`\`

## 📊 Services & Ports

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **MongoDB**: localhost:27017
- **Redis**: localhost:6379
- **n8n Workflows**: http://localhost:5678

## 🐳 Docker Services

The backend includes Docker Compose setup with:
- MongoDB with Mongo Express admin
- Redis for caching
- n8n for workflow automation
- PostgreSQL (optional)

Start with: `npm run docker:up`

## 📝 API Documentation

API documentation is available at `http://localhost:5000/api-docs` when the backend is running.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request
