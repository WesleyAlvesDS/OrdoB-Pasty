import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

// ─── Mock mysql2/promise ──────────────────────────────────────

const mockQuery = vi.fn()

vi.mock('mysql2/promise', () => ({
  default: {
    createPool: vi.fn(() => ({
      getConnection: vi.fn().mockResolvedValue({
        ping: vi.fn(),
        release: vi.fn(),
      }),
      query: mockQuery,
    })),
  },
}))

// ─── Mock config ──────────────────────────────────────────────

vi.mock('../config.js', () => ({
  config: {
    db: {
      host: 'localhost',
      port: 3306,
      user: 'test_user',
      password: 'test_pass',
      database: 'test_db',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      charset: 'utf8mb4',
    },
  },
}))

// ─── Helpers ──────────────────────────────────────────────────

function mockInsert() {
  mockQuery.mockResolvedValueOnce([{ insertId: 1, affectedRows: 1 }] as never)
}

function mockSelect(rows: Record<string, unknown>[]) {
  mockQuery.mockResolvedValueOnce([rows] as never)
}

function mockEmptySelect() {
  mockQuery.mockResolvedValueOnce([[]] as never)
}

// ─── Tests ────────────────────────────────────────────────────

describe('db', () => {
  beforeEach(async () => {
    vi.clearAllMocks()

    // initDatabase creates tables (9 queries) + ping
    mockQuery.mockResolvedValue([{ test: 1 }] as never)
    const db = await import('../db.js')
    await db.initDatabase()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('findUserByGoogleId', () => {
    it('returns user when found', async () => {
      const db = await import('../db.js')
      mockSelect([{
        id: 1,
        google_id: 'google-123',
        email: 'user@example.com',
        name: 'Test User',
        avatar_url: 'https://example.com/avatar.jpg',
        access_token: 'access-token',
        refresh_token: 'refresh-token',
        token_expires_at: '2025-12-31T00:00:00Z',
        created_at: '2025-01-01T00:00:00Z',
      }])

      const user = await db.findUserByGoogleId('google-123')

      expect(user).toBeDefined()
      expect(user!.id).toBe(1)
      expect(user!.email).toBe('user@example.com')
      expect(user!.google_id).toBe('google-123')
      expect(user!.name).toBe('Test User')
    })

    it('returns undefined when user not found', async () => {
      const db = await import('../db.js')
      mockEmptySelect()

      const user = await db.findUserByGoogleId('nonexistent')

      expect(user).toBeUndefined()
    })
  })

  describe('findUserById', () => {
    it('returns user for valid id', async () => {
      const db = await import('../db.js')
      mockSelect([{
        id: 1,
        google_id: 'google-123',
        email: 'user@example.com',
        name: 'Test User',
        avatar_url: null,
        access_token: 'token',
        refresh_token: null,
        token_expires_at: null,
        created_at: '2025-01-01T00:00:00Z',
      }])

      const user = await db.findUserById(1)

      expect(user).toBeDefined()
      expect(user!.id).toBe(1)
      expect(user!.email).toBe('user@example.com')
    })

    it('returns undefined for invalid id', async () => {
      const db = await import('../db.js')
      mockEmptySelect()

      const user = await db.findUserById(999)

      expect(user).toBeUndefined()
    })
  })

  describe('createUser', () => {
    it('inserts a new user and returns it', async () => {
      const db = await import('../db.js')
      mockInsert()
      mockSelect([{
        id: 1,
        google_id: 'google-123',
        email: 'user@example.com',
        name: 'Test User',
        avatar_url: null,
        access_token: 'access-token',
        refresh_token: 'refresh-token',
        token_expires_at: '2025-12-31T00:00:00Z',
        created_at: '2025-01-01T00:00:00Z',
      }])

      const user = await db.createUser({
        google_id: 'google-123',
        email: 'user@example.com',
        name: 'Test User',
        avatar_url: null,
        access_token: 'access-token',
        refresh_token: 'refresh-token',
        token_expires_at: '2025-12-31T00:00:00Z',
      })

      expect(user).toBeDefined()
      expect(user.id).toBe(1)
      expect(user.email).toBe('user@example.com')
    })
  })

  describe('updateUserTokens', () => {
    it('updates tokens for a user', async () => {
      const db = await import('../db.js')
      mockInsert()
      mockSelect([{
        id: 1,
        google_id: 'google-123',
        email: 'user@example.com',
        name: 'Test User',
        avatar_url: null,
        access_token: 'old-access',
        refresh_token: 'old-refresh',
        token_expires_at: null,
        created_at: '2025-01-01T00:00:00Z',
      }])
      // createUser above

      const user = await db.createUser({
        google_id: 'google-123',
        email: 'user@example.com',
        name: 'Test User',
        avatar_url: null,
        access_token: 'old-access',
        refresh_token: 'old-refresh',
        token_expires_at: null,
      })
      vi.clearAllMocks()

      // Mock the UPDATE query
      mockQuery.mockResolvedValueOnce([{ affectedRows: 1 }] as never)
      // Mock the SELECT after update
      mockSelect([{
        id: 1,
        google_id: 'google-123',
        email: 'user@example.com',
        name: 'Test User',
        avatar_url: null,
        access_token: 'new-access',
        refresh_token: 'old-refresh',
        token_expires_at: '2025-12-31T00:00:00Z',
        created_at: '2025-01-01T00:00:00Z',
      }])

      await db.updateUserTokens(user.id, 'new-access', null, '2025-12-31T00:00:00Z')
      const updated = await db.findUserById(user.id)

      expect(updated).toBeDefined()
      expect(updated!.access_token).toBe('new-access')
      expect(updated!.refresh_token).toBe('old-refresh')
    })
  })

  describe('findClipByHash', () => {
    it('finds a clip by hash and destination', async () => {
      const db = await import('../db.js')
      mockSelect([{
        id: 1,
        user_id: 1,
        content_hash: 'abc123def456',
        title: 'My Note',
        destination: 'docs',
        external_id: 'doc-id-123',
        external_url: 'https://docs.google.com/document/d/doc-id-123',
        created_at: '2025-01-01T00:00:00Z',
      }])

      const clip = await db.findClipByHash(1, 'abc123def456', 'docs')

      expect(clip).toBeDefined()
      expect(clip!.content_hash).toBe('abc123def456')
      expect(clip!.destination).toBe('docs')
    })

    it('returns undefined when no duplicate exists', async () => {
      const db = await import('../db.js')
      mockEmptySelect()

      const clip = await db.findClipByHash(1, 'nonexistent-hash', 'drive')

      expect(clip).toBeUndefined()
    })
  })

  describe('createClip', () => {
    it('inserts a new clip and returns it', async () => {
      const db = await import('../db.js')
      mockInsert()
      mockSelect([{
        id: 1,
        user_id: 1,
        content_hash: 'abc123def456',
        title: 'My Note',
        destination: 'docs',
        external_id: 'doc-id-123',
        external_url: 'https://docs.google.com/document/d/doc-id-123',
        created_at: '2025-01-01T00:00:00Z',
      }])

      const clip = await db.createClip({
        user_id: 1,
        content_hash: 'abc123def456',
        title: 'My Note',
        destination: 'docs',
        external_id: 'doc-id-123',
        external_url: 'https://docs.google.com/document/d/doc-id-123',
      })

      expect(clip).toBeDefined()
      expect(clip.id).toBe(1)
      expect(clip.destination).toBe('docs')
    })
  })

  describe('getClipsByUserId', () => {
    it('returns paginated clips for a user', async () => {
      const db = await import('../db.js')
      const clips = [
        { id: 3, user_id: 1, content_hash: 'hash3', title: 'Note 3', destination: 'docs', external_id: null, external_url: null, created_at: '2025-01-03T00:00:00Z' },
        { id: 2, user_id: 1, content_hash: 'hash2', title: 'Note 2', destination: 'docs', external_id: null, external_url: null, created_at: '2025-01-02T00:00:00Z' },
        { id: 1, user_id: 1, content_hash: 'hash1', title: 'Note 1', destination: 'docs', external_id: null, external_url: null, created_at: '2025-01-01T00:00:00Z' },
      ]
      mockSelect(clips)
      mockSelect([{ count: 3 }])

      const result = await db.getClipsByUserId(1, { limit: 10 })

      expect(result.clips).toHaveLength(3)
      expect(result.total).toBe(3)
      expect(result.nextCursor).toBe(1)
    })

    it('filters by destination', async () => {
      const db = await import('../db.js')
      mockSelect([{
        id: 1, user_id: 1, content_hash: 'hash1', title: 'Doc', destination: 'docs',
        external_id: null, external_url: null, created_at: '2025-01-01T00:00:00Z',
      }])
      mockSelect([{ count: 1 }])

      const result = await db.getClipsByUserId(1, { destination: 'docs' })

      expect(result.clips).toHaveLength(1)
      expect(result.clips[0].destination).toBe('docs')
    })

    it('filters by search', async () => {
      const db = await import('../db.js')
      mockSelect([{
        id: 1, user_id: 1, content_hash: 'hash1', title: 'My Important Note', destination: 'docs',
        external_id: null, external_url: null, created_at: '2025-01-01T00:00:00Z',
      }])
      mockSelect([{ count: 1 }])

      const result = await db.getClipsByUserId(1, { search: 'Important' })

      expect(result.clips).toHaveLength(1)
      expect(result.clips[0].title).toBe('My Important Note')
    })

    it('paginates with cursor', async () => {
      const db = await import('../db.js')
      mockSelect([
        { id: 1, user_id: 1, content_hash: 'hash1', title: 'Note 1', destination: 'docs', external_id: null, external_url: null, created_at: '2025-01-01T00:00:00Z' },
        { id: 2, user_id: 1, content_hash: 'hash2', title: 'Note 2', destination: 'docs', external_id: null, external_url: null, created_at: '2025-01-02T00:00:00Z' },
      ])
      mockSelect([{ count: 5 }])

      const result = await db.getClipsByUserId(1, { cursor: 3, limit: 2 })

      expect(result.clips).toHaveLength(2)
      expect(result.clips[0].id).toBe(1)
    })

    it('returns empty array for user with no clips', async () => {
      const db = await import('../db.js')
      mockEmptySelect()
      mockSelect([{ count: 0 }])

      const result = await db.getClipsByUserId(999)

      expect(result.clips).toHaveLength(0)
      expect(result.total).toBe(0)
      expect(result.nextCursor).toBeNull()
    })
  })
})
