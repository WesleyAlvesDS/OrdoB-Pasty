/**
 * Bookmarklet do Pasty.
 * Arraste para a barra de favoritos; ao clicar, abre uma janela
 * com o texto selecionado pré-preenchido em pasty.ordob.com.
 */

export function buildBookmarklet(): string {
  const code = `(function(){var s=window.getSelection();var t=s?s.toString():'';if(!t&&document.activeElement&&document.activeElement.value!==undefined){t=document.activeElement.value;}if(!t){t=prompt('Selecione um texto ou digite aqui:');}if(!t)return;var e=btoa(encodeURIComponent(t.slice(0,5000)));window.open('https://pasty.ordob.com/#share='+e,'_blank');})();`

  return `javascript:${code}`
}