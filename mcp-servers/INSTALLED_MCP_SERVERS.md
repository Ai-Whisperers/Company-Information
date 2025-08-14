# Installed MCP Servers for AI-Whisperers

**Last Updated**: 2025-08-13  
**Location**: `/mcp-servers/`

---

## 🎯 Installed MCP Servers

We've installed the following MCP servers to integrate with your platforms:

### 1. **GitHub MCP Server** ✅
**Package**: `@modelcontextprotocol/server-github`  
**Version**: 2025.4.8  
**Purpose**: Complete GitHub repository management

#### Features
- Create, read, update, and delete files
- Manage branches and pull requests
- Search repositories and code
- Handle issues and comments
- Fork repositories
- View commit history

#### Configuration
```json
{
  "github": {
    "command": "node",
    "args": ["mcp-servers/node_modules/@modelcontextprotocol/server-github/dist/index.js"],
    "env": {
      "GITHUB_TOKEN": "your-github-pat-here"
    }
  }
}
```

#### Available Tools
- `create_or_update_file` - Manage repository files
- `search_repositories` - Find repos
- `create_issue` - Open new issues
- `create_pull_request` - Create PRs
- `list_commits` - View commit history
- `fork_repository` - Fork repos
- `push_files` - Batch file operations

---

### 2. **PostgreSQL MCP Server** ✅
**Package**: `@modelcontextprotocol/server-postgres`  
**Version**: 0.6.2  
**Purpose**: PostgreSQL database access (for Supabase)

#### Features
- Execute SQL queries
- Schema inspection
- Table management
- Read-only safety mode
- Connection pooling

#### Configuration
```json
{
  "postgres": {
    "command": "node",
    "args": ["mcp-servers/node_modules/@modelcontextprotocol/server-postgres/dist/index.js"],
    "env": {
      "POSTGRES_CONNECTION_STRING": "postgresql://user:password@db.supabase.co:5432/postgres"
    }
  }
}
```

#### Available Tools
- `query` - Execute SQL queries
- `list_tables` - Show all tables
- `describe_table` - Get table schema
- `list_databases` - Show available databases

---

### 3. **Filesystem MCP Server** ✅
**Package**: `@modelcontextprotocol/server-filesystem`  
**Version**: 2025.7.29  
**Purpose**: Enhanced file system access

#### Features
- Read/write files
- Directory operations
- File search
- Path traversal protection
- Configurable root directory

#### Configuration
```json
{
  "filesystem": {
    "command": "node",
    "args": ["mcp-servers/node_modules/@modelcontextprotocol/server-filesystem/dist/index.js"],
    "env": {
      "FILESYSTEM_ROOT": "C:\\Users\\kyrian\\Documents\\AI-Whisperers",
      "FILESYSTEM_ALLOW_WRITE": "true"
    }
  }
}
```

#### Available Tools
- `read_file` - Read file contents
- `write_file` - Write to files
- `list_directory` - List folder contents
- `create_directory` - Make folders
- `delete_file` - Remove files
- `search_files` - Find files by pattern

---

### 4. **Notion MCP Server** ✅
**Package**: `@notionhq/notion-mcp-server`  
**Version**: 1.8.1  
**Purpose**: Notion workspace management (alternative to Confluence)

#### Features
- Page creation and editing
- Database operations
- Block management
- Search functionality
- Template support

#### Configuration
```json
{
  "notion": {
    "command": "node",
    "args": ["mcp-servers/node_modules/@notionhq/notion-mcp-server/dist/index.js"],
    "env": {
      "NOTION_API_KEY": "your-notion-integration-token"
    }
  }
}
```

#### Available Tools
- `create_page` - Create new pages
- `update_page` - Edit existing pages
- `query_database` - Search databases
- `append_block` - Add content blocks
- `search` - Search workspace

---

### 5. **Azure DevOps MCP** (Already Configured)
**Package**: `@azure-devops/mcp`  
**Status**: Previously installed  
**Purpose**: Azure DevOps project management

---

## 📦 MCP Servers We Need to Build

### For Your Specific Platforms:

#### 1. **Discord MCP Server** 🔨
```javascript
// Custom development needed
// Features: Send messages, manage channels, handle webhooks
```

