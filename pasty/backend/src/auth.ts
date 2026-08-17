import crypto from 'node:crypto'
import { config } from './config.js'
import { storeOAuthState, consumeOAuthState } from './db.js'

// ─── CSRF State Store (persistent via MySQL) ────────────

const STATE_TTL_MS = 10 * 60 * 1000 // 10 minutos

/** Generate a random state token for CSRF protection and store it. */
export async function generateState(): Promise<string> {
  const state = crypto.randomUUID()
  await storeOAuthState(state)
  return state
}

/** Validate that a state token exists and hasn't expired. */
export async function validateState(state: string): Promise<boolean> {
  const consumed = await consumeOAuthState(state)
  if (!consumed) return false
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
    // select_account: sem tela de consentimento em logins repetidos (refresh token já
    // fica persistido e é renovado automaticamente) → usuário volta a usar o app mais rápido.
    // NÃO usar 'consent', que força re-aprovação das permissões a cada login.
    prompt: 'select_account',
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
