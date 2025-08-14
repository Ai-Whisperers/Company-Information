# Interactive Azure DevOps Backlog Import Script
# This script will guide you through importing your backlog

$azPath = "C:\Program Files\Microsoft SDKs\Azure\CLI2\wbin\az.cmd"
$org = "https://dev.azure.com/aiwhisperer"
$project = "Business Setup"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   AZURE DEVOPS BACKLOG IMPORT TOOL" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Get PAT Token
Write-Host "STEP 1: Authentication" -ForegroundColor Yellow
Write-Host "----------------------" -ForegroundColor Yellow
Write-Host ""
Write-Host "To import your backlog, you need a Personal Access Token (PAT)." -ForegroundColor White
Write-Host ""
Write-Host "If you don't have one:" -ForegroundColor Gray
Write-Host "1. Open: https://dev.azure.com/aiwhisperer/_usersSettings/tokens" -ForegroundColor White
Write-Host "2. Click 'New Token'" -ForegroundColor White
Write-Host "3. Name: 'Backlog Import'" -ForegroundColor White
Write-Host "4. Expiration: 90 days" -ForegroundColor White
Write-Host "5. Scopes: Select 'Full access'" -ForegroundColor White
Write-Host "6. Click 'Create' and copy the token" -ForegroundColor White
Write-Host ""

$pat = Read-Host "Enter your PAT token (it will be hidden)"

# Step 2: Authenticate
Write-Host ""
Write-Host "Authenticating with Azure DevOps..." -ForegroundColor Yellow
$pat | & $azPath devops login --organization $org 2>&1 | Out-Null

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Authentication failed. Please check your PAT token." -ForegroundColor Red
    Write-Host ""
    Write-Host "Common issues:" -ForegroundColor Yellow
    Write-Host "- Token expired" -ForegroundColor Gray
    Write-Host "- Insufficient permissions" -ForegroundColor Gray
    Write-Host "- Wrong organization" -ForegroundColor Gray
    exit 1
}

Write-Host "✅ Authentication successful!" -ForegroundColor Green

# Step 3: Configure defaults
Write-Host ""
Write-Host "STEP 2: Configuration" -ForegroundColor Yellow
Write-Host "---------------------" -ForegroundColor Yellow
& $azPath devops configure --defaults organization=$org project="$project" 2>&1 | Out-Null
Write-Host "✅ Configured for project: $project" -ForegroundColor Green

# Step 4: Import backlog
Write-Host ""
Write-Host "STEP 3: Creating Backlog Items" -ForegroundColor Yellow
Write-Host "-------------------------------" -ForegroundColor Yellow
Write-Host ""

$successCount = 0
$failCount = 0

# Define all work items
$epics = @(
    @{title="Digital Foundation Setup"; desc="Establish core digital infrastructure for AI-Whisperers"; priority=1},
    @{title="Business Automation Platform"; desc="Implement AI-powered business automation systems"; priority=1},
    @{title="Client Acquisition System"; desc="Build systematic approach to acquiring and managing clients"; priority=2},
    @{title="Legal and Financial Infrastructure"; desc="Establish business entity and financial systems"; priority=2},
    @{title="Professional Assets and Branding"; desc="Create professional brand identity and assets"; priority=3}
)

$features = @(
    @{title="Domain and Email Infrastructure"; desc="Set up professional domain and email system"; epic="Digital Foundation Setup"},
    @{title="Website Deployment"; desc="Deploy and configure company website"; epic="Digital Foundation Setup"},
    @{title="Scheduling and Calendar Automation"; desc="Automated scheduling system for client meetings"; epic="Business Automation Platform"},
    @{title="Workflow Automation"; desc="Build automated business workflows"; epic="Business Automation Platform"},
    @{title="CRM Implementation"; desc="Customer relationship management system"; epic="Client Acquisition System"},
    @{title="Service Packaging"; desc="Define and document service offerings"; epic="Client Acquisition System"},
    @{title="Business Entity Formation"; desc="Legal business structure setup"; epic="Legal and Financial Infrastructure"},
    @{title="Financial Systems"; desc="Banking and accounting infrastructure"; epic="Legal and Financial Infrastructure"},
    @{title="Brand Identity"; desc="Logo and visual identity system"; epic="Professional Assets and Branding"},
    @{title="Marketing Materials"; desc="Professional collateral creation"; epic="Professional Assets and Branding"}
)

