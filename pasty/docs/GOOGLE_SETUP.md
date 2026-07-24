# ☁️ Guia de Setup — Google Cloud Console

## 🎯 O que você precisa criar

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

📸 *O botão "NOVO PROJETO" fica no canto superior direito do modal*

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

✅ As 3 APIs precisam estar ativas para o app funcionar.

---

## Passo 3: Configurar Tela de Consentimento OAuth

1. Menu ☰ → **APIs & Services > OAuth consent screen**
2. User Type: **External** (qualquer um com Google pode logar)
3. Clique em **CREATE**

### App Information
- **App name:** `Pasty`
- **User support email:** Seu e-mail
- **Logo:** Opcional
- **Authorized domains:** Seu domínio (ex: `pasty.app`)

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

📸 *Role até o final e clique em **SAVE AND CONTINUE** a cada etapa*

---

## Passo 4: Criar Credencial OAuth

1. Menu ☰ → **APIs & Services > Credentials**
2. Clique em **+ CREATE CREDENTIALS > OAuth client ID**
3. Application type: **Web application**
4. Name: `Pasty Web`

### Authorized JavaScript Origins

Adicione **duas** origens:

```
http://localhost:5173
https://seu-frontend.vercel.app
```

### Authorized Redirect URIs

Adicione **duas** URIs:

```
http://localhost:5173/auth/callback
https://seu-frontend.vercel.app/auth/callback
```

📸 *Clique em **CREATE** no final*

5. **IMPORTANTE:** Anote o **Client ID** e **Client Secret** que aparecem no modal
   - Se fechar sem copiar, você pode ver depois clicando no lápis de edição da credencial

---

## Passo 5: Publicar (para produção)

Quando estiver pronto para lançar:

1. Menu ☰ → **APIs & Services > OAuth consent screen**
2. Clique em **PUBLISH APP** (na seção "Publishing status")
3. Confirme

⚠️ **Antes de publicar:**
- Tenha certeza que as Redirect URIs de produção estão corretas
- O domínio do frontend está em "Authorized domains"

---

## 📋 Resumo das Informações

Guarde estas informações — você vai precisar para configurar o backend:

| Informação | Onde encontrar |
|------------|---------------|
| **GOOGLE_CLIENT_ID** | Credentials > Sua credencial > Client ID |
| **GOOGLE_CLIENT_SECRET** | Credentials > Sua credencial > Client Secret |
| **GOOGLE_REDIRECT_URI** | Você define (http://localhost:5173/auth/callback para dev) |

> 💡 **Dica:** Seu `GOOGLE_REDIRECT_URI` no backend `.env` deve ser igual ao que você configurou no Google Cloud Console!
