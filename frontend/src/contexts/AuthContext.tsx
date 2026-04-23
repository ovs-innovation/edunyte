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
  validateToken,
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
  googleLogin: (credential: string, role?: string, isAccessToken?: boolean) => Promise<void>
  firebaseLogin: (token: string, role?: string) => Promise<void>
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
    const initAuth = async () => {
      const storedToken = getStoredToken()

      if (storedToken) {
        try {
            // Optimistically set user from storage while validating
            const userFromStorage = getStoredUser();
            if(userFromStorage) setUser(userFromStorage);
            
            const validatedUser = await validateToken()
            
            if (validatedUser) {
                setToken(storedToken)
                setUser(validatedUser)
                setStoredUser(validatedUser)
            } else {
                // Token invalid
                setToken(null)
                setUser(null)
                removeStoredToken()
                removeStoredUser()
            }
        } catch (error) {
            setToken(null)
            setUser(null)
            removeStoredToken()
            removeStoredUser()
        }
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
      
      if (authResponse.user.role === 'teacher') {
        navigate('/instructor-dashboard', { replace: true })
      } else if (authResponse.user.role === 'student') {
        navigate('/my-dashboard', { replace: true })
      } else {
        navigate('/', { replace: true })
      }
    } catch (error) {
      throw error
    }
  }, [navigate])

  const googleLogin = useCallback(async (credential: string, role?: string, isAccessToken?: boolean) => {
    try {
      const { googleLogin: googleLoginAPI } = await import('../services/authService')
      const authResponse = await googleLoginAPI(credential, role, isAccessToken)

      if ('status' in authResponse && (authResponse as any).status === 'pending') {
        navigate('/login', { replace: true })
        return
      }

      if (authResponse.token && authResponse.user) {
        setStoredToken(authResponse.token)
        setStoredUser(authResponse.user)
        setToken(authResponse.token)
        setUser(authResponse.user)

        if (authResponse.user.role === 'teacher') {
          navigate('/instructor-dashboard', { replace: true })
        } else if (authResponse.user.role === 'student') {
          navigate('/my-dashboard', { replace: true })
        } else {
          navigate('/', { replace: true })
        }
      }
    } catch (error) {
      throw error
    }
  }, [navigate])

  const firebaseLogin = useCallback(async (token: string, role?: string) => {
    try {
      const { firebaseLogin: firebaseLoginAPI } = await import('../services/authService')
      const authResponse = await firebaseLoginAPI(token, role)

      if ('status' in authResponse && (authResponse as any).status === 'pending') {
        navigate('/login', { replace: true })
        return
      }

      if (authResponse.token && authResponse.user) {
        setStoredToken(authResponse.token)
        setStoredUser(authResponse.user)
        setToken(authResponse.token)
        setUser(authResponse.user)

        if (authResponse.user.role === 'teacher') {
          navigate('/instructor-dashboard', { replace: true })
        } else if (authResponse.user.role === 'student') {
          navigate('/my-dashboard', { replace: true })
        } else {
          navigate('/', { replace: true })
        }
      }
    } catch (error) {
      throw error
    }
  }, [navigate])

  const register = useCallback(async (userData: RegisterData) => {
    try {
      const authResponse = await registerAPI(userData)
      
      // If registration returns 'pending' status, don't login directly
      if ('status' in authResponse && (authResponse as any).status === 'pending') {
        navigate('/login', { replace: true })
        return
      }
      
      if (authResponse.token && authResponse.user) {
        setStoredToken(authResponse.token)
        setStoredUser(authResponse.user)
        setToken(authResponse.token)
        setUser(authResponse.user)
        
        if (authResponse.user.role === 'teacher') {
          navigate('/instructor-dashboard', { replace: true })
        } else if (authResponse.user.role === 'student') {
          navigate('/my-dashboard', { replace: true })
        } else {
          navigate('/', { replace: true })
        }
      } else {
         navigate('/login', { replace: true })
      }
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
        googleLogin,
        firebaseLogin,
        logout,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

