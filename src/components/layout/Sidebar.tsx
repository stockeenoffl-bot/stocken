import { NavLink, useLocation, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
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
  BarChart3,
  LineChart,
  TrendingUp,
  Cpu,
  ShieldCheck,
  X,
  Sparkles,
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

const clientNavItems: NavItem[] = [
  { path: '/app', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/app/indian-markets', label: 'Indian Markets', icon: TrendingUp, isLive: true },
  { path: '/app/chart', label: 'Live Chart', icon: LineChart },
  { path: '/app/oi', label: 'OI Analysis', icon: BarChart3 },
  { path: '/app/learning', label: 'Learning', icon: GraduationCap },
  { path: '/app/subscription', label: 'My Subscription', icon: CreditCard },
]

interface SidebarProps {
  isClient?: boolean
  isOpen?: boolean
  onClose?: () => void
}

export default function Sidebar({ isClient = false, isOpen = false, onClose }: SidebarProps) {
  const location = useLocation()
  const { isSuperAdmin, isAdmin, isEditor, hasAdminAccess, hasEditorAccess } = useAuth()
  const [brokerConnected, setBrokerConnected] = useState(false)

  useEffect(() => {
    const checkBroker = () => {
      setBrokerConnected(aliceBlueService.isConfigured() && aliceBlueService.isSessionActive())
    }
    checkBroker()
    void aliceBlueService.refreshStatus()

    const onStatusChange = () => checkBroker()
    window.addEventListener('aliceblue-status-change', onStatusChange)
    return () => window.removeEventListener('aliceblue-status-change', onStatusChange)
  }, [])

  // Auto-close mobile drawer on route change
  useEffect(() => {
    if (onClose) {
      onClose()
    }
  }, [location.pathname])

  // Build admin / editor nav sections dynamically
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
        // Subscriptions & payments are strictly ADMIN only (editors cannot view subscriptions or payments)
        ...(hasAdminAccess
          ? [{ path: '/subscriptions', label: 'Subscription & Billing', icon: CreditCard }]
          : []),
        ...(hasAdminAccess
          ? [{ path: '/notifications', label: 'Notification Center', icon: Bell }]
          : []),
        { path: '/learning', label: 'Learning LMS', icon: GraduationCap },
      ],
    },
    ...(hasAdminAccess
      ? [
          {
            title: 'INTEGRATIONS & SYSTEM',
            items: [
              { path: '/broker', label: 'Alice Blue Broker API', icon: Cpu, badge: 'A3 API' },
              { path: '/security', label: 'Security & Access', icon: Shield },
            ],
          },
        ]
      : []),
  ]

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      <aside
        className={`fixed left-0 top-0 h-full flex flex-col border-r transition-transform duration-300 z-50 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          width: 'var(--sidebar-width)',
          backgroundColor: 'var(--bg-secondary)',
          borderColor: 'var(--border-subtle)',
        }}
      >
        {/* Logo & Role Header */}
        <div className="flex items-center justify-between px-5 h-16 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="flex items-center gap-3 min-w-0">
            <img src="/images/ZonalEdge.jpeg" alt="Zonal Edge" className="w-8 h-8 rounded-lg object-cover shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-[var(--text-primary)] truncate">Zonal Edge</span>
                {!isClient && (
                  <span
                    className={`px-1 py-0.2 rounded text-[8px] font-black uppercase tracking-wider ${
                      isSuperAdmin
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        : isAdmin
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    }`}
                  >
                    {isSuperAdmin ? 'SUPER ADMIN' : isAdmin ? 'ADMIN' : 'EDITOR'}
                  </span>
                )}
              </div>
              <div className="text-[8px] uppercase tracking-widest text-[var(--text-muted)] truncate">
                {!isClient ? (isEditor ? 'Analyst / Editor' : 'Master Console') : 'Subscriber Portal'}
              </div>
            </div>
          </div>

          {/* Close button on mobile */}
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-[var(--text-muted)] hover:text-white hover:bg-[var(--bg-tertiary)]"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-3 px-3 space-y-4 overflow-y-auto custom-scrollbar">
          {isClient ? (
            <div className="space-y-1">
              {/* Quick Switcher back to Admin Console if Super Admin or Editor is previewing user view */}
              {hasEditorAccess && (
                <Link
                  to="/dashboard"
                  onClick={onClose}
                  className="flex items-center gap-2 px-3 py-2 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/30 text-xs font-bold hover:bg-amber-500/25 transition-all mb-3 shadow-sm"
                >
                  <ShieldCheck size={16} className="text-amber-400" />
                  <span>{hasAdminAccess ? 'Admin Console' : 'Editor Dashboard'}</span>
                </Link>
              )}
              {clientNavItems.map((item) => {
                const isActive = location.pathname === item.path
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
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
                      onClick={onClose}
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
        {!hasEditorAccess && (
          <div className="mx-3 mb-2 p-3 rounded-lg border bg-[var(--bg-tertiary)] border-[var(--border-subtle)]">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-[var(--text-primary)]">My Plan</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/30">
                ACTIVE
              </span>
            </div>
            <div className="text-[10px] text-[var(--text-secondary)] mb-2">
              Indian markets live zones & structure
            </div>
            <Link
              to="/app/subscription"
              onClick={onClose}
              className="w-full py-1.5 rounded bg-[var(--accent-indigo)] text-white text-[10px] font-bold text-center block hover:brightness-110 transition-all shadow-sm"
            >
              Manage Subscription
            </Link>
          </div>
        )}

        {/* Support & Legal Links */}
        <div className="p-3 border-t space-y-1" style={{ borderColor: 'var(--border-subtle)' }}>
          <Link
            to="/contact"
            onClick={onClose}
            className="p-2 rounded-lg border flex items-center gap-2 bg-[var(--bg-tertiary)] border-[var(--border-subtle)] hover:border-[var(--accent-indigo)] transition-colors"
          >
            <Headphones size={15} className="text-[var(--accent-indigo)]" />
            <div>
              <div className="text-xs font-semibold text-[var(--text-primary)]">Support</div>
              <div className="text-[9px] text-[var(--text-muted)]">support@zonaledge.com</div>
            </div>
          </Link>
        </div>
      </aside>
    </>
  )
}
