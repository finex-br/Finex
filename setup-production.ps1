# 🚀 Finex Production Environment Setup Script (PowerShell)
# This script helps you create production environment files on Windows

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🚀 Finex Production Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Function to generate JWT secret
function Generate-JWTSecret {
    $bytes = New-Object byte[] 64
    $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    $rng.GetBytes($bytes)
    return [System.BitConverter]::ToString($bytes).Replace("-", "").ToLower()
}

# Function to generate secure password
function Generate-Password {
    $bytes = New-Object byte[] 32
    $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    $rng.GetBytes($bytes)
    return [Convert]::ToBase64String($bytes).Substring(0, 25)
}

Write-Host "📝 Let's set up your production environment..." -ForegroundColor Yellow
Write-Host ""

# Get domain
$DOMAIN = Read-Host "Enter your domain (e.g., finex.com)"
$API_DOMAIN = "api.$DOMAIN"
$APP_URL = "https://$DOMAIN"
$API_URL = "https://$API_DOMAIN"

# Get Google OAuth credentials
Write-Host ""
Write-Host "Google OAuth Setup:" -ForegroundColor Yellow
Write-Host "Get these from: https://console.cloud.google.com/apis/credentials"
$GOOGLE_CLIENT_ID = Read-Host "Enter your Google Client ID"
$GOOGLE_CLIENT_SECRET = Read-Host "Enter your Google Client Secret" -AsSecureString
$GOOGLE_CLIENT_SECRET_PLAIN = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($GOOGLE_CLIENT_SECRET))

# Generate secrets
Write-Host ""
Write-Host "Generating secure secrets..." -ForegroundColor Yellow
$JWT_SECRET = Generate-JWTSecret
$DB_PASSWORD = Generate-Password

Write-Host "✓ JWT Secret generated" -ForegroundColor Green
Write-Host "✓ Database password generated" -ForegroundColor Green

# Create backend .env.production
Write-Host ""
Write-Host "Creating backend/.env.production..." -ForegroundColor Yellow

$backendEnv = @"
# ========================================
# PRODUCTION ENVIRONMENT VARIABLES
# Auto-generated on $(Get-Date)
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
GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET_PLAIN}
GOOGLE_CALLBACK_URL=${API_URL}/auth/oauth/google/callback

# Frontend URL (for CORS)
FRONTEND_URL=${APP_URL}
API_URL=${API_URL}
"@

$backendEnv | Out-File -FilePath "backend\.env.production" -Encoding UTF8
Write-Host "✓ Backend environment file created" -ForegroundColor Green

# Create frontend .env.production
Write-Host ""
Write-Host "Creating frontend/.env.production..." -ForegroundColor Yellow

$frontendEnv = @"
# ========================================
# PRODUCTION ENVIRONMENT VARIABLES
# Auto-generated on $(Get-Date)
# ========================================

# Backend API URL
VITE_API_URL=${API_URL}

# Google OAuth Configuration
VITE_GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}

# Application URL
VITE_APP_URL=${APP_URL}
"@

$frontendEnv | Out-File -FilePath "frontend\.env.production" -Encoding UTF8
Write-Host "✓ Frontend environment file created" -ForegroundColor Green

# Create root .env for Docker Compose
Write-Host ""
Write-Host "Creating .env for Docker Compose..." -ForegroundColor Yellow

$dockerEnv = @"
# ========================================
# DOCKER COMPOSE ENVIRONMENT VARIABLES
# Auto-generated on $(Get-Date)
# ========================================

# PostgreSQL Configuration
POSTGRES_USER=finex_user
POSTGRES_PASSWORD=${DB_PASSWORD}
POSTGRES_DB=finex_production

# Frontend Build Args
VITE_API_URL=${API_URL}
VITE_GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
VITE_APP_URL=${APP_URL}
"@

$dockerEnv | Out-File -FilePath ".env" -Encoding UTF8
Write-Host "✓ Docker Compose environment file created" -ForegroundColor Green

# Create credentials file for reference
Write-Host ""
Write-Host "Creating CREDENTIALS.txt for your reference..." -ForegroundColor Yellow

$credentials = @"
======================================
🔐 FINEX PRODUCTION CREDENTIALS
======================================
Generated on: $(Get-Date)

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
Client Secret: ${GOOGLE_CLIENT_SECRET_PLAIN}

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

"@

$credentials | Out-File -FilePath "CREDENTIALS.txt" -Encoding UTF8
Write-Host "✓ Credentials file created" -ForegroundColor Green

# Summary
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📁 Files created:"
Write-Host "  • backend\.env.production"
Write-Host "  • frontend\.env.production"
Write-Host "  • .env (for Docker Compose)"
Write-Host "  • CREDENTIALS.txt (KEEP THIS SECURE!)"
Write-Host ""
Write-Host "⚠️  Important Security Notes:" -ForegroundColor Yellow
Write-Host "  • Never commit .env.production files to git"
Write-Host "  • Keep CREDENTIALS.txt in a secure location"
Write-Host "  • Rotate secrets regularly"
Write-Host ""
Write-Host "📚 Next Steps:"
Write-Host "  1. Review CREDENTIALS.txt"
Write-Host "  2. Update Google OAuth Console with new URLs"
Write-Host "  3. Configure Cloudflare DNS"
Write-Host "  4. Follow DEPLOYMENT.md guide"
Write-Host ""
Write-Host "🚀 Good luck with your deployment!" -ForegroundColor Green
Write-Host ""
