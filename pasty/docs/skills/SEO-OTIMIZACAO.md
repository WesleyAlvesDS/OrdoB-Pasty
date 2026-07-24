# 🌐 Skill: SEO e Otimização para Mecanismos de Busca

> Padrões de SEO aprendidos e aplicados no Pasty.

---

## Meta Tags Essenciais

```html
<!-- Primary -->
<title>Pasty — Cole e salve textos no Google Docs, Drive ou Gmail</title>
<meta name="description" content="Cole qualquer texto e salve diretamente no Google Docs..." />
<meta name="robots" content="index, follow" />
<link rel="canonical" href="https://pasty.app/" />

<!-- Open Graph -->
<meta property="og:type" content="website" />
<meta property="og:title" content="Pasty — Cole e salve textos..." />
<meta property="og:description" content="..." />
<meta property="og:image" content="https://pasty.app/og-image.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />

<!-- Twitter -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Pasty — Cole e salve textos..." />
```

## JSON-LD Structured Data

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Pasty",
  "description": "Cole qualquer texto e salve diretamente no Google Docs...",
  "applicationCategory": "UtilityApplication",
  "operatingSystem": "All",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
}
</script>

<!-- BreadcrumbList -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Início", "item": "..." },
    { "@type": "ListItem", "position": 2, "name": "Política de Privacidade", "item": "..." }
  ]
}
</script>
```

## Sitemap XML
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://pasty.app/</loc><priority>1.0</priority><changefreq>weekly</changefreq></url>
  <url><loc>https://pasty.app/send-text-to-pc</loc><priority>0.8</priority></url>
  <url><loc>https://pasty.app/save-text-online</loc><priority>0.8</priority></url>
  <url><loc>https://pasty.app/privacy</loc><priority>0.3</priority></url>
  <url><loc>https://pasty.app/terms</loc><priority>0.3</priority></url>
</urlset>
```

## Hreflang
```html
<link rel="alternate" href="https://pasty.app/" hreflang="pt-BR" />
<link rel="alternate" href="https://pasty.app/" hreflang="x-default" />
```

> ⚠️ Não adicione hreflang para idiomas que não têm rota correspondente.

## Performance
```html
<!-- Preconnect para origens críticas -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />

<!-- Preload de fontes -->
<link rel="preload" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" as="style" />
```

## Lições Aprendidas
- Cada landing page deve ter `<title>` e `<meta description>` únicos
- JSON-LD Structured Data aumenta chances de rich snippets
- Sitemap com prioridades diferenciadas (1.0 home → 0.3 páginas legais)
- `canonical` previne conteúdo duplicado
- Preconnect + Preload melhora LCP (Largest Contentful Paint)
