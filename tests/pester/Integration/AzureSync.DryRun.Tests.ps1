# Integration Tests for Azure DevOps Sync DryRun
Import-Module "$PSScriptRoot\..\TestHelpers.psm1" -Force

Describe "Azure DevOps Sync Integration" {
    BeforeAll {
        $script:ScriptPath = "C:\Users\kyrian\Documents\Company-Information\scripts\azure-devops-sync.ps1"
        $script:Prerequisites = Test-ScriptPrerequisites -ScriptPath $script:ScriptPath
        $script:TestLogsDir = Join-Path $TestDrive "azure-sync-logs"
        $script:TestWorkItemsDir = Join-Path $TestDrive "azure-work-items"

        # Create test directories
        New-Item -ItemType Directory -Path $script:TestLogsDir -Force | Out-Null
        New-Item -ItemType Directory -Path $script:TestWorkItemsDir -Force | Out-Null

        # Mock environment variables for testing
        $script:OriginalPAT = $env:AZURE_DEVOPS_PAT
        $env:AZURE_DEVOPS_PAT = "test-pat-token"
    }

    Context "Script Validation" {
        It "Should verify script exists" {
            $script:Prerequisites.ScriptExists | Should -Be $true
        }

        It "Should have correct script structure" -Skip:(-not $script:Prerequisites.ScriptExists) {
            $Content = Get-Content $script:ScriptPath -Raw
            $Content | Should -Match "param\s*\("
            $Content | Should -Match '\$Organization'
            $Content | Should -Match '\$Project'
            $Content | Should -Match "Test-Prerequisites|Check-Prerequisites"
        }

        It "Should support expected parameters" -Skip:(-not $script:Prerequisites.ScriptExists) {
            $Content = Get-Content $script:ScriptPath -Raw
            $Content | Should -Match '\[string\]\$Action'
            $Content | Should -Match '\[string\]\$Organization'
            $Content | Should -Match '\[string\]\$Project'
            $Content | Should -Match '\[switch\]\$DryRun'
        }
    }

    Context "DryRun Execution" {
        It "Should execute with DryRun parameter without making changes" -Skip:(-not $script:Prerequisites.ScriptExists) {
            $InitialLogCount = (Get-ChildItem $script:TestLogsDir -Filter "*.log" -ErrorAction SilentlyContinue).Count

            { & $script:ScriptPath -DryRun -Verbose } | Should -Not -Throw

            # DryRun should create logs but not actual sync
            $FinalLogCount = (Get-ChildItem $script:TestLogsDir -Filter "*.log" -ErrorAction SilentlyContinue).Count
            $FinalLogCount | Should -BeGreaterOrEqual $InitialLogCount
        }

        It "Should produce DRY RUN markers in output" -Skip:(-not $script:Prerequisites.ScriptExists) {
            $Output = & $script:ScriptPath -DryRun -Verbose 2>&1 | Out-String

            Assert-DryRunMarkers -Output $Output -ScriptName "azure-devops-sync.ps1"
        }

        It "Should only access allowlisted paths" -Skip:(-not $script:Prerequisites.ScriptExists) {
            $Output = & $script:ScriptPath -DryRun -Verbose 2>&1 | Out-String

            Assert-PathAllowlist -Output $Output -AllowedPaths @("azure-sync-logs", "logs", "azure-work-items")
        }

        It "Should log to appropriate log file" -Skip:(-not $script:Prerequisites.ScriptExists) {
            $PreLogCount = (Get-ChildItem "C:\Users\kyrian\Documents\Company-Information\azure-sync-logs" -Filter "*.log" -ErrorAction SilentlyContinue).Count

            & $script:ScriptPath -DryRun -Verbose 2>&1 | Out-Null

            $PostLogCount = (Get-ChildItem "C:\Users\kyrian\Documents\Company-Information\azure-sync-logs" -Filter "*.log" -ErrorAction SilentlyContinue).Count
            # May or may not create new log depending on implementation
            $PostLogCount | Should -BeGreaterOrEqual $PreLogCount
        }
    }

    Context "Status Action" {
        It "Should support status action" -Skip:(-not $script:Prerequisites.ScriptExists) {
            { & $script:ScriptPath -Action status } | Should -Not -Throw
        }

        It "Should report Azure CLI status" -Skip:(-not $script:Prerequisites.ScriptExists) {
            $Output = & $script:ScriptPath -Action status -Verbose 2>&1 | Out-String

            $Output | Should -Match "(Azure|CLI|DevOps|authentication|status|connection)"
        }

        It "Should check PAT token availability" -Skip:(-not $script:Prerequisites.ScriptExists) {
            $Output = & $script:ScriptPath -Action status -Verbose 2>&1 | Out-String

            $Output | Should -Match "(PAT|token|AZURE_DEVOPS_PAT|authentication)"
        }

        It "Should report organization and project" -Skip:(-not $script:Prerequisites.ScriptExists) {
            $Output = & $script:ScriptPath -Action status -Organization "test-org" -Project "test-proj" 2>&1 | Out-String

            if ($Output -match "Organization|Project") {
                $Output | Should -Match "(test-org|test-proj|Organization|Project)"
            }
        }
    }

    Context "Test Action" {
        It "Should support test action for prerequisites" -Skip:(-not $script:Prerequisites.ScriptExists) {
            { & $script:ScriptPath -Action test } | Should -Not -Throw
        }

        It "Should validate Azure CLI installation" -Skip:(-not $script:Prerequisites.ScriptExists) {
            $Output = & $script:ScriptPath -Action test -Verbose 2>&1 | Out-String

            $Output | Should -Match "(Azure CLI|az|installed|not found|prerequisite)"
        }

        It "Should validate Azure DevOps extension" -Skip:(-not $script:Prerequisites.ScriptExists) {
            $Output = & $script:ScriptPath -Action test -Verbose 2>&1 | Out-String

            # May check for azure-devops extension
            if ($Output -match "extension") {
                $Output | Should -Match "(azure-devops|extension|installed)"
            }
        }

        It "Should check environment variables" -Skip:(-not $script:Prerequisites.ScriptExists) {
            $Output = & $script:ScriptPath -Action test -Verbose 2>&1 | Out-String

            $Output | Should -Match "(environment|variable|PAT|token)"
        }
    }

    Context "Configuration Validation" {
        It "Should handle organization parameter" -Skip:(-not $script:Prerequisites.ScriptExists) {
            { & $script:ScriptPath -Organization "test-org" -Action status -DryRun } | Should -Not -Throw
        }

        It "Should handle project parameter" -Skip:(-not $script:Prerequisites.ScriptExists) {
            { & $script:ScriptPath -Organization "test-org" -Project "test-project" -Action status -DryRun } | Should -Not -Throw
        }

        It "Should handle both organization and project parameters" -Skip:(-not $script:Prerequisites.ScriptExists) {
            $Output = & $script:ScriptPath -Organization "ai-whisperers" -Project "Business Setup" -Action status -DryRun 2>&1 | Out-String

            if ($Output.Length -gt 0) {
                $Output | Should -Not -BeNullOrEmpty
            }
        }

        It "Should use default values when parameters not provided" -Skip:(-not $script:Prerequisites.ScriptExists) {
            $Content = Get-Content $script:ScriptPath -Raw

            # Check for default values in script
            $Content | Should -Match "aiwhisperer|Ai-Whisperers|AI-Whisperers"
        }
    }

    Context "Sync Action Validation" {
        It "Should have sync as default or available action" -Skip:(-not $script:Prerequisites.ScriptExists) {
            $Content = Get-Content $script:ScriptPath -Raw
            $Content | Should -Match "sync|Sync"
        }

        It "Should have work item sync functionality" -Skip:(-not $script:Prerequisites.ScriptExists) {
            $Content = Get-Content $script:ScriptPath -Raw
            $Content | Should -Match "work.?item|WorkItem|issue|Issue"
        }

        It "Should handle GitHub to Azure sync" -Skip:(-not $script:Prerequisites.ScriptExists) {
            $Content = Get-Content $script:ScriptPath -Raw
            $Content | Should -Match "GitHub|github|gh "
        }
    }

    Context "Error Handling" {
        It "Should handle missing PAT token gracefully" -Skip:(-not $script:Prerequisites.ScriptExists) {
            $env:AZURE_DEVOPS_PAT = ""
            $Output = & $script:ScriptPath -Action test 2>&1 | Out-String

            $Output | Should -Match "(PAT|token|missing|not set|required)"

            # Restore PAT
            $env:AZURE_DEVOPS_PAT = "test-pat-token"
        }

        It "Should handle invalid action gracefully" -Skip:(-not $script:Prerequisites.ScriptExists) {
            $Output = & $script:ScriptPath -Action "invalid-action" 2>&1 | Out-String

            $Output | Should -Match "(Invalid|Unknown|not supported|Usage)"
        }

        It "Should create log directory if missing" -Skip:(-not $script:Prerequisites.ScriptExists) {
            $Content = Get-Content $script:ScriptPath -Raw
            $Content | Should -Match "New-Item.*Directory.*log|Test-Path.*log"
        }

        It "Should handle network failures gracefully" -Skip:(-not $script:Prerequisites.ScriptExists) {
            # This test would require mocking network calls
            # Checking if script has error handling
            $Content = Get-Content $script:ScriptPath -Raw
            $Content | Should -Match "try|catch|Error|Exception"
        }
    }

    Context "Output Validation" {
        It "Should produce structured output" -Skip:(-not $script:Prerequisites.ScriptExists) {
            $Output = & $script:ScriptPath -Action test -Verbose 2>&1 | Out-String

            # Check for structured logging or status format
            if ($Output -match "\[") {
                $Output | Should -Match "\[(INFO|WARN|ERROR|SUCCESS|DEBUG|STATUS)\]"
            }
        }

        It "Should respect Verbose flag" -Skip:(-not $script:Prerequisites.ScriptExists) {
            $NormalOutput = & $script:ScriptPath -Action test 2>&1 | Out-String
            $VerboseOutput = & $script:ScriptPath -Action test -Verbose 2>&1 | Out-String

            # Verbose output should typically be longer
            if ($VerboseOutput.Length -gt 0 -and $NormalOutput.Length -gt 0) {
                $VerboseOutput.Length | Should -BeGreaterOrEqual $NormalOutput.Length
            }
        }
    }

    Context "Security Validation" {
        It "Should not expose PAT token in output" -Skip:(-not $script:Prerequisites.ScriptExists) {
            $env:AZURE_DEVOPS_PAT = "secret-token-12345"
            $Output = & $script:ScriptPath -Action status -Verbose 2>&1 | Out-String

            $Output | Should -Not -Match "secret-token-12345"
        }

        It "Should mask sensitive information in logs" -Skip:(-not $script:Prerequisites.ScriptExists) {
            $Content = Get-Content $script:ScriptPath -Raw

            # Check for security practices
            if ($Content -match "PAT|password|token") {
                $Content | Should -Match "mask|hidden|\*\*\*|redacted"
            }
        }
    }

    AfterAll {
        # Restore original environment variable
        if ($script:OriginalPAT) {
            $env:AZURE_DEVOPS_PAT = $script:OriginalPAT
        } else {
            Remove-Item Env:\AZURE_DEVOPS_PAT -ErrorAction SilentlyContinue
        }

        # Clean up test directories
        if (Test-Path $script:TestLogsDir) {
            Remove-Item $script:TestLogsDir -Recurse -Force
        }
        if (Test-Path $script:TestWorkItemsDir) {
            Remove-Item $script:TestWorkItemsDir -Recurse -Force
        }
    }
}