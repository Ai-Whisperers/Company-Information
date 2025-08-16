# Complete Environment Configuration Guide

**Organization**: AI-Whisperers  
**Last Updated**: 2025-08-13  
**File Location**: `.env` (single unified configuration file)

---

## 📋 Quick Navigation

1. [Azure Portal](#section-1-azure-portal)
2. [Azure DevOps](#section-2-azure-devops) 
3. [GitHub](#section-3-github)
4. [Discord](#section-4-discord)
5. [Squarespace](#section-5-squarespace)
6. [Supabase](#section-6-supabase)
7. [n8n Cloud](#section-7-n8n-cloud)
8. [Zoho](#section-8-zoho)
9. [Confluence Cloud](#section-9-confluence-cloud)
10. [MCP Configuration](#section-10-mcp-configuration)

---

## SECTION 1: AZURE PORTAL

### 1.1 Getting Subscription ID
1. **Login** to [Azure Portal](https://portal.azure.com)
2. Click **"Subscriptions"** in left menu
3. Click on your subscription name
4. **Copy Subscription ID** 
   - Format: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
   - Location: Overview page, top section

### 1.2 Getting Tenant ID
1. Click your **profile icon** (top right)
2. Select **"Switch directory"**
3. **Copy Directory ID** (this is Tenant ID)
   - Alternative: Azure Active Directory → Overview
   - Format: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`

### 1.3 Creating Service Principal
1. Navigate to **Azure Active Directory** → **App registrations**
2. Click **"+ New registration"**
3. Fill in:
   ```
   Name: AI-Whisperers-ServicePrincipal
   Account type: Accounts in this organizational directory only
   Redirect URI: Leave blank
   ```
4. Click **"Register"**
5. **Copy Application (client) ID** from overview page

### 1.4 Creating Client Secret
1. In your app registration, go to **"Certificates & secrets"**
2. Click **"+ New client secret"**
3. Enter:
   ```
   Description: AI-Whisperers-MCP-Secret
   Expires: 24 months
   ```
4. Click **"Add"**
5. **IMMEDIATELY COPY THE VALUE** (can't view later!)

### 1.5 Storage Account Setup
1. Go to **"Storage accounts"** → **"+ Create"**
2. Configuration:
   ```
   Resource group: ai-whisperers-rg (create new)
   Storage account name: aiwhispererstorage
   Region: East US
   Performance: Standard
   Redundancy: LRS
   ```
3. After creation, go to **"Access keys"**
4. Click **"Show"** next to key1
5. **Copy Connection string**

### 1.6 Key Vault Setup
1. Search **"Key vaults"** → **"+ Create"**
2. Configuration:
   ```
   Resource group: ai-whisperers-rg
   Key vault name: aiwhisperers-kv
   Region: East US
   Pricing tier: Standard
   ```
3. After creation, copy **Vault URI** from Overview

**Values to copy:**
```env
AZURE_SUBSCRIPTION_ID=<from step 1.1>
AZURE_TENANT_ID=<from step 1.2>
AZURE_CLIENT_ID=<from step 1.3>
AZURE_CLIENT_SECRET=<from step 1.4>
AZURE_STORAGE_CONNECTION_STRING=<from step 1.5>
AZURE_KEY_VAULT_URI=<from step 1.6>
```

---

## SECTION 2: AZURE DEVOPS

### 2.1 Creating PAT Token
1. Go to [Azure DevOps](https://dev.azure.com/aiwhisperer)
2. Click **profile icon** → **"Personal access tokens"**
3. Click **"+ New Token"**
4. Configure:
   ```
   Name: AI-Whisperers-MCP-Token
   Organization: aiwhisperer
   Expiration: Custom (90 days)
   Scopes: 
   ✅ Work Items (Read, write, & manage)
   ✅ Code (Full)
   ✅ Build (Read & execute)
   ✅ Release (Read, write, & execute)
   ✅ Project and Team (Read)
   ```
5. Click **"Create"**
6. **COPY TOKEN IMMEDIATELY** (52 characters)

**Values to copy:**
```env
AZURE_DEVOPS_PAT=<52-character token>
```

---

## SECTION 3: GITHUB

### 3.1 Creating Personal Access Token (Fine-grained)
1. Go to [GitHub Settings - Tokens](https://github.com/settings/tokens)
2. Click **"Generate new token"** → **"Fine-grained"**
3. Configure:
   ```
   Token name: AI-Whisperers-MCP
   Expiration: 90 days
   Repository access: Selected → AI-Whisperers
   ```
4. Set Permissions:
   ```
   Repository permissions:
   - Contents: Read and Write
   - Issues: Read and Write  
   - Pull requests: Read and Write
   - Actions: Read
   - Metadata: Read
   ```
5. Click **"Generate token"**
6. **Copy token** (starts with `github_pat_`)

**Values to copy:**
```env
GITHUB_TOKEN=<github_pat_...>
```

---

## SECTION 4: DISCORD

### 4.1 Creating Discord Application
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click **"New Application"**
3. Name: `AI-Whisperers Bot`
4. Accept terms and create

### 4.2 Getting Client ID & Secret
1. In **General Information**:
   - **Copy Application ID** (this is CLIENT_ID)
2. Go to **OAuth2** → **General**:
   - Click **"Reset Secret"** if needed
   - **Copy Client Secret**

### 4.3 Creating Bot Token
1. Go to **Bot** section
2. Click **"Reset Token"**
3. **Copy token immediately**
4. Configure:
   ```
   Public Bot: OFF
   Requires OAuth2 Code Grant: OFF
   ```

### 4.4 Getting Server ID
1. In Discord app, go to **Settings** → **Advanced**
2. Enable **Developer Mode**
3. Right-click your server → **"Copy Server ID"**

### 4.5 Creating Webhook
1. Right-click channel → **"Edit Channel"**
2. Go to **Integrations** → **Webhooks**
3. Create webhook named `AI-Whisperers Notifications`
4. **Copy Webhook URL**

**Values to copy:**
```env
DISCORD_BOT_TOKEN=<from step 4.3>
DISCORD_CLIENT_ID=<from step 4.2>
DISCORD_CLIENT_SECRET=<from step 4.2>
DISCORD_GUILD_ID=<from step 4.4>
DISCORD_WEBHOOK_NOTIFICATIONS=<from step 4.5>
```

---

## SECTION 5: SQUARESPACE

### 5.1 Enabling API Access
1. Login to [Squarespace](https://www.squarespace.com)
2. Go to **Settings** → **Advanced** → **Developer API**
3. Click **"Create new API application"**
4. Fill in:
   ```
   Name: AI-Whisperers Integration
   Website URL: https://ai-whisperers.org
   Redirect URI: https://ai-whisperers.org/callback
   ```
5. After creation, copy:
   - **API Key** (Client ID)
   - **API Secret** (Client Secret)

**Note**: Requires Commerce plan or higher

**Values to copy:**
```env
SQUARESPACE_API_KEY=<from step 5.1>
SQUARESPACE_API_SECRET=<from step 5.1>
```

---

## SECTION 6: SUPABASE

### 6.1 Creating Project
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click **"New project"**
3. Configure:
   ```
   Organization: AI-Whisperers
   Project name: ai-whisperers-main
   Database Password: [Generate strong password]
   Region: US East (N. Virginia)
   ```

### 6.2 Getting API Keys
1. Go to **Settings** → **API**
2. Copy:
   - **Project URL**: `https://[project-ref].supabase.co`
   - **Anon/Public Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **Service Role Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 6.3 Database Connection
1. Go to **Settings** → **Database**
2. Copy **Connection string** (Session mode)
3. Replace `[YOUR-PASSWORD]` with your database password

**Values to copy:**
```env
SUPABASE_URL=<from step 6.2>
SUPABASE_ANON_KEY=<from step 6.2>
SUPABASE_SERVICE_KEY=<from step 6.2>
SUPABASE_DB_PASSWORD=<from step 6.1>
POSTGRES_CONNECTION_STRING=<from step 6.3>
```

---

## SECTION 7: N8N CLOUD

### 7.1 Creating Account
1. Go to [n8n Cloud](https://app.n8n.cloud)
2. Sign up for cloud account
3. Create workspace: `ai-whisperers`

### 7.2 Getting API Key
1. Go to **Settings** → **API Keys**
2. Click **"Create API Key"**
3. Name: `AI-Whisperers-MCP`
4. **Copy API Key**

### 7.3 Instance Details
1. Your instance URL: `https://[workspace].n8n.cloud`
2. Webhook URL: `https://[workspace].n8n.cloud/webhook/`

**Values to copy:**
```env
N8N_API_KEY=<from step 7.2>
N8N_INSTANCE_URL=<from step 7.3>
N8N_WEBHOOK_URL=<from step 7.3>
```

---

## SECTION 8: ZOHO

### 8.1 Creating OAuth Client
1. Go to [Zoho API Console](https://api-console.zoho.com)
2. Click **"Add Client"** → **"Server-based Applications"**
3. Fill in:
   ```
   Client Name: AI-Whisperers Integration
   Homepage URL: https://ai-whisperers.org
   Authorized Redirect URIs: https://ai-whisperers.org/zoho/callback
   ```
4. After creation, copy:
   - **Client ID**: `1000.XXXXXXXXXXXXXXXXXXXXXXXX`
   - **Client Secret**: 40-character string

### 8.2 Generating Refresh Token
1. Use Zoho's OAuth playground or Postman
2. Authorize with scopes:
   ```
   ZohoInvoice.invoices.ALL
   ZohoInvoice.customers.ALL
   ZohoBooks.fullaccess.all
   ```
3. **Copy Refresh Token**

### 8.3 Organization ID
1. Login to Zoho Invoice/Books
2. Go to **Settings** → **Organization Profile**
3. **Copy Organization ID**

**Values to copy:**
```env
ZOHO_CLIENT_ID=<from step 8.1>
ZOHO_CLIENT_SECRET=<from step 8.1>
ZOHO_REFRESH_TOKEN=<from step 8.2>
ZOHO_ORGANIZATION_ID=<from step 8.3>
```

---

## SECTION 9: CONFLUENCE CLOUD

### 9.1 Creating API Token
1. Go to [Atlassian Account Settings](https://id.atlassian.com/manage-profile/security/api-tokens)
2. Click **"Create API token"**
3. Label: `AI-Whisperers-MCP`
4. **Copy token** (format: `ATATT3xFfGF0...`)

### 9.2 Space Setup
1. Login to [Confluence](https://ai-whisperers.atlassian.net)
2. Create space if needed
3. Note your **Space Key** (e.g., `AIWH`)

**Values to copy:**
```env
CONFLUENCE_API_TOKEN=<from step 9.1>
CONFLUENCE_SPACE_KEY=<from step 9.2>
```

---

## SECTION 10: MCP CONFIGURATION

The MCP servers will automatically use the tokens from the main .env file.
No additional configuration needed!

### Testing MCP Connections
```bash
cd mcp-servers
npm run test-mcp
```

---

## 🔐 Security Checklist

Before proceeding:
- [ ] Created `.gitignore` with `.env` entry
- [ ] Stored a backup of credentials in Azure Key Vault
- [ ] Enabled MFA on all accounts
- [ ] Set calendar reminders for token rotation (90 days)
- [ ] Documented which team members have access

---

## 🚀 Quick Setup Script

After filling in all values, run:
```bash
# Validate environment file
node scripts/validate-env.js

# Test all connections
cd mcp-servers
npm run test-mcp

# Initialize services
npm run setup-all
```

---

## 📊 Configuration Status Tracker

| Service | Portal Link | Token Required | Obtained | Tested |
|---------|------------|----------------|----------|--------|
| Azure Portal | [Link](https://portal.azure.com) | Client Secret | ⬜ | ⬜ |
| Azure DevOps | [Link](https://dev.azure.com/aiwhisperer) | PAT | ⬜ | ⬜ |
| GitHub | [Link](https://github.com/settings/tokens) | PAT | ⬜ | ⬜ |
| Discord | [Link](https://discord.com/developers) | Bot Token | ⬜ | ⬜ |
| Squarespace | Settings → API | API Key | ⬜ | ⬜ |
| Supabase | [Link](https://app.supabase.com) | Service Key | ⬜ | ⬜ |
| n8n Cloud | [Link](https://app.n8n.cloud) | API Key | ⬜ | ⬜ |
| Zoho | [Link](https://api-console.zoho.com) | Refresh Token | ⬜ | ⬜ |
| Confluence | [Link](https://id.atlassian.com) | API Token | ⬜ | ⬜ |

---

## 📝 Notes

1. **Token Expiration**: Most tokens expire in 90 days
2. **Backup**: Export completed .env to Azure Key Vault
3. **Team Access**: Share credentials via Azure Key Vault, never via email/chat
4. **Updates**: When tokens change, update both .env and Key Vault

---

**Support**: If you encounter issues, check service-specific documentation or contact support@ai-whisperers.org