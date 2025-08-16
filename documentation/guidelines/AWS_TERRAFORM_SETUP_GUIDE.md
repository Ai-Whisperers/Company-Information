# AWS & Terraform Setup Guide

**Organization**: AI-Whisperers  
**Last Updated**: 2025-01-13  
**Purpose**: Complete guide for AWS and Terraform configuration

---

## 📋 Table of Contents

1. [AWS Account Setup](#1-aws-account-setup)
2. [IAM User Configuration](#2-iam-user-configuration)
3. [AWS CLI Installation](#3-aws-cli-installation)
4. [Terraform Installation](#4-terraform-installation)
5. [State Backend Setup](#5-state-backend-setup)
6. [Infrastructure Repository](#6-infrastructure-repository)
7. [Multi-Environment Setup](#7-multi-environment-setup)

---

## 1. AWS Account Setup

### 1.1 Create AWS Account
1. Go to [AWS Console](https://console.aws.amazon.com)
2. Click **"Create a new AWS account"**
3. Fill in account details:
   ```
   Account name: AI-Whisperers
   Email: aws@ai-whisperers.org
   Password: [Strong password]
   ```
4. Choose **Business** account type
5. Complete billing information
6. Verify phone number
7. Select **Basic Support Plan** (free)

### 1.2 Account Security Setup
1. Enable **MFA** on root account
2. Create **billing alerts**
3. Set up **CloudTrail** logging
4. Configure **Config** for compliance

**Your values:**
```env
AWS_ACCOUNT_ID=123456789012
AWS_REGION=us-east-1
```

---

## 2. IAM User Configuration

### 2.1 Create IAM User for Terraform
1. Go to **IAM** → **Users** → **Add user**
2. Configure user:
   ```
   User name: terraform-admin
   Access type: ✅ Programmatic access
   ```
3. Attach policies:
   ```
   ✅ AdministratorAccess (for initial setup)
   ```
4. **Copy Access Key ID and Secret** immediately

### 2.2 Create IAM User for Applications
1. Create user: `ai-whisperers-app`
2. Attach custom policy:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "s3:GetObject",
           "s3:PutObject",
           "s3:DeleteObject",
           "s3:ListBucket"
         ],
         "Resource": [
           "arn:aws:s3:::ai-whisperers-*",
           "arn:aws:s3:::ai-whisperers-*/*"
         ]
       },
       {
         "Effect": "Allow",
         "Action": [
           "rds:DescribeDBInstances",
           "rds:DescribeDBClusters"
         ],
         "Resource": "*"
       }
     ]
   }
   ```

### 2.3 Create IAM Roles
1. **Lambda Execution Role**:
   ```
   Role name: ai-whisperers-lambda-role
   Trust policy: Lambda service
   Policies: AWSLambdaBasicExecutionRole
   ```

2. **ECS Task Role**:
   ```
   Role name: ai-whisperers-ecs-task-role
   Trust policy: ECS Tasks service
   Custom policies: As needed
   ```

**Your values:**
```env
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_LAMBDA_ROLE_ARN=arn:aws:iam::123456789012:role/ai-whisperers-lambda-role
```

---

## 3. AWS CLI Installation

### 3.1 Install AWS CLI v2 (Windows)
```powershell
# Download and install
curl "https://awscli.amazonaws.com/AWSCLIV2.msi" -o "AWSCLIV2.msi"
msiexec /i AWSCLIV2.msi /qn

# Verify installation
aws --version
```

### 3.2 Configure AWS CLI
```bash
# Configure default profile
aws configure
# AWS Access Key ID: [Your access key]
# AWS Secret Access Key: [Your secret key]
# Default region name: us-east-1
# Default output format: json

# Configure named profile
aws configure --profile ai-whisperers
```

### 3.3 Test Configuration
```bash
# Test default profile
aws sts get-caller-identity

# Test named profile
aws sts get-caller-identity --profile ai-whisperers
```

**Your values:**
```env
AWS_PROFILE=ai-whisperers
AWS_CLI_PATH=/usr/local/bin/aws
```

---

## 4. Terraform Installation

### 4.1 Install Terraform (Windows)
```powershell
# Using Chocolatey
choco install terraform

# Or download manually
# Download from: https://releases.hashicorp.com/terraform/
# Extract to: C:\terraform\
# Add to PATH: C:\terraform\

# Verify installation
terraform version
```

### 4.2 Install Terraform Extensions
```bash
# VS Code extension
code --install-extension hashicorp.terraform

# Install pre-commit hooks
pip install pre-commit
```

### 4.3 Configure Terraform Cloud (Optional)
1. Go to [Terraform Cloud](https://app.terraform.io)
2. Create organization: `ai-whisperers`
3. Create workspace: `production`
4. Generate API token
5. Configure local CLI:
   ```bash
   terraform login
   ```

**Your values:**
```env
TERRAFORM_BIN_PATH=/usr/local/bin/terraform
TF_CLOUD_ORGANIZATION=ai-whisperers
TF_TOKEN=your-terraform-cloud-token-here
```

---

## 5. State Backend Setup

### 5.1 Create S3 Bucket for State
```bash
# Create bucket
aws s3 mb s3://ai-whisperers-terraform-state --region us-east-1

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket ai-whisperers-terraform-state \
  --versioning-configuration Status=Enabled

# Enable encryption
aws s3api put-bucket-encryption \
  --bucket ai-whisperers-terraform-state \
  --server-side-encryption-configuration '{
    "Rules": [{
      "ApplyServerSideEncryptionByDefault": {
        "SSEAlgorithm": "AES256"
      }
    }]
  }'
```

### 5.2 Create DynamoDB Table for Locking
```bash
aws dynamodb create-table \
  --table-name ai-whisperers-terraform-locks \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 \
  --region us-east-1
```

### 5.3 Configure Backend
Create `backend.tf`:
```hcl
terraform {
  backend "s3" {
    bucket         = "ai-whisperers-terraform-state"
    key            = "infrastructure/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "ai-whisperers-terraform-locks"
    encrypt        = true
  }
}
```

**Your values:**
```env
TF_STATE_BUCKET=ai-whisperers-terraform-state
TF_STATE_KEY=infrastructure/terraform.tfstate
TF_STATE_DYNAMODB_TABLE=ai-whisperers-terraform-locks
```

---

## 6. Infrastructure Repository

### 6.1 Create Infrastructure Repository
```bash
# Create repository structure
mkdir -p infrastructure/{
  environments/{dev,staging,prod},
  modules/{networking,security,compute,storage},
  shared,
  scripts
}

# Initialize Terraform
cd infrastructure
terraform init
```

### 6.2 Repository Structure
```
infrastructure/
├── environments/
│   ├── dev/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── terraform.tfvars
│   ├── staging/
│   └── prod/
├── modules/
│   ├── networking/
│   ├── security/
│   ├── compute/
│   └── storage/
├── shared/
│   ├── backend.tf
│   ├── providers.tf
│   └── variables.tf
└── scripts/
    ├── deploy.sh
    ├── destroy.sh
    └── plan.sh
```

### 6.3 Sample Main Configuration
Create `environments/prod/main.tf`:
```hcl
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
      Environment   = "production"
      Project       = "ai-whisperers"
      ManagedBy     = "terraform"
      Owner         = "devops-team"
    }
  }
}

