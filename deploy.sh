#!/bin/bash

# Aura Asset Manager - Production Deployment Script
# This script helps deploy the application to production

set -e

echo "🚀 Starting Aura Asset Manager Production Deployment"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if required tools are installed
check_dependencies() {
    echo -e "${YELLOW}Checking dependencies...${NC}"
    
    if ! command -v node &> /dev/null; then
        echo -e "${RED}❌ Node.js is required but not installed${NC}"
        exit 1
    fi
    
    if ! command -v pnpm &> /dev/null; then
        echo -e "${RED}❌ pnpm is required but not installed${NC}"
        exit 1
    fi
    
    if ! command -v python3 &> /dev/null; then
        echo -e "${RED}❌ Python 3 is required but not installed${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ All dependencies found${NC}"
}

# Generate secure secret key
generate_secret_key() {
    echo -e "${YELLOW}Generating secure secret key...${NC}"
    SECRET_KEY=$(openssl rand -hex 32)
    echo -e "${GREEN}✅ Secret key generated: ${SECRET_KEY}${NC}"
    echo "Add this to your backend environment variables: SECRET_KEY=${SECRET_KEY}"
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
    cd ..
}

# Prepare backend for production
prepare_backend() {
    echo -e "${YELLOW}Preparing backend for production...${NC}"
    cd backend
    
    # Create virtual environment if it doesn't exist
    if [ ! -d "venv" ]; then
        python3 -m venv venv
    fi
    
    # Activate virtual environment
    source venv/bin/activate
    
    # Install dependencies
    pip install -r requirements.txt
    
    echo -e "${GREEN}✅ Backend prepared successfully${NC}"
    cd ..
}

# Security checklist
security_checklist() {
    echo -e "${YELLOW}🔒 Security Checklist${NC}"
    echo "Please ensure you have:"
    echo "1. ✅ Created a production Supabase project"
    echo "2. ✅ Configured Row Level Security (RLS) policies"
    echo "3. ✅ Generated a strong SECRET_KEY (32+ characters)"
    echo "4. ✅ Set CORS origins to your production domain only"
    echo "5. ✅ Configured HTTPS for both frontend and backend"
    echo "6. ✅ Set up monitoring and error tracking"
    echo "7. ✅ Configured backup procedures"
}

# Main deployment flow
main() {
    echo -e "${GREEN}🎯 Aura Asset Manager - Production Deployment${NC}"
    echo "This script will help you prepare for production deployment"
    echo ""
    
    check_dependencies
    echo ""
    
    read -p "Generate a new secret key? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        generate_secret_key
        echo ""
    fi
    
    read -p "Build frontend for production? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        build_frontend
        echo ""
    fi
    
    read -p "Prepare backend for production? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        prepare_backend
        echo ""
    fi
    
    security_checklist
    echo ""
    
    echo -e "${GREEN}🎉 Preparation complete!${NC}"
    echo -e "${YELLOW}Next steps:${NC}"
    echo "1. Set up your production environment variables"
    echo "2. Deploy backend to Railway/Render/Heroku"
    echo "3. Deploy frontend to Vercel/Netlify"
    echo "4. Configure your custom domain"
    echo "5. Test the complete application flow"
    echo ""
    echo -e "${GREEN}Happy deploying! 🚀${NC}"
}

# Run main function
main
