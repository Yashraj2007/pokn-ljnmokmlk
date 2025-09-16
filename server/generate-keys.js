const fs = require('fs');
const crypto = require('crypto');

console.log('🔐 Generating JWT keys for PMIS...\n');

// Generate secure random keys
const jwtSecret = crypto.randomBytes(64).toString('hex');
const jwtRefreshSecret = crypto.randomBytes(64).toString('hex');

// Create environment configuration
const envContent = `# JWT Configuration - Generated ${new Date().toString()}
JWT_SECRET=${jwtSecret}
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=${jwtRefreshSecret}
JWT_REFRESH_EXPIRES_IN=30d

# Authentication Features
VALIDATE_USER_EXISTS=false
ENABLE_REFRESH_TOKENS=true
ALLOW_DEV_AUTH=true
BCRYPT_ROUNDS=12
PASSWORD_MIN_LENGTH=6

# Server Configuration
NODE_ENV=development
PORT=4000

# Database
MONGO_URI=mongodb://localhost:27017/pmis

# CORS
FRONTEND_URL=http://localhost:5173
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=100
RATE_LIMIT_AUTH_MAX=10

# File Upload
MAX_FILE_SIZE_MB=5
ALLOWED_FILE_TYPES=pdf,doc,docx,jpg,jpeg,png
UPLOAD_DIR=uploads

# Feature Flags
ENABLE_NOTIFICATIONS=true
ENABLE_ANALYTICS=true
ENABLE_WEBHOOKS=true
ENABLE_API_DOCS=true
ENABLE_ML_FEATURES=true

# Logging
LOG_LEVEL=info
ENABLE_REQUEST_LOGGING=true

# Security
ENABLE_HELMET=true
ENABLE_CORS=true
`;

// Write to jwt-keys.env
fs.writeFileSync('jwt-keys.env', envContent);

console.log('✅ JWT keys generated and saved to jwt-keys.env\n');
console.log('📋 Generated keys:');
console.log(`JWT_SECRET=${jwtSecret}`);
console.log(`JWT_REFRESH_SECRET=${jwtRefreshSecret}\n`);
console.log('🔧 Next steps:');
console.log('1. Copy jwt-keys.env to .env (or merge with existing .env)');
console.log('2. Add .env to .gitignore');
console.log('3. Keep these keys secret\n');
console.log('💡 Quick copy command:');
console.log('   cp jwt-keys.env .env    # or');
console.log('   copy jwt-keys.env .env  # Windows CMD');
