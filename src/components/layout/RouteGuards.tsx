import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Loader2 } from 'lucide-react'

export function AdminRoute() {
  const { session, loading, hasEditorAccess } = useAuth()
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

  if (!hasEditorAccess) {
    // Subscriber trying to access editor/admin dashboard
    return <Navigate to="/app" replace />
  }

  return <Outlet />
}

export function AdminOnlyRoute() {
  const { session, loading, canViewSubscriptions } = useAuth()
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

  if (!canViewSubscriptions) {
    // Editor or Subscriber trying to access Admin-only route (e.g. Subscriptions/Payments)
    return <Navigate to="/dashboard" replace />
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
  const { session, loading, hasEditorAccess } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] text-[var(--text-primary)]">
        <Loader2 className="animate-spin mr-2" /> Loading...
      </div>
    )
  }

  if (session) {
    if (hasEditorAccess) {
      return <Navigate to="/dashboard" replace />
    }
    return <Navigate to="/app" replace />
  }

  return <Outlet />
}
