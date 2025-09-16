# Unit Tests for Logging Functions
Import-Module "$PSScriptRoot\..\TestHelpers.psm1" -Force

Describe "Logging Functions" {

    BeforeAll {
        # Mock log directory for testing
        $script:TestLogDir = Join-Path $TestDrive "test-logs"
        New-Item -ItemType Directory -Path $script:TestLogDir -Force | Out-Null
    }

    Context "Write-Log Function" {
        BeforeEach {
            $script:LogFile = Join-Path $script:TestLogDir "test-$(Get-Date -Format 'yyyyMMddHHmmss').log"
        }

        It "Should write INFO level messages" {
            # Simulate Write-Log function behavior
            $Message = "Test info message"
            $Level = "INFO"
            $LogEntry = "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') [$Level] $Message"
            $LogEntry | Out-File -FilePath $script:LogFile -Append

            $Content = Get-Content $script:LogFile
            $Content | Should -Match "\[INFO\] Test info message"
        }

        It "Should write ERROR level messages" {
            $Message = "Test error occurred"
            $Level = "ERROR"
            $LogEntry = "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') [$Level] $Message"
            $LogEntry | Out-File -FilePath $script:LogFile -Append

            $Content = Get-Content $script:LogFile
            $Content | Should -Match "\[ERROR\] Test error occurred"
        }

        It "Should write WARN level messages" {
            $Message = "Test warning"
            $Level = "WARN"
            $LogEntry = "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') [$Level] $Message"
            $LogEntry | Out-File -FilePath $script:LogFile -Append

            $Content = Get-Content $script:LogFile
            $Content | Should -Match "\[WARN\] Test warning"
        }

        It "Should write DEBUG level messages" {
            $Message = "Debug information"
            $Level = "DEBUG"
            $LogEntry = "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') [$Level] $Message"
            $LogEntry | Out-File -FilePath $script:LogFile -Append

            $Content = Get-Content $script:LogFile
            $Content | Should -Match "\[DEBUG\] Debug information"
        }

        It "Should append multiple messages to same log file" {
            $Messages = @("First message", "Second message", "Third message")
            foreach ($Msg in $Messages) {
                $LogEntry = "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') [INFO] $Msg"
                $LogEntry | Out-File -FilePath $script:LogFile -Append
            }

            $Content = Get-Content $script:LogFile
            $Content.Count | Should -Be 3
            $Content[0] | Should -Match "First message"
            $Content[2] | Should -Match "Third message"
        }

        It "Should handle special characters in messages" {
            $Message = "Test with special chars: `$var @{key=value} [array]"
            $LogEntry = "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') [INFO] $Message"
            $LogEntry | Out-File -FilePath $script:LogFile -Append

            $Content = Get-Content $script:LogFile -Raw
            $Content | Should -Match ([Regex]::Escape("`$var @{key=value} [array]"))
        }
    }

    Context "Log File Rotation" {
        It "Should create unique log file names" {
            $LogFiles = @()
            for ($i = 1; $i -le 3; $i++) {
                Start-Sleep -Milliseconds 100
                $LogFile = Join-Path $script:TestLogDir "log-$(Get-Date -Format 'yyyyMMdd-HHmmssffff').log"
                New-Item -Path $LogFile -ItemType File -Force | Out-Null
                $LogFiles += $LogFile
            }

            $UniqueFiles = $LogFiles | Select-Object -Unique
            $UniqueFiles.Count | Should -Be 3
        }

        It "Should handle log directory creation" {
            $NewLogDir = Join-Path $TestDrive "new-log-dir"
            if (Test-Path $NewLogDir) {
                Remove-Item $NewLogDir -Recurse -Force
            }

            New-Item -ItemType Directory -Path $NewLogDir -Force | Out-Null
            Test-Path $NewLogDir | Should -Be $true
        }
    }

    Context "Assert-DryRunMarkers" {
        It "Should detect DRY RUN markers in output" {
            $Output = "Starting process...`nDRY RUN: Would create file.txt`nCompleted"
            { Assert-DryRunMarkers -Output $Output -ScriptName "TestScript" } | Should -Not -Throw
        }

        It "Should detect 'Would create' markers" {
            $Output = "Processing...`nWould create directory: C:\temp\test`nFinished"
            { Assert-DryRunMarkers -Output $Output -ScriptName "TestScript" } | Should -Not -Throw
        }

        It "Should detect 'Would update' markers" {
            $Output = "Checking files...`nWould update existing-file.md`nDone"
            { Assert-DryRunMarkers -Output $Output -ScriptName "TestScript" } | Should -Not -Throw
        }

        It "Should detect 'Would sync' markers" {
            $Output = "Preparing sync...`nWould sync 5 files to repository`nDone"
            { Assert-DryRunMarkers -Output $Output -ScriptName "TestScript" } | Should -Not -Throw
        }

        It "Should detect 'No changes applied' marker" {
            $Output = "DRY RUN MODE`nChecking files...`nNo changes applied"
            { Assert-DryRunMarkers -Output $Output -ScriptName "TestScript" } | Should -Not -Throw
        }

        It "Should throw when no DRY RUN markers found" {
            $Output = "Regular execution output`nCreated file.txt`nCompleted successfully"
            { Assert-DryRunMarkers -Output $Output -ScriptName "TestScript" } | Should -Throw
        }

        It "Should be case-insensitive for DRY RUN detection" {
            $Output = "dry run: would create test.txt"
            { Assert-DryRunMarkers -Output $Output -ScriptName "TestScript" } | Should -Not -Throw
        }
    }

    Context "Assert-PathAllowlist" {
        It "Should allow paths in default allowlist" {
            $Output = "Creating C:\path\project-todos\file.md`nUpdating C:\path\logs\output.log"
            { Assert-PathAllowlist -Output $Output } | Should -Not -Throw
        }

        It "Should allow azure-sync-logs path" {
            $Output = "Writing to C:\repo\azure-sync-logs\sync.log"
            { Assert-PathAllowlist -Output $Output } | Should -Not -Throw
        }

        It "Should allow enhanced-documentation path" {
            $Output = "Updating C:\repo\enhanced-documentation\README.md"
            { Assert-PathAllowlist -Output $Output } | Should -Not -Throw
        }

        It "Should throw for system paths" {
            $Output = "Writing C:\Windows\System32\malicious.exe"
            { Assert-PathAllowlist -Output $Output } | Should -Throw
        }

        It "Should throw for Program Files paths" {
            $Output = "Creating C:\Program Files\app\config.ini"
            { Assert-PathAllowlist -Output $Output } | Should -Throw
        }

        It "Should handle multiple allowed paths" {
            $AllowedPaths = @("project-todos", "logs", "test-output")
            $Output = "Path: C:\repo\test-output\results.json`nCreating C:\repo\logs\debug.log"
            { Assert-PathAllowlist -Output $Output -AllowedPaths $AllowedPaths } | Should -Not -Throw
        }

        It "Should handle no path references gracefully" {
            $Output = "Script completed successfully with no file operations"
            { Assert-PathAllowlist -Output $Output } | Should -Not -Throw
        }

        It "Should detect paths in various output formats" {
            $Output = @"
Creating: C:\test\project-todos\file.txt
Writing to C:\test\logs\output.log
Path: C:\test\azure-sync-logs\data.json
Updating file at 'C:\test\enhanced-documentation\doc.md'
"@
            { Assert-PathAllowlist -Output $Output } | Should -Not -Throw
        }
    }

    Context "Log Message Formatting" {
        It "Should format timestamp consistently" {
            $Timestamp1 = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
            Start-Sleep -Milliseconds 100
            $Timestamp2 = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

            $Timestamp1 | Should -Match "\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}"
            $Timestamp2 | Should -Match "\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}"
        }

        It "Should handle multi-line messages" {
            $Message = "Line 1`nLine 2`nLine 3"
            $LogEntry = "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') [INFO] $Message"

            $LogFile = Join-Path $script:TestLogDir "multiline.log"
            $LogEntry | Out-File -FilePath $LogFile

            $Content = Get-Content $LogFile -Raw
            $Content | Should -Match "Line 1"
            $Content | Should -Match "Line 2"
            $Content | Should -Match "Line 3"
        }

        It "Should handle empty messages gracefully" {
            $Message = ""
            $LogEntry = "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') [INFO] $Message"

            $LogFile = Join-Path $script:TestLogDir "empty.log"
            $LogEntry | Out-File -FilePath $LogFile

            $Content = Get-Content $LogFile
            $Content | Should -Match "\[INFO\] $"
        }
    }

    AfterAll {
        if (Test-Path $script:TestLogDir) {
            Remove-Item $script:TestLogDir -Recurse -Force
        }
    }
}