# Integration Tests for Excalibur Command DryRun
Import-Module "$PSScriptRoot\..\TestHelpers.psm1" -Force

Describe "Excalibur Command Integration" {
    BeforeAll {
        $script:ScriptPath = "C:\Users\kyrian\Documents\Company-Information\scripts\excalibur-command.ps1"
        $script:Prerequisites = Test-ScriptPrerequisites -ScriptPath $script:ScriptPath
        $script:TestTodosDir = Join-Path $TestDrive "test-todos"
        $script:TestLogsDir = Join-Path $TestDrive "test-logs"

        # Create test directories
        New-Item -ItemType Directory -Path $script:TestTodosDir -Force | Out-Null
        New-Item -ItemType Directory -Path $script:TestLogsDir -Force | Out-Null
    }

    Context "Script Validation" {
        It "Should verify script exists" {
            $script:Prerequisites.ScriptExists | Should -Be $true
        }

        It "Should have correct script structure" -Skip:(-not $script:Prerequisites.ScriptExists) {
            $Content = Get-Content $script:ScriptPath -Raw
            $Content | Should -Match "param\s*\("
            $Content | Should -Match '\$OrganizationName'
            $Content | Should -Match '\$TodosDirectory'
            $Content | Should -Match "Write-ExcaliburLog"
        }

        It "Should support expected parameters" -Skip:(-not $script:Prerequisites.ScriptExists) {
            $Content = Get-Content $script:ScriptPath -Raw
            $Content | Should -Match '\[string\]\$Action'
            $Content | Should -Match '\[switch\]\$DryRun'
            $Content | Should -Match '\[switch\]\$Verbose'
        }
    }

    Context "DryRun Execution" {
        It "Should execute with DryRun parameter without making changes" -Skip:(-not $script:Prerequisites.ScriptExists) {
            $InitialTodoCount = (Get-ChildItem $script:TestTodosDir -Filter "*.md" -ErrorAction SilentlyContinue).Count

            { & $script:ScriptPath -DryRun -Verbose } | Should -Not -Throw

            $FinalTodoCount = (Get-ChildItem $script:TestTodosDir -Filter "*.md" -ErrorAction SilentlyContinue).Count
            $FinalTodoCount | Should -Be $InitialTodoCount
        }

        It "Should produce DRY RUN markers in output" -Skip:(-not $script:Prerequisites.ScriptExists) {
            $Output = & $script:ScriptPath -DryRun -Verbose 2>&1 | Out-String

            Assert-DryRunMarkers -Output $Output -ScriptName "excalibur-command.ps1"
        }

        It "Should only access allowlisted paths" -Skip:(-not $script:Prerequisites.ScriptExists) {
            $Output = & $script:ScriptPath -DryRun -Verbose 2>&1 | Out-String

            Assert-PathAllowlist -Output $Output -AllowedPaths @("project-todos", "logs")
        }

        It "Should log to appropriate log file" -Skip:(-not $script:Prerequisites.ScriptExists) {
            $PreLogCount = (Get-ChildItem "C:\Users\kyrian\Documents\Company-Information\logs" -Filter "excalibur-*.log" -ErrorAction SilentlyContinue).Count

            & $script:ScriptPath -DryRun -Verbose 2>&1 | Out-Null

            $PostLogCount = (Get-ChildItem "C:\Users\kyrian\Documents\Company-Information\logs" -Filter "excalibur-*.log" -ErrorAction SilentlyContinue).Count
            $PostLogCount | Should -BeGreaterThan $PreLogCount
        }

        It "Should handle missing GitHub CLI gracefully" -Skip:$script:Prerequisites.GitHubCLI {
            $Output = & $script:ScriptPath -Action test -Verbose 2>&1 | Out-String

            $Output | Should -Match "GitHub CLI"
        }
    }

    Context "Test Action" {
        It "Should support test action for prerequisites check" -Skip:(-not $script:Prerequisites.ScriptExists) {
            { & $script:ScriptPath -Action test } | Should -Not -Throw
        }

        It "Should report GitHub CLI status" -Skip:(-not $script:Prerequisites.ScriptExists) {
            $Output = & $script:ScriptPath -Action test -Verbose 2>&1 | Out-String

            $Output | Should -Match "(found|not found|GitHub CLI|authenticated)"
        }

        It "Should check authentication status" -Skip:(-not $script:Prerequisites.ScriptExists -or -not $script:Prerequisites.GitHubCLI) {
            $Output = & $script:ScriptPath -Action test -Verbose 2>&1 | Out-String

            $Output | Should -Match "(authentication|auth|login)"
        }

        It "Should return appropriate exit code" -Skip:(-not $script:Prerequisites.ScriptExists) {
            & $script:ScriptPath -Action test 2>&1 | Out-Null

            if ($script:Prerequisites.GitHubCLI) {
                $LASTEXITCODE | Should -BeIn @(0, 1)
            }
        }
    }

    Context "Help Action" {
        It "Should display help information" -Skip:(-not $script:Prerequisites.ScriptExists) {
            $Output = & $script:ScriptPath -Action help 2>&1 | Out-String

            $Output | Should -Match "(Usage|help|Excalibur|sync)"
        }

        It "Should describe available actions" -Skip:(-not $script:Prerequisites.ScriptExists) {
            $Output = & $script:ScriptPath -Action help 2>&1 | Out-String

            $Output | Should -Match "(sync|test|help)"
        }

        It "Should describe parameters" -Skip:(-not $script:Prerequisites.ScriptExists) {
            $Output = & $script:ScriptPath -Action help 2>&1 | Out-String

            $Output | Should -Match "(DryRun|Verbose)"
        }
    }

    Context "Sync Action Validation" {
        It "Should default to sync action" -Skip:(-not $script:Prerequisites.ScriptExists) {
            $Content = Get-Content $script:ScriptPath -Raw
            $Content | Should -Match '\$Action\s*=\s*"sync"'
        }

        It "Should have repository fetching function" -Skip:(-not $script:Prerequisites.ScriptExists) {
            $Content = Get-Content $script:ScriptPath -Raw
            $Content | Should -Match "function\s+Get-OrganizationRepositories"
        }

        It "Should have todo update function" -Skip:(-not $script:Prerequisites.ScriptExists) {
            $Content = Get-Content $script:ScriptPath -Raw
            $Content | Should -Match "function.*Update-TodoFile|function.*Write-TodoContent"
        }
    }

    Context "Error Handling" {
        It "Should handle invalid action gracefully" -Skip:(-not $script:Prerequisites.ScriptExists) {
            $Output = & $script:ScriptPath -Action "invalid-action" 2>&1 | Out-String

            $Output | Should -Match "(Invalid|Unknown|not supported|Usage)"
        }

        It "Should handle missing dependencies" -Skip:(-not $script:Prerequisites.ScriptExists) {
            $Output = & $script:ScriptPath -Action sync -DryRun 2>&1 | Out-String

            if (-not $script:Prerequisites.GitHubCLI) {
                $Output | Should -Match "(GitHub CLI|gh|not installed|not found)"
            }
        }

        It "Should create log directory if missing" -Skip:(-not $script:Prerequisites.ScriptExists) {
            # This is tested by checking if log directory creation is in the script
            $Content = Get-Content $script:ScriptPath -Raw
            $Content | Should -Match "if.*Test-Path.*LogDir|New-Item.*Directory.*log"
        }
    }

    Context "Output Validation" {
        It "Should produce structured output" -Skip:(-not $script:Prerequisites.ScriptExists -or -not $script:Prerequisites.GitHubCLI) {
            $Output = & $script:ScriptPath -Action test -Verbose 2>&1 | Out-String

            # Check for structured logging format
            $Output | Should -Match "\[(INFO|WARN|ERROR|SUCCESS|DEBUG)\]"
        }

        It "Should respect Verbose flag" -Skip:(-not $script:Prerequisites.ScriptExists) {
            $NormalOutput = & $script:ScriptPath -Action test 2>&1 | Out-String
            $VerboseOutput = & $script:ScriptPath -Action test -Verbose 2>&1 | Out-String

            # Verbose output should be longer
            $VerboseOutput.Length | Should -BeGreaterThan $NormalOutput.Length
        }
    }

    AfterAll {
        # Clean up test directories
        if (Test-Path $script:TestTodosDir) {
            Remove-Item $script:TestTodosDir -Recurse -Force
        }
        if (Test-Path $script:TestLogsDir) {
            Remove-Item $script:TestLogsDir -Recurse -Force
        }
    }
}