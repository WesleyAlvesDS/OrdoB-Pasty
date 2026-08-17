import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

// ─── Helpers ──────────────────────────────────────────────────

function mockFetch(response: {
  ok: boolean
  json?: unknown
  text?: string
  status?: number
}) {
  return vi.mocked(global.fetch).mockResolvedValueOnce({
    ok: response.ok,
    status: response.status ?? 200,
    json: async () => response.json,
    text: async () => response.text ?? '',
  } as Response)
}

// ─── Tests ────────────────────────────────────────────────────

describe('auth', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.spyOn(global, 'fetch').mockImplementation(async () => {
      return { ok: true, json: async () => ({}) } as Response
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('getGoogleAuthUrl', () => {
    it('returns a valid Google OAuth URL with correct params', async () => {
      // Set env vars for the config module
      process.env.GOOGLE_CLIENT_ID = 'test-client-id'
      process.env.GOOGLE_CLIENT_SECRET = 'test-client-secret'
      process.env.GOOGLE_REDIRECT_URI = 'http://localhost:5173/auth/callback'

      // Fresh import with env vars set
      const auth = await import('../auth.js')
      const url = auth.getGoogleAuthUrl()

      expect(url).toContain('https://accounts.google.com/o/oauth2/v2/auth')
      expect(url).toContain('client_id=test-client-id')
      expect(url).toContain('redirect_uri=http%3A%2F%2Flocalhost%3A5173%2Fauth%2Fcallback')
      expect(url).toContain('response_type=code')
      expect(url).toContain('access_type=offline')
      expect(url).toContain('prompt=select_account')
      expect(url).toContain('scope=')
    })
  })

  describe('exchangeCodeForToken', () => {
    it('exchanges authorization code for tokens successfully', async () => {
      const mockTokens = {
        access_token: 'access-123',
        refresh_token: 'refresh-456',
        expires_in: 3600,
      }
      mockFetch({ ok: true, json: mockTokens })

      process.env.GOOGLE_CLIENT_ID = 'test-id'
      process.env.GOOGLE_CLIENT_SECRET = 'test-secret'
      process.env.GOOGLE_REDIRECT_URI = 'http://localhost:5173/auth/callback'

      const auth = await import('../auth.js')
      const result = await auth.exchangeCodeForToken('auth-code-123')

      expect(result.access_token).toBe('access-123')
      expect(result.refresh_token).toBe('refresh-456')
      expect(result.expires_in).toBe(3600)
    })

    it('throws when token exchange fails', async () => {
      mockFetch({ ok: false, text: 'invalid_grant', status: 400 })

      process.env.GOOGLE_CLIENT_ID = 'test-id'
      process.env.GOOGLE_CLIENT_SECRET = 'test-secret'

      const auth = await import('../auth.js')
      await expect(auth.exchangeCodeForToken('bad-code')).rejects.toThrow(
        'Token exchange failed',
      )
    })
  })

  describe('getUserInfo', () => {
    it('fetches user profile from Google', async () => {
      const mockUser = {
        id: 'google-123',
        email: 'user@example.com',
        name: 'Test User',
        picture: 'https://example.com/avatar.jpg',
      }
      mockFetch({ ok: true, json: mockUser })

      const auth = await import('../auth.js')
      const user = await auth.getUserInfo('valid-token')

      expect(user.id).toBe('google-123')
      expect(user.email).toBe('user@example.com')
      expect(user.name).toBe('Test User')
      expect(user.picture).toBe('https://example.com/avatar.jpg')
    })

    it('throws when fetching user info fails', async () => {
      mockFetch({ ok: false, text: 'unauthorized', status: 401 })

      const auth = await import('../auth.js')
      await expect(auth.getUserInfo('bad-token')).rejects.toThrow(
        'User info failed',
      )
    })
  })

  describe('refreshAccessToken', () => {
    it('refreshes an expired token successfully', async () => {
      const mockTokens = {
        access_token: 'new-access-789',
        expires_in: 3600,
      }
      mockFetch({ ok: true, json: mockTokens })

      process.env.GOOGLE_CLIENT_ID = 'test-id'
      process.env.GOOGLE_CLIENT_SECRET = 'test-secret'

      const auth = await import('../auth.js')
      const result = await auth.refreshAccessToken('old-refresh-token')

      expect(result.access_token).toBe('new-access-789')
      expect(result.expires_in).toBe(3600)
    })

    it('throws when token refresh fails', async () => {
      mockFetch({ ok: false, text: 'invalid_token', status: 400 })

      const auth = await import('../auth.js')
      await expect(auth.refreshAccessToken('bad-token')).rejects.toThrow(
        'Token refresh failed',
      )
    })
  })
})
