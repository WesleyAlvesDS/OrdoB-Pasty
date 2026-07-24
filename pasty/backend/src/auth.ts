import { config } from './config.js'

/** Build the Google OAuth authorization URL. */
export function getGoogleAuthUrl(): string {
  const params = new URLSearchParams({
    client_id: config.googleClientId,
    redirect_uri: config.googleRedirectUri,
    response_type: 'code',
    scope: config.scopes.join(' '),
    access_type: 'offline',
    prompt: 'consent',
  })
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
