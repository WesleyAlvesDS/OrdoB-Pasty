import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TextStats } from '../TextStats'

describe('TextStats', () => {
  it('exibe placeholder quando o texto está vazio', () => {
    render(<TextStats text="   " />)
    expect(screen.getByText(/Cole um texto para ver as estatísticas/i)).toBeInTheDocument()
  })

  it('conta palavras, caracteres e linhas corretamente', () => {
    const sample = 'Olá mundo!\nSegunda linha de exemplo.'
    render(<TextStats text={sample} />)
    expect(screen.getByText('6')).toBeInTheDocument() // palavras
    expect(screen.getByText(sample.length.toString())).toBeInTheDocument() // caracteres
    expect(screen.getAllByText('2').length).toBeGreaterThanOrEqual(1) // linhas/frases
  })

  it('mostra tempo de leitura mínimo de 1 minuto', () => {
    render(<TextStats text="apenas" />)
    expect(screen.getByText('1 min')).toBeInTheDocument()
  })

  it('lista as palavras mais frequentes', () => {
    render(<TextStats text="gato gato gato cachorro" />)
    expect(screen.getByText('gato')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })
})