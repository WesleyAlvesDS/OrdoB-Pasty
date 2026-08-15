# 🚀 Pasty — Plano de Produto & SEO

**Cole, organize, acesse. Seu texto sempre com você.**

---

## 🎯 Objetivo do Produto

Criar uma ferramenta onde o usuário:
1. Entra com Google
2. Cola um texto
3. Escolhe onde salvar (Google Docs, Google Drive, Gmail Draft)
4. O sistema cria o conteúdo no destino escolhido
5. Acessa de qualquer dispositivo

**Missão SEO**: Posicionar `pasty.ordob.com` como **TOP 1 no Google** para buscas como:
- "pasty" / "colar texto" / "formatar texto" / "salvar texto online" / "enviar texto para pc" / "texto para google docs" / "colar texto google drive"

---

## 📊 Status Atual do Produto

### MVP — Completo ✅

| Tem | Não Tem |
|-----|---------|
| ✅ Login Google | ❌ App mobile |
| ✅ Interface simples (Tailwind v4) | ❌ Extensão Chrome |
| ✅ Google Docs | ❌ IA |
| ✅ Google Drive | ❌ Sistema de assinatura |
| ✅ Gmail Draft | ❌ Banco armazenando textos completos |
| ✅ Histórico básico | ❌ |
| ✅ Controle de duplicidade (SHA-256) | ❌ |
| ✅ TextTools (Stats, Cleanup, Detect, Export, Templates) | ❌ |

### Stack ✅

```
Frontend:   React 19 + Vite + TypeScript + Tailwind CSS v4
Backend:    Hono v4 + TypeScript + Node.js
Auth:       Google OAuth 2.0
Banco:      MySQL (mysql2) + Redis (ioredis) para cache
Deploy:     Frontend → Vercel | Backend → ValueHost (DirectAdmin + PM2)
```

### Arquitetura de SEO (SPA + React Router)

- **SEO via JavaScript**: `SEO.tsx` injeta dinamicamente meta tags via `useEffect`
- **Meta tags estáticas no `index.html`**: title, description, OG, Twitter, JSON-LD, hreflang
- **Landing pages dedicadas**: `/send-text-to-pc`, `/save-text-online`
- **Google Analytics**: instalado via `GoogleAnalytics.tsx`
- **Google AdSense**: `ca-pub-4516147510474933` ativo no index.html

---

## 🔍 Relatório de SEO — Análise Ponto a Ponto

### 1. Pontos Fortes ✅

| Área | Status | Observação |
|------|--------|------------|
| Meta tags no HTML | ✅ | Title, description, OG, Twitter, canonical todos presentes |
| JSON-LD estruturado | ✅ | WebApplication + BreadcrumbList |
| Landing pages | ✅ | 2 páginas (`/send-text-to-pc`, `/save-text-online`) com conteúdo rico |
| FAQ com FAQPage schema | ✅ | Na página `/save-text-online` |
| Google Analytics | ✅ | Implementado |
| Google AdSense | ✅ | Conta configurada e script carregado |
| PWA | ✅ | Manifest, ícones, theme-color configurados |
| Responsividade | ✅ | Mobile-first |
| Preconnect fonts | ✅ | Google Fonts precarregado |
| Hreflang | ✅ | pt-BR + x-default |
| Robots meta | ✅ | `index, follow` |

### 2. Gaps Críticos de SEO ❌

| Gap | Prioridade | Solução |
|-----|-----------|---------|
| **Sitemap.xml** | 🔴 CRÍTICO | Não existe. Precisa gerar dinamicamente com todas as rotas |
| **robots.txt** | 🔴 CRÍTICO | Não existe. Precisa apontar para sitemap e bloquear rotas privadas |
| **Schema.org Article/Blog** | 🟡 ALTA | Nenhuma página tem conteúdo de artigo/blog para rankeamento de conteúdo |
| **Imagens otimizadas** | 🟡 ALTA | OG image é estática; precisa de imagens otimizadas para cada landing page |
| **Core Web Vitals** | 🟡 ALTA | Vite SPA carrega rápido, mas precisa validar no PageSpeed |
| **Conteúdo de valor** | 🟡 ALTA | Precisa de blog/guia sobre "como usar" e dicas |
| **Backlinks** | 🟡 ALTA | Nenhuma estratégia de backlinks ainda |
| **Title tags dinâmicos** | 🟢 MÉDIA | SEO.tsx gerencia via JS, mas sem SSR o Google precisa executar JS |
| **Schema FAQ na home** | 🟢 MÉDIA | Só tem FAQ na página SaveTextOnline |
| **Open Graph image dinâmica** | 🟢 MÉDIA | Imagem OG única para todas as páginas |
| **Testemunhos/depoimentos** | 🟢 MÉDIA | Social proof ajuda conversão e SEO |
| **Trust signals (selos de segurança)** | 🟢 MÉDIA | Só menciona criptografia, mas sem selos visuais |

---

## 🚀 Roadmap de Features (Curto Prazo — Fácil de Implementar)

### SEO & Infra (Semana 1-2)

- [ ] **`public/sitemap.xml`** — XML com todas as rotas estáticas e dinâmicas
- [ ] **`public/robots.txt`** — Apontar para sitemap, bloquear `/auth/`, `/api/`
- [ ] **`vercel.json`** — Headers de segurança, redirects, ISR para landing pages
- [ ] **Schema.org HowTo** — Tutorial passo a passo na página principal
- [ ] **Dynamic OG images** — Imagem OG única por landing page (via OG:pic ou similar)
- [ ] **Trust badges** — Selo "100% Grátis", "Sem cartão", "Conexão segura Google"
- [ ] **Schema Review/AggregateRating** — Se possível, adicionar reviews

