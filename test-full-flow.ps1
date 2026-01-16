<#
TESTE COMPLETO - Upload -> Preview -> Map -> Validate -> Approve -> Verifica DB

Compatibilidade: Windows PowerShell 5.1
- Evita escapes `u{...} (PS7)
- Usa curl.exe -F para multipart/form-data (upload)
#>

$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$baseUrl = 'http://localhost:3000'
$filePath = 'exemplo-financeiro-teste.xlsx'

function Find-Header {
    param(
        [Parameter(Mandatory=$true)]$Headers,
        [Parameter(Mandatory=$true)][string[]]$Candidates
    )

    function Normalize-Header {
        param([Parameter(Mandatory=$true)][string]$Value)

        $trimmed = $Value.Trim()
        $formD = $trimmed.Normalize([Text.NormalizationForm]::FormD)
        $sb = New-Object System.Text.StringBuilder
        foreach ($ch in $formD.ToCharArray()) {
            $cat = [Globalization.CharUnicodeInfo]::GetUnicodeCategory($ch)
            if ($cat -ne [Globalization.UnicodeCategory]::NonSpacingMark) {
                [void]$sb.Append($ch)
            }
        }
        return $sb.ToString().ToLowerInvariant()
    }

    $normalizedHeaders = @{}
    foreach ($h in $Headers) {
        $hs = [string]$h
        $normalizedHeaders[(Normalize-Header $hs)] = $hs
    }

    foreach ($c in $Candidates) {
        $key = Normalize-Header $c
        if ($normalizedHeaders.ContainsKey($key)) { return $normalizedHeaders[$key] }
    }

    foreach ($c in $Candidates) {
        $cKey = Normalize-Header $c
        foreach ($k in $normalizedHeaders.Keys) {
            if ($k -like "$cKey*") { return $normalizedHeaders[$k] }
        }
    }

    return $null
}

Write-Host "`n=== 1. LOGIN ===" -ForegroundColor Cyan
$authResponse = Invoke-RestMethod -Uri "$baseUrl/auth/sign-in" -Method POST -ContentType 'application/json' -InFile 'test-login.json'
$token = $authResponse.token
if ([string]::IsNullOrWhiteSpace($token)) { throw 'Token vazio no /auth/sign-in' }
Write-Host 'OK: Token obtido' -ForegroundColor Green
$headers = @{ Authorization = "Bearer $token" }

Write-Host "`n=== 2. UPLOAD DO DOCUMENTO (curl.exe) ===" -ForegroundColor Cyan
if (!(Test-Path $filePath)) { throw "Arquivo nao encontrado: $filePath" }

$uploadJson = & curl.exe -s -X POST "$baseUrl/financial/pending-documents/upload" `
    -H "Authorization: Bearer $token" `
    -F "file=@$filePath;type=application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"

if ([string]::IsNullOrWhiteSpace($uploadJson)) { throw 'Resposta vazia no upload' }
$upload = $uploadJson | ConvertFrom-Json

$documentId = $upload.documentId
if ([string]::IsNullOrWhiteSpace($documentId)) { throw "documentId ausente na resposta do upload: $uploadJson" }
Write-Host "OK: Upload realizado. ID: $documentId" -ForegroundColor Green

Write-Host "`n=== 3. LISTAR DOCUMENTOS PENDENTES ===" -ForegroundColor Cyan
$list = Invoke-RestMethod -Uri "$baseUrl/financial/pending-documents" -Headers $headers -Method Get
Write-Host "Total: $($list.documents.Count)" -ForegroundColor Yellow
$list.documents | Select-Object -First 10 | Format-Table -Property id, fileName, status, totalRows -AutoSize

Write-Host "`n=== 4. PREVIEW DO DOCUMENTO ===" -ForegroundColor Cyan
$preview = Invoke-RestMethod -Uri "$baseUrl/financial/pending-documents/$documentId" -Headers $headers -Method Get
Write-Host "Arquivo: $($preview.document.fileName)" -ForegroundColor Yellow
Write-Host "Status:  $($preview.document.status)" -ForegroundColor Yellow
Write-Host "Headers: $($preview.document.rawData.headers -join ', ')" -ForegroundColor Yellow
Write-Host "TotalRows: $($preview.document.rawData.totalRows)" -ForegroundColor Yellow

$headersInFile = $preview.document.rawData.headers
if ($null -eq $headersInFile -or $headersInFile.Count -eq 0) { throw 'Preview sem headers; nao da para mapear.' }

