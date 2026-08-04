# OrdoB Pasty

**Cole, organize, acesse. Seu texto sempre com você.** — Um utilitário de produtividade integrado ao ecossistema **OrdoB**.

Cole qualquer texto e salve diretamente no Google Docs, Google Drive ou Gmail. Acesse de qualquer dispositivo.

## 📋 Funcionalidades

- ✅ **Login com Google** — Autenticação segura via OAuth 2.0
- ✅ **Google Docs** — Cria documentos formatados automaticamente
- ✅ **Google Drive** — Salva arquivos de texto na nuvem
- ✅ **Gmail Draft** — Cria rascunhos de e-mail
- ✅ **Controle de Duplicidade** — Hash SHA-256 para evitar saves repetidos
- ✅ **Histórico** — Visualize todos os seus textos salvos
- ✅ **Design Responsivo** — Funciona em desktop e mobile
- ✅ **Dark Mode** — Tema claro/escuro automático

## 🛠 Stack

| Camada | Tecnologia |
|--------|------------|
| **Frontend** | React 19 + Vite + TypeScript + Tailwind CSS v4 |
| **Backend** | Hono v4 + TypeScript + Node.js |
| **Auth** | Google OAuth 2.0 |
| **Banco** | MySQL (mysql2) + Redis (ioredis) para cache |
| **Deploy** | Vercel (frontend) + ValueHost DirectAdmin/PM2 (backend) |

## 🔧 Setup Local

### 1. Google Cloud Project

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um projeto: **Pasty**
3. Ative as APIs: Google Drive API, Google Docs API, Gmail API
4. Crie um **OAuth Client ID** (Web Application):
   - **Authorized JavaScript Origins:** `http://localhost:5173`
   - **Authorized Redirect URIs:** `http://localhost:5173/auth/callback`

### 2. Backend

```bash
cd pasty/backend
npm install
cp .env.example .env   # Edite o .env com suas credenciais do Google Cloud
npm run dev            # ou: npx tsx watch src/index.ts
```

### 3. Frontend

```bash
cd pasty/frontend
npm install
npm run dev
```

### 4. Acesse

- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- Health check: http://localhost:8000/api/health

## 🌐 Deploy

### Frontend (Vercel)

1. Conecte o repositório GitHub ao Vercel
2. Importe o projeto `pasty/frontend`
3. Configure a variável de ambiente:
   - `VITE_API_URL=https://api.pasty.ordob.com`
4. Deploy automático em cada `git push`

### Backend (ValueHost — DirectAdmin + PM2)

1. Faça SSH para o servidor:
   ```bash
   ssh arti3263@br64-da.valueserver.net.br -p 1157
   ```
2. Os arquivos do backend ficam em `/home/arti3263/pasty-backend/`
3. O processo é gerenciado via PM2 com ecosystem file:
   ```bash
   cd /home/arti3263/pasty-backend
   pm2 start ecosystem.config.cjs
   pm2 save
   ```
4. Configure as variáveis de ambiente no `.env`:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `GOOGLE_REDIRECT_URI=https://pasty.ordob.com/auth/callback`
   - `JWT_SECRET`
   - `FRONTEND_URL=https://pasty.ordob.com`
   - `DATABASE_URL=mysql://arti3263_pasty:***@localhost:3306/arti3263_pasty`
   - `REDIS_URL=redis://localhost:6379`
   - `PORT=8000`
5. O backend é proxy reverso pelo DirectAdmin em `api.pasty.ordob.com`

## 📁 Estrutura

```
pasty/
├── backend/
│   ├── src/
│   │   ├── index.ts      → App Hono com rotas
│   │   ├── config.ts     → Variáveis de ambiente
│   │   ├── db.ts         → MySQL (mysql2) + queries
│   │   ├── redis.ts      → Redis (ioredis) cache
│   │   ├── auth.ts       → OAuth Google
│   │   ├── middleware.ts → JWT middleware
│   │   └── services/
│   │       ├── docs.ts   → Google Docs API
│   │       ├── drive.ts  → Google Drive API
│   │       └── gmail.ts  → Gmail Drafts API
│   ├── package.json
│   ├── tsconfig.json
│   └── ecosystem.config.cjs
├── frontend/
│   ├── src/
│   │   ├── App.tsx       → App principal com rotas
│   │   ├── api.ts        → Cliente HTTP
│   │   ├── types.ts      → Types TypeScript
│   │   ├── hooks/
│   │   │   └── useAuth.ts → Hook de autenticação
│   │   └── components/
│   │       ├── Header.tsx
│   │       ├── TextBox.tsx
│   │       ├── DestinationSelector.tsx
│   │       ├── SaveButton.tsx
│   │       ├── SuccessMessage.tsx
│   │       └── History.tsx
│   ├── index.html
│   ├── vercel.json
│   └── package.json
└── README.md
```

## 🧪 API Endpoints

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/health` | Health check |
| GET | `/api/auth/google/login` | URL de autenticação Google |
| POST | `/api/auth/callback` | Troca código por JWT |
| GET | `/api/auth/me` | Dados do usuário logado |
| POST | `/api/save` | Salva texto no destino |
| POST | `/api/history` | Histórico de saves |

## 🗺️ Roadmap

### MVP (agora)

- [x] Login Google
- [x] Salvar em Docs, Drive, Gmail
- [x] Histórico
- [x] Controle de duplicidade

### Próximos passos

- [x] Landing pages SEO (`/send-text-to-pc`, `/save-text-online`)
- [x] Google Analytics
- [ ] AdSense nas páginas públicas
- [x] Tema escuro automático (`prefers-color-scheme`)
- [ ] Salvar em múltiplos destinos de uma vez
- [ ] Limite de saves/mês → upgrade premium
- [ ] Extensão Chrome
- [ ] Integração com Notion, Dropbox
- [ ] IA: resumir texto antes de salvar

## 📄 Licença

MIT

---

**OrdoB Pasty** — Produtividade simples, integrada ao ecossistema OrdoB.  
Feito com ❤️ por Wesley Alves e equipe OrdoB™
