# 🗄️ Skill: Migração SQLite → PostgreSQL

> Padrão de migração de dados entre bancos aprendido no Pasty.

---

## Script de Migração (migrate.ts)

### Estrutura
```typescript
1. Conecta no SQLite (better-sqlite3)
2. Conecta no PostgreSQL (pg)
3. Cria schema (tabelas + índices)
4. Verifica se PostgreSQL já tem dados
5. Migra usuários
6. Reseta sequência users_id_seq
7. Migra clips
8. Reseta sequência clips_id_seq
```

### Criação de Schema
```sql
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

-- Índices de performance
CREATE INDEX IF NOT EXISTS idx_users_google ON users(google_id);
CREATE INDEX IF NOT EXISTS idx_clips_user_hash ON clips(user_id, content_hash);
CREATE INDEX IF NOT EXISTS idx_clips_created ON clips(user_id, created_at DESC);
```

### Migração com ON CONFLICT
```typescript
await client.query(
  `INSERT INTO users (id, google_id, email, ...)
   VALUES ($1, $2, $3, ...)
   ON CONFLICT (id) DO NOTHING`,  // ← Evita duplicatas na remigração
  [user.id, user.google_id, user.email, ...]
)
```

### Reset de Sequência
```typescript
const maxId = users.length > 0 ? Math.max(...users.map(u => u.id)) : 0
await client.query(`ALTER SEQUENCE users_id_seq RESTART WITH ${maxId + 1}`)
```

### Docker Compose
```yaml
services:
  postgres:
    image: postgres:16-alpine
    container_name: pasty-pg
    ports: ["5432:5432"]
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: pasty
    volumes:
      - pgdata:/var/lib/postgresql/data
```

## Lições Aprendidas
- `IF NOT EXISTS` nas tabelas permite execução repetida
- `ON CONFLICT DO NOTHING` na migração evita duplicatas
- Resetar sequência é obrigatório ao migrar IDs explícitos
- `TIMESTAMPTZ` em vez de `TIMESTAMP` para timezone-aware
- `ILIKE` em vez de `LIKE` para busca case-insensitive nativa
- Pool de conexões: `max: 20, idleTimeoutMillis: 30000`
