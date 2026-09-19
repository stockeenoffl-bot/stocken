import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Key,
  ShieldCheck,
  Globe,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Zap,
  Eye,
  EyeOff,
  Server,
  Activity,
  Layers,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  Clock,
  Send,
  HelpCircle,
} from 'lucide-react'
import {
  aliceBlueService,
  type AliceBlueCredentials,
  type ConnectionDiagnostic,
  type AliceBlueQuote,
} from '@/services/aliceBlueService'
import { toast } from 'sonner'

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
}

export default function Broker() {
  const [creds, setCreds] = useState<AliceBlueCredentials>({
    userId: '',
    appId: '',
    apiSecret: '',
    ipAddress: '',
    environment: 'live',
    dataFeedEnabled: true,
  })

  const [showSecret, setShowSecret] = useState(false)
  const [testing, setTesting] = useState(false)
  const [generatingSession, setGeneratingSession] = useState(false)
  const [detectingIp, setDetectingIp] = useState(false)
  const [diagnostics, setDiagnostics] = useState<ConnectionDiagnostic[]>([])
  const [quotes, setQuotes] = useState<AliceBlueQuote[]>([])
  const [activeTab, setActiveTab] = useState<'credentials' | 'diagnostics' | 'guide' | 'market-feed' | 'test-order'>('credentials')

  // Test Order State
  const [orderSymbol, setOrderSymbol] = useState('NIFTY 50')
  const [orderType, setOrderType] = useState<'BUY' | 'SELL'>('BUY')
  const [orderQty, setOrderQty] = useState(50)
  const [orderPlacing, setOrderPlacing] = useState(false)
  const [lastOrderResult, setLastOrderResult] = useState<any>(null)

  useEffect(() => {
    const loaded = aliceBlueService.loadCredentials()
    if (loaded) {
      setCreds(loaded)
    }

    // Initial quotes
    loadQuotes()
    const quoteInterval = setInterval(loadQuotes, 5000)

    return () => clearInterval(quoteInterval)
  }, [])

  const loadQuotes = async () => {
    try {
      const q = await aliceBlueService.getLiveIndexQuotes()
      setQuotes(q)
    } catch (e) {
      console.error(e)
    }
  }

  const handleSave = () => {
    aliceBlueService.saveCredentials(creds)
    toast.success('Alice Blue credentials saved securely')
  }

  const handleDetectIp = async () => {
    setDetectingIp(true)
    try {
      const detected = await aliceBlueService.detectPublicIp()
      if (detected) {
        setCreds((prev) => ({ ...prev, ipAddress: detected }))
        toast.success(`Detected Public IPv4: ${detected}`)
      } else {
        toast.error('Could not detect public IP. Please enter it manually.')
      }
    } finally {
      setDetectingIp(false)
    }
  }

  const handleTestConnection = async () => {
    setTesting(true)
    try {
      const res = await aliceBlueService.runDiagnostics(creds)
      setDiagnostics(res.diagnostics)
      if (res.success) {
        toast.success('Connection format & IP verification passed!')
      } else {
        toast.error('Some diagnostics failed. Please review the checklist.')
      }
      setActiveTab('diagnostics')
    } catch (err: any) {
      toast.error('Test failed: ' + err.message)
    } finally {
      setTesting(false)
    }
  }

  const handleGenerateSession = async () => {
    if (!creds.userId || !creds.appId || !creds.apiSecret) {
      toast.error('Please enter Client ID, App ID, and API Secret before generating a session.')
      return
    }
    setGeneratingSession(true)
    try {
      const res = await aliceBlueService.generateSession()
      if (res.success) {
        const updated = aliceBlueService.loadCredentials()
        if (updated) setCreds(updated)
        toast.success('Today’s Alice Blue Session Token generated successfully!')
      } else {
        toast.error(res.error || 'Failed to generate session')
      }
    } finally {
      setGeneratingSession(false)
    }
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    setOrderPlacing(true)
    try {
      const res = await aliceBlueService.placeTestOrder({
        symbol: orderSymbol,
        transactionType: orderType,
        quantity: orderQty,
        orderType: 'MARKET',
      })
      setLastOrderResult(res)
      if (res.success) {
        toast.success(res.message)
      } else {
        toast.error(res.message)
      }
    } finally {
      setOrderPlacing(false)
    }
  }

  const isConfigured = aliceBlueService.isConfigured()
  const isSessionActive = aliceBlueService.isSessionActive()

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
              <span>Alice Blue ANT A3 Integration</span>
              <span className="text-[10px] uppercase px-2 py-0.5 rounded font-mono font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                A3 Open API
              </span>
            </h1>
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Configure App ID, API Secret, Static IPv4, and manage live Indian market order routing & quotes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleTestConnection}
            disabled={testing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold bg-[var(--bg-secondary)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-white hover:border-[var(--accent-indigo)] transition-all"
          >
            <Activity size={14} className={testing ? 'animate-spin text-indigo-400' : ''} />
            {testing ? 'Testing...' : 'Test Diagnostics'}
          </button>
          <button
            onClick={handleGenerateSession}
            disabled={generatingSession}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition-all"
          >
            <Zap size={14} className={generatingSession ? 'animate-spin' : ''} />
            {generatingSession ? 'Generating...' : 'Generate Today\'s Session'}
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold bg-[var(--accent-indigo)] text-white hover:brightness-110 shadow-sm transition-all"
          >
            Save Credentials
          </button>
        </div>
      </div>

      {/* Real-time Status Card */}
      <motion.div
        variants={itemVariants}
        className="p-5 rounded-xl border bg-[var(--bg-secondary)] border-[var(--border-subtle)] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              isConfigured && isSessionActive
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : isConfigured
                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
            }`}
          >
            <Server size={20} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">Broker Status</span>
            <span className="text-xs font-bold flex items-center gap-1.5 text-[var(--text-primary)]">
              {isConfigured && isSessionActive ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Connected & Active
                </>
              ) : isConfigured ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  Session Token Needed
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-rose-400" />
                  Credentials Missing
                </>
              )}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] text-[var(--accent-indigo)]">
            <Globe size={20} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">Registered IPv4</span>
            <span className="text-xs font-mono font-semibold text-[var(--text-primary)]">
              {creds.ipAddress || 'Not registered'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] text-purple-400">
            <Clock size={20} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">Session Validity</span>
            <span className="text-xs font-semibold text-[var(--text-primary)]">
              {isSessionActive ? 'Valid for today (IST)' : 'Expired / None'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] text-blue-400">
            <Layers size={20} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">Trading Mode</span>
            <span className="text-xs font-bold text-[var(--text-primary)] capitalize">
              {creds.environment === 'live' ? 'Live Production' : 'Paper / Sandbox'}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] w-fit">
        {[
          { id: 'credentials', label: 'API Credentials & Keys', icon: Key },
          { id: 'diagnostics', label: 'Diagnostics & Health', icon: ShieldCheck },
          { id: 'guide', label: 'Setup Guide & A3 Portal', icon: HelpCircle },
          { id: 'market-feed', label: 'Live Quotes Feed', icon: Activity },
          { id: 'test-order', label: 'Order Execution Test', icon: Send },
        ].map((tab) => {
          const isActive = activeTab === tab.id
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200"
              style={{
                backgroundColor: isActive ? 'var(--accent-indigo)' : 'transparent',
                color: isActive ? '#fff' : 'var(--text-secondary)',
              }}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Tab Contents */}
      <AnimatePresence mode="wait">
        {/* TAB 1: CREDENTIALS */}
        {activeTab === 'credentials' && (
          <motion.div
            key="credentials"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            <div className="lg:col-span-2 p-6 rounded-xl border bg-[var(--bg-secondary)] border-[var(--border-subtle)] space-y-5">
              <div className="pb-3 border-b border-[var(--border-subtle)] flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">Alice Blue A3 API Credentials</h3>
                  <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                    Enter the App ID and Secret obtained from the Alice Blue Developer Portal.
                  </p>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
                  AES-Encrypted Storage
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* User ID */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--text-primary)] flex items-center gap-1">
                    Client Code / User ID <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={creds.userId}
                    onChange={(e) => setCreds({ ...creds, userId: e.target.value.toUpperCase().trim() })}
                    placeholder="e.g. AB123456"
                    className="w-full px-3 py-2 rounded-lg border text-xs font-mono outline-none bg-[var(--bg-tertiary)] border-[var(--border-subtle)] text-[var(--text-primary)] focus:border-[var(--accent-indigo)]"
                  />
                  <p className="text-[10px] text-[var(--text-muted)]">Your Alice Blue account login code.</p>
                </div>

                {/* App ID */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--text-primary)] flex items-center gap-1">
                    App ID (API Key) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={creds.appId}
                    onChange={(e) => setCreds({ ...creds, appId: e.target.value.trim() })}
                    placeholder="e.g. 7f9a2b4c-1d8e-4a3f"
                    className="w-full px-3 py-2 rounded-lg border text-xs font-mono outline-none bg-[var(--bg-tertiary)] border-[var(--border-subtle)] text-[var(--text-primary)] focus:border-[var(--accent-indigo)]"
                  />
                  <p className="text-[10px] text-[var(--text-muted)]">Generated via A3 portal under "My Apps".</p>
                </div>

                {/* API Secret */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-[var(--text-primary)] flex items-center gap-1">
                    API Secret <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showSecret ? 'text' : 'password'}
                      value={creds.apiSecret}
                      onChange={(e) => setCreds({ ...creds, apiSecret: e.target.value.trim() })}
                      placeholder="Enter your confidential API Secret"
                      className="w-full pr-10 px-3 py-2 rounded-lg border text-xs font-mono outline-none bg-[var(--bg-tertiary)] border-[var(--border-subtle)] text-[var(--text-primary)] focus:border-[var(--accent-indigo)]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSecret(!showSecret)}
                      className="absolute right-3 top-2.5 text-[var(--text-muted)] hover:text-white"
                    >
                      {showSecret ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <p className="text-[10px] text-[var(--text-muted)]">Keep confidential; used for SHA256 session generation.</p>
                </div>

                {/* Registered IPv4 */}
                <div className="space-y-1.5 sm:col-span-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-[var(--text-primary)] flex items-center gap-1">
                      Registered Static IPv4 Address <span className="text-rose-400">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleDetectIp}
                      disabled={detectingIp}
                      className="text-[10px] text-[var(--accent-indigo)] hover:underline flex items-center gap-1"
                    >
                      <RefreshCw size={10} className={detectingIp ? 'animate-spin' : ''} />
                      {detectingIp ? 'Detecting...' : 'Detect My Public IP'}
                    </button>
                  </div>
                  <input
                    type="text"
                    value={creds.ipAddress}
                    onChange={(e) => setCreds({ ...creds, ipAddress: e.target.value.trim() })}
                    placeholder="e.g. 103.21.244.10"
                    className="w-full px-3 py-2 rounded-lg border text-xs font-mono outline-none bg-[var(--bg-tertiary)] border-[var(--border-subtle)] text-[var(--text-primary)] focus:border-[var(--accent-indigo)]"
                  />
                  <p className="text-[10px] text-amber-400/90 flex items-center gap-1">
                    <AlertCircle size={12} />
                    Note: Alice Blue requires this exact IP to be registered and approved in the A3 portal.
                  </p>
                </div>

                {/* Environment Mode */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--text-primary)]">Execution Environment</label>
                  <select
                    value={creds.environment}
                    onChange={(e) => setCreds({ ...creds, environment: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg border text-xs outline-none bg-[var(--bg-tertiary)] border-[var(--border-subtle)] text-[var(--text-primary)] focus:border-[var(--accent-indigo)]"
                  >
                    <option value="live">Live Production (Real Trading)</option>
                    <option value="paper">Paper Trading / Sandbox Simulation</option>
                  </select>
                </div>

                {/* Primary Data Feed */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--text-primary)]">Market Data Feed</label>
                  <select
                    value={creds.dataFeedEnabled ? 'enabled' : 'disabled'}
                    onChange={(e) => setCreds({ ...creds, dataFeedEnabled: e.target.value === 'enabled' })}
                    className="w-full px-3 py-2 rounded-lg border text-xs outline-none bg-[var(--bg-tertiary)] border-[var(--border-subtle)] text-[var(--text-primary)] focus:border-[var(--accent-indigo)]"
                  >
                    <option value="enabled">Active (Stream Quotes via Alice Blue)</option>
                    <option value="disabled">Fallback Only (Twelve Data / Yahoo)</option>
                  </select>
                </div>
              </div>

              {/* Active Session Display */}
              <div className="p-4 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                    <Zap size={14} className="text-amber-400" /> Active Session Token
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)]">
                    {creds.sessionCreatedAt ? `Created: ${new Date(creds.sessionCreatedAt).toLocaleTimeString()}` : 'No active session'}
                  </span>
                </div>
                <p className="text-xs font-mono break-all text-[var(--text-secondary)] bg-[var(--bg-secondary)] p-2 rounded border border-[var(--border-subtle)]">
                  {creds.sessionToken || 'No session token generated. Click "Generate Today\'s Session" to initiate.'}
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-5 py-2 rounded-lg text-xs font-bold bg-[var(--accent-indigo)] text-white hover:brightness-110 transition-all"
                >
                  Save & Apply Settings
                </button>
              </div>
            </div>

            {/* Side Card: Direct Portal Links */}
            <div className="space-y-4">
              <div className="p-5 rounded-xl border bg-[var(--bg-secondary)] border-[var(--border-subtle)] space-y-4">
                <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                  <ExternalLink size={16} className="text-indigo-400" />
                  Alice Blue Portals
                </h3>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  Fast direct links to generate keys, register your Static IPv4, and read the official tradehub documentation.
                </p>

                <div className="space-y-2 pt-1">
                  <a
                    href="https://a3.aliceblueonline.com"
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-tertiary)] flex items-center justify-between hover:border-[var(--accent-indigo)] transition-all group"
                  >
                    <div>
                      <div className="text-xs font-bold text-[var(--text-primary)] group-hover:text-indigo-400 flex items-center gap-1">
                        A3 Developer Portal <ArrowUpRight size={12} />
                      </div>
                      <div className="text-[10px] text-[var(--text-muted)]">Create App & Add IPv4 address</div>
                    </div>
                  </a>

                  <a
                    href="https://ant.aliceblueonline.com/productdocumentation/"
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-tertiary)] flex items-center justify-between hover:border-[var(--accent-indigo)] transition-all group"
                  >
                    <div>
                      <div className="text-xs font-bold text-[var(--text-primary)] group-hover:text-indigo-400 flex items-center gap-1">
                        ANT API Documentation <ArrowUpRight size={12} />
                      </div>
                      <div className="text-[10px] text-[var(--text-muted)]">End points, WebSockets & Specs</div>
                    </div>
                  </a>

                  <a
                    href="https://pypi.org/project/Ant-A3-tradehub-sdk-production/"
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-tertiary)] flex items-center justify-between hover:border-[var(--accent-indigo)] transition-all group"
                  >
                    <div>
                      <div className="text-xs font-bold text-[var(--text-primary)] group-hover:text-indigo-400 flex items-center gap-1">
                        Python Tradehub SDK <ArrowUpRight size={12} />
                      </div>
                      <div className="text-[10px] text-[var(--text-muted)]">Official production SDK</div>
                    </div>
                  </a>

                  <a
                    href="https://youtu.be/SMFO4zmK2e8"
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-tertiary)] flex items-center justify-between hover:border-[var(--accent-indigo)] transition-all group"
                  >
                    <div>
                      <div className="text-xs font-bold text-[var(--text-primary)] group-hover:text-indigo-400 flex items-center gap-1">
                        Video Walkthrough <ArrowUpRight size={12} />
                      </div>
                      <div className="text-[10px] text-[var(--text-muted)]">Official Alice Blue video setup</div>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 2: DIAGNOSTICS */}
        {activeTab === 'diagnostics' && (
          <motion.div
            key="diagnostics"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="p-6 rounded-xl border bg-[var(--bg-secondary)] border-[var(--border-subtle)] space-y-5"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
              <div>
                <h3 className="text-sm font-bold text-[var(--text-primary)]">System Diagnostics Checklist</h3>
                <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                  Validates credentials format, static IP structure, and token state.
                </p>
              </div>
              <button
                onClick={handleTestConnection}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] text-[var(--text-primary)] hover:border-[var(--accent-indigo)]"
              >
                Re-run Diagnostics
              </button>
            </div>

            <div className="space-y-3">
              {diagnostics.length === 0 ? (
                <div className="p-8 text-center text-xs text-[var(--text-muted)]">
                  Click "Test Diagnostics" above to evaluate your Alice Blue settings.
                </div>
              ) : (
                diagnostics.map((d, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-lg border bg-[var(--bg-tertiary)] border-[var(--border-subtle)] flex items-start gap-3"
                  >
                    <div className="mt-0.5">
                      {d.status === 'success' && <CheckCircle2 size={16} className="text-emerald-400" />}
                      {d.status === 'warning' && <AlertCircle size={16} className="text-amber-400" />}
                      {d.status === 'error' && <AlertCircle size={16} className="text-rose-400" />}
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-bold text-[var(--text-primary)] flex items-center justify-between">
                        <span>{d.step}</span>
                        <span
                          className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded ${
                            d.status === 'success'
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : d.status === 'warning'
                              ? 'bg-amber-500/10 text-amber-400'
                              : 'bg-rose-500/10 text-rose-400'
                          }`}
                        >
                          {d.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-[var(--text-secondary)] mt-1">{d.message}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}

        {/* TAB 3: GUIDE */}
        {activeTab === 'guide' && (
          <motion.div
            key="guide"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="p-6 rounded-xl border bg-[var(--bg-secondary)] border-[var(--border-subtle)] space-y-6"
          >
            <div>
              <h3 className="text-sm font-bold text-[var(--text-primary)]">Alice Blue A3 Integration Guide</h3>
              <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                Official steps communicated for app setup and IP whitelist authorization.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {[
                { step: '01', title: 'Developer Portal', desc: 'Visit https://a3.aliceblueonline.com and log in as Individual Trader or Vendor.' },
                { step: '02', title: 'Create App', desc: 'Go to My Apps → Create App and enter your application title and redirect URL.' },
                { step: '03', title: 'Register Static IPv4', desc: 'Provide your ISP static IPv4 address. Note: Orders will NOT execute unless approved.' },
                { step: '04', title: 'Approval & Keys', desc: 'Once approved, copy your App ID and API Secret into this Admin portal.' },
                { step: '05', title: 'Generate Token', desc: 'Click "Generate Today\'s Session" every morning to start real-time data streaming.' },
              ].map((s, i) => (
                <div key={i} className="p-4 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] space-y-2">
                  <span className="text-lg font-mono font-black text-indigo-400">{s.step}</span>
                  <h4 className="text-xs font-bold text-[var(--text-primary)]">{s.title}</h4>
                  <p className="text-[10px] text-[var(--text-muted)] leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* TAB 4: LIVE MARKET FEED */}
        {activeTab === 'market-feed' && (
          <motion.div
            key="market-feed"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {quotes.map((q) => {
                const isPositive = q.change >= 0
                return (
                  <div
                    key={q.symbol}
                    className="p-4 rounded-xl border bg-[var(--bg-secondary)] border-[var(--border-subtle)] space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[var(--text-primary)]">{q.symbol}</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[var(--bg-tertiary)] text-[var(--text-muted)] border border-[var(--border-subtle)]">
                        {q.exchange}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-2xl font-mono font-bold text-[var(--text-primary)]">
                        {q.ltp.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </h4>
                      <div className={`flex items-center gap-1 text-xs font-semibold mt-1 ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        <span>{isPositive ? '+' : ''}{q.change.toFixed(2)} ({isPositive ? '+' : ''}{q.changePercent}%)</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[var(--border-subtle)] grid grid-cols-2 text-[10px] text-[var(--text-muted)]">
                      <div>O: <span className="font-mono text-[var(--text-secondary)]">{q.open}</span></div>
                      <div>H: <span className="font-mono text-[var(--text-secondary)]">{q.high}</span></div>
                      <div>L: <span className="font-mono text-[var(--text-secondary)]">{q.low}</span></div>
                      <div>Time: <span className="font-mono text-[var(--text-secondary)]">{q.timestamp}</span></div>
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* TAB 5: TEST ORDER */}
        {activeTab === 'test-order' && (
          <motion.div
            key="test-order"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="p-6 rounded-xl border bg-[var(--bg-secondary)] border-[var(--border-subtle)] max-w-xl mx-auto space-y-5"
          >
            <div>
              <h3 className="text-sm font-bold text-[var(--text-primary)]">Order Routing Sandbox</h3>
              <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                Verify order placement endpoint and latency without real market exposure.
              </p>
            </div>

            <form onSubmit={handlePlaceOrder} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[var(--text-primary)]">Instrument</label>
                  <select
                    value={orderSymbol}
                    onChange={(e) => setOrderSymbol(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border text-xs bg-[var(--bg-tertiary)] border-[var(--border-subtle)] text-[var(--text-primary)]"
                  >
                    <option value="NIFTY 50">NIFTY 50 Index</option>
                    <option value="SENSEX">SENSEX Index</option>
                    <option value="BANKNIFTY">BANKNIFTY Index</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[var(--text-primary)]">Transaction</label>
                  <div className="grid grid-cols-2 gap-1 p-1 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)]">
                    <button
                      type="button"
                      onClick={() => setOrderType('BUY')}
                      className={`py-1 text-xs font-bold rounded ${orderType === 'BUY' ? 'bg-emerald-500 text-white' : 'text-[var(--text-muted)]'}`}
                    >
                      BUY
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrderType('SELL')}
                      className={`py-1 text-xs font-bold rounded ${orderType === 'SELL' ? 'bg-rose-500 text-white' : 'text-[var(--text-muted)]'}`}
                    >
                      SELL
                    </button>
                  </div>
                </div>

                <div className="space-y-1 col-span-2">
                  <label className="text-xs font-semibold text-[var(--text-primary)]">Quantity / Lots</label>
                  <input
                    type="number"
                    value={orderQty}
                    onChange={(e) => setOrderQty(Number(e.target.value))}
                    min={1}
                    className="w-full px-3 py-2 rounded-lg border text-xs bg-[var(--bg-tertiary)] border-[var(--border-subtle)] text-[var(--text-primary)]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={orderPlacing}
                className="w-full py-2.5 rounded-lg text-xs font-bold bg-[var(--accent-indigo)] text-white hover:brightness-110 shadow-sm transition-all"
              >
                {orderPlacing ? 'Routing Order...' : `Simulate ${orderType} Order via Alice Blue A3`}
              </button>

              {lastOrderResult && (
                <div
                  className={`p-3 rounded-lg border text-xs ${
                    lastOrderResult.success
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                  }`}
                >
                  {lastOrderResult.message}
                </div>
              )}
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
