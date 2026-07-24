import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

// ─── Mock pg module ───────────────────────────────────────────

const mockQuery = vi.fn()
const mockConnect = vi.fn()
const mockRelease = vi.fn()

vi.mock('pg', () => {
  class MockPool {
    query = mockQuery
    connect = mockConnect
    end = vi.fn()
  }

  return {
    Pool: MockPool,
    default: { Pool: MockPool },
    types: { getTypeParser: () => (v: string) => v },
  }
})

// ─── Helpers ──────────────────────────────────────────────────

const sampleUserRow = {
  id: 1,
  google_id: 'google-123',
  email: 'user@example.com',
  name: 'Test User',
  avatar_url: 'https://example.com/avatar.jpg',
  access_token: 'access-token',
  refresh_token: 'refresh-token',
  token_expires_at: new Date(Date.now() + 86400000).toISOString(),
  created_at: new Date().toISOString(),
}

const sampleClipRow = {
  id: 1,
  user_id: 1,
  content_hash: 'abc123def456',
  title: 'My Note',
  destination: 'docs',
  external_id: 'doc-id-123',
  external_url: 'https://docs.google.com/document/d/doc-id-123',
  created_at: new Date().toISOString(),
}

function setupQuerySuccess(rows: Record<string, unknown>[]) {
  mockQuery.mockResolvedValue({ rows })
}

function setupQueryCount(count: number) {
  mockQuery.mockResolvedValue({ rows: [{ count }] })
}

// ─── Tests ────────────────────────────────────────────────────

