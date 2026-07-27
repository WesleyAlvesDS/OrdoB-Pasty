import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { serve } from '@hono/node-server'
import { config } from './config.js'
import { authMiddleware, createJwtToken, type Variables } from './middleware.js'
import { rateLimiter } from './rate-limiter.js'

export { createJwtToken }
import {
  getGoogleAuthUrl,
  exchangeCodeForToken,
  getUserInfo,
  refreshAccessToken,
} from './auth.js'
import {
  findUserByGoogleId,
  findUserById,
  createUser,
  updateUserTokens,
  findClipByHash,
  createClip,
  getClipsByUserId,
  type DbUser,
} from './db.js'
import { createGoogleDoc } from './services/docs.js'
import { createGoogleDriveFile } from './services/drive.js'
import { createGmailDraft } from './services/gmail.js'
import { ordobMiddleware, type OrdoBVariables } from './ordob-client.js'
import crypto from 'node:crypto'

// ─── App ───────────────────────────────────────────────────────

// Mescla os tipos de todas as variáveis que os middlewares podem definir
type AppVariables = Variables & OrdoBVariables

export const app = new Hono<{ Variables: AppVariables }>()

app.use('*', logger())

app.use(
  '*',
  cors({
    origin: [
      config.frontendUrl,
      'http://localhost:5173',
      'http://localhost:4173',
      // Produção — subdomínios do ecossistema OrdoB
      'https://pasty.ordob.com',
      'https://ordob.com',
      'https://www.ordob.com',
    ],
    credentials: true,
  }),
)

// ─── OrdoB Auth Middleware ───────────────────────────────────────

// Apply OrdoB auth to all protected API routes (hybrid: OrdoB + Google OAuth)
app.use('/api/*', ordobMiddleware)

// ─── Rate Limiting ───────────────────────────────────────────

// Apply rate limiter to all API routes
app.use('/api/*', rateLimiter)

// ─── Health ────────────────────────────────────────────────────

app.get('/api/health', (c) => c.json({ status: 'ok', version: '1.0.0' }))

// ─── Auth Routes ───────────────────────────────────────────────

app.get('/api/auth/google/login', (c) => {
  return c.json({ auth_url: getGoogleAuthUrl() })
})

app.post('/api/auth/callback', async (c) => {
  try {
    const { code } = await c.req.json<{ code: string }>()
    const tokens = await exchangeCodeForToken(code)
    const googleUser = await getUserInfo(tokens.access_token)

    const expiresAt = new Date(
      Date.now() + (tokens.expires_in ?? 3600) * 1000,
    ).toISOString()

    let user = await findUserByGoogleId(googleUser.id)

    if (!user) {
      user = await createUser({
        google_id: googleUser.id,
        email: googleUser.email,
        name: googleUser.name ?? null,
        avatar_url: googleUser.picture ?? null,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token ?? null,
        token_expires_at: expiresAt,
      })
    } else {
      await updateUserTokens(
        user.id,
        tokens.access_token,
        tokens.refresh_token ?? null,
        expiresAt,
      )
      user = await findUserById(user.id)!
    }

    const jwtToken = await createJwtToken(user!.id, user!.email)

    return c.json({
      token: jwtToken,
      user: {
        id: user!.id,
        google_id: user!.google_id,
        email: user!.email,
        name: user!.name,
        avatar_url: user!.avatar_url,
        created_at: user!.created_at,
      },
    })
  } catch (err) {
    console.error('Auth callback failed:', err)
    return c.json(
      { error: err instanceof Error ? err.message : 'Authentication failed' },
      400,
    )
  }
})

app.get('/api/auth/me', authMiddleware, (c) => {
  const u = c.var.user
  return c.json({
    user: {
      id: u.id,
      google_id: u.google_id,
      email: u.email,
      name: u.name,
      avatar_url: u.avatar_url,
      created_at: u.created_at,
    },
  })
})

// ─── Save Route (Pasty é gratuito — sem verificação de licença) ─

