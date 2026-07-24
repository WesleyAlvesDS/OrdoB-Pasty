import { useState, useEffect, useCallback, useRef } from 'react'
import type { Clip } from '../types'
import { getHistory } from '../api'

interface HistoryProps {
  token: string
  refreshKey: number
}

const DESTINATION_FILTERS = [
  { id: '', label: 'Todos', icon: '📋' },
  { id: 'docs', label: 'Docs', icon: '📄' },
  { id: 'drive', label: 'Drive', icon: '📁' },
  { id: 'gmail', label: 'Gmail', icon: '✉️' },
] as const

const DEST_ICONS: Record<string, string> = {
  docs: '📄',
  drive: '📁',
  gmail: '✉️',
}

const DEST_LABELS: Record<string, string> = {
  docs: 'Google Docs',
  drive: 'Google Drive',
  gmail: 'Gmail Draft',
}

export function History({ token, refreshKey }: HistoryProps) {
  const [clips, setClips] = useState<Clip[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [nextCursor, setNextCursor] = useState<number | null>(null)
  const [total, setTotal] = useState(0)

  // Filtros
  const [search, setSearch] = useState('')
  const [destination, setDestination] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  // Timer para debounce da busca
  const searchTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  // Debounce da busca (300ms após parar de digitar)
  const handleSearchChange = useCallback((value: string) => {
    setSearch(value)
    if (searchTimer.current) clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => {
      setDebouncedSearch(value)
    }, 300)
  }, [])

  // ─── Fetch inicial (quando os filtros mudam) ────────────
  useEffect(() => {
    setLoading(true)
    setError(null)
    setClips([])
    setNextCursor(null)

    getHistory(token, {
      limit: 20,
      destination: destination || null,
      search: debouncedSearch || null,
    })
      .then((res) => {
        setClips(res.clips)
        setNextCursor(res.nextCursor)
        setTotal(res.total)
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Erro ao carregar histórico'))
      .finally(() => setLoading(false))
  }, [token, refreshKey, destination, debouncedSearch])

  // ─── Load More (paginação por cursor) ───────────────────
  const handleLoadMore = useCallback(() => {
    if (!nextCursor || loadingMore) return

    setLoadingMore(true)
    getHistory(token, {
      cursor: nextCursor,
      limit: 20,
      destination: destination || null,
      search: debouncedSearch || null,
    })
      .then((res) => {
        setClips((prev) => [...prev, ...res.clips])
        setNextCursor(res.nextCursor)
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : 'Erro ao carregar mais'),
      )
      .finally(() => setLoadingMore(false))
  }, [token, nextCursor, loadingMore, destination, debouncedSearch])

  // ─── Limpar filtros ─────────────────────────────────────
  const clearFilters = useCallback(() => {
    setSearch('')
    setDebouncedSearch('')
    setDestination('')
  }, [])

  const hasFilters = destination !== '' || debouncedSearch !== ''

  // ─── Render: Loading ────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <svg
          className="animate-spin h-6 w-6 text-violet-500"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <p className="text-sm text-gray-400 dark:text-gray-500 animate-pulse">Carregando histórico...</p>
      </div>
    )
  }

  // ─── Render: Error ──────────────────────────────────────
  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-red-500 mb-3">{error}</p>
        <button
          onClick={() => {
            setError(null)
            setLoading(true)
            getHistory(token, { limit: 20 })
              .then((res) => {
                setClips(res.clips)
                setNextCursor(res.nextCursor)
                setTotal(res.total)
              })
              .catch((e) => setError(e.message))
              .finally(() => setLoading(false))
          }}
          className="text-sm text-violet-500 hover:text-violet-700 dark:hover:text-violet-400 underline transition-all duration-200 cursor-pointer"
        >
          Tentar novamente
        </button>
      </div>
    )
  }

  // ─── Render: Empty ──────────────────────────────────────
  if (clips.length === 0) {
    return (
      <div className="space-y-4">
        {/* ─── Search + Filters ──────────────────────────── */}
        <HistoryFilters
          search={search}
          onSearchChange={handleSearchChange}
          destination={destination}
          onDestinationChange={setDestination}
          hasFilters={hasFilters}
          onClear={clearFilters}
        />

        <div className="text-center py-12">
          <span className="text-4xl block mb-3">📭</span>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            {hasFilters
              ? 'Nenhum resultado encontrado para essa busca.'
              : 'Nenhum texto salvo ainda. Cole um texto acima e salve!'}
          </p>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="mt-3 text-sm text-violet-500 hover:text-violet-700 dark:hover:text-violet-400 underline transition-all duration-200 cursor-pointer"
            >
              Limpar filtros
            </button>
          )}
        </div>
      </div>
    )
  }

  // ─── Render: Lista com resultados ───────────────────────
  return (
    <div className="space-y-3">
      {/* ─── Search + Filters ────────────────────────────── */}
      <HistoryFilters
        search={search}
        onSearchChange={handleSearchChange}
        destination={destination}
        onDestinationChange={setDestination}
        hasFilters={hasFilters}
        onClear={clearFilters}
      />

      {/* ─── Contagem ────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-400 dark:text-gray-500">
          {hasFilters
            ? `${total} resultado${total !== 1 ? 's' : ''} encontrado${total !== 1 ? 's' : ''}`
            : `${total} salvamento${total !== 1 ? 's' : ''} no total`}
        </p>
      </div>

      {/* ─── Lista de clips ──────────────────────────────── */}
      <div className="space-y-2">
        {clips.map((clip, index) => (
          <div
            key={clip.id}
            className="group flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 transition-all duration-300 hover:border-violet-300 dark:hover:border-violet-600 hover:shadow-md hover:shadow-violet-100/50 dark:hover:shadow-violet-950/30"
            style={{
              animation: `fade-in 0.3s ease-out ${index * 0.03}s both`,
            }}
          >
            <span className="text-lg flex-shrink-0 transition-transform duration-300 group-hover:scale-125">
              {DEST_ICONS[clip.destination] ?? '📄'}
            </span>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {clip.title ?? 'Sem título'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {DEST_LABELS[clip.destination] ?? clip.destination}
                {' · '}
                {new Date(clip.created_at).toLocaleDateString('pt-BR', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>

            {clip.external_url && (
              <a
                href={clip.external_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 p-2 rounded-lg text-gray-400 hover:text-violet-500 hover:bg-violet-50 dark:hover:bg-violet-950/40 transition-all duration-300 hover:scale-110 opacity-0 group-hover:opacity-100 focus:opacity-100"
                title="Abrir no Google"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            )}
          </div>
        ))}
      </div>

      {/* ─── Load More ───────────────────────────────────── */}
      {nextCursor && (
        <div className="flex justify-center pt-2 pb-4">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl border border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 text-sm font-medium hover:bg-violet-100 dark:hover:bg-violet-950/60 hover:shadow-md hover:shadow-violet-200/50 dark:hover:shadow-violet-950/30 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loadingMore ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Carregando...
              </>
            ) : (
              <>
                Carregar mais
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Sub-component: Filtros de busca ─────────────────────────

interface HistoryFiltersProps {
  search: string
  onSearchChange: (value: string) => void
  destination: string
  onDestinationChange: (value: string) => void
  hasFilters: boolean
  onClear: () => void
}

function HistoryFilters({
  search,
  onSearchChange,
  destination,
  onDestinationChange,
  hasFilters,
  onClear,
}: HistoryFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-2">
      {/* ─── Campo de busca ──────────────────────────────── */}
      <div className="relative flex-1">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar no título..."
          className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 dark:focus:border-violet-400 transition-all duration-300"
        />
        {search && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-all duration-200 hover:scale-110 cursor-pointer"
          >
            ✕
          </button>
        )}
      </div>

      {/* ─── Filtro por destino ──────────────────────────── */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {DESTINATION_FILTERS.map((dest) => {
          const isActive = destination === dest.id
          return (
            <button
              key={dest.id}
              type="button"
              onClick={() => onDestinationChange(dest.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-medium transition-all duration-300 whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'border-violet-500 dark:border-violet-400 bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 shadow-sm'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 hover:border-violet-300 dark:hover:border-violet-600 hover:text-violet-600 dark:hover:text-violet-400'
              }`}
            >
              <span>{dest.icon}</span>
              {dest.label}
            </button>
          )
        })}
      </div>

      {/* ─── Botão limpar filtros ────────────────────────── */}
      {hasFilters && (
        <button
          onClick={onClear}
          className="px-3 py-2 rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30 text-red-500 dark:text-red-400 text-xs font-medium hover:bg-red-100 dark:hover:bg-red-950/50 transition-all duration-300 hover:scale-105 cursor-pointer"
        >
          Limpar
        </button>
      )}
    </div>
  )
}
