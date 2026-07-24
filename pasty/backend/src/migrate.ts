#!/usr/bin/env node
/**
 * Script de migração: SQLite → PostgreSQL
 *
 * Uso:
 *   npx tsx src/migrate.ts
 *
 * Requer:
 *   - DATABASE_URL configurada no .env (PostgreSQL)
 *   - data.db existente (SQLite do sql.js ou better-sqlite3)
 */

import Database from 'better-sqlite3'
import pg from 'pg'
import path from 'path'
import fs from 'fs'
import { config } from './config.js'

async function migrate() {
  // ─── 1. Conecta no SQLite ────────────────────────────────
  const sqlitePath = path.resolve('./data.db')
  if (!fs.existsSync(sqlitePath)) {
    console.log('⚠️  SQLite database not found at', sqlitePath)
    console.log('   Nothing to migrate. Starting fresh with PostgreSQL.')
    return
  }

  console.log('📂 Opening SQLite database:', sqlitePath)
  const sqlite = new Database(sqlitePath)
  sqlite.pragma('journal_mode = WAL')

  // ─── 2. Conecta no PostgreSQL ────────────────────────────
  console.log('🗄️  Connecting to PostgreSQL:', config.databaseUrl.replace(/\/\/.*@/, '//***@'))
  const pgPool = new pg.Pool({ connectionString: config.databaseUrl })
  const client = await pgPool.connect()

  try {
    // ─── 3. Cria o schema (tabelas) se não existirem ──────
    console.log('📦 Creating database schema...')
    await client.query(`
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
    );

    // ─── Indexes (performance em escala) ────────────────────
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_clips_user_hash ON clips(user_id, content_hash);
      CREATE INDEX IF NOT EXISTS idx_clips_user_id ON clips(user_id);
      CREATE INDEX IF NOT EXISTS idx_clips_created ON clips(user_id, created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_clips_user_dest ON clips(user_id, destination);
      CREATE INDEX IF NOT EXISTS idx_clips_user_title ON clips(user_id, title);
      CREATE INDEX IF NOT EXISTS idx_users_google ON users(google_id);
    `)

    // ─── 4. Verifica se já existem dados no PostgreSQL ──────
    const userCount = await client.query('SELECT COUNT(*)::int as count FROM users')
    if (userCount.rows[0].count > 0) {
      console.log(`⚠️  PostgreSQL already has ${userCount.rows[0].count} users. Skipping migration.`)
      console.log('   Delete existing data first if you want to re-migrate.')
      return
    }

    // ─── 5. Migra usuários ─────────────────────────────────
    const users = sqlite.prepare('SELECT * FROM users').all() as any[]
    console.log(`👤 Migrating ${users.length} users...`)

    for (const user of users) {
      await client.query(
        `INSERT INTO users (id, google_id, email, name, avatar_url, access_token, refresh_token, token_expires_at, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (id) DO NOTHING`,
        [
          user.id,
          user.google_id,
          user.email,
          user.name,
          user.avatar_url,
          user.access_token,
          user.refresh_token,
          user.token_expires_at,
          user.created_at,
        ],
      )
    }

    // Reseta a sequência de IDs para o próximo valor disponível
    const maxUserId = users.length > 0 ? Math.max(...users.map((u: any) => u.id)) : 0
    await client.query(`ALTER SEQUENCE users_id_seq RESTART WITH ${maxUserId + 1}`)

    // ─── 6. Migra clips ────────────────────────────────────
    const clips = sqlite.prepare('SELECT * FROM clips').all() as any[]
    console.log(`📋 Migrating ${clips.length} clips...`)

    for (const clip of clips) {
      await client.query(
        `INSERT INTO clips (id, user_id, content_hash, title, destination, external_id, external_url, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (id) DO NOTHING`,
        [
          clip.id,
          clip.user_id,
          clip.content_hash,
          clip.title,
          clip.destination,
          clip.external_id,
          clip.external_url,
          clip.created_at,
        ],
      )
    }

    const maxClipId = clips.length > 0 ? Math.max(...clips.map((c: any) => c.id)) : 0
    await client.query(`ALTER SEQUENCE clips_id_seq RESTART WITH ${maxClipId + 1}`)

    console.log(`✅ Migration complete!`)
    console.log(`   ${users.length} users migrated`)
    console.log(`   ${clips.length} clips migrated`)
  } finally {
    client.release()
    sqlite.close()
    await pgPool.end()
  }
}

migrate().catch((err) => {
  console.error('❌ Migration failed:', err)
  process.exit(1)
})
