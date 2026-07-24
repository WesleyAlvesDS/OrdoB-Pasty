# 🚀 Guia de Deploy

## Opção Principal: DirectAdmin (Apache + Node.js via CloudLinux)

Siga o guia em [`deploy.md`](../deploy.md) na raiz do projeto para deploy completo no DirectAdmin.

---

## Opção Alternativa: Vercel + Railway

Caso prefira usar Vercel (frontend) + Railway (backend) em vez de DirectAdmin:

### Frontend → Vercel

1. Conecte o repositório GitHub à Vercel
2. Importe o diretório `frontend/`
3. Configure a variável de ambiente:
   - `VITE_API_URL=https://seu-backend.railway.app`

### Backend → Railway

1. Conecte o repositório GitHub ao Railway
2. Importe o diretório `backend/`
3. Configure as variáveis de ambiente:
   - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`
   - `JWT_SECRET`, `FRONTEND_URL`, `DATABASE_PATH=./data.db`
4. O Railway executa `npm install` + `npm run build` + `node dist/index.js`

---

## Google Cloud Console

### APIs necessárias
- Google Drive API
- Google Docs API
- Gmail API

### OAuth 2.0
- **Authorized JavaScript Origins:** `https://seudominio.com`
- **Authorized Redirect URIs:** `https://seudominio.com/auth/callback`

### Escopos
- `.../auth/documents`, `.../auth/drive.file`, `.../auth/gmail.compose`

---

## Verificação Pós-Deploy

- [ ] `GET /api/health` → `{"status":"ok"}`
- [ ] Login Google funciona
- [ ] Salvar em Docs, Drive e Gmail funciona
- [ ] Histórico carrega
- [ ] Duplicidade detecta texto repetido
- [ ] Sitemap: `/sitemap.xml`
- [ ] Robots.txt: `/robots.txt`
