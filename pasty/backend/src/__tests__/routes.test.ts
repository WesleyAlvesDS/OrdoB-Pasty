import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

// ─── Mock db module ───────────────────────────────────────────

const mockDbUser = {
  id: 1,
  google_id: 'google-123',
  email: 'user@example.com',
  name: 'Test User',
  avatar_url: 'https://example.com/avatar.jpg',
  access_token: 'valid-access-token',
  refresh_token: 'valid-refresh-token',
  token_expires_at: new Date(Date.now() + 86400000).toISOString(),
  created_at: new Date().toISOString(),
}

vi.mock('../db.js', () => ({
  findUserByGoogleId: vi.fn(async (googleId: string) => {
    if (googleId === 'google-123') return mockDbUser
    return undefined
  }),
  findUserById: vi.fn(async (id: number) => {
    if (id === 1) return mockDbUser
    return undefined
  }),
  createUser: vi.fn(async (user: Record<string, unknown>) => ({
    ...mockDbUser,
    ...user,
  })),
  updateUserTokens: vi.fn(),
  findClipByHash: vi.fn(async () => undefined),
  createClip: vi.fn(async (clip: Record<string, unknown>) => ({
    id: 1,
    ...clip,
    created_at: new Date().toISOString(),
  })),
  getClipsByUserId: vi.fn(async (userId: number) => ({
    clips: [
      {
        id: 1,
        user_id: userId,
        content_hash: 'hash123',
        title: 'Test Clip',
        destination: 'docs',
        external_id: 'ext-123',
        external_url: 'https://docs.google.com/document/d/ext-123',
        created_at: new Date().toISOString(),
      },
    ],
    nextCursor: null,
    total: 1,
  })),
  initDatabase: vi.fn(async () => {}),
}))

// ─── Mock auth module ─────────────────────────────────────────

const testState = 'test-state-123'

vi.mock('../auth.js', () => ({
  getGoogleAuthUrl: vi.fn(
    (state?: string) =>
      `https://accounts.google.com/o/oauth2/v2/auth?state=${state ?? 'none'}&client_id=test`,
  ),
  generateState: vi.fn(() => testState),
  validateState: vi.fn((state: string) => state === testState),
  exchangeCodeForToken: vi.fn(async (code: string) => {
    if (code === 'valid-code') {
      return {
        access_token: 'google-access-token',
        refresh_token: 'google-refresh-token',
        expires_in: 3600,
      }
    }
    throw new Error('Token exchange failed')
  }),
  getUserInfo: vi.fn(async (accessToken: string) => {
    if (accessToken === 'google-access-token') {
      return {
        id: 'google-123',
        email: 'user@example.com',
        name: 'Test User',
        picture: 'https://example.com/avatar.jpg',
      }
    }
    throw new Error('User info failed')
  }),
  refreshAccessToken: vi.fn(),
}))

// ─── Mock services ────────────────────────────────────────────

vi.mock('../services/docs.js', () => ({
  createGoogleDoc: vi.fn(async () => ({
    document_id: 'doc-123',
    url: 'https://docs.google.com/document/d/doc-123',
  })),
}))

vi.mock('../services/drive.js', () => ({
  createGoogleDriveFile: vi.fn(async () => ({
    file_id: 'file-123',
    url: 'https://drive.google.com/file/d/file-123/view',
  })),
}))

vi.mock('../services/gmail.js', () => ({
  createGmailDraft: vi.fn(async () => ({
    draft_id: 'draft-123',
    message_id: 'msg-456',
  })),
}))

// ─── Tests ────────────────────────────────────────────────────

