import { useState } from 'react'

interface AvatarProps {
  /** URL da imagem do avatar (ex: Google profile picture) */
  src: string | null
  /** Nome do usuário para gerar iniciais de fallback */
  name: string | null
  /** Email do usuário como fallback secundário */
  email: string
  /** Classes CSS adicionais */
  className?: string
}

/** Extrai iniciais de um nome (máx 2 caracteres) */
function getInitials(name: string | null, email: string): string {
  if (name) {
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return parts[0].slice(0, 2).toUpperCase()
  }
  return email[0].toUpperCase()
}

/** Gera uma cor HSL estável a partir de uma string (nome ou email) */
function getColorFromString(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  const hue = Math.abs(hash % 360)
  return `hsl(${hue}, 55%, 45%)`
}

export function Avatar({ src, name, email, className = '' }: AvatarProps) {
  const [imgError, setImgError] = useState(false)
  const initials = getInitials(name, email)
  const bgColor = getColorFromString(email)

  // Se não tem URL ou já deu erro (ex: 429), mostra fallback com iniciais
  if (!src || imgError) {
    return (
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold select-none ${className}`}
        style={{ backgroundColor: bgColor }}
        title={name ?? email}
      >
        {initials}
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={name ?? email}
      className={`w-8 h-8 rounded-full ring-2 ring-violet-200 dark:ring-violet-800 transition-all duration-300 hover:ring-violet-400 dark:hover:ring-violet-600 hover:scale-110 ${className}`}
      onError={() => setImgError(true)}
    />
  )
}
