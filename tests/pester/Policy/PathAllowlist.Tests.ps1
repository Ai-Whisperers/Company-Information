# Policy Tests for Path Allowlist Enforcement
Import-Module "$PSScriptRoot\..\TestHelpers.psm1" -Force

Describe "Path Allowlist Policy" {

    BeforeAll {
        $script:AllowedPaths = @(
            "project-todos",
            "logs",
            "azure-sync-logs",
            "enhanced-documentation",
            "scripts\..*reports"
        )
    }
    
    Context "Allowlist Path Validation" {
        It "Should allow project-todos directory access" {
            $Output = "Creating C:\repo\project-todos\new-file.md"

            { Assert-PathAllowlist -Output $Output -AllowedPaths $script:AllowedPaths } | Should -Not -Throw
        }
        
        It "Should allow logs directory access" {
            $Output = "Writing C:\path\logs\excalibur-20240115.log"

            { Assert-PathAllowlist -Output $Output -AllowedPaths $script:AllowedPaths } | Should -Not -Throw
        }
        
        It "Should allow azure-sync-logs directory access" {
            $Output = "Path: C:\repo\azure-sync-logs\sync-results.json"

            { Assert-PathAllowlist -Output $Output -AllowedPaths $script:AllowedPaths } | Should -Not -Throw
        }
        
        It "Should allow enhanced-documentation directory access" {
            $Output = "Updating C:\repo\enhanced-documentation\README.md"

            { Assert-PathAllowlist -Output $Output -AllowedPaths $script:AllowedPaths } | Should -Not -Throw
        }
        
        It "Should allow scripts reports subdirectory access" {
            $Output = "Creating C:\repo\scripts\weekly\reports\activity.html"

            { Assert-PathAllowlist -Output $Output -AllowedPaths $script:AllowedPaths } | Should -Not -Throw
        }
    }
    
    Context "Disallowed Path Detection" {
        It "Should reject system directory access" {
            $Output = "Writing C:\Windows\System32\malware.exe"

            { Assert-PathAllowlist -Output $Output -AllowedPaths $script:AllowedPaths } | Should -Throw
        }
        
        It "Should reject Program Files access" {
            $Output = "Creating C:\Program Files\BadApp\virus.dll"

            { Assert-PathAllowlist -Output $Output -AllowedPaths $script:AllowedPaths } | Should -Throw
        }
        
        It "Should reject user profile access" {
            $Output = "Path: C:\Users\victim\Documents\sensitive.txt"

            { Assert-PathAllowlist -Output $Output -AllowedPaths $script:AllowedPaths } | Should -Throw
        }
        
        It "Should reject repository root access" {
            $Output = "Updating C:\repo\azure-pipelines.yml"

            { Assert-PathAllowlist -Output $Output -AllowedPaths $script:AllowedPaths } | Should -Throw
        }
        
        It "Should reject azure-work-items access" {
            $Output = "Creating C:\repo\azure-work-items\Epic-001\malicious.ps1"

            { Assert-PathAllowlist -Output $Output -AllowedPaths $script:AllowedPaths } | Should -Throw
        }
    }
    
    Context "Edge Cases" {
        It "Should handle mixed allowed and disallowed paths" {
            $Output = @"
Creating C:\repo\project-todos\valid.md
Writing C:\repo\logs\valid.log  
Updating C:\Windows\System32\invalid.exe
"@

            { Assert-PathAllowlist -Output $Output -AllowedPaths $script:AllowedPaths } | Should -Throw
        }
        
        It "Should handle no path references" {
            $Output = "Script completed successfully with no file operations."

            { Assert-PathAllowlist -Output $Output -AllowedPaths $script:AllowedPaths } | Should -Not -Throw
        }
        
        It "Should handle relative path patterns" {
            $Output = "Creating .\logs\relative.log"

            { Assert-PathAllowlist -Output $Output -AllowedPaths $script:AllowedPaths } | Should -Not -Throw
        }
    }
    
    Context "Script-Specific Allowlist Testing" {
        It "Should verify excalibur-command.ps1 respects allowlist" {
            $ScriptPath = "C:\Users\kyrian\Documents\Company-Information\scripts\excalibur-command.ps1"
            
            if (Test-Path $ScriptPath) {
                $Output = & $ScriptPath -DryRun -Verbose 2>&1 | Out-String
                
                { Assert-PathAllowlist -Output $Output -AllowedPaths @("project-todos", "logs") } | Should -Not -Throw
            } else {
                Set-ItResult -Skipped -Because "excalibur-command.ps1 not found"
            }
        }
        
        It "Should verify azure-devops-sync.ps1 respects allowlist" {
            $ScriptPath = "C:\Users\kyrian\Documents\Company-Information\scripts\azure-devops-sync.ps1"
            
            if (Test-Path $ScriptPath) {
                $Output = & $ScriptPath -DryRun -Verbose 2>&1 | Out-String
                
                { Assert-PathAllowlist -Output $Output -AllowedPaths @("azure-sync-logs", "logs") } | Should -Not -Throw
            } else {
                Set-ItResult -Skipped -Because "azure-devops-sync.ps1 not found"
            }
        }
    }
}