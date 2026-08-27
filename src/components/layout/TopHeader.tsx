import { useMarket } from '@/contexts/MarketContext'
import { useAuth } from '@/contexts/AuthContext'
import { Calendar, ChevronDown, LogOut, Bell } from 'lucide-react'
import { useState, useEffect } from 'react'
import { notificationService } from '@/services/notificationService'
import type { AppNotification } from '@/services/notificationService'
import { toast } from 'sonner'

export default function TopHeader() {
  const { market, setMarket } = useMarket()
  const { profile, signOut } = useAuth()
  const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [showNotifications, setShowNotifications] = useState(false)

  useEffect(() => {
    async function loadNotifications() {
      try {
        const data = await notificationService.getMyNotifications()
        setNotifications(data)
      } catch (err) {
        console.error('Failed to load notifications')
      }
    }
    
    if (profile) {
      loadNotifications()
      const subscription = notificationService.subscribeToNotifications((newNotif) => {
        if (newNotif.user_id === profile.id || newNotif.user_id === 'all') { // if broadcast
          setNotifications(prev => [newNotif, ...prev])
          toast.info(`New Notification: ${newNotif.title}`)
        }
      })
      
      return () => {
        subscription.unsubscribe()
      }
    }
  }, [profile])

  const unreadCount = notifications.filter(n => !n.is_read).length

  return (
    <header
      className="fixed top-0 right-0 h-16 flex items-center justify-between px-6 border-b"
      style={{
        left: 'var(--sidebar-width)',
        backgroundColor: 'var(--bg-secondary)',
        borderColor: 'var(--border-subtle)',
        zIndex: 40,
      }}
    >
      {/* Market Toggle */}
      <div className="flex items-center gap-1 p-1 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
        {(['NIFTY 50', 'SENSEX'] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMarket(m)}
            className="px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200"
            style={{
              backgroundColor: market === m ? 'var(--accent-indigo)' : 'transparent',
              color: market === m ? '#fff' : 'var(--text-secondary)',
            }}
          >
            {m}
          </button>
        ))}
      </div>

      {/* Center - Date */}
      <div className="flex items-center gap-2">
        <Calendar size={16} style={{ color: 'var(--text-muted)' }} />
        <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{today}</span>
        <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
      </div>

      {/* Right - User */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-1.5 rounded-md transition-colors relative" 
            style={{ color: 'var(--text-muted)' }}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 w-2 h-2 bg-rose-500 rounded-full" />
            )}
          </button>
          
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border bg-[var(--bg-secondary)] border-[var(--border-subtle)] shadow-lg overflow-hidden" style={{ zIndex: 100 }}>
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
                {notifications.length > 0 ? notifications.map(notif => (
                  <div key={notif.id} className={`p-3 border-b border-[var(--border-subtle)] last:border-0 ${notif.is_read ? 'opacity-60' : 'bg-[var(--accent-indigo)]/5'}`}>
                    <span className="text-xs font-bold text-[var(--text-primary)] block">{notif.title}</span>
                    <p className="text-[10px] text-[var(--text-muted)] mt-1">{notif.message}</p>
                    <span className="text-[8px] text-[var(--text-muted)] mt-2 block">{new Date(notif.created_at).toLocaleString()}</span>
                  </div>
                )) : (
                  <div className="p-6 text-center text-xs text-[var(--text-muted)]">No notifications.</div>
                )}
              </div>
            </div>
          )}
        </div>

        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Hi, {profile?.full_name || profile?.email?.split('@')[0] || 'User'}
        </span>
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}
        >
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            (profile?.full_name?.[0] || profile?.email?.[0] || 'U').toUpperCase()
          )}
        </div>
        <button onClick={signOut} className="p-1.5 rounded-md transition-colors" style={{ color: 'var(--text-muted)' }} title="Sign Out">
          <LogOut size={18} />
        </button>
      </div>
    </header>
  )
}
