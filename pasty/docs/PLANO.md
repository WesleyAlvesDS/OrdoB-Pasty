# 📋 Plano do Projeto — Pasty

> **Pasty** — Cole uma vez. Acesse de qualquer lugar.
> Versão: 1.0.0 (MVP) | Última atualização: Julho 2026

---

## 🎯 Visão Geral

Pasty é um SaaS que permite colar qualquer texto no navegador e salvá-lo diretamente no Google Docs, Google Drive ou Gmail. O diferencial é a **integração profunda com o ecossistema Google** e a **experiência zero-atrito** — sem apps, sem cadastros extras, sem instalação.

### Público-alvo
- Profissionais que precisam transferir textos entre dispositivos rapidamente
- Estudantes que organizam anotações no Google Drive
- Usuários que querem criar rascunhos de e-mail sem abrir o Gmail
- Qualquer pessoa com conta Google que precise de um "bloco de notas voador"

### Proposta de valor
> "Cole qualquer texto. Salve onde quiser. Acesse de qualquer lugar. Grátis."

---

## 🗺️ Roadmap

### ✅ MVP (Completo — v1.0.0)
| Feature | Status |
|---------|--------|
| Login com Google (OAuth 2.0) | ✅ |
| Salvar no Google Docs | ✅ |
| Salvar no Google Drive | ✅ |
| Salvar no Gmail (draft) | ✅ |
| Controle de duplicidade por hash | ✅ |
| Histórico com paginação por cursor | ✅ |
| Busca e filtro no histórico | ✅ |
| Autenticação JWT | ✅ |
| Refresh automático de token Google | ✅ |
| Feedback de erro detalhado | ✅ |
| Landing pages SEO | ✅ |
| Página de Política de Privacidade | ✅ |
| Página de Termos de Uso | ✅ |
| Dark mode automático | ✅ |
| Responsivo mobile | ✅ |
| PostgreSQL | ✅ |
| Docker Compose | ✅ |
| SEO (sitemap, JSON-LD, meta tags) | ✅ |
| Logo SVG personalizada | ✅ |
| PWA (Service Worker, Manifest) | ✅ |

### 🔜 Próximas Features
| Feature | Prioridade | Estimativa |
|---------|-----------|------------|
| Google Analytics events | Alta | 2 dias |
| Salvar em múltiplos destinos de uma vez | Média | 3 dias |
| Toggle manual de dark mode | Média | 1 dia |
| Página de preços (freemium) | Baixa | 3 dias |
| Limite de saves/mês → upgrade premium | Baixa | 4 dias |
| IA: resumir texto antes de salvar | Baixa | 5 dias |
| Extensão Chrome | Baixa | 10 dias |
| Integração Notion + Dropbox | Baixa | 8 dias |

### 🔮 Visão de Longo Prazo
- [ ] Dashboard com estatísticas de uso
- [ ] API pública para desenvolvedores
- [ ] Editor de texto rich integrado
- [ ] Colaboração em tempo real
- [ ] App mobile nativo (React Native)
- [ ] Suporte a múltiplos idiomas (i18n)

---

## 🧱 Stack Tecnológica

| Camada | Tecnologia | Versão | Propósito |
|--------|-----------|--------|-----------|
| **Frontend** | React | 19.2.7 | UI declarativa |
| **Bundler** | Vite | 8.1.1 | Build rápido, HMR |
| **Linguagem** | TypeScript | 6.0.2 | Tipagem estática |
| **CSS** | Tailwind CSS | 4.3.2 | Utility-first, design system |
| **Roteamento** | React Router | 7.18.1 | SPA routing |
| **HTTP** | Axios | 1.18.1 | Cliente HTTP com interceptors |
| **Backend** | Hono | 4.12.29 | Framework web leve e rápido |
| **Servidor** | @hono/node-server | 2.0.8 | Servidor HTTP Node.js |
| **Banco** | PostgreSQL | 16 | Dados relacionais |
| **Driver DB** | pg | 8.22.0 | Conexão PostgreSQL |
| **Auth** | Google OAuth 2.0 | - | Login social |
| **JWT** | Hono JWT | - | Tokens de sessão |
| **Infra** | Docker | - | Container do PostgreSQL |

---

## 📐 Arquitetura de Alto Nível

