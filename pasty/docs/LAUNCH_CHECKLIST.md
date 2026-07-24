# 🚀 Checklist de Lançamento — Pasty

## 📋 Pré-Deploy

### Google Cloud
- [ ] Projeto Google Cloud criado (`Pasty`)
- [ ] Google Drive API ativada
- [ ] Google Docs API ativada
- [ ] Gmail API ativada
- [ ] Tela de consentimento OAuth configurada (modo Testing)
- [ ] OAuth Client ID criado (Web Application)
- [ ] `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET` salvos
- [ ] Redirect URIs configuradas (dev + prod)
- [ ] Seu e-mail adicionado como Test User

### Código
- [ ] Frontend builda sem erros (`npm run build`)
- [ ] Backend roda sem erros (`uvicorn backend.main:app`)
- [ ] Variáveis de ambiente documentadas no `.env.example`
- [ ] `.gitignore` configurado (node_modules, venv, .env, __pycache__)
- [ ] `sitemap.xml` criado com URLs corretas
- [ ] `robots.txt` criado
- [ ] Meta tags OG no `index.html`

### Repositório
- [ ] Repositório no GitHub criado
- [ ] Código commitado e pushado
- [ ] Branch `main` definida

---

## 🚀 Deploy

### Frontend (Vercel)
- [ ] Projeto importado na Vercel
- [ ] Diretório raiz: `frontend/`
- [ ] Build passou na Vercel
- [ ] Deploy publicado e acessível
- [ ] Domínio customizado configurado (se tiver)
- [ ] SSL ativo (Vercel fornece automático)
- [ ] `VITE_API_URL` configurada (aponta para Railway)
- [ ] `VITE_GA_MEASUREMENT_ID` configurada (se tiver GA)

### Backend (Railway)
- [ ] Projeto importado no Railway
- [ ] Diretório raiz: `backend/`
- [ ] Start command configurado
- [ ] Deploy publicado
- [ ] Railway gera URL pública (ex: `pasty.up.railway.app`)
- [ ] Variáveis de ambiente configuradas:
  - `GOOGLE_CLIENT_ID` ✅
  - `GOOGLE_CLIENT_SECRET` ✅
  - `GOOGLE_REDIRECT_URI` ✅ (aponta para Vercel)
  - `JWT_SECRET` ✅
  - `FRONTEND_URL` ✅ (aponta para Vercel)
- [ ] Domínio customizado (se tiver)

---

## ✅ Testes Pós-Deploy

### Fluxo completo
- [ ] `GET /api/health` → `{"status":"ok"}`
- [ ] Página inicial carrega sem erros no console
- [ ] Landing pages SEO carregam (`/send-text-to-pc`, `/save-text-online`)
- [ ] Clique em "Entrar com Google" → redireciona para Google
- [ ] Autorização → redireciona de volta
- [ ] Login completo → vê interface de salvar
- [ ] Colar texto → salvar em **Google Docs** → abre o documento ✅
- [ ] Colar texto → salvar em **Google Drive** → abre o arquivo ✅
- [ ] Colar texto → salvar em **Gmail** → rascunho criado ✅
- [ ] Salvar mesmo texto novamente → mostra aviso de duplicidade ✅
- [ ] Histórico mostra saves anteriores ✅
- [ ] Logout → volta para tela inicial ✅
- [ ] Login novamente → histórico preservado ✅

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

## 📢 Lançamento

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

### Mês 2-3
- [ ] **Hacker News** (quando tiver tração)
- [ ] Considerar AdSense nas páginas SEO
- [ ] Planejar modelo Freemium

---

## 📊 Métricas para Acompanhar

| Métrica | Onde ver | Meta |
|---------|----------|------|
| Usuários únicos | Google Analytics | > 100/semana |
| Textos salvos | Backend logs | > 50/dia |
| Taxa de conversão (login) | GA Events | > 30% |
| Bounce rate | Google Analytics | < 60% |
| Erros no save | Railway logs | < 1% |
| Tempo de carregamento | Lighthouse | < 3s |

---

## ❗ Antes de Publicar no Product Hunt / HN

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

> 🎯 **Lembrete:** O MVP é para validar a ideia. Não precisa estar perfeito — precisa funcionar. Lance rápido, itere com feedback.
