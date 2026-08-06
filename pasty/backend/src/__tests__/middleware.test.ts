import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

// ─── Mock db module ───────────────────────────────────────────

vi.mock('../db.js', () => {
  const mockUser = {
    id: 1,
    google_id: 'google-123',
    email: 'user@example.com',
    name: 'Test User',
    avatar_url: 'https://example.com/avatar.jpg',
    access_token: 'access-token-123',
    refresh_token: 'refresh-token-123',
    token_expires_at: new Date(Date.now() + 86400000).toISOString(),
    created_at: new Date().toISOString(),
  }

  return {
    findUserById: vi.fn(async (id: number) => {
      if (id === 1) return mockUser
      return undefined
    }),
    findUserByGoogleId: vi.fn(),
    createUser: vi.fn(),
    updateUserTokens: vi.fn(),
    findSession: vi.fn(async (token: string) => {
      if (token) {
        return {
          token,
          user_id: 1,
          expires_at: new Date(Date.now() + 86400000).toISOString(),
          created_at: new Date().toISOString(),
          active: true,
        }
      }
      return undefined
    }),
    findClipByHash: vi.fn(),
    createClip: vi.fn(),
    getClipsByUserId: vi.fn(),
    DbUser: {},
    DbClip: {},
    PaginatedClips: {},
  }
})

// ─── Tests ────────────────────────────────────────────────────

describe('middleware', () => {
  const TEST_SECRET = 'test-jwt-secret'

  beforeEach(() => {
    process.env.JWT_SECRET = TEST_SECRET
  })

  afterEach(() => {
    vi.restoreAllMocks()
    delete process.env.JWT_SECRET
  })

  describe('createJwtToken', () => {
    it('creates a valid JWT token with correct claims', async () => {
      const { createJwtToken } = await import('../middleware.js')

      const token = await createJwtToken(1, 'user@example.com')

      expect(token).toBeTruthy()
      expect(typeof token).toBe('string')
      // JWT is three base64url parts separated by dots
      expect(token.split('.')).toHaveLength(3)
    })

    it('creates tokens with different payloads for different users', async () => {
      const { createJwtToken } = await import('../middleware.js')

      const [token1, token2] = await Promise.all([
        createJwtToken(1, 'alice@example.com'),
        createJwtToken(2, 'bob@example.com'),
      ])

      // Different payloads produce different tokens
      expect(token1).not.toBe(token2)
    })
  })

  describe('authMiddleware', () => {
    it('returns 401 when no Authorization header is present', async () => {
      const { authMiddleware } = await import('../middleware.js')

      // Create a Hono app just for testing middleware
      const { Hono } = await import('hono')
      const app = new Hono()
      app.get('/test', authMiddleware, (c) => c.json({ ok: true }))

      const res = await app.request('/test')
      expect(res.status).toBe(401)

      const body = await res.json()
      expect(body.error).toBe('Invalid or expired token')
    })

    it('returns 401 when token is invalid', async () => {
      const { authMiddleware } = await import('../middleware.js')
      const { Hono } = await import('hono')

      const app = new Hono()
      app.get('/test', authMiddleware, (c) => c.json({ ok: true }))

      const res = await app.request('/test', {
        headers: { Authorization: 'Bearer invalid-token' },
      })

      expect(res.status).toBe(401)
    })

    it('returns 401 when user is not found', async () => {
      const { authMiddleware, createJwtToken } = await import('../middleware.js')
      const { Hono } = await import('hono')

      // Make findUserById return undefined for this user
      const db = await import('../db.js')
      vi.mocked(db.findUserById).mockResolvedValueOnce(undefined)

      const app = new Hono()
      app.get('/test', authMiddleware, (c) => c.json({ ok: true }))

      const validToken = await createJwtToken(999, 'ghost@example.com')

      const res = await app.request('/test', {
        headers: { Authorization: `Bearer ${validToken}` },
      })

      expect(res.status).toBe(401)
      const body = await res.json()
      expect(body.error).toBe('User not found')
    })

    it('passes and sets user when token is valid', async () => {
      const { authMiddleware, createJwtToken } = await import('../middleware.js')
      const { Hono } = await import('hono')

      const app = new Hono<{
        Variables: { user: { id: number; email: string } }
      }>()
      app.get('/test', authMiddleware, (c) => {
        const u = c.var.user
        return c.json({ userId: u.id, email: u.email })
      })

      const validToken = await createJwtToken(1, 'user@example.com')

      const res = await app.request('/test', {
        headers: { Authorization: `Bearer ${validToken}` },
      })

      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body.userId).toBe(1)
      expect(body.email).toBe('user@example.com')
    })
  })
})
