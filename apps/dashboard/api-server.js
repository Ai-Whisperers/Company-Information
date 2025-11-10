const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const { Octokit } = require('@octokit/rest');

const execAsync = promisify(exec);
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Content Security Policy middleware
app.use((req, res, next) => {
    res.setHeader(
        'Content-Security-Policy',
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline'; " +
        "style-src 'self' 'unsafe-inline'; " +
        "img-src 'self' data: https:; " +
        "connect-src 'self' ws: wss:; " +
        "font-src 'self'; " +
        "object-src 'none'; " +
        "base-uri 'self'; " +
        "form-action 'self'"
    );
    next();
});

app.use(express.static('.'));

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

// Configuration
const CONFIG = {
    organization: 'Ai-Whisperers',
    todosDir: path.join(__dirname, '../../'),
    excaliburScript: 'C:\\Users\\kyrian\\Documents\\Company-Information\\scripts\\excalibur-command.ps1',
    githubToken: process.env.GITHUB_TOKEN || process.env.GITHUB_PAT
};

// Initialize GitHub API client
const octokit = new Octokit({
    auth: CONFIG.githubToken
});

// Cache for GitHub data
const dataCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Project mapping
const projectMapping = {
    'AI-Investment': 'ai-investment-todos.md',
    'Comment-Analyzer': 'comment-analizer-todos.md',
    'WPG-Amenities': 'wpg-amenities-todos.md',
    'AI-Whisperers-Website': 'ai-whisperers-website-todos.md',
    'AI-Whisperers-Core': 'ai-whisperers-todos.md',
    'Call-Recorder': 'call-recorder-todos.md',
    'Clockify-ADO-Report': 'clockify-ado-automated-report-todos.md'
};

// API Endpoints

