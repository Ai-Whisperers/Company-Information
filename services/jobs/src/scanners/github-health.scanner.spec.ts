import { Test, TestingModule } from '@nestjs/testing'
import { GitHubHealthScanner } from './github-health.scanner'
import { GitHubService } from '../integrations/github.service'
import { PrismaService } from '../db/prisma.service'
import { SchedulerRegistry } from '@nestjs/schedule'
import { createMockRepository, createMockHealthCheck } from '../../../../tests/utils/test-factories'

describe('GitHubHealthScanner', () => {
  let scanner: GitHubHealthScanner
  let githubService: jest.Mocked<GitHubService>
  let prismaService: jest.Mocked<PrismaService>
  let schedulerRegistry: jest.Mocked<SchedulerRegistry>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GitHubHealthScanner,
        {
          provide: GitHubService,
          useValue: {
            getRepositories: jest.fn(),
            getRepositoryHealth: jest.fn(),
            checkRateLimit: jest.fn(),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            repository: {
              upsert: jest.fn(),
              findMany: jest.fn(),
              update: jest.fn(),
            },
            healthCheck: {
              create: jest.fn(),
              findMany: jest.fn(),
              findFirst: jest.fn(),
            },
          },
        },
        {
          provide: SchedulerRegistry,
          useValue: {
            addCronJob: jest.fn(),
            getCronJob: jest.fn(),
            deleteCronJob: jest.fn(),
          },
        },
      ],
    }).compile()

    scanner = module.get<GitHubHealthScanner>(GitHubHealthScanner)
    githubService = module.get(GitHubService)
    prismaService = module.get(PrismaService)
    schedulerRegistry = module.get(SchedulerRegistry)
  })

  describe('scanRepository', () => {
    it('should scan a repository and save health check results', async () => {
      const mockRepo = createMockRepository()
      const mockHealth = {
        score: 85,
        metrics: {
          commits: 50,
          pullRequests: 10,
          issues: 5,
          contributors: 8,
          documentation: 80,
          tests: 75,
          security: 90,
          branchProtection: true,
        },
        recommendations: ['Add more tests', 'Update documentation'],
      }

      githubService.getRepositoryHealth.mockResolvedValue(mockHealth)
      prismaService.repository.upsert.mockResolvedValue(mockRepo as any)
      prismaService.healthCheck.create.mockResolvedValue(createMockHealthCheck() as any)

      const result = await scanner.scanRepository(mockRepo.name)

      expect(githubService.getRepositoryHealth).toHaveBeenCalledWith(mockRepo.name)
      expect(prismaService.repository.upsert).toHaveBeenCalledWith({
        where: { name: mockRepo.name },
        create: expect.objectContaining({
          name: mockRepo.name,
          healthScore: mockHealth.score,
        }),
        update: expect.objectContaining({
          healthScore: mockHealth.score,
          lastScannedAt: expect.any(Date),
        }),
      })
      expect(prismaService.healthCheck.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          repositoryId: mockRepo.id,
          score: mockHealth.score,
          metrics: mockHealth.metrics,
          recommendations: mockHealth.recommendations,
        }),
      })
      expect(result).toEqual(mockHealth)
    })

    it('should handle scan failures gracefully', async () => {
      githubService.getRepositoryHealth.mockRejectedValue(new Error('API Error'))

      await expect(scanner.scanRepository('failing-repo')).rejects.toThrow('API Error')
      expect(prismaService.healthCheck.create).not.toHaveBeenCalled()
    })
  })

  describe('calculateHealthScore', () => {
    it('should calculate health score based on multiple metrics', () => {
      const metrics = {
        commits: 100,
        pullRequests: 20,
        issues: 10,
        contributors: 10,
        documentation: 80,
        tests: 90,
        security: 95,
        branchProtection: true,
      }

      const score = scanner.calculateHealthScore(metrics)

      expect(score).toBeGreaterThanOrEqual(0)
      expect(score).toBeLessThanOrEqual(100)
    })

    it('should handle missing metrics gracefully', () => {
      const metrics = {
        commits: 50,
        pullRequests: 0,
        issues: 0,
        contributors: 1,
      }

      const score = scanner.calculateHealthScore(metrics)

      expect(score).toBeGreaterThanOrEqual(0)
      expect(score).toBeLessThanOrEqual(100)
    })

    it('should give appropriate weight to critical metrics', () => {
      const goodMetrics = {
        commits: 100,
        pullRequests: 30,
        issues: 5,
        contributors: 15,
        documentation: 100,
        tests: 100,
        security: 100,
        branchProtection: true,
      }

      const poorMetrics = {
        commits: 0,
        pullRequests: 0,
        issues: 100,
        contributors: 1,
        documentation: 0,
        tests: 0,
        security: 0,
        branchProtection: false,
      }

      const goodScore = scanner.calculateHealthScore(goodMetrics)
      const poorScore = scanner.calculateHealthScore(poorMetrics)

      expect(goodScore).toBeGreaterThan(80)
      expect(poorScore).toBeLessThan(30)
    })
  })

  describe('scheduledScan', () => {
    it('should scan all active repositories on schedule', async () => {
      const mockRepos = [
        createMockRepository({ name: 'repo1' }),
        createMockRepository({ name: 'repo2' }),
        createMockRepository({ name: 'repo3' }),
      ]

      githubService.getRepositories.mockResolvedValue(mockRepos as any)
      githubService.checkRateLimit.mockResolvedValue({
        remaining: 4000,
        shouldDelay: false,
      })
      githubService.getRepositoryHealth.mockResolvedValue({
        score: 85,
        metrics: {} as any,
        recommendations: [],
      })

      await scanner.scheduledScan()

      expect(githubService.getRepositories).toHaveBeenCalled()
      expect(githubService.getRepositoryHealth).toHaveBeenCalledTimes(3)
      expect(prismaService.healthCheck.create).toHaveBeenCalledTimes(3)
    })

    it('should respect rate limits during batch scanning', async () => {
      const mockRepos = Array(10).fill(null).map(() => createMockRepository())

      githubService.getRepositories.mockResolvedValue(mockRepos as any)
      githubService.checkRateLimit
        .mockResolvedValueOnce({ remaining: 100, shouldDelay: false })
        .mockResolvedValueOnce({ remaining: 50, shouldDelay: true })

      jest.spyOn(scanner, 'delay').mockResolvedValue()

      await scanner.scheduledScan()

      expect(scanner.delay).toHaveBeenCalled()
    })

    it('should continue scanning even if individual repos fail', async () => {
      const mockRepos = [
        createMockRepository({ name: 'repo1' }),
        createMockRepository({ name: 'repo2-failing' }),
        createMockRepository({ name: 'repo3' }),
      ]

      githubService.getRepositories.mockResolvedValue(mockRepos as any)
      githubService.checkRateLimit.mockResolvedValue({
        remaining: 4000,
        shouldDelay: false,
      })
      githubService.getRepositoryHealth
        .mockResolvedValueOnce({ score: 85, metrics: {} as any, recommendations: [] })
        .mockRejectedValueOnce(new Error('Scan failed'))
        .mockResolvedValueOnce({ score: 90, metrics: {} as any, recommendations: [] })

      await scanner.scheduledScan()

      expect(githubService.getRepositoryHealth).toHaveBeenCalledTimes(3)
      expect(prismaService.healthCheck.create).toHaveBeenCalledTimes(2) // Only successful scans
    })
  })

  describe('generateRecommendations', () => {
    it('should generate relevant recommendations based on metrics', () => {
      const lowDocMetrics = {
        documentation: 20,
        tests: 90,
        security: 95,
      }

      const recommendations = scanner.generateRecommendations(lowDocMetrics)

      expect(recommendations).toContain('Improve documentation coverage')
      expect(recommendations).not.toContain('Add more tests')
    })

    it('should prioritize critical issues', () => {
      const criticalMetrics = {
        security: 30,
        tests: 40,
        documentation: 60,
        branchProtection: false,
      }

      const recommendations = scanner.generateRecommendations(criticalMetrics)

      expect(recommendations[0]).toContain('security')
      expect(recommendations).toContain('Enable branch protection')
    })

    it('should limit number of recommendations', () => {
      const poorMetrics = {
        documentation: 10,
        tests: 10,
        security: 10,
        commits: 0,
        contributors: 1,
        branchProtection: false,
      }

      const recommendations = scanner.generateRecommendations(poorMetrics)

      expect(recommendations.length).toBeLessThanOrEqual(5)
    })
  })

  describe('getTrend', () => {
    it('should identify upward trends', async () => {
      const currentScore = 85
      const historicalScores = [70, 75, 80]

      prismaService.healthCheck.findMany.mockResolvedValue(
        historicalScores.map(score => ({ score, scannedAt: new Date() })) as any
      )

      const trend = await scanner.getTrend('repo-id', currentScore)

      expect(trend).toBe('up')
    })

    it('should identify downward trends', async () => {
      const currentScore = 70
      const historicalScores = [85, 80, 75]

      prismaService.healthCheck.findMany.mockResolvedValue(
        historicalScores.map(score => ({ score, scannedAt: new Date() })) as any
      )

      const trend = await scanner.getTrend('repo-id', currentScore)

      expect(trend).toBe('down')
    })

    it('should identify stable trends', async () => {
      const currentScore = 80
      const historicalScores = [79, 80, 81]

      prismaService.healthCheck.findMany.mockResolvedValue(
        historicalScores.map(score => ({ score, scannedAt: new Date() })) as any
      )

      const trend = await scanner.getTrend('repo-id', currentScore)

      expect(trend).toBe('stable')
    })
  })
})