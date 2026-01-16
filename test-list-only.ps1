# Test - Apenas listar documentos
# Usa credenciais do arquivo local test-login.json (ignorado pelo git).

Write-Host "`n=== TESTANDO GET /financial/pending-documents ===" -ForegroundColor Cyan

# 1. Login
$login = Invoke-RestMethod -Uri "http://localhost:3000/auth/sign-in" `
    -Method Post `
    -ContentType "application/json" `
    -InFile "test-login.json"

Write-Host "Token: $($login.token.Substring(0, 30))..." -ForegroundColor Green

# 2. Listar documentos
$headers = @{
    Authorization = "Bearer $($login.token)"
}

Write-Host "`nChamando GET /financial/pending-documents..." -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/financial/pending-documents" `
        -Headers $headers `
        -Method Get

    Write-Host "`nResposta completa:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 10 | Write-Host

    Write-Host "`nTotal de documentos: $($response.documents.Count)" -ForegroundColor Cyan
    
    if ($response.documents.Count -gt 0) {
        Write-Host "`nDocumentos encontrados:" -ForegroundColor Green
        $response.documents | Format-Table -Property id, fileName, status, totalRows
    } else {
        Write-Host "`nNENHUM documento encontrado!" -ForegroundColor Red
    }
} catch {
    Write-Host "`nERRO: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Response: $($_.ErrorDetails.Message)" -ForegroundColor Red
}

Write-Host "`n=== Verificando no banco de dados ===" -ForegroundColor Cyan
docker exec finex-postgres psql -U postgres -d finex -c "SELECT id, filename, status, company_id, created_at FROM financial_uploads ORDER BY created_at DESC LIMIT 5;"
