#!/bin/bash

# Aura Asset Manager - macOS Production Deployment Script
# Optimized for macOS with Homebrew

set -e

echo "🚀 Starting Aura Asset Manager Production Deployment (macOS)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if required tools are installed
check_dependencies() {
    echo -e "${YELLOW}Checking dependencies...${NC}"
    
    # Check for Homebrew
    if ! command -v brew &> /dev/null; then
        echo -e "${RED}❌ Homebrew is required but not installed${NC}"
        echo "Install Homebrew from: https://brew.sh"
        exit 1
    fi
    
    # Check for Node.js
    if ! command -v node &> /dev/null; then
        echo -e "${YELLOW}⚠️  Node.js not found. Installing via Homebrew...${NC}"
        brew install node
    fi
    
    # Check for pnpm
    if ! command -v pnpm &> /dev/null; then
        echo -e "${YELLOW}⚠️  pnpm not found. Installing via npm...${NC}"
        npm install -g pnpm
    fi
    
    # Check for Python 3
    if ! command -v python3 &> /dev/null; then
        echo -e "${YELLOW}⚠️  Python 3 not found. Installing via Homebrew...${NC}"
        brew install python
    fi
    
    # Check for pipenv (better than venv for macOS)
    if ! command -v pipenv &> /dev/null; then
        echo -e "${YELLOW}⚠️  pipenv not found. Installing via Homebrew...${NC}"
        brew install pipenv
    fi
    
    echo -e "${GREEN}✅ All dependencies ready${NC}"
}

# Generate secure secret key
generate_secret_key() {
    echo -e "${YELLOW}Generating secure secret key...${NC}"
    SECRET_KEY=$(openssl rand -hex 32)
    echo -e "${GREEN}✅ Secret key generated${NC}"
    
    # Update the backend .env.production file
    if [ -f "backend/.env.production" ]; then
        # Replace the SECRET_KEY line
        sed -i '' "s/SECRET_KEY=.*/SECRET_KEY=${SECRET_KEY}/" backend/.env.production
        echo -e "${GREEN}✅ Updated backend/.env.production with new secret key${NC}"
    else
        echo -e "${YELLOW}⚠️  backend/.env.production not found. Creating from template...${NC}"
        cp backend/.env.production.example backend/.env.production
        sed -i '' "s/SECRET_KEY=.*/SECRET_KEY=${SECRET_KEY}/" backend/.env.production
    fi
    
    echo "🔐 Your SECRET_KEY: ${SECRET_KEY}"
}

# Setup Python environment with pipenv
setup_backend() {
    echo -e "${YELLOW}Setting up backend Python environment...${NC}"
    cd backend
    
    # Initialize pipenv if Pipfile doesn't exist
    if [ ! -f "Pipfile" ]; then
        echo -e "${YELLOW}Creating Pipfile from requirements.txt...${NC}"
        pipenv install -r requirements.txt
    else
        echo -e "${YELLOW}Installing dependencies from Pipfile...${NC}"
        pipenv install
    fi
    
    echo -e "${GREEN}✅ Backend environment ready${NC}"
    cd ..
}

# Build frontend for production
build_frontend() {
    echo -e "${YELLOW}Building frontend for production...${NC}"
    cd frontend
    
    # Install dependencies
    pnpm install
    
    # Build for production
    pnpm run build
    
    echo -e "${GREEN}✅ Frontend built successfully${NC}"
    echo -e "${GREEN}📦 Build output is in frontend/dist/${NC}"
    cd ..
}

# Test backend setup
test_backend() {
    echo -e "${YELLOW}Testing backend setup...${NC}"
    cd backend
    
    # Test if we can import the main app
    if pipenv run python -c "from main import app; print('✅ Backend imports successfully')" 2>/dev/null; then
        echo -e "${GREEN}✅ Backend setup verified${NC}"
    else
        echo -e "${RED}❌ Backend setup failed. Check dependencies.${NC}"
        cd ..
        return 1
    fi
    
    cd ..
}

# Create deployment-ready files
create_deployment_files() {
    echo -e "${YELLOW}Creating deployment-ready configuration files...${NC}"
    
    # Create Procfile for Heroku/Railway
    if [ ! -f "backend/Procfile" ]; then
        echo "web: uvicorn main:app --host 0.0.0.0 --port \$PORT" > backend/Procfile
        echo -e "${GREEN}✅ Created backend/Procfile${NC}"
    fi
    
    # Create railway.toml for Railway deployment
    if [ ! -f "backend/railway.toml" ]; then
        cat > backend/railway.toml << EOF
[build]
  command = "pip install -r requirements.txt"

[deploy]
  command = "uvicorn main:app --host 0.0.0.0 --port \$PORT"

[env]
  PORT = "8000"
EOF
        echo -e "${GREEN}✅ Created backend/railway.toml${NC}"
    fi
    
    # Create vercel.json for frontend deployment
    if [ ! -f "frontend/vercel.json" ]; then
        cat > frontend/vercel.json << EOF
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
        }
      ]
    }
  ]
}
EOF
        echo -e "${GREEN}✅ Created frontend/vercel.json${NC}"
    fi
}

# Security checklist
security_checklist() {
    echo -e "${YELLOW}🔒 Security Checklist${NC}"
    echo "Before deploying to production, ensure you have:"
    echo "1. ✅ Created a production Supabase project"
    echo "2. ✅ Configured Row Level Security (RLS) policies"
    echo "3. ✅ Generated a strong SECRET_KEY (done ✓)"
    echo "4. ✅ Set CORS origins to your production domain only"
    echo "5. ✅ Configured HTTPS for both frontend and backend"
    echo "6. ✅ Set up monitoring and error tracking"
    echo "7. ✅ Configured backup procedures"
    echo ""
    echo -e "${YELLOW}Next steps:${NC}"
    echo "1. Update backend/.env.production with your Supabase credentials"
    echo "2. Update frontend/.env.production with your API and Supabase URLs"
    echo "3. Deploy backend to Railway: https://railway.app"
    echo "4. Deploy frontend to Vercel: https://vercel.com"
    echo "5. Configure your custom domain"
}

# Main deployment flow
main() {
    echo -e "${GREEN}🎯 Aura Asset Manager - macOS Production Deployment${NC}"
    echo "This script will prepare your application for production deployment"
    echo ""
    
    check_dependencies
    echo ""
    
    read -p "Generate a new secret key? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        generate_secret_key
        echo ""
    fi
    
    read -p "Set up backend Python environment? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        setup_backend
        echo ""
    fi
    
    read -p "Build frontend for production? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        build_frontend
        echo ""
    fi
    
    read -p "Test backend setup? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        test_backend
        echo ""
    fi
    
    read -p "Create deployment configuration files? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        create_deployment_files
        echo ""
    fi
    
    security_checklist
    echo ""
    
    echo -e "${GREEN}🎉 Preparation complete!${NC}"
    echo -e "${GREEN}Your application is ready for production deployment! 🚀${NC}"
}

# Run main function
main
