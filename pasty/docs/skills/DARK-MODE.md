# 🌙 Skill: Dark Mode com Tailwind CSS

> Padrões de implementação de tema escuro aprendidos no Pasty.

---

## CSS Base

```css
:root {
  color-scheme: light dark;  /* ← Permite o navegador escolher */
}
```

## Palavras-chave

Todas as cores no Pasty têm variante `dark:`:

| Contexto | Light | Dark |
|----------|-------|------|
| Fundo página | `bg-gray-50` | `dark:bg-gray-950` |
| Card | `bg-white` | `dark:bg-gray-900` |
| Texto principal | `text-gray-900` | `dark:text-white` |
| Texto secundário | `text-gray-500` | `dark:text-gray-400` |
| Borda | `border-gray-200` | `dark:border-gray-800` |
| Placeholder | `placeholder-gray-400` | `dark:placeholder-gray-500` |

## Cores de Ação (mantidas em ambos)

```tsx
/* Violeta funciona em light e dark sem variante */
text-violet-600 dark:text-violet-400
bg-violet-50 dark:bg-violet-950/30
border-violet-200 dark:border-violet-800
hover:shadow-violet-100/50 dark:hover:shadow-violet-950/30
```

## Selection Color com OKLCH

```css
::selection {
  background-color: oklch(0.85 0.1 300);   /* Light: violeta claro */
  color: oklch(0.2 0.05 300);
}

@media (prefers-color-scheme: dark) {
  ::selection {
    background-color: oklch(0.35 0.1 300); /* Dark: violeta escuro */
    color: oklch(0.9 0.02 300);
  }
}
```

## Scrollbar Customizada

```css
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb {
  background: oklch(0.85 0 0 / 0.3);  /* Light */
  border-radius: 999px;
}
@media (prefers-color-scheme: dark) {
  ::-webkit-scrollbar-thumb {
    background: oklch(0.3 0 0 / 0.5);  /* Dark */
  }
}
```

## Badge com Opacidade

```tsx
/* Light: bg sólido + cor sólida */
bg-violet-50 text-violet-600 border-violet-200

/* Dark: bg com opacidade + cor mais clara */
dark:bg-violet-950/50 dark:text-violet-400 dark:border-violet-800
```

## Sombras no Dark Mode

```tsx
/* Light */
shadow-violet-100/50

/* Dark */
dark:shadow-violet-950/30
```

Como o Tailwind v4 não gera `shadow-violet-X` automaticamente, usamos `shadow` + `shadow-violet-*` inline.

## Lições Aprendidas
- `color-scheme: light dark` no CSS root é essencial
- Cores de ação (violeta, esmeralda) podem ter variantes mais sutis no dark
- Opacidade em bg (`/50`, `/30`) funciona melhor que cores sólidas no dark
- Sombras precisam ser adaptadas (dark não pode ter sombra clara)
- OKLCH é mais preciso que HSL para cores de selection/scrollbar