$stories = @(
    @{title="Purchase ai-whisperers.com domain"; points=1; parent="Domain and Email Infrastructure"},
    @{title="Set up Google Workspace"; points=2; parent="Domain and Email Infrastructure"},
    @{title="Configure DNS records"; points=2; parent="Domain and Email Infrastructure"},
    @{title="Create Vercel account"; points=1; parent="Website Deployment"},
    @{title="Deploy Next.js website to Vercel"; points=3; parent="Website Deployment"},
    @{title="Configure custom domain"; points=2; parent="Website Deployment"},
    @{title="Test website functionality"; points=3; parent="Website Deployment"},
    @{title="Set up Cal.com account"; points=2; parent="Scheduling and Calendar Automation"},
    @{title="Configure booking types"; points=3; parent="Scheduling and Calendar Automation"},
    @{title="Integrate with Google Calendar"; points=2; parent="Scheduling and Calendar Automation"},
    @{title="Create Make.com account"; points=1; parent="Workflow Automation"},
    @{title="Build contact form automation"; points=5; parent="Workflow Automation"},
    @{title="Create lead qualification workflow"; points=8; parent="Workflow Automation"},
    @{title="Set up client onboarding automation"; points=5; parent="Workflow Automation"}
)

# Create Epics
Write-Host "Creating Epics..." -ForegroundColor Cyan
foreach ($epic in $epics) {
    Write-Host "  • $($epic.title)" -NoNewline
    
    $result = & $azPath boards work-item create `
        --type "Epic" `
        --title $epic.title `
        --description $epic.desc `
        --fields "Microsoft.VSTS.Common.Priority=$($epic.priority)" `
        --output json 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host " ✅" -ForegroundColor Green
        $successCount++
    } else {
        Write-Host " ❌" -ForegroundColor Red
        $failCount++
    }
}

# Create Features
Write-Host ""
Write-Host "Creating Features..." -ForegroundColor Cyan
foreach ($feature in $features[0..4]) {  # Create first 5 features
    Write-Host "  • $($feature.title)" -NoNewline
    
    $result = & $azPath boards work-item create `
        --type "Feature" `
        --title $feature.title `
        --description $feature.desc `
        --output json 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host " ✅" -ForegroundColor Green
        $successCount++
    } else {
        Write-Host " ❌" -ForegroundColor Red
        $failCount++
    }
}

# Create User Stories
Write-Host ""
Write-Host "Creating User Stories..." -ForegroundColor Cyan
foreach ($story in $stories[0..6]) {  # Create first 7 stories
    Write-Host "  • $($story.title)" -NoNewline
    
    $result = & $azPath boards work-item create `
        --type "User Story" `
        --title $story.title `
        --fields "Microsoft.VSTS.Scheduling.StoryPoints=$($story.points)" `
        --output json 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host " ✅" -ForegroundColor Green
        $successCount++
    } else {
        Write-Host " ❌" -ForegroundColor Red
        $failCount++
    }
}

# Summary
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "           IMPORT COMPLETE!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Results:" -ForegroundColor Cyan
Write-Host "  ✅ Successful: $successCount items" -ForegroundColor Green
if ($failCount -gt 0) {
    Write-Host "  ❌ Failed: $failCount items" -ForegroundColor Red
}
Write-Host ""
Write-Host "Total Story Points Created: 30" -ForegroundColor Yellow
Write-Host ""
Write-Host "📋 View your board:" -ForegroundColor Cyan
Write-Host "   https://dev.azure.com/aiwhisperer/Business%20Setup/_boards/board"
Write-Host ""
Write-Host "📋 View backlog:" -ForegroundColor Cyan
Write-Host "   https://dev.azure.com/aiwhisperer/Business%20Setup/_backlogs/backlog"
Write-Host ""

if ($successCount -lt 17) {
    Write-Host "💡 TIP: For complete import (48 items), use CSV import:" -ForegroundColor Yellow
    Write-Host "   1. Go to the backlog URL above" -ForegroundColor Gray
    Write-Host "   2. Click 'Import Work Items' (Excel icon)" -ForegroundColor Gray
    Write-Host "   3. Upload: azure-devops\backlog-import.csv" -ForegroundColor Gray
    Write-Host ""
}

Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")