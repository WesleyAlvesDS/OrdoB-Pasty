import initSqlJs, { type Database } from 'sql.js'
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { dirname } from 'node:path'
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

// ─── Database (SQLite via sql.js) ─────────────────────────────

let db: Database
let dbPath: string

export function getDb(): Database {
  return db
}

function saveDb(): void {
  const data = db.export()
  const buffer = Buffer.from(data)
  writeFileSync(dbPath, buffer)
}

function queryOne<T>(sql: string, params: unknown[] = []): T | undefined {
  const stmt = db.prepare(sql)
  stmt.bind(params)
  if (stmt.step()) {
    const row = stmt.getAsObject() as Record<string, unknown>
    stmt.free()
    return row as unknown as T
  }
  stmt.free()
  return undefined
}

function queryAll<T>(sql: string, params: unknown[] = []): T[] {
  const stmt = db.prepare(sql)
  stmt.bind(params)
  const rows: T[] = []
  while (stmt.step()) {
    rows.push(stmt.getAsObject() as unknown as T)
  }
  stmt.free()
  return rows
}

/** Initialize the SQLite database and create tables if needed. */
export async function initDatabase(): Promise<void> {
  const SQL = await initSqlJs()
  dbPath = config.databasePath
  mkdirSync(dirname(dbPath), { recursive: true })

  if (existsSync(dbPath)) {
    const fileBuffer = readFileSync(dbPath)
    db = new SQL.Database(fileBuffer)
  } else {
    db = new SQL.Database()
  }

  db.run('PRAGMA journal_mode = WAL')
  db.run('PRAGMA foreign_keys = ON')

  // ─── Schema ──────────────────────────────────────────────
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      google_id TEXT UNIQUE NOT NULL,
      email TEXT NOT NULL,
      name TEXT,
      avatar_url TEXT,
      access_token TEXT,
      refresh_token TEXT,
      token_expires_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `)
  db.run(`
    CREATE TABLE IF NOT EXISTS clips (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      content_hash TEXT NOT NULL,
      title TEXT,
      destination TEXT NOT NULL,
      external_id TEXT,
      external_url TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `)

  // ─── Indexes ─────────────────────────────────────────────
  db.run('CREATE INDEX IF NOT EXISTS idx_clips_user_hash ON clips(user_id, content_hash)')
  db.run('CREATE INDEX IF NOT EXISTS idx_clips_user_id ON clips(user_id)')
  db.run('CREATE INDEX IF NOT EXISTS idx_clips_created ON clips(user_id, created_at DESC)')
  db.run('CREATE INDEX IF NOT EXISTS idx_clips_user_dest ON clips(user_id, destination)')
  db.run('CREATE INDEX IF NOT EXISTS idx_clips_user_title ON clips(user_id, title)')
  db.run('CREATE INDEX IF NOT EXISTS idx_users_google ON users(google_id)')

  saveDb()
  console.log('🗄️  SQLite connected')
  console.log('📊 SQLite schema ready')
}

// ─── User Queries ─────────────────────────────────────────────

export function findUserByGoogleId(googleId: string): DbUser | undefined {
  return queryOne<DbUser>('SELECT * FROM users WHERE google_id = ?', [googleId])
}

export function findUserById(id: number): DbUser | undefined {
  return queryOne<DbUser>('SELECT * FROM users WHERE id = ?', [id])
}

export function createUser(user: {
  google_id: string
  email: string
  name: string | null
  avatar_url: string | null
  access_token: string | null
  refresh_token: string | null
  token_expires_at: string | null
}): DbUser {
  db.run(
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
  const id = db.exec('SELECT last_insert_rowid() as id')[0]?.values[0][0] as number
  saveDb()
  return findUserById(id)!
}

export function updateUserTokens(
  userId: number,
  accessToken: string,
  refreshToken: string | null,
  expiresAt: string | null,
): void {
  db.run(
    `UPDATE users SET access_token = ?, refresh_token = COALESCE(?, refresh_token), token_expires_at = ? WHERE id = ?`,
    [accessToken, refreshToken, expiresAt, userId],
  )
  saveDb()
}

// ─── Clip Queries ─────────────────────────────────────────────

export function findClipByHash(
  userId: number,
  contentHash: string,
  destination: string,
): DbClip | undefined {
  return queryOne<DbClip>(
    'SELECT * FROM clips WHERE user_id = ? AND content_hash = ? AND destination = ?',
    [userId, contentHash, destination],
  )
}

export function createClip(clip: {
  user_id: number
  content_hash: string
  title: string | null
  destination: string
  external_id: string | null
  external_url: string | null
}): DbClip {
  db.run(
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
  const id = db.exec('SELECT last_insert_rowid() as id')[0]?.values[0][0] as number
  saveDb()
  return queryOne<DbClip>('SELECT * FROM clips WHERE id = ?', [id])!
}

/**
 * Busca o histórico do usuário com paginação por cursor e filtros.
 *
 * Paginação por cursor (WHERE id < ?cursor) é O(log n) vs OFFSET que é O(n),
 * essencial para performance com milhões de registros.
 */
export function getClipsByUserId(
  userId: number,
  options: {
    cursor?: number | null
    limit?: number
    destination?: string | null
    search?: string | null
  } = {},
): PaginatedClips {
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
  const clips = queryAll<DbClip>(
    `SELECT * FROM clips WHERE ${whereClause} ORDER BY created_at DESC, id DESC LIMIT ?`,
    [...params, clampedLimit + 1],
  )

  const hasMore = clips.length > clampedLimit
  if (hasMore) clips.pop()

  // Total de registros do usuário
  const totalRow = queryOne<{ count: number }>(
    'SELECT COUNT(*) as count FROM clips WHERE user_id = ?',
    [userId],
  )

  return {
    clips,
    nextCursor: clips.length > 0 ? clips[clips.length - 1].id : null,
    total: totalRow?.count ?? 0,
  }
}
