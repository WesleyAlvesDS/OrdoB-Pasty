# 📱 Skill: PWA (Progressive Web App)

> Padrão de configuração PWA aprendido no Pasty.

---

## Manifest (manifest.json)
```json
{
  "name": "Pasty — Cole uma vez. Acesse de qualquer lugar.",
  "short_name": "Pasty",
  "description": "Cole qualquer texto e salve diretamente no Google Docs, Drive ou Gmail.",
  "start_url": "/",
  "display": "standalone",
  "display_override": ["window-controls-overlay", "standalone"],
  "background_color": "#f9fafb",
  "theme_color": "#7c3aed",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/favicon.svg", "sizes": "48x48", "type": "image/svg+xml" }
  ]
}
```

### Service Worker Registration
```typescript
// main.tsx
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then(() => console.log('📱 PWA: Service Worker registered'))
  })
}
```

### HTML Meta Tags
```html
<meta name="theme-color" content="#7c3aed" />
<meta name="mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="default" />
<meta name="apple-mobile-web-app-title" content="Pasty" />
<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
<link rel="mask-icon" href="/mask-icon.svg" color="#7c3aed" />
```

## Lições Aprendidas
- `display_override` com `window-controls-overlay` permite PWA mais integrado
- `mask-icon` (Safari) precisa ser SVG monocromático (preto sólido)
- Ícones PNG + SVG no manifest para compatibilidade máxima
- Service Worker registrado no `load` para não bloquear render inicial
