import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  ToggleLeft,
  ToggleRight,
  Smartphone,
  Globe
} from 'lucide-react'

import { userService } from '@/services/userService'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

interface RealUser {
  id: string
  full_name: string
  email: string
  role: string
  status: string
  created_at: string
  plan: string
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
}

export default function Users() {
  const [activeSubTab, setActiveSubTab] = useState('search-users')
  const [userQuery, setUserQuery] = useState('')
  const [users, setUsers] = useState<RealUser[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const data = await userService.getAllUsers()
      const formatted = data.map((u: any) => {
        const subs = u.subscriptions || []
        const activeSub = subs.find((s: any) => s.status === 'active')
        return {
          id: u.id,
          full_name: u.full_name || 'Unknown',
          email: u.email,
          role: u.role,
          status: u.status,
          created_at: new Date(u.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          plan: activeSub?.subscription_plans?.name || 'Free'
        }
      })
      setUsers(formatted)
    } catch (error: any) {
      toast.error('Failed to load users: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const toggleUserStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active'
    try {
      await userService.updateUserStatus(id, newStatus)
      toast.success(`User status updated to ${newStatus}`)
      setUsers(prev => prev.map(u => u.id === id ? { ...u, status: newStatus } : u))
    } catch (error: any) {
      toast.error('Failed to update status: ' + error.message)
    }
  }

  const changeUserPlan = async (id: string, newPlan: string) => {
    try {
      await userService.updateUserPlan(id, newPlan)
      toast.success(`User upgraded to ${newPlan}`)
      setUsers(prev => prev.map(u => u.id === id ? { ...u, plan: newPlan } : u))
    } catch (error: any) {
      toast.error('Failed to update plan: ' + error.message)
    }
  }

  const subTabs = [
    { id: 'search-users', label: 'Search users' },
    { id: 'activate-deactivate', label: 'Activate/Deactivate account' },
    { id: 'membership-status', label: 'Membership status' },
    { id: 'login-history', label: 'Login history' },
    { id: 'device-info', label: 'Device information' }
  ]

  const filteredUsers = users.filter(u =>
    u.full_name.toLowerCase().includes(userQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(userQuery.toLowerCase())
  )

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[var(--text-primary)]">User Management</h1>
        <p className="text-xs mt-1 text-[var(--text-muted)]">
          Manage system subscriber credentials, active profiles, and platform logins.
        </p>
      </div>

      {/* Horizontal Sub-tabs Bar */}
      <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-1.5 p-1 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] w-fit mb-6">
        {subTabs.map((sub) => {
          const isSubActive = activeSubTab === sub.id
          return (
            <button
              key={sub.id}
              onClick={() => setActiveSubTab(sub.id)}
              className="px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200"
              style={{
                backgroundColor: isSubActive ? 'var(--accent-indigo)' : 'transparent',
                color: isSubActive ? '#fff' : 'var(--text-secondary)',
              }}
            >
              {sub.label}
            </button>
          )
        })}
      </motion.div>

      {/* Sub-tab Detail View */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSubTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="rounded-xl border p-6 bg-[var(--bg-secondary)] border-[var(--border-subtle)] space-y-6"
        >
          {activeSubTab === 'search-users' && (
            <div className="space-y-4">
              <div className="pb-4 border-b border-[var(--border-subtle)]">
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">Search Users</h3>
                <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Find subscriber details and current configurations.</p>
              </div>

              {/* Search controls */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={14} />
                <input
                  type="text"
                  placeholder="Search user name or email..."
                  value={userQuery}
                  onChange={(e) => setUserQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-md border text-xs outline-none bg-[var(--bg-tertiary)] border-[var(--border-subtle)] text-[var(--text-primary)] focus:border-[var(--accent-indigo)]"
                />
              </div>

              {/* Table result */}
              <div className="overflow-x-auto rounded-lg border border-[var(--border-subtle)]">
                <table className="w-full text-left text-xs bg-[var(--bg-tertiary)]">
                  <thead>
                    <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)] text-[var(--text-muted)]">
                      <th className="p-3">User</th>
                      <th className="p-3">Email</th>
                      <th className="p-3">Tier</th>
                      <th className="p-3">Joined Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={4} className="p-8 text-center">
                          <Loader2 className="animate-spin text-[var(--accent-indigo)] mx-auto" />
                        </td>
                      </tr>
                    ) : filteredUsers.length > 0 ? (
                      filteredUsers.map(user => (
                        <tr key={user.id} className="border-b border-[var(--border-subtle)] text-[var(--text-secondary)]">
                          <td className="p-3 font-semibold text-[var(--text-primary)]">{user.full_name}</td>
                          <td className="p-3 font-mono">{user.email}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold bg-[var(--bg-secondary)] border border-[var(--border-subtle)]`}>
                              {user.plan}
                            </span>
                          </td>
                          <td className="p-3 font-mono">{user.created_at}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="p-4 text-center text-[var(--text-muted)]">No users found matching query.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeSubTab === 'activate-deactivate' && (
            <div className="space-y-4">
              <div className="pb-4 border-b border-[var(--border-subtle)]">
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">Activate / Deactivate Account</h3>
                <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Toggle active authorization statuses for subscriber logins.</p>
              </div>

              <div className="space-y-2">
                {users.map(user => (
                  <div key={user.id} className="flex items-center justify-between p-3.5 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)]">
                    <div>
                      <span className="text-xs font-bold text-[var(--text-primary)]">{user.full_name}</span>
                      <span className="text-[9px] font-mono text-[var(--text-muted)] block mt-0.5">{user.email}</span>
                    </div>
                    <button
                      onClick={() => toggleUserStatus(user.id, user.status)}
                      className="text-[var(--accent-indigo)] transition-transform active:scale-95 flex items-center gap-2 text-xs"
                    >
                      <span className={`text-[10px] font-bold uppercase ${user.status === 'active' ? 'text-emerald-400' : 'text-[var(--danger)]'}`}>
                        {user.status}
                      </span>
                      {user.status === 'active' ? <ToggleRight size={24} className="text-emerald-500" /> : <ToggleLeft size={24} className="text-[var(--danger)]" />}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSubTab === 'membership-status' && (
            <div className="space-y-4">
              <div className="pb-4 border-b border-[var(--border-subtle)]">
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">Membership Status</h3>
                <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Upgrade or downgrade subscriber pricing tiers.</p>
              </div>

              <div className="space-y-2">
                {users.map(user => (
                  <div key={user.id} className="flex items-center justify-between p-3.5 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)]">
                    <div>
                      <span className="text-xs font-bold text-[var(--text-primary)]">{user.full_name}</span>
                      <span className="text-[9px] font-mono text-[var(--text-muted)] block mt-0.5">Current plan: {user.plan}</span>
                    </div>
                    <select
                      value={user.plan}
                      onChange={(e) => changeUserPlan(user.id, e.target.value)}
                      className="px-2 py-1 text-xs rounded-md border outline-none bg-[var(--bg-secondary)] border-[var(--border-subtle)] text-[var(--text-primary)] focus:border-[var(--accent-indigo)]"
                    >
                      <option value="Free">Free</option>
                      <option value="Pro">Pro</option>
                      <option value="VIP">VIP</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSubTab === 'login-history' && (
            <div className="space-y-4">
              <div className="pb-4 border-b border-[var(--border-subtle)]">
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">Login History</h3>
                <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Logs of recent user platform access attempts.</p>
              </div>

              <div className="overflow-x-auto rounded-lg border border-[var(--border-subtle)]">
                <table className="w-full text-left text-xs bg-[var(--bg-tertiary)]">
                  <thead>
                    <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)] text-[var(--text-muted)]">
                      <th className="p-3">User</th>
                      <th className="p-3">IP Address</th>
                      <th className="p-3">Device / Browser</th>
                      <th className="p-3">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-[var(--border-subtle)] text-[var(--text-secondary)]">
                      <td className="p-3 font-semibold text-[var(--text-primary)]">Alexander Wright</td>
                      <td className="p-3 font-mono">192.168.1.12</td>
                      <td className="p-3 flex items-center gap-1.5"><Smartphone size={13} /> iPhone / Safari</td>
                      <td className="p-3 font-mono">29 Apr 2025, 11:14 AM</td>
                    </tr>
                    <tr className="border-b border-[var(--border-subtle)] text-[var(--text-secondary)]">
                      <td className="p-3 font-semibold text-[var(--text-primary)]">Sarah Jenkins</td>
                      <td className="p-3 font-mono">203.0.113.88</td>
                      <td className="p-3 flex items-center gap-1.5"><Globe size={13} /> MacOS / Chrome</td>
                      <td className="p-3 font-mono">29 Apr 2025, 10:48 AM</td>
                    </tr>
                    <tr className="border-b border-[var(--border-subtle)] text-[var(--text-secondary)]">
                      <td className="p-3 font-semibold text-[var(--text-primary)]">Marcus Chen</td>
                      <td className="p-3 font-mono">198.51.100.2</td>
                      <td className="p-3 flex items-center gap-1.5"><Globe size={13} /> Windows / Firefox</td>
                      <td className="p-3 font-mono">28 Apr 2025, 04:30 PM</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeSubTab === 'device-info' && (
            <div className="space-y-4">
              <div className="pb-4 border-b border-[var(--border-subtle)]">
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">Device Information</h3>
                <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Aggregate devices utilized by active platform members.</p>
              </div>

              <div className="p-4 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] space-y-3">
                <span className="text-[9px] uppercase font-bold text-[var(--text-muted)]">Device breakdown</span>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-[var(--text-secondary)]"><span>Desktop Browser (Chrome/Firefox)</span><span>65%</span></div>
                  <div className="h-1.5 rounded-full bg-[var(--bg-secondary)] overflow-hidden"><div className="h-full bg-[var(--accent-indigo)]" style={{ width: '65%' }} /></div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-[var(--text-secondary)]"><span>Mobile Phone (iOS/Android)</span><span>30%</span></div>
                  <div className="h-1.5 rounded-full bg-[var(--bg-secondary)] overflow-hidden"><div className="h-full bg-purple-500" style={{ width: '30%' }} /></div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-[var(--text-secondary)]"><span>Tablets / iPads</span><span>5%</span></div>
                  <div className="h-1.5 rounded-full bg-[var(--bg-secondary)] overflow-hidden"><div className="h-full bg-amber-400" style={{ width: '5%' }} /></div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  )
}
