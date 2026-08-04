import axios from 'axios'
import type { AuthResponse, SaveResponse, HistoryResponse } from './types'

/**
 * Resolve a API base URL a partir de VITE_API_URL.
 * - Vazio → produção (https://api.pasty.ordob.com/api)
 * - '/api' → proxy do Vite em dev (NÃO duplica o sufixo)
 * - 'http://localhost:8000' ou outro host → host + '/api'
 */
function resolveApiBase(url: string | undefined): string {
  if (!url) return 'https://api.pasty.ordob.com/api'
  const clean = url.replace(/\/+$/, '')
  return clean.endsWith('/api') ? clean : `${clean}/api`
}

const API_BASE = resolveApiBase(import.meta.env.VITE_API_URL)

const MAX_RETRIES = 2
const RETRY_DELAY_MS = 1000

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
})

// ─── Token helpers ───────────────────────────────────────────

const TOKEN_KEY = 'utc_token'
const USER_KEY = 'utc_user'

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function clearStoredAuth(): void {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

// ─── Response interceptor: handle 401 + retry on 5xx ──────

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      clearStoredAuth()
      window.dispatchEvent(new CustomEvent('auth:expired'))
    }

    const config = error.config
    if (!config || config._retryCount === undefined) {
      config._retryCount = 0
    }

    if (
      config._retryCount < MAX_RETRIES &&
      (!error.response || error.response.status >= 500)
    ) {
      config._retryCount++
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS * config._retryCount))
      return api(config)
    }

    return Promise.reject(error)
  },
)

/** Create an axios instance with Bearer token */
function authedApi(token: string) {
  const instance = axios.create({
    baseURL: API_BASE,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    timeout: 15000,
  })

  let retryCount = 0

  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response?.status === 401) {
        clearStoredAuth()
        window.dispatchEvent(new CustomEvent('auth:expired'))
      }

      const config = error.config
      if (
        config &&
        retryCount < MAX_RETRIES &&
        (!error.response || error.response.status >= 500)
      ) {
        retryCount++
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS * retryCount))
        return instance(config)
      }

      return Promise.reject(error)
    },
  )

  return instance
}

/** Get the Google OAuth URL */
export async function getGoogleAuthUrl(): Promise<string> {
  const { data } = await api.get<{ auth_url: string }>('/auth/google/login')
  return data.auth_url
}

/** Exchange OAuth code for JWT token */
export async function exchangeCode(code: string, state?: string): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/callback', { code, state })
  return data
}

/** Get current user info */
export async function getMe(token: string): Promise<AuthResponse['user']> {
  const { data } = await authedApi(token).get<{ user: AuthResponse['user'] }>('/auth/me')
  return data.user
}

/** Save text to a destination */
export async function saveText(
  text: string,
  destination: string,
  title: string,
  token: string,
): Promise<SaveResponse> {
  const { data } = await authedApi(token).post<SaveResponse>('/save', {
    text,
    destination,
    title,
  })
  return data
}

/** Get user's save history with pagination */
export async function getHistory(
  token: string,
  params: {
    cursor?: number | null
    limit?: number
    destination?: string | null
    search?: string | null
  } = {},
): Promise<HistoryResponse> {
  const query: Record<string, string> = {}
  if (params.cursor) query.cursor = String(params.cursor)
  if (params.limit) query.limit = String(params.limit)
  if (params.destination) query.destination = params.destination
  if (params.search) query.search = params.search

  const { data } = await authedApi(token).get<HistoryResponse>('/history', { params: query })
  return data
}

export default api
