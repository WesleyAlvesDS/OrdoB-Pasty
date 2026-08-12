import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TextCleanup } from '../TextCleanup'

describe('TextCleanup', () => {
  it('exibe placeholder quando o texto está vazio', () => {
    render(<TextCleanup text="" onTextChange={() => {}} />)
    expect(screen.getByText(/Cole um texto para usar as ferramentas/i)).toBeInTheDocument()
  })

  it('remove espaços extras', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<TextCleanup text="olá    mundo   " onTextChange={onChange} />)
    await user.click(screen.getByText('Remover espaços extras'))
    expect(onChange).toHaveBeenCalledWith('olá mundo')
  })

  it('converte para maiúsculas', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<TextCleanup text="Olá Mundo" onTextChange={onChange} />)
    await user.click(screen.getByText('MAIÚSCULAS'))
    expect(onChange).toHaveBeenCalledWith('OLÁ MUNDO')
  })

  it('converte para minúsculas', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<TextCleanup text="Olá Mundo" onTextChange={onChange} />)
    await user.click(screen.getByText('minúsculas'))
    expect(onChange).toHaveBeenCalledWith('olá mundo')
  })

  it('aplica title case', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<TextCleanup text="olá MUNDO" onTextChange={onChange} />)
    await user.click(screen.getByText('Title Case'))
    expect(onChange).toHaveBeenCalledWith('Olá Mundo')
  })

  it('remove números', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<TextCleanup text="abc 123 def" onTextChange={onChange} />)
    await user.click(screen.getByText('Remover números'))
    expect(onChange).toHaveBeenCalledWith('abc  def')
  })
})