app.post('/api/save', authMiddleware, async (c) => {
  try {
    const u = c.var.user
    const ordobUser = c.get('ordobUser')
    
    // Log which OrdoB user is saving
    if (ordobUser) {
      console.log(`[OrdoB] Save by ${ordobUser.name} (${ordobUser.email})`)
    }
    
    const { text, destination, title = 'Untitled' } = await c.req.json<{
      text: string
      destination: string
      title?: string
    }>()

    const validDestinations = ['docs', 'drive', 'gmail']
    if (!validDestinations.includes(destination)) {
      return c.json(
        { error: `Invalid destination. Must be one of: ${validDestinations.join(', ')}` },
        400,
      )
    }

    if (!text?.trim()) {
      return c.json({ error: 'Text content cannot be empty' }, 400)
    }

    const googleToken = await getValidGoogleToken(u)

    const contentHash = crypto.createHash('sha256').update(text).digest('hex')
    const existingClip = await findClipByHash(u.id, contentHash, destination)

    if (existingClip) {
      return c.json({
        duplicate: true,
        message: 'This text was already saved to this destination',
        clip: existingClip,
      })
    }

    let result: Record<string, string | undefined>
    if (destination === 'docs') {
      result = await createGoogleDoc(googleToken, title, text)
    } else if (destination === 'drive') {
      result = await createGoogleDriveFile(googleToken, title, text)
    } else {
      result = await createGmailDraft(googleToken, u.email, title, text)
    }

    const clip = await createClip({
      user_id: u.id,
      content_hash: contentHash,
      title,
      destination,
      external_id: result.document_id ?? result.file_id ?? result.draft_id ?? null,
      external_url: result.url ?? null,
    })

    return c.json({
      duplicate: false,
      message: 'Content saved successfully!',
      clip,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to save text'
    console.error('Save failed:', message)

    const isTokenError =
      message.includes('token') ||
      message.includes('authenticate') ||
      message.includes('401')
    const isRateLimit =
      message.includes('429') ||
      message.includes('quota') ||
      message.includes('rate limit') ||
      message.includes('too many requests')

    let status: 401 | 429 | 502 = 502
    if (isTokenError) status = 401
    else if (isRateLimit) status = 429

    return c.json({ error: message }, status)
  }
})

async function getValidGoogleToken(user: DbUser): Promise<string> {
  if (!user.access_token) {
    throw new Error('No Google access token available. Please re-authenticate.')
  }

  if (user.token_expires_at && new Date() >= new Date(user.token_expires_at)) {
    if (!user.refresh_token) {
      throw new Error(
        'Google token expired and no refresh token available. Please re-authenticate.',
      )
    }

    const newTokens = await refreshAccessToken(user.refresh_token)
    const expiresAt = new Date(
      Date.now() + (newTokens.expires_in ?? 3600) * 1000,
    ).toISOString()

    await updateUserTokens(user.id, newTokens.access_token, null, expiresAt)
    user.access_token = newTokens.access_token
    user.token_expires_at = expiresAt
  }

  return user.access_token
}



// ─── History Route ─────────────────────────────────────────────

app.get('/api/history', authMiddleware, async (c) => {
  const u = c.var.user

  const cursor = c.req.query('cursor')
  const limit = c.req.query('limit')
  const destination = c.req.query('destination')
  const search = c.req.query('search')

  const result = await getClipsByUserId(u.id, {
    cursor: cursor ? (Number(cursor) || null) : null,
    limit: limit ? (Number(limit) || 20) : 20,
    destination: destination || null,
    search: search || null,
  })

  return c.json({
    clips: result.clips,
    nextCursor: result.nextCursor,
    total: result.total,
  })
})

// ─── Start ─────────────────────────────────────────────────────

// Initialize database before starting server
import('./db.js')
  .then(({ initDatabase }) => {
    initDatabase()
    console.log('📦 Database initialized')

    serve({
      fetch: app.fetch,
      port: config.port,
    })

    console.log(`🚀 Pasty API running on http://localhost:${config.port}`)
  })
  .catch((err) => {
    console.error('Failed to initialize database:', err)
    process.exit(1)
  })
