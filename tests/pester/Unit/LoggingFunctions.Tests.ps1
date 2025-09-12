# Unit Tests for Logging Functions
Import-Module "$PSScriptRoot\..\TestHelpers.psm1" -Force

Describe "Logging Functions" {
    
    Context "Assert-DryRunMarkers" {
        It "Should detect DRY RUN markers in output" {
            $Output = "Starting process...`nDRY RUN: Would create file.txt`nCompleted"
            
            { Assert-DryRunMarkers -Output $Output -ScriptName "TestScript" } | Should -Not -Throw
        }
        
        It "Should detect 'Would create' markers" {
            $Output = "Processing...`nWould create directory: C:\temp\test`nFinished"
            
            { Assert-DryRunMarkers -Output $Output -ScriptName "TestScript" } | Should -Not -Throw
        }
        
        It "Should detect 'Would update' markers" {
            $Output = "Checking files...`nWould update existing-file.md`nDone"
            
            { Assert-DryRunMarkers -Output $Output -ScriptName "TestScript" } | Should -Not -Throw
        }
        
        It "Should throw when no DRY RUN markers found" {
            $Output = "Regular execution output`nCreated file.txt`nCompleted successfully"
            
            { Assert-DryRunMarkers -Output $Output -ScriptName "TestScript" } | Should -Throw "*did not produce expected DRY RUN markers*"
        }
    }
    
    Context "Assert-PathAllowlist" {
        It "Should allow paths in allowlist" {
            $Output = "Creating C:\path\project-todos\file.md`nUpdating C:\path\logs\output.log"
            
            { Assert-PathAllowlist -Output $Output } | Should -Not -Throw
        }
        
        It "Should throw for disallowed paths" {
            $Output = "Writing C:\Windows\System32\malicious.exe"
            
            { Assert-PathAllowlist -Output $Output } | Should -Throw "*attempted to access disallowed path*"
        }
        
        It "Should handle multiple allowed paths" {
            $AllowedPaths = @("project-todos", "logs", "test-output")
            $Output = "Path: C:\repo\test-output\results.json`nCreating C:\repo\logs\debug.log"
            
            { Assert-PathAllowlist -Output $Output -AllowedPaths $AllowedPaths } | Should -Not -Throw
        }
        
        It "Should handle no path references gracefully" {
            $Output = "Script completed successfully with no file operations"
            
            { Assert-PathAllowlist -Output $Output } | Should -Not -Throw
        }
    }
}