# Pasty

> Cole, organize, acesse. Seu texto sempre com você.

Pasty é um SaaS que permite colar texto no navegador e salvá-lo diretamente no Google Docs, Google Drive ou Gmail.

## Stack

| Camada | Tecnologia |
|--------|-----------|
| **Backend** | Hono v4 + TypeScript + Node.js |
| **Banco** | MySQL 8+ (mysql2) |
| **Cache** | Redis via ioredis (rate limiting multi-instância) |
| **Auth** | Google OAuth 2.0 (somente login social) |
| **Deploy** | ValueHost DirectAdmin + PM2 (backend) / Vercel (frontend) |

## Pré-requisitos

- Node.js 20+
- MySQL 8+ rodando localmente (ou via ValueHost)
- Conta Google Cloud Platform com OAuth configurado

## Setup Local

```bash
# 1. Clone e entre no diretório do backend
cd pasty/backend

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env
# Edite o .env com suas credenciais do Google, MySQL e Redis

# 4. Crie o banco MySQL
#   CREATE DATABASE arti3263_pasty CHARACTER SET utf8mb4;

# 5. Execute em desenvolvimento
npm run dev

# 6. Build para produção
npm run build
npm start
```

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia com tsx watch (hot reload) |
| `npm run build` | Compila TypeScript (tsc) |
| `npm start` | Executa o build de produção (node dist/index.js) |
| `npm test` | Roda testes com Vitest |
| `npm run clean` | Remove diretório dist |

## Frontend

O frontend React + Vite + TypeScript + Tailwind CSS v4 está em `pasty/frontend/`. Consulte o [README do frontend](./frontend/README.md) para instruções de setup e desenvolvimento.

## Deploy

- **Frontend**: Vercel — ver `frontend/vercel.json`
- **Backend**: ValueHost DirectAdmin + PM2 — veja [docs/DEPLOY_GUIDE.md](./docs/DEPLOY_GUIDE.md)

## Estrutura

```
pasty/
├── backend/
│   ├── src/
│   │   ├── index.ts         → App Hono com rotas (auth, save, history)
│   │   ├── config.ts        → Variáveis de ambiente
│   │   ├── db.ts            → MySQL pool + queries + schema
│   │   ├── auth.ts          → OAuth Google (login, refresh)
│   │   ├── middleware.ts    → JWT verification middleware
│   │   ├── rate-limiter.ts  → Rate limiting (memória ou Redis)
│   │   ├── ordob-client.ts  → Integração ecossistema OrdoB
│   │   └── services/
│   │       ├── docs.ts      → Google Docs API
│   │       ├── drive.ts     → Google Drive API
│   │       └── gmail.ts     → Gmail Drafts API
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   └── ... (ver README do frontend)
└── docs/
    ├── ARCHITECTURE.md
    ├── DEPLOY_GUIDE.md
    ├── GOOGLE_SETUP.md
    ├── LAUNCH_CHECKLIST.md
    └── PLANO.md
```

## Licença

MIT
