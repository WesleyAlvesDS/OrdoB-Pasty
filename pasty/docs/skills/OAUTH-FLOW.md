# 🔐 Skill: Fluxo OAuth 2.0 com Google

> Padrão completo de autenticação Google OAuth + JWT aprendido no Pasty.

---

## Fluxo Completo

### 1. Backend: Gerar URL de Autorização
```typescript
export function getGoogleAuthUrl(): string {
  const params = new URLSearchParams({
    client_id: config.googleClientId,
    redirect_uri: config.googleRedirectUri,
    response_type: 'code',
    scope: config.scopes.join(' '),
    access_type: 'offline',      // ← Garante refresh_token
    prompt: 'consent',           // ← Força nova autorização
  })
  return `${config.googleAuthUri}?${params.toString()}`
}
```

### 2. Backend: Trocar Código por Tokens
```typescript
export async function exchangeCodeForToken(code: string): Promise<GoogleTokens> {
  const resp = await fetch(config.googleTokenUri, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: config.googleClientId,
      client_secret: config.googleClientSecret,  // ← Server-side apenas!
      redirect_uri: config.googleRedirectUri,
      grant_type: 'authorization_code',
    }),
  })
  return resp.json()  // { access_token, refresh_token, expires_in }
}
```

### 3. Backend: Criar JWT
```typescript
export function createJwtToken(userId: number, email: string): Promise<string> {
  return sign({
    sub: String(userId),
    email,
    exp: Math.floor(Date.now() / 1000) + 24 * 3600,  // 24h
    iat: Math.floor(Date.now() / 1000),
  }, config.jwtSecret)
}
```

### 4. Backend: Verificar JWT (Middleware)
```typescript
export const authMiddleware = createMiddleware(async (c, next) => {
  const token = c.req.header('Authorization')?.slice(7)
  const payload = await verify(token, config.jwtSecret, 'HS256')
  const user = await findUserById(Number(payload.sub))
  c.set('user', user)
  await next()
})
```

### 5. Frontend: Hook de Autenticação
```typescript
export function useAuth() {
  // Restore session from localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem('utc_token')
    if (savedToken) {
      setToken(savedToken)
      // Verify token is still valid
      getMe(savedToken).then(setUser).catch(clearSession)
    }
  }, [])

  // Exchange code for JWT
  const handleCallback = async (code: string) => {
    const { token, user } = await exchangeCode(code)
    localStorage.setItem('utc_token', token)
    localStorage.setItem('utc_user', JSON.stringify(user))
    return user
  }
}
```

## Lições Aprendidas
- `access_type=offline` + `prompt=consent` juntos garantem refresh_token
- Client Secret NUNCA vai para o frontend
- JWT com `sub` (string) para compatibilidade máxima
- Verificar token no mount evita sessões quebradas
