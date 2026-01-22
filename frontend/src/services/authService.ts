const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

export interface LoginCredentials {
  email: string
  password: string
  otp?: string
}

export interface RegisterData {
  name: string
  email: string
  password: string
  role?: string
}

export interface AuthResponse {
  token: string
  user: {
    id: string
    name: string
    email: string
    role: string
    permissions: string[]
    status: string
  }
}

export interface OTPResponse {
  requiresOTP: boolean
  message: string
}

export const login = async (credentials: LoginCredentials): Promise<AuthResponse | OTPResponse> => {
  const response = await fetch(`${API_BASE_URL}/auth/login?appType=student`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'Login failed')
  }

  return data
}

export const register = async (userData: RegisterData): Promise<AuthResponse> => {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...userData,
      role: userData.role || 'student',
    }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'Registration failed')
  }

  return data
}

export const getStoredToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token')
  }
  return null
}

export const setStoredToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_token', token)
  }
}

export const removeStoredToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token')
  }
}

export const getStoredUser = (): AuthResponse['user'] | null => {
  if (typeof window !== 'undefined') {
    const userStr = localStorage.getItem('auth_user')
    if (userStr) {
      return JSON.parse(userStr)
    }
  }
  return null
}

export const setStoredUser = (user: AuthResponse['user']): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_user', JSON.stringify(user))
  }
}

export const removeStoredUser = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_user')
  }
}

