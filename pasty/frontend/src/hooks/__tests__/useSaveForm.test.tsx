import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useSaveForm } from '../useSaveForm'
import * as api from '../../api'

vi.mock('../../api', () => ({
  saveText: vi.fn(),
}))

const DRAFT_KEY = 'pasty_draft'

describe('useSaveForm', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('exige login para salvar', async () => {
    const { result } = renderHook(() => useSaveForm(null))
    act(() => result.current.setText('texto de teste'))
    await act(async () => result.current.handleSave())
    expect(result.current.saveError).toContain('precisa estar logado')
    expect(result.current.saving).toBe(false)
  })

  it('salva com sucesso e limpa o texto', async () => {
    vi.mocked(api.saveText).mockResolvedValue({
      clip: { id: 1, text: 'conteúdo', destination: 'docs', created_at: '2026-01-01' },
      duplicate: false,
    } as any)

    const { result } = renderHook(() => useSaveForm('token'))
    act(() => result.current.setText('conteúdo salvo'))
    await act(async () => result.current.handleSave())

    expect(api.saveText).toHaveBeenCalledWith('conteúdo salvo', 'docs', 'Sem título', 'token')
    expect(result.current.savedClip).not.toBeNull()
    expect(result.current.text).toBe('')
  })

  it('mantém o texto quando for duplicado', async () => {
    vi.mocked(api.saveText).mockResolvedValue({
      clip: { id: 2, text: 'duplicado', destination: 'docs', created_at: '2026-01-01' },
      duplicate: true,
    } as any)

    const { result } = renderHook(() => useSaveForm('token'))
    act(() => result.current.setText('texto duplicado'))
    await act(async () => result.current.handleSave())

    expect(result.current.isDuplicate).toBe(true)
    expect(result.current.text).toBe('texto duplicado')
  })

  it('restaura o rascunho salvo nas últimas 24h', async () => {
    localStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({
        title: 'Rascunho',
        text: 'conteúdo do rascunho',
        destination: 'gmail',
        savedAt: Date.now() - 1000,
      }),
    )

    const { result } = renderHook(() => useSaveForm(null))
    await waitFor(() => expect(result.current.hasDraft).toBe(true))
  })
})