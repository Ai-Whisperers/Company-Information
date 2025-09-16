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

        It "Should return false for non-existent script" {
            $Result = Test-ScriptPrerequisites -ScriptPath "C:\does\not\exist.ps1"
            $Result.ScriptExists | Should -Be $false
        }

        It "Should return hashtable with all expected keys" {
            $Result = Test-ScriptPrerequisites -ScriptPath "C:\fake\path.ps1"
            $Result.Keys | Should -Contain "GitHubCLI"
            $Result.Keys | Should -Contain "PowerShellVersion"
            $Result.Keys | Should -Contain "ScriptExists"
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

        It "Should handle empty input" {
            $Result = Get-ScriptHashOutput -Output ""
            $Result | Should -BeOfType [string]
            $Result | Should -BeExactly ""
        }

        It "Should normalize multiple timestamp formats" {
            $Input = @"
Generated: 2024-01-15 14:30:15
Last Updated: 2024-01-15T14:30:15Z
Time: 2024-01-15 14:30:15
Data content here
"@
            $Result = Get-ScriptHashOutput -Output $Input
            $Result | Should -Match "TIMESTAMP"
            $Result | Should -Not -Match "\d{4}-\d{2}-\d{2}"
        }

        It "Should preserve non-timestamp content" {
            $Input = "Important data: 123`nUser: TestUser`nValue: 456.78"
            $Result = Get-ScriptHashOutput -Output $Input
            $Result | Should -Match "Important data: 123"
            $Result | Should -Match "User: TestUser"
            $Result | Should -Match "Value: 456.78"
        }
    }

    Context "Assert-DryRunMarkers" {
        It "Should pass when DRY RUN markers are present" {
            $Output = "DRY RUN: Would create file`nNo changes applied"
            { Assert-DryRunMarkers -Output $Output -ScriptName "test.ps1" } | Should -Not -Throw
        }

        It "Should pass when 'Would create' marker is present" {
            $Output = "Would create directory: C:\test"
            { Assert-DryRunMarkers -Output $Output -ScriptName "test.ps1" } | Should -Not -Throw
        }

        It "Should pass when 'Would update' marker is present" {
            $Output = "Would update configuration file"
            { Assert-DryRunMarkers -Output $Output -ScriptName "test.ps1" } | Should -Not -Throw
        }

        It "Should pass when 'Would sync' marker is present" {
            $Output = "Would sync files to repository"
            { Assert-DryRunMarkers -Output $Output -ScriptName "test.ps1" } | Should -Not -Throw
        }

        It "Should throw when no DRY RUN markers are present" {
            $Output = "Created file successfully`nUpdated configuration"
            { Assert-DryRunMarkers -Output $Output -ScriptName "test.ps1" } | Should -Throw
        }

        It "Should include script name in error message" {
            $Output = "Regular output without dry run markers"
            try {
                Assert-DryRunMarkers -Output $Output -ScriptName "specific-script.ps1"
            }
            catch {
                $_.Exception.Message | Should -Match "specific-script.ps1"
            }
        }
    }

    Context "Assert-PathAllowlist" {
        It "Should pass for allowed paths" {
            $Output = "Creating file in project-todos\test.md"
            { Assert-PathAllowlist -Output $Output } | Should -Not -Throw
        }

        It "Should pass for logs directory" {
            $Output = "Writing to C:\Users\test\logs\output.log"
            { Assert-PathAllowlist -Output $Output } | Should -Not -Throw
        }

        It "Should pass for azure-sync-logs directory" {
            $Output = "Path: C:\project\azure-sync-logs\sync.log"
            { Assert-PathAllowlist -Output $Output } | Should -Not -Throw
        }

        It "Should throw for disallowed system paths" {
            $Output = "Writing to C:\Windows\System32\config.sys"
            { Assert-PathAllowlist -Output $Output } | Should -Throw
        }

        It "Should handle custom allowed paths" {
            $Output = "Creating C:\custom\allowed\file.txt"
            { Assert-PathAllowlist -Output $Output -AllowedPaths @("custom\allowed") } | Should -Not -Throw
        }

        It "Should handle multiple path patterns in output" {
            $Output = @"
Creating C:\test\project-todos\file1.md
Updating C:\test\logs\log.txt
Writing C:\test\enhanced-documentation\doc.md
"@
            { Assert-PathAllowlist -Output $Output } | Should -Not -Throw
        }

        It "Should throw with specific disallowed path in error" {
            $Output = "Writing to C:\Program Files\app.exe"
            try {
                Assert-PathAllowlist -Output $Output
            }
            catch {
                $_.Exception.Message | Should -Match "C:\\Program Files\\app.exe"
            }
        }
    }
}