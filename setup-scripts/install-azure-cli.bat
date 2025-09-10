@echo off
echo Installing Azure CLI...
echo.

REM Download and install Azure CLI
echo Downloading Azure CLI installer...
curl -L https://aka.ms/installazurecliwindows -o AzureCLI.msi
echo Installing Azure CLI (this may take a few minutes)...
msiexec /i AzureCLI.msi /quiet /norestart
del AzureCLI.msi

echo.
echo Azure CLI installed. Configuring...
echo.

REM Refresh PATH - Let system handle Azure CLI path registration
REM Azure CLI installer should automatically update system PATH
echo Refreshing environment variables...

REM Install Azure DevOps extension
call az extension add --name azure-devops

echo.
echo Setup complete!
pause