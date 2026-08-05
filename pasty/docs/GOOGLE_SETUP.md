# Guia de Setup — Google Cloud Console

## O que você precisa criar

1. **Projeto no Google Cloud**
2. **APIs ativadas** (Drive, Docs, Gmail)
3. **Credencial OAuth** (Client ID + Secret)
4. **Tela de consentimento** configurada

---

## Passo 1: Criar projeto

1. Acesse **[console.cloud.google.com](https://console.cloud.google.com)**
2. Clique no seletor de projetos (topo da página, ao lado do nome "Google Cloud")
3. Clique em **NOVO PROJETO**
4. Nome: `Pasty`
5. Localização: deixe padrão
6. Clique em **CRIAR**

---

## Passo 2: Ativar APIs

1. No menu lateral ☰ → **APIs & Services > Library**
2. Pesquise e ative **cada uma**:

### Google Drive API
1. Busque: `Google Drive API`
2. Clique no resultado
3. Clique em **ATIVAR**

### Google Docs API
1. Busque: `Google Docs API`
2. Clique em **ATIVAR**

### Gmail API
1. Busque: `Gmail API`
2. Clique em **ATIVAR**

> As 3 APIs precisam estar ativas para o app funcionar.

---

## Passo 3: Configurar Tela de Consentimento OAuth

1. Menu ☰ → **APIs & Services > OAuth consent screen**
2. User Type: **External** (qualquer um com Google pode logar)
3. Clique em **CREATE**

### App Information
- **App name:** `Pasty`
- **User support email:** Seu e-mail
- **Logo:** Opcional
- **Authorized domains:** `ordob.com` (domínio do ecossistema)

### Developer Contact
- Seu e-mail

### Scopes
Clique em **ADD OR REMOVE SCOPES** e adicione:

```
.../auth/documents        → Google Docs API
.../auth/drive.file       → Google Drive API (arquivos que você criar)
.../auth/gmail.compose    → Gmail API (rascunhos)
openid                    → Login
email                     → Ver e-mail
profile                   → Ver nome/foto
```

### Test Users
Adicione seu e-mail como usuário de teste. Enquanto estiver em "Testing", só usuários adicionados aqui podem logar.

---

## Passo 4: Criar Credencial OAuth

1. Menu ☰ → **APIs & Services > Credentials**
2. Clique em **+ CREATE CREDENTIALS > OAuth client ID**
3. Application type: **Web application**
4. Name: `Pasty Web`

### Authorized JavaScript Origins

Adicione **duas** origens (produção e desenvolvimento):

```
https://pasty.ordob.com
http://localhost:5173
```

### Authorized Redirect URIs

O **frontend** do Pasty recebe o callback OAuth na rota `/auth/callback` (é para lá que o Google redireciona o usuário após autorizar) e, em seguida, envia o `code` para o backend (`POST /api/auth/callback`), que troca o código por um JWT. Adicione **duas** URIs:

```
https://pasty.ordob.com/auth/callback
http://localhost:5173/auth/callback
```

> A URI de redirecionamento precisa corresponder exatamente ao valor de `GOOGLE_REDIRECT_URI` no `.env` do backend.

5. **IMPORTANTE:** Anote o **Client ID** e **Client Secret** que aparecem no modal
   - Se fechar sem copiar, você pode ver depois clicando no lápis de edição da credencial

---

## Passo 5: Publicar (para produção)

Quando estiver pronto para lançar:

1. Menu ☰ → **APIs & Services > OAuth consent screen**
2. Clique em **PUBLISH APP** (na seção "Publishing status")
3. Confirme

**Antes de publicar:**
- Tenha certeza que as Redirect URIs de produção estão corretas
- O domínio `ordob.com` está em "Authorized domains"
- Teste o fluxo completo com um usuário de teste primeiro

---

## Atualizar Credenciais no Servidor (ValueHost)

Após criar ou alterar as credenciais no Google Cloud Console:

1. Acesse o servidor via SSH:
   ```bash
   ssh arti3263@br64-da.valueserver.net.br -p 1157
   ```

2. Edite o arquivo `.env` no backend:
   ```bash
   cd /home/arti3263/domains/api.pasty.ordob.com/public_html/OrdoB-Pasty/pasty/backend
   nano .env
   ```

3. Atualize os valores de `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET`

4. Reinicie o PM2:
   ```bash
   pm2 restart pasty-api
   ```

---

## Troubleshooting: Erro 400 `redirect_uri_mismatch`

Se o login mostra **"Erro 400: redirect_uri_mismatch"**, a `redirect_uri` enviada pelo backend **não corresponde exatamente** a uma das URIs registradas no Google Cloud Console.

1. O backend envia o valor de `GOOGLE_REDIRECT_URI` do `.env`. Em produção deve ser:
   ```
   GOOGLE_REDIRECT_URI=https://pasty.ordob.com/auth/callback
   ```
2. Confira no **APIs & Services > Credentials** (do Client ID usado) que esta URI está em **Authorized Redirect URIs** — caractere por caractere, sem barra final extra.
3. Confira também em **Authorized JavaScript Origins**: `https://pasty.ordob.com`.
4. Se o app estiver em modo **Testing**, o e-mail que faz login precisa estar em **Test users**.

---

## Resumo das Informações

Guarde estas informações — você vai precisar para configurar o backend:

| Informação | Onde encontrar |
|------------|---------------|
| **GOOGLE_CLIENT_ID** | Credentials > Sua credencial > Client ID |
| **GOOGLE_CLIENT_SECRET** | Credentials > Sua credencial > Client Secret |
| **GOOGLE_REDIRECT_URI (dev)** | `http://localhost:5173/auth/callback` |
| **GOOGLE_REDIRECT_URI (prod)** | `https://pasty.ordob.com/auth/callback` |
| **FRONTEND_URL (dev)** | `http://localhost:5173` |
| **FRONTEND_URL (prod)** | `https://pasty.ordob.com` |

> **Dica:** O `GOOGLE_REDIRECT_URI` no backend `.env` deve ser **exatamente igual** ao que você configurou no Google Cloud Console!
