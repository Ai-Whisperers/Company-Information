# Policy Tests for Approval Gate Enforcement  
Import-Module "$PSScriptRoot\..\TestHelpers.psm1" -Force

Describe "Approval Gate Policy" {
    
    Context "Claude Settings Approval Gate" {
        It "Should have .claude directory present" {
            $ClaudeDir = "C:\Users\kyrian\Documents\Company-Information\.claude"
            
            $ClaudeDir | Should -Exist
        }
        
        It "Should have settings.local.json with permissions" {
            $SettingsPath = "C:\Users\kyrian\Documents\Company-Information\.claude\settings.local.json"
            
            $SettingsPath | Should -Exist
            
            $Settings = Get-Content $SettingsPath | ConvertFrom-Json
            $Settings.permissions | Should -Not -BeNullOrEmpty
        }
        
        It "Should contain approval restrictions in settings" {
            $SettingsPath = "C:\Users\kyrian\Documents\Company-Information\.claude\settings.local.json"
            $Content = Get-Content $SettingsPath -Raw
            
            # Should have permissions structure indicating approval gates
            $Content | Should -Match '"permissions"'
            $Content | Should -Match '("allow"|"deny"|"ask")'
        }
    }
    
    Context "Approval Gate Text Presence" {
        It "Should have approval gate documentation in CLAUDE.md" {
            $ClaudemdPath = "C:\Users\kyrian\Documents\Company-Information\CLAUDE.md"
            
            if (Test-Path $ClaudemdPath) {
                $Content = Get-Content $ClaudemdPath -Raw
                
                # Should contain approval or permission-related text
                $Content | Should -Match "(approval|permission|APPROVE|ask|gate)"
            } else {
                Set-ItResult -Skipped -Because "CLAUDE.md not found"
            }
        }
        
        It "Should have write restrictions documented" {
            $ClaudemdPath = "C:\Users\kyrian\Documents\Company-Information\CLAUDE.md"
            
            if (Test-Path $ClaudemdPath) {
                $Content = Get-Content $ClaudemdPath -Raw
                
                # Should mention write restrictions or test-only writes
                $Content | Should -Match "(write|edit|modify|create.*file)"
            } else {
                Set-ItResult -Skipped -Because "CLAUDE.md not found"
            }
        }
    }
    
    Context "Idempotency Testing" {
        It "Should produce identical output on repeated DryRun" {
            $ScriptPath = "C:\Users\kyrian\Documents\Company-Information\scripts\excalibur-command.ps1"
            
            if (Test-Path $ScriptPath) {
                $Output1 = & $ScriptPath -DryRun -Verbose 2>&1 | Out-String
                $Output2 = & $ScriptPath -DryRun -Verbose 2>&1 | Out-String
                
                $Hash1 = Get-ScriptHashOutput -Output $Output1
                $Hash2 = Get-ScriptHashOutput -Output $Output2
                
                $Hash1 | Should -BeExactly $Hash2
            } else {
                Set-ItResult -Skipped -Because "excalibur-command.ps1 not found"
            }
        }
        
        It "Should produce consistent azure-devops-sync DryRun output" {
            $ScriptPath = "C:\Users\kyrian\Documents\Company-Information\scripts\azure-devops-sync.ps1"
            
            if (Test-Path $ScriptPath) {
                $Output1 = & $ScriptPath -DryRun -Verbose 2>&1 | Out-String
                $Output2 = & $ScriptPath -DryRun -Verbose 2>&1 | Out-String
                
                $Hash1 = Get-ScriptHashOutput -Output $Output1  
                $Hash2 = Get-ScriptHashOutput -Output $Output2
                
                $Hash1 | Should -BeExactly $Hash2
            } else {
                Set-ItResult -Skipped -Because "azure-devops-sync.ps1 not found"
            }
        }
        
        It "Should produce consistent weekly-activity-report output" {
            $ScriptPath = "C:\Users\kyrian\Documents\Company-Information\scripts\weekly-activity-report.ps1"
            
            if (Test-Path $ScriptPath) {
                # Use -Days 1 for faster, more predictable results
                $Output1 = & $ScriptPath -Days 1 2>&1 | Out-String
                $Output2 = & $ScriptPath -Days 1 2>&1 | Out-String
                
                $Hash1 = Get-ScriptHashOutput -Output $Output1
                $Hash2 = Get-ScriptHashOutput -Output $Output2
                
                $Hash1 | Should -BeExactly $Hash2
            } else {
                Set-ItResult -Skipped -Because "weekly-activity-report.ps1 not found"
            }
        }
    }
    
    Context "Write Protection Validation" {
        It "Should detect attempts to write outside tests directory" {
            # This is a policy test - we simulate what would happen
            $DisallowedWrite = "Creating C:\repo\azure-pipelines.yml"
            
            { Assert-PathAllowlist -Output $DisallowedWrite } | Should -Throw
        }
        
        It "Should allow writes only to allowlisted directories" {
            $AllowedWrite = "Creating C:\repo\project-todos\new-item.md"
            
            { Assert-PathAllowlist -Output $AllowedWrite } | Should -Not -Throw  
        }
        
        It "Should enforce tests-only write policy for new files" {
            # Test files should be in tests/ directory
            $TestFiles = @(
                "C:\Users\kyrian\Documents\Company-Information\tests\package.json",
                "C:\Users\kyrian\Documents\Company-Information\tests\pester\TestHelpers.psm1"
            )
            
            foreach ($TestFile in $TestFiles) {
                $TestFile | Should -Exist
                $TestFile | Should -Match "tests[/\\]"
            }
        }
    }
}