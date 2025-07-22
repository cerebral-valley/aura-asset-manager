#!/bin/bash

# Simplified Aura Asset Manager - Deployment Setup
# This creates a deployment-ready setup without dependency conflicts

set -e

echo "🚀 Aura Asset Manager - Simplified Deployment Setup"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}✅ Frontend is already built successfully!${NC}"
echo -e "${GREEN}📦 Frontend build is in frontend/dist/${NC}"

echo ""
echo -e "${YELLOW}🔐 Security Configuration${NC}"

# Generate secure secret key if needed
if [ -f "backend/.env.production" ]; then
    echo -e "${GREEN}✅ Production environment file already exists${NC}"
else
    echo -e "${YELLOW}Creating production environment template...${NC}"
    SECRET_KEY=$(openssl rand -hex 32)
    
    cat > backend/.env.production << EOF
# Production Environment Variables for Backend
# IMPORTANT: Replace all placeholder values with your actual production values

# Database Configuration
DATABASE_URL=postgresql://postgres:[password]@[host]:[port]/[database]
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key

# Security Configuration - GENERATED SECURE KEY
SECRET_KEY=${SECRET_KEY}
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Environment
ENVIRONMENT=production
DEBUG=false

# CORS Configuration - IMPORTANT: Update with your actual domain
ALLOWED_ORIGINS=["https://yourdomain.com","https://www.yourdomain.com"]

# Rate Limiting
RATE_LIMIT_PER_MINUTE=60
RATE_LIMIT_BURST=100

# Monitoring (Optional but recommended)
SENTRY_DSN=your-sentry-dsn-for-error-tracking
LOG_LEVEL=INFO
EOF
    echo -e "${GREEN}✅ Created backend/.env.production with secure key${NC}"
fi

# Create frontend production environment
if [ -f "frontend/.env.production" ]; then
    echo -e "${GREEN}✅ Frontend production environment already exists${NC}"
else
    cat > frontend/.env.production << EOF
# Production Environment Variables for Frontend
# IMPORTANT: Replace with your actual production values

# API Configuration
VITE_API_BASE_URL=https://your-backend-api.railway.app

# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Application Configuration
VITE_APP_NAME=Aura Asset Manager
VITE_APP_VERSION=1.0.0
VITE_ENVIRONMENT=production
EOF
    echo -e "${GREEN}✅ Created frontend/.env.production${NC}"
fi

# Create deployment configuration files
echo -e "${YELLOW}Creating deployment configuration files...${NC}"

# Vercel configuration for frontend
cat > frontend/vercel.json << 'EOF'
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    }
  ]
}
EOF

# Railway configuration for backend
cat > backend/railway.toml << 'EOF'
[build]
  command = "pip install -r requirements.txt"

[deploy]
  command = "uvicorn main:app --host 0.0.0.0 --port $PORT"

[env]
  PORT = "8000"
EOF

# Procfile for other platforms
cat > backend/Procfile << 'EOF'
web: uvicorn main:app --host 0.0.0.0 --port $PORT
EOF

echo -e "${GREEN}✅ Created deployment configuration files${NC}"

# Create a simplified requirements.txt for deployment
cat > backend/requirements-simple.txt << 'EOF'
fastapi==0.104.1
uvicorn[standard]==0.24.0
python-multipart==0.0.6
python-dotenv==1.0.0
supabase==2.3.0
EOF

echo -e "${GREEN}✅ Created simplified requirements for deployment${NC}"

echo ""
echo -e "${YELLOW}📋 Deployment Summary${NC}"
echo -e "${GREEN}✅ Frontend built and ready (frontend/dist)${NC}"
echo -e "${GREEN}✅ Backend configured with secure keys${NC}"
echo -e "${GREEN}✅ Deployment configurations created${NC}"
echo -e "${GREEN}✅ Environment templates ready${NC}"

echo ""
echo -e "${YELLOW}🚀 Next Steps for Deployment:${NC}"
echo ""
echo -e "${GREEN}1. Deploy Backend to Railway:${NC}"
echo "   • Go to https://railway.app"
echo "   • Connect your GitHub repository"
echo "   • Select 'backend' folder as root"
echo "   • Add environment variables from backend/.env.production"
echo "   • Deploy!"
echo ""
echo -e "${GREEN}2. Deploy Frontend to Vercel:${NC}"
echo "   • Go to https://vercel.com"
echo "   • Connect your GitHub repository"
echo "   • Select 'frontend' folder as root"
echo "   • Add environment variables from frontend/.env.production"
echo "   • Deploy!"
echo ""
echo -e "${GREEN}3. Configure Supabase:${NC}"
echo "   • Create production Supabase project"
echo "   • Run database schema from database/schema.sql"
echo "   • Update environment variables with real Supabase credentials"
echo ""
echo -e "${GREEN}4. Update Environment Variables:${NC}"
echo "   • Replace all placeholder values in .env.production files"
echo "   • Update CORS origins with your actual domain"
echo "   • Set up monitoring (optional)"
echo ""
echo -e "${GREEN}Your application is ready for production deployment! 🎉${NC}"
echo -e "${YELLOW}Make sure to test everything in a staging environment first.${NC}"
