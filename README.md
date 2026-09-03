# OrdoB Pasty

[![OrdoB Pasty](https://img.shields.io/badge/OrdoB-Pasty-5CE1E6?style=for-the-badge)](#)

Utilitário de alta produtividade (Clipboard in the Cloud). Cole qualquer texto longo e salve de forma limpa e automática diretamente nas suas plataformas cloud favoritas: Google Docs, Google Drive, ou como rascunho no Gmail.

## 🚀 Destaques do Projeto (Para Recrutadores e Engenheiros)

O **OrdoB Pasty** é uma demonstração de microsserviço leve, veloz e focado, utilizando ferramentas Edge-ready de nova geração. 

- **App Fullstack Moderno:** Framework **Hono** (altamente eficiente para Edge e Node) atrelado ao **React 19** e **Vite**.
- **OAuth 2.0 e Interoperabilidade:** Autenticação impecável e autorização OAuth via Google Cloud APIs, manipulando e injetando documentos nativamente na suíte do Google Workspace.
- **Cache e Performance:** Uso de banco de dados in-memory (Redis via Unix Sockets no backend de produção) para velocidade otimizada, mitigação de abusos e controle de sessão.
- **Idempotência (Anti-duplicidade):** Gera hashs (SHA-256) dos fragmentos salvos. Previne múltiplas requisições de salvar acidentalmente o mesmo arquivo no Drive do usuário.

## 🛠️ Stack Tecnológica

| Camada | Tecnologia |
|--------|------------|
| **Frontend** | React 19 + Vite + TypeScript + Tailwind CSS v4 |
| **Backend** | Hono v4 + TypeScript + Node.js |
| **Auth & APIs** | Google OAuth 2.0 (Docs API, Drive API, Gmail API) |
| **Data & Cache** | MySQL 8 (mysql2) + Redis (ioredis) |

## 📁 Estrutura Core

```
pasty/
├── backend/
│   ├── src/services/
│   │   ├── docs.ts   # Criação pragmática no Google Docs via API
│   │   ├── drive.ts  # Upload de buffers txt
│   │   └── gmail.ts  # Injeção de email drafts
│   ├── src/index.ts  # Hono Router + Rate Limits
│   └── ecosystem...  # Setup do PM2 (Produção)
└── frontend/
    └── src/          # React SPA (TanStack/Axios)
```

## 🔧 Setup Local (Desenvolvimento)

1. **Configuração Google Cloud:** 
   Você precisará de um Client ID do Google Cloud com escopos de Drive, Docs e Gmail habilitados, listados no `.env`.
   
2. **Iniciando Backend:**
   ```bash
   cd pasty/backend
   npm install
   npm run dev
   ```

3. **Iniciando Frontend:**
   ```bash
   cd pasty/frontend
   npm install
   npm run dev
   ```

---
*Criado como parte da suíte OrdoB, o Pasty exemplifica a capacidade de resolver problemas práticos e integrações de terceiros B2B usando as stacks Typescript mais velozes do mercado.*