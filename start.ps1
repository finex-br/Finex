# Finex - Inicializacao Automatica
# Inicia PostgreSQL, Backend e Frontend automaticamente

$RootDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   FINEX - Iniciando Ambiente Dev" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar Docker
Write-Host "Verificando Docker..." -ForegroundColor Yellow
try {
    docker ps | Out-Null
    Write-Host "   [OK] Docker esta rodando" -ForegroundColor Green
} catch {
    Write-Host "   [ERRO] Docker nao esta rodando!" -ForegroundColor Red
    Write-Host "   Por favor, inicie o Docker Desktop e tente novamente." -ForegroundColor Red
    Read-Host "Pressione Enter para sair"
    exit 1
}

# Iniciar PostgreSQL
Write-Host "Iniciando PostgreSQL..." -ForegroundColor Yellow
Set-Location "$RootDir\backend"
docker-compose up -d | Out-Null
Start-Sleep -Seconds 3

$containerRunning = docker ps --filter "name=finex-postgres" --format "{{.Names}}"
if ($containerRunning -eq "finex-postgres") {
    Write-Host "   [OK] PostgreSQL rodando na porta 5433" -ForegroundColor Green
} else {
    Write-Host "   [AVISO] Container PostgreSQL nao encontrado, verifique o docker-compose" -ForegroundColor Yellow
}

Set-Location $RootDir

Write-Host ""

# Verificar se Windows Terminal (wt) esta disponivel
$useWT = $null -ne (Get-Command "wt" -ErrorAction SilentlyContinue)

if ($useWT) {
    Write-Host "Abrindo Windows Terminal com backend e frontend..." -ForegroundColor Yellow
    wt `
        new-tab --title "Finex Backend" --startingDirectory "$RootDir\backend" PowerShell -NoExit -Command "npm run start:dev" `; `
        new-tab --title "Finex Frontend" --startingDirectory "$RootDir\frontend" PowerShell -NoExit -Command "npm run dev"
} else {
    Write-Host "Abrindo terminais separados para backend e frontend..." -ForegroundColor Yellow

    # Backend em nova janela
    Start-Process powershell -ArgumentList @(
        "-NoExit",
        "-Command",
        "Set-Location '$RootDir\backend'; Write-Host 'FINEX BACKEND' -ForegroundColor Cyan; npm run start:dev"
    ) -WindowStyle Normal

    Start-Sleep -Seconds 1

    # Frontend em nova janela
    Start-Process powershell -ArgumentList @(
        "-NoExit",
        "-Command",
        "Set-Location '$RootDir\frontend'; Write-Host 'FINEX FRONTEND' -ForegroundColor Cyan; npm run dev"
    ) -WindowStyle Normal
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "   Servicos iniciados!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "  Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "  Backend:  http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Status dos containers:" -ForegroundColor Yellow
docker ps --format "table {{.Names}}`t{{.Status}}`t{{.Ports}}"
Write-Host ""
