import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

// ─── Tests ────────────────────────────────────────────────────

describe('rate limiter', () => {
  beforeEach(async () => {
    // Set env vars BEFORE importing modules so config is evaluated with them
    process.env.RATE_LIMIT_AUTH = '5'
    process.env.RATE_LIMIT_SAVE = '3'
    process.env.RATE_LIMIT_HISTORY = '10'
    process.env.RATE_LIMIT_DEFAULT = '20'

    vi.resetModules()

    // Fresh import to initialize limiters with the new env values
    await import('../rate-limiter.js')
  })

  afterEach(() => {
    vi.restoreAllMocks()
    delete process.env.RATE_LIMIT_AUTH
    delete process.env.RATE_LIMIT_SAVE
    delete process.env.RATE_LIMIT_HISTORY
    delete process.env.RATE_LIMIT_DEFAULT
  })

  describe('configuration', () => {
    it('reads rate limit config from env vars', async () => {
      const { config } = await import('../config.js')

      expect(config.rateLimitAuth).toBe(5)
      expect(config.rateLimitSave).toBe(3)
      expect(config.rateLimitHistory).toBe(10)
      expect(config.rateLimitDefault).toBe(20)
    })

    it('uses default values when env vars are not set', async () => {
      vi.resetModules()
      delete process.env.RATE_LIMIT_AUTH
      delete process.env.RATE_LIMIT_SAVE
      delete process.env.RATE_LIMIT_HISTORY
      delete process.env.RATE_LIMIT_DEFAULT

      const { config } = await import('../config.js')

      expect(config.rateLimitAuth).toBe(20)
      expect(config.rateLimitSave).toBe(10)
      expect(config.rateLimitHistory).toBe(30)
      expect(config.rateLimitDefault).toBe(60)
    })
  })

  describe('rate limiting behavior', () => {
    it('allows requests under the limit', async () => {
      const { rateLimiter } = await import('../rate-limiter.js')
      const { Hono } = await import('hono')

      const app = new Hono()
      app.use('/api/test', rateLimiter)
      app.get('/api/test', (c) => c.json({ ok: true }))

      const res = await app.request('/api/test')
      expect(res.status).toBe(200)

      const headers = res.headers
      // Default route limit: RATE_LIMIT_DEFAULT=20
      expect(headers.get('X-RateLimit-Limit')).toBe('20')
      expect(headers.get('X-RateLimit-Remaining')).toBe('19')
    })

    it('blocks requests over the limit', async () => {
      const { rateLimiter } = await import('../rate-limiter.js')
      const { Hono } = await import('hono')

      const app = new Hono()
      app.use('/api/test', rateLimiter)
      app.get('/api/test', (c) => c.json({ ok: true }))

      // Default limit is 60, but we set RATE_LIMIT_DEFAULT=20
      // Make 20 requests that should succeed
      for (let i = 0; i < 20; i++) {
        const res = await app.request('/api/test')
        expect(res.status).toBe(200)
      }

      // The 21st request should be blocked
      const res = await app.request('/api/test')
      expect(res.status).toBe(429)

      const body = await res.json()
      expect(body.error).toContain('Too many requests')
      expect(body.retryAfter).toBeGreaterThan(0)
      expect(res.headers.get('Retry-After')).toBeTruthy()
      expect(res.headers.get('X-RateLimit-Remaining')).toBe('0')
    })

    it('applies different limits for /api/save route', async () => {
      const { rateLimiter } = await import('../rate-limiter.js')
      const { Hono } = await import('hono')

      const app = new Hono()
      app.use('/api/*', rateLimiter)
      app.post('/api/save', (c) => c.json({ ok: true }))

      // 3 requests should pass (RATE_LIMIT_SAVE=3)
      for (let i = 0; i < 3; i++) {
        const res = await app.request('/api/save', { method: 'POST' })
        expect(res.status).toBe(200)
        expect(res.headers.get('X-RateLimit-Limit')).toBe('3')
      }

      // 4th should be blocked
      const res = await app.request('/api/save', { method: 'POST' })
      expect(res.status).toBe(429)
      expect(res.headers.get('X-RateLimit-Limit')).toBe('3')
      expect(res.headers.get('X-RateLimit-Remaining')).toBe('0')
    })

    it('applies different limits for /api/auth/* routes', async () => {
      const { rateLimiter } = await import('../rate-limiter.js')
      const { Hono } = await import('hono')

      const app = new Hono()
      app.use('/api/*', rateLimiter)
      app.get('/api/auth/login', (c) => c.json({ ok: true }))

      // 5 requests should pass (RATE_LIMIT_AUTH=5)
      for (let i = 0; i < 5; i++) {
        const res = await app.request('/api/auth/login')
        expect(res.status).toBe(200)
        expect(res.headers.get('X-RateLimit-Limit')).toBe('5')
      }

      // 6th should be blocked
      const res = await app.request('/api/auth/login')
      expect(res.status).toBe(429)
    })

    it('applies different limits for /api/history route', async () => {
      const { rateLimiter } = await import('../rate-limiter.js')
      const { Hono } = await import('hono')

      const app = new Hono()
      app.use('/api/*', rateLimiter)
      app.get('/api/history', (c) => c.json({ ok: true }))

      // 10 requests should pass (RATE_LIMIT_HISTORY=10)
      for (let i = 0; i < 10; i++) {
        const res = await app.request('/api/history')
        expect(res.status).toBe(200)
      }

      // 11th should be blocked
      const res = await app.request('/api/history')
      expect(res.status).toBe(429)
    })
  })

  describe('rate limit headers', () => {
    it('sets X-RateLimit-Reset header', async () => {
      const { rateLimiter } = await import('../rate-limiter.js')
      const { Hono } = await import('hono')

      const app = new Hono()
      app.use('/api/test', rateLimiter)
      app.get('/api/test', (c) => c.json({ ok: true }))

      const res = await app.request('/api/test')

      const reset = res.headers.get('X-RateLimit-Reset')
      expect(reset).toBeTruthy()
      expect(Number(reset)).toBeGreaterThan(Math.floor(Date.now() / 1000))
    })

    it('tracks remaining requests correctly', async () => {
      // Force fresh module load with a custom limit
      vi.resetModules()
      process.env.RATE_LIMIT_AUTH = '5'
      process.env.RATE_LIMIT_SAVE = '3'
      process.env.RATE_LIMIT_HISTORY = '10'
      process.env.RATE_LIMIT_DEFAULT = '5'

      const { rateLimiter } = await import('../rate-limiter.js')
      const { Hono } = await import('hono')

      const app = new Hono()
      app.use('/api/test', rateLimiter)
      app.get('/api/test', (c) => c.json({ ok: true }))

      const res1 = await app.request('/api/test')
      expect(res1.headers.get('X-RateLimit-Remaining')).toBe('4')

      const res2 = await app.request('/api/test')
      expect(res2.headers.get('X-RateLimit-Remaining')).toBe('3')

      const res3 = await app.request('/api/test')
      expect(res3.headers.get('X-RateLimit-Remaining')).toBe('2')
    })
  })

  describe('/api/health bypass', () => {
    it('does not rate limit health check endpoint', async () => {
      const { rateLimiter } = await import('../rate-limiter.js')
      const { Hono } = await import('hono')

      const app = new Hono()
      app.use('/api/*', rateLimiter)
      app.get('/api/health', (c) => c.json({ status: 'ok' }))

      // Make many requests to health — none should be blocked
      for (let i = 0; i < 100; i++) {
        const res = await app.request('/api/health')
        expect(res.status).toBe(200)
        // Health endpoint should not set rate limit headers
        expect(res.headers.get('X-RateLimit-Limit')).toBeNull()
      }
    })
  })
})
