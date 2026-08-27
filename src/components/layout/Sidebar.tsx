import { NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  PenSquare,
  Eye,
  Users,
  CreditCard,
  Bell,
  GraduationCap,
  Shield,
  Headphones,
  ChevronRight,
  Gem,
  BarChart3,
} from 'lucide-react'

const adminNavItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/users', label: 'User Management', icon: Users },
  { path: '/subscriptions', label: 'Subscription Management', icon: CreditCard },
  { path: '/notifications', label: 'Notifications', icon: Bell },
  { path: '/learning', label: 'Learning', icon: GraduationCap },
  { path: '/security', label: 'Security', icon: Shield },
  { path: '/create', label: 'Create / Edit Analysis', icon: PenSquare },
  { path: '/preview', label: 'Live Preview', icon: Eye },
  { path: '/oi', label: 'OI', icon: BarChart3 },
]

const clientNavItems = [
  { path: '/app', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/app/oi', label: 'OI Analysis', icon: BarChart3 },
  { path: '/app/learning', label: 'Learning', icon: GraduationCap },
  { path: '/app/notifications', label: 'Notifications', icon: Bell },
  { path: '/app/subscription', label: 'My Subscription', icon: CreditCard },
]

export default function Sidebar({ isClient = false }: { isClient?: boolean }) {
  const location = useLocation()

  return (
    <aside
      className="fixed left-0 top-0 h-full flex flex-col border-r"
      style={{
        width: 'var(--sidebar-width)',
        backgroundColor: 'var(--bg-secondary)',
        borderColor: 'var(--border-subtle)',
        zIndex: 50,
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-16 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
        <img src="/images/ZonalEdge.jpeg" alt="Zonal Edge" className="w-8 h-8 rounded-lg object-cover" />
        <div>
          <div className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Zonal Edge</div>
          <div className="text-[8px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Trade with Confidence</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-3 space-y-1 overflow-y-auto">
        {(isClient ? clientNavItems : adminNavItems).map((item) => {
          const isActive = location.pathname === item.path
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className="relative flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors duration-200 group"
              style={{
                backgroundColor: isActive ? 'var(--bg-tertiary)' : 'transparent',
                color: isActive ? 'var(--accent-indigo)' : 'var(--text-secondary)',
                fontWeight: isActive ? '800' : '700', // Bold style as requested
              }}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute left-0 top-1 bottom-1 w-[3px] rounded-r-full"
                  style={{ backgroundColor: 'var(--accent-indigo)' }}
                  transition={{ duration: 0.2 }}
                />
              )}
              <item.icon size={20} strokeWidth={1.5} />
              <span className="text-xs">{item.label}</span>
            </NavLink>
          )
        })}
      </nav>

      {/* Pro Plan Card */}
      <div className="mx-3 mb-3 p-3 rounded-lg border" style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-subtle)' }}>
        <div className="flex items-center gap-2 mb-2">
          <Gem size={16} style={{ color: 'var(--accent-indigo)' }} />
          <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>Pro Plan</span>
        </div>
        <div className="text-[10px] mb-1" style={{ color: 'var(--text-muted)' }}>Active</div>
        <div className="text-[10px] mb-2" style={{ color: 'var(--text-muted)' }}>Valid till 29 May 2025</div>
        <button className="flex items-center gap-1 text-xs font-medium transition-colors" style={{ color: 'var(--accent-indigo)' }}>
          Manage Plan <ChevronRight size={12} />
        </button>
      </div>

      {/* Support */}
      <div className="mx-3 mb-4 p-3 rounded-lg border" style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-subtle)' }}>
        <div className="flex items-center gap-2">
          <Headphones size={16} style={{ color: 'var(--text-muted)' }} />
          <div>
            <div className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>Need Help?</div>
            <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Contact Support</div>
          </div>
        </div>
      </div>
    </aside>
  )
}
