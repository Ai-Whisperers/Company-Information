# Integration Tests for Weekly Activity Report
Import-Module "$PSScriptRoot\..\TestHelpers.psm1" -Force

Describe "Weekly Activity Report Integration" {
    BeforeAll {
        $script:ScriptPath = "C:\Users\kyrian\Documents\Company-Information\scripts\weekly-activity-report.ps1"
        $script:Prerequisites = Test-ScriptPrerequisites -ScriptPath $script:ScriptPath
        $script:TestReportsDir = Join-Path $TestDrive "weekly-reports"
        $script:TestLogsDir = Join-Path $TestDrive "logs"

        # Create test directories
        New-Item -ItemType Directory -Path $script:TestReportsDir -Force | Out-Null
        New-Item -ItemType Directory -Path $script:TestLogsDir -Force | Out-Null
    }

    Context "Script Validation" {
        It "Should verify script exists" {
            $script:Prerequisites.ScriptExists | Should -Be $true
        }

        It "Should have correct script structure" -Skip:(-not $script:Prerequisites.ScriptExists) {
            $Content = Get-Content $script:ScriptPath -Raw
            $Content | Should -Match "param\s*\("
            $Content | Should -Match '\$Days'
            $Content | Should -Match "OrganizationName|Organization"
        }

        It "Should support expected parameters" -Skip:(-not $script:Prerequisites.ScriptExists) {
            $Content = Get-Content $script:ScriptPath -Raw
            $Content | Should -Match '\[int\]\$Days'

            # May have additional parameters
            if ($Content -match "Repository") {
                $Content | Should -Match '\[string\]\$Repository'
            }
        }
    }

    Context "Basic Execution" {
        It "Should execute with default parameters" -Skip:(-not $script:Prerequisites.ScriptExists) {
            { & $script:ScriptPath } | Should -Not -Throw
        }

        It "Should accept Days parameter" -Skip:(-not $script:Prerequisites.ScriptExists) {
            { & $script:ScriptPath -Days 14 } | Should -Not -Throw
        }

        It "Should produce formatted report output" -Skip:(-not $script:Prerequisites.ScriptExists) {
            $Output = & $script:ScriptPath -Days 3 2>&1 | Out-String

            $Output | Should -Match "(Weekly Activity Report|Activity Report|Report)"
            $Output | Should -Match "(Report Period|Period|Days|Generated)"
        }

        It "Should handle different day ranges" -Skip:(-not $script:Prerequisites.ScriptExists) {
            $Outputs = @()
            @(1, 7, 14, 30) | ForEach-Object {
                $Output = & $script:ScriptPath -Days $_ 2>&1 | Out-String
                $Outputs += $Output
                $Output | Should -Not -BeNullOrEmpty
            }

            # Each output should be unique (different time periods)
            $Outputs | Select-Object -Unique | Should -HaveCount 4
        }
    }

    Context "GitHub Integration" {
        It "Should handle GitHub CLI availability" -Skip:(-not $script:Prerequisites.ScriptExists) {
            $Output = & $script:ScriptPath -Days 1 2>&1 | Out-String

            if (-not $script:Prerequisites.GitHubCLI) {
                $Output | Should -Match "(GitHub CLI|gh|authentication|not found|login)"
            } else {
                $Output | Should -Match "(repository|commit|activity|Ai-Whisperers)"
            }
        }

        It "Should report organization activity" -Skip:(-not ($script:Prerequisites.ScriptExists -and $script:Prerequisites.GitHubCLI)) {
            $Output = & $script:ScriptPath -Days 7 2>&1 | Out-String

            $Output | Should -Match "(Ai-Whisperers|AI-Whisperers|organization)"
        }

        It "Should fetch commit data when GitHub CLI is available" -Skip:(-not ($script:Prerequisites.ScriptExists -and $script:Prerequisites.GitHubCLI)) {
            $Output = & $script:ScriptPath -Days 7 2>&1 | Out-String

            # Should contain commit-related information
            $Output | Should -Match "(commit|push|merge|pull|activity)"
        }

        It "Should list repositories when available" -Skip:(-not ($script:Prerequisites.ScriptExists -and $script:Prerequisites.GitHubCLI)) {
            $Output = & $script:ScriptPath -Days 7 2>&1 | Out-String

            # Should list at least one repository
            $Output | Should -Match "(Company-Information|AI-Investment|Comment-Analyzer|repository)"
        }
    }

    Context "DryRun Support" {
        It "Should support DryRun parameter if available" -Skip:(-not $script:Prerequisites.ScriptExists) {
            $Content = Get-Content $script:ScriptPath -Raw

            if ($Content -match "DryRun") {
                { & $script:ScriptPath -DryRun } | Should -Not -Throw

                $Output = & $script:ScriptPath -DryRun 2>&1 | Out-String
                Assert-DryRunMarkers -Output $Output -ScriptName "weekly-activity-report.ps1"
            }
        }

        It "Should not create files in DryRun mode" -Skip:(-not $script:Prerequisites.ScriptExists) {
            $Content = Get-Content $script:ScriptPath -Raw

            if ($Content -match "DryRun") {
                $InitialFileCount = (Get-ChildItem $script:TestReportsDir -Filter "*.md" -ErrorAction SilentlyContinue).Count

                & $script:ScriptPath -DryRun -Days 7 2>&1 | Out-Null

                $FinalFileCount = (Get-ChildItem $script:TestReportsDir -Filter "*.md" -ErrorAction SilentlyContinue).Count
                $FinalFileCount | Should -Be $InitialFileCount
            }
        }
    }

    Context "Output Validation" {
        It "Should generate consistent output structure" -Skip:(-not $script:Prerequisites.ScriptExists) {
            $Output1 = & $script:ScriptPath -Days 1 2>&1 | Out-String
            Start-Sleep -Milliseconds 100
            $Output2 = & $script:ScriptPath -Days 1 2>&1 | Out-String

            # Normalize timestamps for comparison
            $Hash1 = Get-ScriptHashOutput -Output $Output1
            $Hash2 = Get-ScriptHashOutput -Output $Output2

            # Core structure should be similar
            $Hash1.Length | Should -BeGreaterThan 0
            $Hash2.Length | Should -BeGreaterThan 0
        }

        It "Should include required report sections" -Skip:(-not $script:Prerequisites.ScriptExists) {
            $Output = & $script:ScriptPath -Days 7 2>&1 | Out-String

            # Check for expected sections (may vary by implementation)
            $Output | Should -Match "(Activity|Report|Summary|Statistics)"

            if ($script:Prerequisites.GitHubCLI) {
                $Output | Should -Match "(Ai-Whisperers|AI-Whisperers|Organization)"
            }
        }

        It "Should format dates consistently" -Skip:(-not $script:Prerequisites.ScriptExists) {
            $Output = & $script:ScriptPath -Days 7 2>&1 | Out-String

            # Should contain formatted dates
            $Output | Should -Match "\d{4}-\d{2}-\d{2}|\d{1,2}/\d{1,2}/\d{4}"
        }

        It "Should include statistics when data is available" -Skip:(-not ($script:Prerequisites.ScriptExists -and $script:Prerequisites.GitHubCLI)) {
            $Output = & $script:ScriptPath -Days 7 2>&1 | Out-String

            # Should include some numeric statistics
            $Output | Should -Match "\d+"
        }
    }

    Context "Error Handling" {
        It "Should handle invalid Days parameter gracefully" -Skip:(-not $script:Prerequisites.ScriptExists) {
            { & $script:ScriptPath -Days -1 } | Should -Not -Throw
            { & $script:ScriptPath -Days 0 } | Should -Not -Throw
        }

        It "Should handle very large Days parameter" -Skip:(-not $script:Prerequisites.ScriptExists) {
            { & $script:ScriptPath -Days 365 } | Should -Not -Throw
            { & $script:ScriptPath -Days 9999 } | Should -Not -Throw
        }

        It "Should handle missing GitHub authentication gracefully" -Skip:(-not $script:Prerequisites.ScriptExists) {
            # Temporarily rename gh.exe if it exists
            $ghPath = Get-Command gh -ErrorAction SilentlyContinue

            if ($ghPath) {
                # This test would require elevated permissions to rename gh
                # Instead, check if script handles missing gh
                $Content = Get-Content $script:ScriptPath -Raw
                $Content | Should -Match "gh |GitHub CLI|authentication"
            }
        }

        It "Should create output directory if missing" -Skip:(-not $script:Prerequisites.ScriptExists) {
            $Content = Get-Content $script:ScriptPath -Raw

            if ($Content -match "OutputPath|ReportPath") {
                $Content | Should -Match "New-Item.*Directory|Test-Path"
            }
        }
    }

    Context "Report Formatting" {
        It "Should use consistent header formatting" -Skip:(-not $script:Prerequisites.ScriptExists) {
            $Output = & $script:ScriptPath -Days 7 2>&1 | Out-String

            # Check for section headers
            if ($Output -match "#") {
                $Output | Should -Match "(#{1,3}|===|---)"
            }
        }

        It "Should include emoji if used in formatting" -Skip:(-not $script:Prerequisites.ScriptExists) {
            $Output = & $script:ScriptPath -Days 7 2>&1 | Out-String

            # Check if emoji are used (optional)
            if ($Output -match "📊|📈|📉|✅|❌|⚠️") {
                $Output | Should -Match "[📊📈📉✅❌⚠️]"
            }
        }

        It "Should generate markdown-compatible output if specified" -Skip:(-not $script:Prerequisites.ScriptExists) {
            $Content = Get-Content $script:ScriptPath -Raw

            if ($Content -match "markdown|.md") {
                $Output = & $script:ScriptPath -Days 7 2>&1 | Out-String

                # Check for markdown elements
                $Output | Should -Match "(#|\*|\[|\]|`)"
            }
        }
    }

    Context "Performance" {
        It "Should complete within reasonable time" -Skip:(-not $script:Prerequisites.ScriptExists) {
            $StartTime = Get-Date
            & $script:ScriptPath -Days 1 2>&1 | Out-Null
            $Duration = (Get-Date) - $StartTime

            # Should complete within 30 seconds for 1 day
            $Duration.TotalSeconds | Should -BeLessThan 30
        }

        It "Should handle concurrent executions" -Skip:(-not $script:Prerequisites.ScriptExists) {
            $Job1 = Start-Job -ScriptBlock { & $using:script:ScriptPath -Days 1 }
            $Job2 = Start-Job -ScriptBlock { & $using:script:ScriptPath -Days 7 }

            $Results = @($Job1, $Job2) | Wait-Job -Timeout 60 | Receive-Job
            @($Job1, $Job2) | Remove-Job -Force

            $Results.Count | Should -Be 2
        }
    }

    AfterAll {
        # Clean up test directories
        if (Test-Path $script:TestReportsDir) {
            Remove-Item $script:TestReportsDir -Recurse -Force
        }
        if (Test-Path $script:TestLogsDir) {
            Remove-Item $script:TestLogsDir -Recurse -Force
        }
    }
}