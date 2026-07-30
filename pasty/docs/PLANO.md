# Plano do Projeto — Pasty

> **Pasty** — Cole, organize, acesse. Seu texto sempre com você.
> Versão: 1.0.0 (MVP) | Última atualização: Julho 2026

---

## Visão Geral

Pasty é um SaaS que permite colar qualquer texto no navegador e salvá-lo diretamente no Google Docs, Google Drive ou Gmail. O diferencial é a **integração profunda com o ecossistema Google** e a **experiência zero-atrito** — sem apps, sem cadastros extras, sem instalação.

### Público-alvo
- Profissionais que precisam transferir textos entre dispositivos rapidamente
- Estudantes que organizam anotações no Google Drive
- Usuários que querem criar rascunhos de e-mail sem abrir o Gmail
- Qualquer pessoa com conta Google que precise de um "bloco de notas voador"

### Proposta de valor
> "Cole qualquer texto. Salve onde quiser. Acesse de qualquer lugar. Grátis."

---

## Roadmap

### MVP (Completo — v1.0.0)
| Feature | Status |
|---------|--------|
| Login com Google (OAuth 2.0) | ✅ |
| Salvar no Google Docs | ✅ |
| Salvar no Google Drive | ✅ |
| Salvar no Gmail (draft) | ✅ |
| Controle de duplicidade por hash SHA-256 | ✅ |
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
| MySQL | ✅ |
| SEO (sitemap, JSON-LD, meta tags) | ✅ |
| Logo SVG personalizada | ✅ |
| PWA (Service Worker, Manifest) | ✅ |
| Rate limiting (memória/Redis) | ✅ |
| Integração OrdoB Auth | ✅ |

### Próximas Features
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

### Visão de Longo Prazo
- Dashboard com estatísticas de uso
- API pública para desenvolvedores
- Editor de texto rich integrado
- Colaboração em tempo real
- App mobile nativo (React Native)
- Suporte a múltiplos idiomas (i18n)

---

## Stack Tecnológica

| Camada | Tecnologia | Versão | Propósito |
|--------|-----------|--------|-----------|
| **Frontend** | React | 19.x | UI declarativa |
| **Bundler** | Vite | 8.x | Build rápido, HMR |
| **Linguagem** | TypeScript | 6.x / 5.7 | Tipagem estática |
| **CSS** | Tailwind CSS | 4.x | Utility-first, design system |
| **Roteamento** | React Router | 7.x | SPA routing |
| **HTTP** | Axios | 1.x | Cliente HTTP com interceptors |
| **Backend** | Hono | 4.x | Framework web leve e rápido |
| **Servidor** | @hono/node-server | 2.x | Servidor HTTP Node.js |
| **Banco** | MySQL | 8+ | Dados relacionais |
| **Driver DB** | mysql2 | 3.x | Conexão MySQL com pool |
| **Cache** | Redis (ioredis) | 5.x | Rate limiting multi-instância |
| **Auth** | Google OAuth 2.0 | - | Login social |
| **JWT** | Hono JWT | - | Tokens de sessão |
| **Rate Limiter** | rate-limiter-flexible | 11.x | Proteção contra abuso |

---

## Arquitetura de Alto Nível

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
│  │  Routes  │ │  Routes  │ │  Routes  │ │  (JWT, CORS,     │   │
│  │  (inline)│ │  (inline)│ │  (inline)│ │   Rate Limit)    │   │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └──────────────────┘   │
│       │            │            │                                │
│  ┌────▼────────────▼────────────▼──────────────────────────┐   │
│  │              Database Layer (db.ts)                      │   │
│  │     MySQL (Pool + Prepared Statements + Pagination)      │   │
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

## Estrutura do Projeto

```
pasty/
├── backend/                        # API Hono + MySQL
│   ├── src/
│   │   ├── index.ts               # App Hono: rotas, middleware, inicialização
│   │   ├── config.ts              # Variáveis de ambiente (dotenv)
│   │   ├── db.ts                  # Pool MySQL + queries + schema DDL
│   │   ├── auth.ts                # OAuth 2.0 Google (login, refresh)
│   │   ├── middleware.ts          # JWT verification middleware
│   │   ├── rate-limiter.ts        # Rate limiting (in-memory ou Redis)
│   │   ├── ordob-client.ts        # Integração OrdoB Auth
│   │   └── services/
│   │       ├── docs.ts            # Google Docs API (criar + inserir)
│   │       ├── drive.ts           # Google Drive API (upload)
│   │       └── gmail.ts           # Gmail API (drafts)
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                       # React SPA
│   ├── src/
│   │   ├── main.tsx               # Entry point + SW registration
│   │   ├── App.tsx                # Routes + Auth provider
│   │   ├── api.ts                 # Axios client
│   │   ├── types.ts               # TypeScript interfaces
│   │   ├── index.css              # Global styles + Tailwind
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
│   │   ├── favicon.svg
│   │   ├── logo.svg
│   │   ├── icon-192.png / .svg
│   │   ├── icon-512.png / .svg
│   │   ├── manifest.json          # PWA manifest
│   │   ├── sw.js                  # Service Worker
│   │   ├── robots.txt
│   │   └── sitemap.xml
│   ├── index.html
│   ├── vercel.json
│   └── vite.config.ts
│
└── docs/
    ├── PLANO.md                   # Este arquivo
    ├── ARCHITECTURE.md            # Design e lógica do site
    ├── ALGORITHMS.md              # Algoritmos e patterns
    ├── DEPLOY_GUIDE.md            # Guia de deploy
    ├── GOOGLE_SETUP.md            # Configuração Google Cloud
    ├── LAUNCH_CHECKLIST.md        # Checklist de lançamento
    └── skills/                    # Skills aprendidas
        ├── TAILWIND-DESIGN.md
        ├── OAUTH-FLOW.md
        ├── CURSOR-PAGINATION.md
        ├── PWA-SETUP.md
        ├── GOOGLE-APIS.md
        ├── SEO-OTIMIZACAO.md
        ├── DARK-MODE.md
        └── ERROR-HANDLING.md
```

---

## Estratégia de Testes

| Nível | Ferramenta | Abrangência |
|-------|-----------|-------------|
| Type check | TypeScript (tsc --noEmit) | 100% do código |
| Lint | oxlint | Código frontend |
| Testes unitários | Vitest | Hooks + services |
| Testes E2E | (futuro — Playwright) | Fluxos críticos |

### Checklist de Deploy
1. `tsc --noEmit` em backend e frontend ✅
2. Build de produção (`npm run build`)
3. Verificar variáveis de ambiente
4. Testar fluxo OAuth completo
5. Verificar health check (`GET /api/health`)
6. Validar sitemap e robots.txt

---

## Métricas de Sucesso (MVP)

- **Tempo de save** < 3s (mediana)
- **Taxa de conversão** login → save > 60%
- **Zero downtime** no fluxo OAuth
- **100% de cobertura** de type checking
- **SEO**: 5 páginas indexadas no Google
