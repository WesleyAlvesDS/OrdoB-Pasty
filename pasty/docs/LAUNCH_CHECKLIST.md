# Checklist de Lançamento — Pasty

## Google Cloud / OAuth

- [ ] Projeto Google Cloud criado (`Pasty`)
- [ ] Google Drive API ativada
- [ ] Google Docs API ativada
- [ ] Gmail API ativada
- [ ] Tela de consentimento OAuth configurada (modo Testing → Published)
- [ ] OAuth Client ID criado (Web Application)
- [ ] `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET` salvos
- [ ] Authorized JavaScript Origins configuradas:
  - `https://pasty.ordob.com`
  - `http://localhost:5173` (dev)
- [ ] Authorized Redirect URIs configuradas:
  - `https://pasty.ordob.com/auth/callback` (prod)
  - `http://localhost:5173/auth/callback` (dev)
- [ ] Seu e-mail adicionado como Test User (enquanto em Testing)

---

## Código

- [ ] Backend compila sem erros: `cd backend && npm run build`
- [ ] Frontend compila sem erros: `cd frontend && npm run build`
- [ ] Variáveis de ambiente documentadas no `.env.example`
- [ ] `.gitignore` configurado (`node_modules`, `.env`, `dist`)
- [ ] `sitemap.xml` criado com URLs corretas
- [ ] `robots.txt` criado
- [ ] Meta tags OG no `index.html`

---

## Deploy — Frontend (Vercel)

- [ ] Projeto importado na Vercel a partir do repositório
- [ ] Diretório raiz: `frontend/`
- [ ] Build passou na Vercel
- [ ] Domínio customizado configurado: `pasty.ordob.com`
- [ ] SSL ativo (Vercel fornece automático)
- [ ] Variáveis de ambiente configuradas:
  - `VITE_API_URL=https://api.pasty.ordob.com`
- [ ] Rewrites do `vercel.json` funcionando (proxy `/api/*` → backend)

---

## Deploy — Backend (ValueHost + DirectAdmin + PM2)

- [ ] Código transferido para o servidor (`/home/arti3263/pasty-backend/`)
- [ ] `npm install` executado
- [ ] `npm run build` executado
- [ ] Arquivo `.env` criado com todas as variáveis:
  - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
  - `GOOGLE_REDIRECT_URI=https://pasty.ordob.com/auth/callback`
  - `JWT_SECRET`
  - `FRONTEND_URL=https://pasty.ordob.com`
  - `DB_HOST`, `DB_PORT=3307`, `DB_USER`, `DB_PASSWORD`, `DB_DATABASE`
  - `REDIS_URL` (se aplicável)
  - `PORT=8000`
- [ ] MySQL configurado e banco `arti3263_pasty` criado (porta 3307)
- [ ] PM2 rodando o processo: `pm2 start ecosystem.config.cjs` ou `pm2 start dist/index.js --name pasty-backend`
- [ ] PM2 salvo no startup: `pm2 save && pm2 startup`
- [ ] Porta 8000 liberada no firewall do DirectAdmin
- [ ] Health check: `curl https://api.pasty.ordob.com/api/health` → `{"status":"ok"}`

---

## Testes Pós-Deploy

### Fluxo completo
- [ ] `GET /api/health` → `{"status":"ok"}`
- [ ] Página inicial carrega sem erros no console
- [ ] Landing pages SEO carregam (`/send-text-to-pc`, `/save-text-online`)
- [ ] Clique em "Entrar com Google" → redireciona para Google
- [ ] Autorização → redireciona de volta
- [ ] Login completo → vê interface de salvar
- [ ] Colar texto → salvar em **Google Docs** → abre o documento
- [ ] Colar texto → salvar em **Google Drive** → abre o arquivo
- [ ] Colar texto → salvar em **Gmail** → rascunho criado
- [ ] Salvar mesmo texto novamente → mostra aviso de duplicidade
- [ ] Histórico mostra saves anteriores
- [ ] Logout → volta para tela inicial
- [ ] Login novamente → histórico preservado
- [ ] PendingSave: não logado → tenta salvar → redireciona OAuth → salva automaticamente

### SEO
- [ ] `/sitemap.xml` acessível
- [ ] `/robots.txt` acessível
- [ ] Meta tags aparecem no HTML
- [ ] JSON-LD estruturado aparece no HTML
- [ ] Google Search Console configurado
- [ ] Sitemap enviado ao Google Search Console

### Performance
- [ ] Lighthouse > 80 (mobile)
- [ ] Lighthouse > 90 (desktop)
- [ ] Primeira carga < 3s
- [ ] Dark mode funcionando
- [ ] Responsivo em mobile

---

## Monitoramento

- [ ] PM2 status ok: `pm2 status` (pasty-backend online)
- [ ] Logs sem erros: `pm2 logs pasty-backend --lines 50`
- [ ] Uptime Robot configurado monitorando `https://api.pasty.ordob.com/api/health`

---

## Lançamento

### Dia 1 — Publicação
- [ ] Site no ar
- [ ] Compartilhar link com amigos para testar
- [ ] Corrigir bugs que aparecerem

### Dia 2 — Divulgação
- [ ] Postar no **Reddit** (r/InternetBrasil, r/brasil, r/ferramentas)
- [ ] Postar em grupos de **WhatsApp/Telegram** de programadores
- [ ] Compartilhar com **universitários** (público-alvo)

### Semana 1
- [ ] Monitorar Google Analytics
- [ ] Coletar feedback dos primeiros usuários
- [ ] Ajustar mensagens e UX com base no feedback

### Mês 1
- [ ] Publicar no **Product Hunt**
- [ ] Avaliar métricas de retenção
- [ ] Decidir próximas features baseado em dados

---

## Métricas para Acompanhar

| Métrica | Onde ver | Meta |
|---------|----------|------|
| Usuários únicos | Google Analytics | > 100/semana |
| Textos salvos | Backend logs | > 50/dia |
| Taxa de conversão (login) | GA Events | > 30% |
| Bounce rate | Google Analytics | < 60% |
| Erros no save | PM2 logs | < 1% |
| Tempo de carregamento | Lighthouse | < 3s |

---

## Antes de Publicar no Product Hunt / HN

- [ ] Site estável sem erros conhecidos
- [ ] Pelo menos 50 usuários testaram
- [ ] Feedback incorporado
- [ ] Landing pages SEO no ar
- [ ] Analytics instalado e funcionando
- [ ] OAuth publicado (não mais "Testing")
- [ ] Domínio próprio configurado
- [ ] SSL ativo
- [ ] CORS configurado corretamente
- [ ] E-mail de suporte visível

---

> **Lembrete:** O MVP é para validar a ideia. Não precisa estar perfeito — precisa funcionar. Lance rápido, itere com feedback.
