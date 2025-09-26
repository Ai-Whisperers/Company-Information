# Quick MCP Test with configured GitHub token
Write-Host "`n=== Quick MCP Configuration Test ===" -ForegroundColor Cyan

# Set the GitHub token for this session
$env:GITHUB_TOKEN = "***REMOVED***"

# Also set some reasonable defaults for filesystem
$env:FILESYSTEM_ROOT = "C:\Users\kyrian\Documents\Company-Information"
$env:FILESYSTEM_ALLOW_WRITE = "false"

Write-Host "`nEnvironment variables configured for session:" -ForegroundColor Green
Write-Host "  GITHUB_TOKEN: [SET]" -ForegroundColor Green
Write-Host "  FILESYSTEM_ROOT: $env:FILESYSTEM_ROOT" -ForegroundColor Green
Write-Host "  FILESYSTEM_ALLOW_WRITE: $env:FILESYSTEM_ALLOW_WRITE" -ForegroundColor Green

# Now run the health check
Write-Host "`nRunning health check..." -ForegroundColor Yellow
& "$PSScriptRoot\mcp-health-check.ps1" -Mode Check