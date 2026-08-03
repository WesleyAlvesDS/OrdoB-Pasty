import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

// ─── Helpers ──────────────────────────────────────────────────

const ORIGINAL_ENV = { ...process.env }

function setEnv(vars: Record<string, string>) {
  for (const [key, value] of Object.entries(vars)) {
    process.env[key] = value
  }
}

function resetEnv() {
  delete process.env.GOOGLE_CLIENT_ID
  delete process.env.GOOGLE_CLIENT_SECRET
  delete process.env.GOOGLE_REDIRECT_URI
  delete process.env.JWT_SECRET
  delete process.env.FRONTEND_URL
  delete process.env.PORT
  delete process.env.DB_HOST
  delete process.env.DB_PORT
  delete process.env.DB_USER
  delete process.env.DB_PASSWORD
  delete process.env.DB_DATABASE
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
    expect(config.frontendUrl).toBe('http://localhost:5173')
    expect(config.port).toBe(8000)
    expect(config.db.host).toBe('localhost')
    expect(config.db.port).toBe(3306)
    expect(config.db.user).toBe('arti3263_pasty')
    expect(config.db.password).toBe('')
    expect(config.db.database).toBe('arti3263_pasty')
    expect(config.db.connectionLimit).toBe(10)
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

  it('reads MySQL DB settings from env', async () => {
    setEnv({
      DB_HOST: 'mysql.example.com',
      DB_PORT: '3307',
      DB_USER: 'custom_user',
      DB_PASSWORD: 'custom_pass',
      DB_DATABASE: 'custom_db',
    })

    const { config } = await import('../config.js')

    expect(config.db.host).toBe('mysql.example.com')
    expect(config.db.port).toBe(3307)
    expect(config.db.user).toBe('custom_user')
    expect(config.db.password).toBe('custom_pass')
    expect(config.db.database).toBe('custom_db')
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

  it('returns default port 8000 when PORT is not a valid number', async () => {
    setEnv({ PORT: 'not-a-number' })

    const { config } = await import('../config.js')

    expect(config.port).toBe(8000)
  })
})
