# 🚀 Pasty

**Cole, organize, acesse. Seu texto sempre com você.**

---

## 🎯 Objetivo do Produto

Criar uma ferramenta onde o usuário:
1. Entra com Google
2. Cola um texto
3. Escolhe onde salvar (Google Docs, Google Drive, Gmail Draft)
4. O sistema cria o conteúdo no destino escolhido
5. Acessa de qualquer dispositivo

---

## 📊 FASE 0 — Definição do MVP

### MVP (Fase Atual)

| Tem | Não Tem |
|-----|---------|
| ✅ Login Google | ❌ App mobile |
| ✅ Interface simples (Tailwind v4) | ❌ Extensão Chrome |
| ✅ Google Docs | ❌ IA |
| ✅ Google Drive | ❌ Sistema de assinatura |
| ✅ Gmail Draft | ❌ Painel complexo |
| ✅ Histórico básico | ❌ Banco armazenando textos completos |
| ✅ Controle de duplicidade (SHA-256) | ❌ |

### Stack Decidida ✅

```
Frontend: React + Vite + TypeScript + Tailwind CSS v4
Backend:  Hono v4 + TypeScript + MySQL (mysql2)
Cache:    Redis (ioredis)
Auth:     Google OAuth 2.0
Deploy:   Frontend → Vercel | Backend → ValueHost (DirectAdmin + PM2)
```

> **Stack unificada em TypeScript** — frontend e backend na mesma linguagem. Isso reduz o contexto mental, acelera o desenvolvimento e permite compartilhar tipos entre as camadas. O Hono é um framework web moderno, leve e TypeScript-nativo.

> **MySQL** — Banco relacional robusto, disponível no ValueHost via DirectAdmin. Utilizado para metadados dos saves, histórico e dados de usuário.

> **Redis** — Cache em memória para tokens de acesso Google, reduzindo chamadas ao banco e acelerando o refresh de tokens.

> **Por que Vite e não Next.js?**
> - Vite já está configurado e funcional
> - Deploy na Vercel funciona perfeitamente com Vite
> - Next.js adiciona complexidade desnecessária para um MVP
> - SEO das landing pages é resolvido com meta tags + sitemap
> - Se o projeto crescer, a migração para Next.js pode ser feita depois

### Roadmap de Monetização 💰

```
MVP (agora):   100% grátis → construir audiência + validar ideia
Mês 3:         AdSense nas landing pages SEO
Mês 6:         Freemium (limite de saves/mês, upgrade ilimitado)
Mês 12:        Extensão Chrome (produto premium) + planos pagos
```

---

## 🏗️ FASE 1 — Preparação das Contas

### 1. Domínio
- `pasty.ordob.com` (frontend) e `pasty-api.ordob.com` (backend)
- DNS gerenciado pela OrdoB

### 2. GitHub
- Repositório: `ordob-pasty-frontend`
- Estrutura:
  ```
  pasty/
  ├── frontend/     → React + Vite (Vercel)
  ├── backend/      → Hono + TypeScript (ValueHost)
  ├── docs/         → Documentação
  └── README.md
  ```

---

## 🔑 FASE 2 — Google Cloud Project

### Passos no Google Cloud Console:

1. Criar projeto: **Pasty**
2. Ativar APIs:
   - ✅ Google Drive API
   - ✅ Google Docs API
   - ✅ Gmail API
   - ✅ Google Identity Services (OAuth)

3. Criar OAuth Client ID (Web Application):
   - **Origins autorizados:**
     - `http://localhost:5173` (dev)
     - `https://pasty.ordob.com` (prod)
   - **Redirect URIs:**
     - `http://localhost:5173/auth/callback` (dev)
     - `https://pasty.ordob.com/auth/callback` (prod)

4. Escopos solicitados (mínimos necessários):
   - `https://www.googleapis.com/auth/documents` (Docs)
   - `https://www.googleapis.com/auth/drive.file` (Drive — arquivos que criar)
   - `https://www.googleapis.com/auth/gmail.compose` (Gmail drafts)

---

## 🧱 FASE 3 — Arquitetura

```
                    🌐 Usuário
                       |
              ╔═══════════════════╗
              ║  React + Vite    ║  ← Vercel
              ║  (Tailwind v4)   ║
              ╚═══════════════════╝
                       |
                   (API REST)
                       |
              ╔═══════════════════╗
              ║  Hono + Node.js  ║  ← ValueHost (PM2)
              ║  (TypeScript)     ║
              ╚═══════════════════╝
                    /     |     \
          Google APIs   MySQL    Redis
          (Docs, Drive,  (meta-   (cache de
           Gmail)        dados)   tokens)
```