```
┌─────────────────────────────────────────────────────────────────┐
│                        Cliente (Browser)                        │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  React SPA (Vite + TypeScript + Tailwind)                │   │
│  │  ┌─────────┐ ┌──────────┐ ┌────────┐ ┌──────────────┐   │   │
│  │  │  Pages  │ │Components│ │ Hooks  │ │  api.ts      │   │   │
│  │  │         │ │          │ │        │ │ (Axios)      │   │   │
│  │  └─────────┘ └──────────┘ └────────┘ └──────┬───────┘   │   │
│  └──────────────────────────────────────────────┬────────────┘   │
└─────────────────────────────────────────────────┼─────────────────┘
                                                   │ HTTP REST
                                                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Backend API (Hono)                            │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐   │
│  │  Auth    │ │  Save    │ │ History  │ │  Middleware       │   │
│  │  Routes  │ │  Routes  │ │  Routes  │ │  (JWT, CORS)     │   │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └──────────────────┘   │
│       │            │            │                                │
│  ┌────▼────────────▼────────────▼──────────────────────────┐   │
│  │              Database Layer (db.ts)                      │   │
│  │         PostgreSQL (Pool + Queries + Pagination)         │   │
│  └─────────────────────────────────────────────────────────┘   │
│       │            │            │                                │
│  ┌────▼────────────▼────────────▼──────────────────────────┐   │
│  │  Google Services                                        │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐                │   │
│  │  │  Docs    │ │  Drive   │ │  Gmail   │                │   │
│  │  │  API     │ │  API     │ │  API     │                │   │
│  │  └──────────┘ └──────────┘ └──────────┘                │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📁 Estrutura do Projeto

```
universal-save/
├── backend/                        # API Hono + PostgreSQL
│   ├── src/
│   │   ├── index.ts               # Rotas, middleware, inicialização
│   │   ├── config.ts              # Variáveis de ambiente
│   │   ├── db.ts                  # Pool PostgreSQL + queries + schema
│   │   ├── auth.ts                # OAuth 2.0 Google (login, refresh)
│   │   ├── middleware.ts          # JWT verification middleware
│   │   ├── migrate.ts             # Script SQLite → PostgreSQL
│   │   └── services/
│   │       ├── docs.ts            # Google Docs API (criar + inserir)
│   │       ├── drive.ts           # Google Drive API (upload)
│   │       └── gmail.ts           # Gmail API (drafts)
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
│
├── frontend/                       # React SPA
│   ├── src/
│   │   ├── main.tsx               # Entry point + SW registration
│   │   ├── App.tsx                # Routes + Auth provider
│   │   ├── api.ts                 # Axios client
│   │   ├── types.ts               # TypeScript interfaces
│   │   ├── index.css              # Global styles + animations
│   │   ├── pages/
│   │   │   ├── HomePage.tsx       # App principal (form + history)
│   │   │   ├── SendTextToPc.tsx   # Landing page SEO
│   │   │   ├── SaveTextOnline.tsx # Landing page SEO + FAQ
│   │   │   ├── PrivacyPolicy.tsx  # LGPD privacy policy
│   │   │   └── TermsOfService.tsx # Terms of use
│   │   ├── components/
│   │   │   ├── Header.tsx         # Nav + logo + mobile menu
│   │   │   ├── Footer.tsx         # Links + supporters + email
│   │   │   ├── Avatar.tsx         # User avatar com fallback
│   │   │   ├── TextBox.tsx        # Textarea com contagem
│   │   │   ├── DestinationSelector.tsx  # Docs/Drive/Gmail tabs
│   │   │   ├── SaveButton.tsx     # CTA com loading + Google icon
│   │   │   ├── SuccessMessage.tsx # Feedback visual
│   │   │   ├── History.tsx        # Lista paginada com filtros
│   │   │   └── GoogleAnalytics.tsx # GA4 integration
│   │   └── hooks/
│   │       ├── useAuth.ts         # Auth state + localStorage
│   │       └── useSaveForm.ts     # Form state + save logic
│   ├── public/
│   │   ├── favicon.svg            # Logo (P gradient)
│   │   ├── logo.svg               # Full logo with text
│   │   ├── mask-icon.svg          # Safari mask icon
│   │   ├── icon-192.{png,svg}     # PWA icons
│   │   ├── icon-512.{png,svg}     # PWA icons
│   │   ├── apple-touch-icon.png   # iOS icon
│   │   ├── manifest.json          # PWA manifest
│   │   ├── sw.js                  # Service Worker
│   │   ├── robots.txt             # SEO
│   │   ├── sitemap.xml            # SEO
│   │   └── .htaccess              # SPA fallback
│   ├── index.html                 # SEO meta tags + JSON-LD
│   └── vite.config.ts
│
├── docs/                          # Documentação
│   ├── PLANO.md                   # Este arquivo
│   ├── ARCHITECTURE.md            # Design e lógica do site
│   ├── ALGORITHMS.md              # Algoritmos e patterns
│   └── skills/                    # Skills aprendidas
│       ├── TAILWIND-DESIGN.md
│       ├── OAUTH-FLOW.md
│       ├── CURSOR-PAGINATION.md
│       ├── POSTGRESQL-MIGRATION.md
│       ├── PWA-SETUP.md
│       ├── GOOGLE-APIS.md
│       ├── SEO-OTIMIZACAO.md
│       ├── DARK-MODE.md
│       └── ERROR-HANDLING.md
│
├── docker-compose.yml             # PostgreSQL container
└── start-db.sh                    # Script de setup DB
```

---

## 🧪 Estratégia de Testes

| Nível | Ferramenta | Abrangência |
|-------|-----------|-------------|
| Type check | TypeScript (tsc --noEmit) | 100% do código |
| Lint | oxlint | Código frontend |
| Testes unitários | (futuro — Vitest) | Hooks + services |
| Testes E2E | (futuro — Playwright) | Fluxos críticos |

### Checklist de Deploy
1. `tsc --noEmit` em backend e frontend ✅
2. Build de produção (`npm run build`)
3. Verificar variáveis de ambiente
4. Testar fluxo OAuth completo
5. Verificar health check
6. Validar sitemap e robots.txt

---

## 📊 Métricas de Sucesso (MVP)

- **Tempo de save** < 3s (mediana)
- **Taxa de conversão** login → save > 60%
- **Zero downtime** no fluxo OAuth
- **100% de cobertura** de type checking
- **SEO**: 5 páginas indexadas no Google
