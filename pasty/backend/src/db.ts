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

export interface DbOAuthState {
  state: string
  created_at: string
}

export interface DbSession {
  token: string
  user_id: number
  expires_at: string
  created_at: string
  active: boolean
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

  // ─── Indexes (MySQL não suporta "IF NOT EXISTS"; ignora erro de índice já existente) ──
  const indexQueries = [
    'CREATE INDEX idx_clips_user_hash ON clips(user_id, content_hash)',
    'CREATE INDEX idx_clips_user_id ON clips(user_id)',
    'CREATE INDEX idx_clips_created ON clips(user_id, created_at DESC)',
    'CREATE INDEX idx_clips_user_dest ON clips(user_id, destination)',
    'CREATE INDEX idx_clips_user_title ON clips(user_id, title)',
    'CREATE INDEX idx_users_google ON users(google_id)',
  ]
  for (const sql of indexQueries) {
    try {
      await pool.query(sql)
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code
      // 1061 = duplicate key name; 1062 = duplicate entry. Demais erros são reais → relaunch.
      if (code !== 'ER_DUP_KEYNAME' && code !== 'ER_DUP_ENTRY') {
        throw err
      }
    }
  }

  // OAuth states table
  await pool.query(`CREATE TABLE IF NOT EXISTS oauth_states (
    state VARCHAR(36) PRIMARY KEY,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`)

  // Cleanup expired states older than 1 hour
  await pool.query('DELETE FROM oauth_states WHERE created_at < DATE_SUB(NOW(), INTERVAL 1 HOUR)')

  // Sessions table
  await pool.query(`CREATE TABLE IF NOT EXISTS sessions (
    token VARCHAR(255) PRIMARY KEY,
    user_id INT NOT NULL,
    expires_at DATETIME NOT NULL,
    active TINYINT(1) NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`)

  // Cleanup expired sessions
  await pool.query('DELETE FROM sessions WHERE expires_at < NOW() OR active = 0')

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


// ─── OAuth State Queries ──────────────────────────────

export async function storeOAuthState(state: string): Promise<void> {
  await pool.query(
    'INSERT INTO oauth_states (state) VALUES (?)',
    [state],
  )
}

export async function consumeOAuthState(state: string): Promise<boolean> {
  const [rows] = await pool.query<mysql.RowDataPacket[]>(
    'SELECT state FROM oauth_states WHERE state = ?',
    [state],
  )
  if (rows.length === 0) return false
  await pool.query('DELETE FROM oauth_states WHERE state = ?', [state])
  return true
}

// ─── Session Queries ──────────────────────────────────

export async function createSession(token: string, userId: number, expiresAt: string): Promise<void> {
  await pool.query(
    'INSERT INTO sessions (token, user_id, expires_at, active) VALUES (?, ?, ?, 1)',
    [token, userId, expiresAt],
  )
}

export async function findSession(token: string): Promise<DbSession | undefined> {
  const [rows] = await pool.query<mysql.RowDataPacket[]>(
    'SELECT * FROM sessions WHERE token = ? AND active = 1',
    [token],
  )
  if (rows.length === 0) return undefined
  const row = rows[0] as Record<string, unknown>
  if (new Date(row.expires_at as string) <= new Date()) {
    await pool.query('UPDATE sessions SET active = 0 WHERE token = ?', [token])
    return undefined
  }
  return {
    token: row.token as string,
    user_id: row.user_id as number,
    expires_at: row.expires_at as string,
    created_at: row.created_at as string,
    active: true,
  }
}

export async function invalidateSession(token: string): Promise<void> {
  await pool.query('UPDATE sessions SET active = 0 WHERE token = ?', [token])
}

export async function invalidateAllUserSessions(userId: number): Promise<void> {
  await pool.query('UPDATE sessions SET active = 0 WHERE user_id = ?', [userId])
}
