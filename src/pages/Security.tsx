import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Key,
  ToggleLeft,
  ToggleRight,
  CheckCircle2,
  Cpu,
  Zap,
  Globe,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react'
import { aliceBlueService, type AliceBlueCredentials } from '@/services/aliceBlueService'

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

  // Broker API credentials state
  const [brokerCreds, setBrokerCreds] = useState<AliceBlueCredentials>({
    userId: '',
    appId: '',
    apiSecret: '',
    ipAddress: '',
    environment: 'live',
    dataFeedEnabled: true,
  })
  const [detectingIp, setDetectingIp] = useState(false)
  const [generatingToken, setGeneratingToken] = useState(false)

  useEffect(() => {
    const loaded = aliceBlueService.loadCredentials()
    if (loaded) setBrokerCreds(loaded)
  }, [])

  const handleSave = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 3000)
  }

  const handleSaveBrokerCreds = () => {
    aliceBlueService.saveCredentials(brokerCreds)
    handleSave('Alice Blue broker credentials updated successfully!')
  }

  const handleDetectIp = async () => {
    setDetectingIp(true)
    try {
      const ip = await aliceBlueService.detectPublicIp()
      if (ip) {
        setBrokerCreds((prev) => ({ ...prev, ipAddress: ip }))
        handleSave(`Detected IPv4: ${ip}`)
      }
    } finally {
      setDetectingIp(false)
    }
  }

  const handleGenerateToken = async () => {
    setGeneratingToken(true)
    try {
      const res = await aliceBlueService.generateSession()
      if (res.success) {
        const loaded = aliceBlueService.loadCredentials()
        if (loaded) setBrokerCreds(loaded)
        handleSave('Active session token generated!')
      } else {
        handleSave('Error: ' + (res.error || 'Failed to generate token'))
      }
    } finally {
      setGeneratingToken(false)
    }
  }

  const subTabs = [
    { id: 'broker-api', label: 'Alice Blue Broker API' },
    { id: 'two-factor', label: 'Two-factor authentication for admin' },
    { id: 'role-access', label: 'Role-based access' },
    { id: 'activity-logs', label: 'Activity logs' },
    { id: 'session-timeout', label: 'Automatic session timeout' },
    { id: 'backup-export', label: 'Backup/export functionality' },
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
          {activeSubTab === 'broker-api' && (
            <div className="space-y-6">
              <div className="pb-4 border-b border-[var(--border-subtle)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
                    <Cpu size={16} className="text-[var(--accent-indigo)]" />
                    Alice Blue ANT A3 Broker Integration
                  </h3>
                  <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
                    Configure App ID, API Secret, Static IPv4, and session tokens for live Indian market trading & feeds.
                  </p>
                </div>

                <Link
                  to="/broker"
                  className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] text-[var(--text-primary)] hover:border-[var(--accent-indigo)] w-fit"
                >
                  Open Full Broker Hub <ExternalLink size={12} />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--text-primary)]">Client Code / User ID</label>
                  <input
                    type="text"
                    value={brokerCreds.userId}
                    onChange={(e) => setBrokerCreds({ ...brokerCreds, userId: e.target.value.toUpperCase().trim() })}
                    placeholder="e.g. AB123456"
                    className="w-full px-3 py-2 rounded-md border text-xs font-mono outline-none bg-[var(--bg-tertiary)] border-[var(--border-subtle)] text-[var(--text-primary)] focus:border-[var(--accent-indigo)]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--text-primary)]">App ID (API Key)</label>
                  <input
                    type="text"
                    value={brokerCreds.appId}
                    onChange={(e) => setBrokerCreds({ ...brokerCreds, appId: e.target.value.trim() })}
                    placeholder="App ID from a3.aliceblueonline.com"
                    className="w-full px-3 py-2 rounded-md border text-xs font-mono outline-none bg-[var(--bg-tertiary)] border-[var(--border-subtle)] text-[var(--text-primary)] focus:border-[var(--accent-indigo)]"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-[var(--text-primary)]">API Secret</label>
                  <input
                    type="password"
                    value={brokerCreds.apiSecret}
                    onChange={(e) => setBrokerCreds({ ...brokerCreds, apiSecret: e.target.value.trim() })}
                    placeholder="Confidential API Secret Key"
                    className="w-full px-3 py-2 rounded-md border text-xs font-mono outline-none bg-[var(--bg-tertiary)] border-[var(--border-subtle)] text-[var(--text-primary)] focus:border-[var(--accent-indigo)]"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-[var(--text-primary)]">Registered IPv4 Address</label>
                    <button
                      type="button"
                      onClick={handleDetectIp}
                      disabled={detectingIp}
                      className="text-[10px] text-[var(--accent-indigo)] hover:underline flex items-center gap-1"
                    >
                      <RefreshCw size={10} className={detectingIp ? 'animate-spin' : ''} />
                      {detectingIp ? 'Detecting...' : 'Detect Public IP'}
                    </button>
                  </div>
                  <input
                    type="text"
                    value={brokerCreds.ipAddress}
                    onChange={(e) => setBrokerCreds({ ...brokerCreds, ipAddress: e.target.value.trim() })}
                    placeholder="e.g. 103.21.244.10"
                    className="w-full px-3 py-2 rounded-md border text-xs font-mono outline-none bg-[var(--bg-tertiary)] border-[var(--border-subtle)] text-[var(--text-primary)] focus:border-[var(--accent-indigo)]"
                  />
                  <p className="text-[10px] text-[var(--text-muted)]">
                    Alice Blue requires your ISP static IPv4 address. Orders will not execute unless the IP is approved in the A3 portal.
                  </p>
                </div>
              </div>

              {/* Active Session & Actions */}
              <div className="p-4 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <span className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1">
                    <Zap size={14} className="text-amber-400" />
                    Daily Session Token
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)] mt-0.5 block font-mono truncate max-w-sm">
                    {brokerCreds.sessionToken || 'No active session token'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleGenerateToken}
                    disabled={generatingToken}
                    className="px-3 py-1.5 rounded bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-xs font-semibold hover:border-[var(--accent-indigo)] text-[var(--text-primary)] transition-all"
                  >
                    {generatingToken ? 'Generating...' : 'Generate Today\'s Session'}
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveBrokerCreds}
                    className="px-4 py-1.5 rounded bg-[var(--accent-indigo)] text-white text-xs font-bold hover:brightness-110 transition-all"
                  >
                    Save Broker Keys
                  </button>
                </div>
              </div>
            </div>
          )}

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
