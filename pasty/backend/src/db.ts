import mysql from 'mysql2/promise'
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

// ─── Database (MySQL via mysql2) ───────────────────────────────

let pool: mysql.Pool

export function getPool(): mysql.Pool {
  return pool
}

function rowToUser(row: Record<string, unknown>): DbUser {
  return {
    id: row.id as number,
    google_id: row.google_id as string,
    email: row.email as string,
    name: row.name as string | null,
    avatar_url: row.avatar_url as string | null,
    access_token: row.access_token as string | null,
    refresh_token: row.refresh_token as string | null,
    token_expires_at: row.token_expires_at as string | null,
    created_at: row.created_at as string,
  }
}

function rowToClip(row: Record<string, unknown>): DbClip {
  return {
    id: row.id as number,
    user_id: row.user_id as number,
    content_hash: row.content_hash as string,
    title: row.title as string | null,
    destination: row.destination as string,
    external_id: row.external_id as string | null,
    external_url: row.external_url as string | null,
    created_at: row.created_at as string,
  }
}

/** Initialize the MySQL connection pool and create tables if needed. */
export async function initDatabase(): Promise<void> {
  pool = mysql.createPool(config.db)

  // Test connection
  const conn = await pool.getConnection()
  try {
    await conn.ping()
    console.log('🗄️  MySQL connected')
  } finally {
    conn.release()
  }

  // ─── Schema ──────────────────────────────────────────────
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      google_id VARCHAR(255) UNIQUE NOT NULL,
      email VARCHAR(255) NOT NULL,
      name VARCHAR(255),
      avatar_url TEXT,
      access_token TEXT,
      refresh_token TEXT,
      token_expires_at DATETIME,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS clips (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      content_hash VARCHAR(64) NOT NULL,
      title VARCHAR(255),
      destination VARCHAR(50) NOT NULL,
      external_id VARCHAR(255),
      external_url TEXT,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `)

  // ─── Indexes ─────────────────────────────────────────────
  await pool.query('CREATE INDEX IF NOT EXISTS idx_clips_user_hash ON clips(user_id, content_hash)')
  await pool.query('CREATE INDEX IF NOT EXISTS idx_clips_user_id ON clips(user_id)')
  await pool.query('CREATE INDEX IF NOT EXISTS idx_clips_created ON clips(user_id, created_at DESC)')
  await pool.query('CREATE INDEX IF NOT EXISTS idx_clips_user_dest ON clips(user_id, destination)')
  await pool.query('CREATE INDEX IF NOT EXISTS idx_clips_user_title ON clips(user_id, title)')
  await pool.query('CREATE INDEX IF NOT EXISTS idx_users_google ON users(google_id)')

  console.log('📊 MySQL schema ready')
}

// ─── User Queries ─────────────────────────────────────────────

export async function findUserByGoogleId(googleId: string): Promise<DbUser | undefined> {
  const [rows] = await pool.query<mysql.RowDataPacket[]>(
    'SELECT * FROM users WHERE google_id = ?',
    [googleId],
  )
  return rows.length > 0 ? rowToUser(rows[0] as Record<string, unknown>) : undefined
}

export async function findUserById(id: number): Promise<DbUser | undefined> {
  const [rows] = await pool.query<mysql.RowDataPacket[]>(
    'SELECT * FROM users WHERE id = ?',
    [id],
  )
  return rows.length > 0 ? rowToUser(rows[0] as Record<string, unknown>) : undefined
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
  const [result] = await pool.query<mysql.ResultSetHeader>(
    `INSERT INTO users (google_id, email, name, avatar_url, access_token, refresh_token, token_expires_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
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
  const created = await findUserById(result.insertId)
  if (!created) throw new Error('Falha ao criar usuário — registro não encontrado após insert')
  return created
}

export async function updateUserTokens(
  userId: number,
  accessToken: string,
  refreshToken: string | null,
  expiresAt: string | null,
): Promise<void> {
  await pool.query(
    `UPDATE users SET access_token = ?, refresh_token = COALESCE(?, refresh_token), token_expires_at = ? WHERE id = ?`,
    [accessToken, refreshToken, expiresAt, userId],
  )
}

// ─── Clip Queries ─────────────────────────────────────────────

export async function findClipByHash(
  userId: number,
  contentHash: string,
  destination: string,
): Promise<DbClip | undefined> {
  const [rows] = await pool.query<mysql.RowDataPacket[]>(
    'SELECT * FROM clips WHERE user_id = ? AND content_hash = ? AND destination = ?',
    [userId, contentHash, destination],
  )
  return rows.length > 0 ? rowToClip(rows[0] as Record<string, unknown>) : undefined
}

export async function createClip(clip: {
  user_id: number
  content_hash: string
  title: string | null
  destination: string
  external_id: string | null
  external_url: string | null
}): Promise<DbClip> {
  const [result] = await pool.query<mysql.ResultSetHeader>(
    `INSERT INTO clips (user_id, content_hash, title, destination, external_id, external_url)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      clip.user_id,
      clip.content_hash,
      clip.title,
      clip.destination,
      clip.external_id,
      clip.external_url,
    ],
  )
  const created = await pool.query<mysql.RowDataPacket[]>(
    'SELECT * FROM clips WHERE id = ?',
    [result.insertId],
  )
  const rows = created[0]
  if (rows.length === 0) throw new Error('Falha ao criar clip — registro não encontrado após insert')
  return rowToClip(rows[0] as Record<string, unknown>)
}

/**
 * Busca o histórico do usuário com paginação por cursor e filtros.
 *
 * Paginação por cursor (WHERE id < ?cursor) é O(log n) vs OFFSET que é O(n),
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

  const conditions: string[] = ['user_id = ?']
  const params: unknown[] = [userId]

  if (cursor) {
    conditions.push('id < ?')
    params.push(cursor)
  }

  if (destination) {
    conditions.push('destination = ?')
    params.push(destination)
  }

  if (search) {
    conditions.push('title LIKE ?')
    params.push(`%${search}%`)
  }

  const whereClause = conditions.join(' AND ')

  // Busca clips (+1 para detectar próxima página)
  const [rows] = await pool.query<mysql.RowDataPacket[]>(
    `SELECT * FROM clips WHERE ${whereClause} ORDER BY created_at DESC, id DESC LIMIT ?`,
    [...params, clampedLimit + 1],
  )

  const clips = rows.map((r) => rowToClip(r as Record<string, unknown>))

  const hasMore = clips.length > clampedLimit
  if (hasMore) clips.pop()

  // Total de registros do usuário
  const [countRows] = await pool.query<mysql.RowDataPacket[]>(
    'SELECT COUNT(*) as count FROM clips WHERE user_id = ?',
    [userId],
  )

  return {
    clips,
    nextCursor: clips.length > 0 ? clips[clips.length - 1].id : null,
    total: (countRows[0] as Record<string, unknown>).count as number,
  }
}