describe('API Routes', () => {
  beforeEach(() => {
    process.env.JWT_SECRET = 'test-jwt-secret'
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    delete process.env.JWT_SECRET
  })

  describe('GET /api/health', () => {
    it('returns status ok', async () => {
      const { app } = await import('../index.js')
      const res = await app.request('/api/health')

      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body.status).toBe('ok')
      expect(body.version).toBe('1.0.0')
    })
  })

  describe('GET /api/auth/google/login', () => {
    it('returns auth URL with state', async () => {
      const { app } = await import('../index.js')
      const res = await app.request('/api/auth/google/login')

      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body.auth_url).toContain('accounts.google.com')
      expect(body.auth_url).toContain('state=')
      expect(body.state).toBe(testState)
    })
  })

  describe('POST /api/auth/callback', () => {
    it('authenticates user with valid code and state', async () => {
      const { app } = await import('../index.js')
      const res = await app.request('/api/auth/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: 'valid-code', state: testState }),
      })

      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body.token).toBeTruthy()
      expect(body.user.id).toBe(1)
      expect(body.user.email).toBe('user@example.com')
    })

    it('returns 400 when state is missing', async () => {
      const { app } = await import('../index.js')
      const res = await app.request('/api/auth/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: 'valid-code' }),
      })

      expect(res.status).toBe(400)
      const body = await res.json()
      expect(body.error).toContain('segurança')
    })

    it('returns 400 when state is invalid', async () => {
      const { app } = await import('../index.js')
      const res = await app.request('/api/auth/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: 'valid-code', state: 'wrong-state' }),
      })

      expect(res.status).toBe(400)
      const body = await res.json()
      expect(body.error).toContain('segurança')
    })

    it('returns 400 for invalid code', async () => {
      const { app } = await import('../index.js')
      const res = await app.request('/api/auth/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: 'bad-code', state: testState }),
      })

      expect(res.status).toBe(400)
      const body = await res.json()
      expect(body.error).toContain('Token exchange failed')
    })

    it('returns 400 when code is missing', async () => {
      const { app } = await import('../index.js')
      const res = await app.request('/api/auth/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state: testState }),
      })

      expect(res.status).toBe(400)
    })
  })

  describe('GET /api/auth/me', () => {
    it('returns user data when authenticated', async () => {
      const { app, createJwtToken } = await import('../index.js')
      const token = await createJwtToken(1, 'user@example.com')

      const res = await app.request('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      })

      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body.user.email).toBe('user@example.com')
      expect(body.user.id).toBe(1)
    })

    it('returns 401 when not authenticated', async () => {
      const { app } = await import('../index.js')

      const res = await app.request('/api/auth/me')
      expect(res.status).toBe(401)
    })
  })

  describe('POST /api/save', () => {
    async function getAuthToken() {
      const { createJwtToken } = await import('../index.js')
      return createJwtToken(1, 'user@example.com')
    }

    it('saves text to a destination', async () => {
      const token = await getAuthToken()
      const { app } = await import('../index.js')

      const res = await app.request('/api/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          text: 'Hello, world!',
          destination: 'docs',
          title: 'My Note',
        }),
      })

      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body.duplicate).toBe(false)
      expect(body.message).toContain('successfully')
      expect(body.clip).toBeDefined()
    })

    it('saves to drive destination', async () => {
      const token = await getAuthToken()
      const { app } = await import('../index.js')

      const res = await app.request('/api/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          text: 'Drive content',
          destination: 'drive',
        }),
      })

      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body.duplicate).toBe(false)
    })

    it('returns 400 for invalid destination', async () => {
      const token = await getAuthToken()
      const { app } = await import('../index.js')

      const res = await app.request('/api/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          text: 'Some text',
          destination: 'notion',
        }),
      })

      expect(res.status).toBe(400)
      const body = await res.json()
      expect(body.error).toContain('Invalid destination')
    })

    it('returns 400 for empty text', async () => {
      const token = await getAuthToken()
      const { app } = await import('../index.js')

      const res = await app.request('/api/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          text: '',
          destination: 'docs',
        }),
      })

      expect(res.status).toBe(400)
      const body = await res.json()
      expect(body.error).toContain('cannot be empty')
    })

    it('returns 401 when not authenticated', async () => {
      const { app } = await import('../index.js')

      const res = await app.request('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: 'Some text',
          destination: 'docs',
        }),
      })

      expect(res.status).toBe(401)
    })
  })

  describe('GET /api/history', () => {
    it('returns history when authenticated', async () => {
      const { app, createJwtToken } = await import('../index.js')
      const token = await createJwtToken(1, 'user@example.com')

      const res = await app.request('/api/history', {
        headers: { Authorization: `Bearer ${token}` },
      })

      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body.clips).toHaveLength(1)
      expect(body.total).toBe(1)
      expect(body.nextCursor).toBeNull()
    })

    it('returns 401 when not authenticated', async () => {
      const { app } = await import('../index.js')

      const res = await app.request('/api/history')
      expect(res.status).toBe(401)
    })
  })
})
