import { Pool } from 'pg'
import { config } from './config.js'

// ─── Types ────────────────────────────────────────────────────

export interface DbUser {
  id: number
  google_id: string
  email: string
  name: string | null
  avatar_url: string | null
  access_token: string | null
  refresh_token: string | null
  token_expires_at: string | null
  created_at: string
}

export interface DbClip {
  id: number
  user_id: number
  content_hash: string
  title: string | null
  destination: string
  external_id: string | null
  external_url: string | null
  created_at: string
}

/** Paginated history result */
export interface PaginatedClips {
  clips: DbClip[]
  nextCursor: number | null
  total: number
}

// ─── Pool (conexão gerenciada com PostgreSQL) ─────────────────

let pool: Pool

export function getPool(): Pool {
  return pool
}

/** Initialize the PostgreSQL connection pool and create tables if needed. */
export async function initDatabase(): Promise<void> {
  pool = new Pool({
    connectionString: config.databaseUrl,
    max: 20,                          // máximo de conexões simultâneas
    idleTimeoutMillis: 30000,          // fecha conexões ociosas após 30s
    connectionTimeoutMillis: 5000,     // timeout de conexão de 5s
  })

  // Testa a conexão
  const client = await pool.connect()
  try {
    await client.query('SELECT 1')
    console.log('🗄️  PostgreSQL connected')
  } finally {
    client.release()
  }

  // ─── Schema ──────────────────────────────────────────────
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      google_id TEXT UNIQUE NOT NULL,
      email TEXT NOT NULL,
      name TEXT,
      avatar_url TEXT,
      access_token TEXT,
      refresh_token TEXT,
      token_expires_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS clips (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      content_hash TEXT NOT NULL,
      title TEXT,
      destination TEXT NOT NULL,
      external_id TEXT,
      external_url TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `)

  // ─── Indexes ─────────────────────────────────────────────
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_clips_user_hash ON clips(user_id, content_hash);
    CREATE INDEX IF NOT EXISTS idx_clips_user_id ON clips(user_id);
    CREATE INDEX IF NOT EXISTS idx_clips_created ON clips(user_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_clips_user_dest ON clips(user_id, destination);
    CREATE INDEX IF NOT EXISTS idx_clips_user_title ON clips(user_id, title);
    CREATE INDEX IF NOT EXISTS idx_users_google ON users(google_id);
  `)

  console.log('📊 PostgreSQL schema ready')
}

// ─── Helpers ──────────────────────────────────────────────────

function rowToNulls(row: Record<string, unknown> | undefined): Record<string, unknown> | undefined {
  if (!row) return undefined
  return Object.fromEntries(
    Object.entries(row).map(([k, v]) => [k, v ?? null]),
  )
}

async function firstRow<T>(sql: string, params: unknown[] = []): Promise<T | undefined> {
  const result = await pool.query(sql, params)
  const row = result.rows[0] as Record<string, unknown> | undefined
  return rowToNulls(row) as unknown as T | undefined
}

async function allRows<T>(sql: string, params: unknown[] = []): Promise<T[]> {
  const result = await pool.query(sql, params)
  return result.rows.map((row: Record<string, unknown>) => rowToNulls(row) as unknown as T)
}

// ─── User Queries ─────────────────────────────────────────────

export async function findUserByGoogleId(googleId: string): Promise<DbUser | undefined> {
  return firstRow<DbUser>('SELECT * FROM users WHERE google_id = $1', [googleId])
}

export async function findUserById(id: number): Promise<DbUser | undefined> {
  return firstRow<DbUser>('SELECT * FROM users WHERE id = $1', [id])
}

export async function createUser(user: {
  google_id: string
  email: string
  name: string | null
  avatar_url: string | null
  access_token: string | null
  refresh_token: string | null
  token_expires_at: string | null
}): Promise<DbUser> {
  const result = await pool.query(
    `INSERT INTO users (google_id, email, name, avatar_url, access_token, refresh_token, token_expires_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      user.google_id,
      user.email,
      user.name,
      user.avatar_url,
      user.access_token,
      user.refresh_token,
      user.token_expires_at,
    ],
  )
  return rowToNulls(result.rows[0]) as unknown as DbUser
}

export async function updateUserTokens(
  userId: number,
  accessToken: string,
  refreshToken: string | null,
  expiresAt: string | null,
): Promise<void> {
  await pool.query(
    `UPDATE users SET access_token = $1, refresh_token = COALESCE($2, refresh_token), token_expires_at = $3 WHERE id = $4`,
    [accessToken, refreshToken, expiresAt, userId],
  )
}

// ─── Clip Queries ─────────────────────────────────────────────

export async function findClipByHash(
  userId: number,
  contentHash: string,
  destination: string,
): Promise<DbClip | undefined> {
  return firstRow<DbClip>(
    'SELECT * FROM clips WHERE user_id = $1 AND content_hash = $2 AND destination = $3',
    [userId, contentHash, destination],
  )
}

export async function createClip(clip: {
  user_id: number
  content_hash: string
  title: string | null
  destination: string
  external_id: string | null
  external_url: string | null
}): Promise<DbClip> {
  const result = await pool.query(
    `INSERT INTO clips (user_id, content_hash, title, destination, external_id, external_url)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [
      clip.user_id,
      clip.content_hash,
      clip.title,
      clip.destination,
      clip.external_id,
      clip.external_url,
    ],
  )
  return rowToNulls(result.rows[0]) as unknown as DbClip
}

/**
 * Busca o histórico do usuário com paginação por cursor e filtros.
 *
 * Paginação por cursor (WHERE id < $cursor) é O(log n) vs OFFSET que é O(n),
 * essencial para performance com milhões de registros.
 */
export async function getClipsByUserId(
  userId: number,
  options: {
    cursor?: number | null
    limit?: number
    destination?: string | null
    search?: string | null
  } = {},
): Promise<PaginatedClips> {
  const { cursor, limit = 20, destination, search } = options
  const clampedLimit = Math.min(Math.max(1, limit), 100)

  const conditions: string[] = ['user_id = $1']
  const params: unknown[] = [userId]
  let paramIndex = 2

  if (cursor) {
    conditions.push(`id < $${paramIndex++}`)
    params.push(cursor)
  }

  if (destination) {
    conditions.push(`destination = $${paramIndex++}`)
    params.push(destination)
  }

  if (search) {
    conditions.push(`title ILIKE $${paramIndex++}`)
    params.push(`%${search}%`)
  }

  const whereClause = conditions.join(' AND ')

  // Busca clips (+1 para detectar próxima página)
  const clipsResult = await pool.query(
    `SELECT * FROM clips WHERE ${whereClause} ORDER BY created_at DESC, id DESC LIMIT $${paramIndex}`,
    [...params, clampedLimit + 1],
  )
  const clips = clipsResult.rows.map((r: Record<string, unknown>) => rowToNulls(r) as unknown as DbClip)

  const hasMore = clips.length > clampedLimit
  if (hasMore) clips.pop()

  // Total de registros do usuário
  const totalResult = await pool.query(
    'SELECT COUNT(*)::int as count FROM clips WHERE user_id = $1',
    [userId],
  )

  return {
    clips,
    nextCursor: clips.length > 0 ? clips[clips.length - 1].id : null,
    total: (totalResult.rows[0] as { count: number }).count,
  }
}
