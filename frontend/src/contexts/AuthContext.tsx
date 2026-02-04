import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  login as loginAPI,
  register as registerAPI,
  getStoredToken,
  setStoredToken,
  removeStoredToken,
  getStoredUser,
  setStoredUser,
  removeStoredUser,
  LoginCredentials,
  RegisterData,
  AuthResponse,
} from '../services/authService'

interface User {
  id: string
  name: string
  email: string
  role: string
  permissions: string[]
  status: string
  photo?: string
  avatar?: string
  image?: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  register: (userData: RegisterData) => Promise<void>
  logout: () => void
  updateUserProfile: (data: any) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const initAuth = () => {
      const storedToken = getStoredToken()
      const storedUser = getStoredUser()

      if (storedToken && storedUser) {
        setToken(storedToken)
        setUser(storedUser)
      }
      setIsLoading(false)
    }

    initAuth()
  }, [])

  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      const response = await loginAPI(credentials)

      if ('requiresOTP' in response && response.requiresOTP) {
        throw new Error('OTP_REQUIRED')
      }

      const authResponse = response as AuthResponse
      setStoredToken(authResponse.token)
      setStoredUser(authResponse.user)
      setToken(authResponse.token)
      setUser(authResponse.user)
      navigate('/', { replace: true })
    } catch (error) {
      throw error
    }
  }, [navigate])

  const register = useCallback(async (userData: RegisterData) => {
    try {
      const authResponse = await registerAPI(userData)
      setStoredToken(authResponse.token)
      setStoredUser(authResponse.user)
      setToken(authResponse.token)
      setUser(authResponse.user)
      navigate('/', { replace: true })
    } catch (error) {
      throw error
    }
  }, [navigate])

  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
    removeStoredToken()
    removeStoredUser()
    navigate('/login', { replace: true })
  }, [navigate])

  const updateUserProfile = useCallback(async (data: any) => {
      try {
          const { updateProfile } = await import('../services/authService');
          const updatedUser = await updateProfile(data);
          setStoredUser(updatedUser);
          setUser(updatedUser);
      } catch (err) {
          console.error("Failed to update profile", err);
          throw err;
      }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user && !!token,
        login,
        register,
        logout,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

