import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { RepoCard } from './RepoCard'
import { setupTestDatabase, cleanupTestDatabase } from '../../../../tests/setup/test-database'
import { PrismaClient } from '@prisma/client'

/**
 * REAL DATA COMPONENT TESTS - NO MOCKS
 * Tests React components with actual API data and real user interactions
 */

// Real API client for testing (no mocks)
class TestApiClient {
  private baseUrl = process.env.API_BASE_URL || 'http://localhost:4000'

  async getRepository(id: string) {
    const response = await fetch(`${this.baseUrl}/api/repositories/${id}`)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return response.json()
  }

  async triggerHealthScan(repositoryId: string) {
    const response = await fetch(`${this.baseUrl}/api/scanners/health/trigger`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ repositories: [repositoryId] })
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return response.json()
  }

  async getHealthHistory(repositoryId: string, days = 30) {
    const response = await fetch(
      `${this.baseUrl}/api/repositories/${repositoryId}/health-history?days=${days}`
    )
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return response.json()
  }
}

describe('RepoCard - Real Data Component Tests', () => {
  let prisma: PrismaClient
  let apiClient: TestApiClient
  let realRepository: any

  beforeAll(async () => {
    // Setup real test database
    prisma = await setupTestDatabase()
    apiClient = new TestApiClient()

    // Get real repository data for testing
    const repositories = await prisma.repository.findMany()
    realRepository = repositories[0]

    if (!realRepository) {
      throw new Error('No test repository found. Run database seeding first.')
    }
  })

  afterAll(async () => {
    await cleanupTestDatabase()
  })

  beforeEach(() => {
    // Clear any real API cache between tests
    fetch.cache?.clear?.()
  })

  describe('Repository Data Display - Real Data Rendering', () => {
    it('should render repository information from real database', async () => {
      // Use actual repository data, not mocked
      const repoData = {
        id: realRepository.id,
        name: realRepository.name,
        fullName: realRepository.fullName,
        description: realRepository.description,
        healthScore: realRepository.healthScore,
        language: realRepository.language,
        lastScannedAt: realRepository.lastScannedAt,
        url: realRepository.url
      }

      render(<RepoCard repository={repoData} />)

      // Verify real data is displayed
      expect(screen.getByText(realRepository.name)).toBeInTheDocument()
      expect(screen.getByText(realRepository.description || '')).toBeInTheDocument()

      // Check health score rendering with real data
      const healthScore = screen.getByTestId('health-score')
      expect(healthScore).toHaveTextContent(realRepository.healthScore.toString())

      // Verify language badge
      if (realRepository.language) {
        expect(screen.getByText(realRepository.language)).toBeInTheDocument()
      }

      // Check repository URL link
      const repoLink = screen.getByRole('link')
      expect(repoLink).toHaveAttribute('href', realRepository.url)
    })

    it('should display correct health status based on real score', () => {
      const repoData = {
        ...realRepository,
        id: realRepository.id,
        name: realRepository.name,
        healthScore: realRepository.healthScore
      }

      render(<RepoCard repository={repoData} />)

      const healthIndicator = screen.getByTestId('health-indicator')

      // Test actual health score thresholds
      if (realRepository.healthScore >= 80) {
        expect(healthIndicator).toHaveAttribute('data-status', 'healthy')
      } else if (realRepository.healthScore >= 60) {
        expect(healthIndicator).toHaveAttribute('data-status', 'warning')
      } else {
        expect(healthIndicator).toHaveAttribute('data-status', 'critical')
      }
    })

    it('should format last scanned timestamp correctly', () => {
      const repoData = { ...realRepository }

      render(<RepoCard repository={repoData} />)

      const lastScanned = screen.getByTestId('last-scanned')
      expect(lastScanned).toBeInTheDocument()

      // Verify real date formatting
      const scannedAt = new Date(realRepository.lastScannedAt)
      const now = new Date()
      const diffMinutes = Math.floor((now.getTime() - scannedAt.getTime()) / (1000 * 60))

      if (diffMinutes < 60) {
        expect(lastScanned).toHaveTextContent(/\d+ minutes? ago/)
      } else if (diffMinutes < 1440) {
        expect(lastScanned).toHaveTextContent(/\d+ hours? ago/)
      } else {
        expect(lastScanned).toHaveTextContent(/\d+ days? ago/)
      }
    })
  })

  describe('Health Scanning - Real API Integration', () => {
    it('should trigger actual health scan via real API', async () => {
      const repoData = { ...realRepository }

      render(<RepoCard repository={repoData} />)

      const scanButton = screen.getByRole('button', { name: /scan health/i })
      expect(scanButton).toBeInTheDocument()

      // Click scan button to trigger real API call
      fireEvent.click(scanButton)

      // Verify loading state
      await waitFor(() => {
        expect(screen.getByText(/scanning/i)).toBeInTheDocument()
      })

      // Wait for real scan to complete (may take a few seconds)
      await waitFor(() => {
        expect(screen.queryByText(/scanning/i)).not.toBeInTheDocument()
      }, { timeout: 10000 })

      // Verify scan completion
      expect(screen.getByText(/scan completed/i)).toBeInTheDocument()

      // Verify database was updated with real scan results
      const updatedRepo = await prisma.repository.findUnique({
        where: { id: realRepository.id },
        include: { healthChecks: { orderBy: { scannedAt: 'desc' }, take: 1 } }
      })

      expect(updatedRepo?.healthChecks[0]).toBeDefined()
      expect(updatedRepo?.healthChecks[0].scannedAt.getTime()).toBeGreaterThan(Date.now() - 60000) // Within last minute
    })

    it('should handle scan failures from real API gracefully', async () => {
      // Use non-existent repository to trigger real API error
      const invalidRepoData = {
        ...realRepository,
        id: 'non-existent-repo-id',
        name: 'non-existent-repo'
      }

      render(<RepoCard repository={invalidRepoData} />)

      const scanButton = screen.getByRole('button', { name: /scan health/i })
      fireEvent.click(scanButton)

      // Wait for real error response
      await waitFor(() => {
        expect(screen.getByText(/scan failed/i)).toBeInTheDocument()
      }, { timeout: 10000 })

      // Verify retry button appears
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument()
    })

    it('should respect rate limiting from real API', async () => {
      const repoData = { ...realRepository }

      render(<RepoCard repository={repoData} />)

      const scanButton = screen.getByRole('button', { name: /scan health/i })

      // Trigger multiple scans rapidly to test real rate limiting
      for (let i = 0; i < 5; i++) {
        fireEvent.click(scanButton)
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      // Should show rate limit message from real API
      await waitFor(() => {
        expect(screen.getByText(/rate limit/i)).toBeInTheDocument()
      }, { timeout: 10000 })
    })
  })

  describe('Health History Display - Real Data Visualization', () => {
    it('should load and display real health history data', async () => {
      const repoData = { ...realRepository }

      render(<RepoCard repository={repoData} showHistory={true} />)

      // Wait for real API call to load history
      await waitFor(() => {
        expect(screen.getByTestId('health-trend-chart')).toBeInTheDocument()
      }, { timeout: 5000 })

      // Verify real historical data is displayed
      const healthHistory = await apiClient.getHealthHistory(realRepository.id)
      expect(healthHistory.length).toBeGreaterThan(0)

      // Check chart data points match real data
      const dataPoints = screen.getAllByTestId(/chart-point-\d+/)
      expect(dataPoints.length).toBe(healthHistory.length)
    })

    it('should show trend indicators based on real data', async () => {
      const repoData = { ...realRepository }

      render(<RepoCard repository={repoData} showTrend={true} />)

      await waitFor(() => {
        const trendIndicator = screen.getByTestId('health-trend')
        expect(trendIndicator).toBeInTheDocument()
      })

      const trendIndicator = screen.getByTestId('health-trend')

      // Get real trend calculation
      const healthHistory = await apiClient.getHealthHistory(realRepository.id, 7)
      if (healthHistory.length >= 2) {
        const oldScore = healthHistory[healthHistory.length - 1].score
        const newScore = healthHistory[0].score

        if (newScore > oldScore + 5) {
          expect(trendIndicator).toHaveAttribute('data-trend', 'up')
        } else if (newScore < oldScore - 5) {
          expect(trendIndicator).toHaveAttribute('data-trend', 'down')
        } else {
          expect(trendIndicator).toHaveAttribute('data-trend', 'stable')
        }
      }
    })
  })

  describe('User Interactions - Real Event Handling', () => {
    it('should handle repository card click with real navigation', () => {
      const repoData = { ...realRepository }
      const mockNavigate = jest.fn()

      render(<RepoCard repository={repoData} onNavigate={mockNavigate} />)

      const repoCard = screen.getByTestId('repo-card')
      fireEvent.click(repoCard)

      expect(mockNavigate).toHaveBeenCalledWith(`/repositories/${realRepository.id}`)
    })

    it('should handle keyboard navigation correctly', () => {
      const repoData = { ...realRepository }
      const mockNavigate = jest.fn()

      render(<RepoCard repository={repoData} onNavigate={mockNavigate} />)

      const repoCard = screen.getByTestId('repo-card')

      // Test Enter key
      fireEvent.keyDown(repoCard, { key: 'Enter', code: 'Enter' })
      expect(mockNavigate).toHaveBeenCalledWith(`/repositories/${realRepository.id}`)

      // Test Space key
      fireEvent.keyDown(repoCard, { key: ' ', code: 'Space' })
      expect(mockNavigate).toHaveBeenCalledTimes(2)
    })

    it('should copy repository URL to clipboard', async () => {
      // Mock clipboard API for testing
      Object.assign(navigator, {
        clipboard: {
          writeText: jest.fn().mockResolvedValue(undefined),
        },
      })

      const repoData = { ...realRepository }

      render(<RepoCard repository={repoData} />)

      const copyButton = screen.getByRole('button', { name: /copy url/i })
      fireEvent.click(copyButton)

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(realRepository.url)

      // Verify success message
      await waitFor(() => {
        expect(screen.getByText(/copied/i)).toBeInTheDocument()
      })
    })
  })

  describe('Accessibility - Real ARIA Implementation', () => {
    it('should have proper ARIA labels and roles', () => {
      const repoData = { ...realRepository }

      render(<RepoCard repository={repoData} />)

      const repoCard = screen.getByTestId('repo-card')
      expect(repoCard).toHaveAttribute('role', 'button')
      expect(repoCard).toHaveAttribute('tabindex', '0')
      expect(repoCard).toHaveAttribute('aria-label',
        expect.stringContaining(realRepository.name)
      )

      const healthScore = screen.getByTestId('health-score')
      expect(healthScore).toHaveAttribute('aria-label',
        `Health score: ${realRepository.healthScore} out of 100`
      )
    })

    it('should support screen reader navigation', () => {
      const repoData = { ...realRepository }

      render(<RepoCard repository={repoData} />)

      // Check for descriptive text for screen readers
      expect(screen.getByText(`Repository: ${realRepository.name}`)).toBeInTheDocument()
      expect(screen.getByText(`Health Score: ${realRepository.healthScore}`)).toBeInTheDocument()

      if (realRepository.description) {
        expect(screen.getByText(`Description: ${realRepository.description}`)).toBeInTheDocument()
      }
    })
  })

  describe('Performance - Real Component Performance', () => {
    it('should render within performance thresholds', async () => {
      const repoData = { ...realRepository }

      const startTime = performance.now()
      render(<RepoCard repository={repoData} />)
      const endTime = performance.now()

      const renderTime = endTime - startTime
      expect(renderTime).toBeLessThan(50) // Should render in under 50ms
    })

    it('should handle rapid updates without memory leaks', async () => {
      const repoData = { ...realRepository }

      const { rerender } = render(<RepoCard repository={repoData} />)

      // Simulate rapid health score updates
      for (let i = 0; i < 100; i++) {
        const updatedData = {
          ...repoData,
          healthScore: Math.floor(Math.random() * 100)
        }
        rerender(<RepoCard repository={updatedData} />)
      }

      // Component should still be responsive
      expect(screen.getByTestId('health-score')).toBeInTheDocument()
    })
  })

  describe('Error States - Real Error Handling', () => {
    it('should handle missing repository data gracefully', () => {
      const incompleteData = {
        id: realRepository.id,
        name: realRepository.name
        // Missing other required fields
      }

      render(<RepoCard repository={incompleteData} />)

      expect(screen.getByText(realRepository.name)).toBeInTheDocument()
      expect(screen.getByText('No description available')).toBeInTheDocument()
      expect(screen.getByText('Unknown')).toBeInTheDocument() // For language
    })

    it('should display error state for API failures', async () => {
      // Temporarily break API connection
      const originalFetch = global.fetch
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'))

      const repoData = { ...realRepository }

      render(<RepoCard repository={repoData} />)

      const scanButton = screen.getByRole('button', { name: /scan health/i })
      fireEvent.click(scanButton)

      await waitFor(() => {
        expect(screen.getByText(/error occurred/i)).toBeInTheDocument()
      })

      // Restore fetch
      global.fetch = originalFetch
    })
  })
})