### Fluxo de Dados

1. Usuário cola texto → Frontend envia para `/api/save`
2. Backend gera hash SHA-256 → Verifica duplicidade no MySQL
3. Backend chama Google API (Docs/Drive/Gmail) — token em cache no Redis
4. Backend salva metadados no MySQL (hash, destino, data)
5. Frontend mostra resultado com link

---

## ⚙️ FASE 4 — Backend (Hono + TypeScript)

### Stack

| Tecnologia | Função |
|-----------|--------|
| **Hono** | Framework web TypeScript-nativo, leve e rápido |
| **mysql2** | Driver MySQL para Node.js |
| **ioredis** | Cliente Redis para cache de tokens |
| **@hono/node-server** | Servidor HTTP Node.js para Hono |
| **hono/jwt** | Middleware JWT nativo do Hono |

### Estrutura

```
backend/
├── src/
│   ├── index.ts           → App Hono com rotas + serve()
│   ├── config.ts          → Variáveis de ambiente
│   ├── db.ts              → MySQL (mysql2) + queries
│   ├── redis.ts           → Redis (ioredis) cache
│   ├── auth.ts            → OAuth Google (auth URL, troca de código, user info)
│   ├── middleware.ts      → Middleware JWT (Authorization Bearer)
│   └── services/
│       ├── docs.ts        → Google Docs API
│       ├── drive.ts       → Google Drive API
│       └── gmail.ts       → Gmail Drafts API
├── package.json
├── tsconfig.json
├── ecosystem.config.cjs   → PM2 config
└── .env.example
```

### Endpoints da API

---

## ☁️ FASE 5 — Google Services

### Google Docs (`services/docs.ts`)
- `create_document(access_token, title, text)`
- Cria um documento no Google Docs
- Retorna: `document_id` + `url`

### Google Drive (`services/drive.ts`)
- `create_text_file(access_token, title, text)`
- Cria um arquivo `.txt` no Google Drive
- Retorna: `file_id` + `url`

### Gmail (`services/gmail.ts`)
- `create_draft(access_token, to_email, subject, body)`
- Cria um rascunho no Gmail
- Retorna: `draft_id`

---

## 🎨 FASE 6 — Frontend

### Estrutura

```
frontend/src/
├── main.tsx              → Entry point
├── App.tsx               → App com rotas
├── index.css             → Tailwind v4 + estilos globais
├── api.ts                → Cliente HTTP (fetch)
├── hooks/
│   └── useAuth.ts        → Hook de autenticação
├── components/
│   ├── Header.tsx        → Navbar + Google Login
│   ├── TextBox.tsx       → Área de texto + título
│   ├── DestinationSelector.tsx → Checkboxes de destino
│   ├── SaveButton.tsx    → Botão salvar
│   ├── SuccessMessage.tsx → Mensagem de sucesso
│   └── History.tsx       → Histórico de saves
└── types.ts              → TypeScript types
```

### Interface

**Tela inicial (não logado):**
```
┌─────────────────────────────┐
│         Pasty               │
│   Cole, organize, acesse.   │
│   Seu texto sempre com você │
│                             │
│   [ 🔑 Login with Google ] │
│                             │
│   Save text directly to:    │
│   📄 Google Docs            │
│   📁 Google Drive           │
│   ✉️  Gmail Draft           │
└─────────────────────────────┘
```

**App (logado):**
```
┌─────────────────────────────┐
│  📝 Pasty          👤 user  │
├─────────────────────────────┤
│  Título: [______________]  │
│                             │
│  Texto:                     │
│  ┌───────────────────────┐  │
│  │                       │  │
│  │  Cole seu texto aqui  │  │
│  │                       │  │
│  └───────────────────────┘  │
│                             │
│  Salvar em:                 │
│  ☑ Google Docs              │
│  ☑ Google Drive             │
│  ☐ Gmail Draft              │
│                             │
│  [ 💾 Salvar ]              │
│                             │
│  ─── Histórico ───          │
│  📄 Meu texto → Docs         │
│  📁 Notas → Drive           │
└─────────────────────────────┘
```

---

## 🔐 FASE 7 — Controle de Duplicidade

1. Usuário clica "Salvar"
2. Backend gera hash SHA-256 do texto
3. Busca no MySQL por `user_id + content_hash`
4. **Se existir**: retorna aviso "Este texto já foi salvo. Abrir destino?"
5. **Se não existir**: cria no Google + salva no MySQL

---

## 🚀 FASE 8 — Deploy

