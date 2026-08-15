import { useEffect, useState } from 'react'
import { getSiteStats } from '../api'

const STORAGE_KEY = 'pasty_total_saves_cache'
const CACHE_TTL = 30 * 60 * 1000 // 30 min

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

interface CacheEntry {
  totalSaves: number
  cachedAt: number
}

function readCache(): CacheEntry | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as CacheEntry) : null
  } catch {
    return null
  }
}

function writeCache(entry: CacheEntry) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entry))
  } catch {
    /* localStorage unavailable */
  }
}

export function SaveCounter() {
  const [totalSaves, setTotalSaves] = useState<number | null>(() => readCache()?.totalSaves ?? null)
  const [fallback] = useState(12450)

  useEffect(() => {
    let cancelled = false
    const cache = readCache()

    if (cache && Date.now() - cache.cachedAt < CACHE_TTL) {
      setTotalSaves(cache.totalSaves)
      return
    }

    getSiteStats()
      .then((stats) => {
        if (cancelled) return
        const value = stats.totalSaves || 0
        setTotalSaves(value)
        writeCache({ totalSaves: value, cachedAt: Date.now() })
      })
      .catch(() => {
        if (!cancelled) setTotalSaves(null)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const display = totalSaves ?? fallback

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-50 dark:bg-violet-950/50 border border-violet-200 dark:border-violet-800 text-xs font-medium text-violet-600 dark:text-violet-400">
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <span className="tabular-nums font-bold">{formatNumber(display)}+</span>
      <span>textos salvos</span>
    </div>
  )
}