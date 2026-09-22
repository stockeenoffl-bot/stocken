import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar,
  TrendingUp,
  TrendingDown,
  Minus,
  Plus,
  Save,
  Trash2,
  Send,
  HelpCircle,
  CheckCircle2,
  Radio,
  Clock,
  UserCheck,
  ChevronDown,
  Zap,
} from 'lucide-react'
import InteractiveIndianChart, { type ZoneDefinition } from '@/components/charts/InteractiveIndianChart'
import { useAnalysis } from '@/contexts/AnalysisContext'
import { useAuth } from '@/contexts/AuthContext'
import { analysisService } from '@/services/analysisService'
import { broadcastSyncService } from '@/services/broadcastSyncService'
import { aliceBlueService } from '@/services/aliceBlueService'
import { toast } from 'sonner'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
}

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
}

export default function Create() {
  const { analysis, setAnalysis } = useAnalysis()
  const { profile } = useAuth()

  // Primary market selection matching Screenshot 2: NIFTY 50 vs SENSEX
  const [selectedMarket, setSelectedMarket] = useState<'NIFTY 50' | 'SENSEX'>('NIFTY 50')
  const [analysisDate, setAnalysisDate] = useState('29 Apr 2025')
  const [isSaving, setIsSaving] = useState(false)
  const [showAdditionalZone, setShowAdditionalZone] = useState(false)

  // Last publication tracking
  const [lastPublishedInfo, setLastPublishedInfo] = useState<{
    time: string
    author: string
    market: string
  } | null>(() => {
    try {
      const saved = localStorage.getItem('zonal_edge_last_published_info')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  // Format current date & time in IST
  const getISTFormattedTime = () => {
    const d = new Date()
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }) + ', ' + d.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    }) + ' IST'
  }

  // Publisher details
  const publisherName = profile?.full_name || 'Barath'
  const publisherRole = 'Super Admin'

  // Sync zones with Indian index presets when market changes
  const handleMarketChange = (market: 'NIFTY 50' | 'SENSEX') => {
    setSelectedMarket(market)
    if (market === 'SENSEX') {
      setAnalysis({
        ...analysis,
        bullishZone: { from: 79050, to: 79200 },
        bearishZone: { from: 79650, to: 79800 },
        liquidityZone: { from: 79350, to: 79500 },
        biasStatement: 'Bullish above 79,250',
        invalidationLevel: 78950,
      })
    } else {
      setAnalysis({
        ...analysis,
        bullishZone: { from: 24050, to: 24150 },
        bearishZone: { from: 24420, to: 24520 },
        liquidityZone: { from: 24200, to: 24280 },
        biasStatement: 'Bullish above 24,220',
        invalidationLevel: 24100,
      })
    }
  }

  // Zone handlers from interactive chart drag
  const handleBullishZoneFromChart = (zone: ZoneDefinition) => {
    setAnalysis({
      ...analysis,
      bullishZone: { from: Math.round(zone.from), to: Math.round(zone.to) },
    })
  }

  const handleBearishZoneFromChart = (zone: ZoneDefinition) => {
    setAnalysis({
      ...analysis,
      bearishZone: { from: Math.round(zone.from), to: Math.round(zone.to) },
    })
  }

  // Clear all handler
  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to reset all analysis fields to empty?')) {
      setAnalysis({
        bullishZone: { from: 0, to: 0 },
        bearishZone: { from: 0, to: 0 },
        liquidityZone: { from: 0, to: 0 },
        overallBias: 'Neutral',
        biasStatement: '',
        invalidationLevel: 0,
        sessions: { asian: 'Neutral', london: 'Neutral', newYork: 'Neutral' },
        notes: '',
      })
      toast.info('Analysis cleared.')
    }
  }

  // Save / Publish Handler
  const handleSave = async (status: 'draft' | 'published') => {
    setIsSaving(true)
    const formattedTimestamp = getISTFormattedTime()

    try {
      // 1. Instant broadcast to all active subscriber tabs via broadcastSyncService
      await broadcastSyncService.broadcastMarketUpdate(
        selectedMarket,
        {
          bias: analysis.overallBias.toLowerCase() as 'bullish' | 'bearish' | 'neutral',
          summary: analysis.biasStatement || analysis.notes || `${selectedMarket} Technical Analysis Update`,
          biasStatement: analysis.biasStatement,
          invalidationLevel: Number(analysis.invalidationLevel) || analysis.invalidationLevel,
          supportZone: { from: analysis.bullishZone.from, to: analysis.bullishZone.to },
          resistanceZone: { from: analysis.bearishZone.from, to: analysis.bearishZone.to },
          bullishZone: { from: analysis.bullishZone.from, to: analysis.bullishZone.to },
          bearishZone: { from: analysis.bearishZone.from, to: analysis.bearishZone.to },
          sessions: analysis.sessions,
          notes: analysis.notes,
          publishedAtFormatted: formattedTimestamp,
          updatedBy: `${publisherName} (${publisherRole})`,
          publishedByRole: publisherRole,
        },
        `${publisherName} (${publisherRole})`
      )

      // 2. Best-effort Supabase backend save
      try {
        const marketsData = await analysisService.getMarkets()
        const currentM = marketsData?.find((m: any) => m.name === selectedMarket)
        if (currentM && profile) {
          const payload = {
            market_id: currentM.id,
            title: `${selectedMarket} Analysis - ${formattedTimestamp}`,
            analysis_date: new Date().toISOString().split('T')[0],
            overall_bias: analysis.overallBias.toLowerCase() as 'bullish' | 'bearish' | 'neutral',
            invalidation_level: analysis.invalidationLevel,
            detailed_notes: analysis.notes,
            bias_statement: analysis.biasStatement,
            status,
            visibility: 'free' as const,
            author_id: profile.id,
          }

          const zones = [
            {
              zone_type: 'support' as const,
              direction: 'bullish' as const,
              price_from: analysis.bullishZone.from,
              price_to: analysis.bullishZone.to,
            },
            {
              zone_type: 'resistance' as const,
              direction: 'bearish' as const,
              price_from: analysis.bearishZone.from,
              price_to: analysis.bearishZone.to,
            },
          ]

          await analysisService.createAnalysis(payload, zones)
        }
      } catch (backendErr) {
        console.warn('Backend database note:', backendErr)
      }

      // Record last published info
      const pubInfo = {
        time: formattedTimestamp,
        author: `${publisherName} • ${publisherRole}`,
        market: selectedMarket,
      }
      setLastPublishedInfo(pubInfo)
      localStorage.setItem('zonal_edge_last_published_info', JSON.stringify(pubInfo))

      if (status === 'published') {
        toast.success(
          `🚀 Analysis Published at ${formattedTimestamp} by ${publisherName}! Live on user portal.`,
          { duration: 5000 }
        )
      } else {
        toast.success(`💾 Analysis draft saved at ${formattedTimestamp}`)
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to save analysis')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-4 max-w-7xl mx-auto pb-8">
      {/* Top Header Matching Screenshot 2 */}
      <motion.div variants={item} className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Create / Edit Analysis
            <span className="text-[11px] font-mono font-normal px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Super Admin Mode
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Mark zones, set bias and publish for your subscribers
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Analysis Date Selector Pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#1E293B] bg-[#0E1424] text-xs text-slate-300 shadow-sm">
            <Calendar size={14} className="text-slate-400" />
            <input
              type="text"
              value={analysisDate}
              onChange={(e) => setAnalysisDate(e.target.value)}
              className="bg-transparent text-xs text-slate-200 outline-none w-24 font-medium"
            />
            <ChevronDown size={13} className="text-slate-500" />
          </div>
        </div>
      </motion.div>

      {/* Live Published Status Banner (Who Published & Exact Timestamp) */}
      {lastPublishedInfo && (
        <motion.div
          variants={item}
          className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 flex flex-wrap items-center justify-between gap-2 text-xs"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 size={14} className="text-emerald-400" />
            </div>
            <div>
              <span className="font-bold text-white">Live Published to Subscribers:</span>{' '}
              <span className="text-emerald-300 font-medium">
                {lastPublishedInfo.market} update published by {lastPublishedInfo.author}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400">
            <Clock size={12} className="text-emerald-400" />
            <span>Published At: <strong className="text-white">{lastPublishedInfo.time}</strong></span>
          </div>
        </motion.div>
      )}

      {/* STEP 1: Select Market (Matching Screenshot 2) */}
      <motion.div
        variants={item}
        className="rounded-xl border border-[#1A2234] bg-[#0D121F] p-4 shadow-sm"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-sm">
              1
            </div>
            <h3 className="text-sm font-bold text-white tracking-wide">Select Market</h3>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Analysis Date</span>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#1E293B] bg-[#141B2D] text-xs text-slate-200">
              <Calendar size={13} className="text-slate-400" />
              <span>{analysisDate}</span>
            </div>
          </div>
        </div>

        {/* Market Selection Buttons */}
        <div className="flex items-center gap-3 mt-3">
          <button
            type="button"
            onClick={() => handleMarketChange('NIFTY 50')}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg border text-xs font-bold transition-all ${
              selectedMarket === 'NIFTY 50'
                ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200 shadow-sm shadow-indigo-500/20'
                : 'border-[#1E293B] bg-[#141B2D] text-slate-400 hover:text-white hover:border-slate-700'
            }`}
          >
            <Zap size={14} className={selectedMarket === 'NIFTY 50' ? 'text-indigo-400' : 'text-slate-500'} />
            <span>NIFTY 50</span>
          </button>

          <button
            type="button"
            onClick={() => handleMarketChange('SENSEX')}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg border text-xs font-bold transition-all ${
              selectedMarket === 'SENSEX'
                ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200 shadow-sm shadow-indigo-500/20'
                : 'border-[#1E293B] bg-[#141B2D] text-slate-400 hover:text-white hover:border-slate-700'
            }`}
          >
            <TrendingUp size={14} className={selectedMarket === 'SENSEX' ? 'text-indigo-400' : 'text-slate-500'} />
            <span>SENSEX</span>
          </button>
        </div>
      </motion.div>

      {/* STEP 2: Market Chart with Interactive Drawing & Bidirectional Zones (Matching Screenshot 2) */}
      <motion.div
        variants={item}
        className="rounded-xl border border-[#1A2234] bg-[#0D121F] p-4 shadow-sm space-y-3"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-sm">
              2
            </div>
            <h3 className="text-sm font-bold text-white tracking-wide">
              Market Chart ({selectedMarket} &middot; 15m &middot; NSE)
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/30 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Alice Blue Live Indian Data Feed
            </span>
          </div>
        </div>

        {/* Live Interactive Chart with Drag-to-Resize Zones */}
        <div className="rounded-lg overflow-hidden border border-[#1A2234]">
          <InteractiveIndianChart
            market={selectedMarket}
            timeframe="15m"
            bullishZone={analysis.bullishZone}
            bearishZone={analysis.bearishZone}
            invalidationLevel={analysis.invalidationLevel}
            onBullishZoneChange={handleBullishZoneFromChart}
            onBearishZoneChange={handleBearishZoneFromChart}
            height={440}
            readOnly={false}
          />
        </div>
        <p className="text-[11px] text-slate-500 italic">
          💡 <strong>Interactive Admin Canvas:</strong> Drag the red Bearish Zone or green Bullish Zone handles directly on the chart to reposition them. Values will automatically update in Step 3 below.
        </p>
      </motion.div>

      {/* STEPS 3 & 4: 2-Column Grid matching Screenshot 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* STEP 3: Zones Card */}
        <motion.div
          variants={item}
          className="rounded-xl border border-[#1A2234] bg-[#0D121F] p-4 shadow-sm space-y-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-sm">
              3
            </div>
            <h3 className="text-sm font-bold text-white tracking-wide">Zones</h3>
          </div>

          {/* Bullish Zone */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-emerald-400 block">
              Bullish Zone
            </label>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
                  From
                </span>
                <input
                  type="number"
                  value={analysis.bullishZone.from || ''}
                  onChange={(e) =>
                    setAnalysis({
                      ...analysis,
                      bullishZone: { ...analysis.bullishZone, from: Number(e.target.value) },
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-[#1E293B] bg-[#141B2D] text-sm font-mono text-white outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div className="flex-1">
                <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
                  To
                </span>
                <input
                  type="number"
                  value={analysis.bullishZone.to || ''}
                  onChange={(e) =>
                    setAnalysis({
                      ...analysis,
                      bullishZone: { ...analysis.bullishZone, to: Number(e.target.value) },
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-[#1E293B] bg-[#141B2D] text-sm font-mono text-white outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              {/* Color swatch matching screenshot */}
              <div className="pt-4">
                <div className="w-9 h-9 rounded-lg bg-[#14532D] border border-emerald-500 flex items-center justify-center cursor-pointer shadow-sm">
                  <div className="w-3.5 h-3.5 rounded-sm bg-emerald-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Bearish Zone */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-rose-400 block">
              Bearish Zone
            </label>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
                  From
                </span>
                <input
                  type="number"
                  value={analysis.bearishZone.from || ''}
                  onChange={(e) =>
                    setAnalysis({
                      ...analysis,
                      bearishZone: { ...analysis.bearishZone, from: Number(e.target.value) },
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-[#1E293B] bg-[#141B2D] text-sm font-mono text-white outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div className="flex-1">
                <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
                  To
                </span>
                <input
                  type="number"
                  value={analysis.bearishZone.to || ''}
                  onChange={(e) =>
                    setAnalysis({
                      ...analysis,
                      bearishZone: { ...analysis.bearishZone, to: Number(e.target.value) },
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-[#1E293B] bg-[#141B2D] text-sm font-mono text-white outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              {/* Color swatch matching screenshot */}
              <div className="pt-4">
                <div className="w-9 h-9 rounded-lg bg-[#7F1D1D] border border-rose-500 flex items-center justify-center cursor-pointer shadow-sm">
                  <div className="w-3.5 h-3.5 rounded-sm bg-rose-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Optional Additional Zone */}
          {showAdditionalZone && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-1.5 pt-2 border-t border-[#1E293B]"
            >
              <label className="text-xs font-bold text-purple-400 block">
                Additional Liquidity Zone
              </label>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
                    From
                  </span>
                  <input
                    type="number"
                    value={analysis.liquidityZone.from || ''}
                    onChange={(e) =>
                      setAnalysis({
                        ...analysis,
                        liquidityZone: { ...analysis.liquidityZone, from: Number(e.target.value) },
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-[#1E293B] bg-[#141B2D] text-sm font-mono text-white outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
                <div className="flex-1">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
                    To
                  </span>
                  <input
                    type="number"
                    value={analysis.liquidityZone.to || ''}
                    onChange={(e) =>
                      setAnalysis({
                        ...analysis,
                        liquidityZone: { ...analysis.liquidityZone, to: Number(e.target.value) },
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-[#1E293B] bg-[#141B2D] text-sm font-mono text-white outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
                <div className="pt-4">
                  <div className="w-9 h-9 rounded-lg bg-[#581C87] border border-purple-500 flex items-center justify-center cursor-pointer">
                    <div className="w-3.5 h-3.5 rounded-sm bg-purple-400" />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Add Additional Zone Button */}
          <button
            type="button"
            onClick={() => setShowAdditionalZone(!showAdditionalZone)}
            className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors pt-1"
          >
            <Plus size={14} />
            <span>{showAdditionalZone ? 'Hide Additional Zone' : '+ Add Additional Zone (Optional)'}</span>
          </button>
        </motion.div>

        {/* STEP 4: Bias & Invalidation Card */}
        <motion.div
          variants={item}
          className="rounded-xl border border-[#1A2234] bg-[#0D121F] p-4 shadow-sm space-y-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-sm">
              4
            </div>
            <h3 className="text-sm font-bold text-white tracking-wide">Bias & Invalidation</h3>
          </div>

          {/* Overall Bias Buttons (Screenshot 2 exact style) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 block">
              Overall Bias
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setAnalysis({ ...analysis, overallBias: 'Bullish' })}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all border ${
                  analysis.overallBias === 'Bullish'
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-500/20'
                    : 'bg-[#141B2D] text-slate-400 border-[#1E293B] hover:text-white'
                }`}
              >
                <TrendingUp size={14} />
                <span>Bullish</span>
                <TrendingUp size={14} />
              </button>

              <button
                type="button"
                onClick={() => setAnalysis({ ...analysis, overallBias: 'Bearish' })}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all border ${
                  analysis.overallBias === 'Bearish'
                    ? 'bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-500/20'
                    : 'bg-[#141B2D] text-slate-400 border-[#1E293B] hover:text-white'
                }`}
              >
                <TrendingDown size={14} />
                <span>Bearish</span>
              </button>

              <button
                type="button"
                onClick={() => setAnalysis({ ...analysis, overallBias: 'Neutral' })}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all border ${
                  analysis.overallBias === 'Neutral'
                    ? 'bg-amber-600 text-white border-amber-500 shadow-md shadow-amber-500/20'
                    : 'bg-[#141B2D] text-slate-400 border-[#1E293B] hover:text-white'
                }`}
              >
                <Minus size={14} />
                <span>Neutral</span>
              </button>
            </div>
          </div>

          {/* Bias Statement */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 block">
              Bias Statement
            </label>
            <div className="relative">
              <input
                type="text"
                maxLength={100}
                value={analysis.biasStatement}
                onChange={(e) => setAnalysis({ ...analysis, biasStatement: e.target.value })}
                className="w-full px-3 py-2 pr-14 rounded-lg border border-[#1E293B] bg-[#141B2D] text-sm text-white outline-none focus:border-indigo-500 transition-colors"
                placeholder="e.g. Bullish above 24,220"
              />
              <span className="absolute right-3 top-2.5 text-[11px] font-mono text-slate-500">
                {analysis.biasStatement.length}/100
              </span>
            </div>
          </div>

          {/* Invalidation Level */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 block">
              Invalidation Level
            </label>
            <input
              type="number"
              value={analysis.invalidationLevel || ''}
              onChange={(e) => setAnalysis({ ...analysis, invalidationLevel: Number(e.target.value) })}
              className="w-full px-3 py-2 rounded-lg border border-[#1E293B] bg-[#141B2D] text-sm font-mono text-white outline-none focus:border-indigo-500 transition-colors"
              placeholder="e.g. 24100"
            />
            <p className="text-[11px] text-slate-400">
              Below this level, the bias will be considered invalid.
            </p>
          </div>
        </motion.div>
      </div>

      {/* STEPS 5 & 6: 2-Column Grid matching Screenshot 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* STEP 5: Session Expectations */}
        <motion.div
          variants={item}
          className="rounded-xl border border-[#1A2234] bg-[#0D121F] p-4 shadow-sm space-y-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-sm">
              5
            </div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-bold text-white tracking-wide">
                Session Expectations
              </h3>
              <span className="text-xs text-slate-500">(Optional)</span>
              <HelpCircle size={13} className="text-slate-500 cursor-help" />
            </div>
          </div>

          {/* Asian Session */}
          <div className="flex items-center justify-between py-1.5 border-b border-[#1A2234]">
            <span className="text-xs font-semibold text-slate-300">Asian Session</span>
            <div className="flex items-center gap-1.5">
              {(['Bullish', 'Bearish', 'Neutral'] as const).map((choice) => {
                const isActive = analysis.sessions.asian === choice
                return (
                  <button
                    key={choice}
                    type="button"
                    onClick={() =>
                      setAnalysis({
                        ...analysis,
                        sessions: { ...analysis.sessions, asian: choice },
                      })
                    }
                    className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all border ${
                      isActive
                        ? choice === 'Neutral'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500'
                          : choice === 'Bullish'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500'
                          : 'bg-rose-500/20 text-rose-300 border-rose-500'
                        : 'border-[#1E293B] bg-[#141B2D] text-slate-400 hover:text-white'
                    }`}
                  >
                    {choice}
                  </button>
                )
              })}
            </div>
          </div>

          {/* London Session */}
          <div className="flex items-center justify-between py-1.5 border-b border-[#1A2234]">
            <span className="text-xs font-semibold text-slate-300">London Session</span>
            <div className="flex items-center gap-1.5">
              {(['Bullish', 'Bearish', 'Neutral'] as const).map((choice) => {
                const isActive = analysis.sessions.london === choice
                return (
                  <button
                    key={choice}
                    type="button"
                    onClick={() =>
                      setAnalysis({
                        ...analysis,
                        sessions: { ...analysis.sessions, london: choice },
                      })
                    }
                    className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all border ${
                      isActive
                        ? choice === 'Bullish'
                          ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                          : choice === 'Bearish'
                          ? 'bg-rose-600 text-white border-rose-500'
                          : 'bg-amber-600 text-white border-amber-500'
                        : 'border-[#1E293B] bg-[#141B2D] text-slate-400 hover:text-white'
                    }`}
                  >
                    {choice}
                  </button>
                )
              })}
            </div>
          </div>

          {/* New York Session */}
          <div className="flex items-center justify-between py-1.5">
            <span className="text-xs font-semibold text-slate-300">New York Session</span>
            <div className="flex items-center gap-1.5">
              {(['Bullish', 'Bearish', 'Volatile'] as const).map((choice) => {
                const isActive = analysis.sessions.newYork === choice
                return (
                  <button
                    key={choice}
                    type="button"
                    onClick={() =>
                      setAnalysis({
                        ...analysis,
                        sessions: { ...analysis.sessions, newYork: choice },
                      })
                    }
                    className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all border ${
                      isActive
                        ? choice === 'Volatile'
                          ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                          : choice === 'Bullish'
                          ? 'bg-emerald-600 text-white border-emerald-500'
                          : 'bg-rose-600 text-white border-rose-500'
                        : 'border-[#1E293B] bg-[#141B2D] text-slate-400 hover:text-white'
                    }`}
                  >
                    {choice}
                  </button>
                )
              })}
            </div>
          </div>
        </motion.div>

        {/* STEP 6: Notes / Explanation */}
        <motion.div
          variants={item}
          className="rounded-xl border border-[#1A2234] bg-[#0D121F] p-4 shadow-sm space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-sm">
                6
              </div>
              <h3 className="text-sm font-bold text-white tracking-wide">
                Notes / Explanation
              </h3>
            </div>
            <span className="text-[11px] font-mono text-slate-500">
              {analysis.notes.length}/300
            </span>
          </div>

          <textarea
            rows={5}
            maxLength={300}
            value={analysis.notes}
            onChange={(e) => setAnalysis({ ...analysis, notes: e.target.value })}
            className="w-full px-3 py-2.5 rounded-lg border border-[#1E293B] bg-[#141B2D] text-xs text-slate-200 leading-relaxed outline-none focus:border-indigo-500 transition-colors resize-none"
            placeholder="Liquidity sweep below previous swing low followed by strong rejection..."
          />
        </motion.div>
      </div>

      {/* ACTION BAR: Save as Draft, Clear All, Preview & Publish (Screenshot 2 Exact Style) */}
      <motion.div
        variants={item}
        className="flex flex-wrap items-center justify-between gap-3 pt-2"
      >
        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={isSaving}
            onClick={() => handleSave('draft')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#1E293B] bg-[#141B2D] text-xs font-bold text-slate-300 hover:text-white hover:border-slate-700 transition-all disabled:opacity-50"
          >
            <Save size={15} />
            <span>Save as Draft</span>
          </button>

          <button
            type="button"
            onClick={handleClearAll}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#1E293B] bg-[#141B2D] text-xs font-bold text-slate-400 hover:text-rose-400 hover:border-rose-500/40 transition-all"
          >
            <Trash2 size={15} />
            <span>Clear All</span>
          </button>
        </div>

        {/* Big Preview & Publish Button */}
        <motion.button
          type="button"
          disabled={isSaving}
          onClick={() => handleSave('published')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-3 px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
        >
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
            <Send size={16} className="text-white" />
          </div>
          <div className="text-left">
            <div className="text-sm font-bold leading-tight">
              {isSaving ? 'Publishing & Syncing...' : 'Preview & Publish'}
            </div>
            <div className="text-[10px] text-indigo-200 font-normal">
              Publish analysis for subscribers
            </div>
          </div>
        </motion.button>
      </motion.div>
    </motion.div>
  )
}
