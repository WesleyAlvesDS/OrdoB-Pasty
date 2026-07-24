# 🎨 Skill: Design System com Tailwind CSS

> Padrões de design aprendidos e aplicados no Pasty.

---

## Gradientes em Texto
```tsx
<span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
  Texto com gradiente
</span>
```
- `bg-clip-text` + `text-transparent` = gradiente no texto
- Gradientes nominais: `from-violet-600 via-purple-600 to-pink-600` para 3 cores

## Badges/Status
```tsx
<div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full 
  bg-violet-50 dark:bg-violet-950/50 
  text-violet-600 dark:text-violet-400 text-xs font-medium 
  border border-violet-200 dark:border-violet-800">
  <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
  Status
</div>
```

## Hover Dots com group
```tsx
<li className="group">  {/* ← group aqui é ESSENCIAL */}
  <Link className="inline-flex items-center gap-1.5">
    <span className="w-1 h-1 rounded-full bg-violet-500 
      opacity-0 group-hover:opacity-100 transition-opacity" />
    Link text
  </Link>
</li>
```

## Cards com Hover Elevado
```tsx
<div className="rounded-2xl border border-gray-200 dark:border-gray-800 
  bg-white dark:bg-gray-900 
  shadow-sm 
  transition-all duration-300 
  hover:shadow-xl hover:shadow-violet-100/50 dark:hover:shadow-violet-950/30 
  hover:-translate-y-1 hover:border-violet-200 dark:hover:border-violet-700">
```

## Blur Decorations (fundo)
```tsx
<div className="absolute -top-40 -right-40 w-80 h-80 
  rounded-full bg-violet-500/10 dark:bg-violet-500/5 blur-3xl pointer-events-none" />
```

## Animations Stagger
```tsx
// CSS
@keyframes fade-in {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

// JSX - cada item com delay incremental
style={{ animation: `fade-in 0.3s ease-out ${index * 0.05}s both` }}
```

## Botão Gradiente com Scale
```tsx
<button className="inline-flex items-center gap-2 px-6 py-3 
  rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 
  text-white font-semibold 
  shadow-lg hover:shadow-xl 
  hover:scale-[1.03] active:scale-[0.97] 
  transition-all duration-300">
```

## Caractere Counter
```tsx
{text.length} caractere{text.length !== 1 ? 's' : ''}
```

## Overlay Pattern (opacity no hover)
```tsx
opacity-0 group-hover:opacity-100 
focus:opacity-100  /* ← importante para acessibilidade */
```
