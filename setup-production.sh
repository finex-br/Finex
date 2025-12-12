#!/bin/bash

# 🚀 Finex Production Environment Setup Script
# This script helps you create production environment files

set -e

echo "========================================"
echo "🚀 Finex Production Setup"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to generate JWT secret
generate_jwt_secret() {
    node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
}

# Function to generate secure password
generate_password() {
    openssl rand -base64 32 | tr -d "=+/" | cut -c1-25
}

echo "📝 Let's set up your production environment..."
echo ""

# Get domain
read -p "Enter your domain (e.g., finex.com): " DOMAIN
API_DOMAIN="api.${DOMAIN}"
APP_URL="https://${DOMAIN}"
API_URL="https://${API_DOMAIN}"

# Get Google OAuth credentials
echo ""
echo "${YELLOW}Google OAuth Setup:${NC}"
echo "Get these from: https://console.cloud.google.com/apis/credentials"
read -p "Enter your Google Client ID: " GOOGLE_CLIENT_ID
read -sp "Enter your Google Client Secret: " GOOGLE_CLIENT_SECRET
echo ""

# Generate secrets
echo ""
echo "${YELLOW}Generating secure secrets...${NC}"
JWT_SECRET=$(generate_jwt_secret)
DB_PASSWORD=$(generate_password)

echo "${GREEN}✓ JWT Secret generated${NC}"
echo "${GREEN}✓ Database password generated${NC}"

# Create backend .env.production
echo ""
echo "${YELLOW}Creating backend/.env.production...${NC}"
cat > backend/.env.production <<EOF
# ========================================
# PRODUCTION ENVIRONMENT VARIABLES
# Auto-generated on $(date)
# ========================================

# Environment
NODE_ENV=production
PORT=3000

# Database Configuration
DATABASE_URL=postgresql://finex_user:${DB_PASSWORD}@postgres:5432/finex_production

# JWT Configuration
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRES_IN=7d

# Redis Configuration
REDIS_URL=redis://redis:6379

# Google OAuth Configuration
GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}
GOOGLE_CALLBACK_URL=${API_URL}/auth/oauth/google/callback

# Frontend URL (for CORS)
FRONTEND_URL=${APP_URL}
API_URL=${API_URL}
EOF

echo "${GREEN}✓ Backend environment file created${NC}"

# Create frontend .env.production
echo ""
echo "${YELLOW}Creating frontend/.env.production...${NC}"
cat > frontend/.env.production <<EOF
# ========================================
# PRODUCTION ENVIRONMENT VARIABLES
# Auto-generated on $(date)
# ========================================

# Backend API URL
VITE_API_URL=${API_URL}

# Google OAuth Configuration
VITE_GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}

# Application URL
VITE_APP_URL=${APP_URL}
EOF

echo "${GREEN}✓ Frontend environment file created${NC}"

# Create root .env for Docker Compose
echo ""
echo "${YELLOW}Creating .env for Docker Compose...${NC}"
cat > .env <<EOF
# ========================================
# DOCKER COMPOSE ENVIRONMENT VARIABLES
# Auto-generated on $(date)
# ========================================

# PostgreSQL Configuration
POSTGRES_USER=finex_user
POSTGRES_PASSWORD=${DB_PASSWORD}
POSTGRES_DB=finex_production

# Frontend Build Args
VITE_API_URL=${API_URL}
VITE_GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
VITE_APP_URL=${APP_URL}
EOF

echo "${GREEN}✓ Docker Compose environment file created${NC}"

# Create credentials file for reference
echo ""
echo "${YELLOW}Creating CREDENTIALS.txt for your reference...${NC}"
cat > CREDENTIALS.txt <<EOF
======================================
🔐 FINEX PRODUCTION CREDENTIALS
======================================
Generated on: $(date)

⚠️  KEEP THIS FILE SECURE AND DO NOT COMMIT TO GIT ⚠️

Domain Configuration:
---------------------
Frontend URL: ${APP_URL}
API URL: ${API_URL}

Database:
---------
User: finex_user
Password: ${DB_PASSWORD}
Database: finex_production

JWT Secret:
-----------
${JWT_SECRET}

Google OAuth:
-------------
Client ID: ${GOOGLE_CLIENT_ID}
Client Secret: ${GOOGLE_CLIENT_SECRET}

Cloudflare DNS Records Needed:
------------------------------
Type: A     | Name: @   | Content: YOUR_VPS_IP | Proxy: ON
Type: A     | Name: api | Content: YOUR_VPS_IP | Proxy: ON
Type: CNAME | Name: www | Content: ${DOMAIN}   | Proxy: ON

Google OAuth Authorized URLs:
-----------------------------
JavaScript Origins:
  - ${APP_URL}

Redirect URIs:
  - ${APP_URL}/auth/google/callback
  - ${API_URL}/auth/oauth/google/callback

Next Steps:
-----------
1. Update Google OAuth Console with the URLs above
2. Configure Cloudflare DNS records
3. Add these environment variables to Coolify
4. Deploy using: docker-compose -f docker-compose.production.yml up -d

EOF

echo "${GREEN}✓ Credentials file created${NC}"

# Summary
echo ""
echo "========================================"
echo "${GREEN}✅ Setup Complete!${NC}"
echo "========================================"
echo ""
echo "📁 Files created:"
echo "  • backend/.env.production"
echo "  • frontend/.env.production"
echo "  • .env (for Docker Compose)"
echo "  • CREDENTIALS.txt (KEEP THIS SECURE!)"
echo ""
echo "⚠️  Important Security Notes:"
echo "  • Never commit .env.production files to git"
echo "  • Keep CREDENTIALS.txt in a secure location"
echo "  • Rotate secrets regularly"
echo ""
echo "📚 Next Steps:"
echo "  1. Review CREDENTIALS.txt"
echo "  2. Update Google OAuth Console with new URLs"
echo "  3. Configure Cloudflare DNS"
echo "  4. Follow DEPLOYMENT.md guide"
echo ""
echo "🚀 Good luck with your deployment!"
echo ""
