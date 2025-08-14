# AWS and Terraform Setup Script for AI-Whisperers
# Run this script to install and configure AWS CLI and Terraform on Windows

param(
    [string]$AWSProfile = "ai-whisperers",
    [string]$Region = "us-east-1"
)

Write-Host "🚀 Setting up AWS and Terraform for AI-Whisperers..." -ForegroundColor Green

# Check if running as Administrator
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "❌ This script needs to be run as Administrator" -ForegroundColor Red
    Write-Host "Right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    exit 1
}

# Install Chocolatey if not installed
if (!(Get-Command choco -ErrorAction SilentlyContinue)) {
    Write-Host "📦 Installing Chocolatey..." -ForegroundColor Yellow
    Set-ExecutionPolicy Bypass -Scope Process -Force
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
    iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
}

# Install AWS CLI
Write-Host "☁️ Installing AWS CLI..." -ForegroundColor Yellow
if (!(Get-Command aws -ErrorAction SilentlyContinue)) {
    choco install awscli -y
    refreshenv
} else {
    Write-Host "✅ AWS CLI already installed" -ForegroundColor Green
}

# Install Terraform
Write-Host "🏗️ Installing Terraform..." -ForegroundColor Yellow
if (!(Get-Command terraform -ErrorAction SilentlyContinue)) {
    choco install terraform -y
    refreshenv
} else {
    Write-Host "✅ Terraform already installed" -ForegroundColor Green
}

# Install Git (if not installed)
if (!(Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "📂 Installing Git..." -ForegroundColor Yellow
    choco install git -y
    refreshenv
}

# Verify installations
Write-Host "`n🔍 Verifying installations..." -ForegroundColor Cyan
try {
    $awsVersion = aws --version 2>&1
    Write-Host "✅ AWS CLI: $awsVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ AWS CLI installation failed" -ForegroundColor Red
}

try {
    $terraformVersion = terraform version
    Write-Host "✅ Terraform: $terraformVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Terraform installation failed" -ForegroundColor Red
}

# Create AWS credentials directory
$awsDir = "$env:USERPROFILE\.aws"
if (!(Test-Path $awsDir)) {
    New-Item -ItemType Directory -Path $awsDir -Force
    Write-Host "📁 Created AWS credentials directory" -ForegroundColor Green
}

# Create infrastructure directory structure
Write-Host "`n📁 Creating infrastructure directory structure..." -ForegroundColor Cyan
$infraDir = "C:\Users\$env:USERNAME\Documents\AI-Whisperers\infrastructure"

$directories = @(
    "$infraDir\environments\dev",
    "$infraDir\environments\staging", 
    "$infraDir\environments\prod",
    "$infraDir\modules\networking",
    "$infraDir\modules\security",
    "$infraDir\modules\compute",
    "$infraDir\modules\storage",
    "$infraDir\modules\ml",
    "$infraDir\shared",
    "$infraDir\scripts"
)

foreach ($dir in $directories) {
    if (!(Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force
        Write-Host "✅ Created: $dir" -ForegroundColor Green
    }
}

# Create basic Terraform files
Write-Host "`n📝 Creating basic Terraform configuration files..." -ForegroundColor Cyan

# Backend configuration
$backendConfig = @"
terraform {
  backend "s3" {
    bucket         = "ai-whisperers-terraform-state"
    key            = "infrastructure/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "ai-whisperers-terraform-locks"
    encrypt        = true
  }
}
"@

$backendConfig | Out-File -FilePath "$infraDir\shared\backend.tf" -Encoding UTF8

# Provider configuration
$providerConfig = @"
terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
  
  default_tags {
    tags = {
      Environment   = var.environment
      Project       = "ai-whisperers"
      ManagedBy     = "terraform"
      Owner         = "devops-team"
    }
  }
}
"@

$providerConfig | Out-File -FilePath "$infraDir\shared\providers.tf" -Encoding UTF8

# Variables
$variablesConfig = @"
variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "project" {
  description = "Project name"
  type        = string
  default     = "ai-whisperers"
}
"@

$variablesConfig | Out-File -FilePath "$infraDir\shared\variables.tf" -Encoding UTF8

# Production environment main.tf
$prodMain = @"
terraform {
  required_version = ">= 1.0"
}

# Include shared configuration
module "shared" {
  source = "../../shared"
}

# Local values
locals {
  environment = "prod"
  project     = "ai-whisperers"
}

# Core infrastructure modules
module "networking" {
  source = "../../modules/networking"
  
  environment = local.environment
  project     = local.project
}

module "security" {
  source = "../../modules/security"
  
  environment = local.environment
  project     = local.project
}

# Add more modules as needed
"@

$prodMain | Out-File -FilePath "$infraDir\environments\prod\main.tf" -Encoding UTF8

# Production terraform.tfvars
$prodVars = @"
aws_region  = "us-east-1"
environment = "prod"
project     = "ai-whisperers"
"@

$prodVars | Out-File -FilePath "$infraDir\environments\prod\terraform.tfvars" -Encoding UTF8

# Deployment script
$deployScript = @"
#!/bin/bash
# AWS and Terraform Deployment Script

set -e

ENVIRONMENT=`${1:-dev}
ACTION=`${2:-plan}

echo "🚀 Deploying to `$ENVIRONMENT environment..."

# Change to environment directory
cd "environments/`$ENVIRONMENT"

# Initialize Terraform
terraform init

# Select or create workspace
terraform workspace select `$ENVIRONMENT 2>/dev/null || terraform workspace new `$ENVIRONMENT

# Run terraform command
case `$ACTION in
  plan)
    terraform plan -var-file="`$ENVIRONMENT.tfvars"
    ;;
  apply)
    terraform apply -var-file="`$ENVIRONMENT.tfvars" -auto-approve
    ;;
  destroy)
    terraform destroy -var-file="`$ENVIRONMENT.tfvars" -auto-approve
    ;;
  *)
    echo "Usage: `$0 [dev|staging|prod] [plan|apply|destroy]"
    exit 1
    ;;
