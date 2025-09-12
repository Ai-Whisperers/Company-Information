# Integration Tests for Azure DevOps Sync DryRun
Import-Module "$PSScriptRoot\..\TestHelpers.psm1" -Force

Describe "Azure DevOps Sync Integration" {
    BeforeAll {
        $ScriptPath = "C:\Users\kyrian\Documents\Company-Information\scripts\azure-devops-sync.ps1"
        $Prerequisites = Test-ScriptPrerequisites -ScriptPath $ScriptPath
    }
    
    Context "DryRun Execution" {
        It "Should execute with DryRun parameter" -Skip:(-not $Prerequisites.ScriptExists) {
            { & $ScriptPath -DryRun -Verbose } | Should -Not -Throw
        }
        
        It "Should produce DRY RUN markers in output" -Skip:(-not $Prerequisites.ScriptExists) {
            $Output = & $ScriptPath -DryRun -Verbose 2>&1 | Out-String
            
            # Check for DRY RUN indicators
            $Output | Should -Match "(DRY RUN|Would create|Would update|No changes)"
        }
        
        It "Should only access allowlisted paths" -Skip:(-not $Prerequisites.ScriptExists) {
            $Output = & $ScriptPath -DryRun -Verbose 2>&1 | Out-String
            
            Assert-PathAllowlist -Output $Output -AllowedPaths @("azure-sync-logs", "logs")
        }
    }
    
    Context "Status Action" {
        It "Should support status action" -Skip:(-not $Prerequisites.ScriptExists) {
            { & $ScriptPath -Action status } | Should -Not -Throw
        }
        
        It "Should report Azure CLI status" -Skip:(-not $Prerequisites.ScriptExists) {
            $Output = & $ScriptPath -Action status -Verbose 2>&1 | Out-String
            
            $Output | Should -Match "(Azure|CLI|authentication|status)"
        }
    }
    
    Context "Test Action" {
        It "Should support test action for prerequisites" -Skip:(-not $Prerequisites.ScriptExists) {
            { & $ScriptPath -Action test } | Should -Not -Throw
        }
        
        It "Should validate prerequisites" -Skip:(-not $Prerequisites.ScriptExists) {
            $Output = & $ScriptPath -Action test -Verbose 2>&1 | Out-String
            
            $Output | Should -Match "(Azure CLI|prerequisite|test)"
        }
    }
    
    Context "Configuration Validation" {
        It "Should handle organization parameter" -Skip:(-not $Prerequisites.ScriptExists) {
            { & $ScriptPath -Organization "test-org" -Action status } | Should -Not -Throw
        }
        
        It "Should handle project parameter" -Skip:(-not $Prerequisites.ScriptExists) {
            { & $ScriptPath -Organization "test-org" -Project "test-project" -Action status } | Should -Not -Throw
        }
    }
}