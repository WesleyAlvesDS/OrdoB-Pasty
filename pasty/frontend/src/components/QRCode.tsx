import { useEffect, useRef, useState } from 'react'
import QRCodeLib from 'qrcode'

interface QRCodeProps {
  text: string
  title?: string
  size?: number
}

export function QRCode({ text, title, size = 200 }: QRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!canvasRef.current || !text?.trim()) return

    QRCodeLib.toCanvas(canvasRef.current, text.trim(), {
      width: size,
      margin: 2,
      color: {
        dark: '#1f2937',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    })
      .then(() => setError(null))
      .catch((err) => {
        console.error('QR Code generation error:', err)
        setError('Erro ao gerar QR Code')
      })
  }, [text, size])

  const handleDownload = () => {
    if (!canvasRef.current) return
    const link = document.createElement('a')
    link.download = `pasty-qr-${title?.slice(0, 30) || 'texto'}.png`
    link.href = canvasRef.current.toDataURL('image/png')
    link.click()
  }

  const handleCopy = async () => {
    if (!canvasRef.current) return
    try {
      const blob = await new Promise<Blob | null>((resolve) =>
        canvasRef.current?.toBlob((b) => resolve(b), 'image/png'),
      )
      if (blob) {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob }),
        ])
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    } catch {
      // Fallback: copy text instead
      try {
        await navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch {
        // Clipboard not available
      }
    }
  }

  if (error) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-red-500">{error}</p>
      </div>
    )
  }

  if (!text?.trim()) return null

  return (
    <div className="flex flex-col items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 animate-scale-in">
      <div className="flex items-center gap-2">
        <span className="text-sm" aria-hidden="true">📱</span>
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          QR Code
        </span>
      </div>

      <div className="relative rounded-lg overflow-hidden shadow-sm ring-1 ring-gray-200 dark:ring-gray-700">
        <canvas
          ref={canvasRef}
          width={size}
          height={size}
          className="block"
          role="img"
          aria-label={`QR Code contendo: ${text.slice(0, 100)}`}
        />
      </div>

      <p className="text-[10px] text-gray-400 dark:text-gray-500 text-center leading-relaxed max-w-[200px] break-all">
        {text.slice(0, 80)}{text.length > 80 ? '...' : ''}
      </p>

      <div className="flex items-center gap-2">
        <button
          onClick={handleDownload}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-violet-50 dark:hover:bg-violet-950/30 hover:text-violet-600 dark:hover:text-violet-400 hover:border-violet-200 dark:hover:border-violet-700 transition-all duration-200 cursor-pointer"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download
        </button>
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-violet-50 dark:hover:bg-violet-950/30 hover:text-violet-600 dark:hover:text-violet-400 hover:border-violet-200 dark:hover:border-violet-700 transition-all duration-200 cursor-pointer"
        >
          {copied ? (
            <>
              <svg className="w-3.5 h-3.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Copiado!
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copiar
            </>
          )}
        </button>
      </div>

      <p className="text-[9px] text-gray-300 dark:text-gray-600">
        100% local · nada sai do navegador
      </p>
    </div>
  )
}
