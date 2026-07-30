# Guia de Deploy — Pasty

## Arquitetura de Deploy

| Camada | Serviço | URL |
|--------|---------|-----|
| **Frontend** | Vercel | `https://pasty.ordob.com` |
| **Backend API** | ValueHost DirectAdmin + PM2 | `https://pasty-api.ordob.com` |
| **Banco MySQL** | ValueHost (porta 3307) | `arti3263_pasty` |
| **Cache Redis** | ValueHost (opcional) | Configurado via `REDIS_URL` |

---

## Frontend → Vercel

### Configuração Inicial

1. Conecte o repositório GitHub à Vercel
2. Importe o diretório `frontend/`
3. Configure as variáveis de ambiente:
   - `VITE_API_URL=https://pasty-api.ordob.com`
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
GOOGLE_REDIRECT_URI=https://pasty-api.ordob.com/api/auth/google/callback

# JWT
JWT_SECRET=uma-chave-segura-aqui

# Frontend
FRONTEND_URL=https://pasty.ordob.com

# MySQL (ValueHost porta 3307)
DB_HOST=localhost
DB_PORT=3307
DB_USER=arti3263_pasty
DB_PASSWORD=sua-senha
DB_DATABASE=arti3263_pasty

# Redis (opcional — para rate limiting compartilhado)
REDIS_URL=

# Server
PORT=3001
```

### MySQL Setup

O MySQL roda no próprio DirectAdmin (porta 3307). Crie o banco:

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
    name: 'pasty-backend',
    script: './dist/index.js',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3001,
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    max_restarts: 10,
    restart_delay: 5000,
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
pm2 logs pasty-backend

# Reiniciar após alterações
pm2 restart pasty-backend

# Parar
pm2 stop pasty-backend

# Salvar para restart automático
pm2 save
pm2 startup
```

### Redis (Opcional)

Se disponível no ValueHost, configure o Redis para rate limiting compartilhado:

```env
REDIS_URL=redis://user:password@host:6379
```

Sem Redis, o rate limiter usa fallback in-memory (funciona para instância única).

### Verificação

```bash
curl https://pasty-api.ordob.com/api/health
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
  - `https://pasty-api.ordob.com/api/auth/google/callback`
  - `http://localhost:3001/api/auth/google/callback`

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

## CI/CD (GitHub Actions)

O repositório possui workflows em `.github/workflows/`:

- `deploy-backend.yml` — faz deploy automático no ValueHost ao push na branch `main`
- `deploy-frontend.yml` — faz deploy automático na Vercel ao push na branch `main`
