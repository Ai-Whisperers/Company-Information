import { Test, TestingModule } from '@nestjs/testing'
import { GitHubService } from './github.service'
import { Octokit } from '@octokit/rest'
import { createMockRepository, createMockGitHubPullRequest, createMockGitHubIssue } from '../../../../tests/utils/test-factories'

jest.mock('@octokit/rest')

describe('GitHubService', () => {
  let service: GitHubService
  let mockOctokit: jest.Mocked<Octokit>

  beforeEach(async () => {
    mockOctokit = {
      repos: {
        listForOrg: jest.fn(),
        get: jest.fn(),
        listBranches: jest.fn(),
        getBranchProtection: jest.fn(),
      },
      pulls: {
        list: jest.fn(),
        get: jest.fn(),
        createReviewComment: jest.fn(),
      },
      issues: {
        listForRepo: jest.fn(),
        get: jest.fn(),
        createComment: jest.fn(),
      },
      search: {
        issuesAndPullRequests: jest.fn(),
      },
      rateLimit: {
        get: jest.fn().mockResolvedValue({
          data: {
            resources: {
              core: { limit: 5000, remaining: 4500, reset: Date.now() / 1000 + 3600 },
            },
          },
        }),
      },
    } as any

    ;(Octokit as jest.MockedClass<typeof Octokit>).mockImplementation(() => mockOctokit)

    const module: TestingModule = await Test.createTestingModule({
      providers: [GitHubService],
    }).compile()

    service = module.get<GitHubService>(GitHubService)
  })

  describe('getRepositories', () => {
    it('should fetch all repositories for the organization', async () => {
      const mockRepos = [createMockRepository(), createMockRepository()]
      mockOctokit.repos.listForOrg.mockResolvedValue({
        data: mockRepos,
        status: 200,
        headers: {},
        url: '',
      } as any)

      const result = await service.getRepositories()

      expect(mockOctokit.repos.listForOrg).toHaveBeenCalledWith({
        org: process.env.GITHUB_ORG,
        type: 'all',
        per_page: 100,
      })
      expect(result).toEqual(mockRepos)
    })

    it('should handle pagination when fetching repositories', async () => {
      const mockReposPage1 = Array(100).fill(null).map(() => createMockRepository())
      const mockReposPage2 = Array(50).fill(null).map(() => createMockRepository())

      mockOctokit.repos.listForOrg
        .mockResolvedValueOnce({
          data: mockReposPage1,
          headers: { link: '<url>; rel="next"' },
        } as any)
        .mockResolvedValueOnce({
          data: mockReposPage2,
          headers: {},
        } as any)

      const result = await service.getRepositories()

      expect(mockOctokit.repos.listForOrg).toHaveBeenCalledTimes(2)
      expect(result).toHaveLength(150)
    })

    it('should handle API errors gracefully', async () => {
      mockOctokit.repos.listForOrg.mockRejectedValue(new Error('API Error'))

      await expect(service.getRepositories()).rejects.toThrow('API Error')
    })

    it('should respect rate limits', async () => {
      mockOctokit.rateLimit.get.mockResolvedValue({
        data: {
          resources: {
            core: { limit: 5000, remaining: 10, reset: Date.now() / 1000 + 60 },
          },
        },
      } as any)

      const result = await service.checkRateLimit()

      expect(result.shouldDelay).toBe(true)
      expect(result.remaining).toBe(10)
    })
  })

  describe('getRepositoryHealth', () => {
    it('should calculate repository health score correctly', async () => {
      const mockRepo = createMockRepository()
      const mockPRs = [createMockGitHubPullRequest(), createMockGitHubPullRequest()]
      const mockIssues = [createMockGitHubIssue(), createMockGitHubIssue()]

      mockOctokit.repos.get.mockResolvedValue({ data: mockRepo } as any)
      mockOctokit.pulls.list.mockResolvedValue({ data: mockPRs } as any)
      mockOctokit.issues.listForRepo.mockResolvedValue({ data: mockIssues } as any)
      mockOctokit.repos.getBranchProtection.mockResolvedValue({
        data: { required_status_checks: { contexts: ['ci/test'] } },
      } as any)

      const result = await service.getRepositoryHealth('test-repo')

      expect(result.score).toBeGreaterThanOrEqual(0)
      expect(result.score).toBeLessThanOrEqual(100)
      expect(result.metrics).toHaveProperty('pullRequests')
      expect(result.metrics).toHaveProperty('issues')
      expect(result.metrics).toHaveProperty('branchProtection')
    })

    it('should handle missing branch protection gracefully', async () => {
      mockOctokit.repos.get.mockResolvedValue({ data: createMockRepository() } as any)
      mockOctokit.repos.getBranchProtection.mockRejectedValue({ status: 404 })

      const result = await service.getRepositoryHealth('test-repo')

      expect(result.metrics.branchProtection).toBe(false)
    })
  })

  describe('createWorkItemLink', () => {
    it('should create a comment with work item link on pull request', async () => {
      const prNumber = 123
      const workItemId = 'AB#456'
      const expectedComment = `🔗 Linked to Azure DevOps Work Item: [${workItemId}](${process.env.AZURE_DEVOPS_ORG}/_workitems/edit/456)`

      mockOctokit.issues.createComment.mockResolvedValue({
        data: { id: 1, body: expectedComment },
      } as any)

      await service.createWorkItemLink('test-repo', prNumber, workItemId)

      expect(mockOctokit.issues.createComment).toHaveBeenCalledWith({
        owner: process.env.GITHUB_ORG,
        repo: 'test-repo',
        issue_number: prNumber,
        body: expect.stringContaining(workItemId),
      })
    })

    it('should handle link creation errors', async () => {
      mockOctokit.issues.createComment.mockRejectedValue(new Error('Permission denied'))

      await expect(
        service.createWorkItemLink('test-repo', 123, 'AB#456')
      ).rejects.toThrow('Permission denied')
    })
  })

  describe('searchIssuesAndPRs', () => {
    it('should search for issues and PRs with work item references', async () => {
      const mockSearchResults = {
        items: [
          createMockGitHubIssue({ body: 'Fixes AB#123' }),
          createMockGitHubPullRequest({ body: 'Related to WI456' }),
        ],
      }

      mockOctokit.search.issuesAndPullRequests.mockResolvedValue({
        data: mockSearchResults,
      } as any)

      const result = await service.searchIssuesAndPRs('AB#123 OR WI456')

      expect(mockOctokit.search.issuesAndPullRequests).toHaveBeenCalledWith({
        q: `org:${process.env.GITHUB_ORG} AB#123 OR WI456`,
        per_page: 100,
      })
      expect(result).toHaveLength(2)
    })
  })

  describe('validateRepository', () => {
    it('should validate repository exists and is accessible', async () => {
      mockOctokit.repos.get.mockResolvedValue({
        data: createMockRepository({ name: 'valid-repo' }),
      } as any)

      const result = await service.validateRepository('valid-repo')

      expect(result.exists).toBe(true)
      expect(result.accessible).toBe(true)
    })

    it('should handle non-existent repositories', async () => {
      mockOctokit.repos.get.mockRejectedValue({ status: 404 })

      const result = await service.validateRepository('non-existent')

      expect(result.exists).toBe(false)
      expect(result.accessible).toBe(false)
    })
  })
})