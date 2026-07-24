# 🔬 Algoritmos e Lógica do Pasty

> Documentação técnica detalhada de todos os algoritmos, padrões de código e lógica de negócio.

---

## 1. Algoritmo de Detecção de Duplicidade

### Problema
Usuário pode tentar salvar o mesmo texto duas vezes no mesmo destino, criando conteúdo duplicado no Google.

### Solução: Hash SHA-256 + Unique Constraint Lógica

```typescript
// 1. Gera hash do conteúdo
const contentHash = crypto.createHash('sha256').update(text).digest('hex')

// 2. Busca no banco por (user_id + hash + destination)
const existingClip = await findClipByHash(u.id, contentHash, destination)

// 3. Se existir, retorna sem chamar Google API
if (existingClip) {
  return c.json({ duplicate: true, message: '...', clip: existingClip })
}

// 4. Se não existir, salva normalmente e registra o hash
```

### Index utilizado
```sql
CREATE INDEX idx_clips_user_hash ON clips(user_id, content_hash);
```

### Por que SHA-256?
- **Determinístico**: Mesmo texto = mesmo hash (sempre)
- **Rápido**: Implementação nativa no Node.js (crypto)
- **Colisão desprezível**: 2^256 possibilidades
- **Sem falsos positivos**: Diferente de similaridade difusa

### Vantagens
- ✅ **Zero chamadas desnecessárias** à Google API
- ✅ **Proteção contra rate limit** da Google
- ✅ **Feedback instantâneo** para o usuário
- ✅ **Economia de tokens** OAuth (não precisa validar)

### Fluxo completo
```
texto → SHA-256 → busca no banco por (user_id, hash, dest)
  ├── Existe? → { duplicate: true, clip: existingClip }
  │             (não chama Google API, não salva novo registro)
  │
  └── Não existe? → chama Google API → salva clip com hash
                    → { duplicate: false, clip: newClip }
```

---

## 2. Paginação por Cursor (Keyset Pagination)

### Problema
Histórico pode ter milhões de registros. `OFFSET/LIMIT` é O(n) — a cada página, o banco escaneia todos os registros anteriores.

### Solução: Cursor Pagination com `WHERE id < $cursor`

```typescript
// Em vez de:
SELECT * FROM clips WHERE user_id = $1 
ORDER BY created_at DESC 
OFFSET 100 LIMIT 20   -- ❌ O(n) — escaneia 120 linhas

// Usamos:
SELECT * FROM clips WHERE user_id = $1 AND id < $cursor
ORDER BY created_at DESC, id DESC 
LIMIT 21               -- ✅ O(log n) — usa índice da PK
```

### Por que `id < cursor` em vez de `created_at < cursor`?
- **PK é única**: Garantia de não pular registros com mesmo timestamp
- **Índice clusterizado**: PostgreSQL otimiza busca por PK
- **Ordenação composta**: `created_at DESC, id DESC` garante consistência

### Técnica do "LIMIT + 1"
```typescript
// Busca 1 registro a mais que o necessário
const clipsResult = await pool.query(
  `SELECT * FROM clips WHERE ${whereClause} 
   ORDER BY created_at DESC, id DESC 
   LIMIT $${paramIndex}`,
  [...params, clampedLimit + 1]  // ← +1
)

// Se tem mais que limit, existe próxima página
const hasMore = clips.length > clampedLimit
if (hasMore) clips.pop()  // Remove o extra

// nextCursor = último ID da página atual
nextCursor: clips.length > 0 ? clips[clips.length - 1].id : null
```

### Performance Comparada
| Registros | OFFSET 100,000 | Cursor 100,000 | 
|-----------|---------------|----------------|
| 100 mil | ~150ms | ~2ms |
| 1 milhão | ~1.2s | ~2ms |
| 10 milhões | ~12s | ~2ms |

---

## 3. Gerenciamento de Tokens Google

### Fluxo de Refresh Automático

```typescript
async function getValidGoogleToken(user: DbUser): Promise<string> {
  // 1. Verifica se token existe
  if (!user.access_token) throw new Error('No token available')

  // 2. Verifica se expirou
  if (user.token_expires_at && new Date() >= new Date(user.token_expires_at)) {
    // 3. Se não tem refresh_token, pede reautenticação
    if (!user.refresh_token) throw new Error('No refresh token')

    // 4. Refresh automático
    const newTokens = await refreshAccessToken(user.refresh_token)
    
    // 5. Atualiza no banco
    await updateUserTokens(user.id, newTokens.access_token, null, expiresAt)
    
    // 6. Atualiza em memória
    user.access_token = newTokens.access_token
  }

  return user.access_token
}
```

### Estratégia de `access_type=offline` + `prompt=consent`
- **offline**: Garante refresh_token na primeira autorização
- **consent**: Força nova autorização mesmo que usuário já tenha aprovado
- Isso garante que sempre tenhamos refresh_token disponível

### Tabela de Expiração
| Token | Duração | Estratégia |
|-------|---------|-----------|
| Access token | 1 hora | Refresh automático |
| Refresh token | Indeterminado | Salvo no banco (nunca expira a menos que revogado) |
| JWT (sessão) | 24 horas | Relogin necessário |

---

