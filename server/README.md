# PMIS SmartMatch+ Backend

A comprehensive Node.js backend system for intelligent internship matching with ML-powered recommendations, automated notifications, and workflow integrations.

## 🚀 Features

- **Intelligent Matching**: ML-powered recommendation engine with TensorFlow.js
- **Comprehensive API**: RESTful endpoints for candidates, internships, and applications
- **Real-time Notifications**: SMS via Twilio, Google Sheets integration, n8n workflows
- **Advanced Analytics**: Application tracking, performance metrics, and reporting
- **Scalable Architecture**: Docker support, Redis caching, MongoDB/PostgreSQL
- **Security First**: JWT authentication, rate limiting, input validation
- **Production Ready**: Comprehensive logging, error handling, and monitoring

## 📋 Prerequisites

- Node.js 18+ 
- MongoDB 5.0+
- Redis 6.0+
- PostgreSQL 13+ (optional)

## 🛠️ Installation

### Using Docker (Recommended)

\`\`\`bash
# Clone the repository
git clone <repository-url>
cd server

# Start with Docker Compose
make dev-up

# Or manually
docker-compose up -d
\`\`\`

### Manual Installation

\`\`\`bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your configuration
nano .env

# Start MongoDB and Redis
# Then start the server
npm run dev
\`\`\`

## ⚙️ Configuration

### Environment Variables

\`\`\`env
# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Database Configuration
MONGO_URI=mongodb://localhost:27017/pmis_smartmatch
REDIS_URL=redis://localhost:6379
PG_CONN=postgresql://user:password@localhost:5432/pmis

# Authentication
JWT_SECRET=your-super-secret-jwt-key
CLERK_JWT_PUBLIC_KEY=your-clerk-public-key

# Notifications
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_FROM_NUMBER=+1234567890

# Google Sheets Integration
GOOGLE_SHEETS_CREDENTIALS_JSON={"type":"service_account",...}
GOOGLE_SHEETS_ID=your-sheet-id

# n8n Integration
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/pmis
N8N_WEBHOOK_SECRET=your-webhook-secret

# ML Configuration
MODEL_STORAGE_PATH=./models
RETRAIN_THRESHOLD=100

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100

# Monitoring
LOG_LEVEL=info
SENTRY_DSN=your-sentry-dsn
\`\`\`

## 🗄️ Database Setup

### MongoDB Collections

\`\`\`bash
# Seed the database
npm run seed:internships
npm run seed:candidates

# Or use the scripts directly
node scripts/seed_internships.js
node scripts/seed_candidates.js
\`\`\`

### PostgreSQL Setup (Optional)

\`\`\`bash
# Run the initialization script
psql -U postgres -d pmis -f scripts/postgres-init.sql
\`\`\`

## 🚀 API Documentation

### Authentication

All protected endpoints require authentication via:
- **JWT Token**: `Authorization: Bearer <token>`
- **Development Mode**: `x-dev-user: {"id":"user123","role":"admin"}`

### Core Endpoints

#### Candidates
- `GET /api/candidates` - List candidates with filtering
- `POST /api/candidates` - Create new candidate
- `GET /api/candidates/:id` - Get candidate details
- `PUT /api/candidates/:id` - Update candidate
- `DELETE /api/candidates/:id` - Delete candidate

#### Internships
- `GET /api/internships` - List internships with filtering
- `POST /api/internships` - Create new internship
- `GET /api/internships/:id` - Get internship details
- `PUT /api/internships/:id` - Update internship
- `DELETE /api/internships/:id` - Delete internship

#### Recommendations
- `GET /api/recommendations/candidate/:id` - Get recommendations for candidate
- `GET /api/recommendations/internship/:id` - Get candidate recommendations for internship
- `POST /api/recommendations/explain` - Get detailed match explanation
- `POST /api/recommendations/batch` - Batch recommendation processing

#### Applications
- `GET /api/applications` - List applications with filtering
- `POST /api/applications` - Submit new application
- `PUT /api/applications/:id/status` - Update application status
- `GET /api/applications/candidate/:id` - Get candidate's applications
- `GET /api/applications/internship/:id` - Get internship applications

#### ML & Analytics
- `POST /api/ml/train/recommendation` - Train recommendation model
- `POST /api/ml/train/attrition` - Train attrition prediction model
- `POST /api/ml/predict/match` - Get ML match prediction
- `POST /api/ml/predict/batch` - Batch ML predictions
- `GET /api/ml/models` - List available models

#### Notifications
- `POST /api/notifications/sms/send` - Send SMS notification
- `POST /api/notifications/sms/bulk` - Send bulk SMS
- `POST /api/notifications/n8n/trigger` - Trigger n8n workflow
- `POST /api/notifications/sheets/update` - Update Google Sheets
- `GET /api/notifications/stats` - Get notification statistics

### Example Requests

#### Create Candidate
\`\`\`bash
curl -X POST http://localhost:5000/api/candidates \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+919999999999",
    "location": "Mumbai",
    "education": "Bachelor",
    "cgpa": 8.5,
    "skills": ["JavaScript", "React", "Node.js"],
    "preferences": {
      "sectors": ["Technology"],
      "stipendRange": {"min": 20000, "max": 50000}
    }
  }'
\`\`\`

#### Get Recommendations
\`\`\`bash
curl -X GET "http://localhost:5000/api/recommendations/candidate/CANDIDATE_ID?limit=5" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
\`\`\`

## 🤖 Machine Learning

### Features
- **Recommendation Engine**: Neural network for candidate-internship matching
- **Attrition Prediction**: Dropout probability estimation
- **Feature Engineering**: 37+ engineered features from candidate and internship data
- **Automated Retraining**: Weekly model updates based on new data

### Training Models

\`\`\`bash
# Train recommendation model
curl -X POST http://localhost:5000/api/ml/train/recommendation \
  -H "Authorization: Bearer ADMIN_TOKEN"

# Train attrition model  
curl -X POST http://localhost:5000/api/ml/train/attrition \
  -H "Authorization: Bearer ADMIN_TOKEN"
\`\`\`

## 📱 Notifications & Integrations

### SMS Notifications (Twilio)
- Application status updates
- New internship alerts
- Interview reminders
- Bulk messaging capabilities

### Google Sheets Integration
- Automatic application logging
- Real-time status updates
- Analytics data export

### n8n Workflow Automation
- Custom workflow triggers
- Multi-step automation
- External system integrations

## 🧪 Testing

\`\`\`bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test suite
npm test -- tests/routes/candidates.test.js

# Run tests in watch mode
npm run test:watch
\`\`\`

### Test Coverage
- Unit tests for models and services
- Integration tests for API endpoints
- ML model testing and validation
- End-to-end workflow testing

## 📊 Monitoring & Logging

### Logging Levels
- `error`: System errors and exceptions
- `warn`: Warning conditions
- `info`: General information
- `debug`: Detailed debug information

### Health Checks
- `GET /api/health` - Basic health status
- `GET /api/health/detailed` - Comprehensive system status
- Database connectivity checks
- External service status

### Performance Monitoring
- Request/response times
- Database query performance
- ML model inference times
- Memory and CPU usage

## 🚀 Deployment

### Production Deployment

\`\`\`bash
# Build production image
docker build -t pmis-backend .

# Run with production configuration
docker run -d \
  --name pmis-backend \
  -p 5000:5000 \
  --env-file .env.production \
  pmis-backend
\`\`\`

### Environment-Specific Configurations

#### Development
\`\`\`bash
npm run dev
\`\`\`

#### Staging
\`\`\`bash
NODE_ENV=staging npm start
\`\`\`

#### Production
\`\`\`bash
NODE_ENV=production npm start
\`\`\`

## 🔧 Maintenance

### Database Maintenance
\`\`\`bash
# Create database backup
npm run db:backup

# Restore from backup
npm run db:restore backup-file.gz

# Run database migrations
npm run db:migrate
\`\`\`

### Model Management
\`\`\`bash
# Backup ML models
npm run ml:backup

# Restore ML models
npm run ml:restore

# Clean old model versions
npm run ml:cleanup
\`\`\`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow ESLint configuration
- Write tests for new features
- Update documentation
- Use conventional commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the [API Documentation](http://localhost:5000/api/health)
- Review the test files for usage examples

## 🔄 Changelog

### v1.0.0 (Current)
- Initial release with full feature set
- ML-powered recommendations
- Comprehensive notification system
- Production-ready architecture

---

**Built with ❤️ for intelligent internship matching**
\`\`\`

```json file="" isHidden
