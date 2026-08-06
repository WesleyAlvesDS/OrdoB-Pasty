import { createMiddleware } from 'hono/factory'
import { sign, verify } from 'hono/jwt'
import type { Context } from 'hono'
import { config } from './config.js'
import { findSession, findUserById, type DbUser } from './db.js'

// ─── Types ────────────────────────────────────────────────────

export type Variables = {
  user: DbUser
}

// ─── Helpers ──────────────────────────────────────────────────

export function createJwtToken(userId: number, email: string): Promise<string> {
  const payload = {
    sub: String(userId),
    email,
    iss: 'pasty-api',
    aud: 'pasty-frontend',
    exp: Math.floor(Date.now() / 1000) + config.jwtExpiryHours * 3600,
    iat: Math.floor(Date.now() / 1000),
  }
  return sign(payload, config.jwtSecret)
}

// ─── Middleware ────────────────────────────────────────────────

/** Middleware that validates the JWT from Authorization header and sets c.var.user. */
export const authMiddleware = createMiddleware<{ Variables: Variables }>(
  async (c: Context, next) => {
    const authHeader = c.req.header('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return c.json({ error: 'Invalid or expired token' }, 401)
    }

    const token = authHeader.slice(7)
    try {
      const payload = (await verify(token, config.jwtSecret, 'HS256')) as {
        sub: string; email: string; aud?: string
      }
      // Verify audience
      if (payload.aud && payload.aud !== 'pasty-frontend') {
        return c.json({ error: 'Invalid token audience' }, 401)
      }
      // Verify an active server-side session exists (permite revogação no logout/refresh)
      const session = await findSession(token)
      if (!session) {
        return c.json({ error: 'Invalid or expired token' }, 401)
      }
      const user = await findUserById(Number(payload.sub))
      if (!user) {
        return c.json({ error: 'User not found' }, 401)
      }
      c.set('user', user)
      await next()
    } catch {
      return c.json({ error: 'Invalid or expired token' }, 401)
    }
  },
)