esac

echo "✅ Deployment complete!"
"@

$deployScript | Out-File -FilePath "$infraDir\scripts\deploy.sh" -Encoding UTF8

# PowerShell deployment script
$deployPS = @"
param(
    [Parameter(Mandatory=`$false)]
    [ValidateSet("dev", "staging", "prod")]
    [string]`$Environment = "dev",
    
    [Parameter(Mandatory=`$false)]
    [ValidateSet("plan", "apply", "destroy")]
    [string]`$Action = "plan"
)

Write-Host "🚀 Deploying to `$Environment environment..." -ForegroundColor Green

# Change to environment directory
Set-Location "environments\`$Environment"

# Initialize Terraform
terraform init

# Select or create workspace
try {
    terraform workspace select `$Environment
} catch {
    terraform workspace new `$Environment
}

# Run terraform command
switch (`$Action) {
    "plan" {
        terraform plan -var-file="`$Environment.tfvars"
    }
    "apply" {
        terraform apply -var-file="`$Environment.tfvars" -auto-approve
    }
    "destroy" {
        terraform destroy -var-file="`$Environment.tfvars" -auto-approve
    }
}

Write-Host "✅ Deployment complete!" -ForegroundColor Green
"@

$deployPS | Out-File -FilePath "$infraDir\scripts\deploy.ps1" -Encoding UTF8

Write-Host "`n✅ Infrastructure directory structure created!" -ForegroundColor Green

# Create .gitignore for infrastructure
$gitignore = @"
# Terraform
*.tfstate
*.tfstate.*
.terraform/
.terraform.lock.hcl
*.tfvars.json

# Environment variables
.env
.env.*

# Logs
*.log

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo
"@

$gitignore | Out-File -FilePath "$infraDir\.gitignore" -Encoding UTF8

Write-Host "`n📋 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Configure AWS credentials: aws configure --profile $AWSProfile" -ForegroundColor Yellow
Write-Host "2. Edit .env file with your AWS credentials" -ForegroundColor Yellow
Write-Host "3. Create S3 bucket for Terraform state: aws s3 mb s3://ai-whisperers-terraform-state" -ForegroundColor Yellow
Write-Host "4. Create DynamoDB table for state locking" -ForegroundColor Yellow
Write-Host "5. Initialize Terraform: cd infrastructure/environments/prod && terraform init" -ForegroundColor Yellow

Write-Host "`n🎉 AWS and Terraform setup complete!" -ForegroundColor Green
Write-Host "Infrastructure directory: $infraDir" -ForegroundColor Cyan