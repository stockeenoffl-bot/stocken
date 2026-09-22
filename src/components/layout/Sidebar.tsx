import { NavLink, useLocation, Link } from 'react-router-dom'
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
  LineChart,
  TrendingUp,
  Cpu,
  ShieldCheck,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { aliceBlueService } from '@/services/aliceBlueService'
import { useAuth } from '@/contexts/AuthContext'

interface NavItem {
  path: string
  label: string
  icon: any
  isLive?: boolean
  badge?: string
}

interface NavSection {
  title?: string
  items: NavItem[]
}

const adminNavSections: NavSection[] = [
  {
    title: 'MARKET & ANALYSIS',
    items: [
      { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { path: '/indian-markets', label: 'Indian Markets', icon: TrendingUp, isLive: true },
      { path: '/chart', label: 'Live Chart', icon: LineChart },
      { path: '/oi', label: 'OI Analysis', icon: BarChart3 },
      { path: '/create', label: 'Create / Edit Analysis', icon: PenSquare },
      { path: '/preview', label: 'Live Preview', icon: Eye },
    ],
  },
  {
    title: 'MANAGEMENT',
    items: [
      { path: '/users', label: 'User Management', icon: Users },
      { path: '/subscriptions', label: 'Subscription & Billing', icon: CreditCard },
      { path: '/notifications', label: 'Notification Center', icon: Bell },
      { path: '/learning', label: 'Learning LMS', icon: GraduationCap },
    ],
  },
  {
    title: 'INTEGRATIONS & SYSTEM',
    items: [
      { path: '/broker', label: 'Alice Blue Broker API', icon: Cpu, badge: 'A3 API' },
      { path: '/security', label: 'Security & Access', icon: Shield },
    ],
  },
]

const clientNavItems: NavItem[] = [
  { path: '/app', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/app/indian-markets', label: 'Indian Markets', icon: TrendingUp, isLive: true },
  { path: '/app/chart', label: 'Live Chart', icon: LineChart },
  { path: '/app/oi', label: 'OI Analysis', icon: BarChart3 },
  { path: '/app/learning', label: 'Learning', icon: GraduationCap },
  { path: '/app/notifications', label: 'Notifications', icon: Bell },
  { path: '/app/subscription', label: 'My Subscription', icon: CreditCard },
]

export default function Sidebar({ isClient = false }: { isClient?: boolean }) {
  const location = useLocation()
  const { isSuperAdmin, isAdmin } = useAuth()
  const hasAdminAccess = isSuperAdmin || isAdmin
  const [brokerConnected, setBrokerConnected] = useState(false)

  useEffect(() => {
    const checkBroker = () => {
      setBrokerConnected(aliceBlueService.isConfigured() && aliceBlueService.isSessionActive())
    }
    checkBroker()

    const onStatusChange = () => checkBroker()
    window.addEventListener('aliceblue-status-change', onStatusChange)
    return () => window.removeEventListener('aliceblue-status-change', onStatusChange)
  }, [])

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
      {/* Logo & Super Admin Header */}
      <div className="flex items-center gap-3 px-5 h-16 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
        <img src="/images/ZonalEdge.jpeg" alt="Zonal Edge" className="w-8 h-8 rounded-lg object-cover" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold text-[var(--text-primary)] truncate">Zonal Edge</span>
            {!isClient && (
              <span className="px-1 py-0.2 rounded text-[8px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                ADMIN
              </span>
            )}
          </div>
          <div className="text-[8px] uppercase tracking-widest text-[var(--text-muted)]">
            {!isClient ? 'Super Admin Console' : 'Subscriber Portal'}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-3 space-y-4 overflow-y-auto custom-scrollbar">
        {isClient ? (
          <div className="space-y-1">
            {/* Quick Switcher back to Admin Console if Super Admin is previewing user view */}
            {hasAdminAccess && (
              <Link
                to="/dashboard"
                className="flex items-center gap-2 px-3 py-2 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/30 text-xs font-bold hover:bg-amber-500/25 transition-all mb-3 shadow-sm"
              >
                <ShieldCheck size={16} className="text-amber-400" />
                <span>Super Admin Console</span>
              </Link>
            )}
            {clientNavItems.map((item) => {
              const isActive = location.pathname === item.path
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className="relative flex items-center gap-3 px-3 py-2 rounded-md transition-colors duration-200 group"
                  style={{
                    backgroundColor: isActive ? 'var(--bg-tertiary)' : 'transparent',
                    color: isActive ? 'var(--accent-indigo)' : 'var(--text-secondary)',
                    fontWeight: isActive ? '700' : '500',
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
                  <item.icon size={18} strokeWidth={1.75} />
                  <span className="text-xs flex-1">{item.label}</span>
                  {item.isLive && (
                    <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      LIVE
                    </span>
                  )}
                </NavLink>
              )
            })}
          </div>
        ) : (
          adminNavSections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              {section.title && (
                <div className="px-3 pb-1 text-[9px] font-bold tracking-wider text-[var(--text-muted)] uppercase">
                  {section.title}
                </div>
              )}
              {section.items.map((item) => {
                const isActive = location.pathname === item.path
                const isBrokerItem = item.path === '/broker'
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className="relative flex items-center gap-3 px-3 py-2 rounded-md transition-colors duration-200 group"
                    style={{
                      backgroundColor: isActive ? 'var(--bg-tertiary)' : 'transparent',
                      color: isActive ? 'var(--accent-indigo)' : 'var(--text-secondary)',
                      fontWeight: isActive ? '700' : '500',
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
                    <item.icon size={18} strokeWidth={1.75} />
                    <span className="text-xs flex-1 truncate">{item.label}</span>

                    {item.isLive && (
                      <span className="px-1.5 py-0.5 rounded text-[8px] font-extrabold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 tracking-wider">
                        LIVE
                      </span>
                    )}

                    {isBrokerItem && (
                      <span
                        className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold border ${
                          brokerConnected
                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                            : 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30'
                        }`}
                      >
                        {brokerConnected ? 'ACTIVE' : 'A3 API'}
                      </span>
                    )}
                  </NavLink>
                )
              })}
            </div>
          ))
        )}
      </nav>

      {/* Subscriber Plan Card for Regular Users */}
      {!hasAdminAccess && (
        <div className="mx-3 mb-2 p-3 rounded-lg border bg-[var(--bg-tertiary)] border-[var(--border-subtle)]">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-[var(--text-primary)]">Subscriber Portal</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/30">
              ACTIVE
            </span>
          </div>
          <div className="text-[10px] text-[var(--text-secondary)] mb-2">
            Real-time Indian market signals & zones
          </div>
          <Link
            to="/app/subscription"
            className="w-full py-1.5 rounded bg-[var(--accent-indigo)] text-white text-[10px] font-bold text-center block hover:brightness-110 transition-all"
          >
            My Subscription
          </Link>
        </div>
      )}

      {/* Admin Master Console - ONLY for Super Admin / Admin Accounts */}
      {hasAdminAccess && (
        <Link
          to="/dashboard"
          className="mx-3 mb-2 p-3 rounded-lg border bg-[var(--bg-tertiary)] border-[var(--border-subtle)] block hover:border-[var(--accent-indigo)] transition-all group"
        >
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <Gem size={14} className="text-[var(--accent-indigo)]" />
              <span className="text-xs font-bold text-[var(--text-primary)]">Admin Master Console</span>
            </div>
            <span className="text-[8px] font-extrabold uppercase px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
              {isSuperAdmin ? 'SUPER ADMIN' : 'ADMIN'}
            </span>
          </div>
          <div className="text-[10px] text-emerald-400 font-semibold mb-0.5 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Switch to Admin &rarr;
          </div>
          <div className="text-[9px] text-[var(--text-muted)]">Full broker execution privileges</div>
        </Link>
      )}

      {/* Support */}
      <Link
        to="/contact"
        className="mx-3 mb-3 p-2.5 rounded-lg border block bg-[var(--bg-tertiary)] border-[var(--border-subtle)] hover:border-[var(--accent-indigo)] transition-colors"
      >
        <div className="flex items-center gap-2">
          <Headphones size={15} className="text-[var(--accent-indigo)]" />
          <div>
            <div className="text-xs font-semibold text-[var(--text-primary)]">Need Help?</div>
            <div className="text-[9px] text-[var(--text-muted)]">Contact Technical Desk</div>
          </div>
        </div>
      </Link>
    </aside>
  )
}
