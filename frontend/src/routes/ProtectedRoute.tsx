import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/features/auth'

export default function ProtectedRoute({ allowedRoles }: { allowedRoles?: string[] }) {
  const location = useLocation()
  const user = useAuthStore(state => state.user)
  const checking = useAuthStore(state => state.checking)
  const sessionError = useAuthStore(state => state.sessionError)
  const checkAuth = useAuthStore(state => state.checkAuth)

  if (checking) return <p role="status" className="p-8 text-center">Verificando sesión...</p>
  if (sessionError) return <div role="alert" className="p-8 text-center">
    <p>{sessionError}</p>
    <button className="mt-3 rounded bg-blue-700 px-4 py-2 text-white" onClick={() => void checkAuth()}>Reintentar</button>
  </div>
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />
  }
  return <Outlet />
}
