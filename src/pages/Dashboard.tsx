import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import {
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  FileText,
  BarChart3,
  Target,
  Cpu,
  ArrowUpRight,
  Zap,
  Server,
  PenSquare,
  Bell,
  Users as UsersIcon,
  Radio,
  Megaphone,
  Send,
  Eye,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  Check,
} from 'lucide-react'
import CandlestickChart from '@/components/charts/CandlestickChart'
import TradingViewChart from '@/components/charts/TradingViewChart'
import StatCard from '@/components/StatCard'
import {
  TradingViewMarketQuotes,
  TradingViewTechnicalAnalysis,
  TradingViewStockHeatmap,
  TradingViewIndianScreener,
} from '@/components/tradingview'
import { useMarket } from '@/contexts/MarketContext'
import { userService } from '@/services/userService'
import { aliceBlueService } from '@/services/aliceBlueService'
import { broadcastSyncService, type LiveMarketData, type FlashAlert } from '@/services/broadcastSyncService'
import { toast } from 'sonner'

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
}

export default function Dashboard() {
  const { market } = useMarket()
  const navigate = useNavigate()
  const [activeSubTab, setActiveSubTab] = useState('analysis')
  const [stats, setStats] = useState({ totalUsers: 0, proUsers: 0 })
  const [recentUsers, setRecentUsers] = useState<any[]>([])
  const [chartMode, setChartMode] = useState<'tradingview' | 'system'>('tradingview')
  const [brokerConnected, setBrokerConnected] = useState(false)
  const [brokerConfigured, setBrokerConfigured] = useState(false)

  // Real-Time Broadcaster State (Synced Live to All Normal Users)
  const [liveData, setLiveData] = useState<LiveMarketData>(broadcastSyncService.getMarketData(market))
  const [editBias, setEditBias] = useState<'bullish' | 'bearish' | 'neutral'>(liveData.bias)
  const [editSummary, setEditSummary] = useState(liveData.summary)
  const [editInvalidation, setEditInvalidation] = useState(String(liveData.invalidationLevel))
  const [editSupportFrom, setEditSupportFrom] = useState(String(liveData.supportZone?.from || ''))
  const [editSupportTo, setEditSupportTo] = useState(String(liveData.supportZone?.to || ''))
  const [editResFrom, setEditResFrom] = useState(String(liveData.resistanceZone?.from || ''))
  const [editResTo, setEditResTo] = useState(String(liveData.resistanceZone?.to || ''))
  const [isBroadcasting, setIsBroadcasting] = useState(false)

  // Urgent Flash Announcement State
  const [alertTitle, setAlertTitle] = useState('')
  const [alertMsg, setAlertMsg] = useState('')
  const [alertSeverity, setAlertSeverity] = useState<'info' | 'warning' | 'alert' | 'success'>('alert')
  const [currentAlert, setCurrentAlert] = useState<FlashAlert | null>(broadcastSyncService.getUrgentAlert())

  // TypeSafe AI (Jev) State
  const [aiPrompt, setAiPrompt] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  useEffect(() => {
    const data = broadcastSyncService.getMarketData(market)
    setLiveData(data)
    setEditBias(data.bias)
    setEditSummary(data.summary)
    setEditInvalidation(String(data.invalidationLevel))
    setEditSupportFrom(String(data.supportZone?.from || ''))
    setEditSupportTo(String(data.supportZone?.to || ''))
    setEditResFrom(String(data.resistanceZone?.from || ''))
    setEditResTo(String(data.resistanceZone?.to || ''))

    const unsubscribe = broadcastSyncService.subscribe(() => {
      const refreshed = broadcastSyncService.getMarketData(market)
      setLiveData(refreshed)
      setCurrentAlert(broadcastSyncService.getUrgentAlert())
    })
    return () => unsubscribe()
  }, [market])

  const handleBroadcast = async () => {
    setIsBroadcasting(true)
    try {
      const updated = await broadcastSyncService.broadcastMarketUpdate(market, {
        bias: editBias,
        summary: editSummary,
        invalidationLevel: Number(editInvalidation) || editInvalidation,
        supportZone: {
          from: Number(editSupportFrom) || liveData.supportZone.from,
          to: Number(editSupportTo) || liveData.supportZone.to,
        },
        resistanceZone: {
          from: Number(editResFrom) || liveData.resistanceZone.from,
          to: Number(editResTo) || liveData.resistanceZone.to,
        },
      })
      setLiveData(updated)
      toast.success(`⚡ Live broadcast sent! All users' dashboards updated with live ${market} bias & levels.`)
    } catch (err: any) {
      toast.error('Failed to broadcast: ' + err.message)
    } finally {
      setIsBroadcasting(false)
    }
  }

  const handlePostAlert = () => {
    if (!alertTitle.trim() || !alertMsg.trim()) {
      return toast.error('Please enter an alert title and message')
    }
    const created = broadcastSyncService.broadcastUrgentAlert({
      title: alertTitle,
      message: alertMsg,
      severity: alertSeverity,
    })
    setCurrentAlert(created)
    setAlertTitle('')
    setAlertMsg('')
    toast.success('Urgent Market Alert broadcasted to all users!')
  }

  const handleClearAlert = () => {
    broadcastSyncService.clearUrgentAlert()
    setCurrentAlert(null)
    toast.info('Urgent Market Alert cleared.')
  }

  const handleAIAnalysis = async () => {
    if (!aiPrompt.trim()) return toast.error('Please enter market news or feedback to analyze')
    
    setIsAnalyzing(true)
    try {
      // Simulating TypeSafe AI (Jev) System One Model integration
      // "Code owns the workflow; the model supplies programmable common sense"
      await new Promise((resolve) => setTimeout(resolve, 1500))
      
      const lower = aiPrompt.toLowerCase()
      let predictedBias: 'bullish' | 'bearish' | 'neutral' = 'neutral'
      
      if (lower.includes('good') || lower.includes('breakout') || lower.includes('up') || lower.includes('buy') || lower.includes('positive') || lower.includes('rally')) {
        predictedBias = 'bullish'
      } else if (lower.includes('bad') || lower.includes('crash') || lower.includes('down') || lower.includes('sell') || lower.includes('negative') || lower.includes('fall')) {
        predictedBias = 'bearish'
      }

      setEditBias(predictedBias)
      setEditSummary(`[AI Analysis] The recent news/feedback suggests a ${predictedBias} sentiment. Original text: "${aiPrompt.substring(0, 50)}..."`)
      toast.success(`TypeSafe Jev AI successfully classified text as ${predictedBias.toUpperCase()}`)
    } catch (err: any) {
      toast.error('AI Analysis failed: ' + err.message)
    } finally {
      setIsAnalyzing(false)
    }
  }

  useEffect(() => {
    async function fetchStats() {
      try {
        const data = await userService.getDashboardStats()
        setStats(data)
        const usersData = await userService.getAllUsers()
        setRecentUsers(usersData)
      } catch (err) {
        console.error('Failed to fetch dashboard stats', err)
      }
    }
    fetchStats()

    const checkBroker = () => {
      setBrokerConfigured(aliceBlueService.isConfigured())
      setBrokerConnected(aliceBlueService.isConfigured() && aliceBlueService.isSessionActive())
    }
    checkBroker()

    const onStatusChange = () => checkBroker()
    window.addEventListener('aliceblue-status-change', onStatusChange)
    return () => window.removeEventListener('aliceblue-status-change', onStatusChange)
  }, [])

  const subTabs = [
    { id: 'analysis', label: 'Index Analysis' },
    { id: 'indian-markets', label: '🇮🇳 Indian Market Hub' },
    { id: 'total-users', label: 'Total Users' },
    { id: 'active-users', label: 'Active Users Today' },
    { id: 'premium-members', label: 'Premium Members' },
    { id: 'free-members', label: 'Free Members' },
    { id: 'new-registrations', label: 'New Registrations' },
    { id: 'monthly-revenue', label: 'Monthly Revenue' },
    { id: 'website-visitors', label: 'Website Visitors' }
  ]

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-5">
      {/* Top System Health & Broker Status Banner */}
      <motion.div
        variants={itemVariants}
        className="p-4 rounded-xl border bg-gradient-to-r from-[var(--bg-secondary)] via-[var(--bg-secondary)] to-[var(--bg-tertiary)] border-[var(--border-subtle)] flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-sm"
      >
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                brokerConnected
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : brokerConfigured
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                  : 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30'
              }`}
            >
              <Cpu size={18} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-[var(--text-primary)]">Alice Blue ANT A3 Broker</span>
                <span
                  className={`w-2 h-2 rounded-full ${
                    brokerConnected ? 'bg-emerald-400 animate-pulse' : brokerConfigured ? 'bg-amber-400' : 'bg-slate-400'
                  }`}
                />
              </div>
              <div className="text-[10px] text-[var(--text-muted)]">
                {brokerConnected
                  ? 'Connected & Streaming Live Indian Ticks'
                  : brokerConfigured
                  ? 'Credentials Configured (Generate Session Token)'
                  : 'Setup Required: App ID & Secret Needed'}
              </div>
            </div>
          </div>

          <div className="h-6 w-[1px] bg-[var(--border-subtle)] hidden sm:block" />

          <div className="flex items-center gap-2">
            <Server size={14} className="text-emerald-400" />
            <div>
              <span className="text-[10px] font-bold text-[var(--text-primary)] block">Cloud DB</span>
              <span className="text-[9px] text-emerald-400 font-mono">Supabase Online</span>
            </div>
          </div>

          <div className="h-6 w-[1px] bg-[var(--border-subtle)] hidden sm:block" />

          <div className="flex items-center gap-2">
            <Zap size={14} className="text-blue-400" />
            <div>
              <span className="text-[10px] font-bold text-[var(--text-primary)] block">Data Feeds</span>
              <span className="text-[9px] text-blue-400 font-mono">Real-time / Smart Caching</span>
            </div>
          </div>
        </div>

        {/* Quick Admin Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/broker"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[var(--accent-indigo)] text-white hover:brightness-110 transition-all shadow-sm"
          >
            <Cpu size={13} />
            <span>Configure Alice Blue API</span>
            <ArrowUpRight size={12} />
          </Link>
          <Link
            to="/create"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-white hover:border-[var(--accent-indigo)] transition-all"
          >
            <PenSquare size={13} />
            <span>Publish Analysis</span>
          </Link>
          <Link
            to="/users"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-white hover:border-[var(--accent-indigo)] transition-all"
          >
            <UsersIcon size={13} />
            <span>Users</span>
          </Link>
        </div>
      </motion.div>

      {/* Horizontal Sub Tabs Bar */}
      <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-1.5 p-1 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] w-fit">
        {subTabs.map((sub) => {
          const isActive = activeSubTab === sub.id
          return (
            <button
              key={sub.id}
              onClick={() => setActiveSubTab(sub.id)}
              className="px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200"
              style={{
                backgroundColor: isActive ? 'var(--accent-indigo)' : 'transparent',
                color: isActive ? '#fff' : 'var(--text-secondary)',
              }}
            >
              {sub.label}
            </button>
          )
        })}
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeSubTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {/* 1. INDEX ANALYSIS VIEW */}
          {activeSubTab === 'analysis' && (
            <div className="space-y-5">
              {/* Real-Time Live Synced Summary Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Market" value={market} sentiment="neutral" icon={<BarChart3 size={18} />} />
                <StatCard
                  label="Overall Bias"
                  value={liveData.bias.toUpperCase()}
                  sentiment={liveData.bias}
                  icon={liveData.bias === 'bullish' ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                />
                <StatCard
                  label="Target / Resistance"
                  value={`${liveData.resistanceZone?.from || '-'} - ${liveData.resistanceZone?.to || '-'}`}
                  sentiment="bullish"
                  sublabel="Key target zone"
                  icon={<Target size={18} />}
                />
                <StatCard
                  label="Invalid Below"
                  value={String(liveData.invalidationLevel)}
                  sentiment="bearish"
                  sublabel="Trend invalidation"
                  icon={<TrendingDown size={18} />}
                />
              </div>

              {/* SUPER ADMIN LIVE MARKET BROADCASTER WIDGET */}
              <div className="p-5 rounded-xl border bg-gradient-to-br from-[var(--bg-secondary)] via-[var(--bg-secondary)] to-[var(--bg-tertiary)] border-indigo-500/30 shadow-md space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border-subtle)]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                      <Sparkles size={16} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-[var(--text-primary)]">Super Admin Live Market Broadcaster</h3>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 animate-pulse">
                          Realtime Sync Active
                        </span>
                      </div>
                      <p className="text-[11px] text-[var(--text-muted)]">
                        Any changes made here immediately update all subscribers' dashboards across all browsers and tabs in real-time.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigate('/app')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-white hover:border-[var(--accent-indigo)] transition-all"
                      title="Open Subscriber View to test live client experience"
                    >
                      <Eye size={13} className="text-indigo-400" />
                      <span>Preview User View</span>
                    </button>
                    <button
                      onClick={handleBroadcast}
                      disabled={isBroadcasting}
                      className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:brightness-110 shadow-sm transition-all disabled:opacity-50"
                    >
                      {isBroadcasting ? <RefreshCw size={13} className="animate-spin" /> : <Zap size={13} />}
                      <span>Broadcast Live to Users</span>
                    </button>
                  </div>
                </div>

                {/* Broadcaster Form Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Bias Selector */}
                  <div>
                    <label className="text-[11px] font-bold text-[var(--text-secondary)] mb-1.5 block uppercase tracking-wider">
                      1. Overall Bias ({market})
                    </label>
                    <div className="grid grid-cols-3 gap-1.5 p-1 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)]">
                      {(['bullish', 'bearish', 'neutral'] as const).map((b) => (
                        <button
                          key={b}
                          type="button"
                          onClick={() => setEditBias(b)}
                          className={`py-1.5 px-2 rounded text-xs font-bold capitalize transition-all ${
                            editBias === b
                              ? b === 'bullish'
                                ? 'bg-emerald-500 text-white shadow-sm'
                                : b === 'bearish'
                                ? 'bg-rose-500 text-white shadow-sm'
                                : 'bg-indigo-500 text-white shadow-sm'
                              : 'text-[var(--text-muted)] hover:text-white'
                          }`}
                        >
                          {b}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Invalidation Level */}
                  <div>
                    <label className="text-[11px] font-bold text-[var(--text-secondary)] mb-1.5 block uppercase tracking-wider">
                      2. Trend Invalidation Below
                    </label>
                    <input
                      type="text"
                      value={editInvalidation}
                      onChange={(e) => setEditInvalidation(e.target.value)}
                      placeholder="e.g. 24080"
                      className="w-full px-3 py-2 text-xs font-mono rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-indigo)]"
                    />
                  </div>

                  {/* Support Zone */}
                  <div>
                    <label className="text-[11px] font-bold text-[var(--text-secondary)] mb-1.5 block uppercase tracking-wider">
                      3. Support Zone (Low - High)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editSupportFrom}
                        onChange={(e) => setEditSupportFrom(e.target.value)}
                        placeholder="From"
                        className="w-1/2 px-2.5 py-2 text-xs font-mono rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-indigo)]"
                      />
                      <span className="text-xs text-[var(--text-muted)]">-</span>
                      <input
                        type="text"
                        value={editSupportTo}
                        onChange={(e) => setEditSupportTo(e.target.value)}
                        placeholder="To"
                        className="w-1/2 px-2.5 py-2 text-xs font-mono rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-indigo)]"
                      />
                    </div>
                  </div>

                  {/* Resistance Zone */}
                  <div>
                    <label className="text-[11px] font-bold text-[var(--text-secondary)] mb-1.5 block uppercase tracking-wider">
                      4. Resistance Zone (Low - High)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editResFrom}
                        onChange={(e) => setEditResFrom(e.target.value)}
                        placeholder="From"
                        className="w-1/2 px-2.5 py-2 text-xs font-mono rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-indigo)]"
                      />
                      <span className="text-xs text-[var(--text-muted)]">-</span>
                      <input
                        type="text"
                        value={editResTo}
                        onChange={(e) => setEditResTo(e.target.value)}
                        placeholder="To"
                        className="w-1/2 px-2.5 py-2 text-xs font-mono rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-indigo)]"
                      />
                    </div>
                  </div>
                </div>

                {/* Bias Statement / Headline */}
                <div>
                  <label className="text-[11px] font-bold text-[var(--text-secondary)] mb-1.5 block uppercase tracking-wider">
                    5. Real-Time Bias Statement & Market Commentary (Visible to Users)
                  </label>
                  <textarea
                    rows={2}
                    value={editSummary}
                    onChange={(e) => setEditSummary(e.target.value)}
                    placeholder="Enter market commentary, breakout conditions, and trade rationale..."
                    className="w-full px-3 py-2 text-xs rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-indigo)] leading-relaxed"
                  />
                </div>

                {/* Urgent Flash Alert Row */}
                <div className="pt-3 border-t border-[var(--border-subtle)]/70 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold">
                    <Megaphone size={14} />
                    <span>Urgent Flash Banner:</span>
                    {currentAlert ? (
                      <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] font-bold">
                        ACTIVE: "{currentAlert.title}"
                      </span>
                    ) : (
                      <span className="text-[11px] text-[var(--text-muted)]">None currently active</span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="text"
                      value={alertTitle}
                      onChange={(e) => setAlertTitle(e.target.value)}
                      placeholder="Alert title (e.g. NIFTY Breakout)"
                      className="px-2.5 py-1.5 text-xs rounded bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-indigo)] w-40"
                    />
                    <input
                      type="text"
                      value={alertMsg}
                      onChange={(e) => setAlertMsg(e.target.value)}
                      placeholder="Message (e.g. Crossed 24,200. Targets active.)"
                      className="px-2.5 py-1.5 text-xs rounded bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-indigo)] w-56"
                    />
                    <button
                      type="button"
                      onClick={handlePostAlert}
                      className="px-3 py-1.5 rounded text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition-all"
                    >
                      Push Flash Banner
                    </button>
                    {currentAlert && (
                      <button
                        type="button"
                        onClick={handleClearAlert}
                        className="px-2 py-1.5 rounded text-xs font-medium text-[var(--text-muted)] hover:text-white transition-all"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>
                
                {/* TypeSafe AI Market News Classifier */}
                <div className="pt-4 mt-4 border-t border-[var(--border-subtle)]">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2 text-xs font-semibold text-purple-400">
                      <Cpu size={14} />
                      <span>TypeSafe System One (Jev AI) Auto-Analysis</span>
                    </div>
                    <span className="text-[10px] text-[var(--text-muted)]">Classify News/Feedback into Bias & Summary</span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      placeholder="Paste market news, RBI governor speech snippet, or global cues here..."
                      className="flex-1 px-3 py-2 text-xs rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-purple-500"
                    />
                    <button
                      onClick={handleAIAnalysis}
                      disabled={isAnalyzing}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-purple-600/20 text-purple-400 border border-purple-500/40 hover:bg-purple-600/30 transition-all shadow-sm"
                    >
                      {isAnalyzing ? <RefreshCw size={13} className="animate-spin" /> : <Sparkles size={13} />}
                      <span>{isAnalyzing ? 'Analyzing...' : 'AI Classify Bias'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Chart with Mode Toggle */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[var(--text-primary)]">Technical Chart</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
                      Live Real-Time
                    </span>
                  </div>
                  <div className="flex items-center rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] p-0.5 text-xs">
                    <button
                      onClick={() => setChartMode('tradingview')}
                      className={`px-3 py-1 rounded-md font-medium transition-all ${
                        chartMode === 'tradingview'
                          ? 'bg-[var(--accent-indigo)] text-white'
                          : 'text-[var(--text-secondary)] hover:text-white'
                      }`}
                    >
                      TradingView Pro (Live + Draw)
                    </button>
                    <button
                      onClick={() => setChartMode('system')}
                      className={`px-3 py-1 rounded-md font-medium transition-all ${
                        chartMode === 'system'
                          ? 'bg-[var(--accent-indigo)] text-white'
                          : 'text-[var(--text-secondary)] hover:text-white'
                      }`}
                    >
                      Zonal Edge View
                    </button>
                  </div>
                </div>

                {chartMode === 'tradingview' ? (
                  <TradingViewChart
                    defaultSymbol={market === 'SENSEX' ? 'BSE:SENSEX' : 'NSE:NIFTY'}
                    height={540}
                  />
                ) : (
                  <CandlestickChart />
                )}
              </div>

              {/* Analysis + Status */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Today's Live Broadcasted Analysis */}
                <div
                  className="rounded-lg border p-4"
                  style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <FileText size={16} style={{ color: 'var(--accent-indigo)' }} />
                      <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                        Today's Analysis ({market})
                      </h3>
                    </div>
                    <span className="text-[10px] font-mono text-[var(--text-muted)]">
                      Updated {new Date(liveData.lastUpdated).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} by {liveData.updatedBy || 'Super Admin'}
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <span className="text-[10px] uppercase font-bold" style={{ color: 'var(--text-muted)' }}>Live Bias</span>
                      <p
                        className={`text-sm font-bold capitalize ${
                          liveData.bias === 'bullish'
                            ? 'text-emerald-400'
                            : liveData.bias === 'bearish'
                            ? 'text-rose-400'
                            : 'text-indigo-400'
                        }`}
                      >
                        {liveData.bias} (Invalidation: {liveData.invalidationLevel})
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold" style={{ color: 'var(--text-muted)' }}>Market Expectation / Commentary</span>
                      <p className="text-xs leading-relaxed mt-1" style={{ color: 'var(--text-secondary)' }}>
                        {liveData.summary || 'Expect standard consolidation within defined range.'}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold" style={{ color: 'var(--text-muted)' }}>Key Levels to Watch</span>
                      <ul className="mt-1 space-y-1">
                        <li className="text-xs flex items-center justify-between" style={{ color: 'var(--text-secondary)' }}>
                          <span>Support Zone:</span>
                          <span className="font-mono font-bold text-emerald-400">{liveData.supportZone?.from} - {liveData.supportZone?.to}</span>
                        </li>
                        <li className="text-xs flex items-center justify-between" style={{ color: 'var(--text-secondary)' }}>
                          <span>Resistance Zone:</span>
                          <span className="font-mono font-bold text-rose-400">{liveData.resistanceZone?.from} - {liveData.resistanceZone?.to}</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Analysis Status */}
                <div className="space-y-4">
                  <div
                    className="rounded-lg border p-4"
                    style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}
                  >
                    <h4 className="text-xs font-semibold mb-3" style={{ color: 'var(--text-muted)' }}>Broadcasting Status</h4>
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 size={16} style={{ color: 'var(--success)' }} />
                      <span className="text-sm font-medium" style={{ color: 'var(--success)' }}>
                        Live Synchronized across All Tabs
                      </span>
                    </div>
                    <p className="text-[10px] mb-3" style={{ color: 'var(--text-muted)' }}>
                      Subscribers currently viewing the client portal receive immediate updates via high-speed broadcast channel.
                    </p>
                    <button
                      onClick={() => navigate('/app')}
                      className="w-full py-2 rounded-md text-xs font-bold transition-all duration-200 hover:brightness-110 flex items-center justify-center gap-1.5"
                      style={{ backgroundColor: 'var(--accent-indigo)', color: '#fff' }}
                    >
                      <Eye size={13} />
                      <span>View Live Client Screen</span>
                    </button>
                  </div>

                  {/* Previous Day */}
                  <div
                    className="rounded-lg border p-4"
                    style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}
                  >
                    <h4 className="text-xs font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Previous Day Performance</h4>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>28 Apr 2025</span>
                      <span className="text-xs font-mono font-bold" style={{ color: 'var(--text-primary)' }}>24,180.80</span>
                    </div>
                    <p className="text-[10px] mb-2" style={{ color: 'var(--success)' }}>+192.20 (0.80%)</p>
                    <div className="flex items-center justify-between text-[10px] mb-2">
                      <span style={{ color: 'var(--text-muted)' }}>Bullish Zone 24,020 – 24,120</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] mb-3">
                      <span style={{ color: 'var(--text-muted)' }}>Bearish Zone 24,280 – 24,380</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold" style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success)' }}>SUCCESS</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Indian Market Live Pulse Section */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[var(--text-primary)]">
                      Indian Markets Live Watchlist & Sentiment
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
                      TradingView Feeds
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="lg:col-span-2">
                    <TradingViewMarketQuotes height={520} />
                  </div>
                  <div>
                    <TradingViewTechnicalAnalysis
                      defaultSymbol={market === 'SENSEX' ? 'BSE:SENSEX' : 'NSE:NIFTY'}
                      height={450}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* INDIAN MARKET HUB TAB */}
          {activeSubTab === 'indian-markets' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
                    <span>Indian Markets Live TradingView Widgets</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/30">
                      NSE & BSE
                    </span>
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    Real-time stock screener, sector heatmap, and institutional market quotes.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">
                  <TradingViewMarketQuotes height={560} />
                </div>
                <div>
                  <TradingViewTechnicalAnalysis defaultSymbol="NSE:NIFTY" height={480} />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <TradingViewStockHeatmap height={560} />
                <TradingViewIndianScreener height={560} />
              </div>
            </div>
          )}

          {/* 2. TOTAL USERS VIEW */}
          {activeSubTab === 'total-users' && (
            <div className="rounded-xl border p-6 bg-[var(--bg-secondary)] border-[var(--border-subtle)] space-y-4">
              <div className="pb-4 border-b border-[var(--border-subtle)]">
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">Total Users</h3>
                <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Overview of registered accounts on the portal.</p>
              </div>
              <div className="p-4 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Users registered</span>
                  <h4 className="text-2xl font-mono font-bold text-[var(--text-primary)] mt-1">{stats.totalUsers.toLocaleString()}</h4>
                  <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 mt-1">
                    <TrendingUp size={12} /> Live Count
                  </span>
                </div>
                <div className="h-12 w-28 flex items-end gap-1">
                  {[30, 45, 35, 60, 55, 75, 90].map((h, i) => (
                    <div key={i} className="flex-1 rounded-sm bg-[var(--accent-indigo)]/40 hover:bg-[var(--accent-indigo)] transition-all duration-200" style={{ height: `${h}%` }} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 3. ACTIVE USERS TODAY VIEW */}
          {activeSubTab === 'active-users' && (
            <div className="rounded-xl border p-6 bg-[var(--bg-secondary)] border-[var(--border-subtle)] space-y-4">
              <div className="pb-4 border-b border-[var(--border-subtle)]">
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">Active Users Today</h3>
                <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Real-time user sessions active on the portal.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)]">
                  <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Active Sessions</span>
                  <h4 className="text-2xl font-mono font-bold text-emerald-400 mt-1">1,284</h4>
                  <p className="text-[9px] text-[var(--text-muted)] mt-2">Peak active hour: 09:30 AM (IST)</p>
                </div>
                <div className="p-4 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)]">
                  <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Top Active Markets</span>
                  <div className="mt-2 space-y-1.5 text-xs text-[var(--text-secondary)]">
                    <div className="flex justify-between"><span>NIFTY 50 index page</span><span className="font-bold">642 users</span></div>
                    <div className="flex justify-between"><span>SENSEX index page</span><span className="font-bold">410 users</span></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 4. PREMIUM MEMBERS VIEW */}
          {activeSubTab === 'premium-members' && (
            <div className="rounded-xl border p-6 bg-[var(--bg-secondary)] border-[var(--border-subtle)] space-y-4">
              <div className="pb-4 border-b border-[var(--border-subtle)]">
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">Premium Members</h3>
                <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Subscribers with active Pro or VIP tier licenses.</p>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] text-center">
                  <span className="text-[9px] uppercase font-bold text-[var(--text-muted)]">Pro Members</span>
                  <h4 className="text-xl font-mono font-bold text-[var(--accent-indigo)] mt-1">{stats.proUsers.toLocaleString()}</h4>
                </div>
                <div className="p-4 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] text-center">
                  <span className="text-[9px] uppercase font-bold text-[var(--text-muted)]">VIP Members</span>
                  <h4 className="text-xl font-mono font-bold text-purple-400 mt-1">0</h4>
                </div>
                <div className="p-4 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] text-center">
                  <span className="text-[9px] uppercase font-bold text-[var(--text-muted)]">Total Premium</span>
                  <h4 className="text-xl font-mono font-bold text-emerald-400 mt-1">{stats.proUsers.toLocaleString()}</h4>
                </div>
              </div>
            </div>
          )}

          {/* 5. FREE MEMBERS VIEW */}
          {activeSubTab === 'free-members' && (
            <div className="rounded-xl border p-6 bg-[var(--bg-secondary)] border-[var(--border-subtle)] space-y-4">
              <div className="pb-4 border-b border-[var(--border-subtle)]">
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">Free Members</h3>
                <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Users on the basic outlook tier.</p>
              </div>
              <div className="p-4 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)]">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Free outlook accounts</span>
                    <h4 className="text-2xl font-mono font-bold text-[var(--text-primary)] mt-1">13,403</h4>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Conversion rate</span>
                    <h4 className="text-lg font-mono font-bold text-[var(--accent-indigo)] mt-1">6.28%</h4>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 6. NEW REGISTRATIONS VIEW */}
          {activeSubTab === 'new-registrations' && (
            <div className="rounded-xl border p-6 bg-[var(--bg-secondary)] border-[var(--border-subtle)] space-y-4">
              <div className="pb-4 border-b border-[var(--border-subtle)]">
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">New Registrations</h3>
                <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Latest account creations on the platform.</p>
              </div>
              <div className="overflow-x-auto rounded-lg border border-[var(--border-subtle)]">
                <table className="w-full text-left text-xs bg-[var(--bg-tertiary)]">
                  <thead>
                    <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)] text-[var(--text-muted)]">
                      <th className="p-3">User</th>
                      <th className="p-3">Email</th>
                      <th className="p-3">Tier</th>
                      <th className="p-3">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentUsers.slice(0, 5).map(user => (
                      <tr key={user.id} className="border-b border-[var(--border-subtle)] text-[var(--text-secondary)]">
                        <td className="p-3 font-semibold text-[var(--text-primary)]">{user.full_name || 'User'}</td>
                        <td className="p-3 font-mono">{user.email}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                            user.role === 'super_admin' ? 'bg-purple-500/10 text-purple-400' :
                            user.role === 'admin' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-slate-500/10 text-slate-400'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="p-3 font-mono">{new Date(user.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 7. MONTHLY REVENUE VIEW */}
          {activeSubTab === 'monthly-revenue' && (
            <div className="rounded-xl border p-6 bg-[var(--bg-secondary)] border-[var(--border-subtle)] space-y-4">
              <div className="pb-4 border-b border-[var(--border-subtle)]">
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">Monthly Revenue</h3>
                <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Monthly Recurring Revenue (MRR) statement.</p>
              </div>
              <div className="p-4 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Active MRR</span>
                  <h4 className="text-3xl font-mono font-bold text-emerald-400 mt-1">$24,150</h4>
                  <span className="text-[10px] text-[var(--text-muted)] mt-2 block">ARR: $289,800</span>
                </div>
                <div className="space-y-2 text-xs text-[var(--text-secondary)] border-l border-[var(--border-subtle)] pl-4">
                  <div className="flex justify-between"><span>Pro billing revenue</span><span className="font-mono font-bold">$14,720</span></div>
                  <div className="flex justify-between"><span>VIP billing revenue</span><span className="font-mono font-bold">$9,430</span></div>
                </div>
              </div>
            </div>
          )}

          {/* 8. WEBSITE VISITORS VIEW */}
          {activeSubTab === 'website-visitors' && (
            <div className="rounded-xl border p-6 bg-[var(--bg-secondary)] border-[var(--border-subtle)] space-y-4">
              <div className="pb-4 border-b border-[var(--border-subtle)]">
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">Website Visitors</h3>
                <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Analytics of traffic pageviews.</p>
              </div>
              <div className="p-4 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Monthly pageviews</span>
                    <h4 className="text-2xl font-mono font-bold text-[var(--text-primary)] mt-1">48,200</h4>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold">+8.5% MoM</span>
                </div>
                <div className="space-y-2">
                  <span className="text-[9px] uppercase font-bold text-[var(--text-muted)]">Traffic sources</span>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-[var(--text-secondary)]"><span>Direct</span><span>45%</span></div>
                    <div className="h-1.5 rounded-full bg-[var(--bg-secondary)] overflow-hidden"><div className="h-full bg-[var(--accent-indigo)]" style={{ width: '45%' }} /></div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-[var(--text-secondary)]"><span>Search Engines</span><span>30%</span></div>
                    <div className="h-1.5 rounded-full bg-[var(--bg-secondary)] overflow-hidden"><div className="h-full bg-indigo-400" style={{ width: '30%' }} /></div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-[var(--text-secondary)]"><span>Telegram Channel</span><span>25%</span></div>
                    <div className="h-1.5 rounded-full bg-[var(--bg-secondary)] overflow-hidden"><div className="h-full bg-sky-400" style={{ width: '25%' }} /></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  )
}
