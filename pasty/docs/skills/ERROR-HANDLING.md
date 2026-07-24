# ⚠️ Skill: Tratamento de Erros

> Padrões de tratamento e classificação de erros aprendidos no Pasty.

---

## Backend: Classificação Automática

```typescript
try {
  // Operação Google API
} catch (err) {
  const message = err instanceof Error ? err.message : 'Failed'

  // Classificação por padrão na mensagem
  const isTokenError = message.includes('token') || message.includes('401')
  const isRateLimit = message.includes('429') || message.includes('quota')

  let status = 502  // Default: erro interno
  if (isTokenError) status = 401
  else if (isRateLimit) status = 429

  return c.json({ error: message }, status)
}
```

## Frontend: Múltiplas Camadas de Fallback

```typescript
try {
  await saveText(...)
} catch (err) {
  let errorMsg = 'Erro ao salvar. Tente novamente.'

  // 1ª camada: erro real do backend (via Axios)
  const axiosError = err as { response?: { data?: { error?: string } } }
  const backendError = axiosError?.response?.data?.error
  if (backendError) {
    errorMsg = backendError
  }
  // 2ª camada: erros de rede
  else if (err.message === 'Network Error') {
    errorMsg = 'Servidor offline...'
  }
  // 3ª camada: erros HTTP específicos
  else if (err.message.includes('502')) {
    errorMsg = 'Erro no servidor...'
  }
  // 4ª camada: mensagem genérica do erro
  else if (err instanceof Error) {
    errorMsg = err.message
  }

  setSaveError(errorMsg)
}
```

## Componente de Feedback

```tsx
function SuccessMessage({ clip, duplicate, error, onDismiss }) {
  if (error) return (
    <div className="rounded-xl border border-red-200 dark:border-red-900 
      bg-red-50 dark:bg-red-950/40 p-4 animate-fade-in">
      <span>❌</span>
      <p className="text-sm font-medium text-red-800 dark:text-red-300">Erro</p>
      <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
    </div>
  )

  if (duplicate) return (
    <div className="border-amber-200 bg-amber-50">
      ⚠️ Este texto já foi salvo!
    </div>
  )

  return (
    <div className="border-emerald-200 bg-emerald-50">
      ✅ Texto salvo com sucesso!
    </div>
  )
}
```

## Tratamento de Erros no OAuth

```typescript
// URL pode vir com ?error=access_denied
const error = params.get('error')
if (error) {
  console.error('OAuth error:', error)
  window.history.replaceState({}, '', '/')
  return  // Simplesmente volta para home sem erro
}

// Token inválido no mount → clear silencioso
getMe(savedToken)
  .then(setUser)
  .catch(() => {
    localStorage.removeItem('utc_token')
    setToken(null)  // Usuário nem percebe
  })
```

## Lições Aprendidas
- Sempre classificar erros por padrão na mensagem (não só status HTTP)
- Frontend deve ter múltiplas camadas de fallback na mensagem de erro
- Erros de token OAuth são tratados silenciosamente (sem popup)
- Cores de feedback: vermelho (erro), âmbar (duplicado), verde (sucesso)
- `window.history.replaceState` limpa parâmetros da URL sem recarregar
