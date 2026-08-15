import { useState, useCallback, useEffect, useRef } from 'react'
import { saveText } from '../api'
import type { Clip, Destination } from '../types'
import { detectTitleFromText } from '../utils/title'

const DRAFT_KEY = 'pasty_draft'
const AUTOSAVE_DELAY = 2000

interface Draft {
  title: string
  text: string
  destination: Destination
  savedAt: number
}

interface SaveFormState {
  title: string
  text: string
  destination: Destination
  saving: boolean
  savedClip: Clip | null
  isDuplicate: boolean
  saveError: string | null
}

export function useSaveForm(
  token: string | null,
  onSaved?: () => void,
) {
  const [state, setState] = useState<SaveFormState>({
    title: '',
    text: '',
    destination: 'docs',
    saving: false,
    savedClip: null,
    isDuplicate: false,
    saveError: null,
  })

  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const initialized = useRef(false)

  // ─── Restore draft on mount ──────────────────────────────

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    try {
      const raw = localStorage.getItem(DRAFT_KEY)
      if (!raw) return

      const draft: Draft = JSON.parse(raw)
      const elapsed = Date.now() - draft.savedAt

      // Only restore if saved within the last 24 hours and has content
      if (elapsed < 24 * 60 * 60 * 1000 && draft.text?.trim()) {
        setState((prev) => ({
          ...prev,
          title: draft.title ?? '',
          text: draft.text,
          destination: draft.destination ?? 'docs',
        }))
      }
    } catch {
      // Ignore parse errors
    }
  }, [])

  // ─── Auto-save draft ─────────────────────────────────────

  useEffect(() => {
    if (!state.text?.trim() && !state.title?.trim()) return

    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)

    autoSaveTimer.current = setTimeout(() => {
      try {
        const draft: Draft = {
          title: state.title,
          text: state.text,
          destination: state.destination,
          savedAt: Date.now(),
        }
        localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
      } catch {
        // localStorage might be full
      }
    }, AUTOSAVE_DELAY)

    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    }
  }, [state.title, state.text, state.destination])

  // ─── Clear draft on successful save ──────────────────────

  const clearDraft = useCallback(() => {
    localStorage.removeItem(DRAFT_KEY)
  }, [])

  // ─── Setters ─────────────────────────────────────────────────

  const titleTouchedRef = useRef(false)
  const autoFilledRef = useRef(false)

  const setTitle = useCallback((title: string) => {
    titleTouchedRef.current = true
    autoFilledRef.current = true
    setState((prev) => ({ ...prev, title }))
  }, [])

  const setText = useCallback((text: string) => {
    setState((prev) => ({ ...prev, text }))
  }, [])

  /**
   * Auto-título: preenche automaticamente apenas quando o campo de
   * título está vazio e o usuário cola um texto novo. Depois disso,
   * edições no texto NÃO alteram o título (o título é opcional).
   */
  const autoFillTitle = useCallback((newText: string) => {
    if (titleTouchedRef.current || autoFilledRef.current) return
    const detected = detectTitleFromText(newText)
    if (detected) {
      autoFilledRef.current = true
      setState((prev) => {
        if (prev.title?.trim()) return prev
        return { ...prev, title: detected }
      })
    }
  }, [])

  useEffect(() => {
    if (state.text?.trim()) {
      autoFillTitle(state.text)
    }
  }, [state.text, autoFillTitle])

  const setDestination = useCallback((destination: Destination) => {
    setState((prev) => ({ ...prev, destination }))
  }, [])

  // ─── Handle Save ─────────────────────────────────────────

  const handleSave = useCallback(async () => {
    const currentToken = token ?? localStorage.getItem('utc_token')
    if (!currentToken) {
      setState((prev) => ({ ...prev, saveError: 'Você precisa estar logado para salvar.' }))
      return
    }

    const trimmedText = state.text.trim()
    if (!trimmedText) return

    setState((prev) => ({ ...prev, saving: true, saveError: null, savedClip: null, isDuplicate: false }))

    try {
      const res = await saveText(
        trimmedText,
        state.destination,
        state.title.trim() || 'Sem título',
        currentToken,
      )

      setState((prev) => ({
        ...prev,
        saving: false,
        savedClip: res.clip,
        isDuplicate: res.duplicate,
        text: res.duplicate ? prev.text : '',
        title: res.duplicate ? prev.title : '',
      }))

      if (!res.duplicate) {
        clearDraft()
        onSaved?.()
      }
    } catch (err: unknown) {
      let message = 'Erro ao salvar texto. Tente novamente.'

      if (err instanceof Error) {
        const axiosError = err as { response?: { data?: { error?: string }; status?: number }; message?: string }
        const serverMsg = axiosError?.response?.data?.error

        if (serverMsg) {
          message = serverMsg
        } else if (axiosError?.response?.status === 401) {
          message = 'Sessão expirada. Faça login novamente.'
        } else if (axiosError?.response?.status === 429) {
          message = 'Muitas requisições. Aguarde um momento e tente novamente.'
        } else if (err.message?.includes('Network Error') || err.message?.includes('ERR_NETWORK')) {
          message = 'Servidor offline. Verifique sua conexão e tente novamente.'
        } else if (err.message?.includes('502')) {
          message = 'Serviço temporariamente indisponível. Tente novamente em instantes.'
        } else if (err.message) {
          message = err.message
        }
      }

      setState((prev) => ({ ...prev, saving: false, saveError: message }))
    }
  }, [token, state.text, state.title, state.destination, clearDraft, onSaved])

  // ─── Dismiss message ─────────────────────────────────────

  const dismissMessage = useCallback(() => {
    setState((prev) => ({ ...prev, savedClip: null, saveError: null, isDuplicate: false }))
  }, [])

  // ─── Derived ─────────────────────────────────────────────

  const canSave = !!state.text.trim() && !state.saving && !!token

  // ─── Keyboard shortcut: Ctrl+Enter to save ───────────────

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        if (canSave) {
          e.preventDefault()
          handleSave()
        }
      }
    }

    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [handleSave, canSave]) // eslint-disable-line react-hooks/exhaustive-deps
  const autoSaveTime = state.text?.trim()
    ? new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    : null

  return {
    ...state,
    setTitle,
    setText,
    setDestination,
    handleSave,
    dismissMessage,
    canSave,
    hasDraft: !!localStorage.getItem(DRAFT_KEY),
    autoSaveTime,
    autoFillTitle,
  }
}
