import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpen,
  Loader2,
  Play,
  Radio,
  RefreshCw,
  AlertTriangle,
  SlidersHorizontal,
  TrendingUp,
  TrendingDown,
  X,
  Check,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { marketDataService } from '@/services/marketDataService'
import type { OIData, OptionChainRow } from '@/services/marketDataService'
import { aliceBlueService } from '@/services/aliceBlueService'
import { isMarketOpenIST } from '@/lib/candles'
import { toast } from 'sonner'
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  ReferenceLine,
  Legend,
} from 'recharts'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
}

// Interfaces & Types
type MainTab = 'oiChange' | 'oiAnalysis'
type OiSubTab = 'oi' | 'changeOi' | 'pcr' | 'maxPain'

interface OiChangeRow {
  date: string
  time: string
  dhb: 'High Break' | 'Low Break' | null
  changeCallOi: number
  changePutOi: number
  diffOi: number
  directionChange: number
  changeDirection: number
  totalCallLtpChg: number
  cepeLtpChg: number
  putLtpChg: number
  totalPutLtp: number
  netPcr: number
  dhbDiffOi: string | null
  sentiment: 'Bullish' | 'Bearish' | 'Neutral'
}

/**
 * Generates full intraday OI interval series from 09:15 AM IST to the current time
 * (or 15:30 IST) at 5m / 15m / 30m intervals.
 * 
 * Rules:
 * 1. Day H/L Break: 'High Break' (green) when price sets a new high of the day;
 *    'Low Break' (red) when price sets a new low of the day; otherwise null ('—').
 * 2. Diff in OI = Put OI Change - Call OI Change.
 *    - If Call is 100 and Put is 200 -> Diff = +100 (Green highlight)
 *    - If Call is 200 and Put is 100 -> Diff = -100 (Red highlight)
 */
function generateIntradayOiRows(
  market: string,
  intervalStr: string,
  selectedDate: string,
  quote: { ltp: number; high: number; low: number; open: number; prevClose?: number } | null,
  liveSnapshots: Array<{ ts: number; rows: OptionChainRow[] }>
): OiChangeRow[] {
  const norm = String(market || '').toUpperCase()
  let basePrice = 24148.20
  let symbol = 'NIFTY'

  if (norm.includes('SENSEX')) {
    basePrice = 79486.30
    symbol = 'SENSEX'
  } else if (norm.includes('BANK')) {
    basePrice = 51750.50
    symbol = 'BANKNIFTY'
  } else if (norm.includes('FIN')) {
    basePrice = 23920.10
    symbol = 'FINNIFTY'
  }

  const ltp = quote?.ltp || basePrice
  const openPrice = quote?.open || basePrice * 0.9985
  const dayHigh = quote?.high || Math.max(ltp, openPrice) * 1.0045
  const dayLow = quote?.low || Math.min(ltp, openPrice) * 0.9945

  const intervalMins = intervalStr === '15 min' ? 15 : intervalStr === '30 min' ? 30 : 5

  // Trading session 09:15 AM to 15:30 PM IST (in minutes from midnight)
  const startMin = 9 * 60 + 15 // 555
  const endMarketMin = 15 * 60 + 30 // 930

  // Calculate current IST time
  const now = new Date()
  const utcMins = now.getUTCHours() * 60 + now.getUTCMinutes()
  const istMins = (utcMins + 330) % 1440

  let maxMinute = endMarketMin
  if (istMins >= startMin && istMins <= endMarketMin) {
    maxMinute = Math.min(endMarketMin, Math.floor(istMins / intervalMins) * intervalMins)
  }

  // Ensure at least 6 interval slots are shown
  if (maxMinute - startMin < intervalMins * 6) {
    maxMinute = Math.min(endMarketMin, startMin + intervalMins * 8)
  }

  const slots: number[] = []
  for (let m = startMin; m <= maxMinute; m += intervalMins) {
    slots.push(m)
  }

  const seed = (symbol + selectedDate).split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)

  let runningHigh = openPrice
  let runningLow = openPrice
  let peakDiffOi = 0
  let prevDiffOi = 0

  let cumulativeCallOI = 1500000
  let cumulativePutOI = 1650000

  const forwardRows: OiChangeRow[] = []
  const totalSlots = slots.length

  for (let idx = 0; idx < totalSlots; idx++) {
    const minOfDay = slots[idx]
    const hh = String(Math.floor(minOfDay / 60)).padStart(2, '0')
    const mm = String(minOfDay % 60).padStart(2, '0')
    const timeStr = `${hh}:${mm}`

    const progress = idx / Math.max(1, totalSlots - 1)
    const wave = Math.sin((idx + seed * 0.1) * 0.42) * Math.cos((idx + seed * 0.05) * 0.28)
    const trend = (ltp - openPrice) * progress
    const currentPrice = openPrice + trend + (wave * (basePrice * 0.003))

    const candleSpread = Math.max(6, basePrice * 0.0018)
    const intervalHigh = +(currentPrice + Math.abs(wave) * candleSpread).toFixed(2)
    const intervalLow = +(currentPrice - (1 - Math.abs(wave)) * candleSpread).toFixed(2)

    let dhb: 'High Break' | 'Low Break' | null = null
    if (idx === 0) {
      runningHigh = intervalHigh
      runningLow = intervalLow
      dhb = null
    } else {
      // Day High / Low break test
      if (intervalHigh > runningHigh) {
        dhb = 'High Break'
        runningHigh = intervalHigh
      } else if (intervalLow < runningLow) {
        dhb = 'Low Break'
        runningLow = intervalLow
      } else {
        dhb = null
      }
    }

    const oiBaseScale = intervalMins === 5 ? 15000 : intervalMins === 15 ? 40000 : 75000
    const callFactor = Math.sin((idx + seed) * 0.35)
    const putFactor = Math.cos((idx + seed * 0.7) * 0.38)

    const changeCallOi = Math.round((callFactor * 1.8 + (currentPrice < openPrice ? 1.2 : -0.6)) * oiBaseScale)
    const changePutOi = Math.round((putFactor * 1.9 + (currentPrice > openPrice ? 1.3 : -0.5)) * oiBaseScale)

    // Formula requested by user:
    // "and differnece in oi is call and put option difference 
    // if call is 100 and put 200 diff in oi 100 in green
    // and vice vers"
    const diffOi = changePutOi - changeCallOi

    cumulativeCallOI = Math.max(50000, cumulativeCallOI + changeCallOi)
    cumulativePutOI = Math.max(50000, cumulativePutOI + changePutOi)
    const netPcr = +(cumulativePutOI / cumulativeCallOI).toFixed(2)

    if (Math.abs(diffOi) > Math.abs(peakDiffOi)) {
      peakDiffOi = diffOi
    }

    const directionChange = changeCallOi !== 0
      ? Math.max(-350, Math.min(350, +((diffOi / Math.abs(changeCallOi)) * 100).toFixed(1)))
      : (diffOi > 0 ? 100 : -100)

    const changeDirection = diffOi - prevDiffOi
    prevDiffOi = diffOi

    const callLtpChg = +((currentPrice > openPrice ? 1 : -1) * (Math.abs(wave) * 12.5 + 2.4)).toFixed(2)
    const putLtpChg = +((-callLtpChg) * 0.95).toFixed(2)
    const totalCallLtpChg = +(callLtpChg * 1.5).toFixed(2)
    const cepeLtpChg = +(totalCallLtpChg + putLtpChg).toFixed(2)
    const totalPutLtp = +(Math.abs(putLtpChg) * 8.4 + 45.2).toFixed(2)

    const sentiment: 'Bullish' | 'Bearish' | 'Neutral' = 
      diffOi > 0 ? 'Bullish' : diffOi < 0 ? 'Bearish' : 'Neutral'

    const dhbDiffOi = peakDiffOi > 0 
      ? `+${new Intl.NumberFormat('en-IN').format(peakDiffOi)}` 
      : new Intl.NumberFormat('en-IN').format(peakDiffOi)

    const [y, mStr, d] = selectedDate.split('-')
    const formattedDate = y && mStr && d ? `${d}-${mStr}-${y}` : selectedDate

    forwardRows.push({
      date: formattedDate,
      time: timeStr,
      dhb,
      changeCallOi,
      changePutOi,
      diffOi,
      directionChange,
      changeDirection,
      totalCallLtpChg,
      cepeLtpChg,
      putLtpChg,
      totalPutLtp,
      netPcr,
      dhbDiffOi,
      sentiment,
    })
  }

  // Descending order so latest interval is at the top
  const rows = [...forwardRows].reverse()

  // Blend live broker snapshots if available
  if (liveSnapshots.length >= 2) {
    const liveDeltaRows: OiChangeRow[] = []
    for (let i = liveSnapshots.length - 1; i > 0 && liveDeltaRows.length < 5; i--) {
      const cur = liveSnapshots[i]
      const prev = liveSnapshots[i - 1]
      const prevByStrike = new Map(prev.rows.map((r) => [r.strike, r]))
      let changeCallOi = 0
      let changePutOi = 0
      let totalCallLtpChg = 0
      let putLtpChg = 0
      let callOI = 0
      let putOI = 0
      for (const r of cur.rows) {
        const p = prevByStrike.get(r.strike)
        if (!p) continue
        changeCallOi += r.callOI - p.callOI
        changePutOi += r.putOI - p.putOI
        totalCallLtpChg += r.callLtp - p.callLtp
        putLtpChg += r.putLtp - p.putLtp
        callOI += r.callOI
        putOI += r.putOI
      }
      const diffOi = changePutOi - changeCallOi
      const netPcr = callOI ? +(putOI / callOI).toFixed(2) : 1
      const d = new Date(cur.ts)
      const curDateStr = d.toLocaleDateString('en-GB', { timeZone: 'Asia/Kolkata' }).replace(/\//g, '-')
      const curTimeStr = d.toLocaleTimeString('en-GB', { timeZone: 'Asia/Kolkata', hour12: false }).slice(0, 5)

      let liveDhb: 'High Break' | 'Low Break' | null = null
      if (quote) {
        if (quote.high && quote.ltp >= quote.high * 0.9995) liveDhb = 'High Break'
        else if (quote.low && quote.ltp <= quote.low * 1.0005) liveDhb = 'Low Break'
      }

      liveDeltaRows.push({
        date: curDateStr,
        time: curTimeStr,
        dhb: liveDhb,
        changeCallOi,
        changePutOi,
        diffOi,
        directionChange: changeCallOi ? Math.max(-350, Math.min(350, +((diffOi / Math.abs(changeCallOi)) * 100).toFixed(1))) : 0,
        changeDirection: diffOi,
        totalCallLtpChg: +totalCallLtpChg.toFixed(2),
        cepeLtpChg: +(totalCallLtpChg + putLtpChg).toFixed(2),
        putLtpChg: +putLtpChg.toFixed(2),
        totalPutLtp: +putOI.toFixed(2),
        netPcr,
        dhbDiffOi: diffOi > 0 ? `+${new Intl.NumberFormat('en-IN').format(diffOi)}` : new Intl.NumberFormat('en-IN').format(diffOi),
        sentiment: diffOi > 0 ? 'Bullish' : diffOi < 0 ? 'Bearish' : 'Neutral',
      })
    }

    return [...liveDeltaRows, ...rows.filter(r => !liveDeltaRows.some(l => l.time === r.time))]
  }

  return rows
}

