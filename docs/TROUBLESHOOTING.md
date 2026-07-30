# 🔧 Troubleshooting Guide

## Problemas Comuns e Soluções

### 🔴 Backend não inicia

**Erro:** `ERR_MODULE_NOT_FOUND`

```bash
# Certifique-se de estar no diretório correto
cd /home/arti3263/pasty-backend

# Instale as dependências
npm install

# Desenvolvimento
npm run dev

# Produção (build + start)
npm run build
pm2 start ecosystem.config.cjs
```

**Erro:** Porta já em uso

```bash
# Verifique o que está na porta 3001
lsof -i :3001

# Mate o processo e reinicie
pm2 delete pasty-backend
pm2 start ecosystem.config.cjs
```

---

### 🔴 Erro 401 ao salvar

**Causa:** Token do Google expirado ou não configurado.

**Solução:**
1. Faça logout e login novamente
2. Verifique se o `GOOGLE_CLIENT_ID` está correto no `.env`
3. Verifique se as APIs (Drive, Docs, Gmail) estão ativas no Google Cloud Console
4. O Redis deve estar rodando para cache de refresh tokens

---

### 🔴 CORS Error no navegador

**Causa:** `FRONTEND_URL` não corresponde à URL do frontend.

**Solução:**
1. Verifique `FRONTEND_URL` no backend (`.env`)
2. Desenvolvimento: `http://localhost:5173`
3. Produção: `https://pasty.ordob.com`

---

### 🔴 Login não redireciona de volta

**Causa:** Redirect URI no Google Cloud não corresponde à do backend.

**Solução:**
1. Compare a URI no Google Cloud Console com `GOOGLE_REDIRECT_URI` do `.env`
2. Dev: `http://localhost:5173/auth/callback`
3. Prod: `https://pasty.ordob.com/auth/callback`

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

**Solução automática:** O backend tenta refresh automático do token (via Redis cache).
**Solução manual:** Faça logout e login novamente.

---

### 🔴 Conexão com MySQL falha

**Causa:** Credenciais incorretas ou host errado.

**Solução:**
1. Verifique `DATABASE_URL` no `.env` do backend
2. Confirme host, porta (3307), database name e senha no DirectAdmin
3. Teste a conexão manualmente:
   ```bash
   mysql -u arti3263_pasty -p -h localhost -P 3307 arti3263_pasty
   ```

---

### 🔴 Redis não responde

**Causa:** Redis pode não estar rodando no servidor.

**Solução:**
```bash
# Verificar status
redis-cli ping

# Se não responder, inicie o Redis
sudo systemctl start redis
# ou
redis-server --daemonize yes
```

---

### 🔴 PM2 crash loop

**Causa:** Erro no código ou variável de ambiente faltando.

**Solução:**
```bash
# Veja os logs
pm2 logs pasty-backend --lines 50

# Verifique o status
pm2 status

# Reinicie com reset
pm2 delete pasty-backend
pm2 start ecosystem.config.cjs
```

---

### 🔴 Deploy na Vercel falha

1. Verifique os logs no dashboard da Vercel
2. Confirme que `npm run build` roda localmente sem erros
3. Verifique se `VITE_API_URL` está configurada corretamente
4. Confirme que o output directory é `dist`

---

### 🔴 Mudanças no frontend não aparecem

1. Verifique se o deploy na Vercel foi concluído
2. Hard refresh no navegador (Ctrl+Shift+R / Cmd+Shift+R)
3. Limpe o cache do navegador
4. Verifique se o git push foi feito para a branch correta
