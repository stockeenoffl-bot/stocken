import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Loader2 } from 'lucide-react'

export function AdminRoute() {
  const { session, profile, loading, isSuperAdmin, isAdmin } = useAuth()
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

  const hasAdminAccess = isSuperAdmin || isAdmin || (profile && ['super_admin', 'admin', 'analyst'].includes(profile.role))

  if (!hasAdminAccess) {
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
  const { session, profile, loading, isSuperAdmin, isAdmin } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] text-[var(--text-primary)]">
        <Loader2 className="animate-spin mr-2" /> Loading...
      </div>
    )
  }

  if (session) {
    const hasAdminAccess = isSuperAdmin || isAdmin || (profile && ['super_admin', 'admin', 'analyst'].includes(profile.role))
    if (hasAdminAccess) {
      return <Navigate to="/dashboard" replace />
    }
    return <Navigate to="/app" replace />
  }

  return <Outlet />
}
