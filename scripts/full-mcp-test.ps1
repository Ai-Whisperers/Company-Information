# Full MCP Configuration Test with All Tokens
Write-Host "`n=== Complete MCP Configuration Test ===" -ForegroundColor Cyan

# Set all configured tokens for this session
$env:GITHUB_TOKEN = "***REMOVED***"
$env:AZURE_DEVOPS_PAT = "***REMOVED***"
$env:AZURE_DEVOPS_ORG = "aiwhisperer"
$env:AZURE_DEVOPS_PROJECT = "Business Setup"
$env:AZURE_DEVOPS_BASE_URL = "https://dev.azure.com/aiwhisperer"
$env:FILESYSTEM_ROOT = "C:\Users\kyrian\Documents\Company-Information"
$env:FILESYSTEM_ALLOW_WRITE = "false"

Write-Host "`nEnvironment variables configured:" -ForegroundColor Green
Write-Host "  ✅ GITHUB_TOKEN: [SET]" -ForegroundColor Green
Write-Host "  ✅ AZURE_DEVOPS_PAT: [SET]" -ForegroundColor Green
Write-Host "  ✅ AZURE_DEVOPS_ORG: $env:AZURE_DEVOPS_ORG" -ForegroundColor Green
Write-Host "  ✅ AZURE_DEVOPS_PROJECT: $env:AZURE_DEVOPS_PROJECT" -ForegroundColor Green
Write-Host "  ✅ FILESYSTEM_ROOT: $env:FILESYSTEM_ROOT" -ForegroundColor Green

# Test Azure DevOps connection
Write-Host "`nTesting Azure DevOps connection..." -ForegroundColor Yellow
$base64AuthInfo = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes(":$env:AZURE_DEVOPS_PAT"))
$headers = @{
    Authorization = "Basic $base64AuthInfo"
    'Content-Type' = 'application/json'
}

try {
    $uri = "https://dev.azure.com/$env:AZURE_DEVOPS_ORG/_apis/projects?api-version=7.0"
    $projects = Invoke-RestMethod -Uri $uri -Headers $headers -Method Get -TimeoutSec 10
    Write-Host "  ✅ Azure DevOps: Connected to $($projects.count) projects" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Azure DevOps: Connection failed" -ForegroundColor Red
}

# Test GitHub connection
Write-Host "`nTesting GitHub connection..." -ForegroundColor Yellow
$githubHeaders = @{
    Authorization = "Bearer $env:GITHUB_TOKEN"
    Accept = "application/vnd.github.v3+json"
}

try {
    $user = Invoke-RestMethod -Uri "https://api.github.com/user" -Headers $githubHeaders -Method Get -TimeoutSec 10
    Write-Host "  ✅ GitHub: Authenticated as $($user.login)" -ForegroundColor Green
} catch {
    Write-Host "  ❌ GitHub: Connection failed" -ForegroundColor Red
}

# Run the health check
Write-Host "`n" + ("=" * 50) -ForegroundColor Cyan
Write-Host "Running Full Health Check..." -ForegroundColor Yellow
Write-Host ("=" * 50) -ForegroundColor Cyan

& "$PSScriptRoot\mcp-health-check.ps1" -Mode Check