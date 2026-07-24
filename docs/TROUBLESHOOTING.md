# 🔧 Troubleshooting Guide

## Problemas Comuns e Soluções

### 🔴 Backend não inicia

**Erro:** `ERR_MODULE_NOT_FOUND`

```bash
# Certifique-se de estar no diretório correto
cd universal-save/backend

# Instale as dependências
npm install

# Desenvolvimento
npm run dev

# Produção (build + start)
npm run build
npm start
```

---

### 🔴 Erro 401 ao salvar

**Causa:** Token do Google expirado ou não configurado.

**Solução:**
1. Faça logout e login novamente
2. Verifique se o `GOOGLE_CLIENT_ID` está correto no `.env`
3. Verifique se as APIs (Drive, Docs, Gmail) estão ativas no Google Cloud Console

---

### 🔴 CORS Error no navegador

**Causa:** `FRONTEND_URL` não corresponde à URL do frontend.

**Solução:**
1. Verifique `FRONTEND_URL` no backend (`.env`)
2. Desenvolvimento: `http://localhost:5173`
3. Produção: a URL exata da Vercel (com `https://`)

---

### 🔴 Login não redireciona de volta

**Causa:** Redirect URI no Google Cloud não corresponde à do backend.

**Solução:**
1. Compare a URI no Google Cloud Console com `GOOGLE_REDIRECT_URI` do `.env`
2. Dev: `http://localhost:5173/auth/callback`
3. Prod: `https://seudominio.com/auth/callback`

---

### 🔴 Build do frontend falha

```bash
cd frontend
rm -rf node_modules dist
npm install
npm run build
```

---

### 🔴 Erro "Google token expired"

**Solução automática:** O backend tenta refresh automático do token.
**Solução manual:** Faça logout e login novamente.

---

### 🔴 Railway deploy falha

1. Verifique os logs no dashboard do Railway
2. Confirme que `package.json` e `Procfile` estão na pasta `backend/`
3. Confirme que `npm run build` compila sem erros
4. Verifique se as variáveis de ambiente estão configuradas
