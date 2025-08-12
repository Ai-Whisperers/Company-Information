@echo off
REM AI-Whisperers Quick Repository Initialization for Windows
REM Simple batch script for users without PowerShell execution permissions

echo ================================================
echo    AI-Whisperers Repository Initialization
echo ================================================
echo.

set GITHUB_ORG=Ai-Whisperers

REM Check if git is installed
git --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Git is not installed. Please install Git first.
    echo Download from: https://git-scm.com/download/win
    pause
    exit /b 1
)
echo [OK] Git is installed

REM Create repositories directory
if not exist "repositories" (
    mkdir repositories
    echo [OK] Created repositories directory
)

echo.
echo Initializing repositories...
echo.

REM Initialize core-services
if exist "repositories\core-services" (
    echo [OK] core-services directory exists
    cd repositories\core-services
    if not exist ".git" (
        git init
        git add .
        git commit -m "Initial commit: core-services setup"
        echo [OK] core-services repository initialized
    )
    cd ..\..
)

REM Initialize web-platform
if exist "repositories\web-platform" (
    echo [OK] web-platform directory exists
    cd repositories\web-platform
    if not exist ".git" (
        git init
        git add .
        git commit -m "Initial commit: web-platform setup"
        echo [OK] web-platform repository initialized
    )
    cd ..\..
)

REM Initialize ml-models
if exist "repositories\ml-models" (
    echo [OK] ml-models directory exists
    cd repositories\ml-models
    if not exist ".git" (
        git init
        git add .
        git commit -m "Initial commit: ml-models setup"
        echo [OK] ml-models repository initialized
    )
    cd ..\..
)

REM Initialize infrastructure
if exist "repositories\infrastructure" (
    echo [OK] infrastructure directory exists
    cd repositories\infrastructure
    if not exist ".git" (
        git init
        git add .
        git commit -m "Initial commit: infrastructure setup"
        echo [OK] infrastructure repository initialized
    )
    cd ..\..
)

REM Initialize documentation
if exist "repositories\documentation" (
    echo [OK] documentation directory exists
    cd repositories\documentation
    if not exist ".git" (
        git init
        git add .
        git commit -m "Initial commit: documentation setup"
        echo [OK] documentation repository initialized
    )
    cd ..\..
)

REM Initialize main repository
if not exist ".git" (
    git init
    git add .
    git commit -m "Initial organization structure setup"
    echo [OK] Main repository initialized
)

echo.
echo ================================================
echo            Initialization Complete!
echo ================================================
echo.
echo Next steps:
echo.
echo 1. Create repositories on GitHub at:
echo    https://github.com/organizations/%GITHUB_ORG%/repositories/new
echo.
echo 2. Add remote origins:
echo    cd repositories\core-services
echo    git remote add origin https://github.com/%GITHUB_ORG%/core-services.git
echo    git branch -M main
echo    git push -u origin main
echo.
echo 3. Repeat for other repositories:
echo    - web-platform
echo    - ml-models
echo    - infrastructure
echo    - documentation
echo.
pause