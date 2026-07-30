# Arquitetura e Design do Pasty

> Documentação completa da arquitetura, lógica de funcionamento e decisões de design.

---

## 1. Design System

### 1.1 Paleta de Cores

```css
/* Primária — Violeta/Purple (ação principal) */
Violet-500  (#8b5cf6)  → Botões primários, links, destaque
Purple-600  (#9333ea)  → Gradientes, hover states

/* Secundária — Esmeralda (confirmação/sucesso) */
Emerald-500 (#10b981)  → Badges de sucesso, CTAs secundários
Teal-600    (#0d9488)  → Gradiente da landing SaveTextOnline

/* Acento — Âmbar (aviso/atenção) */
Amber-500   (#f59e0b)  → Badges de aviso, tema dos Termos de Uso

/* Neutra (modo claro) */
Gray-50     (#f9fafb)  → Fundo da página
Gray-900    (#111827)  → Texto principal
Gray-500    (#6b7280)  → Texto secundário

/* Neutra (modo escuro) */
Gray-950    (#030712)  → Fundo da página
White       (#ffffff)  → Texto principal
Gray-400    (#9ca3af)  → Texto secundário
```

### 1.2 Tipografia

- **Fonte**: Inter (Google Fonts) — carregada com preload
- **Escala**: text-xs (12px) → text-lg (18px) → text-4xl/5xl (títulos)
- **Headers**: font-bold + tracking-tight + leading-[1.05]
- **Corpo**: text-gray-500/400 (light/dark)

### 1.3 Componentes Recorrentes

| Componente | Uso | Variações |
|-----------|-----|-----------|
| Badge | Tags de status/categoria | `inline-flex items-center gap-1.5 px-3 py-1 rounded-full` + cor específica |
| Card | Containers de conteúdo | `.rounded-2xl border bg-white dark:bg-gray-900 shadow-sm hover:shadow-lg` |
| Botão gradiente | CTAs principais | `bg-gradient-to-r from-X-600 to-Y-600 text-white` |
| Botão outline | Ações secundárias | `border border-gray-200 text-gray-600 hover:bg-gray-50` |
| Input | Campos de texto | `rounded-xl border-2 focus:ring-4 focus:ring-violet-500/20` |

### 1.4 Animações

```css
@keyframes fade-in {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes slide-up {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Uso: animações stagger para listas e grids */
style={{ animation: `fade-in 0.3s ease-out ${index * 0.03}s both` }}
```

---

## 2. Fluxo de Dados Completo

### 2.1 Fluxo de Salvamento

```
Usuário digita texto → clica "Salvar"
    │
    ├── Não logado?
    │   ├── Salva intent no sessionStorage (PendingSave)
    │   ├── Redireciona para Google OAuth
    │   └── Após login, recupera PendingSave e salva automaticamente
    │
    └── Logado?
        ├── POST /api/save { text, destination, title }
        │   ├── Valida destination (docs|drive|gmail)
        │   ├── Valida text não vazio
        │   ├── Gera SHA-256 do text
        │   ├── Verifica duplicidade no banco (user_id + hash + destination)
        │   │   ├── Duplicado → retorna { duplicate: true, clip }
        │   │   └── Novo → continua
        │   ├── Verifica validade do token Google
        │   │   ├── Expirado? → Refresh automático via refresh_token
        │   │   └── Válido? → Continua
        │   ├── Chama Google API correspondente
        │   │   ├── docs  → createGoogleDoc()  → { documentId }
        │   │   ├── drive → createGoogleDriveFile() → { fileId }
        │   │   └── gmail → createGmailDraft() → { draftId }
        │   ├── Salva clip no MySQL (INSERT com RETURNING via LAST_INSERT_ID)
        │   └── Retorna { clip, duplicate: false }
        │
        └── Resposta:
            ├── Sucesso → Exibe SuccessMessage, limpa formulário
            ├── Duplicado → Exibe aviso (não limpa formulário)
            └── Erro → Exibe mensagem de erro específica
                ├── 401 → Token inválido/expirado
                ├── 429 → Rate limit Google
                └── 502 → Erro genérico do servidor
```

### 2.2 Fluxo de Autenticação

```
Usuário clica "Fazer login"
    │
    ├── Frontend: GET /api/auth/google/login
    │   └── Backend: retorna URL de autorização Google
    │
    ├── Usuário autoriza no Google → redireciona para callback
    │
    ├── Frontend/Backend detecta ?code=
    │   ├── Chama POST /api/auth/callback { code }
    │   │   ├── Exchange code → tokens (access + refresh)
    │   │   ├── Busca user info Google (nome, email, avatar)
    │   │   ├── Procura user no banco por google_id
    │   │   ├── Se novo → createUser (com tokens)
    │   │   ├── Se existente → updateUserTokens
    │   │   ├── Gera JWT { sub: userId, email, exp }
    │   │   └── Retorna { token, user }
    │   └── Salva token + user no localStorage
    │
    └── Usuário autenticado! Verifica PendingSave
        └── Se existia texto pendente → salva automaticamente
```

