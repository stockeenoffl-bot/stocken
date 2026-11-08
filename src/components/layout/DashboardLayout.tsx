import { useState, useEffect } from 'react'
import { Outlet, useLocation, NavLink } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Sidebar from './Sidebar'
import TopHeader from './TopHeader'
import { useAuth } from '@/contexts/AuthContext'
import {
  LayoutDashboard,
  LineChart,
  TrendingUp,
  BarChart3,
  CreditCard,
  PenSquare,
  Users,
} from 'lucide-react'

export default function DashboardLayout({ isClient = false }: { isClient?: boolean }) {
  const location = useLocation()
  const { hasEditorAccess, hasAdminAccess } = useAuth()
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  // Listen to custom event from TopHeader if triggered via event
  useEffect(() => {
    const handleToggle = () => setIsMobileSidebarOpen((prev) => !prev)
    window.addEventListener('toggle-mobile-sidebar', handleToggle)
    return () => window.removeEventListener('toggle-mobile-sidebar', handleToggle)
  }, [])

  // Bottom navigation items for mobile
  const clientMobileNav = [
    { path: '/app', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/app/chart', label: 'Live Chart', icon: LineChart },
    { path: '/app/indian-markets', label: 'Markets', icon: TrendingUp },
    { path: '/app/oi', label: 'OI Data', icon: BarChart3 },
    { path: '/app/subscription', label: 'My Plan', icon: CreditCard },
  ]

  const adminMobileNav = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/chart', label: 'Chart', icon: LineChart },
    { path: '/create', label: 'Analysis', icon: PenSquare },
    { path: '/oi', label: 'OI Data', icon: BarChart3 },
    { path: hasAdminAccess ? '/subscriptions' : '/users', label: hasAdminAccess ? 'Billing' : 'Users', icon: hasAdminAccess ? CreditCard : Users },
  ]

  const activeMobileNav = isClient ? clientMobileNav : adminMobileNav

  return (
    <div className="min-h-screen relative flex flex-col" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Sidebar (Desktop fixed + Mobile slide-out drawer) */}
      <Sidebar
        isClient={isClient}
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* Top Header */}
      <TopHeader onToggleSidebar={() => setIsMobileSidebarOpen((prev) => !prev)} />

      {/* Main Content Area */}
      <main className="pt-16 pb-24 lg:pb-8 transition-all duration-300 ml-0 lg:ml-[var(--sidebar-width)] flex-1">
        <div className="px-3 sm:px-6 pt-4 sm:pt-5 max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Mobile Bottom Navigation Bar (Hidden on desktop) */}
      <nav
        className="fixed bottom-0 left-0 right-0 h-16 border-t lg:hidden z-30 flex items-center justify-around px-2 backdrop-blur-lg"
        style={{
          backgroundColor: 'rgba(21, 26, 48, 0.95)',
          borderColor: 'var(--border-subtle)',
        }}
      >
        {activeMobileNav.map((item) => {
          const isActive = location.pathname === item.path
          const Icon = item.icon
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
                isActive
                  ? 'text-[var(--accent-indigo)] font-bold'
                  : 'text-[var(--text-muted)] hover:text-white'
              }`}
            >
              <div className="relative">
                <Icon size={18} strokeWidth={isActive ? 2.4 : 1.8} />
                {isActive && (
                  <motion.div
                    layoutId="mobile-nav-indicator"
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[var(--accent-indigo)]"
                  />
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight truncate max-w-[64px]">
                {item.label}
              </span>
            </NavLink>
          )
        })}
      </nav>
    </div>
  )
}
