# Guia de Deploy — Pasty

## Arquitetura de Deploy

| Camada | Serviço | URL |
|--------|---------|-----|
| **Frontend** | Vercel | `https://pasty.ordob.com` |
| **Backend API** | ValueHost DirectAdmin + PM2 | `https://api.pasty.ordob.com` |
| **Banco MySQL** | ValueHost (porta 3306) | `arti3263_pasty` |
| **Cache Redis** | ValueHost (socket `unix:///home/arti3263/.redis/redis.sock`) | Via `REDIS_URL` |

---

## Frontend → Vercel

### Configuração Inicial

1. Conecte o repositório GitHub à Vercel
2. Importe o diretório `frontend/`
3. Configure as variáveis de ambiente:
   - `VITE_API_URL=https://api.pasty.ordob.com`
4. O `vercel.json` já contém:
   - Framework: `vite`
   - Build command: `npm run build`
   - Output directory: `dist`
   - Rewrite `/api/*` → backend (opcional, via proxy)

### Domínio Customizado

1. Adicione `pasty.ordob.com` como domínio no painel Vercel
2. Configure o DNS apontando para a Vercel (registro CNAME ou NS)
3. SSL é gerenciado automaticamente pela Vercel

### Build Local (Teste)

```bash
cd frontend
npm install
npm run build   # gera dist/
```

---

## Backend → ValueHost (DirectAdmin + PM2)

### Acesso ao Servidor

```bash
ssh arti3263@br64-da.valueserver.net.br -p 1157
```

### Setup Inicial

```bash
# Navegue até o diretório do backend
cd /home/arti3263/pasty-backend

# Instale dependências
npm install

# Compile o TypeScript
npm run build

# Configure o .env
cp .env.example .env
nano .env
```

### Variáveis de Ambiente (.env)

```env
# Google OAuth
GOOGLE_CLIENT_ID=seu-client-id
GOOGLE_CLIENT_SECRET=seu-client-secret
GOOGLE_REDIRECT_URI=https://pasty.ordob.com/auth/callback

# JWT
JWT_SECRET=uma-chave-segura-aqui

# Frontend
FRONTEND_URL=https://pasty.ordob.com

# MySQL (ValueHost porta 3306, host localhost via socket)
DB_HOST=localhost
DB_PORT=3306
DB_USER=arti3263_pasty
DB_PASSWORD=sua-senha
DB_DATABASE=arti3263_pasty

# Redis (socket UNIX do ValueHost)
REDIS_URL=unix:///home/arti3263/.redis/redis.sock

# Server
PORT=8000
```

### MySQL Setup

O MySQL roda no próprio DirectAdmin (porta **3306**). **Importante:** use `DB_HOST=localhost` (socket), não `127.0.0.1`. Crie o banco:

```sql
CREATE DATABASE IF NOT EXISTS arti3263_pasty
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

O backend cria as tabelas automaticamente na primeira execução (via `initDatabase()` em `db.ts`).

### Gerenciamento com PM2

Crie um arquivo `ecosystem.config.cjs` no diretório do backend:

```javascript
module.exports = {
  apps: [{
    name: 'pasty-api',
    script: './dist/index.js',
    cwd: '/home/arti3263/domains/api.pasty.ordob.com/public_html/OrdoB-Pasty/pasty/backend',
    instances: 1,
    exec_mode: 'cluster',
    autorestart: true,
    max_memory_restart: '256M',
    env: {
      NODE_ENV: 'production',
      PORT: 8000,
    },
    error_file: '/home/arti3263/logs/pasty-api-error.log',
    out_file: '/home/arti3263/logs/pasty-api-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    max_restarts: 10,
    restart_delay: 3000,
  }]
}
```

Comandos úteis:

```bash
# Iniciar
pm2 start ecosystem.config.cjs

# Ver status
pm2 status

# Ver logs
pm2 logs pasty-api

# Reiniciar após alterações
pm2 restart pasty-api

# Parar
pm2 stop pasty-api

# Salvar para restart automático
pm2 save
pm2 startup
```

### Redis

O Redis roda no ValueHost via **socket UNIX**. Configure no `.env`:

```env
REDIS_URL=unix:///home/arti3263/.redis/redis.sock
```

Para testar:

```bash
redis-cli ping
# → PONG
```

### Verificação

```bash
curl https://api.pasty.ordob.com/api/health
# → {"status":"ok","version":"1.0.0"}
```

---

## Google Cloud Console

### APIs necessárias
- Google Drive API
- Google Docs API
- Gmail API

### OAuth 2.0
- **Authorized JavaScript Origins:**
  - `https://pasty.ordob.com`
  - `http://localhost:5173` (dev)
- **Authorized Redirect URIs:**
  - `https://pasty.ordob.com/auth/callback`
  - `http://localhost:5173/auth/callback`

### Escopos
- `.../auth/documents`, `.../auth/drive.file`, `.../auth/gmail.compose`, `openid`, `email`, `profile`

Veja [GOOGLE_SETUP.md](./GOOGLE_SETUP.md) para instruções detalhadas.

---

## Verificação Pós-Deploy

- [ ] `GET /api/health` → `{"status":"ok"}`
- [ ] Login Google funciona
- [ ] Salvar em Docs, Drive e Gmail funciona
- [ ] Histórico carrega
- [ ] Duplicidade detecta texto repetido
- [ ] Sitemap: `/sitemap.xml`
- [ ] Robots.txt: `/robots.txt`
- [ ] PM2 online: `pm2 status`

---

## CI/CD (Deploy Automatizado)

O deploy é automatizado pelo script **`deploy.ps1`** (raiz de `projetos_git`):

```powershell
.\deploy.ps1 -Project pasty-backend     # backend → ValueHost (PM2)
.\deploy.ps1 -Project pasty-frontend    # frontend → Vercel (CLI)
```

- Backend: build local (`npm run build`) → scp de `dist/` + `package.json` → `npm install --omit=dev` → `pm2 restart pasty-api`
- Frontend: `vercel --prod` a partir da raiz do monorepo (projeto `equipew/pasty-frontend`, root dir `pasty/frontend`)

Os workflows GitHub Actions (`backend/.github/workflows/ci.yml`, `frontend/.github/workflows/ci.yml`) rodam apenas **CI** (lint/build/test). Não há workflow de deploy.
