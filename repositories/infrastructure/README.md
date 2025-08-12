# Infrastructure

Infrastructure as Code (IaC) and deployment configurations for AI-Whisperers platform.

## Overview

This repository contains all infrastructure definitions, deployment scripts, and monitoring configurations for the AI-Whisperers platform.

## Tech Stack

- **IaC**: Terraform, CloudFormation
- **Container Orchestration**: Kubernetes, Docker Swarm
- **Configuration Management**: Ansible, Helm
- **CI/CD**: GitHub Actions, ArgoCD, Jenkins
- **Monitoring**: Prometheus, Grafana, ELK Stack
- **Cloud Providers**: AWS, GCP, Azure

## Project Structure

```
infrastructure/
├── terraform/         # Terraform infrastructure definitions
├── kubernetes/        # Kubernetes manifests and Helm charts
├── ansible/           # Ansible playbooks and roles
├── monitoring/        # Monitoring and alerting configs
├── scripts/           # Deployment and utility scripts
└── docker/            # Docker configurations
```

## Getting Started

### Prerequisites

- Terraform >= 1.5.0
- kubectl >= 1.27.0
- Helm >= 3.12.0
- Ansible >= 2.15.0
- AWS CLI / gcloud / az CLI
- Docker & Docker Compose

### Initial Setup

1. Clone the repository:
```bash
git clone https://github.com/Ai-Whisperers/infrastructure.git
cd infrastructure
```

2. Install required tools:
```bash
# Install Terraform
brew install terraform

# Install kubectl
brew install kubernetes-cli

# Install Helm
brew install helm

# Install Ansible
pip install ansible
```

3. Configure cloud credentials:
```bash
# AWS
aws configure

# GCP
gcloud auth login

# Azure
az login
```

## Terraform Infrastructure

### Directory Structure

```
terraform/
├── environments/
│   ├── dev/
│   ├── staging/
│   └── production/
├── modules/
│   ├── networking/
│   ├── compute/
│   ├── database/
│   └── storage/
└── global/
```

### Deployment

```bash
# Initialize Terraform
cd terraform/environments/dev
terraform init

# Plan changes
terraform plan -out=tfplan

# Apply changes
terraform apply tfplan

# Destroy infrastructure
terraform destroy
```

### Example Module Usage

```hcl
module "vpc" {
  source = "../../modules/networking"
  
  cidr_block = "10.0.0.0/16"
  environment = "dev"
  availability_zones = ["us-east-1a", "us-east-1b"]
}

module "eks_cluster" {
  source = "../../modules/compute/eks"
  
  cluster_name = "ai-whisperers-dev"
  node_groups = {
    general = {
      instance_types = ["t3.medium"]
      min_size = 2
      max_size = 10
    }
  }
}
```

## Kubernetes Deployments

### Cluster Setup

```bash
# Create EKS cluster
eksctl create cluster -f kubernetes/cluster-config.yaml

# Install core components
kubectl apply -f kubernetes/namespaces/
kubectl apply -f kubernetes/rbac/
```

### Application Deployment

```bash
# Deploy using kubectl
kubectl apply -k kubernetes/overlays/dev/

# Deploy using Helm
helm install app ./kubernetes/helm/app \
  -f values-dev.yaml \
  --namespace ai-whisperers
```

### GitOps with ArgoCD

```yaml
# argocd/application.yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: ai-whisperers
spec:
  source:
    repoURL: https://github.com/Ai-Whisperers/infrastructure
    path: kubernetes/overlays/production
    targetRevision: main
  destination:
    server: https://kubernetes.default.svc
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
```

## Ansible Automation

### Playbook Structure

```
ansible/
├── playbooks/
│   ├── site.yml
│   ├── deploy.yml
│   └── backup.yml
├── roles/
│   ├── common/
│   ├── docker/
│   └── monitoring/
└── inventory/
    ├── production
    └── staging
```

### Running Playbooks

```bash
# Deploy application
ansible-playbook -i inventory/production playbooks/deploy.yml

# Configure servers
ansible-playbook -i inventory/staging playbooks/site.yml

# Run ad-hoc commands
ansible all -i inventory/production -m ping
```

## Monitoring Stack

### Prometheus Configuration

```yaml
# monitoring/prometheus/prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'kubernetes-pods'
    kubernetes_sd_configs:
      - role: pod
    relabel_configs:
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
        action: keep
        regex: true
```

### Grafana Dashboards

```bash
# Import dashboards
kubectl apply -f monitoring/grafana/dashboards/

# Access Grafana
kubectl port-forward svc/grafana 3000:3000
```

### Alert Rules

```yaml
# monitoring/alerts/rules.yml
groups:
  - name: application
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
        for: 5m
        annotations:
          summary: High error rate detected
```

## CI/CD Pipelines

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Kubernetes
        run: |
          kubectl apply -k kubernetes/overlays/production/
```

### Jenkins Pipeline

```groovy
// Jenkinsfile
pipeline {
  agent any
  stages {
    stage('Build') {
      steps {
        sh 'docker build -t app:${BUILD_NUMBER} .'
      }
    }
    stage('Deploy') {
      steps {
        sh 'kubectl set image deployment/app app=app:${BUILD_NUMBER}'
      }
    }
  }
}
```

## Security Configurations

### Network Policies

```yaml
# kubernetes/network-policies/deny-all.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: deny-all
spec:
  podSelector: {}
  policyTypes:
    - Ingress
    - Egress
```

### Secrets Management

```bash
# Using Sealed Secrets
kubeseal --format=yaml < secret.yaml > sealed-secret.yaml

# Using External Secrets Operator
kubectl apply -f kubernetes/external-secrets/
```

## Backup and Disaster Recovery

### Backup Strategy

```bash
# Database backups
./scripts/backup-database.sh

# Kubernetes cluster backup with Velero
velero backup create cluster-backup --include-namespaces ai-whisperers

# Terraform state backup
aws s3 sync terraform/.terraform s3://terraform-state-backup/
```

### Restore Procedures

```bash
# Restore from Velero backup
velero restore create --from-backup cluster-backup

# Restore database
./scripts/restore-database.sh backup-2024-01-01.sql
```

## Cost Optimization

### Resource Tagging

```hcl
# terraform/modules/tagging/main.tf
locals {
  common_tags = {
    Environment = var.environment
    Project     = "ai-whisperers"
    ManagedBy   = "terraform"
    CostCenter  = var.cost_center
  }
}
```

### Auto-scaling Policies

```yaml
# kubernetes/autoscaling/hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: app-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: app
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
```

## Documentation

- [Terraform Best Practices](docs/terraform-best-practices.md)
- [Kubernetes Security Guide](docs/k8s-security.md)
- [Disaster Recovery Plan](docs/disaster-recovery.md)
- [Runbook](docs/runbook.md)

## Contributing

Please read our [Contributing Guide](https://github.com/Ai-Whisperers/documentation/blob/main/CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is proprietary and confidential.