# Progress Tracking Guide

## Quick Links
- [GitHub Organization](https://github.com/Ai-Whisperers)
- [Project Boards](https://github.com/orgs/Ai-Whisperers/projects)
- [Organization Discussions](https://github.com/orgs/Ai-Whisperers/discussions)

## Daily Progress Updates

### How to Track Your Work

#### 1. Start of Day
- Review assigned issues in GitHub
- Check project board for priorities
- Update task status to "In Progress"

#### 2. During Work
- Make frequent commits with descriptive messages
- Update issue comments with progress notes
- Move cards on project board as status changes
- Create draft PRs for work in progress

#### 3. End of Day
- Push all commits to feature branch
- Update issue with completion percentage
- Add blockers or questions as comments
- Move cards to appropriate column

## Weekly Progress Reports

### Template for Weekly Updates
```markdown
## Week of [Date]

### Completed
- [ ] Task 1 - Link to PR/Issue
- [ ] Task 2 - Link to PR/Issue

### In Progress
- [ ] Task 3 (75% complete) - Link to Issue
- [ ] Task 4 (25% complete) - Link to Issue

### Blocked
- Issue with [description] - Need help from [team/person]

### Next Week's Goals
- [ ] Complete Task 3
- [ ] Start Task 5
- [ ] Review PRs for Task 6

### Notes
Any additional context or achievements
```

## Using GitHub Projects Effectively

### Card Movement Flow
1. **Backlog** → Items not yet started
2. **Ready** → Items ready to work on
3. **In Progress** → Currently being worked on
4. **In Review** → PR submitted, awaiting review
5. **Done** → Completed and merged

### Adding Context to Cards
- Add estimates (hours/story points)
- Link related issues and PRs
- Add labels for categorization
- Assign to team members
- Set due dates for time-sensitive items

## Issue Management

### Creating Effective Issues
```markdown
### Summary
One-line description

### Current Behavior
What's happening now

### Expected Behavior
What should happen

### Steps to Reproduce (for bugs)
1. Step one
2. Step two

### Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2

### Technical Notes
Implementation suggestions or constraints
```

### Linking Work
- Reference issues in commits: `Fixes #123`
- Link PRs to issues: `Closes #456`
- Cross-reference related work: `Related to #789`

## Git Workflow for Progress Tracking

### Branch Naming
```
feature/issue-123-add-user-auth
bugfix/issue-456-fix-login-error
hotfix/issue-789-critical-security-patch
```

### Commit Message Format
```
type(scope): subject

body (optional)

footer (optional)
```

Example:
```
feat(auth): implement JWT authentication

- Added JWT token generation
- Created middleware for token validation
- Updated user model with token fields

Closes #123
```

## Automation with GitHub Actions

### Auto-Update Project Boards
Create `.github/workflows/project-automation.yml`:
```yaml
name: Project Automation

on:
  issues:
    types: [opened, closed]
  pull_request:
    types: [opened, closed, ready_for_review]

jobs:
  update-project:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/add-to-project@v0.5.0
        with:
          project-url: https://github.com/orgs/Ai-Whisperers/projects/1
          github-token: ${{ secrets.GITHUB_TOKEN }}
```

## Metrics to Track

### Individual Metrics
- Issues closed per week
- PRs merged per week
- Average PR review time
- Code review participation

### Team Metrics
- Sprint velocity
- Bug resolution time
- Feature delivery rate
- Test coverage trends

## Tools and Integrations

### Recommended Tools
1. **GitHub CLI** - For command-line operations
   ```bash
   gh issue create
   gh pr create
   gh project list
   ```

2. **GitHub Mobile** - Track on the go

3. **GitHub Desktop** - Visual Git management

4. **VS Code GitHub Extension** - IDE integration

### Useful Commands
```bash
# View your assigned issues
gh issue list --assignee @me

# Check PR status
gh pr status

# View project board
gh project view [project-number]

# Create issue from command line
gh issue create --title "Bug: Login fails" --body "Description here"
```

## Best Practices

### Do's
- Update progress daily
- Communicate blockers immediately
- Keep issues and PRs linked
- Write clear commit messages
- Review others' code promptly

### Don'ts
- Don't leave issues unassigned
- Don't skip code reviews
- Don't merge without tests
- Don't work directly on main branch
- Don't leave PRs in draft unnecessarily

## Getting Help

- **Technical Issues**: Create an issue with `help wanted` label
- **Process Questions**: Use GitHub Discussions
- **Urgent Matters**: Tag `@Ai-Whisperers/core-team`
- **Documentation**: Check `/documentation` repository