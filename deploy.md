# 🚀 Deploy do Pasty

Guia passo a passo para publicar o **Pasty** em produção.

---

## Deploy Automatizado (recomendado)

Use o script geral **`deploy.ps1`** (em `C:\Users\prowe\Documents\projetos_git\deploy.ps1`):

```powershell
# Backend (Node + PM2 no ValueHost)
.\deploy.ps1 -Project pasty-backend

# Frontend (Vercel CLI)
.\deploy.ps1 -Project pasty-frontend
```

- Backend: build local (`tsc`) → upload `dist/` + `package.json` via scp → `npm install --omit=dev` → `pm2 restart pasty-api`
- Frontend: `vercel --prod` a partir da raiz do monorepo (root dir `pasty/frontend`), domínio `pasty.ordob.com`

---

## Visão Geral

O deploy é dividido em duas partes:

1. **Frontend (React + Vite)** → arquivos estáticos (SPA) na **Vercel**
2. **Backend (Hono + Node.js)** → aplicação Node.js rodando via **PM2** no **ValueHost** (DirectAdmin)

---

## Passo 1: Frontend (Vercel)

> **Obs.:** hoje o deploy usa a **CLI Vercel** (projeto `equipew/pasty-frontend`, root dir `pasty/frontend`). Deploy:
> ```bash
> cd C:\Users\prowe\Documents\projetos_git\OrdoB Pasty
> vercel link --yes --project pasty-frontend   # só na 1ª vez
> vercel --prod --yes
> ```
> Ou simplesmente: `.\deploy.ps1 -Project pasty-frontend`

### 1.1 Configurar build

| Config | Valor |
|--------|-------|
| **Framework Preset** | Vite |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Install Command** | `npm install` |

### 1.3 Variáveis de ambiente

| Variável | Valor |
|----------|-------|
| `VITE_API_URL` | `https://api.pasty.ordob.com` |

### 1.4 Deploy

- Clique em **Deploy**
- A Vercel faz deploy automático em cada `git push` para a branch principal
- URL de produção: `https://pasty.ordob.com`

---

## Passo 2: Backend (ValueHost — DirectAdmin + PM2)

### 2.1 Acesso SSH

```bash
ssh arti3263@br64-da.valueserver.net.br -p 1157
```

### 2.2 Estrutura no servidor

Os arquivos do backend ficam em:

```
/home/arti3263/domains/api.pasty.ordob.com/public_html/OrdoB-Pasty/pasty/backend/
├── src/
├── dist/
├── node_modules/
├── package.json
├── ecosystem.config.cjs
├── .env
└── tsconfig.json
```

### 2.3 Enviar arquivos

Opção A — via git clone:

```bash
cd /home/arti3263/domains/api.pasty.ordob.com/public_html
git clone <repo-url> OrdoB-Pasty
cd OrdoB-Pasty/pasty/backend
npm install
npm run build
```

Opção B — via SCP (automatizado pelo `deploy.ps1`):

```bash
# Do seu terminal local
.\deploy.ps1 -Project pasty-backend
```

### 2.4 Configurar variáveis de ambiente

Edite `/home/arti3263/domains/api.pasty.ordob.com/public_html/OrdoB-Pasty/pasty/backend/.env`:

```
GOOGLE_CLIENT_ID=seu-client-id
GOOGLE_CLIENT_SECRET=seu-client-secret
GOOGLE_REDIRECT_URI=https://pasty.ordob.com/auth/callback
JWT_SECRET=sua-chave-secreta
FRONTEND_URL=https://pasty.ordob.com
DB_HOST=localhost
DB_PORT=3306
DB_USER=arti3263_pasty
DB_PASSWORD=senha
DB_DATABASE=arti3263_pasty
REDIS_URL=unix:///home/arti3263/.redis/redis.sock
PORT=8000
```

### 2.5 Ecosystem file (PM2)

O arquivo `ecosystem.config.cjs` deve conter:

