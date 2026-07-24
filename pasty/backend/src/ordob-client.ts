/**
 * OrdoB Client — Identificação opcional com OrdoB Core.
 *
 * O Pasty é uma ferramenta GRATUITA e não exige licenciamento.
 * O OrdoB auth é opcional — serve apenas para identificar o usuário
 * no ecossistema (log, analytics), nunca bloqueia o acesso.
 *
 * Fluxo real de auth no Pasty:
 * 1. Google OAuth (obrigatório — para acessar Google Docs/Drive/Gmail)
 * 2. OrdoB Auth (opcional — apenas para identificação no ecossistema)
 */

import { config } from './config.js'
import { createMiddleware } from 'hono/factory'
import type { Context } from 'hono'

// ─── In-memory cache with TTL ──────────────────────────────────

interface CacheEntry<T> {
  data: T
  expiry: number
}

const cache = new Map<string, CacheEntry<unknown>>()
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutos

function cacheGet<T>(key: string): T | null {
  const entry = cache.get(key) as CacheEntry<T> | undefined
  if (!entry) return null
  if (Date.now() > entry.expiry) {
    cache.delete(key)
    return null
  }
  return entry.data
}

function cacheSet<T>(key: string, data: T, ttlMs: number = CACHE_TTL_MS): void {
  cache.set(key, { data, expiry: Date.now() + ttlMs })
}

/** Hash rápido para chave de cache a partir do token completo */
function tokenCacheKey(token: string): string {
  let hash = 5381
  for (let i = 0; i < token.length; i++) {
    hash = ((hash << 5) + hash) + token.charCodeAt(i)
    hash = hash & hash // Converte para 32-bit integer
  }
  return `ordob_token_${Math.abs(hash).toString(36)}`
}

// Limpar cache expirado a cada 10 minutos
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of cache.entries()) {
    if (now > entry.expiry) cache.delete(key)
  }
}, 10 * 60 * 1000)

// ─── Types ─────────────────────────────────────────────────────

export interface OrdoBUser {
  id: number
  uuid: string
  name: string
  email: string
}

export interface OrdoBAuthResponse {
  authenticated: boolean
  user: OrdoBUser | null
}

export interface OrdoBVariables {
  ordobUser: OrdoBUser | null
  ordobToken: string | null
  ordobAuthenticated: boolean
}

/**
 * Validate an OrdoB Sanctum token and get user info.
 * Results are cached in-memory for 5 minutes (CACHE_TTL_MS).
 *
 * NOTA: Pasty não verifica licenças — é ferramenta gratuita.
 * Apenas identificamos o usuário OrdoB para analytics/log.
 */
export async function validateOrdoBToken(token: string): Promise<OrdoBAuthResponse> {
  const cacheKey = tokenCacheKey(token)
  const cached = cacheGet<OrdoBAuthResponse>(cacheKey)
  if (cached) return cached

  try {
    const res = await fetch(`${config.ordobApiUrl}/v1/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    })

    if (!res.ok) {
      const result: OrdoBAuthResponse = { authenticated: false, user: null }
      cacheSet(cacheKey, result)
      return result
    }

    const userData = (await res.json()).user

    const result: OrdoBAuthResponse = {
      authenticated: true,
      user: {
        id: userData.id,
        uuid: userData.uuid,
        name: userData.name,
        email: userData.email,
      },
    }

    cacheSet(cacheKey, result)
    return result
  } catch {
    const result: OrdoBAuthResponse = { authenticated: false, user: null }
    cacheSet(cacheKey, result, 30_000) // Cache errors for 30s only
    return result
  }
}

/**
 * OrdoB Hono middleware — identifica opcionalmente o usuário OrdoB.
 *
 * Este middleware NUNCA bloqueia o acesso. Apenas anexa dados
 * do usuário OrdoB ao contexto da requisição para logging/analytics.
 *
 * Pasty é uma ferramenta gratuita — não há verificação de licença.
 *
 * Usage:
 *   app.use('/api/*', ordobMiddleware)
 */
export const ordobMiddleware = createMiddleware<{ Variables: OrdoBVariables }>(
  async (c: Context, next) => {
    const authHeader = c.req.header('Authorization')

    if (!authHeader?.startsWith('Bearer ')) {
      c.set('ordobUser', null)
      c.set('ordobToken', null)
      c.set('ordobAuthenticated', false)
      await next()
      return
    }

    const token = authHeader.slice(7)
    const auth = await validateOrdoBToken(token)

    c.set('ordobUser', auth.user)
    c.set('ordobToken', auth.authenticated ? token : null)
    c.set('ordobAuthenticated', auth.authenticated)

    await next()
  },
)
