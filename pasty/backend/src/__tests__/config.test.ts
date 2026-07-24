import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

// ─── Helpers ──────────────────────────────────────────────────

const ORIGINAL_ENV = { ...process.env }

function setEnv(vars: Record<string, string>) {
  for (const [key, value] of Object.entries(vars)) {
    process.env[key] = value
  }
}

function resetEnv() {
  // Clear all env vars that config reads
  delete process.env.GOOGLE_CLIENT_ID
  delete process.env.GOOGLE_CLIENT_SECRET
  delete process.env.GOOGLE_REDIRECT_URI
  delete process.env.JWT_SECRET
  delete process.env.DATABASE_URL
  delete process.env.FRONTEND_URL
  delete process.env.PORT
}

// ─── Tests ────────────────────────────────────────────────────

describe('config', () => {
  beforeEach(() => {
    vi.resetModules()
    resetEnv()
  })

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV }
  })

  it('uses default values when no env vars are set', async () => {
    const { config } = await import('../config.js')

    expect(config.googleClientId).toBe('')
    expect(config.googleClientSecret).toBe('')
    expect(config.googleRedirectUri).toBe('http://localhost:5173/auth/callback')
    expect(config.googleAuthUri).toBe('https://accounts.google.com/o/oauth2/v2/auth')
    expect(config.googleTokenUri).toBe('https://oauth2.googleapis.com/token')
    expect(config.googleUserInfoUri).toBe('https://www.googleapis.com/oauth2/v2/userinfo')
    expect(config.scopes).toContain('https://www.googleapis.com/auth/documents')
    expect(config.scopes).toContain('https://www.googleapis.com/auth/drive.file')
    expect(config.scopes).toContain('https://www.googleapis.com/auth/gmail.compose')
    expect(config.scopes).toContain('openid')
    expect(config.jwtSecret).toBe('change-me-in-production')
    expect(config.jwtExpiryHours).toBe(24)
    expect(config.databaseUrl).toBe('postgres://postgres:postgres@localhost:5432/pasty')
    expect(config.frontendUrl).toBe('http://localhost:5173')
    expect(config.port).toBe(8000)
  })

  it('reads GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET from env', async () => {
    setEnv({
      GOOGLE_CLIENT_ID: 'my-client-id',
      GOOGLE_CLIENT_SECRET: 'my-client-secret',
    })

    const { config } = await import('../config.js')

    expect(config.googleClientId).toBe('my-client-id')
    expect(config.googleClientSecret).toBe('my-client-secret')
  })

  it('reads GOOGLE_REDIRECT_URI from env', async () => {
    setEnv({ GOOGLE_REDIRECT_URI: 'https://example.com/callback' })

    const { config } = await import('../config.js')

    expect(config.googleRedirectUri).toBe('https://example.com/callback')
  })

  it('reads JWT_SECRET from env', async () => {
    setEnv({ JWT_SECRET: 'super-secret-jwt' })

    const { config } = await import('../config.js')

    expect(config.jwtSecret).toBe('super-secret-jwt')
  })

  it('reads DATABASE_URL from env', async () => {
    setEnv({ DATABASE_URL: 'postgres://user:pass@remote-host:5432/mydb' })

    const { config } = await import('../config.js')

    expect(config.databaseUrl).toBe('postgres://user:pass@remote-host:5432/mydb')
  })

  it('reads FRONTEND_URL from env', async () => {
    setEnv({ FRONTEND_URL: 'https://myapp.com' })

    const { config } = await import('../config.js')

    expect(config.frontendUrl).toBe('https://myapp.com')
  })

  it('reads PORT from env as number', async () => {
    setEnv({ PORT: '3000' })

    const { config } = await import('../config.js')

    expect(config.port).toBe(3000)
  })

  it('returns NaN when PORT is not a valid number', async () => {
    setEnv({ PORT: 'not-a-number' })

    const { config } = await import('../config.js')

    expect(config.port).toBeNaN()
  })
})
