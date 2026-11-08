import { useMarket } from '@/contexts/MarketContext'
import { useAuth } from '@/contexts/AuthContext'
import { Calendar, ChevronDown, LogOut, Bell, Cpu, Eye, ShieldCheck, Menu, Sparkles } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { notificationService } from '@/services/notificationService'
import type { AppNotification } from '@/services/notificationService'
import { aliceBlueService } from '@/services/aliceBlueService'
import { toast } from 'sonner'

interface TopHeaderProps {
  onToggleSidebar?: () => void
}

export default function TopHeader({ onToggleSidebar }: TopHeaderProps) {
  const { market, setMarket } = useMarket()
  const { profile, signOut, isSuperAdmin, isAdmin, isEditor, hasAdminAccess, hasEditorAccess } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

  const isClientView = location.pathname.startsWith('/app')
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [brokerConnected, setBrokerConnected] = useState(false)

  // Listen for broker status changes
  useEffect(() => {
    const updateBrokerStatus = () => {
      setBrokerConnected(aliceBlueService.isConfigured() && aliceBlueService.isSessionActive())
    }
    updateBrokerStatus()
    void aliceBlueService.refreshStatus()
    window.addEventListener('aliceblue-status-change', updateBrokerStatus)
    return () => window.removeEventListener('aliceblue-status-change', updateBrokerStatus)
  }, [])

  // Only load notifications for admins/editors - users do not need notification features
  useEffect(() => {
    if (!hasEditorAccess || !profile) return

    async function loadNotifications() {
      try {
        const data = await notificationService.getMyNotifications()
        setNotifications(data)
      } catch (err) {
        console.error('Failed to load notifications')
      }
    }

    loadNotifications()
    const subscription = notificationService.subscribeToNotifications((newNotif) => {
      if (newNotif.user_id === profile.id || newNotif.user_id === 'all') {
        setNotifications(prev => [newNotif, ...prev])
        toast.info(`New Notification: ${newNotif.title}`)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [hasEditorAccess, profile])

  const unreadCount = notifications.filter(n => !n.is_read).length

  return (
    <header
      className="fixed top-0 right-0 left-0 lg:left-[var(--sidebar-width)] h-16 flex items-center justify-between px-3 sm:px-6 border-b transition-all duration-300"
      style={{
        backgroundColor: 'var(--bg-secondary)',
        borderColor: 'var(--border-subtle)',
        zIndex: 40,
      }}
    >
      {/* Left: Mobile Drawer Button & Market Toggle */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            if (onToggleSidebar) {
              onToggleSidebar()
            } else {
              window.dispatchEvent(new CustomEvent('toggle-mobile-sidebar'))
            }
          }}
          className="lg:hidden p-2 rounded-lg text-[var(--text-secondary)] hover:text-white hover:bg-[var(--bg-tertiary)] transition-colors"
          aria-label="Toggle navigation menu"
        >
          <Menu size={20} />
        </button>

        {/* Market Selector Pill */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)]">
          {(['NIFTY 50', 'SENSEX'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMarket(m)}
              className="px-2.5 sm:px-3.5 py-1 rounded-md text-xs sm:text-sm font-semibold transition-all duration-200"
              style={{
                backgroundColor: market === m ? 'var(--accent-indigo)' : 'transparent',
                color: market === m ? '#fff' : 'var(--text-secondary)',
              }}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Center - Date (Hidden on mobile) */}
      <div className="hidden md:flex items-center gap-2 text-xs text-[var(--text-secondary)]">
        <Calendar size={14} className="text-[var(--text-muted)]" />
        <span className="font-medium text-[var(--text-primary)]">{today}</span>
      </div>

      {/* Right - User Controls & View Switchers */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Admin/Editor View Switcher */}
        {hasEditorAccess && (
          isClientView ? (
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/25 transition-all shadow-sm"
              title="Return to Master Console"
            >
              <ShieldCheck size={14} className="text-amber-400" />
              <span className="hidden sm:inline">Admin Console</span>
            </button>
          ) : (
            <button
              onClick={() => navigate('/app')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/25 transition-all shadow-sm"
              title="Switch to Subscriber View to see what clients see"
            >
              <Eye size={13} className="text-indigo-400" />
              <span className="hidden sm:inline">View as User</span>
            </button>
          )
        )}

        {/* Alice Blue Broker Status Pill for Admins */}
        {hasAdminAccess && (
          <button
            onClick={() => navigate('/broker')}
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all border ${
              brokerConnected
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25 hover:bg-emerald-500/20'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/25 hover:bg-amber-500/20'
            }`}
            title="Configure Alice Blue Broker API & Credentials"
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                brokerConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <Cpu size={12} />
            <span className="hidden md:inline">
              {brokerConnected ? 'Alice Blue: Active' : 'Alice Blue: Connect'}
            </span>
          </button>
        )}

        {/* Notifications ONLY for Admin and Editor roles */}
        {hasEditorAccess && (
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-1.5 rounded-md transition-colors relative hover:bg-[var(--bg-tertiary)]"
              style={{ color: 'var(--text-muted)' }}
              title="Admin Notifications"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 w-2 h-2 bg-rose-500 rounded-full" />
              )}
            </button>

            {showNotifications && (
              <div
                className="absolute right-0 mt-2 w-72 sm:w-80 rounded-xl border bg-[var(--bg-secondary)] border-[var(--border-subtle)] shadow-xl overflow-hidden"
                style={{ zIndex: 100 }}
              >
                <div className="p-3 border-b border-[var(--border-subtle)] flex justify-between items-center bg-[var(--bg-tertiary)]">
                  <span className="text-sm font-bold text-[var(--text-primary)]">Notifications</span>
                  {unreadCount > 0 && (
                    <button
                      onClick={async () => {
                        await notificationService.markAllAsRead()
                        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
                      }}
                      className="text-[10px] text-[var(--accent-indigo)] hover:underline"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map(notif => (
                      <div
                        key={notif.id}
                        className={`p-3 border-b border-[var(--border-subtle)] last:border-0 ${
                          notif.is_read ? 'opacity-60' : 'bg-[var(--accent-indigo)]/5'
                        }`}
                      >
                        <span className="text-xs font-bold text-[var(--text-primary)] block">
                          {notif.title}
                        </span>
                        <p className="text-[10px] text-[var(--text-muted)] mt-1">{notif.message}</p>
                        <span className="text-[8px] text-[var(--text-muted)] mt-2 block">
                          {new Date(notif.created_at).toLocaleString()}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center text-xs text-[var(--text-muted)]">
                      No notifications.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* User Info & Role Badge */}
        <div className="flex items-center gap-2">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-medium text-[var(--text-primary)] truncate max-w-[120px]">
              {profile?.full_name || profile?.email?.split('@')[0] || 'Subscriber'}
            </div>
            {isSuperAdmin ? (
              <span className="text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Super Admin
              </span>
            ) : isAdmin ? (
              <span className="text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Admin
              </span>
            ) : isEditor ? (
              <span className="text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                Editor
              </span>
            ) : (
              <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                Subscriber
              </span>
            )}
          </div>

          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white overflow-hidden shadow-sm shrink-0"
            style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}
          >
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              (profile?.full_name?.[0] || profile?.email?.[0] || 'U').toUpperCase()
            )}
          </div>
        </div>

        {/* Sign Out Button */}
        <button
          onClick={signOut}
          className="p-1.5 rounded-md transition-colors hover:bg-[var(--bg-tertiary)] hover:text-rose-400"
          style={{ color: 'var(--text-muted)' }}
          title="Sign Out"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  )
}