### Frontend (Vercel)

1. Conectar GitHub ao Vercel
2. Importar projeto: `pasty/frontend`
3. Configurar variáveis de ambiente:
   - `VITE_API_URL=https://pasty-api.ordob.com`
4. Deploy automático em cada `git push`

### Backend (ValueHost — DirectAdmin + PM2)

1. Conectar via SSH:
   ```bash
   ssh arti3263@br64-da.valueserver.net.br -p 1157
   ```
2. Arquivos em: `/home/arti3263/pasty-backend/`
3. Gerenciar com PM2:
   ```bash
   cd /home/arti3263/pasty-backend
   pm2 start ecosystem.config.cjs
   pm2 save
   pm2 status
   ```
4. Variáveis de ambiente no `.env`:
   - `GOOGLE_CLIENT_ID=seu-client-id`
   - `GOOGLE_CLIENT_SECRET=seu-client-secret`
   - `GOOGLE_REDIRECT_URI=https://pasty.ordob.com/auth/callback`
   - `JWT_SECRET=seu-jwt-secret`
   - `FRONTEND_URL=https://pasty.ordob.com`
   - `DATABASE_URL=mysql://arti3263_pasty:***@localhost:3306/arti3263_pasty`
   - `REDIS_URL=redis://localhost:6379`
   - `PORT=3001`
5. Backend proxy reverso pelo DirectAdmin em `pasty-api.ordob.com`

### Domínio

- `pasty.ordob.com` → Vercel (CNAME)
- `pasty-api.ordob.com` → DirectAdmin proxy reverso para `localhost:3001`
- SSL via Cloudflare ou DirectAdmin

---

## 🔍 FASE 9 — SEO Inicial

### Páginas Landing (anti-sala do login)

| Rota | Título SEO | Foco |
|------|-----------|------|
| `/` | Pasty - Cole, organize, acesse | Principal |
| `/send-text-to-pc` | Send Text to PC - Quick Copy from Phone to Computer | Tutorial |
| `/save-text-online` | Save Text Online - Free Text Storage Tool | Ferramenta |

### Técnicas
- Meta tags (title, description, OG)
- Schema.org markup
- Sitemap.xml
- Google Analytics + Search Console
- Conteúdo rico nas landing pages (tutoriais, casos de uso)

---

## 📊 FASE 10 — Analytics

### Eventos a rastrear (Google Analytics 4)

| Evento | Disparo |
|--------|--------|
| `login_google` | Usuário fez login |
| `save_text` | Texto salvo com sucesso |
| `destination_selected` | Checkbox de destino marcado |
| `duplicate_detected` | Texto duplicado encontrado |

---

## 🎯 FASE 11 — Lançamento

### Checklist de Lançamento

- [ ] Domínio configurado com SSL
- [ ] Google Cloud Project com OAuth ativo
- [ ] Frontend rodando na Vercel
- [ ] Backend rodando no ValueHost via PM2
- [ ] MySQL database criado e migrado
- [ ] Redis configurado e funcional
- [ ] Fluxo completo testado (Login → Colar → Salvar → Ver resultado)
- [ ] Google Analytics instalado
- [ ] Páginas SEO no ar

### Estratégia de Divulgação

| Canal | Quando |
|-------|--------|
| Reddit (produtividade, ferramentas) | Dia 2 |
| Comunidades de estudantes/programadores | Semana 1 |
| Product Hunt | Mês 1 (quando estiver polido) |
| Hacker News | Mês 2-3 (quando tiver tração) |

> **Não comece pela extensão.** A extensão é o "produto mágico", mas o site é a validação. Primeiro prove que pessoas querem clicar em "salvar". Depois você transforma em uma experiência de 1 clique com a extensão. Isso reduz muito o risco.

---

## 💡 Ideias Futuras (Pós-MVP)

### Curto Prazo (Mês 1-3)
- [ ] Landing pages SEO (/send-text-to-pc, /save-text-online, etc.)
- [ ] Google Analytics
- [ ] AdSense nas páginas públicas

### Médio Prazo (Mês 3-6)
- [ ] Tema escuro
- [ ] Multi-select (salvar em vários destinos de uma vez)
- [ ] Limite de saves/mês → upgrade premium
- [ ] Compartilhar link direto

### Longo Prazo (Mês 6-12)
- [ ] Extensão Chrome (salvar seleção com 1 clique)
- [ ] App mobile (iOS/Android)
- [ ] Integração com Notion, Dropbox, etc.
- [ ] IA: resumir texto antes de salvar
- [ ] Planos pagos (assinatura)
