import '@testing-library/jest-dom'

// Mock environment variables
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:4000'
process.env.DASHBOARD_PORT = '3001'
process.env.DASHBOARD_URL = 'http://localhost:3001'
process.env.GITHUB_CLIENT_ID = 'test-github-client-id'
process.env.GITHUB_CLIENT_SECRET = 'test-github-client-secret'
process.env.NEXTAUTH_URL = 'http://localhost:3001'
process.env.NEXTAUTH_SECRET = 'test-nextauth-secret'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      refresh: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))

// Mock fetch for tests
global.fetch = jest.fn()

// Suppress console errors in tests
const originalError = console.error
beforeAll(() => {
  console.error = jest.fn()
})

afterAll(() => {
  console.error = originalError
})

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks()
})