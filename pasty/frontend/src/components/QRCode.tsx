import { useEffect, useRef, useState } from 'react'
import QRCodeLib from 'qrcode'

interface QRCodeProps {
  text: string
  title?: string
  defaultSize?: number
  defaultDarkColor?: string
  defaultLightColor?: string
}

const PRESET_SIZES = [
  { value: 120, label: 'P' },
  { value: 200, label: 'M' },
  { value: 280, label: 'G' },
  { value: 360, label: 'XG' },
] as const

const PRESET_COLORS = [
  { dark: '#1f2937', light: '#ffffff', label: 'Clássico' },
  { dark: '#7c3aed', light: '#f5f3ff', label: 'Violeta' },
  { dark: '#FE5416', light: '#fff7ed', label: 'OrdoB' },
  { dark: '#059669', light: '#ecfdf5', label: 'Verde' },
  { dark: '#1d4ed8', light: '#eff6ff', label: 'Azul' },
  { dark: '#000000', light: '#ffffff', label: 'Preto' },
] as const

export function QRCode({
  text,
  title,
  defaultSize = 200,
  defaultDarkColor = '#1f2937',
  defaultLightColor = '#ffffff',
}: QRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [size, setSize] = useState(defaultSize)
  const [darkColor, setDarkColor] = useState(defaultDarkColor)
  const [lightColor, setLightColor] = useState(defaultLightColor)
  const [showCustomColor, setShowCustomColor] = useState(false)

  useEffect(() => {
    if (!canvasRef.current || !text?.trim()) return

    QRCodeLib.toCanvas(canvasRef.current, text.trim(), {
      width: size,
      margin: 2,
      color: {
        dark: darkColor,
        light: lightColor,
      },
      errorCorrectionLevel: 'M',
    })
      .then(() => setError(null))
      .catch((err) => {
        console.error('QR Code generation error:', err)
        setError('Erro ao gerar QR Code')
      })
  }, [text, size, darkColor, lightColor])

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
    <div className="flex flex-col items-center gap-4 p-5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 animate-scale-in">
      {/* ─── Header ──────────────────────────────────── */}
      <div className="flex items-center gap-2">
        <span className="text-sm" aria-hidden="true">📱</span>
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          QR Code
        </span>
      </div>

      {/* ─── QR Code Canvas ──────────────────────────── */}
      <div
        className="relative rounded-lg overflow-hidden shadow-sm ring-1 ring-gray-200 dark:ring-gray-700"
        style={{ backgroundColor: lightColor }}
      >
        <canvas
          ref={canvasRef}
          width={size}
          height={size}
          className="block"
          role="img"
          aria-label={`QR Code contendo: ${text.slice(0, 100)}`}
        />
      </div>

      {/* ─── Size Selector ───────────────────────────── */}
      <div className="w-full">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wider">
            Tamanho
          </span>
          <span className="text-[10px] text-gray-500 dark:text-gray-400 tabular-nums">{size}px</span>
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          {PRESET_SIZES.map((preset) => {
            const isActive = size === preset.value
            return (
              <button
                key={preset.value}
                type="button"
                onClick={() => setSize(preset.value)}
                className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-violet-100 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300 border border-violet-300 dark:border-violet-700 shadow-sm'
                    : 'bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-800 hover:border-violet-200 dark:hover:border-violet-700 hover:text-violet-600 dark:hover:text-violet-400'
                }`}
              >
                {preset.label}
              </button>
            )
          })}
        </div>
        {/* Fine-tune slider */}
        <input
          type="range"
          min="80"
          max="400"
          step="10"
          value={size}
          onChange={(e) => setSize(Number(e.target.value))}
          className="w-full mt-2 h-1.5 rounded-full appearance-none cursor-pointer bg-gray-200 dark:bg-gray-700 accent-violet-500"
          aria-label="Ajuste fino do tamanho"
        />
      </div>

      {/* ─── Color Selector ──────────────────────────── */}
      <div className="w-full">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wider">
            Cores
          </span>
          <button
            type="button"
            onClick={() => setShowCustomColor(!showCustomColor)}
            className="text-[10px] text-violet-500 hover:text-violet-600 dark:hover:text-violet-400 transition-colors cursor-pointer"
          >
            {showCustomColor ? 'Predefinições' : 'Personalizar'}
          </button>
        </div>

        {showCustomColor ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] text-gray-500 dark:text-gray-400">Frente</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={darkColor}
                  onChange={(e) => setDarkColor(e.target.value)}
                  className="w-8 h-8 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer"
                  aria-label="Cor do QR Code"
                />
                <span className="text-[10px] text-gray-400 dark:text-gray-500 font-mono">{darkColor}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-[11px] text-gray-500 dark:text-gray-400">Fundo</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={lightColor}
                  onChange={(e) => setLightColor(e.target.value)}
                  className="w-8 h-8 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer"
                  aria-label="Cor de fundo do QR Code"
                />
                <span className="text-[10px] text-gray-400 dark:text-gray-500 font-mono">{lightColor}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {PRESET_COLORS.map((preset) => {
              const isActive = darkColor === preset.dark && lightColor === preset.light
              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    setDarkColor(preset.dark)
                    setLightColor(preset.light)
                    setShowCustomColor(false)
                  }}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-medium transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-violet-100 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300 border border-violet-300 dark:border-violet-700'
                      : 'bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-800 hover:border-violet-200 dark:hover:border-violet-700 hover:text-violet-600 dark:hover:text-violet-400'
                  }`}
                >
                  <span
                    className="w-3 h-3 rounded-full border border-gray-300 dark:border-gray-600 flex-shrink-0"
                    style={{ backgroundColor: preset.dark }}
                  />
                  <span>{preset.label}</span>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* ─── Preview text ────────────────────────────── */}
      <p className="text-[10px] text-gray-400 dark:text-gray-500 text-center leading-relaxed max-w-[200px] break-all">
        {text.slice(0, 80)}{text.length > 80 ? '...' : ''}
      </p>

      {/* ─── Action Buttons ──────────────────────────── */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleDownload}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-violet-50 dark:hover:bg-violet-950/30 hover:text-violet-600 dark:hover:text-violet-400 hover:border-violet-200 dark:hover:border-violet-700 transition-all duration-200 cursor-pointer"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download
        </button>
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-violet-50 dark:hover:bg-violet-950/30 hover:text-violet-600 dark:hover:text-violet-400 hover:border-violet-200 dark:hover:border-violet-700 transition-all duration-200 cursor-pointer"
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
              Copiar Imagem
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
