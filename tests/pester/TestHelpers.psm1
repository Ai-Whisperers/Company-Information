# Test Helpers Module for AI-Whisperers PowerShell Tests

function Assert-DryRunMarkers {
    param(
        [string]$Output,
        [string]$ScriptName
    )
    
    $DryRunMarkers = @(
        "DRY RUN",
        "Would create",
        "Would update",
        "Would sync",
        "No changes applied"
    )
    
    $Found = $false
    foreach ($Marker in $DryRunMarkers) {
        if ($Output -match $Marker) {
            $Found = $true
            break
        }
    }
    
    if (-not $Found) {
        throw "Script $ScriptName did not produce expected DRY RUN markers in output"
    }
}

function Assert-PathAllowlist {
    param(
        [string]$Output,
        [string[]]$AllowedPaths = @("project-todos", "logs", "azure-sync-logs", "enhanced-documentation")
    )
    
    # Extract any file paths from output using common patterns
    $PathPatterns = @(
        'Creating.*?([A-Za-z]:\\[^"\s]+)',
        'Writing.*?([A-Za-z]:\\[^"\s]+)',
        'Updating.*?([A-Za-z]:\\[^"\s]+)',
        'Path:\s*([A-Za-z]:\\[^"\s]+)'
    )
    
    foreach ($Pattern in $PathPatterns) {
        $Matches = [regex]::Matches($Output, $Pattern)
        foreach ($Match in $Matches) {
            $FilePath = $Match.Groups[1].Value
            $IsAllowed = $false
            
            foreach ($AllowedPath in $AllowedPaths) {
                if ($FilePath -like "*$AllowedPath*") {
                    $IsAllowed = $true
                    break
                }
            }
            
            if (-not $IsAllowed) {
                throw "Script attempted to access disallowed path: $FilePath"
            }
        }
    }
}

function Get-ScriptHashOutput {
    param(
        [string]$Output
    )
    
    # Normalize timestamps and dynamic content for consistent hashing
    $Normalized = $Output -replace '\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}', 'TIMESTAMP'
    $Normalized = $Normalized -replace '\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}', 'TIMESTAMP'
    $Normalized = $Normalized -replace 'Generated: .*', 'Generated: TIMESTAMP'
    $Normalized = $Normalized -replace 'Last Updated: .*', 'Last Updated: TIMESTAMP'
    
    return $Normalized
}

function Test-ScriptPrerequisites {
    param(
        [string]$ScriptPath
    )
    
    $Prerequisites = @{
        GitHubCLI = (Get-Command gh -ErrorAction SilentlyContinue) -ne $null
        PowerShellVersion = $PSVersionTable.PSVersion.Major -ge 5
        ScriptExists = Test-Path $ScriptPath
    }
    
    return $Prerequisites
}

Export-ModuleMember -Function Assert-DryRunMarkers, Assert-PathAllowlist, Get-ScriptHashOutput, Test-ScriptPrerequisites