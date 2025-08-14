# Azure DevOps Migration Plan

## 🎯 Overview
Complete setup of AI-Whisperers Azure DevOps integrated platform.

## 📊 Migration Structure

### Repositories to Create
1. **core-services** - Python/Node.js backend services
2. **web-platform** - React/Next.js frontend applications  
3. **ml-models** - PyTorch/TensorFlow ML models
4. **documentation** - Technical documentation
5. **infrastructure** - Docker/Kubernetes deployment configs

### Work Item Areas (Projects)
1. **Company-Website** - Main business website (5 tasks)
2. **WPG-Amenities** - Client amenities website (5 tasks)
3. **AI-Investment** - Investment platform (5 tasks)
4. **Comment-Analyzer** - Sentiment analysis tool (5 tasks)
5. **Business-Setup** - Administrative tasks (10 tasks)
6. **Internal-Projects** - Internal tools (5 tasks)

## 🔧 Migration Steps

### Phase 1: Azure DevOps Setup
1. Create organization at https://dev.azure.com
2. Create AI-Whisperers project
3. Generate PAT token with full access
4. Update azure-devops-config.json

### Phase 2: Repository Migration
```bash
# Create remote repositories in Azure DevOps
az repos create --name core-services --project AI-Whisperers
az repos create --name web-platform --project AI-Whisperers
az repos create --name ml-models --project AI-Whisperers
az repos create --name documentation --project AI-Whisperers
az repos create --name infrastructure --project AI-Whisperers

# Migrate existing repositories
cd repositories/core-services
git remote add azure https://dev.azure.com/aiwhisperers/AI-Whisperers/_git/core-services
git push azure --all

cd ../web-platform  
git remote add azure https://dev.azure.com/aiwhisperers/AI-Whisperers/_git/web-platform
git push azure --all

cd ../ml-models
git remote add azure https://dev.azure.com/aiwhisperers/AI-Whisperers/_git/ml-models
git push azure --all

cd ../documentation
git remote add azure https://dev.azure.com/aiwhisperers/AI-Whisperers/_git/documentation
git push azure --all

cd ../infrastructure
git remote add azure https://dev.azure.com/aiwhisperers/AI-Whisperers/_git/infrastructure
git push azure --all
```

### Phase 3: Work Items Migration
Run the migration script to create:
- 35 work items across 6 project areas
- Area paths for project organization
- Custom queries for project filtering

### Phase 4: CI/CD Pipeline Setup
Create Azure Pipelines for each repository:

#### Web Platform Pipeline
```yaml
# azure-pipelines-web.yml
trigger:
  branches:
    include:
    - main
    - develop
  paths:
    include:
    - web-platform/*

pool:
  vmImage: 'ubuntu-latest'

stages:
- stage: Build
  jobs:
  - job: BuildWeb
    steps:
    - task: NodeTool@0
      inputs:
        versionSpec: '18.x'
    - script: |
        cd web-platform
        npm install
        npm run build
        npm run test
        npm run lint
        npm run typecheck
    - task: PublishTestResults@2
      inputs:
        testResultsFormat: 'JUnit'
        testResultsFiles: 'web-platform/test-results.xml'
```

#### Core Services Pipeline
```yaml
# azure-pipelines-services.yml  
trigger:
  branches:
    include:
    - main
    - develop
  paths:
    include:
    - core-services/*

pool:
  vmImage: 'ubuntu-latest'

stages:
- stage: BuildPython
  jobs:
  - job: BuildPythonAPI
    steps:
    - task: UsePythonVersion@0
      inputs:
        versionSpec: '3.11'
    - script: |
        cd core-services/python-api
        pip install -r requirements.txt
        python -m pytest tests/
        
- stage: BuildNodeJS
  jobs:
  - job: BuildNodeAPI
    steps:
    - task: NodeTool@0
      inputs:
        versionSpec: '18.x'
    - script: |
        cd core-services/node-api
        npm install
        npm test
        npm run lint
```

#### ML Models Pipeline
```yaml
# azure-pipelines-ml.yml
trigger:
  branches:
    include:
    - main
    - develop
  paths:
    include:
    - ml-models/*

pool:
  vmImage: 'ubuntu-latest'

stages:
- stage: BuildML
  jobs:
  - job: TrainModels
    steps:
    - task: UsePythonVersion@0
      inputs:
        versionSpec: '3.11'
    - script: |
        cd ml-models
        pip install -r requirements.txt
        python -m pytest tests/
        python src/training/validate.py
```

### Phase 5: Board Configuration
- **Kanban boards** for visual task management
- **Sprint planning** with 2-week iterations
- **Backlogs** with priority ordering
- **Custom queries** per project area
- **Dashboards** for progress tracking

## 🚀 Post-Migration Setup

### Repository Settings
- **Branch policies** on main/develop
- **Pull request requirements** 
- **Code review workflows**
- **Security scanning** enabled

### Team Configuration
- **Add team members** with appropriate permissions
- **Configure notifications** for important events
- **Setup integrations** with Slack/Teams if needed

### Monitoring & Analytics
- **Azure Monitor** for application insights
- **Work item analytics** for progress tracking
- **Build/release dashboards**

## 📋 Execution Checklist

- [ ] Create Azure DevOps organization
- [ ] Generate new PAT token  
- [ ] Update configuration files
- [ ] Run repository migration script
- [ ] Execute work items migration
- [ ] Setup CI/CD pipelines
- [ ] Configure boards and sprints
- [ ] Add team members and permissions
- [ ] Test full workflow end-to-end

## 🔗 Key URLs (after setup)
- Organization: `https://dev.azure.com/aiwhisperers`
- Project: `https://dev.azure.com/aiwhisperers/AI-Whisperers`
- Boards: `https://dev.azure.com/aiwhisperers/AI-Whisperers/_boards`
- Repos: `https://dev.azure.com/aiwhisperers/AI-Whisperers/_git`
- Pipelines: `https://dev.azure.com/aiwhisperers/AI-Whisperers/_build`