# Core infrastructure modules
module "networking" {
  source = "../../modules/networking"
  
  vpc_cidr = "10.0.0.0/16"
  environment = "prod"
  project = "ai-whisperers"
}

module "security" {
  source = "../../modules/security"
  
  vpc_id = module.networking.vpc_id
  environment = "prod"
}

module "compute" {
  source = "../../modules/compute"
  
  vpc_id = module.networking.vpc_id
  private_subnet_ids = module.networking.private_subnet_ids
  security_group_ids = module.security.security_group_ids
  environment = "prod"
}
```

**Your values:**
```env
INFRA_REPO_PATH=C:\Users\kyrian\Documents\AI-Whisperers\infrastructure
```

---

## 7. Multi-Environment Setup

### 7.1 Environment Variables
Create `.env.dev`, `.env.staging`, `.env.prod`:
```env
# .env.prod
TF_VAR_environment=production
TF_VAR_aws_region=us-east-1
TF_VAR_instance_type=t3.medium
TF_VAR_min_capacity=2
TF_VAR_max_capacity=10
```

### 7.2 Workspace Management
```bash
# Create workspaces
terraform workspace new dev
terraform workspace new staging
terraform workspace new prod

# Switch between environments
terraform workspace select prod
terraform plan -var-file="prod.tfvars"
terraform apply
```

### 7.3 Deployment Scripts
Create `scripts/deploy.sh`:
```bash
#!/bin/bash
set -e