### Features do Produto (Semana 2-4)

1. **Auto-título inteligente** — Detecta título do texto colado (regex, primeira linha, etc.)
2. **Formato de saída no Docs** — Checkbox: "Criar DOCX formatado com título/negrito"
3. **Templates de título personalizáveis** — `{{date}}`, `{{first_words}}`, `{{timestamp}}`
4. **Tema claro/escuro persistente** — Salva preferência no localStorage
5. **Atalho de teclado: Ctrl+Enter → salvar** — Já parcialmente implementado
6. **Modo "apresentação"** — Oculta UI, mostra texto em tela cheia
7. **Contador de caracteres/palavras/tempo de leitura** — Já tem TextStats, mas integrar mais prominentemente
8. **Exportar como Markdown/Markdown no Docs** — Formato simples para blogs

### Features de Tráfego (Semana 3-4)

9. **Compartilhar link único** — `?share=<base64>` já existe, mas pode ter landing page de destino
10. **Deep link para app** — Se o app mobile existir, link abre o app diretamente
11. **Bookmarklet** — Script JS para colar texto selecionado com 1 clique
12. **Widget de contador** — "X textos salvos hoje" — social proof dinâmico

---

## 🎯 Palavras-Chave-Alvo (Google Search)

### Keyword Clusters

| Cluster | Keywords | Volume (est.) | Dificuldade |
|---------|----------|---------------|-------------|
| **Core tool** | "pasty", "colar texto", "formatar texto" | 1K-10K | Média |
| **Salvar online** | "salvar texto online", "salvar texto grátis", "notas online" | 10K-100K | Alta |
| **Celular→PC** | "enviar texto para pc", "texto do celular para pc", "transferir texto android" | 5K-50K | Alta |
| **Google integration** | "salvar texto no google drive", "colar texto no google docs", "texto para gmail" | 10K-100K | Alta |
| **Alternativas** | "pastebin alternativa", "colar textos online", "ferramenta envio texto" | 1K-10K | Baixa |

### Estratégia de Conteúdo (Blog interno)

Criar uma seção de blog em `/blog` com artigos:

1. **"Como enviar texto do celular para o PC em 10 segundos"**
2. **"5 alternativas ao Pastebin para salvar textos online"**
3. **"Como salvar textos no Google Docs automaticamente"**
4. **"Transferir texto do iPhone para PC: 3 métodos comparados"**
5. **"Por que usar ferramentas de texto online em vez de apps?"**

Cada artigo linka para features do Pasty → converte tráfego orgânico em usuários.

---

## 🔑 Roadmap de Monetização

```
MVP (agora):   100% grátis → construir audiência + validar ideia
Mês 1-2:       AdSense nas landing pages SEO + afiliados (links de monetização)
Mês 3:         Freemium (limite de saves/mês: 50 grátis, ilimitado no premium: R$ 9,90/mês)
Mês 6:         Extensão Chrome (produto premium) + planos pagos
Mês 12:        Integração Notion, Dropbox, API pública
```

---

## 🏗️ Arquitetura Técnica — Pontos de Atenção SEO

### SPA + React Router — Implicações

1. **Meta tags via JS**: O `SEO.tsx` usa `useEffect` para injetar tags. O Googlebot executa JS, mas outros bots podem não. Solução: manter meta tags estáticas no `index.html` para a home, e tags dinâmicas para rotas internas.

2. **Rotas dinâmicas**: Como é SPA, o `index.html` é servido para todas as rotas. Precisa configurar rewrites no Vercel (`vercel.json`):
   ```json
   { "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
   ```

3. **Prerender**: Considere prerender para landing pages usando `prerender-spa-plugin` ou migrar para Next.js no futuro.

---

## ✅ Plano de Ação Imediato (Priorizado)

| # | Tarefa | Prioridade | Tempo |
|---|--------|-----------|-------|
| 1 | Criar `public/sitemap.xml` | 🔴 CRÍTICO | 15 min |
| 2 | Criar `public/robots.txt` | 🔴 CRÍTICO | 10 min |
| 3 | Configurar `vercel.json` (headers, redirects, rewrites) | 🔴 CRÍTICO | 30 min |
| 4 | Adicionar Schema.org HowTo na Home | 🟡 ALTA | 2h |
| 5 | Trust badges na Home + footer | 🟡 ALTA | 1h |
| 6 | Google Search Console | 🟡 ALTA | 5 min |
| 7 | Bing Webmaster Tools | 🟡 ALTA | 5 min |
| 8 | Testar Core Web Vitals (PageSpeed Insights) | 🟡 ALTA | 10 min |
| 9 | Schema FAQ dinâmico na Home | 🟢 MÉDIA | 1h |
| 10 | Contador social proof dinâmico | 🟢 MÉDIA | 2h |

---

## 📊 Métricas de Sucesso (KPI)

| Métrica | Baseline (atual) | Meta (3 meses) | Meta (6 meses) |
|---------|-----------------|----------------|----------------|
| Tráfego orgânico | ~500/mês | 5.000/mês | 15.000/mês |
| Taxa de conversão (visita → login) | ~3% | 8% | 12% |
| Taxa de conversão (login → save) | ~20% | 35% | 45% |
| Bounce rate | ~60% | <45% | <35% |
| Posição média no Google | ~10+ | <5 | TOP 3 |
| AdSense RPM | R$0 (sem ads) | R$5 | R$10+ |
| Usuários ativos/mês | ~100 | 1.000 | 5.000 |

---

> **Notas de Implementação Pasty** — Produtividade simples, integrada ao ecossistema OrdoB.
  Feito com ❤️ por Wesley Alves e equipe OrdoB™
