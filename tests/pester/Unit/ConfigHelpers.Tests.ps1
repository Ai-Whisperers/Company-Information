# Unit Tests for Configuration Helper Functions
Import-Module "$PSScriptRoot\..\TestHelpers.psm1" -Force

Describe "Configuration Helper Functions" {
    
    Context "Test-ScriptPrerequisites" {
        It "Should detect GitHub CLI availability" {
            $Result = Test-ScriptPrerequisites -ScriptPath "C:\fake\path.ps1"
            $Result.GitHubCLI | Should -BeOfType [bool]
        }
        
        It "Should validate PowerShell version" {
            $Result = Test-ScriptPrerequisites -ScriptPath "C:\fake\path.ps1"
            $Result.PowerShellVersion | Should -Be $true
        }
        
        It "Should check script file existence" {
            $TempScript = New-TemporaryFile
            $TempScript | Set-Content -Value "# Test Script"
            
            $Result = Test-ScriptPrerequisites -ScriptPath $TempScript.FullName
            $Result.ScriptExists | Should -Be $true
            
            Remove-Item $TempScript -Force
        }
    }
    
    Context "Get-ScriptHashOutput" {
        It "Should normalize timestamps consistently" {
            $Output1 = "Generated: 2024-01-15 14:30:15`nSome content"
            $Output2 = "Generated: 2024-12-25 09:45:30`nSome content"
            
            $Hash1 = Get-ScriptHashOutput -Output $Output1
            $Hash2 = Get-ScriptHashOutput -Output $Output2
            
            $Hash1 | Should -BeExactly $Hash2
        }
        
        It "Should normalize ISO timestamps" {
            $Output1 = "Last Updated: 2024-01-15T14:30:15Z`nData here"
            $Output2 = "Last Updated: 2024-12-25T09:45:30Z`nData here"
            
            $Hash1 = Get-ScriptHashOutput -Output $Output1
            $Hash2 = Get-ScriptHashOutput -Output $Output2
            
            $Hash1 | Should -BeExactly $Hash2
        }
    }
}