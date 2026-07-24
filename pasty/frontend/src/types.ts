/** User information returned from the API */
export interface User {
  id: number
  google_id: string
  email: string
  name: string | null
  avatar_url: string | null
  created_at: string
}

/** A saved text clip record */
export interface Clip {
  id: number
  content_hash: string
  title: string | null
  destination: 'docs' | 'drive' | 'gmail'
  external_id: string | null
  external_url: string | null
  created_at: string
}

/** Supported save destinations */
export type Destination = 'docs' | 'drive' | 'gmail'

/** Destination metadata */
export interface DestinationInfo {
  id: Destination
  label: string
  icon: string
  description: string
  color: string
}

/** Response from /api/auth/callback */
export interface AuthResponse {
  token: string
  user: User
}

/** Response from /api/save */
export interface SaveResponse {
  duplicate: boolean
  message: string
  clip: Clip
}

/** Response from /api/history */
export interface HistoryResponse {
  clips: Clip[]
  nextCursor: number | null
  total: number
}

/** Params for fetching history with pagination */
export interface HistoryParams {
  cursor?: number | null
  limit?: number
  destination?: string | null
  search?: string | null
}