### 2.3 Fluxo de Histórico (Cursor Pagination)

```
GET /api/history?cursor={id}&limit=20&destination={filtro}&search={termo}

Backend:
1. Constrói WHERE dinâmico com ? placeholders (parametrizado)
2. Busca limit + 1 registros (para detectar próxima página)
3. Se tem mais que limit → descarta último, nextCursor = lastClip.id
4. Retorna { clips[], nextCursor, total }

Frontend:
1. Estado: clips[], nextCursor, total, loading, error
2. Filtros: destination (tabs), search (debounce 300ms)
3. Load more: anexa ao array existente
4. Animações stagger: cada clip com fade-in indexado
```

---

## 3. Árvore de Componentes (Frontend)

```
<App>
  ├── <GoogleAnalytics />                    # GA4 tracking
  │
  ├── <Routes>
  │   ├── "/" → <HomePage>                   # App principal
  │   │   ├── <Header user={user} />         # Sticky nav + login state
  │   │   ├── {destinations.map → Card}      # Preview destinos
  │   │   ├── <SuccessMessage />             # Feedback (sucesso/erro/duplicado)
  │   │   ├── <Form>
  │   │   │   ├── <input title />
  │   │   │   ├── <TextBox />                # Textarea + contagem
  │   │   │   ├── <DestinationSelector />    # Tabs Docs/Drive/Gmail
  │   │   │   └── <SaveButton />             # CTA com estados
  │   │   ├── <History />                    # Lista paginada
  │   │   │   ├── <HistoryFilters />         # Search + destination filter
  │   │   │   └── {clips.map → ClipCard}    # Item do histórico
  │   │   └── <Footer />
  │   │
  │   ├── "/auth/callback" → <HomePage />    # Preserva ?code=
  │   ├── "/send-text-to-pc" → <SendTextToPc />
  │   ├── "/save-text-online" → <SaveTextOnline />
  │   ├── "/privacy" → <PrivacyPolicy />
  │   └── "/terms" → <TermsOfService />
  │
  └── [Catch-all: redirect to /]
```

---

## 4. Decisões Técnicas

### 4.1 Por que Hono em vez de Express?
- **Performance**: Hono é significativamente mais rápido que Express
- **TypeScript nativo**: Tipos integrados sem @types extras
- **Middleware moderno**: API baseada em factory, não classes
- **Tamanho**: ~14KB vs Express ~200KB

### 4.2 Por que Tailwind CSS v4?
- **Utility-first**: Sem context switching CSS/JSX
- **Build zero**: Não precisa de PostCSS config (Vite plugin nativo)
- **Dark mode**: `dark:` variants sem configuração extra
- **Performance**: Purge automático de CSS não usado

### 4.3 Por que cursor pagination em vez de OFFSET?
- **O(log n)** vs **O(n)** — essencial para milhões de registros
- **Consistente**: Mesmo que novos registros sejam inseridos, o cursor não desvia
- **Sem "page drift"**: Cliente não vê registros repetidos ao navegar
- **Ideal para infinite scroll**: Basta passar o último ID como cursor

### 4.4 Por que sessionStorage para PendingSave?
- **Não persiste** após fechar o navegador (segurança)
- **Sobrevive** ao redirect OAuth (mesma aba)
- **Diferente do localStorage**: Não precisa limpar manualmente
- **Estrutura**: `{ title, text, destination }` — salva o intent completo

### 4.5 Por que MySQL em vez de SQLite em produção?
- **Concorrência**: Múltiplas conexões simultâneas sem locks de escrita
- **Performance**: Índices, query planner, parallel queries
- **Escalabilidade**: Connection pooling (mysql2 Pool), replication
- **Confiabilidade**: WAL, crash recovery, constraints (FK, CHECK)
- **Disponível no ValueHost**: MySQL 8+ nativo no DirectAdmin

---

## 5. Temas (Claro/Escuro)

### Implementação
- **CSS**: `prefers-color-scheme` no `:root` + `dark:` variants do Tailwind
- **Sem toggle manual** (no MVP) — segue configuração do sistema
- **Scrollbar**: Customizada com `oklch()` para cada tema
- **Selection**: Customizado com `oklch()` para cada tema

### Cobertura
- 100% dos componentes com variantes `dark:`
- Cores neutras: `gray-50/900` (light) → `gray-950/white` (dark)
- Cores de ação mantidas (violeta funciona em ambos)
- Sombras adaptadas: `shadow-violet-100/50` (light) → `shadow-violet-950/30` (dark)

---

## 6. Responsividade

| Breakpoint | Largura | Comportamento |
|-----------|---------|---------------|
| Mobile | < 640px | Layout single column, nav collapsible |
| Tablet | 640px+ | Grid 2 colunas, nav horizontal |
| Desktop | 1024px+ | Grid 4 colunas no footer, layout completo |

### Mobile First
- Todas as páginas usam `flex-col` como base
- `sm:` para layouts de tablet
- `lg:` para layouts desktop
- Header: menu hamburger no mobile, nav links no desktop
