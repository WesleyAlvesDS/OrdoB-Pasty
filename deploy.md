# 🚀 Deploy do Pasty

Guia passo a passo para publicar o **Pasty** em produção.

---

## Visão Geral

O deploy é dividido em duas partes:

1. **Frontend (React + Vite)** → arquivos estáticos (SPA) na **Vercel**
2. **Backend (Hono + Node.js)** → aplicação Node.js rodando via **PM2** no **ValueHost** (DirectAdmin)

---

## Passo 1: Frontend (Vercel)

### 1.1 Conectar o repositório

1. Acesse [vercel.com](https://vercel.com) e faça login
2. Clique em **Add New → Project**
3. Importe o repositório GitHub: `anomalyco/ordob-pasty-frontend`
4. Selecione o diretório `pasty/frontend`

### 1.2 Configurar build

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
/home/arti3263/pasty-backend/
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
cd /home/arti3263
git clone <repo-url> pasty-backend
cd pasty-backend
npm install
npm run build
```

Opção B — via SCP:

```bash
# Do seu terminal local
scp -P 1157 -r ./backend/* arti3263@br64-da.valueserver.net.br:/home/arti3263/pasty-backend/
```

### 2.4 Configurar variáveis de ambiente

Edite `/home/arti3263/pasty-backend/.env`:

```
GOOGLE_CLIENT_ID=seu-client-id
GOOGLE_CLIENT_SECRET=seu-client-secret
GOOGLE_REDIRECT_URI=https://pasty.ordob.com/auth/callback
JWT_SECRET=sua-chave-secreta
FRONTEND_URL=https://pasty.ordob.com
DATABASE_URL=mysql://arti3263_pasty:senha@localhost:3306/arti3263_pasty
REDIS_URL=redis://localhost:6379
PORT=8000
```

### 2.5 Ecosystem file (PM2)

O arquivo `ecosystem.config.cjs` deve conter:

```javascript
module.exports = {
  apps: [{
    name: "pasty-backend",
    script: "dist/index.js",
    instances: 1,
    exec_mode: "fork",
    env: {
      NODE_ENV: "production",
    }
  }]
};
```

### 2.6 Iniciar com PM2

```bash
cd /home/arti3263/pasty-backend
pm2 start ecosystem.config.cjs
pm2 save
pm2 status
```

Para ver logs:

```bash
pm2 logs pasty-backend
```

Para reiniciar após alterações:

```bash
pm2 restart pasty-backend
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
2. Crie o banco: `arti3263_pasty`
3. Crie um usuário e conceda permissões
4. Anote a senha para o `.env`

### 4.2 Migrations

As migrations rodam automaticamente na inicialização do backend. Para rodar manualmente:

```bash
cd /home/arti3263/pasty-backend
npm run migrate
```

---

## Passo 5: Redis

O Redis já está disponível no servidor ValueHost. Configure a conexão no `.env`:

```
REDIS_URL=redis://localhost:6379
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
ssh arti3263@br64-da.valueserver.net.br -p 1157
cd /home/arti3263/pasty-backend
git pull
npm install
npm run build
pm2 restart pasty-backend
```

### Ver logs

```bash
pm2 logs pasty-backend --lines 100
```

### Status PM2

```bash
pm2 status
```
