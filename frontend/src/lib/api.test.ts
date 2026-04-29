import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock fetch for apiClient tests
const mockFetch = vi.fn()
global.fetch = mockFetch

// We test the apiClient methods by importing after mocking fetch
// This ensures our API contract is testable
describe('apiClient contract', () => {
  beforeEach(() => {
    mockFetch.mockClear()
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(() => 'test-token'),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    })
  })

  it('should have all required auth methods', async () => {
    const { apiClient } = await import('./api')
    expect(typeof apiClient.login).toBe('function')
    expect(typeof apiClient.register).toBe('function')
    expect(typeof apiClient.getCurrentUser).toBe('function')
    expect(typeof apiClient.forgotPassword).toBe('function')
    expect(typeof apiClient.resetPassword).toBe('function')
  })

  it('should have all required chat methods', async () => {
    const { apiClient } = await import('./api')
    expect(typeof apiClient.startChat).toBe('function')
    expect(typeof apiClient.askChat).toBe('function')
    expect(typeof apiClient.getChatHistory).toBe('function')
    expect(typeof apiClient.clearChat).toBe('function')
  })

  it('should include auth header when token exists', async () => {
    const { apiClient } = await import('./api')
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: '1', email: 'test@test.com' }),
    } as Response)

    await apiClient.getCurrentUser()

    const call = mockFetch.mock.calls[0]
    expect(call[1].headers.Authorization).toBe('Bearer test-token')
  })
})