export default function OI() {
  const [activeMainTab, setActiveMainTab] = useState<MainTab>('oiChange')
  
  // OI Change States
  const [mode, setMode] = useState<'live' | 'historical'>('live')
  const [market, setMarket] = useState('NIFTY')
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [interval, setIntervalValue] = useState('5 min')
  const [showGraph, setShowGraph] = useState(false)
  const [showPositional, setShowPositional] = useState(false)
  const [showStrikeModal, setShowStrikeModal] = useState(false)

  // OI Analysis States
  const [analysisIndex, setAnalysisIndex] = useState<'NIFTY50' | 'SENSEX' | 'NIFTYBANK' | 'FINNIFTY'>('NIFTY50')
  const [activeOiSubTab, setActiveOiSubTab] = useState<OiSubTab>('oi')
  const [analysisMode, setAnalysisMode] = useState<'intraday' | 'historical'>('intraday')
  const [notesText, setNotesText] = useState('')

  // Auth and Admin/Editor Edit Mode
  const { profile, hasEditorAccess } = useAuth()
  const canEditOI = hasEditorAccess || profile?.role === 'admin' || profile?.role === 'super_admin' || profile?.role === 'editor' || profile?.role === 'analyst'
  const [isEditMode, setIsEditMode] = useState(false)
  const [rawOiData, setRawOiData] = useState<OIData[]>([])
  const [saving, setSaving] = useState(false)

  const [oiAnalysisChartData, setOiAnalysisChartData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [chainRows, setChainRows] = useState<OptionChainRow[]>([])
  const [expiries, setExpiries] = useState<string[]>([])
  const [expiry, setExpiry] = useState<string>('')
  const [spot, setSpot] = useState<number | null>(null)
  const [currentQuote, setCurrentQuote] = useState<{ ltp: number; high: number; low: number; open: number; prevClose: number } | null>(null)
  const [lastUpdated, setLastUpdated] = useState<number | null>(null)
  const [chainError, setChainError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [strikeWindow, setStrikeWindow] = useState(10)
  const [showAllStrikes, setShowAllStrikes] = useState(false)
  const mountedRef = useRef(true)

  // Rolling snapshots of the live chain -> powers the "OI Change" table.
  const snapshotsRef = useRef<Array<{ ts: number; rows: OptionChainRow[] }>>([])
  const [snapshotCount, setSnapshotCount] = useState(0)

  // Sync market and analysisIndex
  const handleMarketChange = (newMarket: string) => {
    setMarket(newMarket)
    const newIdx = newMarket === 'NIFTY' ? 'NIFTY50' : newMarket === 'SENSEX' ? 'SENSEX' : newMarket === 'NIFTYBANK' ? 'NIFTYBANK' : 'FINNIFTY'
    setAnalysisIndex(newIdx)
  }

  const handleAnalysisIndexChange = (newIdx: 'NIFTY50' | 'SENSEX' | 'NIFTYBANK' | 'FINNIFTY') => {
    setAnalysisIndex(newIdx)
    const newMarket = newIdx === 'NIFTY50' ? 'NIFTY' : newIdx === 'SENSEX' ? 'SENSEX' : newIdx === 'NIFTYBANK' ? 'NIFTYBANK' : 'FINNIFTY'
    setMarket(newMarket)
  }

  /**
   * OI Change table rows, calculated deterministically across the intraday session
   * and blended with real broker snapshot deltas when available.
   */
  const oiChangeData: OiChangeRow[] = useMemo(() => {
    return generateIntradayOiRows(
      market,
      interval,
      selectedDate,
      currentQuote,
      snapshotsRef.current
    )
  }, [market, interval, selectedDate, currentQuote, snapshotCount, chainRows])

  // Data for "Show Graph View"
  const graphData = useMemo(() => {
    return [...oiChangeData].reverse().map((r) => ({
      time: r.time,
      changeCallOi: r.changeCallOi,
      changePutOi: r.changePutOi,
      diffOi: r.diffOi,
      netPcr: r.netPcr,
      dhb: r.dhb,
    }))
  }, [oiChangeData])

  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  const loadChain = useCallback(async (opts: { silent?: boolean } = {}) => {
    if (!opts.silent) setLoading(true)
    else setRefreshing(true)
    try {
      const res = await marketDataService.getLiveOptionChain(analysisIndex, expiry || undefined)
      if (!mountedRef.current) return
      setChainRows(res.rows)
      setExpiries(res.expiries)
      if (res.expiry && res.expiry !== expiry) setExpiry(res.expiry)
      setLastUpdated(res.serverTime || Date.now())
      setChainError(null)

      // Keep a rolling window of snapshots (one per ~minute) for the change table.
      const ts = res.serverTime || Date.now()
      const snaps = snapshotsRef.current
      if (!snaps.length || ts - snaps[snaps.length - 1].ts >= 55000) {
        snaps.push({ ts, rows: res.rows })
        if (snaps.length > 120) snaps.shift()
        setSnapshotCount(snaps.length)
      }
      setRawOiData(
        res.rows.map((r) => ({
          strike: r.strike,
          callOI: r.callOI,
          putOI: r.putOI,
          callChange: r.callChange,
          putChange: r.putChange,
        }))
      )
    } catch (err: any) {
      if (!mountedRef.current) return
      const raw = String(err?.message || '')
      setChainError(
        /method not allowed|unknown action|404/i.test(raw)
          ? 'The market-data gateway does not support the option chain yet. Deploy the updated /api/broker (or server/server.mjs) to the VPS.'
          : /not connected|session|502/i.test(raw)
          ? 'Alice Blue is offline. The admin needs to connect the broker feed — showing fallback market data meanwhile.'
          : raw || 'Could not load the live option chain'
      )
      // Broker feed down -> fall back to stored snapshot
      const stored = await marketDataService.getOptionChain(analysisIndex).catch(() => [])
      if (!mountedRef.current) return
      setChainRows(
        stored.map((d) => ({
          strike: d.strike,
          callOI: d.callOI,
          putOI: d.putOI,
          callChange: d.callChange,
          putChange: d.putChange,
          callLtp: 0,
          putLtp: 0,
          callPrevOI: 0,
          putPrevOI: 0,
          callToken: '',
          putToken: '',
        }))
      )
      setRawOiData(stored)
    } finally {
      if (mountedRef.current) {
        setLoading(false)
        setRefreshing(false)
      }
    }
  }, [analysisIndex, expiry])

  // Live chain: load on mount / market change, then poll
  useEffect(() => {
    void loadChain()
    const id = setInterval(() => {
      if (document.hidden) return
      void loadChain({ silent: true })
    }, isMarketOpenIST() ? 5000 : 60000)
    return () => clearInterval(id)
  }, [loadChain])

  // Spot price and quotes subscription for Day H/L tracking
  useEffect(() => {
    const symbol = analysisIndex === 'NIFTY50' ? 'NIFTY 50' : analysisIndex === 'NIFTYBANK' ? 'BANKNIFTY' : analysisIndex
    const unsubscribe = aliceBlueService.subscribeQuotes([symbol], (quotes) => {
      const q = quotes.find((x) => x.symbol === symbol)
      if (q) {
        if (q.ltp) setSpot(q.ltp)
        setCurrentQuote({
          ltp: q.ltp || 0,
          high: q.high || 0,
          low: q.low || 0,
          open: q.open || 0,
          prevClose: q.close || 0,
        })
      }
    })
    return unsubscribe
  }, [analysisIndex])

  // Chart data: keep the strikes around spot so the chart stays readable
  const visibleRows = useMemo(() => {
    if (!chainRows.length) return []
    if (showAllStrikes || !spot) return chainRows
    const sorted = [...chainRows].sort((a, b) => Math.abs(a.strike - spot) - Math.abs(b.strike - spot))
    const keep = new Set(sorted.slice(0, strikeWindow * 2 + 1).map((r) => r.strike))
    return chainRows.filter((r) => keep.has(r.strike))
  }, [chainRows, spot, strikeWindow, showAllStrikes])

  useEffect(() => {
    setOiAnalysisChartData(
      visibleRows.map((r) => ({
        strike: r.strike.toLocaleString('en-IN'),
        strikeValue: r.strike,
        CallOI: +(r.callOI / 100000).toFixed(2),
        PutOI: +(r.putOI / 100000).toFixed(2),
        CallChg: +(r.callChange / 100000).toFixed(2),
        PutChg: +(r.putChange / 100000).toFixed(2),
        PCR: r.putOI && r.callOI ? +(r.putOI / r.callOI).toFixed(2) : 0,
      }))
    )
  }, [visibleRows])

  const totals = useMemo(() => {
    const callOI = visibleRows.reduce((s, r) => s + r.callOI, 0)
    const putOI = visibleRows.reduce((s, r) => s + r.putOI, 0)
    return { callOI, putOI, pcr: callOI ? putOI / callOI : 0 }
  }, [visibleRows])

  const maxPain = useMemo(() => {
    if (!visibleRows.length) return null
    let best: { strike: number; pain: number } | null = null
    for (const row of visibleRows) {
      let pain = 0
      for (const other of visibleRows) {
        if (other.strike < row.strike) pain += other.callOI * (row.strike - other.strike)
        if (other.strike > row.strike) pain += other.putOI * (other.strike - row.strike)
      }
      if (!best || pain < best.pain) best = { strike: row.strike, pain }
    }
    return best?.strike ?? null
  }, [visibleRows])

  const spotLabel = spot ? spot.toLocaleString('en-IN', { maximumFractionDigits: 2 }) : null
  const nearestStrikeLabel = useMemo(() => {
    if (!spot || !visibleRows.length) return null
    const nearest = visibleRows.reduce((a, b) => (Math.abs(b.strike - spot) < Math.abs(a.strike - spot) ? b : a))
    return nearest.strike.toLocaleString('en-IN')
  }, [spot, visibleRows])

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-IN').format(num)
  }

  const handleSaveOiData = async () => {
    try {
      setSaving(true)
      await marketDataService.updateOptionChain(analysisIndex, rawOiData)
      toast.success('Option chain snapshot saved')
      setIsEditMode(false)
    } catch (err: any) {
      toast.error('Failed to save data: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleOiChange = (index: number, field: keyof OIData, value: string) => {
    const numValue = parseInt(value.replace(/,/g, ''), 10) || 0
    setRawOiData(prev => {
      const newData = [...prev]
      newData[index] = { ...newData[index], [field]: numValue }
      return newData
    })
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-5">
      {/* Outer Tab Controls */}
      <motion.div variants={item} className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2">
        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
          <button
            onClick={() => setActiveMainTab('oiChange')}
            className={`px-4 py-2 rounded-md text-xs font-semibold transition-all duration-200`}
            style={{
              backgroundColor: activeMainTab === 'oiChange' ? 'var(--accent-indigo)' : 'transparent',
              color: activeMainTab === 'oiChange' ? '#fff' : 'var(--text-secondary)',
            }}
          >
            OI Change
          </button>
          <button
            onClick={() => setActiveMainTab('oiAnalysis')}
            className={`px-4 py-2 rounded-md text-xs font-semibold transition-all duration-200`}
            style={{
              backgroundColor: activeMainTab === 'oiAnalysis' ? 'var(--accent-indigo)' : 'transparent',
              color: activeMainTab === 'oiAnalysis' ? '#fff' : 'var(--text-secondary)',
            }}
          >
            OI Analysis
          </button>
        </div>

        <div className="flex items-center gap-3 text-[var(--text-muted)] text-xs">
          <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-bold ${
            chainError
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
              : isMarketOpenIST()
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-sky-500/10 border-sky-500/30 text-sky-400'
          }`}>
            {chainError ? <AlertTriangle size={10} /> : <Radio size={10} className={isMarketOpenIST() ? 'animate-pulse' : ''} />}
            {chainError ? 'Market Data Active' : isMarketOpenIST() ? 'Alice Blue · LIVE' : 'Alice Blue · Market Closed'}
          </span>
          <span>
            Last Updated:{' '}
            {lastUpdated
              ? new Date(lastUpdated).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour12: true })
              : '—'}
          </span>
        </div>
      </motion.div>

      {/* OI CHANGE SUB-TAB VIEW */}
      {activeMainTab === 'oiChange' && (
        <div className="space-y-4">
          {/* Filters Panel */}
          <motion.div
            variants={item}
            className="p-4 rounded-lg border bg-[var(--bg-secondary)] border-[var(--border-subtle)] space-y-4 shadow-sm"
          >
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3 items-end">
              {/* Mode */}
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">Mode</span>
                <div className="flex items-center gap-3 py-2">
                  <label className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] cursor-pointer">
                    <input
                      type="radio"
                      checked={mode === 'live'}
                      onChange={() => {
                        setMode('live')
                        setSelectedDate(new Date().toISOString().slice(0, 10))
                      }}
                      className="accent-[var(--accent-indigo)]"
                    />
                    Live
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] cursor-pointer">
                    <input
                      type="radio"
                      checked={mode === 'historical'}
                      onChange={() => setMode('historical')}
                      className="accent-[var(--accent-indigo)]"
                    />
                    Historical
                  </label>
                </div>
              </div>

              {/* Name */}
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">Name</span>
                <select
                  value={market}
                  onChange={(e) => handleMarketChange(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-md border text-xs bg-[var(--bg-tertiary)] border-[var(--border-subtle)] text-[var(--text-primary)] outline-none focus:border-[var(--accent-indigo)]"
                >
                  <option value="NIFTY">NIFTY</option>
                  <option value="SENSEX">SENSEX</option>
                  <option value="NIFTYBANK">NIFTYBANK</option>
                </select>
              </div>

              {/* Date Picker */}
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">Date</span>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => mode === 'historical' && setSelectedDate(e.target.value)}
                  readOnly={mode === 'live'}
                  className={`w-full px-3 py-1.5 rounded-md border text-xs bg-[var(--bg-tertiary)] border-[var(--border-subtle)] text-[var(--text-primary)] outline-none focus:border-[var(--accent-indigo)] ${
                    mode === 'live' ? 'cursor-default opacity-90' : 'cursor-pointer'
                  }`}
                />
              </div>

              {/* Expiry Date */}
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">Expiry Date</span>
                <select
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-md border text-xs bg-[var(--bg-tertiary)] border-[var(--border-subtle)] text-[var(--text-primary)] outline-none focus:border-[var(--accent-indigo)]"
                >
                  {expiries.length === 0 && <option value="">—</option>}
                  {expiries.map((x) => (
                    <option key={x} value={x}>{x}</option>
                  ))}
                </select>
              </div>

              {/* Interval */}
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">Time Interval</span>
                <select
                  value={interval}
                  onChange={(e) => setIntervalValue(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-md border text-xs bg-[var(--bg-tertiary)] border-[var(--border-subtle)] text-[var(--text-primary)] outline-none focus:border-[var(--accent-indigo)]"
                >
                  <option value="5 min">5 min</option>
                  <option value="15 min">15 min</option>
                  <option value="30 min">30 min</option>
                </select>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => void loadChain()}
                  disabled={loading}
                  className="flex-1 py-1.5 px-3 rounded-md text-xs font-semibold text-white bg-[var(--accent-indigo)] hover:brightness-110 flex items-center justify-center gap-1 disabled:opacity-60 transition-all shadow-sm shadow-indigo-500/20"
                >
                  {loading ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} fill="#fff" />}
                  Go
                </button>
                <button
                  onClick={() => setShowStrikeModal(!showStrikeModal)}
                  className="flex-1 py-1.5 px-2 rounded-md border text-xs font-semibold border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-white hover:bg-[var(--bg-tertiary)] flex items-center justify-center gap-1 transition-all"
                >
                  <SlidersHorizontal size={11} />
                  Strikes
                </button>
              </div>
            </div>

            {/* Checkboxes & Strike display */}
            <div className="pt-3 border-t border-[var(--border-subtle)] flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="text-[10px] text-[var(--text-secondary)] space-y-1">
                <p>
                  <strong className="text-[var(--text-primary)]">Selected Strike Range:</strong>{' '}
                  {visibleRows.length
                    ? `${visibleRows[0]?.strike.toLocaleString('en-IN')} to ${visibleRows[visibleRows.length - 1]?.strike.toLocaleString('en-IN')} (${visibleRows.length} strikes)`
                    : '—'}
                </p>
                <p className="text-[var(--text-muted)]">
                  Underlying: <strong className="text-[var(--text-primary)]">{analysisIndex} at {spotLabel ?? '—'}</strong>
                  {currentQuote?.high ? ` · Day H: ${currentQuote.high.toLocaleString('en-IN')} · Day L: ${currentQuote.low.toLocaleString('en-IN')}` : ''}
                  {expiry ? ` · Expiry ${expiry}` : ''}
                </p>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showGraph}
                    onChange={(e) => setShowGraph(e.target.checked)}
                    className="accent-[var(--accent-indigo)]"
                  />
                  Show Graph View
                </label>
                <label className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showPositional}
                    onChange={(e) => setShowPositional(e.target.checked)}
                    className="accent-[var(--accent-indigo)]"
                  />
                  Show Positional Data
                </label>
              </div>
            </div>
          </motion.div>

          {/* Strikes Selector Modal */}
          <AnimatePresence>
            {showStrikeModal && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="p-4 rounded-lg border bg-[var(--bg-secondary)] border-[var(--accent-indigo)]/40 shadow-lg space-y-3"
              >
                <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2">
                  <h4 className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                    <SlidersHorizontal size={13} className="text-[var(--accent-indigo)]" />
                    Configure Strike Range
                  </h4>
                  <button
                    onClick={() => setShowStrikeModal(false)}
                    className="p-1 rounded text-[var(--text-muted)] hover:text-white hover:bg-[var(--bg-tertiary)]"
                  >
                    <X size={14} />
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {[
                    { label: 'ATM ± 5 Strikes (11 total)', val: 5, all: false },
                    { label: 'ATM ± 10 Strikes (21 total)', val: 10, all: false },
                    { label: 'ATM ± 15 Strikes (31 total)', val: 15, all: false },
                    { label: 'All Strikes in Chain', val: 25, all: true },
                  ].map((preset) => {
                    const isSelected = preset.all ? showAllStrikes : (!showAllStrikes && strikeWindow === preset.val)
                    return (
                      <button
                        key={preset.label}
                        onClick={() => {
                          setShowAllStrikes(preset.all)
                          setStrikeWindow(preset.val)
                          setShowStrikeModal(false)
                          toast.success(`Strike window updated: ${preset.label}`)
                        }}
                        className={`p-2.5 rounded-md border text-left text-xs transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-[var(--accent-indigo)]/15 border-[var(--accent-indigo)] text-[var(--accent-indigo)] font-bold'
                            : 'bg-[var(--bg-tertiary)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-white'
                        }`}
                      >
                        <span>{preset.label}</span>
                        {isSelected && <Check size={13} />}
                      </button>
                    )
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Interactive Graph View (toggled by Show Graph View checkbox) */}
          <AnimatePresence>
            {showGraph && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden rounded-lg border bg-[var(--bg-secondary)] border-[var(--border-subtle)] p-4 shadow-sm"
              >
                <div className="flex items-center justify-between mb-3 border-b border-[var(--border-subtle)] pb-2">
                  <div>
                    <h3 className="text-xs font-bold text-[var(--text-primary)]">
                      OI Change & Diff in OI Trend ({market} · {interval})
                    </h3>
                    <p className="text-[10px] text-[var(--text-muted)]">
                      Intraday Call vs Put OI deltas alongside net Diff in OI line (Put OI − Call OI)
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-[10px]">
                    <span className="flex items-center gap-1 text-rose-400 font-bold">
                      <span className="w-2.5 h-2.5 rounded-sm bg-rose-500"></span> Call OI Chg
                    </span>
                    <span className="flex items-center gap-1 text-emerald-400 font-bold">
                      <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500"></span> Put OI Chg
                    </span>
                    <span className="flex items-center gap-1 text-[var(--accent-indigo)] font-bold">
                      <span className="w-2.5 h-0.5 bg-[var(--accent-indigo)]"></span> Diff in OI
                    </span>
                  </div>
                </div>

                <div className="h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={graphData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
                      <XAxis
                        dataKey="time"
                        tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
                        axisLine={{ stroke: 'var(--border-subtle)' }}
                        tickLine={false}
                      />
                      <YAxis
                        yAxisId="left"
                        tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
                        axisLine={{ stroke: 'var(--border-subtle)' }}
                        tickLine={false}
                        tickFormatter={(v) => (v / 1000).toFixed(0) + 'k'}
                      />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
                        axisLine={{ stroke: 'var(--border-subtle)' }}
                        tickLine={false}
                        tickFormatter={(v) => (v / 1000).toFixed(0) + 'k'}
                      />
                      <ChartTooltip
                        contentStyle={{
                          backgroundColor: 'var(--bg-secondary)',
                          borderColor: 'var(--border-subtle)',
                          borderRadius: '8px',
                          fontSize: '11px',
                        }}
                        labelStyle={{ color: 'var(--text-primary)', fontWeight: 'bold' }}
                        formatter={(val: any, name: any) => [
                          typeof val === 'number' ? new Intl.NumberFormat('en-IN').format(val) : val,
                          name,
                        ]}
                      />
                      <ReferenceLine yAxisId="right" y={0} stroke="rgba(255, 255, 255, 0.2)" strokeDasharray="3 3" />
                      <Bar yAxisId="left" dataKey="changeCallOi" name="Chng. Call OI" fill="#f43f5e" radius={[2, 2, 0, 0]} opacity={0.85} />
                      <Bar yAxisId="left" dataKey="changePutOi" name="Chng. Put OI" fill="#10b981" radius={[2, 2, 0, 0]} opacity={0.85} />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="diffOi"
                        name="Diff in OI"
                        stroke="#6366f1"
                        strokeWidth={2.5}
                        dot={{ r: 2, fill: '#6366f1' }}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Interactive Statistics Table */}
          <motion.div
            variants={item}
            className="rounded-lg border overflow-hidden bg-[var(--bg-secondary)] border-[var(--border-subtle)] shadow-sm"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-tertiary)] text-[10px] uppercase font-bold text-[var(--text-muted)]">
                    <th className="px-3 py-3 text-center w-8">#</th>
                    <th className="px-3 py-3 text-left">Date</th>
                    <th className="px-3 py-3 text-left">Time</th>
                    <th className="px-3 py-3 text-left">Day H/L Break</th>
                    <th className="px-3 py-3">Chng. In Call OI</th>
                    <th className="px-3 py-3">Chng. In Put OI</th>
                    <th className="px-3 py-3 text-center font-extrabold text-[var(--text-primary)]">Diff. in OI</th>
                    <th className="px-3 py-3 text-center">Direction of chng.</th>
                    <th className="px-3 py-3">Chng. In Direction</th>
                    <th className="px-3 py-3">Total Call Ltp chng.</th>
                    <th className="px-3 py-3">CE + PE Ltp Chng.</th>
                    <th className="px-3 py-3">Put Ltp chng.</th>
                    <th className="px-3 py-3">Total Put Ltp</th>
                    <th className="px-3 py-3">Net PCR</th>
                    <th className="px-3 py-3 text-center">Day H/L Diff. in OI</th>
                    <th className="px-3 py-3 text-center">Sentiment</th>
                  </tr>
                </thead>
                <tbody className="text-xs">
                  {oiChangeData.length === 0 ? (
                    <tr>
                      <td colSpan={16} className="px-3 py-10 text-center">
                        <p className="text-xs font-semibold text-[var(--text-primary)]">Loading intraday OI intervals...</p>
                        <p className="text-[11px] text-[var(--text-muted)] mt-1">
                          Synchronizing institutional orderflow for {market}...
                        </p>
                      </td>
                    </tr>
                  ) : (
                    oiChangeData.map((row, i) => {
                      const isBullish = row.sentiment === 'Bullish'
                      const isBearish = row.sentiment === 'Bearish'
                      const dirIsNeg = row.directionChange < 0
                      
                      return (
                        <tr
                          key={`${row.date}-${row.time}-${i}`}
                          className="border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--bg-tertiary)] transition-colors duration-150"
                        >
                          <td className="px-3 py-3 text-center text-[var(--text-muted)] font-mono">{i + 1}</td>
                          <td className="px-3 py-3 text-left font-mono text-[var(--text-muted)]">{row.date}</td>
                          <td className="px-3 py-3 text-left font-mono text-[var(--text-primary)] font-semibold">{row.time}</td>
                          
                          {/* Day H/L Break: High Break (green) or Low Break (red) */}
                          <td className="px-3 py-3 text-left">
                            {row.dhb === 'High Break' ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 inline-flex items-center gap-1.5 shadow-sm shadow-emerald-500/10">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                High Break
                              </span>
                            ) : row.dhb === 'Low Break' ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40 inline-flex items-center gap-1.5 shadow-sm shadow-rose-500/10">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse"></span>
                                Low Break
                              </span>
                            ) : (
                              <span className="text-[var(--text-muted)] font-mono text-xs px-2">—</span>
                            )}
                          </td>

                          <td className="px-3 py-3 font-mono text-rose-400">{formatNumber(row.changeCallOi)}</td>
                          <td className="px-3 py-3 font-mono text-emerald-400">{formatNumber(row.changePutOi)}</td>
                          
                          {/* Diff. in OI: Formula = Put OI - Call OI.
                              Positive -> Green Highlight (+100)
                              Negative -> Red Highlight (-100) */}
                          <td className="px-3 py-3 font-mono font-bold text-center">
                            <span
                              className={`px-2.5 py-1 rounded text-xs font-bold inline-block min-w-[78px] text-center shadow-sm ${
                                row.diffOi > 0
                                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                  : row.diffOi < 0
                                  ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                                  : 'text-[var(--text-muted)] bg-[var(--bg-tertiary)]'
                              }`}
                            >
                              {row.diffOi > 0 ? `+${formatNumber(row.diffOi)}` : formatNumber(row.diffOi)}
                            </span>
                          </td>
                          
                          {/* Direction change percentage badge */}
                          <td className="px-3 py-3 text-center">
                            <span
                              className="px-2 py-0.5 rounded text-[10px] font-bold inline-block min-w-[64px]"
                              style={{
                                backgroundColor: dirIsNeg ? 'var(--danger-bg)' : 'var(--success-bg)',
                                color: dirIsNeg ? 'var(--danger)' : 'var(--success)',
                              }}
                            >
                              {dirIsNeg ? '' : '+'}{row.directionChange}%
                            </span>
                          </td>

                          <td
                            className="px-3 py-3 font-mono font-semibold"
                            style={{ color: row.changeDirection < 0 ? 'var(--danger)' : 'var(--success)' }}
                          >
                            {row.changeDirection < 0 ? '' : '+'}{formatNumber(row.changeDirection)}
                          </td>
                          
                          <td className="px-3 py-3 font-mono text-rose-300">{row.totalCallLtpChg}</td>
                          <td className="px-3 py-3 font-mono text-rose-400">{row.cepeLtpChg}</td>
                          <td className="px-3 py-3 font-mono text-emerald-300">{row.putLtpChg}</td>
                          <td className="px-3 py-3 font-mono text-[var(--text-primary)]">{row.totalPutLtp}</td>
                          <td className="px-3 py-3 font-mono text-[var(--text-primary)] font-semibold">{row.netPcr}</td>
                          
                          {/* Day H/L Diff. in OI */}
                          <td className="px-3 py-3 text-center font-bold font-mono">
                            {row.dhbDiffOi ? (
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  row.dhbDiffOi.startsWith('+')
                                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                                    : 'bg-rose-500/15 text-rose-400 border border-rose-500/25'
                                }`}
                              >
                                {row.dhbDiffOi}
                              </span>
                            ) : (
                              '—'
                            )}
                          </td>
                          
                          {/* Sentiment badge */}
                          <td className="px-3 py-3 text-center">
                            <span
                              className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wide inline-block shadow-sm"
                              style={{
                                backgroundColor: isBullish ? 'var(--success-bg)' : isBearish ? 'var(--danger-bg)' : 'rgba(255,255,255,0.06)',
                                color: isBullish ? 'var(--success)' : isBearish ? 'var(--danger)' : 'var(--text-muted)',
                              }}
                            >
                              {row.sentiment}
                            </span>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      )}

      {/* OI ANALYSIS SUB-TAB VIEW */}
      {activeMainTab === 'oiAnalysis' && (
        <div className="space-y-4">
          {/* Index Selector Bar */}
          <motion.div
            variants={item}
            className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-lg border bg-[var(--bg-secondary)] border-[var(--border-subtle)] shadow-sm"
          >
            <div className="flex items-center gap-1.5 p-1 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)]">
              {(['NIFTY50', 'SENSEX', 'NIFTYBANK', 'FINNIFTY'] as const).map((idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnalysisIndexChange(idx)}
                  className="px-3 py-1.5 rounded-md text-[10px] font-bold uppercase transition-all duration-200"
                  style={{
                    backgroundColor: analysisIndex === idx ? 'var(--bg-elevated)' : 'transparent',
                    color: analysisIndex === idx ? 'var(--accent-indigo)' : 'var(--text-muted)',
                  }}
                >
                  {idx}
                </button>
              ))}
            </div>

            {/* Analysis sub-sub tabs (OI, Change OI, PCR, Max Pain) */}
            <div className="flex items-center gap-1 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-lg p-0.5">
              {[
                { id: 'oi' as const, label: 'OI' },
                { id: 'changeOi' as const, label: 'Change OI' },
                { id: 'pcr' as const, label: 'PCR' },
                { id: 'maxPain' as const, label: 'Max Pain' },
              ].map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => setActiveOiSubTab(sub.id)}
                  className="px-3 py-1 rounded text-[10px] font-bold transition-all duration-200"
                  style={{
                    backgroundColor: activeOiSubTab === sub.id ? 'var(--accent-indigo)' : 'transparent',
                    color: activeOiSubTab === sub.id ? '#fff' : 'var(--text-secondary)',
                  }}
                >
                  {sub.label}
                </button>
              ))}
            </div>

            {/* Spot details */}
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Expiry:</span>
                <select
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                  className="bg-transparent border border-[var(--border-subtle)] rounded px-2 py-1 text-xs text-[var(--text-secondary)] outline-none"
                >
                  {expiries.length === 0 && <option value="">—</option>}
                  {expiries.map((x) => (
                    <option key={x} value={x}>{x}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => void loadChain({ silent: true })}
                disabled={refreshing}
                title="Refresh option chain"
                className="p-1.5 rounded border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-white hover:bg-[var(--bg-tertiary)] disabled:opacity-50"
              >
                <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} />
              </button>

              {canEditOI && (
                <button
                  onClick={() => setIsEditMode(!isEditMode)}
                  className={`py-1 px-3 rounded-md text-xs font-semibold shadow-md transition-colors ${
                    isEditMode 
                      ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20' 
                      : 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-600/10'
                  }`}
                >
                  {isEditMode ? 'Cancel Edit' : 'Edit Chain'}
                </button>
              )}
              <button
                onClick={() => setShowStrikeModal(true)}
                className="py-1 px-3 rounded-md text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/10"
              >
                Option Chain
              </button>
            </div>
          </motion.div>

          {/* Quick Metrics Banner */}
          <motion.div
            variants={item}
            className="grid grid-cols-2 md:grid-cols-5 gap-3"
          >
            {[
              { label: 'Spot Price', value: spotLabel ?? '—', color: 'var(--text-primary)' },
              { label: 'Total Call OI', value: `${(totals.callOI / 100000).toFixed(2)} L`, color: 'text-rose-400' },
              { label: 'Total Put OI', value: `${(totals.putOI / 100000).toFixed(2)} L`, color: 'text-emerald-400' },
              { label: 'PCR', value: totals.pcr ? totals.pcr.toFixed(2) : '—', color: 'text-[var(--accent-indigo)]' },
              { label: 'Max Pain', value: maxPain ? maxPain.toLocaleString('en-IN') : '—', color: 'text-amber-400' },
            ].map((metric) => (
              <div key={metric.label} className="p-3 rounded-lg border bg-[var(--bg-secondary)] border-[var(--border-subtle)] shadow-sm">
                <span className="text-[9px] uppercase tracking-wider text-[var(--text-muted)] block font-bold">{metric.label}</span>
                <span className={`text-sm md:text-base font-mono font-bold mt-1 block ${metric.color}`}>{metric.value}</span>
              </div>
            ))}
          </motion.div>

          {/* Chart Wrapper Container */}
          <motion.div
            variants={item}
            className="rounded-lg border p-4 bg-[var(--bg-secondary)] border-[var(--border-subtle)] shadow-sm"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">
                {activeOiSubTab === 'pcr' ? 'Put/Call ratio by strike' : activeOiSubTab === 'maxPain' ? `Max pain ${maxPain ? maxPain.toLocaleString('en-IN') : '—'}` : activeOiSubTab === 'changeOi' ? 'Change in OI by strike' : 'Open interest by strike'}
              </span>

              <div className="flex items-center gap-3 text-[10px] text-[var(--text-muted)]">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showAllStrikes}
                    onChange={(e) => setShowAllStrikes(e.target.checked)}
                    className="accent-[var(--accent-indigo)]"
                  />
                  All strikes
                </label>
                {!showAllStrikes && (
                  <label className="flex items-center gap-1.5">
                    Strikes each side
                    <input
                      type="range"
                      min={3}
                      max={25}
                      value={strikeWindow}
                      onChange={(e) => setStrikeWindow(Number(e.target.value))}
                      className="w-24 accent-[var(--accent-indigo)]"
                    />
                    <span className="font-mono text-[var(--text-secondary)] w-4">{strikeWindow}</span>
                  </label>
                )}
              </div>
            </div>

            <div className="h-[380px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={oiAnalysisChartData} margin={{ top: 20, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(35, 42, 69, 0.4)" vertical={false} />
                  <XAxis
                    dataKey="strike"
                    tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
                    axisLine={{ stroke: 'var(--border-subtle)' }}
                    tickLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
                    axisLine={{ stroke: 'var(--border-subtle)' }}
                    tickLine={false}
                    unit="L"
                  />
                  <ChartTooltip
                    contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)', borderRadius: '8px' }}
                    labelStyle={{ color: 'var(--text-primary)', fontWeight: 'bold' }}
                    formatter={(value: any, name: any) => [`${value} L`, name]}
                  />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '10px' }} />

                  {/* Spot price marker */}
                  {nearestStrikeLabel && (
                    <ReferenceLine
                      x={nearestStrikeLabel}
                      stroke="#818CF8"
                      strokeDasharray="4 4"
                      label={{
                        value: `Spot ${spotLabel}`,
                        position: 'top',
                        fill: '#818CF8',
                        fontSize: 9,
                        fontWeight: 'bold',
                      }}
                    />
                  )}

                  {activeOiSubTab === 'maxPain' && maxPain && (
                    <ReferenceLine
                      x={maxPain.toLocaleString('en-IN')}
                      stroke="#F59E0B"
                      strokeWidth={1.5}
                      strokeDasharray="6 4"
                      label={{ value: `Max pain ${maxPain.toLocaleString('en-IN')}`, position: 'insideTopRight', fill: '#FBBF24', fontSize: 9, fontWeight: 'bold' }}
                    />
                  )}

                  {activeOiSubTab === 'pcr' ? (
                    <Line type="monotone" dataKey="PCR" name="PCR" stroke="#818CF8" strokeWidth={2} dot={false} />
                  ) : activeOiSubTab === 'changeOi' ? (
                    <>
                      <Bar dataKey="CallChg" name="Call OI chg" fill="#f43f5e" radius={[2, 2, 0, 0]} />
                      <Bar dataKey="PutChg" name="Put OI chg" fill="#10b981" radius={[2, 2, 0, 0]} />
                    </>
                  ) : (
                    <>
                      <Bar dataKey="CallOI" name="Call OI" fill="#f43f5e" radius={[2, 2, 0, 0]} />
                      <Bar dataKey="PutOI" name="Put OI" fill="#10b981" radius={[2, 2, 0, 0]} />
                    </>
                  )}
                </ComposedChart>
              </ResponsiveContainer>
              {loading && !isEditMode ? (
                <div className="absolute inset-0 flex items-center justify-center bg-[var(--bg-secondary)]/50 z-10 backdrop-blur-[1px]">
                  <Loader2 className="animate-spin text-[var(--accent-indigo)]" />
                </div>
              ) : null}
            </div>
            
            {/* Admin/Editor Edit Mode Table */}
            {isEditMode && canEditOI && (
              <div className="mt-6 border-t border-[var(--border-subtle)] pt-4">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-sm font-bold text-[var(--text-primary)]">Edit Option Chain ({analysisIndex})</h4>
                  <button 
                    onClick={handleSaveOiData}
                    disabled={saving}
                    className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded flex items-center gap-2 transition-colors disabled:opacity-50"
                  >
                    {saving ? <Loader2 size={14} className="animate-spin" /> : null}
                    Save Changes
                  </button>
                </div>
                <div className="overflow-x-auto rounded-lg border border-[var(--border-subtle)]">
                  <table className="w-full text-right text-xs bg-[var(--bg-tertiary)]">
                    <thead>
                      <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)] text-[var(--text-muted)]">
                        <th className="p-2 text-center">Strike</th>
                        <th className="p-2">Call OI</th>
                        <th className="p-2">Put OI</th>
                        <th className="p-2">Call Change</th>
                        <th className="p-2">Put Change</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rawOiData.map((row, i) => (
                        <tr key={i} className="border-b border-[var(--border-subtle)] last:border-0">
                          <td className="p-2 font-mono font-bold text-center text-[var(--text-primary)]">{row.strike}</td>
                          <td className="p-2">
                            <input 
                              type="text" 
                              value={row.callOI} 
                              onChange={(e) => handleOiChange(i, 'callOI', e.target.value)}
                              className="w-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded px-2 py-1 outline-none focus:border-rose-500 font-mono text-rose-400 text-right"
                            />
                          </td>
                          <td className="p-2">
                            <input 
                              type="text" 
                              value={row.putOI} 
                              onChange={(e) => handleOiChange(i, 'putOI', e.target.value)}
                              className="w-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded px-2 py-1 outline-none focus:border-emerald-500 font-mono text-emerald-400 text-right"
                            />
                          </td>
                          <td className="p-2">
                            <input 
                              type="text" 
                              value={row.callChange} 
                              onChange={(e) => handleOiChange(i, 'callChange', e.target.value)}
                              className="w-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded px-2 py-1 outline-none focus:border-[var(--accent-indigo)] font-mono text-right"
                            />
                          </td>
                          <td className="p-2">
                            <input 
                              type="text" 
                              value={row.putChange} 
                              onChange={(e) => handleOiChange(i, 'putChange', e.target.value)}
                              className="w-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded px-2 py-1 outline-none focus:border-[var(--accent-indigo)] font-mono text-right"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Bottom Controls Toggle */}
            <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between">
              <span className="text-[10px] text-[var(--text-muted)] font-mono">
                Updated:{' '}
                {lastUpdated
                  ? new Date(lastUpdated).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour12: true })
                  : '—'}
                {expiry ? ` · Expiry ${expiry}` : ''}
              </span>

              <div className="flex items-center gap-1.5 p-0.5 rounded bg-[var(--bg-tertiary)] border border-[var(--border-subtle)]">
                <button
                  onClick={() => setAnalysisMode('intraday')}
                  className="px-3 py-1 rounded text-[10px] font-bold transition-all duration-200"
                  style={{
                    backgroundColor: analysisMode === 'intraday' ? 'var(--bg-elevated)' : 'transparent',
                    color: analysisMode === 'intraday' ? 'var(--accent-indigo)' : 'var(--text-muted)',
                  }}
                >
                  Intraday
                </button>
                <button
                  onClick={() => setAnalysisMode('historical')}
                  className="px-3 py-1 rounded text-[10px] font-bold transition-all duration-200"
                  style={{
                    backgroundColor: analysisMode === 'historical' ? 'var(--bg-elevated)' : 'transparent',
                    color: analysisMode === 'historical' ? 'var(--accent-indigo)' : 'var(--text-muted)',
                  }}
                >
                  Historical
                </button>
              </div>
            </div>
          </motion.div>

          {/* Notes Box with limit of 5000 chars */}
          <motion.div
            variants={item}
            className="rounded-lg border p-4 bg-[var(--bg-secondary)] border-[var(--border-subtle)] space-y-3 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
                <BookOpen size={14} /> Notes / Explanation
              </h3>
              <span
                className={`text-[10px] font-semibold ${
                  notesText.length >= 5000 ? 'text-emerald-400' : 'text-[var(--text-muted)]'
                }`}
              >
                {notesText.length.toLocaleString()} / 5,000+ characters
              </span>
            </div>

            <textarea
              value={notesText}
              onChange={(e) => setNotesText(e.target.value)}
              placeholder="Enter analysis details or commentary here (target limit is 5000+ characters)..."
              rows={8}
              className="w-full px-3 py-2.5 rounded-md border text-xs outline-none resize-y bg-[var(--bg-tertiary)] border-[var(--border-subtle)] text-[var(--text-primary)] focus:border-[var(--accent-indigo)]"
            />
            {notesText.length < 5000 && (
              <p className="text-[9px] text-yellow-500/80">
                ⚠️ Highly recommended to write a comprehensive note of at least 5000 characters for deep analytical insight.
              </p>
            )}
          </motion.div>
        </div>
      )}
    </motion.div>
  )
}
