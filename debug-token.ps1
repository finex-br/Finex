<#
Debug token
Usa credenciais do arquivo local test-login.json (ignorado pelo git).
Nota: imprime apenas um trecho do token.
#>

$auth = Invoke-RestMethod -Uri "http://localhost:3000/auth/sign-in" -Method POST -ContentType "application/json" -InFile "test-login.json"

Write-Host "Resposta completa:" -ForegroundColor Yellow
$auth | ConvertTo-Json -Depth 5

$token = $auth.token
if (-not $token) { throw "Token nao retornado" }

Write-Host "`nToken (prefixo):" -ForegroundColor Yellow
Write-Host ($token.Substring(0, [Math]::Min(40, $token.Length)) + "...")

Write-Host "`nTestando com token:" -ForegroundColor Yellow
$headers = @{ Authorization = "Bearer $($auth.token)" }
$headers | ConvertTo-Json

try {
    $result = Invoke-RestMethod -Uri "http://localhost:3000/financial/pending-documents" -Method GET -Headers $headers
    Write-Host "`nOK: Token funcionou" -ForegroundColor Green
    $result | ConvertTo-Json -Depth 5
} catch {
    Write-Host "`nERRO com token:" -ForegroundColor Red
    Write-Host $_.Exception.Message
    Write-Host $_.ErrorDetails.Message
}
