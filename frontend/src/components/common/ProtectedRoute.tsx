import { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

interface ProtectedRouteProps {
   children: ReactNode
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
   const { isAuthenticated, isLoading } = useAuth()
   const location = useLocation()

   if (isLoading) {
      return (
         <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
            <div className="spinner-border text-primary" role="status">
               <span className="visually-hidden">Loading...</span>
            </div>
         </div>
      )
   }

   if (!isAuthenticated) {
      const redirectPath = encodeURIComponent(location.pathname + location.search)
      return <Navigate to={`/login?redirect=${redirectPath}`} state={{ from: location }} replace />
   }

   return <>{children}</>
}

export default ProtectedRoute

