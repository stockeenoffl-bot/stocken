import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Key,
  ToggleLeft,
  ToggleRight,
  CheckCircle2
} from 'lucide-react'

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
}

export default function Security() {
  const [activeSubTab, setActiveSubTab] = useState('two-factor')

  // Security (2FA, Access password, Timeout settings)
  const [twoFactor, setTwoFactor] = useState(false)
  const [sessionTimeout, setSessionTimeout] = useState('15m')
  const [rolePermissions, setRolePermissions] = useState({
    superAdmin: { manageUsers: true, editCharts: true, publishAnalysis: true, settings: true },
    editor: { manageUsers: false, editCharts: true, publishAnalysis: true, settings: false },
    support: { manageUsers: true, editCharts: false, publishAnalysis: false, settings: false },
  })
  const [toastMessage, setToastMessage] = useState('')

  const handleSave = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 3000)
  }

  const subTabs = [
    { id: 'two-factor', label: 'Two-factor authentication for admin' },
    { id: 'role-access', label: 'Role-based access' },
    { id: 'activity-logs', label: 'Activity logs' },
    { id: 'session-timeout', label: 'Automatic session timeout' },
    { id: 'backup-export', label: 'Backup/export functionality' }
  ]

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">Security</h1>
          <p className="text-xs mt-1 text-[var(--text-muted)]">
            Manage admin keys, multi-factor logins, roles permissions, and audit trails.
          </p>
        </div>

        {/* Action toast */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex items-center gap-2 px-4 py-2 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold"
            >
              <CheckCircle2 size={14} /> {toastMessage}
            </motion.div>
          )}
        </AnimatePresence>
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

      {/* Details Box */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSubTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="rounded-xl border p-6 bg-[var(--bg-secondary)] border-[var(--border-subtle)] space-y-6"
        >
          {activeSubTab === 'two-factor' && (
            <div className="space-y-4">
              <div className="pb-4 border-b border-[var(--border-subtle)]">
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">Two-Factor Authentication (2FA)</h3>
                <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Protect credentials with physical authenticator tokens.</p>
              </div>

              <div className="p-4 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-[var(--text-primary)] block">Require Two-Factor Authenticator</span>
                  <span className="text-[9px] text-[var(--text-muted)] mt-1 block max-w-sm">Requires OTP entry from tools like Google Authenticator or Duo when admin users log in.</span>
                </div>
                <button
                  onClick={() => {
                    setTwoFactor(!twoFactor)
                    handleSave(!twoFactor ? 'Two-Factor Authentication Enabled' : 'Two-Factor Authentication Disabled')
                  }}
                  className="text-[var(--accent-indigo)] transition-transform active:scale-95"
                >
                  {twoFactor ? <ToggleRight size={28} className="text-emerald-500" /> : <ToggleLeft size={28} className="text-[var(--text-muted)]" />}
                </button>
              </div>
            </div>
          )}

          {activeSubTab === 'role-access' && (
            <div className="space-y-4">
              <div className="pb-4 border-b border-[var(--border-subtle)]">
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">Role-Based Access Matrix</h3>
                <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Determine page restrictions for administrators, editors, and helper support.</p>
              </div>

              <div className="overflow-x-auto rounded-lg border border-[var(--border-subtle)]">
                <table className="w-full text-left text-xs bg-[var(--bg-tertiary)]">
                  <thead>
                    <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)] text-[var(--text-muted)]">
                      <th className="p-3">Permission Node</th>
                      <th className="p-3 text-center">Super Admin</th>
                      <th className="p-3 text-center">Editor</th>
                      <th className="p-3 text-center">Support</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-[var(--border-subtle)] text-[var(--text-secondary)]">
                      <td className="p-3 font-semibold text-[var(--text-primary)]">Manage User Accounts</td>
                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={rolePermissions.superAdmin.manageUsers}
                          onChange={(e) => setRolePermissions({ ...rolePermissions, superAdmin: { ...rolePermissions.superAdmin, manageUsers: e.target.checked } })}
                          className="accent-[var(--accent-indigo)] cursor-pointer"
                        />
                      </td>
                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={rolePermissions.editor.manageUsers}
                          onChange={(e) => setRolePermissions({ ...rolePermissions, editor: { ...rolePermissions.editor, manageUsers: e.target.checked } })}
                          className="accent-[var(--accent-indigo)] cursor-pointer"
                        />
                      </td>
                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={rolePermissions.support.manageUsers}
                          onChange={(e) => setRolePermissions({ ...rolePermissions, support: { ...rolePermissions.support, manageUsers: e.target.checked } })}
                          className="accent-[var(--accent-indigo)] cursor-pointer"
                        />
                      </td>
                    </tr>
                    <tr className="border-b border-[var(--border-subtle)] text-[var(--text-secondary)]">
                      <td className="p-3 font-semibold text-[var(--text-primary)]">Modify Market Charts</td>
                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={rolePermissions.superAdmin.editCharts}
                          onChange={(e) => setRolePermissions({ ...rolePermissions, superAdmin: { ...rolePermissions.superAdmin, editCharts: e.target.checked } })}
                          className="accent-[var(--accent-indigo)] cursor-pointer"
                        />
                      </td>
                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={rolePermissions.editor.editCharts}
                          onChange={(e) => setRolePermissions({ ...rolePermissions, editor: { ...rolePermissions.editor, editCharts: e.target.checked } })}
                          className="accent-[var(--accent-indigo)] cursor-pointer"
                        />
                      </td>
                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={rolePermissions.support.editCharts}
                          onChange={(e) => setRolePermissions({ ...rolePermissions, support: { ...rolePermissions.support, editCharts: e.target.checked } })}
                          className="accent-[var(--accent-indigo)] cursor-pointer"
                        />
                      </td>
                    </tr>
                    <tr className="border-b border-[var(--border-subtle)] text-[var(--text-secondary)]">
                      <td className="p-3 font-semibold text-[var(--text-primary)]">Publish Analysis Bullseye</td>
                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={rolePermissions.superAdmin.publishAnalysis}
                          onChange={(e) => setRolePermissions({ ...rolePermissions, superAdmin: { ...rolePermissions.superAdmin, publishAnalysis: e.target.checked } })}
                          className="accent-[var(--accent-indigo)] cursor-pointer"
                        />
                      </td>
                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={rolePermissions.editor.publishAnalysis}
                          onChange={(e) => setRolePermissions({ ...rolePermissions, editor: { ...rolePermissions.editor, publishAnalysis: e.target.checked } })}
                          className="accent-[var(--accent-indigo)] cursor-pointer"
                        />
                      </td>
                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={rolePermissions.support.publishAnalysis}
                          onChange={(e) => setRolePermissions({ ...rolePermissions, support: { ...rolePermissions.support, publishAnalysis: e.target.checked } })}
                          className="accent-[var(--accent-indigo)] cursor-pointer"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeSubTab === 'activity-logs' && (
            <div className="space-y-4">
              <div className="pb-4 border-b border-[var(--border-subtle)]">
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">Audit Trail Log Activity</h3>
                <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Chronological audit logs of dashboard actions.</p>
              </div>

              <div className="overflow-x-auto rounded-lg border border-[var(--border-subtle)]">
                <table className="w-full text-left text-xs bg-[var(--bg-tertiary)]">
                  <thead>
                    <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)] text-[var(--text-muted)]">
                      <th className="p-3">Administrator</th>
                      <th className="p-3">Action Description</th>
                      <th className="p-3">Component Layer</th>
                      <th className="p-3">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-[var(--border-subtle)] text-[var(--text-secondary)]">
                      <td className="p-3 font-semibold text-[var(--text-primary)]">Admin</td>
                      <td className="p-3">Updated Stripe gateway webhooks target url</td>
                      <td className="p-3 font-mono">Subscriptions</td>
                      <td className="p-3 font-mono">Today, 03:22 PM</td>
                    </tr>
                    <tr className="border-b border-[var(--border-subtle)] text-[var(--text-secondary)]">
                      <td className="p-3 font-semibold text-[var(--text-primary)]">Editor_02</td>
                      <td className="p-3">Toggled video "Module 3" status to Draft</td>
                      <td className="p-3 font-mono">Learning</td>
                      <td className="p-3 font-mono">Yesterday, 11:45 AM</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeSubTab === 'session-timeout' && (
            <div className="space-y-4">
              <div className="pb-4 border-b border-transparent">
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">Automatic Session Inactivity Timeout</h3>
                <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Determine session expirations for admin panels.</p>
              </div>

              <div className="p-4 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] space-y-3">
                <label className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Inactivity Timeout Limit</label>
                <select
                  value={sessionTimeout}
                  onChange={(e) => {
                    setSessionTimeout(e.target.value)
                    handleSave(`Inactivity timeout updated to ${e.target.value}`)
                  }}
                  className="w-full mt-1.5 px-3 py-2 rounded-md border text-xs outline-none bg-[var(--bg-secondary)] border-[var(--border-subtle)] text-[var(--text-primary)] focus:border-[var(--accent-indigo)]"
                >
                  <option value="5m">5 Minutes</option>
                  <option value="15m">15 Minutes</option>
                  <option value="30m">30 Minutes</option>
                  <option value="1h">1 Hour</option>
                </select>
              </div>
            </div>
          )}

          {activeSubTab === 'backup-export' && (
            <div className="space-y-6">
              <div className="pb-4 border-b border-[var(--border-subtle)]">
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">Backup Database & Password Keys</h3>
                <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Download backups or update credentials.</p>
              </div>

              {/* Password Config */}
              <div className="space-y-3 p-4 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)]">
                <h4 className="text-xs font-bold text-[var(--text-secondary)] flex items-center gap-1.5">
                  <Key size={14} /> Update Access Password
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    type="password"
                    placeholder="Current Password"
                    className="px-3 py-2 rounded-md border text-xs outline-none bg-[var(--bg-secondary)] border-[var(--border-subtle)] text-[var(--text-primary)] focus:border-[var(--accent-indigo)]"
                  />
                  <input
                    type="password"
                    placeholder="New Password"
                    className="px-3 py-2 rounded-md border text-xs outline-none bg-[var(--bg-secondary)] border-[var(--border-subtle)] text-[var(--text-primary)] focus:border-[var(--accent-indigo)]"
                  />
                  <input
                    type="password"
                    placeholder="Confirm New Password"
                    className="px-3 py-2 rounded-md border text-xs outline-none bg-[var(--bg-secondary)] border-[var(--border-subtle)] text-[var(--text-primary)] focus:border-[var(--accent-indigo)]"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleSave('Access password successfully updated!')}
                  className="px-4 py-2 mt-2 rounded bg-[var(--accent-indigo)] text-white text-xs font-bold hover:brightness-110 transition-all"
                >
                  Change Password
                </button>
              </div>

              {/* Backup triggers */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] space-y-2">
                  <span className="text-xs font-bold text-[var(--text-primary)] block">Export Backup JSON</span>
                  <span className="text-[9px] text-[var(--text-muted)] block">Downloads configuration states, coupons, active banner contexts, and pdf metadata.</span>
                  <button
                    type="button"
                    onClick={() => handleSave('Exporting Backup JSON...')}
                    className="px-3 py-1.5 rounded bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[10px] hover:text-white transition-colors"
                  >
                    Export State Data
                  </button>
                </div>

                <div className="p-4 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] space-y-2">
                  <span className="text-xs font-bold text-[var(--text-primary)] block">Download Users database</span>
                  <span className="text-[9px] text-[var(--text-muted)] block">CSV backup file listing subscriber names, emails, plans, and authorization stats.</span>
                  <button
                    type="button"
                    onClick={() => handleSave('Downloading Users CSV Backup...')}
                    className="px-3 py-1.5 rounded bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[10px] hover:text-white transition-colors"
                  >
                    Download CSV
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  )
}
