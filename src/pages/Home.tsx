import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TrendingUp,
  TrendingDown,
  FileText,
  BarChart3,
  Target,
  Lock,
  Megaphone,
  Radio,
  Sparkles,
  X,
  Clock,
  ShieldCheck,
} from 'lucide-react'
import CandlestickChart from '@/components/charts/CandlestickChart'
import TradingViewChart from '@/components/charts/TradingViewChart'
import InteractiveIndianChart, { type ZoneDefinition } from '@/components/charts/InteractiveIndianChart'
import StatCard from '@/components/StatCard'
import { Globe, Calendar, RotateCcw } from 'lucide-react'
import {
  TradingViewMarketQuotes,
  TradingViewTechnicalAnalysis,
} from '@/components/tradingview'
import { useMarket } from '@/contexts/MarketContext'
import { analysisService } from '@/services/analysisService'
import { useAuth } from '@/contexts/AuthContext'
import { broadcastSyncService, type LiveMarketData, type FlashAlert } from '@/services/broadcastSyncService'
import { Link } from 'react-router-dom'

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
}

export default function Home() {
  const { market } = useMarket()
  const { profile, isSuperAdmin, isAdmin } = useAuth()
  const [analyses, setAnalyses] = useState<any[]>([])
  const [chartMode, setChartMode] = useState<'system' | 'tradingview'>('system')

  // Real-Time Live Synced Market Data from Super Admin
  const [liveData, setLiveData] = useState<LiveMarketData>(broadcastSyncService.getMarketData(market))
  const [flashAlert, setFlashAlert] = useState<FlashAlert | null>(broadcastSyncService.getUrgentAlert())
  const [justUpdated, setJustUpdated] = useState(false)

  // User-editable zones on Free Plan
  const [customBullish, setCustomBullish] = useState<ZoneDefinition>({
    from: liveData.bullishZone?.from || liveData.supportZone?.from || 24050,
    to: liveData.bullishZone?.to || liveData.supportZone?.to || 24150,
  })
  const [customBearish, setCustomBearish] = useState<ZoneDefinition>({
    from: liveData.bearishZone?.from || liveData.resistanceZone?.from || 24420,
    to: liveData.bearishZone?.to || liveData.resistanceZone?.to || 24520,
  })

  useEffect(() => {
    const b = liveData.bullishZone || liveData.supportZone || { from: 24050, to: 24150 }
    const r = liveData.bearishZone || liveData.resistanceZone || { from: 24420, to: 24520 }
    setCustomBullish(b)
    setCustomBearish(r)
  }, [market, liveData.lastUpdated])

  useEffect(() => {
    async function loadAnalyses() {
      try {
        const data = await analysisService.getPublishedAnalyses()
        setAnalyses(data || [])
      } catch (err) {
        console.error('Failed to load analyses', err)
      }
    }
    loadAnalyses()

    // Sync with Broadcast Service in Real-Time
    const initialData = broadcastSyncService.getMarketData(market)
    setLiveData(initialData)
    setFlashAlert(broadcastSyncService.getUrgentAlert())

    const unsubscribe = broadcastSyncService.subscribe(() => {
      const updated = broadcastSyncService.getMarketData(market)
      setLiveData(updated)
      setFlashAlert(broadcastSyncService.getUrgentAlert())
      setJustUpdated(true)
      setTimeout(() => setJustUpdated(false), 3000)
    })

    return () => unsubscribe()
  }, [market])

  const currentAnalysis = analyses.find((a) => a.markets?.name === market)
  const isPro = profile?.role === 'admin' || profile?.role === 'super_admin'

  // Effective values prioritized by Super Admin Live Broadcast
  const effectiveBias = liveData.bias || currentAnalysis?.overall_bias || 'neutral'
  const effectiveSummary = liveData.summary || currentAnalysis?.summary || 'Market consolidation observed.'
  const effectiveInvalidation = String(liveData.invalidationLevel || currentAnalysis?.invalidation_level || '-')

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-5">
      {/* Urgent Super Admin Flash Alert Banner */}
      <AnimatePresence>
        {flashAlert && flashAlert.active && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 shadow-md ${
              flashAlert.severity === 'alert'
                ? 'bg-rose-500/15 border-rose-500/30 text-rose-300'
                : flashAlert.severity === 'warning'
                ? 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                : 'bg-indigo-500/15 border-indigo-500/30 text-indigo-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-500/30 flex items-center justify-center flex-shrink-0">
                <Megaphone size={16} className="text-rose-400 animate-bounce" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider bg-rose-500 text-white px-1.5 py-0.2 rounded">
                    LIVE ADMIN ALERT
                  </span>
                  <span className="text-xs font-bold text-white">{flashAlert.title}</span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">{flashAlert.message}</p>
              </div>
            </div>
            <button
              onClick={() => setFlashAlert(null)}
              className="p-1 rounded text-[var(--text-muted)] hover:text-white hover:bg-white/10 transition-colors"
              title="Dismiss Alert"
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div variants={itemVariants} className="flex flex-wrap justify-between items-center gap-2">
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl font-bold text-[var(--text-primary)]">Market Outlook ({market})</h1>
          <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/30">
            <Radio size={10} className="animate-pulse" />
            LIVE ADMIN SYNCED
          </span>
          {justUpdated && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500 text-white font-bold animate-pulse">
              ⚡ UPDATED JUST NOW
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {(isSuperAdmin || isAdmin) && (
            <Link
              to="/dashboard"
              className="px-3 py-1.5 rounded-lg bg-amber-500/15 text-amber-300 text-xs font-bold border border-amber-500/30 hover:bg-amber-500/25 transition-colors flex items-center gap-1.5"
            >
              <ShieldCheck size={13} className="text-amber-400" />
              <span>Back to Admin Console</span>
            </Link>
          )}
          {!isPro && (
            <Link
              to="/app/subscription"
              className="px-4 py-1.5 rounded bg-indigo-500/10 text-indigo-400 text-xs font-semibold hover:bg-indigo-500/20 transition-colors flex items-center gap-1.5"
            >
              <Lock size={12} /> Unlock Pro Features
            </Link>
          )}
        </div>
      </motion.div>

      {/* Summary Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Market" value={market} sentiment="neutral" icon={<BarChart3 size={18} />} />
        <StatCard
          label="Overall Bias"
          value={effectiveBias.toUpperCase()}
          sentiment={effectiveBias}
          icon={effectiveBias === 'bullish' ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
        />
        <StatCard
          label="Target / Resistance"
          value={`${liveData.resistanceZone?.from || '-'} - ${liveData.resistanceZone?.to || '-'}`}
          sentiment="bullish"
          sublabel="Key breakout zone"
          icon={<Target size={18} />}
        />
        <StatCard
          label="Invalid Below"
          value={effectiveInvalidation}
          sentiment="bearish"
          sublabel="Trend invalidation"
          icon={<TrendingDown size={18} />}
        />
      </motion.div>

      {/* Verified Publication & Broadcast Info Banner */}
      <motion.div
        variants={itemVariants}
        className="p-3.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 flex flex-wrap items-center justify-between gap-3 text-xs shadow-sm"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center flex-shrink-0">
            <Radio size={16} className="text-indigo-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-xs">Official Analysis & Live Zones</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                ALICE BLUE LIVE FEED
              </span>
            </div>
            <p className="text-slate-300 text-[11px] mt-0.5">
              Published by <strong className="text-white">{liveData.updatedBy || 'Barath (Super Admin)'}</strong> &middot; Real-time zones displayed below
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px]">
          <Clock size={13} className="text-indigo-400" />
          <span>Published: <strong className="text-indigo-200">{liveData.publishedAtFormatted || '22 Sept 2026, 20:55 IST'}</strong></span>
        </div>
      </motion.div>

      {/* Chart with Mode Toggle */}
      <motion.div variants={itemVariants} className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[var(--text-primary)]">Technical Chart (Indian Indices)</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
              Interactive & Editable (Free Plan)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const defBullish = liveData.bullishZone || liveData.supportZone || { from: 24050, to: 24150 }
                const defBearish = liveData.bearishZone || liveData.resistanceZone || { from: 24420, to: 24520 }
                setCustomBullish(defBullish)
                setCustomBearish(defBearish)
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] text-[10px] font-bold text-slate-300 hover:text-white transition-all"
              title="Reset chart zones to the official levels published by Super Admin"
            >
              <RotateCcw size={11} />
              <span>Reset to Published Zones</span>
            </button>

            <div className="flex items-center rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] p-0.5 text-xs">
              <button
                onClick={() => setChartMode('system')}
                className={`px-3 py-1 rounded-md font-medium transition-all ${
                  chartMode === 'system'
                    ? 'bg-[var(--accent-indigo)] text-white'
                    : 'text-[var(--text-secondary)] hover:text-white'
                }`}
              >
                Zonal Edge Pro (Interactive)
              </button>
              <button
                onClick={() => setChartMode('tradingview')}
                className={`px-3 py-1 rounded-md font-medium transition-all ${
                  chartMode === 'tradingview'
                    ? 'bg-[var(--accent-indigo)] text-white'
                    : 'text-[var(--text-secondary)] hover:text-white'
                }`}
              >
                TradingView Indian Pro
              </button>
            </div>
          </div>
        </div>

        {chartMode === 'system' ? (
          <InteractiveIndianChart
            market={market}
            timeframe="15m"
            bullishZone={customBullish}
            bearishZone={customBearish}
            invalidationLevel={
              typeof liveData.invalidationLevel === 'number'
                ? liveData.invalidationLevel
                : 24100
            }
            onBullishZoneChange={(z) => setCustomBullish(z)}
            onBearishZoneChange={(z) => setCustomBearish(z)}
            readOnly={false}
            height={460}
          />
        ) : (
          <TradingViewChart
            defaultSymbol={market === 'SENSEX' ? 'BSE:SENSEX' : 'BSE:NIFTY50'}
            height={540}
          />
        )}
      </motion.div>

      {/* Detailed Analysis Content */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Analysis Details - 100% Unlocked for All Users */}
        <div className="rounded-lg border p-4 bg-[var(--bg-secondary)] border-[var(--border-subtle)] relative overflow-hidden">
          <div className="flex items-center gap-2 mb-4">
            <FileText size={16} className="text-[var(--accent-indigo)]" />
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">Detailed Notes & Analysis</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase font-bold text-[var(--accent-indigo)]">
                  Live Admin Commentary ({market})
                </span>
                <span className="text-[9px] font-mono text-[var(--text-muted)]">
                  Updated {new Date(liveData.lastUpdated).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="text-xs leading-relaxed text-[var(--text-secondary)] whitespace-pre-wrap">
                {liveData.summary || currentAnalysis?.detailed_notes || 'Consolidation phase active. Watch defined key levels.'}
              </p>
              {liveData.notes && (
                <p className="text-[11px] text-[var(--text-muted)] mt-2 italic">
                  Note: {liveData.notes}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Support & Resistance Zones + Session Expectations */}
        <div className="space-y-4">
          <div className="rounded-lg border p-4 bg-[var(--bg-secondary)] border-[var(--border-subtle)]">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-semibold text-[var(--text-primary)]">Key Trading Zones</h4>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                ACTIVE
              </span>
            </div>
            
            <div className="space-y-2.5">
              <div className="flex justify-between items-center text-xs pb-2 border-b border-[var(--border-subtle)]">
                <span className="text-emerald-400 font-bold">Support / Bullish Zone</span>
                <span className="font-mono font-bold text-[var(--text-primary)]">
                  {liveData.bullishZone?.from || liveData.supportZone?.from || '-'} – {liveData.bullishZone?.to || liveData.supportZone?.to || '-'}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs pb-2 border-b border-[var(--border-subtle)]">
                <span className="text-rose-400 font-bold">Resistance / Bearish Zone</span>
                <span className="font-mono font-bold text-[var(--text-primary)]">
                  {liveData.bearishZone?.from || liveData.resistanceZone?.from || '-'} – {liveData.bearishZone?.to || liveData.resistanceZone?.to || '-'}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-amber-400 font-bold">Invalidation Level</span>
                <span className="font-mono font-bold text-[var(--text-primary)]">
                  {effectiveInvalidation}
                </span>
              </div>
            </div>
          </div>

          {/* Published Session Expectations (Asian, London, New York) */}
          <div className="rounded-lg border p-4 bg-[var(--bg-secondary)] border-[var(--border-subtle)] space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                <Globe size={14} className="text-indigo-400" />
                <span>Session Expectations</span>
              </h4>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-bold border border-indigo-500/20">
                GLOBAL SESSIONS
              </span>
            </div>

            <div className="space-y-2 pt-1 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)]">
                <span className="text-slate-300 font-medium">Asian Session</span>
                <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold border ${
                  (liveData.sessions?.asian || 'Neutral') === 'Neutral'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : (liveData.sessions?.asian || 'Neutral') === 'Bullish'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                }`}>
                  {liveData.sessions?.asian || 'Neutral'}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)]">
                <span className="text-slate-300 font-medium">London Session</span>
                <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold border ${
                  (liveData.sessions?.london || 'Bullish') === 'Bullish'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : (liveData.sessions?.london || 'Bullish') === 'Bearish'
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                }`}>
                  {liveData.sessions?.london || 'Bullish'}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)]">
                <span className="text-slate-300 font-medium">New York Session</span>
                <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold border ${
                  (liveData.sessions?.newYork || 'Volatile') === 'Volatile'
                    ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                    : (liveData.sessions?.newYork || 'Volatile') === 'Bullish'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                }`}>
                  {liveData.sessions?.newYork || 'Volatile'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Indian Markets Live Pulse Section */}
      <motion.div variants={itemVariants} className="space-y-3 pt-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-[var(--text-primary)]">
              Indian Markets Live Watchlist & Sentiment
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
              TradingView Live
            </span>
          </div>
          <Link
            to="/app/indian-markets"
            className="text-xs text-[var(--accent-indigo)] hover:underline font-semibold flex items-center gap-1"
          >
            <span>Open Indian Markets Command Center</span>
            <span>&rarr;</span>
          </Link>
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
      </motion.div>
    </motion.div>
  )
}
