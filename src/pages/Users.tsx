import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  ToggleLeft,
  ToggleRight,
  UserPlus,
  Shield,
  CheckCircle2,
  AlertCircle,
  X,
  Plus,
  Loader2,
  Users as UsersIcon,
  Crown,
  Lock,
} from 'lucide-react'
import { userService } from '@/services/userService'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

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
  const { hasAdminAccess, isEditor, canViewSubscriptions } = useAuth()
  const [activeSubTab, setActiveSubTab] = useState('search-users')
  const [userQuery, setUserQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [users, setUsers] = useState<RealUser[]>([])
  const [loading, setLoading] = useState(true)

  // Add User Modal State
  const [showAddModal, setShowAddModal] = useState(false)
  const [creatingUser, setCreatingUser] = useState(false)
  const [newUser, setNewUser] = useState({
    fullName: '',
    email: '',
    role: 'user',
    plan: 'Pro',
  })

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
          full_name: u.full_name || 'Trader',
          email: u.email,
          role: u.role || 'user',
          status: u.status || 'active',
          created_at: new Date(u.created_at).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          }),
          plan: activeSub?.subscription_plans?.name || 'Free Trial',
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
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, status: newStatus } : u)))
    } catch (error: any) {
      toast.error('Failed to update status: ' + error.message)
    }
  }

  const changeUserPlan = async (id: string, newPlan: string) => {
    if (!canViewSubscriptions) {
      toast.error('Only Administrators can change subscription plans.')
      return
    }
    try {
      await userService.updateUserPlan(id, newPlan)
      toast.success(`User plan updated to ${newPlan}`)
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, plan: newPlan } : u)))
    } catch (error: any) {
      toast.error('Failed to update plan: ' + error.message)
    }
  }

  const changeUserRole = async (id: string, newRole: string) => {
    // Prevent editors from assigning admin role
    if (!hasAdminAccess && (newRole === 'admin' || newRole === 'super_admin')) {
      toast.error('Only Super Admins can promote users to Administrator.')
      return
    }

    try {
      const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', id)
      if (error) throw error
      toast.success(`User role updated to ${newRole}`)
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role: newRole } : u)))
    } catch (error: any) {
      toast.error('Failed to update role: ' + error.message)
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newUser.email || !newUser.fullName) {
      toast.error('Please enter full name and email')
      return
    }

    setCreatingUser(true)
    try {
      const mockId = `usr_${Date.now()}`
      const createdUserObj: RealUser = {
        id: mockId,
        full_name: newUser.fullName,
        email: newUser.email,
        role: newUser.role,
        status: 'active',
        created_at: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        plan: canViewSubscriptions ? newUser.plan : 'Free Trial',
      }

      setUsers((prev) => [createdUserObj, ...prev])
      toast.success(`Member ${newUser.fullName} registered as ${newUser.role}!`)
      setShowAddModal(false)
      setNewUser({ fullName: '', email: '', role: 'user', plan: 'Free Trial' })
    } catch (err: any) {
      toast.error('Failed to create user: ' + err.message)
    } finally {
      setCreatingUser(false)
    }
  }

  // Filtered Users
  const filteredUsers = users.filter((u) => {
    const matchesQuery =
      u.full_name.toLowerCase().includes(userQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(userQuery.toLowerCase())
    const matchesRole = roleFilter === 'all' || u.role === roleFilter
    const matchesStatus = statusFilter === 'all' || u.status === statusFilter
    return matchesQuery && matchesRole && matchesStatus
  })

  const activeCount = users.filter((u) => u.status === 'active').length
  const suspendedCount = users.filter((u) => u.status !== 'active').length
  const editorCount = users.filter((u) => u.role === 'editor' || u.role === 'analyst').length
  const proCount = users.filter((u) => u.plan !== 'Free' && u.plan !== 'Free Trial').length

  const subTabs = [
    { id: 'search-users', label: 'User Directory' },
    { id: 'activate-deactivate', label: 'Access Control' },
    ...(canViewSubscriptions ? [{ id: 'membership-status', label: 'Plan Assignment' }] : []),
  ]

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      {/* Top Header & Add User Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[var(--text-primary)]">User & Role Management</h1>
            {isEditor && !hasAdminAccess && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30">
                EDITOR VIEW
              </span>
            )}
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Manage subscriber credentials, platform access roles, and platform authorizations.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold bg-[var(--accent-indigo)] text-white hover:brightness-110 transition-all shadow-md shrink-0"
        >
          <UserPlus size={15} />
          <span>Add New Member</span>
        </button>
      </div>

      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl border bg-[var(--bg-secondary)] border-[var(--border-subtle)]">
          <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">Total Users</span>
          <h4 className="text-xl font-mono font-bold text-[var(--text-primary)] mt-0.5">{users.length}</h4>
        </div>
        <div className="p-3.5 rounded-xl border bg-[var(--bg-secondary)] border-[var(--border-subtle)]">
          <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">Active Accounts</span>
          <h4 className="text-xl font-mono font-bold text-emerald-400 mt-0.5">{activeCount}</h4>
        </div>
        <div className="p-3.5 rounded-xl border bg-[var(--bg-secondary)] border-[var(--border-subtle)]">
          <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">
            {canViewSubscriptions ? 'Paid Subscribers' : 'Chart Editors'}
          </span>
          <h4 className="text-xl font-mono font-bold text-[var(--accent-indigo)] mt-0.5">
            {canViewSubscriptions ? proCount : editorCount}
          </h4>
        </div>
        <div className="p-3.5 rounded-xl border bg-[var(--bg-secondary)] border-[var(--border-subtle)]">
          <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">Suspended</span>
          <h4 className="text-xl font-mono font-bold text-rose-400 mt-0.5">{suspendedCount}</h4>
        </div>
      </div>

      {/* Horizontal Sub-tabs Bar */}
      <motion.div
        variants={itemVariants}
        className="flex flex-wrap items-center gap-1.5 p-1 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] w-fit"
      >
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
          className="rounded-xl border p-4 sm:p-6 bg-[var(--bg-secondary)] border-[var(--border-subtle)] space-y-6"
        >
          {/* TAB 1: SEARCH & DIRECTORY */}
          {activeSubTab === 'search-users' && (
            <div className="space-y-4">
              <div className="pb-3 border-b border-[var(--border-subtle)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-[var(--text-primary)]">User Directory</h3>
                  <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
                    Filter and inspect registered accounts, assign roles, and manage access.
                  </p>
                </div>
                <span className="text-[10px] text-[var(--text-muted)] font-mono">
                  Showing {filteredUsers.length} of {users.length} members
                </span>
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={14} />
                  <input
                    type="text"
                    placeholder="Search name or email..."
                    value={userQuery}
                    onChange={(e) => setUserQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 rounded-lg border text-xs outline-none bg-[var(--bg-tertiary)] border-[var(--border-subtle)] text-[var(--text-primary)] focus:border-[var(--accent-indigo)]"
                  />
                </div>

                <div>
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border text-xs outline-none bg-[var(--bg-tertiary)] border-[var(--border-subtle)] text-[var(--text-primary)] focus:border-[var(--accent-indigo)]"
                  >
                    <option value="all">All Roles</option>
                    <option value="admin">Admin</option>
                    <option value="editor">Editor</option>
                    <option value="user">Subscriber (User)</option>
                  </select>
                </div>

                <div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border text-xs outline-none bg-[var(--bg-tertiary)] border-[var(--border-subtle)] text-[var(--text-primary)] focus:border-[var(--accent-indigo)]"
                  >
                    <option value="all">All Statuses</option>
                    <option value="active">Active Only</option>
                    <option value="suspended">Suspended Only</option>
                  </select>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto rounded-lg border border-[var(--border-subtle)]">
                <table className="w-full text-left text-xs bg-[var(--bg-tertiary)] min-w-[600px]">
                  <thead>
                    <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)] text-[var(--text-muted)]">
                      <th className="p-3">User</th>
                      <th className="p-3">Role</th>
                      {canViewSubscriptions && <th className="p-3">Plan</th>}
                      <th className="p-3">Status</th>
                      <th className="p-3">Joined</th>
                      <th className="p-3 text-right">Quick Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={canViewSubscriptions ? 6 : 5} className="p-8 text-center">
                          <Loader2 className="animate-spin text-[var(--accent-indigo)] mx-auto" />
                        </td>
                      </tr>
                    ) : filteredUsers.length > 0 ? (
                      filteredUsers.map((user) => (
                        <tr
                          key={user.id}
                          className="border-b border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]/50"
                        >
                          <td className="p-3">
                            <div className="font-semibold text-[var(--text-primary)]">{user.full_name}</div>
                            <div className="font-mono text-[10px] text-[var(--text-muted)]">{user.email}</div>
                          </td>
                          <td className="p-3">
                            <select
                              value={user.role}
                              onChange={(e) => changeUserRole(user.id, e.target.value)}
                              className={`px-2 py-0.5 rounded text-[10px] font-bold border outline-none bg-[var(--bg-secondary)] ${
                                user.role === 'admin'
                                  ? 'text-indigo-400 border-indigo-500/30'
                                  : user.role === 'editor'
                                  ? 'text-blue-400 border-blue-500/30'
                                  : 'text-slate-400 border-slate-500/30'
                              }`}
                            >
                              <option value="user">Subscriber</option>
                              <option value="editor">Editor</option>
                              {hasAdminAccess && <option value="admin">Admin</option>}
                            </select>
                          </td>
                          {canViewSubscriptions && (
                            <td className="p-3">
                              <select
                                value={user.plan}
                                onChange={(e) => changeUserPlan(user.id, e.target.value)}
                                className="px-2 py-0.5 rounded text-[10px] font-bold bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[var(--text-primary)]"
                              >
                                <option value="Free Trial">Free Trial</option>
                                <option value="Monthly">Monthly (₹499)</option>
                                <option value="Quarterly">Quarterly (₹1,299)</option>
                                <option value="Annual">Annual (₹4,999)</option>
                              </select>
                            </td>
                          )}
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                                user.status === 'active'
                                  ? 'bg-emerald-500/10 text-emerald-400'
                                  : 'bg-rose-500/10 text-rose-400'
                              }`}
                            >
                              {user.status}
                            </span>
                          </td>
                          <td className="p-3 font-mono text-[11px]">{user.created_at}</td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => toggleUserStatus(user.id, user.status)}
                              className="text-[10px] font-bold px-2 py-1 rounded bg-[var(--bg-secondary)] border border-[var(--border-subtle)] hover:text-white"
                            >
                              {user.status === 'active' ? 'Suspend' : 'Reactivate'}
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={canViewSubscriptions ? 6 : 5} className="p-6 text-center text-[var(--text-muted)]">
                          No users found matching query.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: ACCESS & SUSPENSIONS */}
          {activeSubTab === 'activate-deactivate' && (
            <div className="space-y-4">
              <div className="pb-3 border-b border-[var(--border-subtle)]">
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">Access & Authorization Toggles</h3>
                <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
                  Instantly block or restore subscriber login privileges.
                </p>
              </div>

              <div className="space-y-2">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3.5 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)]"
                  >
                    <div>
                      <span className="text-xs font-bold text-[var(--text-primary)]">{user.full_name}</span>
                      <span className="text-[10px] font-mono text-[var(--text-muted)] block mt-0.5">{user.email}</span>
                    </div>
                    <button
                      onClick={() => toggleUserStatus(user.id, user.status)}
                      className="transition-transform active:scale-95 flex items-center gap-2 text-xs"
                    >
                      <span
                        className={`text-[10px] font-bold uppercase ${
                          user.status === 'active' ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {user.status}
                      </span>
                      {user.status === 'active' ? (
                        <ToggleRight size={26} className="text-emerald-500" />
                      ) : (
                        <ToggleLeft size={26} className="text-rose-500" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: MEMBERSHIP & PLAN TIERS (Only for Super Admin) */}
          {canViewSubscriptions && activeSubTab === 'membership-status' && (
            <div className="space-y-4">
              <div className="pb-3 border-b border-[var(--border-subtle)]">
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">Subscription Plan Assignment</h3>
                <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
                  Directly grant Free Trial, Monthly, Quarterly, or Annual plans to subscribers.
                </p>
              </div>

              <div className="space-y-2">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] gap-2"
                  >
                    <div>
                      <span className="text-xs font-bold text-[var(--text-primary)]">{user.full_name}</span>
                      <span className="text-[10px] font-mono text-[var(--text-muted)] block mt-0.5">
                        {user.email} &bull; Current: <span className="text-indigo-400 font-bold">{user.plan}</span>
                      </span>
                    </div>
                    <select
                      value={user.plan}
                      onChange={(e) => changeUserPlan(user.id, e.target.value)}
                      className="px-2.5 py-1 rounded text-xs font-semibold bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[var(--text-primary)] outline-none"
                    >
                      <option value="Free Trial">Free Trial (7 Days - ₹0)</option>
                      <option value="Monthly">Monthly Plan (₹499)</option>
                      <option value="Quarterly">Quarterly Plan (₹1,299)</option>
                      <option value="Annual">Annual Plan (₹4,999)</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-md rounded-xl border p-6 bg-[var(--bg-secondary)] border-[var(--border-subtle)] shadow-2xl"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-2">
                <UserPlus size={18} className="text-[var(--accent-indigo)]" />
                <h3 className="text-sm font-bold text-[var(--text-primary)]">Add New Platform Member</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-[var(--text-muted)] hover:text-white">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4 pt-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--text-primary)]">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={newUser.fullName}
                  onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border text-xs outline-none bg-[var(--bg-tertiary)] border-[var(--border-subtle)] text-[var(--text-primary)] focus:border-[var(--accent-indigo)]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--text-primary)]">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="trader@example.com"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border text-xs outline-none bg-[var(--bg-tertiary)] border-[var(--border-subtle)] text-[var(--text-primary)] focus:border-[var(--accent-indigo)]"
                />
              </div>

              <div className={`grid ${canViewSubscriptions ? 'grid-cols-2' : 'grid-cols-1'} gap-3`}>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[var(--text-primary)]">Access Role</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border text-xs outline-none bg-[var(--bg-tertiary)] border-[var(--border-subtle)] text-[var(--text-primary)] focus:border-[var(--accent-indigo)]"
                  >
                    <option value="user">Subscriber (User)</option>
                    <option value="editor">Chart Editor</option>
                    {hasAdminAccess && <option value="admin">Administrator</option>}
                  </select>
                </div>

                {canViewSubscriptions && (
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[var(--text-primary)]">Plan Tier</label>
                    <select
                      value={newUser.plan}
                      onChange={(e) => setNewUser({ ...newUser, plan: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border text-xs outline-none bg-[var(--bg-tertiary)] border-[var(--border-subtle)] text-[var(--text-primary)] focus:border-[var(--accent-indigo)]"
                    >
                      <option value="Free Trial">Free Trial (7 Days)</option>
                      <option value="Monthly">Monthly (₹499)</option>
                      <option value="Quarterly">Quarterly (₹1,299)</option>
                      <option value="Annual">Annual (₹4,999)</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingUser}
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-[var(--accent-indigo)] text-white hover:brightness-110 flex items-center gap-1.5"
                >
                  {creatingUser ? <Loader2 size={13} className="animate-spin" /> : null}
                  <span>{creatingUser ? 'Creating...' : 'Create Member'}</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  )
}
