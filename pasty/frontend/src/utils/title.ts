/**
 * Utilidades para gerar títulos automaticamente a partir de texto colado.
 */

/**
 * Detecta um título a partir do texto:
 * 1. Se há uma linha com "# " (Markdown H1) → usa essa linha
 * 2. Senão, usa a primeira linha não-vazia (máx 60 chars)
 */
export function detectTitleFromText(text: string): string | null {
  const trimmed = text.trim()
  if (!trimmed) return null

  const lines = trimmed.split(/\n+/).map((l) => l.trim()).filter(Boolean)
  if (lines.length === 0) return null

  const h1 = lines.find((l) => /^#\s/.test(l))
  const base = h1 ? h1.replace(/^#\s+/, '') : lines[0]

  const cleaned = base.replace(/[*_~`]/g, '').slice(0, 60).trim()
  return cleaned || null
}

/**
 * Substitui placeholders de template de título:
 * - {{date}}       → 2026-08-14
 * - {{time}}       → 14:30
 * - {{datetime}}   → 2026-08-14 14:30
 * - {{first_words}}→ primeiras 5 palavras do texto
 * - {{timestamp}}  → 1723635600000 (epoch ms)
 */
export function renderTitleTemplate(template: string, text: string): string {
  const now = new Date()

  const pad = (n: number) => String(n).padStart(2, '0')
  const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
  const time = `${pad(now.getHours())}:${pad(now.getMinutes())}`

  const firstWords = text
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 5)
    .join(' ')
    .slice(0, 60)

  return template
    .replace(/{{date}}/g, date)
    .replace(/{{time}}/g, time)
    .replace(/{{datetime}}/g, `${date} ${time}`)
    .replace(/{{timestamp}}/g, String(now.getTime()))
    .replace(/{{first_words}}/g, firstWords || 'sem-titulo')
}

/**
 * Lista de templates de título predefinidos.
 */
export const TITLE_TEMPLATES: { id: string; label: string; template: string }[] = [
  { id: 'plain', label: 'Texto colado', template: 'Texto colado {{datetime}}' },
  { id: 'date', label: 'Data', template: 'Nota {{date}}' },
  { id: 'first-words', label: 'Primeiras palavras', template: '{{first_words}}' },
  { id: 'doc-title', label: 'Documento', template: 'Documento {{date}} {{time}}' },
]

/**
 * Se o usuário deixou o título em branco, tenta preencher automaticamente.
 * Retorna true se um título foi preenchido.
 */
export function tryAutoFillTitle(
  currentTitle: string,
  text: string,
  setTitle: (t: string) => void,
  preferTemplate = false,
  template = '',
): boolean {
  if (currentTitle.trim()) return false

  const detected = detectTitleFromText(text)
  if (detected) {
    setTitle(detected)
    return true
  }

  if (preferTemplate && template) {
    setTitle(renderTitleTemplate(template, text))
    return true
  }

  return false
}
