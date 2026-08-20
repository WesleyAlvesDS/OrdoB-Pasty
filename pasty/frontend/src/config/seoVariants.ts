/**
 * CTR Optimization — A/B Test config
 *
 * Para testar variantes de title/description, altere `currentVariant`
 * para um dos nomes em `variants`. Cada deploy publica a variante ativa.
 *
 * Monitorar: Google Search Console → Performance → CTV/posição média
 * Critério: manter a variante com maior CTR após 7-14 dias.
 */

export interface TitleVariant {
  title: string
  description: string
}

interface ABTest {
  currentVariant: string
  variants: Record<string, TitleVariant>
}

export const seoVariants: ABTest = {
  currentVariant: 'variantB',
  variants: {
    /* Home */
    variantA: {
      title: 'Pasty — Cole, salve e acesse de qualquer lugar',
      description:
        'Cole qualquer texto no navegador e salve instantaneamente no Google Docs, Google Drive ou Gmail (como rascunho). Rápido, seguro e 100% grátis.',
    },
    variantB: {
      title: 'Colar texto online grátis | Salve no Google Docs, Drive ou Gmail (rascunho)',
      description:
        'Cole texto, salve online em 1 clique e acesse de qualquer dispositivo. Direto para Google Docs, Drive ou Gmail (rascunho). 100% grátis, sem instalar nada.',
    },
  },
}

export function getSeoVariant(): TitleVariant {
  return seoVariants.variants[seoVariants.currentVariant]
}
