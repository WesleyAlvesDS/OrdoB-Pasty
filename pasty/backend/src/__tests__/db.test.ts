import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

// ─── Mock config to use in-memory database ────────────────────

vi.mock('../config.js', () => ({
  config: {
    get databasePath() { return process.env.DATABASE_PATH ?? ':memory:' },
  },
}))

// ─── Mock fs to avoid disk writes ─────────────────────────────

vi.mock('node:fs', () => ({
  readFileSync: vi.fn().mockReturnValue(Buffer.from([])),
  writeFileSync: vi.fn(),
  mkdirSync: vi.fn(),
  existsSync: vi.fn().mockReturnValue(false),
}))

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

// ─── Tests ────────────────────────────────────────────────────

describe('db', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    process.env.DATABASE_PATH = ':memory:'

    const db = await import('../db.js')
    await db.initDatabase()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    delete process.env.DATABASE_PATH
  })

  describe('findUserByGoogleId', () => {
    it('returns user when found', async () => {
      const db = await import('../db.js')
      db.createUser({
        google_id: 'google-123',
        email: 'user@example.com',
        name: 'Test User',
        avatar_url: null,
        access_token: 'access-token',
        refresh_token: 'refresh-token',
        token_expires_at: new Date(Date.now() + 86400000).toISOString(),
      })

      const user = db.findUserByGoogleId('google-123')

      expect(user).toBeDefined()
      expect(user!.id).toBe(1)
      expect(user!.email).toBe('user@example.com')
      expect(user!.google_id).toBe('google-123')
      expect(user!.name).toBe('Test User')
    })

    it('returns undefined when user not found', async () => {
      const db = await import('../db.js')
      const user = db.findUserByGoogleId('nonexistent')

      expect(user).toBeUndefined()
    })
  })

  describe('findUserById', () => {
    it('returns user for valid id', async () => {
      const db = await import('../db.js')
      db.createUser({
        google_id: 'google-123',
        email: 'user@example.com',
        name: 'Test User',
        avatar_url: null,
        access_token: 'access-token',
        refresh_token: 'refresh-token',
        token_expires_at: new Date(Date.now() + 86400000).toISOString(),
      })

      const user = db.findUserById(1)

      expect(user).toBeDefined()
      expect(user!.id).toBe(1)
      expect(user!.email).toBe('user@example.com')
    })

    it('returns undefined for invalid id', async () => {
      const db = await import('../db.js')
      const user = db.findUserById(999)

      expect(user).toBeUndefined()
    })
  })

  describe('createUser', () => {
    it('inserts a new user and returns it', async () => {
      const db = await import('../db.js')
      const user = db.createUser({
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
      const db = await import('../db.js')
      const user = db.createUser({
        google_id: 'google-123',
        email: 'user@example.com',
        name: 'Test User',
        avatar_url: null,
        access_token: 'old-access',
        refresh_token: 'old-refresh',
        token_expires_at: null,
      })

      db.updateUserTokens(user.id, 'new-access', null, '2025-12-31T00:00:00Z')

      const updated = db.findUserById(user.id)!
      expect(updated.access_token).toBe('new-access')
      expect(updated.refresh_token).toBe('old-refresh')
    })
  })

  describe('findClipByHash', () => {
    it('finds a clip by hash and destination', async () => {
      const db = await import('../db.js')
      const user = db.createUser({
        google_id: 'google-123',
        email: 'user@example.com',
        name: null,
        avatar_url: null,
        access_token: 'token',
        refresh_token: null,
        token_expires_at: null,
      })

      db.createClip({
        user_id: user.id,
        content_hash: 'abc123def456',
        title: 'My Note',
        destination: 'docs',
        external_id: 'doc-id-123',
        external_url: 'https://docs.google.com/document/d/doc-id-123',
      })

      const clip = db.findClipByHash(user.id, 'abc123def456', 'docs')

      expect(clip).toBeDefined()
      expect(clip!.content_hash).toBe('abc123def456')
      expect(clip!.destination).toBe('docs')
    })

    it('returns undefined when no duplicate exists', async () => {
      const db = await import('../db.js')
      const clip = db.findClipByHash(1, 'nonexistent-hash', 'drive')

      expect(clip).toBeUndefined()
    })
  })

  describe('createClip', () => {
    it('inserts a new clip and returns it', async () => {
      const db = await import('../db.js')
      const user = db.createUser({
        google_id: 'google-123',
        email: 'user@example.com',
        name: null,
        avatar_url: null,
        access_token: 'token',
        refresh_token: null,
        token_expires_at: null,
      })

      const clip = db.createClip({
        user_id: user.id,
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
      const user = db.createUser({
        google_id: 'google-123',
        email: 'user@example.com',
        name: null,
        avatar_url: null,
        access_token: 'token',
        refresh_token: null,
        token_expires_at: null,
      })

      for (let i = 1; i <= 3; i++) {
        db.createClip({
          user_id: user.id,
          content_hash: `hash${i}`,
          title: `Note ${i}`,
          destination: 'docs',
          external_id: null,
          external_url: null,
        })
      }

      const result = db.getClipsByUserId(user.id, { limit: 10 })

      expect(result.clips).toHaveLength(3)
      expect(result.total).toBe(3)
      expect(result.nextCursor).toBe(result.clips[result.clips.length - 1].id)
    })

    it('filters by destination', async () => {
      const db = await import('../db.js')
      const user = db.createUser({
        google_id: 'google-123',
        email: 'user@example.com',
        name: null,
        avatar_url: null,
        access_token: 'token',
        refresh_token: null,
        token_expires_at: null,
      })

      db.createClip({
        user_id: user.id,
        content_hash: 'hash1',
        title: 'Doc',
        destination: 'docs',
        external_id: null,
        external_url: null,
      })
      db.createClip({
        user_id: user.id,
        content_hash: 'hash2',
        title: 'File',
        destination: 'drive',
        external_id: null,
        external_url: null,
      })

      const result = db.getClipsByUserId(user.id, { destination: 'docs' })

      expect(result.clips).toHaveLength(1)
      expect(result.clips[0].destination).toBe('docs')
    })

    it('filters by search', async () => {
      const db = await import('../db.js')
      const user = db.createUser({
        google_id: 'google-123',
        email: 'user@example.com',
        name: null,
        avatar_url: null,
        access_token: 'token',
        refresh_token: null,
        token_expires_at: null,
      })

      db.createClip({
        user_id: user.id,
        content_hash: 'hash1',
        title: 'My Important Note',
        destination: 'docs',
        external_id: null,
        external_url: null,
      })
      db.createClip({
        user_id: user.id,
        content_hash: 'hash2',
        title: 'Random Stuff',
        destination: 'docs',
        external_id: null,
        external_url: null,
      })

      const result = db.getClipsByUserId(user.id, { search: 'Important' })

      expect(result.clips).toHaveLength(1)
      expect(result.clips[0].title).toBe('My Important Note')
    })

    it('paginates with cursor', async () => {
      const db = await import('../db.js')
      const user = db.createUser({
        google_id: 'google-123',
        email: 'user@example.com',
        name: null,
        avatar_url: null,
        access_token: 'token',
        refresh_token: null,
        token_expires_at: null,
      })

      const clipIds: number[] = []
      for (let i = 1; i <= 5; i++) {
        const clip = db.createClip({
          user_id: user.id,
          content_hash: `hash${i}`,
          title: `Note ${i}`,
          destination: 'docs',
          external_id: null,
          external_url: null,
        })
        clipIds.push(clip.id)
      }

      const result = db.getClipsByUserId(user.id, {
        cursor: clipIds[2],
        limit: 2,
      })

      expect(result.clips).toHaveLength(2)
      expect(result.clips[0].id).toBeLessThan(clipIds[2])
    })

    it('clamps limit between 1 and 100', async () => {
      const db = await import('../db.js')
      const user = db.createUser({
        google_id: 'google-123',
        email: 'user@example.com',
        name: null,
        avatar_url: null,
        access_token: 'token',
        refresh_token: null,
        token_expires_at: null,
      })

      db.createClip({
        user_id: user.id,
        content_hash: 'hash1',
        title: 'Note',
        destination: 'docs',
        external_id: null,
        external_url: null,
      })

      const result = db.getClipsByUserId(user.id, { limit: 999 })

      expect(result.clips).toHaveLength(1)
    })

    it('returns empty array for user with no clips', async () => {
      const db = await import('../db.js')
      const result = db.getClipsByUserId(999)

      expect(result.clips).toHaveLength(0)
      expect(result.total).toBe(0)
      expect(result.nextCursor).toBeNull()
    })
  })
})