Write-Host "`n=== 5. MAPEAR COLUNAS (auto) ===" -ForegroundColor Cyan
$dateHeader = Find-Header -Headers $headersInFile -Candidates @('Data','Date','Competencia','Competência')
$descHeader = Find-Header -Headers $headersInFile -Candidates @('Descricao','Descrição','Historico','Histórico','Descricao/Descricao')
$amountHeader = Find-Header -Headers $headersInFile -Candidates @('Valor','Amount','Montante')
$typeHeader = Find-Header -Headers $headersInFile -Candidates @('Tipo','Type')
$categoryHeader = Find-Header -Headers $headersInFile -Candidates @('Categoria','Category')

if ($null -eq $dateHeader) { throw "Nao achei header de data nos headers: $($headersInFile -join ', ')" }
if ($null -eq $descHeader) { throw "Nao achei header de descricao nos headers: $($headersInFile -join ', ')" }
if ($null -eq $amountHeader) { throw "Nao achei header de valor nos headers: $($headersInFile -join ', ')" }
if ($null -eq $typeHeader) { throw "Nao achei header de tipo nos headers: $($headersInFile -join ', ')" }
if ($null -eq $categoryHeader) { throw "Nao achei header de categoria nos headers: $($headersInFile -join ', ')" }

Write-Host "Mapeando: date='$dateHeader', description='$descHeader', amount='$amountHeader', type='$typeHeader', category='$categoryHeader'" -ForegroundColor Yellow

$mapBody = @{
    columnMapping = @{
        date = $dateHeader
        description = $descHeader
        amount = $amountHeader
        type = $typeHeader
        category = $categoryHeader
    }
} | ConvertTo-Json

$mapBodyBytes = [System.Text.Encoding]::UTF8.GetBytes($mapBody)

$map = Invoke-RestMethod -Uri "$baseUrl/financial/pending-documents/$documentId/map" -Method Post -Headers $headers -ContentType 'application/json; charset=utf-8' -Body $mapBodyBytes
Write-Host "OK: $($map.message)" -ForegroundColor Green

Write-Host "`n=== 6. VALIDAR DOCUMENTO ===" -ForegroundColor Cyan
$validate = Invoke-RestMethod -Uri "$baseUrl/financial/pending-documents/$documentId/validate" -Method Post -Headers $headers
Write-Host "Validas:  $($validate.validTransactions)" -ForegroundColor $(if ($validate.validTransactions -gt 0) { 'Green' } else { 'Red' })
Write-Host "Com erro: $($validate.invalidTransactions)" -ForegroundColor $(if ($validate.invalidTransactions -gt 0) { 'Yellow' } else { 'Green' })
if ($validate.errors -and $validate.errors.Count -gt 0) {
    Write-Host "`nPrimeiros erros:" -ForegroundColor Yellow
    $validate.errors | Select-Object -First 10 | Format-Table -Property row, field, message -AutoSize
}

Write-Host "`n=== 7. PREVIEW APOS VALIDACAO ===" -ForegroundColor Cyan
$preview2 = Invoke-RestMethod -Uri "$baseUrl/financial/pending-documents/$documentId" -Headers $headers -Method Get
Write-Host "Status atual:  $($preview2.document.status)" -ForegroundColor Yellow
Write-Host "Tem mapping:  $($preview2.document.columnMapping -ne $null)" -ForegroundColor Yellow
Write-Host "Tem validate: $($preview2.document.validationResult -ne $null)" -ForegroundColor Yellow

if ($validate.validTransactions -eq 0) {
    Write-Host "`nAVISO: Nenhuma transacao valida para aprovar." -ForegroundColor Red
    Write-Host 'Pare aqui para ajustar o mapeamento/validacao.' -ForegroundColor Yellow
    exit 1
}

Write-Host "`n=== 8. APROVAR DOCUMENTO ===" -ForegroundColor Cyan
$approve = Invoke-RestMethod -Uri "$baseUrl/financial/pending-documents/$documentId/approve" -Method Post -Headers $headers
Write-Host "OK: $($approve.message)" -ForegroundColor Green
Write-Host "Transacoes importadas: $($approve.transactionsImported)" -ForegroundColor Green

Write-Host "`n=== 9. VERIFICAR DADOS IMPORTADOS (DB) ===" -ForegroundColor Cyan
$query = "SELECT id, description, amount, type, category, date_competence, upload_id FROM financial_data WHERE upload_id = '$documentId' ORDER BY created_at DESC LIMIT 5;"
docker exec finex-postgres psql -U postgres -d finex -c "$query"

Write-Host "`nTESTE COMPLETO FINALIZADO!" -ForegroundColor Green
