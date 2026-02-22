// ── Auth Types ────────────────────────────────────────────────────────────────

export type UserRole = 'ADMIN' | 'HR' | 'EMPLOYEE'

export interface JwtUser {
  sub: number
  username: string
  role: UserRole
}

export interface LoginPayload {
  username: string
  password: string
}

export interface RegisterPayload {
  username: string
  email: string
  password: string
}

export interface LoginResponse {
  user: {
    id: number
    username: string
    email: string
    isActive: boolean
    role: { id: number; roleName: UserRole }
  }
  accessToken: string
}

export interface AuthState {
  token: string
  user: JwtUser | null
}
