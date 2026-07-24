# 🚀 Deploy no DirectAdmin

Guia passo a passo para publicar o **Pasty** no DirectAdmin (Apache/LiteSpeed + CloudLinux Node.js).

---

## Visão Geral

O deploy é dividido em duas partes:

1. **Frontend (React + Vite)** → arquivos estáticos (SPA) no `public_html`
2. **Backend (Hono + Node.js)** → aplicação Node.js rodando via CloudLinux Passenger

---

## Passo 1: Frontend

### 1.1 Build

```bash
cd universal-save/frontend
npm install
npm run build
```

Gera a pasta `dist/` com os arquivos HTML, CSS e JS compilados.

### 1.2 Enviar para o DirectAdmin

- Acesse o **Gerenciador de Arquivos** do DirectAdmin
- Vá até `domains/seudominio.com/public_html`
- Envie **todo o conteúdo** da pasta `dist/` para dentro de `public_html/`
  (não a pasta `dist` em si, mas o conteúdo dela)

### 1.3 .htaccess para SPA (React Router)

Crie o arquivo `.htaccess` dentro de `public_html/`:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

Isso faz o Apache servir o `index.html` para qualquer rota (necessário para o React Router).

---

## Passo 2: Backend

### 2.1 Build

```bash
cd universal-save/backend
npm install
npm run build
```

Isso compila o TypeScript e gera a pasta `dist/` com o `index.js`.

### 2.2 Preparar arquivos

Compacte em .zip apenas:
- `dist/` (com o `index.js` dentro)
- `package.json`
- `package-lock.json`
- `.env` (com as credenciais reais — já preenchido)

### 2.3 Configurar Node.js App no DirectAdmin

1. No painel DirectAdmin, vá em **Setup Node.js App** (CloudLinux / Passenger)
2. Clique em **Create Application**
3. Preencha:
   - **Node.js version:** 20.x ou 22.x
   - **Application mode:** Production
   - **Application root:** pasta do backend (ex: `backend`)
   - **Application URL:** subdomínio ou caminho (ex: `api.seudominio.com`)
   - **Application startup file:** `dist/index.js`
4. Clique em **Create**

### 2.4 Enviar arquivos

- No Gerenciador de Arquivos, abra a pasta criada para a aplicação
- Extraia o .zip do backend dentro dessa pasta

### 2.5 Instalar dependências

- Edite a aplicação Node.js criada
- Clique em **Run NPM Install** — o DirectAdmin instalará as dependências

### 2.6 Iniciar

- Clique em **Start Application** (ou Restart)

---

## Passo 3: Google Cloud Console

### 3.1 Criar projeto e ativar APIs

1. Acesse [console.cloud.google.com](https://console.cloud.google.com)
2. Crie projeto: **Pasty**
3. Ative as APIs:
   - Google Drive API
   - Google Docs API
   - Gmail API

### 3.2 Configurar OAuth

1. **APIs & Services > Credentials > Create Credentials > OAuth Client ID**
2. Tipo: **Web Application**
3. **Authorized JavaScript Origins:**
   - `https://seudominio.com`
4. **Authorized Redirect URIs:**
   - `https://seudominio.com/auth/callback`
5. Anote o **Client ID** e **Client Secret**

### 3.3 Tela de consentimento

1. **APIs & Services > OAuth consent screen**
2. User Type: **External**
3. Escopos: `.../auth/documents`, `.../auth/drive.file`, `.../auth/gmail.compose`
4. Adicione seu e-mail como Test User

---

## Passo 4: Variáveis de Ambiente

O arquivo `.env` do backend já deve estar preenchido. Verifique:

```
GOOGLE_CLIENT_ID=seu-client-id
GOOGLE_CLIENT_SECRET=seu-client-secret
GOOGLE_REDIRECT_URI=https://seudominio.com/auth/callback
JWT_SECRET=sua-chave-secreta
FRONTEND_URL=https://seudominio.com
DATABASE_PATH=./data.db
PORT=8000
```

> Após alterar o `.env`, **reinicie** a aplicação Node.js no DirectAdmin.

---

## Verificação Pós-Deploy

- [ ] `GET /api/health` → `{"status":"ok"}`
- [ ] Página inicial carrega sem erros
- [ ] Login com Google funciona
- [ ] Salvar em Docs/Drive/Gmail funciona
- [ ] Histórico carrega
- [ ] Duplicidade detecta texto repetido
- [ ] Sitemap: `/sitemap.xml`
- [ ] Robots.txt: `/robots.txt`

---

## Alternativa: SSH + PM2

Se tiver acesso SSH/VPS:

```bash
ssh usuario@seu-servidor
npm install -g pm2                # se não tiver

# Envie os arquivos do backend compilados
cd /caminho/do/backend
npm install --production
pm2 start dist/index.js --name "pasty-backend"
```

Configure proxy reverso no DirectAdmin para redirecionar `api.seudominio.com` para `localhost:8000`.