```javascript
module.exports = {
  apps: [{
    name: "pasty-api",
    script: "dist/index.js",
    cwd: "/home/arti3263/domains/api.pasty.ordob.com/public_html/OrdoB-Pasty/pasty/backend",
    instances: 1,
    exec_mode: "cluster",
    autorestart: true,
    max_memory_restart: "256M",
    env: {
      NODE_ENV: "production",
      PORT: 8000,
    }
  }]
};
```

### 2.6 Iniciar com PM2

```bash
cd /home/arti3263/domains/api.pasty.ordob.com/public_html/OrdoB-Pasty/pasty/backend
pm2 start ecosystem.config.cjs
pm2 save
pm2 status
```

Para ver logs:

```bash
pm2 logs pasty-api
```

Para reiniciar após alterações:

```bash
pm2 restart pasty-api
```

### 2.7 Proxy reverso no DirectAdmin

O DirectAdmin faz proxy reverso de `api.pasty.ordob.com` para `localhost:8000`:

1. No painel DirectAdmin, vá em **Proxy domains** ou **Apache Configuration**
2. Crie um proxy reverso apontando de `api.pasty.ordob.com` para `http://localhost:8000`

---

## Passo 3: Google Cloud Console

### 3.1 Criar projeto e ativar APIs

1. Acesse [console.cloud.google.com](https://console.cloud.google.com)
2. Crie projeto: **Pasty**
3. Ative as APIs:
   - Google Drive API
   - Google Docs API
   - Gmail API

### 3.2 Configurar OAuth

1. **APIs & Services > Credentials > Create Credentials > OAuth Client ID**
2. Tipo: **Web Application**
3. **Authorized JavaScript Origins:**
   - `https://pasty.ordob.com`
4. **Authorized Redirect URIs:**
   - `https://pasty.ordob.com/auth/callback`
5. Anote o **Client ID** e **Client Secret**

### 3.3 Tela de consentimento

1. **APIs & Services > OAuth consent screen**
2. User Type: **External**
3. Escopos: `.../auth/documents`, `.../auth/drive.file`, `.../auth/gmail.compose`
4. Adicione seu e-mail como Test User

---

## Passo 4: MySQL

### 4.1 Criar database

1. No DirectAdmin, vá em **MySQL Management**
2. Crie o banco: `arti3263_pasty` (porta 3306, host `localhost` via socket)
3. Crie um usuário e conceda permissões
4. Anote a senha para o `.env`

### 4.2 Migrations

As migrations rodam automaticamente na inicialização do backend. Para rodar manualmente:

```bash
cd /home/arti3263/domains/api.pasty.ordob.com/public_html/OrdoB-Pasty/pasty/backend
npm run migrate
```

---

## Passo 5: Redis

O Redis já está disponível no servidor ValueHost via socket UNIX:

```
REDIS_URL=unix:///home/arti3263/.redis/redis.sock
```

Para verificar se o Redis está ativo:

```bash
redis-cli ping
# Deve retornar: PONG
```

---

## Verificação Pós-Deploy

- [ ] `GET https://api.pasty.ordob.com/api/health` → `{"status":"ok"}`
- [ ] Página inicial `https://pasty.ordob.com` carrega sem erros
- [ ] Login com Google funciona
- [ ] Salvar em Docs/Drive/Gmail funciona
- [ ] Histórico carrega
- [ ] Duplicidade detecta texto repetido
- [ ] Sitemap: `/sitemap.xml`
- [ ] Robots.txt: `/robots.txt`

---

## Manutenção

### Atualizar backend

```bash
# Local (automatizado)
.\deploy.ps1 -Project pasty-backend

# Ou manualmente no servidor
ssh arti3263@br64-da.valueserver.net.br -p 1157
cd /home/arti3263/domains/api.pasty.ordob.com/public_html/OrdoB-Pasty/pasty/backend
git pull
npm install --omit=dev
npm run build
pm2 restart pasty-api
```

### Ver logs

```bash
pm2 logs pasty-api --lines 100
```

### Status PM2

```bash
pm2 status
```
