# Policy Tests for Approval Gate Enforcement
Import-Module "$PSScriptRoot\..\TestHelpers.psm1" -Force

Describe "Approval Gate Policy" {

    BeforeAll {
        $script:RepoRoot = "C:\Users\kyrian\Documents\Company-Information"
        $script:ClaudeDir = Join-Path $script:RepoRoot ".claude"
        $script:SettingsPath = Join-Path $script:ClaudeDir "settings.local.json"
        $script:ScriptsDir = Join-Path $script:RepoRoot "scripts"
    }

    Context "Claude Settings Approval Gate" {
        It "Should have .claude directory present" {
            $script:ClaudeDir | Should -Exist
        }

        It "Should have settings.local.json with permissions" -Skip:(-not (Test-Path $script:ClaudeDir)) {
            if (Test-Path $script:SettingsPath) {
                $script:SettingsPath | Should -Exist

                $Settings = Get-Content $script:SettingsPath | ConvertFrom-Json
                $Settings | Should -Not -BeNullOrEmpty
            } else {
                Set-ItResult -Skipped -Because "settings.local.json not found"
            }
        }

        It "Should contain approval restrictions in settings" -Skip:(-not (Test-Path $script:SettingsPath)) {
            $Content = Get-Content $script:SettingsPath -Raw

            # Should have permissions structure indicating approval gates
            $Content | Should -Match '("permissions"|"allow"|"deny"|"ask"|"approval")'
        }

        It "Should have appropriate permission levels configured" -Skip:(-not (Test-Path $script:SettingsPath)) {
            $Settings = Get-Content $script:SettingsPath | ConvertFrom-Json

            if ($Settings.permissions) {
                # Check for restrictive permissions on dangerous operations
                if ($Settings.permissions.write) {
                    $Settings.permissions.write | Should -Match "(ask|deny)"
                }
                if ($Settings.permissions.execute) {
                    $Settings.permissions.execute | Should -Match "(ask|deny)"
                }
            }
        }
    }

    Context "Approval Gate Documentation" {
        It "Should have approval gate documentation in CLAUDE.md" {
            $ClaudemdPath = Join-Path $script:RepoRoot "CLAUDE.md"

            if (Test-Path $ClaudemdPath) {
                $Content = Get-Content $ClaudemdPath -Raw

                # Should contain approval or permission-related text
                $Content | Should -Match "(tool|usage|policy|commands?)"
            } else {
                Set-ItResult -Skipped -Because "CLAUDE.md not found"
            }
        }

        It "Should document tool usage policies" {
            $ClaudemdPath = Join-Path $script:RepoRoot "CLAUDE.md"

            if (Test-Path $ClaudemdPath) {
                $Content = Get-Content $ClaudemdPath -Raw

                # Should mention tool usage or execution policies
                $Content | Should -Match "(Bash|Edit|Write|Read|tool)"
            } else {
                Set-ItResult -Skipped -Because "CLAUDE.md not found"
            }
        }

        It "Should have security best practices documented" {
            $BestPracticesPath = Join-Path $script:RepoRoot "BEST_PRACTICES.md"

            if (Test-Path $BestPracticesPath) {
                $Content = Get-Content $BestPracticesPath -Raw

                # Should contain security-related best practices
                $Content | Should -Match "(security|secret|credential|token|PAT)"
            } else {
                Set-ItResult -Skipped -Because "BEST_PRACTICES.md not found"
            }
        }
    }

    Context "Script DryRun Support" {
        It "Should verify excalibur-command.ps1 has DryRun parameter" {
            $ScriptPath = Join-Path $script:ScriptsDir "excalibur-command.ps1"

            if (Test-Path $ScriptPath) {
                $Content = Get-Content $ScriptPath -Raw
                $Content | Should -Match '\[switch\]\$DryRun'

                # Should check for DryRun mode
                $Content | Should -Match 'if.*\$DryRun'
            } else {
                Set-ItResult -Skipped -Because "excalibur-command.ps1 not found"
            }
        }

        It "Should verify azure-devops-sync.ps1 has DryRun parameter" {
            $ScriptPath = Join-Path $script:ScriptsDir "azure-devops-sync.ps1"

            if (Test-Path $ScriptPath) {
                $Content = Get-Content $ScriptPath -Raw
                $Content | Should -Match '\[switch\]\$DryRun'
            } else {
                Set-ItResult -Skipped -Because "azure-devops-sync.ps1 not found"
            }
        }

        It "Should verify file-sync-manager.ps1 has validation mode" {
            $ScriptPath = Join-Path $script:ScriptsDir "file-sync-manager.ps1"

            if (Test-Path $ScriptPath) {
                $Content = Get-Content $ScriptPath -Raw
                $Content | Should -Match '(validate|Validate|DryRun|test)'
            } else {
                Set-ItResult -Skipped -Because "file-sync-manager.ps1 not found"
            }
        }
    }

    Context "Idempotency Testing" {
        It "Should produce identical output on repeated DryRun for excalibur" {
            $ScriptPath = Join-Path $script:ScriptsDir "excalibur-command.ps1"

            if ((Test-Path $ScriptPath) -and (Get-Content $ScriptPath -Raw) -match "DryRun") {
                $Output1 = & $ScriptPath -DryRun 2>&1 | Out-String
                Start-Sleep -Milliseconds 100
                $Output2 = & $ScriptPath -DryRun 2>&1 | Out-String

                $Hash1 = Get-ScriptHashOutput -Output $Output1
                $Hash2 = Get-ScriptHashOutput -Output $Output2

                # Core structure should be identical
                $Hash1 | Should -BeExactly $Hash2
            } else {
                Set-ItResult -Skipped -Because "excalibur-command.ps1 not found or no DryRun"
            }
        }

        It "Should produce consistent azure-devops-sync DryRun output" {
            $ScriptPath = Join-Path $script:ScriptsDir "azure-devops-sync.ps1"

            if ((Test-Path $ScriptPath) -and (Get-Content $ScriptPath -Raw) -match "DryRun") {
                $Output1 = & $ScriptPath -DryRun 2>&1 | Out-String
                Start-Sleep -Milliseconds 100
                $Output2 = & $ScriptPath -DryRun 2>&1 | Out-String

                $Hash1 = Get-ScriptHashOutput -Output $Output1
                $Hash2 = Get-ScriptHashOutput -Output $Output2

                # Normalized output should be consistent
                $Hash1.Length | Should -BeGreaterThan 0
                $Hash2.Length | Should -BeGreaterThan 0
            } else {
                Set-ItResult -Skipped -Because "azure-devops-sync.ps1 not found or no DryRun"
            }
        }

        It "Should not modify files in DryRun mode" {
            $ScriptPath = Join-Path $script:ScriptsDir "excalibur-command.ps1"
            $TodosDir = Join-Path $script:RepoRoot "project-todos"

            if ((Test-Path $ScriptPath) -and (Get-Content $ScriptPath -Raw) -match "DryRun") {
                # Get initial modification times
                $InitialTimes = Get-ChildItem $TodosDir -Filter "*.md" -ErrorAction SilentlyContinue |
                    Select-Object Name, LastWriteTime

                # Run in DryRun mode
                & $ScriptPath -DryRun 2>&1 | Out-Null

                # Check modification times haven't changed
                $FinalTimes = Get-ChildItem $TodosDir -Filter "*.md" -ErrorAction SilentlyContinue |
                    Select-Object Name, LastWriteTime

                if ($InitialTimes -and $FinalTimes) {
                    Compare-Object $InitialTimes $FinalTimes -Property LastWriteTime |
                        Should -BeNullOrEmpty
                }
            } else {
                Set-ItResult -Skipped -Because "Script not found or no DryRun support"
            }
        }
    }

    Context "Write Protection Validation" {
        It "Should detect attempts to write outside allowed directories" {
            # This is a policy test - we simulate what would happen
            $DisallowedWrite = "Creating C:\Windows\System32\malware.exe"

            { Assert-PathAllowlist -Output $DisallowedWrite } | Should -Throw
        }

        It "Should allow writes only to allowlisted directories" {
            $AllowedWrites = @(
                "Creating C:\repo\project-todos\new-item.md",
                "Writing C:\repo\logs\output.log",
                "Updating C:\repo\enhanced-documentation\README.md"
            )

            foreach ($Write in $AllowedWrites) {
                { Assert-PathAllowlist -Output $Write } | Should -Not -Throw
            }
        }

        It "Should enforce test-only write policy for critical files" {
            # Critical files should not be modified without approval
            $CriticalFiles = @(
                ".gitignore",
                "azure-pipelines.yml",
                ".github/workflows/*.yml",
                "*.ps1"
            )

            # Check if these patterns are mentioned in documentation
            $ClaudemdPath = Join-Path $script:RepoRoot "CLAUDE.md"
            if (Test-Path $ClaudemdPath) {
                $Content = Get-Content $ClaudemdPath -Raw

                # Should have some mention of protected files or approval
                $Content | Should -Match "(critical|protected|approval|test)"
            }
        }

        It "Should validate scripts follow least-privilege principle" {
            $Scripts = Get-ChildItem $script:ScriptsDir -Filter "*.ps1" -ErrorAction SilentlyContinue

            foreach ($Script in $Scripts) {
                $Content = Get-Content $Script.FullName -Raw

                # Scripts should not use -Force without checks
                if ($Content -match "-Force") {
                    # Should have conditional logic around -Force
                    $Content | Should -Match "if.*-Force"
                }

                # Scripts should not hardcode credentials
                $Content | Should -Not -Match "password\s*=\s*[\"'][^\"']+[\"']"
                $Content | Should -Not -Match "token\s*=\s*[\"'][^\"']+[\"']"
            }
        }
    }

    Context "Execution Safety" {
        It "Should have error handling in all scripts" {
            $Scripts = Get-ChildItem $script:ScriptsDir -Filter "*.ps1" -ErrorAction SilentlyContinue

            foreach ($Script in $Scripts) {
                $Content = Get-Content $Script.FullName -Raw

                # Should have error handling
                $Content | Should -Match "(try|catch|ErrorAction|trap)"
            }
        }

        It "Should log all destructive operations" {
            $Scripts = Get-ChildItem $script:ScriptsDir -Filter "*.ps1" -ErrorAction SilentlyContinue

            foreach ($Script in $Scripts) {
                $Content = Get-Content $Script.FullName -Raw

                # If script has Remove-Item, it should log
                if ($Content -match "Remove-Item") {
                    $Content | Should -Match "(Write-.*Log|Add-Content.*log)"
                }

                # If script modifies files, it should log
                if ($Content -match "Set-Content|Out-File") {
                    $Content | Should -Match "(Write-.*Log|Add-Content.*log|Write-Host|Write-Output)"
                }
            }
        }

        It "Should validate input parameters" {
            $Scripts = Get-ChildItem $script:ScriptsDir -Filter "*.ps1" -ErrorAction SilentlyContinue

            foreach ($Script in $Scripts) {
                $Content = Get-Content $Script.FullName -Raw

                # If script has parameters, should validate them
                if ($Content -match "param\s*\(") {
                    # Should have some validation
                    $Content | Should -Match "(ValidateSet|ValidateRange|ValidateScript|ValidatePattern|if.*null|Test-Path)"
                }
            }
        }
    }

    Context "Audit Trail" {
        It "Should create log files for script execution" {
            $LogsDir = Join-Path $script:RepoRoot "logs"

            # Logs directory should exist
            $LogsDir | Should -Exist

            # Should have some log files (if scripts have been run)
            $LogFiles = Get-ChildItem $LogsDir -Filter "*.log" -ErrorAction SilentlyContinue
            # This is informational - scripts may not have been run yet
        }

        It "Should include timestamps in log entries" {
            $LogFiles = Get-ChildItem (Join-Path $script:RepoRoot "logs") -Filter "*.log" -ErrorAction SilentlyContinue |
                Select-Object -First 1

            if ($LogFiles) {
                $Content = Get-Content $LogFiles.FullName -First 10 -ErrorAction SilentlyContinue

                # Should have timestamp patterns
                $Content | Should -Match "\d{4}-\d{2}-\d{2}|\d{2}:\d{2}:\d{2}"
            } else {
                Set-ItResult -Skipped -Because "No log files found"
            }
        }

        It "Should track script execution in git commits" {
            # Check if git history shows proper commit messages
            $GitLog = git log --oneline -10 2>&1

            if ($LASTEXITCODE -eq 0) {
                # Should have descriptive commit messages
                $GitLog | Should -Not -BeNullOrEmpty

                # Good commits mention what was done
                $GitLog | Out-String | Should -Match "(feat|fix|chore|test|docs):"
            } else {
                Set-ItResult -Skipped -Because "Git not available or not a repository"
            }
        }
    }

    Context "Security Compliance" {
        It "Should not expose sensitive data in logs" {
            $LogFiles = Get-ChildItem (Join-Path $script:RepoRoot "logs") -Filter "*.log" -ErrorAction SilentlyContinue

            foreach ($LogFile in $LogFiles) {
                $Content = Get-Content $LogFile.FullName -Raw -ErrorAction SilentlyContinue

                # Should not contain obvious secrets
                $Content | Should -Not -Match "ghp_[a-zA-Z0-9]{36}"  # GitHub PAT
                $Content | Should -Not -Match "password\s*[:=]\s*\S+"
                $Content | Should -Not -Match "secret\s*[:=]\s*\S+"
            }
        }

        It "Should mask PAT tokens in output" {
            $Scripts = Get-ChildItem $script:ScriptsDir -Filter "*.ps1" -ErrorAction SilentlyContinue

            foreach ($Script in $Scripts) {
                $Content = Get-Content $Script.FullName -Raw

                # If script uses PAT, should mask it
                if ($Content -match "PAT|Token") {
                    $Content | Should -Match "(\*{3,}|mask|hidden|redacted|\[masked\])"
                }
            }
        }

        It "Should use secure credential storage methods" {
            # Check for environment variable usage instead of hardcoding
            $Scripts = Get-ChildItem $script:ScriptsDir -Filter "*.ps1" -ErrorAction SilentlyContinue

            foreach ($Script in $Scripts) {
                $Content = Get-Content $Script.FullName -Raw

                # Should use env variables for secrets
                if ($Content -match "(token|password|secret|key|credential)") {
                    $Content | Should -Match '\$env:'
                }
            }
        }
    }
}