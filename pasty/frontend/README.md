# Pasty — Frontend

> Cole, organize, acesse. Seu texto sempre com você.

Interface web do Pasty, construída com React, Vite, TypeScript e Tailwind CSS v4. Deploy feito na Vercel em `pasty.ordob.com`.

## Stack

| Tecnologia | Versão |
|-----------|--------|
| React | 19.x |
| Vite | 8.x |
| TypeScript | 6.x |
| Tailwind CSS | 4.x |
| React Router | 7.x |
| Axios | 1.x |

## Setup

```bash
cd frontend
npm install
npm run dev
```

Acesse `http://localhost:5173` para desenvolvimento.

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia servidor de desenvolvimento (Vite) |
| `npm run build` | Type check + build para produção (tsc -b && vite build) |
| `npm run preview` | Servir build localmente (Vite preview) |
| `npm run lint` | Lint com oxlint |
| `npm run generate-icons` | Gera ícones PWA via script sharp |

## Variáveis de Ambiente

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `VITE_API_URL` | URL base da API backend | `https://api.pasty.ordob.com` |

## Estrutura

```
frontend/
├── src/
│   ├── main.tsx               # Entry point + SW registration
│   ├── App.tsx                # Routes + Auth provider
│   ├── api.ts                 # Axios client
│   ├── types.ts               # TypeScript interfaces
│   ├── index.css              # Global styles + Tailwind
│   ├── pages/                 # Páginas (HomePage, landing SEO, etc.)
│   ├── components/            # Componentes reutilizáveis
│   └── hooks/                 # Hooks customizados (useAuth, useSaveForm)
├── public/                    # Assets estáticos (favicon, PWA, SEO)
├── index.html                 # Entry HTML com meta tags OG
├── vercel.json                # Configuração de deploy Vercel
└── vite.config.ts             # Configuração Vite + Tailwind
```

## Backend

O backend está em `pasty/backend/`. Consulte o [README do backend](../README.md) para instruções de setup e deploy.
