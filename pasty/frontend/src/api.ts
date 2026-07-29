import axios from 'axios'
import type { AuthResponse, SaveResponse, HistoryResponse } from './types'

/** API base URL — uses VITE_API_URL in production (Vercel), falls back to '/api' for dev proxy */
const API_BASE = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
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

// ─── Response interceptor: handle 401 globally ──────────────

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired — clear auth so UI can react
      clearStoredAuth()
      // Dispatch a custom event that AuthGuard/useAuth can listen to
      window.dispatchEvent(new CustomEvent('auth:expired'))
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

  // Also add 401 interceptor to authed instance
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        clearStoredAuth()
        window.dispatchEvent(new CustomEvent('auth:expired'))
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
