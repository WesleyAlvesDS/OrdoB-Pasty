import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ToastProvider, useToast, useToastActions } from '../Toast'

function ToastHarness() {
  const { addToast } = useToast()
  const actions = useToastActions()
  return (
    <div>
      <button onClick={() => addToast({ type: 'success', title: 'Salvo!', message: 'Clip criado' })}>
        add-success
      </button>
      <button onClick={() => actions.error('Erro!')}>add-error</button>
    </div>
  )
}

describe('Toast', () => {
  it('exibe um toast de sucesso com título e mensagem', async () => {
    const user = userEvent.setup()
    render(
      <ToastProvider>
        <ToastHarness />
      </ToastProvider>,
    )
    await user.click(screen.getByText('add-success'))
    expect(screen.getByText('Salvo!')).toBeInTheDocument()
    expect(screen.getByText('Clip criado')).toBeInTheDocument()
  })

  it('exibe toast de erro via useToastActions', async () => {
    const user = userEvent.setup()
    render(
      <ToastProvider>
        <ToastHarness />
      </ToastProvider>,
    )
    await user.click(screen.getByText('add-error'))
    expect(screen.getByText('Erro!')).toBeInTheDocument()
  })

  it('remove toast ao clicar no botão de fechar', async () => {
    const user = userEvent.setup()
    render(
      <ToastProvider>
        <ToastHarness />
      </ToastProvider>,
    )
    await user.click(screen.getByText('add-success'))
    const close = screen.getByLabelText('Fechar notificação')
    await user.click(close)
    expect(screen.queryByText('Salvo!')).not.toBeInTheDocument()
  })
})