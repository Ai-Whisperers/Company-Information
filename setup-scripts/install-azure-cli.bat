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

REM Refresh PATH
set PATH=%PATH%;C:\Program Files (x86)\Microsoft SDKs\Azure\CLI2\wbin;C:\Program Files\Microsoft SDKs\Azure\CLI2\wbin

REM Install Azure DevOps extension
call az extension add --name azure-devops

echo.
echo Setup complete!
pause