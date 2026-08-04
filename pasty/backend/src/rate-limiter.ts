import { createMiddleware } from 'hono/factory'
import type { Context } from 'hono'
import { createRequire } from 'node:module'
import { RateLimiterMemory } from 'rate-limiter-flexible'
import { config } from './config.js'

// ─── ESM-compatible require for optional dependencies ────────

const require = createRequire(import.meta.url)

// ─── Route groups ─────────────────────────────────────────────

const enum RouteGroup {
  Auth = 'auth',
  Save = 'save',
  History = 'history',
  Default = 'default',
}

// ─── Redis client (lazy-loaded) ───────────────────────────────

let redisClient: import('ioredis').Redis | null | undefined = undefined

function getRedisClient(): import('ioredis').Redis | null {
  if (redisClient !== undefined) return redisClient

  if (!config.redisUrl) {
    redisClient = null
    return null
  }

  try {
    const Redis = require('ioredis') as typeof import('ioredis').default
    const client = new Redis(config.redisUrl, {
      enableOfflineQueue: false,
      maxRetriesPerRequest: 1,
      lazyConnect: true,
    })

    client.on('error', (err: Error) => {
      console.error('🔴 Redis error:', err.message)
    })

    client.on('connect', () => {
      console.log('🔴 Redis connected for rate limiting')
    })

    redisClient = client
    return client
  } catch (err) {
    console.warn('⚠️  Redis not available, using in-memory rate limiter:', (err as Error).message)
    redisClient = null
    return null
  }
}

// ─── Rate limiter factory ─────────────────────────────────────

function createLimiter(points: number, durationSec: number): RateLimiterMemory | ReturnType<typeof createRedisLimiter> {
  const client = getRedisClient()

  if (client) {
    return createRedisLimiter(client, points, durationSec)
  }

  return new RateLimiterMemory({ points, duration: durationSec })
}

function createRedisLimiter(
  client: import('ioredis').Redis,
  points: number,
  durationSec: number,
) {
  const { RateLimiterRedis } = require('rate-limiter-flexible') as typeof import('rate-limiter-flexible')
  return new RateLimiterRedis({
    storeClient: client,
    keyPrefix: 'pasty:rl:',
    points,
    duration: durationSec,
  })
}

// ─── Limiters ─────────────────────────────────────────────────

const limiters: Record<RouteGroup, RateLimiterMemory | ReturnType<typeof createRedisLimiter>> = {
  [RouteGroup.Auth]: createLimiter(config.rateLimitAuth, 60),
  [RouteGroup.Save]: createLimiter(config.rateLimitSave, 60),
  [RouteGroup.History]: createLimiter(config.rateLimitHistory, 60),
  [RouteGroup.Default]: createLimiter(config.rateLimitDefault, 60),
}

// ─── Helpers ──────────────────────────────────────────────────

/** Extract client IP from request headers or remote address. */
function getClientIp(c: Context): string {
  const forwarded = c.req.header('x-forwarded-for')
  if (forwarded) {
    const first = forwarded.split(',')[0].trim()
    if (first) return first
  }
  const realIp = c.req.header('x-real-ip')
  if (realIp) return realIp
  // Fallback: use direct connection IP from the socket
  try {
    const addr = (c as any).env?.server?.addr
    if (addr?.address) return addr.address
  } catch {}
  // Last resort: use a consistent identifier based on connection info
  return `unknown_${c.req.header('x-forwarded-for') ?? c.req.header('x-real-ip') ?? 'direct'}`
}

/** Resolve the route group for a given path. */
function resolveRouteGroup(path: string): RouteGroup | null {
  if (path === '/api/health' || path.startsWith('/api/health/')) return null
  if (path.startsWith('/api/auth/')) return RouteGroup.Auth
  if (path === '/api/save') return RouteGroup.Save
  if (path === '/api/history') return RouteGroup.History
  if (path.startsWith('/api/')) return RouteGroup.Default
  return null // non-API routes: no limit
}

/** Get the configured limit for a route group (used in response headers). */
function getLimitForGroup(group: RouteGroup): number {
  switch (group) {
    case RouteGroup.Auth: return config.rateLimitAuth
    case RouteGroup.Save: return config.rateLimitSave
    case RouteGroup.History: return config.rateLimitHistory
    case RouteGroup.Default: return config.rateLimitDefault
  }
}

// ─── Middleware ────────────────────────────────────────────────

/**
 * Rate limiting middleware for Hono.
 *
 * Uses `rate-limiter-flexible` with Redis (when available) for
 * distributed rate limiting across multiple instances. Falls back
 * to in-memory when Redis is not configured.
 *
 * Features:
 * - Per-IP tracking via X-Forwarded-For or X-Real-IP
 * - Different limits for auth, save, history, and default routes
 * - Redis-backed for multi-instance deployments
 * - Graceful fallback to in-memory when Redis is unavailable
 * - Standard rate limit headers (X-RateLimit-* and Retry-After)
 * - 429 response with retryAfter info when limit is exceeded
 */
export const rateLimiter = createMiddleware(async (c, next) => {
  const path = c.req.path
  const group = resolveRouteGroup(path)

  // Health check and non-API routes pass through without rate limiting
  if (group === null) {
    await next()
    return
  }

  const ip = getClientIp(c)
  // Composite key: separate counters per IP per route group
  const key = `${ip}:${group}`
  const limiter = limiters[group]!

  try {
    const result = await limiter.consume(key, 1) as { remainingPoints: number; msBeforeNext: number }

    const groupLimit = getLimitForGroup(group)
    c.header('X-RateLimit-Limit', String(groupLimit))
    c.header('X-RateLimit-Remaining', String(Math.max(0, result.remainingPoints)))
    c.header('X-RateLimit-Reset', String(Math.ceil((Date.now() + result.msBeforeNext) / 1000)))

    await next()
  } catch (rej) {
    const rejRes = rej as { msBeforeNext: number }
    const groupLimit = getLimitForGroup(group)
    const retryAfter = Math.ceil(rejRes.msBeforeNext / 1000)

    c.header('Retry-After', String(retryAfter))
    c.header('X-RateLimit-Limit', String(groupLimit))
    c.header('X-RateLimit-Remaining', '0')
    c.header('X-RateLimit-Reset', String(Math.ceil((Date.now() + rejRes.msBeforeNext) / 1000)))
    c.status(429)

    return c.json({
      error: 'Too many requests. Please try again later.',
      retryAfter,
    })
  }
})
