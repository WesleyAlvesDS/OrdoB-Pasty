/** Constantes de eventos para manter nomes consistentes. */
export const AnalyticsEvent = {
  loginSuccess: 'login_success',
  logout: 'logout',
  saveAttempt: 'save_attempt',
  saveSuccess: 'save_success',
  saveDuplicate: 'save_duplicate',
  saveError: 'save_error',
  selectDestination: 'select_destination',
} as const

/**
 * Dispara um evento do Google Analytics 4.
 *
 * No-op silencioso quando o GA não está configurado
 * (`VITE_GA_MEASUREMENT_ID` ausente ou gtag não carregado),
 * então pode ser chamado com segurança em qualquer fluxo.
 */
export function trackEvent(name: string, params?: Record<string, unknown>) {
  try {
    const gtag = (
      typeof window !== 'undefined'
        ? (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag
        : undefined
    )
    if (gtag) {
      gtag('event', name, params)
    }
  } catch {
    // Nunca deixe analytics quebrar o fluxo do usuário
  }
}
