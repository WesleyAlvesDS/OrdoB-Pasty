# Mapa dos anúncios — Pasty (Adsterra + AdSense)

Documento para localizar e remover facilmente todos os pontos de publicidade
no frontend do Pasty.

## Identificadores Adsterra

| Recurso | Valor |
|---------|-------|
| Rede | Adsterra (Effective CPM Network) |
| Banner site key | `a9860fbedb0b55f36cbf7042ddd6970e` |
| Script invoke.js | `https://pl30727045.effectivecpmnetwork.com/a9860fbedb0b55f36cbf7042ddd6970e/invoke.js` |
| Container do banner | `container-a9860fbedb0b55f36cbf7042ddd6970e` |
| Smart link patrocinado | `https://www.effectivecpmnetwork.com/anmwu96m?key=0b67ee5348e65f5de4cefeabdb7d2c02` |

## Identificadores Google AdSense

| Recurso | Valor |
|---------|-------|
| Conta AdSense | `ca-pub-4516147510474933` |
| Script | `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4516147510474933` |

## Locais dos anúncios (arquivo:linha)

Caminhos relativos ao frontend: `pasty/frontend/src`

| # | Tipo de anúncio | Onde aparece | Local |
|---|---|---|---|
| 1 | Componente do banner | — | `components/AdBanner.tsx` (arquivo inteiro; `AD_SRC` na linha 10, `AD_CONTAINER_ID` na linha 11) |
| 2 | Banner <AdBanner /> | Página inicial | `pages/HomePage.tsx` — import na linha 13, render na linha 709 |
| 3 | Banner <AdBanner /> | Enviar texto p/ PC | `pages/SendTextToPc.tsx` — import na linha 6, render na linha 213 |
| 4 | Banner <AdBanner /> | Salvar texto online | `pages/SaveTextOnline.tsx` — import na linha 6, render na linha 270 |
| 5 | Banner <AdBanner /> | Colar texto online | `pages/ColarTextoOnline.tsx` — import na linha 6, render na linha 156 |
| 6 | Banner <AdBanner /> | Guia de uso | `pages/Guia.tsx` — import na linha 6, render na linha 208 |
| 7 | Banner <AdBanner /> | Bookmarklet | `pages/BookmarkletPage.tsx` — import na linha 6, render na linha 115 |
| 8 | AdSense (script global) | Todas as páginas (head) | `index.html` — meta na linha 136, script `adsbygoogle.js` na linha 137–142 |
| 9 | Smart link + texto de apoio (aparece em todas as páginas via rodapé) | Rodapé | `components/Footer.tsx` — `SMART_LINK`, seção "Publicidade" |
| 10 | Aviso de publicidade (divulgação legal) | Política de Privacidade | `pages/PrivacyPolicy.tsx` — seção "9. Publicidade de terceiros" |

> Obs.: o AdBanner exibe a divulgação **"Publicidade"** visível acima da caixa
> (`data-testid="ad-disclosure"`), e o rodapé/smart link também indicam que são
> conteúdo publicitário.

## Como remover os anúncios por completo

1. Apagar o arquivo `pasty/frontend/src/components/AdBanner.tsx`.
2. Remover `import { AdBanner }...` e a linha `<AdBanner />` de:
   - `pages/HomePage.tsx` (linhas 13 e 709)
   - `pages/SendTextToPc.tsx` (linhas 6 e 213)
   - `pages/SaveTextOnline.tsx` (linhas 6 e 270)
   - `pages/ColarTextoOnline.tsx` (linhas 6 e 156)
   - `pages/Guia.tsx` (linhas 6 e 208)
   - `pages/BookmarkletPage.tsx` (linhas 6 e 115)
3. Em `components/Footer.tsx`, remover a constante `SMART_LINK` e o bloco da
   seção `Publicidade`.
4. Em `pages/PrivacyPolicy.tsx`, remover a seção "9. Publicidade de terceiros"
   do array `sections`.
5. No `index.html`, remover a meta `google-adsense-account` (linha 136) e o
   script `adsbygoogle.js` (linhas 137–142).
6. Build + redeploy:

   ```powershell
   npm run build          # em pasty/frontend
   vercel --prod --yes    # na raiz do repo (pasty.ordob.com)
   ```

## Observações

- O script `invoke.js` é injetado no `<head>` uma única vez (elemento com id
  `adsterra-invoke-script`) para não duplicar em navegação SPA.
- O smart link usa `rel="sponsored nofollow noopener noreferrer"`.
- O container do banner tem `data-testid="adsterra-banner"` e altura mínima
  de 90px (evita shift de layout). O selo de divulgação tem
  `data-testid="ad-disclosure"`.
- Desativar apenas o banner: apague as linhas `<AdBanner />` (itens 2–7) e o
  arquivo `AdBanner.tsx`; o smart link/rodapé, o AdSense e a seção de
  privacidade podem permanecer.