// Get project list with real-time GitHub data
app.get('/api/projects', async (req, res) => {
    try {
        // Fetch all repositories from GitHub
        const { data: repos } = await octokit.repos.listForOrg({
            org: CONFIG.organization,
            per_page: 100,
            sort: 'updated',
            type: 'all'
        });

        const projects = await Promise.all(
            repos.map(async repo => {
                try {
                    // Get additional data for each repo
                    const [issuesData, prsData, commitsData] = await Promise.all([
                        octokit.issues.listForRepo({
                            owner: CONFIG.organization,
                            repo: repo.name,
                            state: 'open',
                            per_page: 1
                        }),
                        octokit.pulls.list({
                            owner: CONFIG.organization,
                            repo: repo.name,
                            state: 'open',
                            per_page: 1
                        }),
                        octokit.repos.listCommits({
                            owner: CONFIG.organization,
                            repo: repo.name,
                            per_page: 1
                        }).catch(() => ({ data: [] }))
                    ]);

                    // Calculate health score
                    const daysSinceUpdate = Math.floor((Date.now() - new Date(repo.pushed_at)) / (1000 * 60 * 60 * 24));
                    let healthScore = 100;
                    healthScore -= Math.min(daysSinceUpdate * 2, 40); // Penalize old repos
                    healthScore -= Math.min(repo.open_issues_count * 1, 30); // Penalize open issues
                    healthScore = Math.max(0, healthScore);

                    return {
                        name: repo.name,
                        description: repo.description,
                        url: repo.html_url,
                        lastUpdated: repo.pushed_at,
                        openIssues: repo.open_issues_count,
                        openPRs: prsData.data.length,
                        stars: repo.stargazers_count,
                        language: repo.language,
                        healthScore,
                        isPrivate: repo.private,
                        lastCommit: commitsData.data.length > 0 ? commitsData.data[0].commit.author.date : null,
                        todoFile: projectMapping[repo.name] || null
                    };
                } catch (error) {
                    console.error(`Error processing repo ${repo.name}:`, error.message);
                    return null;
                }
            })
        );

        res.json({
            success: true,
            projects: projects.filter(p => p !== null),
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Failed to get projects:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get project TODOs
app.get('/api/project/:name/todos', async (req, res) => {
    const { name } = req.params;

    if (!projectMapping[name]) {
        return res.status(404).json({ success: false, error: 'Project not found' });
    }

    // Return mock TODOs based on project name - keeping exact same format as before
    const mockTodos = generateMockTodos(name);
    res.json({ success: true, todos: mockTodos });
});

// Get GitHub data for project
app.get('/api/project/:name/github', async (req, res) => {
    const { name } = req.params;
    const cacheKey = `github-${name}`;

    // Check cache
    if (dataCache.has(cacheKey)) {
        const cached = dataCache.get(cacheKey);
        if (Date.now() - cached.timestamp < CACHE_DURATION) {
            return res.json({ success: true, data: cached.data, cached: true });
        }
    }

    try {
        const githubData = await fetchGitHubData(name);

        // Cache the result
        dataCache.set(cacheKey, {
            data: githubData,
            timestamp: Date.now()
        });

        res.json({ success: true, data: githubData });
    } catch (error) {
        console.error(`Failed to fetch GitHub data for ${name}:`, error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Run Excalibur sync
app.post('/api/excalibur/sync', async (req, res) => {
    try {
        const result = await runExcaliburSync();
        res.json({ success: true, result });
    } catch (error) {
        console.error('Failed to run Excalibur sync:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get commit status (checks for new commits)
app.get('/api/project/:name/commit-status', async (req, res) => {
    const { name } = req.params;

    try {
        const hasNewCommits = await checkForNewCommits(name);
        res.json({ success: true, hasNewCommits });
    } catch (error) {
        console.error(`Failed to check commit status for ${name}:`, error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update TODO status
app.post('/api/project/:name/todo/update', async (req, res) => {
    const { name } = req.params;
    const { todoId, completed } = req.body;

    try {
        // This would update the TODO status in the markdown file
        // For now, we'll just acknowledge the update
        res.json({ success: true, message: 'TODO status updated' });
    } catch (error) {
        console.error(`Failed to update TODO for ${name}:`, error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Download project report
app.get('/api/project/:name/download/report', async (req, res) => {
    const { name } = req.params;

    if (!projectMapping[name]) {
        return res.status(404).json({ success: false, error: 'Project not found' });
    }

    try {
        const report = await generateProjectReportContent(name);
        const filename = `${name}-Project-Report-${new Date().toISOString().split('T')[0]}.md`;

        res.setHeader('Content-Type', 'text/markdown');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(report);
    } catch (error) {
        console.error(`Failed to generate report for ${name}:`, error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Download TODO list
app.get('/api/project/:name/download/todos', async (req, res) => {
    const { name } = req.params;

    if (!projectMapping[name]) {
        return res.status(404).json({ success: false, error: 'Project not found' });
    }

    try {
        const todoMarkdown = await generateTodoMarkdownContent(name);
        const filename = `${name}-TODO-List-${new Date().toISOString().split('T')[0]}.md`;

        res.setHeader('Content-Type', 'text/markdown');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(todoMarkdown);
    } catch (error) {
        console.error(`Failed to generate TODO list for ${name}:`, error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Helper Functions

async function getFileModificationTime(filePath) {
    try {
        const stats = await fs.stat(filePath);
        return stats.mtime.toISOString();
    } catch (error) {
        return null;
    }
}

function generateMockTodos(projectName) {
    const todoTemplates = {
        'AI-Investment': [
            { category: 'High Priority', text: 'Complete security audit and penetration testing', priority: 'high', completed: false },
            { category: 'High Priority', text: 'Implement comprehensive API rate limiting', priority: 'high', completed: false },
            { category: 'High Priority', text: 'Add real-time portfolio performance dashboard', priority: 'high', completed: true },
            { category: 'High Priority', text: 'Optimize database queries for better performance', priority: 'medium', completed: false },
            { category: 'Medium Priority', text: 'Increase test coverage to 90%+', priority: 'medium', completed: false },
            { category: 'Medium Priority', text: 'Add end-to-end testing for trading workflows', priority: 'medium', completed: true }
        ],
        'Comment-Analyzer': [
            { category: 'High Priority', text: 'Add support for additional file formats (CSV, JSON, XML)', priority: 'high', completed: false },
            { category: 'High Priority', text: 'Implement batch processing for multiple files', priority: 'high', completed: true },
            { category: 'High Priority', text: 'Improve error handling for malformed input data', priority: 'high', completed: false },
            { category: 'Medium Priority', text: 'Redesign UI with modern Streamlit components', priority: 'medium', completed: false },
            { category: 'Medium Priority', text: 'Add data visualization charts and graphs', priority: 'medium', completed: false }
        ],
        'WPG-Amenities': [
            { category: 'Core Development', text: 'Complete basic web application framework setup', priority: 'high', completed: true },
            { category: 'Core Development', text: 'Implement database schema for local businesses', priority: 'high', completed: false },
            { category: 'Core Development', text: 'Create user registration and authentication system', priority: 'high', completed: false },
            { category: 'User Experience', text: 'Design responsive mobile-first interface', priority: 'medium', completed: false },
            { category: 'User Experience', text: 'Add advanced search with filters', priority: 'medium', completed: false }
        ]
    };

    return todoTemplates[projectName] || [
        { category: 'General', text: 'Update documentation and README', priority: 'medium', completed: false },
        { category: 'General', text: 'Add or improve test coverage', priority: 'medium', completed: true },
        { category: 'General', text: 'Review and update dependencies', priority: 'low', completed: false }
    ];
}

async function fetchGitHubData(projectName) {
    try {
        // Get repository information
        const { data: repo } = await octokit.repos.get({
            owner: CONFIG.organization,
            repo: projectName
        });

        // Get issues
        const { data: issues } = await octokit.issues.listForRepo({
            owner: CONFIG.organization,
            repo: projectName,
            state: 'open',
            per_page: 100
        });

        // Get pull requests
        const { data: pullRequests } = await octokit.pulls.list({
            owner: CONFIG.organization,
            repo: projectName,
            state: 'open',
            per_page: 50
        });

        // Get recent commits
        const { data: commits } = await octokit.repos.listCommits({
            owner: CONFIG.organization,
            repo: projectName,
            per_page: 5
        });

        const recentCommits = commits.map(commit => ({
            sha: commit.sha.substring(0, 7),
            message: commit.commit.message.split('\n')[0],
            author: commit.commit.author.name,
            date: commit.commit.author.date
        }));

        return {
            repository: {
                name: repo.name,
                description: repo.description,
                lastPush: repo.pushed_at,
                openIssues: issues.length,
                stargazers: repo.stargazers_count,
                language: repo.language
            },
            issues: issues.length,
            pullRequests: pullRequests.length,
            recentCommits,
            lastCommit: commits.length > 0 ? commits[0].commit.author.date : null
        };
    } catch (error) {
        console.error(`Error fetching GitHub data for ${projectName}:`, error.message);
        throw error;
    }
}

async function runExcaliburSync() {
    try {
        const result = await execAsync(`powershell.exe -File "${CONFIG.excaliburScript}" -Action sync`);
        return {
            stdout: result.stdout,
            stderr: result.stderr,
            success: true
        };
    } catch (error) {
        throw new Error(`Excalibur sync failed: ${error.message}`);
    }
}

async function checkForNewCommits(projectName) {
    const cacheKey = `last-commit-${projectName}`;

    try {
        const currentData = await fetchGitHubData(projectName);
        const lastCommit = currentData.lastCommit;

        if (!lastCommit) return false;

        // Check if we have a previous commit stored
        if (dataCache.has(cacheKey)) {
            const previousCommit = dataCache.get(cacheKey);
            if (previousCommit !== lastCommit) {
                dataCache.set(cacheKey, lastCommit);
                return true;
            }
        } else {
            dataCache.set(cacheKey, lastCommit);
        }

        return false;
    } catch (error) {
        console.error(`Failed to check commits for ${projectName}:`, error);
        return false;
    }
}

// WebSocket for real-time updates
const WebSocket = require('ws');
const server = require('http').createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
    console.log('New WebSocket connection');

    ws.on('message', (message) => {
        const data = JSON.parse(message);

        if (data.type === 'subscribe') {
            // Start monitoring for the specified project
            startProjectMonitoring(data.project, ws);
        }
    });

    ws.on('close', () => {
        console.log('WebSocket connection closed');
    });
});

function startProjectMonitoring(projectName, ws) {
    // Check for new commits every minute
    const interval = setInterval(async () => {
        try {
            const hasNewCommits = await checkForNewCommits(projectName);

            if (hasNewCommits) {
                ws.send(JSON.stringify({
                    type: 'commit-update',
                    project: projectName,
                    message: 'New commits detected',
                    timestamp: new Date().toISOString()
                }));

                // Auto-run Excalibur sync
                await runExcaliburSync();

                ws.send(JSON.stringify({
                    type: 'sync-complete',
                    project: projectName,
                    message: 'TODOs updated',
                    timestamp: new Date().toISOString()
                }));
            }
        } catch (error) {
            console.error(`Monitoring error for ${projectName}:`, error);
        }
    }, 60000); // Check every minute

    ws.on('close', () => {
        clearInterval(interval);
    });
}

async function generateProjectReportContent(projectName) {
    const todos = generateMockTodos(projectName);
    const githubData = await fetchGitHubData(projectName);

    // Calculate statistics
    const totalTodos = todos.length;
    const completedTodos = todos.filter(t => t.completed).length;
    const highPriorityTodos = todos.filter(t => t.priority === 'high').length;
    const completionRate = Math.round((completedTodos / totalTodos) * 100);

    const report = `# ${projectName} Project Report

**Generated on:** ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}

## 📊 Project Overview

- **Project Name:** ${projectName}
- **Health Score:** ${calculateHealthScore(githubData)}%
- **Last Updated:** ${new Date().toLocaleDateString()}

## 🎯 Key Metrics

| Metric | Value |
|--------|--------|
| Open Issues | ${githubData.issues} |
| Open Pull Requests | ${githubData.pullRequests} |
| Days Since Last Commit | ${Math.floor((Date.now() - new Date(githubData.lastCommit)) / (1000 * 60 * 60 * 24))} |
| Total TODOs | ${totalTodos} |
| Completed TODOs | ${completedTodos} |
| High Priority TODOs | ${highPriorityTodos} |
| Completion Rate | ${completionRate}% |

## 📝 TODO Summary

### Progress Overview
- **Total Tasks:** ${totalTodos}
- **Completed:** ${completedTodos} (${completionRate}%)
- **Remaining:** ${totalTodos - completedTodos}
- **High Priority Remaining:** ${todos.filter(t => !t.completed && t.priority === 'high').length}

### Tasks by Priority
${['high', 'medium', 'low'].map(priority => {
    const items = todos.filter(t => t.priority === priority);
    const completed = items.filter(t => t.completed).length;
    return `
**${priority.toUpperCase()} Priority** (${completed}/${items.length} complete)
${items.map(item => `- [${item.completed ? 'x' : ' '}] ${item.text}`).join('\n')}`;
}).join('\n')}

## ⚡ Recent Activity

${githubData.recentCommits.map(commit => `- **${commit.author}** (${new Date(commit.date).toLocaleDateString()}): ${commit.message}`).join('\n')}

## 🏥 Health Status

- **Repository:** ${githubData.repository.description || 'No description available'}
- **Last Push:** ${new Date(githubData.repository.lastPush).toLocaleDateString()}
- **Language:** ${githubData.repository.language || 'Not specified'}

## 🔄 Next Steps

### High Priority Actions
${todos.filter(t => !t.completed && t.priority === 'high').slice(0, 5).map((item, index) => `${index + 1}. ${item.text}`).join('\n')}

### Recommendations
- ${completionRate < 50 ? 'Focus on completing existing TODOs before adding new features' : 'Good progress on TODO completion'}
- ${githubData.issues > 10 ? 'High number of open issues - consider triaging and closing resolved ones' : 'Issue management is under control'}
- ${Math.floor((Date.now() - new Date(githubData.lastCommit)) / (1000 * 60 * 60 * 24)) > 7 ? 'No recent commits - project may need attention' : 'Active development detected'}

---
*Report generated by AI Whisperers Project Dashboard*
*For questions or issues, contact the development team*
`;

    return report;
}

async function generateTodoMarkdownContent(projectName) {
    const todos = generateMockTodos(projectName);

    let markdown = `# ${projectName} - TODO List\n\n`;
    markdown += `**Generated on:** ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}\n\n`;

    // Add summary
    const totalTodos = todos.length;
    const completedTodos = todos.filter(t => t.completed).length;
    const completionRate = Math.round((completedTodos / totalTodos) * 100);

    markdown += `## 📊 Summary\n\n`;
    markdown += `- **Total Tasks:** ${totalTodos}\n`;
    markdown += `- **Completed:** ${completedTodos} (${completionRate}%)\n`;
    markdown += `- **Remaining:** ${totalTodos - completedTodos}\n`;
    markdown += `- **High Priority:** ${todos.filter(t => t.priority === 'high').length}\n\n`;

    // Add progress bar
    const progressBar = '█'.repeat(Math.floor(completionRate / 5)) + '░'.repeat(20 - Math.floor(completionRate / 5));
    markdown += `**Progress:** \`${progressBar}\` ${completionRate}%\n\n`;

    // Group todos by category
    const todosByCategory = {};
    todos.forEach(todo => {
        if (!todosByCategory[todo.category]) {
            todosByCategory[todo.category] = [];
        }
        todosByCategory[todo.category].push(todo);
    });

    // Add todos by category
    Object.entries(todosByCategory).forEach(([category, items]) => {
        markdown += `## ${category}\n\n`;

        items.forEach(item => {
            const checkbox = item.completed ? '[x]' : '[ ]';
            const priority = item.priority === 'high' ? '🔥' : item.priority === 'medium' ? '⚠️' : '💡';
            markdown += `- ${checkbox} ${priority} ${item.text}\n`;
        });

        markdown += '\n';
    });

    // Add footer
    markdown += `---\n`;
    markdown += `*Last updated: ${new Date().toLocaleString()}*\n`;
    markdown += `*Generated by AI Whisperers Project Dashboard*\n`;

    return markdown;
}

/**
 * DEPRECATED: Use health score from NestJS API /api/repository-monitor endpoints
 * This legacy calculation is inconsistent with the canonical GitHubHealthScanner
 *
 * @deprecated Migrate to NestJS API for standardized health scores
 */
function calculateHealthScore(githubData) {
    // Simplified calculation for backward compatibility
    // Should be replaced by fetching from RepositoryScan table via NestJS API
    let score = 100;

    score -= Math.min(githubData.issues * 2, 30);
    score -= Math.min(githubData.pullRequests * 3, 15);

    const daysSinceCommit = Math.floor((Date.now() - new Date(githubData.lastCommit)) / (1000 * 60 * 60 * 24));
    score -= Math.min(daysSinceCommit * 5, 20);

    return Math.max(0, Math.min(100, score));
}

// Start server
server.listen(PORT, () => {
    console.log(`Dashboard API server running on port ${PORT}`);
    console.log(`Dashboard available at http://localhost:${PORT}`);
});