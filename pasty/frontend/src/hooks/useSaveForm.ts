import { useState, useCallback } from 'react'
import type { Destination, Clip } from '../types'
import { saveText } from '../api'

export function useSaveForm(token: string | null, onSaved?: () => void) {
  const [title, setTitle] = useState('')
  const [text, setText] = useState('')
  const [destination, setDestination] = useState<Destination>('gmail')
  const [saving, setSaving] = useState(false)
  const [savedClip, setSavedClip] = useState<Clip | null>(null)
  const [isDuplicate, setIsDuplicate] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const handleSave = useCallback(async () => {
    if (!token || !text.trim()) return

    setSaving(true)
    setSaveError(null)
    setSavedClip(null)

    try {
      const response = await saveText(text.trim(), destination, title.trim() || 'Sem título', token)
      setSavedClip(response.clip)
      setIsDuplicate(response.duplicate)

      if (!response.duplicate) {
        setText('')
        onSaved?.()
      }
    } catch (err: unknown) {
      let errorMsg = 'Erro ao salvar. Tente novamente.'

      // Tenta extrair a mensagem de erro real do backend (via Axios)
      const axiosError = err as { response?: { data?: { error?: string } }; message?: string }
      const backendError = axiosError?.response?.data?.error

      if (backendError && typeof backendError === 'string') {
        // Mostra o erro real do backend (ex: Google API error, token expired, etc.)
        errorMsg = backendError
      } else if (err instanceof Error) {
        if (err.message === 'Network Error' || err.message.includes('ERR_CONNECTION')) {
          errorMsg = 'Servidor offline. Certifique-se de que o backend está rodando (cd backend && npm run dev).'
        } else if (err.message.includes('502')) {
          errorMsg = 'Erro no servidor ao processar sua solicitação. O backend retornou uma resposta inválida.'
        } else if (err.message.includes('429') || err.message.includes('rate limit')) {
          errorMsg = 'Você excedeu o limite de requisições às APIs do Google. Aguarde alguns minutos e tente novamente.'
        } else if (err.message.includes('401') || err.message.includes('token') || err.message.includes('authenticate')) {
          errorMsg = 'Sessão expirada. Faça login novamente.'
        } else {
          errorMsg = err.message
        }
      }

      setSaveError(errorMsg)
    } finally {
      setSaving(false)
    }
  }, [token, destination, text, onSaved])

  const dismissMessage = useCallback(() => {
    setSavedClip(null)
    setSaveError(null)
  }, [])

  const canSave = text.trim().length > 0

  return {
    title,
    text,
    destination,
    saving,
    savedClip,
    isDuplicate,
    saveError,
    canSave,
    setTitle,
    setText,
    setDestination,
    handleSave,
    dismissMessage,
  }
}
