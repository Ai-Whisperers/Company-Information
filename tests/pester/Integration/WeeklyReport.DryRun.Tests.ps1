# Integration Tests for Weekly Activity Report
Import-Module "$PSScriptRoot\..\TestHelpers.psm1" -Force

Describe "Weekly Activity Report Integration" {
    BeforeAll {
        $ScriptPath = "C:\Users\kyrian\Documents\Company-Information\scripts\weekly-activity-report.ps1"
        $Prerequisites = Test-ScriptPrerequisites -ScriptPath $ScriptPath
    }
    
    Context "Basic Execution" {
        It "Should execute with default parameters" -Skip:(-not $Prerequisites.ScriptExists) {
            { & $ScriptPath } | Should -Not -Throw
        }
        
        It "Should accept Days parameter" -Skip:(-not $Prerequisites.ScriptExists) {
            { & $ScriptPath -Days 14 } | Should -Not -Throw
        }
        
        It "Should produce formatted report output" -Skip:(-not $Prerequisites.ScriptExists) {
            $Output = & $ScriptPath -Days 3 2>&1 | Out-String
            
            $Output | Should -Match "Weekly Activity Report"
            $Output | Should -Match "Report Period"
            $Output | Should -Match "Generated:"
        }
    }
    
    Context "GitHub Integration" {
        It "Should handle GitHub CLI availability" -Skip:(-not $Prerequisites.ScriptExists) {
            $Output = & $ScriptPath -Days 1 2>&1 | Out-String
            
            if (-not $Prerequisites.GitHubCLI) {
                $Output | Should -Match "(authentication|gh auth login)"
            } else {
                $Output | Should -Match "(COMMIT ACTIVITY|repositories)"
            }
        }
        
        It "Should report organization activity" -Skip:(-not ($Prerequisites.ScriptExists -and $Prerequisites.GitHubCLI)) {
            $Output = & $ScriptPath -Days 7 2>&1 | Out-String
            
            $Output | Should -Match "Ai-Whisperers"
        }
    }
    
    Context "Output Validation" {
        It "Should generate consistent output structure" -Skip:(-not $Prerequisites.ScriptExists) {
            $Output1 = & $ScriptPath -Days 1 2>&1 | Out-String
            $Output2 = & $ScriptPath -Days 1 2>&1 | Out-String
            
            # Normalize timestamps for comparison
            $Hash1 = Get-ScriptHashOutput -Output $Output1
            $Hash2 = Get-ScriptHashOutput -Output $Output2
            
            # Structure should be identical after normalization
            $Hash1 | Should -BeExactly $Hash2
        }
        
        It "Should include required report sections" -Skip:(-not $Prerequisites.ScriptExists) {
            $Output = & $ScriptPath -Days 7 2>&1 | Out-String
            
            $Output | Should -Match "📊 COMMIT ACTIVITY"
            $Output | Should -Match "AI-Whisperers Weekly Activity Report"
        }
    }
    
    Context "Error Handling" {
        It "Should handle invalid Days parameter gracefully" -Skip:(-not $Prerequisites.ScriptExists) {
            { & $ScriptPath -Days -1 } | Should -Not -Throw
        }
        
        It "Should handle very large Days parameter" -Skip:(-not $Prerequisites.ScriptExists) {
            { & $ScriptPath -Days 365 } | Should -Not -Throw
        }
    }
}