describe('db', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    process.env.DATABASE_URL = 'postgres://test:test@localhost:5432/testdb'

    // Set up connection mock (for initDatabase's pool.connect call)
    const mockClient = {
      query: vi.fn().mockResolvedValue({ rows: [{ '?column?': 1 }] }),
      release: mockRelease,
    }
    mockConnect.mockResolvedValue(mockClient)

    // Default pool.query returns empty result
    mockQuery.mockResolvedValue({ rows: [] })

    // Initialize the database (creates the pool with mocked pg)
    const db = await import('../db.js')
    await db.initDatabase()

    // Clear schema init calls so tests only see their own query calls
    mockQuery.mockClear()
    mockConnect.mockClear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    delete process.env.DATABASE_URL
  })

  describe('findUserByGoogleId', () => {
    it('returns user when found', async () => {
      setupQuerySuccess([sampleUserRow])

      const db = await import('../db.js')
      const user = await db.findUserByGoogleId('google-123')

      expect(user).toBeDefined()
      expect(user!.id).toBe(1)
      expect(user!.email).toBe('user@example.com')
      expect(user!.google_id).toBe('google-123')
      expect(user!.name).toBe('Test User')
    })

    it('returns undefined when user not found', async () => {
      setupQuerySuccess([])

      const db = await import('../db.js')
      const user = await db.findUserByGoogleId('nonexistent')

      expect(user).toBeUndefined()
    })
  })

  describe('findUserById', () => {
    it('returns user for valid id', async () => {
      setupQuerySuccess([sampleUserRow])

      const db = await import('../db.js')
      const user = await db.findUserById(1)

      expect(user).toBeDefined()
      expect(user!.id).toBe(1)
      expect(user!.email).toBe('user@example.com')
    })

    it('returns undefined for invalid id', async () => {
      setupQuerySuccess([])

      const db = await import('../db.js')
      const user = await db.findUserById(999)

      expect(user).toBeUndefined()
    })
  })

  describe('createUser', () => {
    it('inserts a new user and returns it', async () => {
      setupQuerySuccess([sampleUserRow])

      const db = await import('../db.js')
      const user = await db.createUser({
        google_id: 'google-123',
        email: 'user@example.com',
        name: 'Test User',
        avatar_url: null,
        access_token: 'access-token',
        refresh_token: 'refresh-token',
        token_expires_at: new Date().toISOString(),
      })

      expect(user).toBeDefined()
      expect(user.id).toBe(1)
      expect(user.email).toBe('user@example.com')
    })
  })

  describe('updateUserTokens', () => {
    it('updates tokens for a user', async () => {
      setupQuerySuccess([])

      const db = await import('../db.js')
      await db.updateUserTokens(1, 'new-access', null, new Date().toISOString())

      expect(mockQuery).toHaveBeenCalled()
      const call = mockQuery.mock.calls[0]
      expect(call[0]).toContain('UPDATE users')
      expect(call[1]).toContain(1)
    })
  })

  describe('findClipByHash', () => {
    it('finds a clip by hash and destination', async () => {
      setupQuerySuccess([sampleClipRow])

      const db = await import('../db.js')
      const clip = await db.findClipByHash(1, 'abc123def456', 'docs')

      expect(clip).toBeDefined()
      expect(clip!.content_hash).toBe('abc123def456')
      expect(clip!.destination).toBe('docs')
    })

    it('returns undefined when no duplicate exists', async () => {
      setupQuerySuccess([])

      const db = await import('../db.js')
      const clip = await db.findClipByHash(1, 'nonexistent-hash', 'drive')

      expect(clip).toBeUndefined()
    })
  })

  describe('createClip', () => {
    it('inserts a new clip and returns it', async () => {
      setupQuerySuccess([sampleClipRow])

      const db = await import('../db.js')
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
      const clips = [
        { ...sampleClipRow, id: 3 },
        { ...sampleClipRow, id: 2 },
        { ...sampleClipRow, id: 1 },
      ]
      mockQuery
        .mockResolvedValueOnce({ rows: clips })
        .mockResolvedValueOnce({ rows: [{ count: 3 }] })

      const db = await import('../db.js')
      const result = await db.getClipsByUserId(1, { limit: 10 })

      expect(result.clips).toHaveLength(3)
      expect(result.total).toBe(3)
      expect(result.nextCursor).toBe(1)
    })

    it('filters by destination', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [sampleClipRow] })
        .mockResolvedValueOnce({ rows: [{ count: 1 }] })

      const db = await import('../db.js')
      const result = await db.getClipsByUserId(1, {
        limit: 20,
        destination: 'docs',
      })

      expect(result.clips).toHaveLength(1)
      expect(mockQuery.mock.calls[0][0]).toContain('destination = ')
    })

    it('filters by search', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [sampleClipRow] })
        .mockResolvedValueOnce({ rows: [{ count: 1 }] })

      const db = await import('../db.js')
      const result = await db.getClipsByUserId(1, {
        search: 'note',
      })

      expect(result.clips).toHaveLength(1)
      expect(mockQuery.mock.calls[0][0]).toContain('ILIKE')
    })

    it('paginates with cursor', async () => {
      const clips = [
        { ...sampleClipRow, id: 5 },
        { ...sampleClipRow, id: 4 },
      ]
      mockQuery
        .mockResolvedValueOnce({ rows: clips })
        .mockResolvedValueOnce({ rows: [{ count: 10 }] })

      const db = await import('../db.js')
      const result = await db.getClipsByUserId(1, {
        cursor: 10,
        limit: 20,
      })

      expect(result.clips).toHaveLength(2)
      expect(mockQuery.mock.calls[0][0]).toContain('id <')
    })

    it('clamps limit between 1 and 100', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [sampleClipRow] })
        .mockResolvedValueOnce({ rows: [{ count: 1 }] })

      const db = await import('../db.js')
      const result = await db.getClipsByUserId(1, { limit: 999 })

      expect(result.clips).toHaveLength(1)
    })

    it('returns empty array for user with no clips', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [{ count: 0 }] })

      const db = await import('../db.js')
      const result = await db.getClipsByUserId(1)

      expect(result.clips).toHaveLength(0)
      expect(result.total).toBe(0)
      expect(result.nextCursor).toBeNull()
    })
  })
})