ENVIRONMENT=${1:-dev}
ACTION=${2:-plan}

echo "🚀 Deploying to $ENVIRONMENT environment..."

# Load environment variables
source .env.$ENVIRONMENT

# Select workspace
terraform workspace select $ENVIRONMENT

# Run terraform
case $ACTION in
  plan)
    terraform plan -var-file="$ENVIRONMENT.tfvars"
    ;;
  apply)
    terraform apply -var-file="$ENVIRONMENT.tfvars" -auto-approve
    ;;
  destroy)
    terraform destroy -var-file="$ENVIRONMENT.tfvars" -auto-approve
    ;;
  *)
    echo "Unknown action: $ACTION"
    exit 1
    ;;
esac

echo "✅ Deployment complete!"
```

**Your values:**
```env
TF_VAR_environment=production
TF_VAR_project=ai-whisperers
DEPLOY_SCRIPTS_PATH=C:\Users\kyrian\Documents\AI-Whisperers\infrastructure\scripts
```

---

## 8. Integration with Projects

### 8.1 Update Project Tech Stacks
All projects now use:
- **Cloud Provider**: AWS (primary) + Azure (hybrid)
- **Infrastructure**: Terraform
- **Compute**: ECS Fargate / Lambda
- **Storage**: S3 + RDS PostgreSQL
- **Networking**: VPC + ALB + CloudFront
- **Monitoring**: CloudWatch + X-Ray

### 8.2 Common AWS Services by Project

#### Business Website
- **Hosting**: S3 + CloudFront
- **SSL**: ACM Certificate
- **Forms**: Lambda + SES

#### AI Investment Platform
- **Compute**: ECS Fargate
- **Database**: RDS PostgreSQL
- **Cache**: ElastiCache Redis
- **ML**: SageMaker
- **Data**: S3 + Athena

#### Comment Analyzer
- **API**: Lambda + API Gateway
- **ML**: SageMaker + Bedrock
- **Queue**: SQS + EventBridge
- **Storage**: S3 + DynamoDB

---

## 🔐 Security Best Practices

### Access Management
- Use IAM roles instead of users where possible
- Implement least privilege principle
- Regular access reviews
- MFA for all human users

### Infrastructure Security
- Enable CloudTrail logging
- Use VPC for network isolation
- Encrypt all data at rest and in transit
- Regular security assessments

### Cost Management
- Set up billing alerts
- Use resource tagging
- Regular cost reviews
- Implement auto-shutdown for dev resources

---

## 🚀 Quick Start Commands

```bash
# Initial setup
aws configure --profile ai-whisperers
terraform init
terraform workspace new prod

# Deploy infrastructure
cd infrastructure/environments/prod
terraform plan -var-file="prod.tfvars"
terraform apply -var-file="prod.tfvars"

# Update environment variables
source .env.prod

# Deploy application
./scripts/deploy.sh prod apply
```

---

**Next Steps**:
1. Complete AWS account setup
2. Configure IAM users and roles
3. Install AWS CLI and Terraform
4. Create infrastructure repository
5. Set up state backend
6. Deploy first environment