#### 2. **Zoho MCP Server** 🔨
```javascript
// Custom development needed
// Features: Create invoices, track expenses, manage customers
```

#### 3. **n8n MCP Server** 🔨
```javascript
// Custom development needed
// Features: Trigger workflows, monitor executions
```

#### 4. **Supabase MCP Server** 🔨
```javascript
// Can use PostgreSQL MCP + custom extensions
// Features: Auth management, storage, functions
```

---

## 🚀 How to Use These Servers

### 1. Update Configuration
Edit `mcp-config.json` or `mcp-config-full.json` with your credentials:
```bash
# Add your tokens
GITHUB_TOKEN=ghp_xxxxx
POSTGRES_CONNECTION_STRING=postgresql://...
NOTION_API_KEY=secret_xxxxx
```

### 2. Test Connection
```bash
# Test GitHub MCP
node mcp-servers/node_modules/@modelcontextprotocol/server-github/dist/index.js

# Test PostgreSQL MCP
node mcp-servers/node_modules/@modelcontextprotocol/server-postgres/dist/index.js
```

### 3. Use with Claude
Once configured, Claude can:
- Manage your GitHub repositories
- Query your PostgreSQL/Supabase database
- Access and modify files in your project
- Create and update Notion pages

---

## 🔐 Security Notes

### Environment Variables
Create `.env.mcp` file:
```env
# GitHub
GITHUB_TOKEN=ghp_your_token_here

# PostgreSQL/Supabase
POSTGRES_CONNECTION_STRING=postgresql://user:pass@host:5432/db

# Notion
NOTION_API_KEY=secret_your_key_here

# Filesystem
FILESYSTEM_ROOT=/path/to/project
FILESYSTEM_ALLOW_WRITE=true
```

### Best Practices
1. **Never commit tokens** to version control
2. **Use read-only access** where possible
3. **Limit filesystem scope** to project directory
4. **Rotate tokens** every 90 days
5. **Monitor MCP logs** for unusual activity

---

## 📊 MCP Server Status

| Server | Installed | Configured | Tested | Production Ready |
|--------|-----------|------------|--------|------------------|
| GitHub | ✅ | ⬜ | ⬜ | ⬜ |
| PostgreSQL | ✅ | ⬜ | ⬜ | ⬜ |
| Filesystem | ✅ | ⬜ | ⬜ | ⬜ |
| Notion | ✅ | ⬜ | ⬜ | ⬜ |
| Azure DevOps | ✅ | ✅ | ⬜ | ⬜ |
| Discord | ❌ | ❌ | ❌ | ❌ |
| Zoho | ❌ | ❌ | ❌ | ❌ |
| n8n | ❌ | ❌ | ❌ | ❌ |
| Supabase | 🔄 | ⬜ | ⬜ | ⬜ |

**Legend**: ✅ Complete | ⬜ Pending | ❌ Not Available | 🔄 Using Alternative

---

## 🔧 Troubleshooting

### Common Issues

#### 1. Server Won't Start
```bash
# Check Node.js version
node --version  # Should be 18+

# Reinstall packages
cd mcp-servers
npm install
```

#### 2. Authentication Errors
- Verify tokens are correct
- Check token permissions
- Ensure tokens aren't expired

#### 3. Connection Issues
- Check network connectivity
- Verify API endpoints
- Test with curl/Postman first

---

## 📚 Resources

### Documentation
- [MCP Specification](https://modelcontextprotocol.io)
- [GitHub MCP Docs](https://github.com/modelcontextprotocol/server-github)
- [PostgreSQL MCP Docs](https://github.com/modelcontextprotocol/server-postgres)
- [Notion API Docs](https://developers.notion.com)

### Community
- [MCP Discord Server](https://discord.gg/mcp)
- [GitHub Discussions](https://github.com/modelcontextprotocol/servers/discussions)
- [MCP Examples](https://github.com/modelcontextprotocol/examples)

---

**Next Steps**:
1. Configure authentication tokens
2. Test each server connection
3. Integrate with Claude
4. Build custom servers for Discord, Zoho, n8n

**Document Status**: ✅ Complete  
**Owner**: AI-Whisperers Development Team