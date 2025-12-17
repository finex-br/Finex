# Setup Local do Finex
# Este script configura e inicia o ambiente de desenvolvimento local

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   FINEX - Setup Local Automatizado" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se Docker esta rodando
Write-Host "1. Verificando Docker..." -ForegroundColor Yellow
try {
    docker ps | Out-Null
    Write-Host "   [OK] Docker esta rodando" -ForegroundColor Green
} catch {
    Write-Host "   [ERRO] Docker nao esta rodando!" -ForegroundColor Red
    Write-Host "   Por favor, inicie o Docker Desktop e rode este script novamente." -ForegroundColor Red
    exit 1
}

# Verificar Node.js
Write-Host "2. Verificando Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "   [OK] Node.js $nodeVersion instalado" -ForegroundColor Green
} catch {
    Write-Host "   [ERRO] Node.js nao encontrado!" -ForegroundColor Red
    Write-Host "   Baixe em: https://nodejs.org/" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   CONFIGURANDO BACKEND" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Navegar para backend
Set-Location backend

# Criar .env se nao existir
if (-Not (Test-Path ".env")) {
    Write-Host "3. Criando arquivo .env do backend..." -ForegroundColor Yellow
    
    $randomSecret = Get-Random -Maximum 999999
    $envLines = @(
        "NODE_ENV=development",
        "PORT=3000",
        "",
        "# Database",
        "DATABASE_URL=postgresql://postgres:postgres@localhost:5433/finex",
        "",
        "# JWT",
        "JWT_SECRET=dev-secret-key-change-in-production-$randomSecret",
        "JWT_EXPIRES_IN=7d",
        "",
        "# Redis (opcional para dev)",
        "REDIS_URL=redis://localhost:6379"
    )
    
    $envLines | Out-File -FilePath ".env" -Encoding utf8
    Write-Host "   [OK] Arquivo .env criado" -ForegroundColor Green
} else {
    Write-Host "3. Arquivo .env ja existe" -ForegroundColor Green
}

# Iniciar PostgreSQL
Write-Host "4. Iniciando PostgreSQL..." -ForegroundColor Yellow
docker-compose up -d
Start-Sleep -Seconds 5

# Verificar se PostgreSQL esta rodando
$containerRunning = docker ps --filter "name=finex-postgres" --format "{{.Names}}"
if ($containerRunning -eq "finex-postgres") {
    Write-Host "   [OK] PostgreSQL rodando na porta 5433" -ForegroundColor Green
} else {
    Write-Host "   [ERRO] Erro ao iniciar PostgreSQL" -ForegroundColor Red
    exit 1
}

# Instalar dependencias do backend
Write-Host "5. Instalando dependencias do backend..." -ForegroundColor Yellow
npm install | Out-Null
Write-Host "   [OK] Dependencias instaladas" -ForegroundColor Green

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   CONFIGURANDO FRONTEND" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Navegar para frontend
Set-Location ..\frontend

# Criar .env se nao existir
if (-Not (Test-Path ".env")) {
    Write-Host "6. Criando arquivo .env do frontend..." -ForegroundColor Yellow
    
    $envLines = @(
        "VITE_API_URL=http://localhost:3000",
        "VITE_GOOGLE_CLIENT_ID=optional-for-now"
    )
    
    $envLines | Out-File -FilePath ".env" -Encoding utf8
    Write-Host "   [OK] Arquivo .env criado" -ForegroundColor Green
} else {
    Write-Host "6. Arquivo .env ja existe" -ForegroundColor Green
}

# Instalar dependencias do frontend
Write-Host "7. Instalando dependencias do frontend..." -ForegroundColor Yellow
npm install | Out-Null
Write-Host "   [OK] Dependencias instaladas" -ForegroundColor Green

# Voltar para root
Set-Location ..

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   SETUP COMPLETO!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Para iniciar o projeto:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  Terminal 1 (Backend):" -ForegroundColor Cyan
Write-Host "    cd backend" -ForegroundColor White
Write-Host "    npm run start:dev" -ForegroundColor White
Write-Host ""
Write-Host "  Terminal 2 (Frontend):" -ForegroundColor Cyan
Write-Host "    cd frontend" -ForegroundColor White
Write-Host "    npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "Depois acesse:" -ForegroundColor Yellow
Write-Host "  Frontend: http://localhost:5173" -ForegroundColor Green
Write-Host "  Backend:  http://localhost:3000" -ForegroundColor Green
Write-Host ""
Write-Host "Status dos servicos:" -ForegroundColor Yellow
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
Write-Host ""
Write-Host "Para parar o PostgreSQL:" -ForegroundColor Yellow
Write-Host "  cd backend" -ForegroundColor White
Write-Host "  docker-compose down" -ForegroundColor White
Write-Host ""