## 4. Algoritmo de Construção Dinâmica de Queries

### Problema
O histórico tem 4 filtros opcionais: cursor, destination, search. Cada combinação precisa de uma query SQL diferente.

### Solução: Query Builder Paramétrico

```typescript
function buildHistoryQuery(userId: number, filters: Filters) {
  const conditions: string[] = ['user_id = $1']
  const params: unknown[] = [userId]
  let paramIndex = 2

  // Cada filtro adiciona condição + parametro
  if (cursor) {
    conditions.push(`id < $${paramIndex++}`)
    params.push(cursor)
  }
  if (destination) {
    conditions.push(`destination = $${paramIndex++}`)
    params.push(destination)
  }
  if (search) {
    conditions.push(`title ILIKE $${paramIndex++}`)
    params.push(`%${search}%`)
  }

  return { whereClause: conditions.join(' AND '), params }
}
```

### Por que `$1, $2, $3` (PostgreSQL) em vez de `?`?
- **Prevenção de SQL Injection**: Parâmetros são escapados pelo driver
- **Reutilização de planos**: Mesma query com params diferentes
- **Clareza**: Índice explícito de cada parâmetro
- **ILIKE**: Case-insensitive search nativo do PostgreSQL

---

## 5. Estratégia de Salvamento com Login Diferido

### Problema
Usuário não logado digita um texto e clica em "Salvar". Precisamos preservar o texto durante o redirect OAuth.

### Solução: PendingSave no sessionStorage

```typescript
const handleSaveClick = useCallback(() => {
  if (!isAuthenticated) {
    // Salva intent no sessionStorage ANTES de redirecionar
    const pending = { title, text, destination }
    sessionStorage.setItem(PENDING_KEY, JSON.stringify(pending))
    handleLogin()  // Redireciona para Google OAuth
    return
  }
  handleSave()  // Usuário logado → salva direto
}, [isAuthenticated, title, text, destination])
```

### Recuperação pós-login
```typescript
// No callback OAuth
onCallback(code).then(async () => {
  const raw = sessionStorage.getItem(PENDING_KEY)
  if (!raw) return

  sessionStorage.removeItem(PENDING_KEY)
  const pending: PendingSave = JSON.parse(raw)

  // Salva automaticamente com o token recebido
  const res = await saveText(pending.text, pending.destination, pending.title, token)
  setPendingResult({ clip: res.clip, duplicate: res.duplicate })
})
```

### Fluxo completo
```
1. Usuário digita texto (não logado)
2. Clica "Salvar" → salva { title, text, dest } no sessionStorage
3. Redireciona para Google OAuth
4. Usuário autoriza → volta para /auth/callback?code=XXX
5. Frontend troca code por JWT
6. Recupera PendingSave do sessionStorage
7. Salva texto automaticamente com o novo token
8. Exibe resultado (sucesso/erro/duplicado)
```

---

## 6. Tratamento de Erros

### Hierarquia de Erros

```typescript
// Backend
try {
  // Operação
} catch (err) {
  const message = err instanceof Error ? err.message : 'Failed'
  
  // Classificação automática do erro
  const isTokenError = message.includes('token') || message.includes('401')
  const isRateLimit = message.includes('429') || message.includes('quota')
  
  let status = 502
  if (isTokenError) status = 401
  else if (isRateLimit) status = 429
  
  return c.json({ error: message }, status)
}
```

```typescript
// Frontend
try {
  await saveText(...)
} catch (err) {
  // Extrai mensagem real do backend (Axios)
  const axiosError = err as { response?: { data?: { error?: string } } }
  const backendError = axiosError?.response?.data?.error
  
  // Fallback para erros conhecidos
  if (err.message === 'Network Error') {
    errorMsg = 'Servidor offline...'
  } else if (err.message.includes('502')) {
    errorMsg = 'Erro no servidor...'
  }
  // ...
}
```

### Erros Mapeados
| HTTP | Causa | Feedback |
|------|-------|----------|
| 401 | Token expirou | "Sessão expirada. Faça login novamente." |
| 429 | Rate limit Google | "Limite de requisições excedido. Aguarde." |
| 502 | Erro interno | "Erro no servidor." |
| Network | Backend offline | "Servidor offline. Verifique se o backend está rodando." |
| Duplicate | 200 (duplicate: true) | "Este texto já foi salvo!" |

---

## 7. Construção de Mensagens Gmail (Base64URL)

### Algoritmo de encoding
```typescript
function buildDraftMessage(email: string, subject: string, body: string): string {
  // 1. Constrói RFC 2822
  const message = [
    'From: me',
    `To: ${email}`,
    `Subject: ${subject}`,
    'Content-Type: text/plain; charset=utf-8',
    'MIME-Version: 1.0',
    '',
    body,
  ].join('\r\n')

  // 2. Base64 URL-safe (sem + / =)
  const bytes = new TextEncoder().encode(message)
  const binary = Array.from(bytes).map(b => String.fromCodePoint(b)).join('')
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}
```

### Por que base64url?
- A Gmail API exige o formato base64url (RFC 4648 §5)
- Diferente do base64 padrão: `+` → `-`, `/` → `_`, remove `=`
- O Gmail decodifica e apresenta como rascunho editável
