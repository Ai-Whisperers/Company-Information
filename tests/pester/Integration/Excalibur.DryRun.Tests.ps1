# Integration Tests for Excalibur Command DryRun
Import-Module "$PSScriptRoot\..\TestHelpers.psm1" -Force

Describe "Excalibur Command Integration" {
    BeforeAll {
        $ScriptPath = "C:\Users\kyrian\Documents\Company-Information\scripts\excalibur-command.ps1"
        $Prerequisites = Test-ScriptPrerequisites -ScriptPath $ScriptPath
    }
    
    Context "DryRun Execution" {
        It "Should execute with DryRun parameter" -Skip:(-not $Prerequisites.ScriptExists) {
            { & $ScriptPath -DryRun -Verbose } | Should -Not -Throw
        }
        
        It "Should produce DRY RUN markers in output" -Skip:(-not $Prerequisites.ScriptExists) {
            $Output = & $ScriptPath -DryRun -Verbose 2>&1 | Out-String
            
            Assert-DryRunMarkers -Output $Output -ScriptName "excalibur-command.ps1"
        }
        
        It "Should only access allowlisted paths" -Skip:(-not $Prerequisites.ScriptExists) {
            $Output = & $ScriptPath -DryRun -Verbose 2>&1 | Out-String
            
            Assert-PathAllowlist -Output $Output -AllowedPaths @("project-todos", "logs")
        }
        
        It "Should handle missing GitHub CLI gracefully" -Skip:$Prerequisites.GitHubCLI {
            $Output = & $ScriptPath -Action test -Verbose 2>&1 | Out-String
            
            $Output | Should -Match "GitHub CLI"
        }
    }
    
    Context "Test Action" {
        It "Should support test action for prerequisites" -Skip:(-not $Prerequisites.ScriptExists) {
            { & $ScriptPath -Action test } | Should -Not -Throw
        }
        
        It "Should report GitHub CLI status" -Skip:(-not $Prerequisites.ScriptExists) {
            $Output = & $ScriptPath -Action test -Verbose 2>&1 | Out-String
            
            $Output | Should -Match "(found|not found|GitHub CLI)"
        }
    }
    
    Context "Help Action" {
        It "Should display help information" -Skip:(-not $Prerequisites.ScriptExists) {
            $Output = & $ScriptPath -Action help 2>&1 | Out-String
            
            $Output | Should -Match "(Usage|help|Excalibur)"
        }
    }
}