import crypto from 'node:crypto'
import { config } from './config.js'

// ─── CSRF State Store (in-memory com expiração) ────────────

interface StoredState {
  state: string
  expiresAt: number
}

const stateStore = new Map<string, StoredState>()
const STATE_TTL_MS = 10 * 60 * 1000 // 10 minutos

// Limpeza periódica de states expirados
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of stateStore) {
    if (value.expiresAt <= now) stateStore.delete(key)
  }
}, 60_000)

/** Generate a random state token for CSRF protection and store it. */
export function generateState(): string {
  const state = crypto.randomUUID()
  stateStore.set(state, { state, expiresAt: Date.now() + STATE_TTL_MS })
  return state
}

/** Validate that a state token exists and hasn't expired. */
export function validateState(state: string): boolean {
  const stored = stateStore.get(state)
  if (!stored) return false
  if (stored.expiresAt <= Date.now()) {
    stateStore.delete(state)
    return false
  }
  stateStore.delete(state) // Consume (one-time use)
  return true
}

/** Build the Google OAuth authorization URL with CSRF state. */
export function getGoogleAuthUrl(state?: string): string {
  const params = new URLSearchParams({
    client_id: config.googleClientId,
    redirect_uri: config.googleRedirectUri,
    response_type: 'code',
    scope: config.scopes.join(' '),
    access_type: 'offline',
    prompt: 'consent',
  })

  if (state) {
    params.set('state', state)
  }

  return `${config.googleAuthUri}?${params.toString()}`
}

interface GoogleTokens {
  access_token: string
  refresh_token?: string
  expires_in: number
}

/** Exchange an authorization code for tokens. */
export async function exchangeCodeForToken(code: string): Promise<GoogleTokens> {
  const resp = await fetch(config.googleTokenUri, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
    body: new URLSearchParams({
      code,
      client_id: config.googleClientId,
      client_secret: config.googleClientSecret,
      redirect_uri: config.googleRedirectUri,
      grant_type: 'authorization_code',
    }),
  })
  if (!resp.ok) {
    const err = await resp.text()
    throw new Error(`Token exchange failed: ${err}`)
  }
  return resp.json() as Promise<GoogleTokens>
}

interface GoogleUser {
  id: string
  email: string
  name?: string
  picture?: string
}

/** Fetch user profile from Google. */
export async function getUserInfo(accessToken: string): Promise<GoogleUser> {
  const resp = await fetch(config.googleUserInfoUri, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!resp.ok) {
    const err = await resp.text()
    throw new Error(`User info failed: ${err}`)
  }
  return resp.json() as Promise<GoogleUser>
}

/** Refresh an expired Google access token. */
export async function refreshAccessToken(refreshToken: string): Promise<GoogleTokens> {
  const resp = await fetch(config.googleTokenUri, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
    body: new URLSearchParams({
      client_id: config.googleClientId,
      client_secret: config.googleClientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  })
  if (!resp.ok) {
    const err = await resp.text()
    throw new Error(`Token refresh failed: ${err}`)
  }
  return resp.json() as Promise<GoogleTokens>
}
