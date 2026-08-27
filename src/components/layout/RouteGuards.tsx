import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Loader2 } from 'lucide-react'

export function AdminRoute() {
  const { session, profile, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] text-[var(--text-primary)]">
        <Loader2 className="animate-spin mr-2" /> Loading...
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (profile && !['super_admin', 'admin', 'analyst'].includes(profile.role)) {
    // Subscriber trying to access admin dashboard
    return <Navigate to="/app" replace />
  }

  return <Outlet />
}

export function ClientRoute() {
  const { session, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] text-[var(--text-primary)]">
        <Loader2 className="animate-spin mr-2" /> Loading...
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <Outlet />
}

export function PublicRoute() {
  const { session, profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] text-[var(--text-primary)]">
        <Loader2 className="animate-spin mr-2" /> Loading...
      </div>
    )
  }

  if (session) {
    if (profile && ['super_admin', 'admin', 'analyst'].includes(profile.role)) {
      return <Navigate to="/dashboard" replace />
    }
    return <Navigate to="/app" replace />
  }

  return <Outlet />
}
