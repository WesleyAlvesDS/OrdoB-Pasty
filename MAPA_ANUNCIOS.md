# Mapa dos anúncios — Pasty (Adsterra)

Documento para localizar e remover facilmente todos os pontos de publicidade
Adsterra / Effective CPM Network no frontend do Pasty.

## Identificadores Adsterra

| Recurso | Valor |
|---------|-------|
| Rede | Adsterra (Effective CPM Network) |
| Banner site key | `a9860fbedb0b55f36cbf7042ddd6970e` |
| Script invoke.js | `https://pl30727045.effectivecpmnetwork.com/a9860fbedb0b55f36cbf7042ddd6970e/invoke.js` |
| Container do banner | `container-a9860fbedb0b55f36cbf7042ddd6970e` |
| Smart link patrocinado | `https://www.effectivecpmnetwork.com/anmwu96m?key=0b67ee5348e65f5de4cefeabdb7d2c02` |

## Locais dos anúncios (arquivo:linha)

Caminhos relativos ao frontend: `pasty/frontend/src`

| # | Tipo de anúncio | Onde aparece | Local |
|---|---|---|---|
| 1 | Componente do banner | — | `components/AdBanner.tsx` (arquivo inteiro; `AD_SRC` na linha 10, `AD_CONTAINER_ID` na linha 11) |
| 2 | Banner <AdBanner /> | Página inicial | `pages/HomePage.tsx` — import na linha 13, render na linha 534 |
| 3 | Banner <AdBanner /> | Enviar texto p/ PC | `pages/SendTextToPc.tsx` — import na linha 6, render na linha 207 |
| 4 | Banner <AdBanner /> | Salvar texto online | `pages/SaveTextOnline.tsx` — import na linha 6, render na linha 270 |
| 5 | Smart link + texto de apoio (aparece em todas as páginas via rodapé) | Rodapé | `components/Footer.tsx` — `SMART_LINK` na linha 3, seção "Publicidade" nas linhas 170–195 |
| 6 | Aviso de publicidade (divulgação legal) | Política de Privacidade | `pages/PrivacyPolicy.tsx` — seção "9. Publicidade de terceiros", linhas 69–77 do array `sections` |

## Como remover os anúncios por completo

1. Apagar o arquivo `pasty/frontend/src/components/AdBanner.tsx`.
2. Remover `import { AdBanner }...` e a linha `<AdBanner />` de:
   - `pages/HomePage.tsx` (linhas 13 e 534)
   - `pages/SendTextToPc.tsx` (linhas 6 e 207)
   - `pages/SaveTextOnline.tsx` (linhas 6 e 270)
3. Em `components/Footer.tsx`, remover a constante `SMART_LINK` (linha 3) e o bloco
   da seção `Publicidade` (linhas 170–195).
4. Em `pages/PrivacyPolicy.tsx`, remover a seção "9. Publicidade de terceiros"
   (linhas 69–77) do array `sections`.
5. Build + redeploy:

   ```powershell
   npm run build          # em pasty/frontend
   vercel --prod --yes    # na raiz do repo (pasty.ordob.com)
   ```

## Observações

- O script `invoke.js` é injetado no `<head>` uma única vez (elemento com id
  `adsterra-invoke-script`) para não duplicar em navegação SPA.
- O smart link usa `rel="sponsored nofollow noopener noreferrer"`.
- O container do banner tem `data-testid="adsterra-banner"` e altura mínima
  de 90px (evita shift de layout).
- Desativar apenas o banner: apague as linhas `<AdBanner />` (itens 2–4) e o
  arquivo `AdBanner.tsx`; o smart link/rodapé e a seção de privacidade podem
  permanecer.