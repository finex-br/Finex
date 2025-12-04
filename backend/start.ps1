# 🚀 Script de Inicialização Rápida - FinEx Backend

Write-Host "`n=== FinEx Backend - Inicialização ===" -ForegroundColor Cyan

# 1. Verificar Docker
Write-Host "`n[1/4] Verificando Docker..." -ForegroundColor Yellow
$dockerRunning = $false
try {
    docker ps | Out-Null
    $dockerRunning = $true
    Write-Host "✓ Docker está rodando" -ForegroundColor Green
} catch {
    Write-Host "✗ Docker não está rodando" -ForegroundColor Red
    Write-Host "Iniciando Docker Desktop..." -ForegroundColor Yellow
    Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    Write-Host "Aguarde o Docker iniciar (ícone na bandeja)..." -ForegroundColor Cyan
    Write-Host "Depois rode este script novamente." -ForegroundColor Yellow
    exit 1
}

# 2. Subir PostgreSQL
Write-Host "`n[2/4] Iniciando PostgreSQL no Docker..." -ForegroundColor Yellow
docker-compose up -d
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ PostgreSQL iniciado com sucesso!" -ForegroundColor Green
    Write-Host "  Container: finex-postgres" -ForegroundColor Gray
    Write-Host "  Porta: 5433" -ForegroundColor Gray
    Write-Host "  Database: finex" -ForegroundColor Gray
    Write-Host "  User: postgres / Pass: postgres" -ForegroundColor Gray
} else {
    Write-Host "✗ Erro ao iniciar PostgreSQL" -ForegroundColor Red
    exit 1
}

# 3. Aguardar PostgreSQL ficar pronto
Write-Host "`n[3/4] Aguardando PostgreSQL ficar pronto..." -ForegroundColor Yellow
Start-Sleep -Seconds 5
$ready = $false
for ($i = 1; $i -le 10; $i++) {
    try {
        docker exec finex-postgres pg_isready -U postgres | Out-Null
        if ($LASTEXITCODE -eq 0) {
            $ready = $true
            break
        }
    } catch {}
    Write-Host "  Tentativa $i/10..." -ForegroundColor Gray
    Start-Sleep -Seconds 2
}

if ($ready) {
    Write-Host "✓ PostgreSQL está pronto!" -ForegroundColor Green
} else {
    Write-Host "✗ PostgreSQL demorou muito para iniciar" -ForegroundColor Red
    Write-Host "Tente rodar: docker-compose logs postgres" -ForegroundColor Yellow
    exit 1
}

# 4. Iniciar aplicação
Write-Host "`n[4/4] Iniciando aplicação NestJS..." -ForegroundColor Yellow
Write-Host "  URL: http://localhost:3000" -ForegroundColor Cyan
Write-Host "  Ctrl+C para parar`n" -ForegroundColor Gray

npm run start:dev

# Se chegar aqui, foi interrompido
Write-Host "`n=== Aplicação parada ===" -ForegroundColor Yellow
Write-Host "Para parar o PostgreSQL: docker-compose down" -ForegroundColor Gray
