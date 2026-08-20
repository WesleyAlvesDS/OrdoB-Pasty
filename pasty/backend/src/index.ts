import 'dotenv/config'
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
  generateState,
  validateState,
} from './auth.js'
import {
  findUserByGoogleId,
  findUserById,
  createUser,
  updateUserTokens,
  findClipByHash,
  createClip,
  getClipsByUserId,
  createSession,
  invalidateSession,
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

// ─── Body Size Limit ────────────────────────────────────────────

app.use('/api/*', async (c, next) => {
  const contentLength = c.req.header('content-length')
  if (contentLength && parseInt(contentLength) > 1024 * 100) {
    return c.json({ error: 'Request body too large' }, 413)
  }
  await next()
})

// ─── Rate Limiting (antes de qualquer middleware externo) ──────

// Apply rate limiter to all API routes BEFORE ordobMiddleware
// para evitar chamadas externas desnecessárias em requests rate-limited
app.use('/api/*', rateLimiter)

// ─── OrdoB Auth Middleware ───────────────────────────────────────

// Apply OrdoB auth to all protected API routes (hybrid: OrdoB + Google OAuth)
app.use('/api/*', ordobMiddleware)

// ─── Health ────────────────────────────────────────────────────

app.get('/api/health', (c) => c.json({ status: 'ok', version: '1.0.0' }))

// ─── Stats (público — social proof) ──────────────────────────

app.get('/api/stats', async (c) => {
  try {
    const { countAllClips } = await import('./db.js')
    const totalSaves = await countAllClips()
    return c.json({
      totalSaves,
      totalUsers: null,
      generatedAt: new Date().toISOString(),
    })
  } catch (err) {
    console.error('Stats fetch failed:', err)
    return c.json({ totalSaves: 0, totalUsers: null }, 500)
  }
})

// ─── Auth Routes ───────────────────────────────────────────────

app.get('/api/auth/google/login', async (c) => {
  const state = await generateState()
  const authUrl = getGoogleAuthUrl(state)
  return c.json({ auth_url: authUrl, state })
})

app.post('/api/auth/callback', async (c) => {
  try {
    const { code, state } = await c.req.json<{ code: string; state?: string }>()
    if (!code || typeof code !== 'string') {
      return c.json({ error: 'Código de autorização é obrigatório' }, 400)
    }

    // Validate state (CSRF protection)
    if (!state || !(await validateState(state))) {
      console.error('CSRF: invalid or missing state parameter in OAuth callback')
      return c.json({ error: 'Parâmetro de segurança inválido. Tente novamente.' }, 400)
    }
    const tokens = await exchangeCodeForToken(code)
    const googleUser = await getUserInfo(tokens.access_token)

    const expiresAt = new Date(
      Date.now() + ((tokens.expires_in && tokens.expires_in > 0) ? tokens.expires_in : 3600) * 1000,
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
      user = await findUserById(user.id)
      if (!user) {
        return c.json({ error: 'Erro ao recarregar usuário após atualização' }, 500)
      }
    }

    const jwtToken = await createJwtToken(user.id, user.email)

    // Create server-side session
    const sessionExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    await createSession(jwtToken, user.id, sessionExpiry)

    return c.json({
      token: jwtToken,
      user: {
        id: user.id,
        google_id: user.google_id,
        email: user.email,
        name: user.name,
        avatar_url: user.avatar_url,
        created_at: user.created_at,
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

app.post('/api/auth/refresh', authMiddleware, async (c) => {
  const u = c.var.user
  const newToken = await createJwtToken(u.id, u.email)

  // Invalidate old session and create new one
  await invalidateSession(c.req.header('Authorization')?.slice(7) ?? '')
  const sessionExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  await createSession(newToken, u.id, sessionExpiry)

  return c.json({ token: newToken })
})

// ─── Session Check ─────────────────────────────────────

app.get('/api/auth/session', authMiddleware, (c) => {
  const u = c.var.user
  return c.json({
    authenticated: true,
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

// ─── Logout ────────────────────────────────────────────

app.post('/api/auth/logout', authMiddleware, async (c) => {
  const u = c.var.user
  const token = c.req.header('Authorization')?.slice(7) ?? ''
  await invalidateSession(token)
  return c.json({ message: 'Logged out successfully' })
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
    const isScopeError =
      message.includes('ACCESS_TOKEN_SCOPE_INSUFFICIENT') ||
      message.includes('insufficient authentication scopes')

    let status: 401 | 403 | 429 | 502 = 502
    if (isScopeError) {
      status = 403
      return c.json(
        {
          error: 'Permissão insuficiente no Google. Saia e entre novamente para reautorizar o acesso.',
          code: 'ACCESS_TOKEN_SCOPE_INSUFFICIENT',
        },
        status,
      )
    }
    // Gmail API desativada no projeto Google Cloud do Pasty — não é falha do
    // usuário. Retorna mensagem clara (403) em vez do JSON bruto do Google.
    const isGmailApiDisabled =
      message.includes('SERVICE_DISABLED') ||
      message.includes('gmail.googleapis.com') ||
      (message.includes('Gmail API has not been used') &&
        message.includes('accessNotConfigured'))
    if (isGmailApiDisabled) {
      status = 403
      return c.json(
        {
          error:
            'Não foi possível criar o rascunho no Gmail. A API do Gmail não está ativada no projeto Google Cloud do Pasty. Contate o suporte.',
          code: 'GMAIL_API_DISABLED',
        },
        status,
      )
    }
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
      Date.now() + ((newTokens.expires_in && newTokens.expires_in > 0) ? newTokens.expires_in : 3600) * 1000,
    ).toISOString()

    // Google CAN return a new refresh_token during refresh
    await updateUserTokens(
      user.id,
      newTokens.access_token,
      newTokens.refresh_token ?? null,
      expiresAt,
    )
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

  try {
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
  } catch (err) {
    console.error('History fetch failed:', err)
    return c.json({ error: 'Erro ao buscar histórico' }, 500)
  }
})

// ─── Start ─────────────────────────────────────────────────────

async function startWithDbRetry(maxRetries = 10, delayMs = 3000): Promise<void> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const { initDatabase } = await import('./db.js')
      await initDatabase()
      console.log('📦 Database initialized')
      return
    } catch (err) {
      console.error(`Failed to initialize database (attempt ${attempt}/${maxRetries}):`, err)
      if (attempt < maxRetries) {
        console.log(`Retrying in ${delayMs / 1000}s...`)
        await new Promise((resolve) => setTimeout(resolve, delayMs))
      } else {
        console.error('Max retries reached — starting without database')
      }
    }
  }
}

startWithDbRetry().then(() => {
  serve({
    fetch: app.fetch,
    port: config.port,
  })
  console.log(`🚀 Pasty API running on http://localhost:${config.port}`)
})
