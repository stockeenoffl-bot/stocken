import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  BookOpen,
  Loader2,
  Play,
  Radio,
  RefreshCw,
  AlertTriangle,
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
  dhb: string | null
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

export default function OI() {
  const [activeMainTab, setActiveMainTab] = useState<MainTab>('oiChange')
  
  // OI Change States
  const [mode, setMode] = useState<'live' | 'historical'>('live')
  const [market, setMarket] = useState('NIFTY')
  const [interval, setIntervalValue] = useState('5 min')
  const [showGraph, setShowGraph] = useState(false)
  const [showPositional, setShowPositional] = useState(false)

  // OI Analysis States
  const [analysisIndex, setAnalysisIndex] = useState<'NIFTY50' | 'SENSEX' | 'NIFTYBANK' | 'FINNIFTY'>('NIFTY50')
  const [activeOiSubTab, setActiveOiSubTab] = useState<OiSubTab>('oi')
  const [analysisMode, setAnalysisMode] = useState<'intraday' | 'historical'>('intraday')
  const [notesText, setNotesText] = useState('')

  // Auth and Admin Edit Mode
  const { profile } = useAuth()
  const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin'
  const [isEditMode, setIsEditMode] = useState(false)
  const [rawOiData, setRawOiData] = useState<OIData[]>([])
  const [saving, setSaving] = useState(false)

  const [oiAnalysisChartData, setOiAnalysisChartData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [chainRows, setChainRows] = useState<OptionChainRow[]>([])
  const [expiries, setExpiries] = useState<string[]>([])
  const [expiry, setExpiry] = useState<string>('')
  const [spot, setSpot] = useState<number | null>(null)
  const [lastUpdated, setLastUpdated] = useState<number | null>(null)
  const [chainError, setChainError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [strikeWindow, setStrikeWindow] = useState(10)
  const [showAllStrikes, setShowAllStrikes] = useState(false)
  const mountedRef = useRef(true)
  // Rolling snapshots of the live chain -> powers the "OI Change" table.
  const snapshotsRef = useRef<Array<{ ts: number; rows: OptionChainRow[] }>>([])
  const [snapshotCount, setSnapshotCount] = useState(0)

  /**
   * OI Change table, derived from consecutive live snapshots of the chain.
   * Each row compares a snapshot with the one before it, so the numbers are
   * real broker deltas instead of the old hard-coded sample rows.
   */
  const oiChangeData: OiChangeRow[] = useMemo(() => {
    const snaps = snapshotsRef.current
    if (snaps.length < 2) return []
    const rows: OiChangeRow[] = []
    for (let i = snaps.length - 1; i > 0 && rows.length < 25; i--) {
      const cur = snaps[i]
      const prev = snaps[i - 1]
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
      const netPcr = callOI ? putOI / callOI : 0
      const d = new Date(cur.ts)
      rows.push({
        date: d.toLocaleDateString('en-GB', { timeZone: 'Asia/Kolkata' }).replace(/\//g, '-'),
        time: d.toLocaleTimeString('en-GB', { timeZone: 'Asia/Kolkata', hour12: false }),
        dhb: null,
        changeCallOi,
        changePutOi,
        diffOi,
        directionChange: changeCallOi ? +((diffOi / Math.abs(changeCallOi)) * 100).toFixed(2) : 0,
        changeDirection: diffOi,
        totalCallLtpChg: +totalCallLtpChg.toFixed(2),
        cepeLtpChg: +(totalCallLtpChg + putLtpChg).toFixed(2),
        putLtpChg: +putLtpChg.toFixed(2),
        totalPutLtp: +putOI.toFixed(2),
        netPcr: +netPcr.toFixed(2),
        dhbDiffOi: null,
        sentiment: diffOi > 0 ? 'Bullish' : diffOi < 0 ? 'Bearish' : 'Neutral',
      })
    }
    return rows
  }, [snapshotCount, chainRows])

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
          ? 'Alice Blue is offline. The admin needs to connect the broker feed — showing the last saved snapshot meanwhile.'
          : raw || 'Could not load the live option chain'
      )
      // Broker feed down -> fall back to the admin-maintained snapshot.
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

  // Live chain: load on mount / market change, then poll (fast while the market
  // is open so OI is never more than a few seconds behind the broker). Both tabs
  // share the same feed - the OI Change table is built from these snapshots.
  useEffect(() => {
    void loadChain()
    const id = setInterval(() => {
      if (document.hidden) return
      void loadChain({ silent: true })
    }, isMarketOpenIST() ? 5000 : 60000)
    return () => clearInterval(id)
  }, [loadChain])

  // Spot price for the reference line + metrics banner
  useEffect(() => {
    const symbol = analysisIndex === 'NIFTY50' ? 'NIFTY 50' : analysisIndex === 'NIFTYBANK' ? 'BANKNIFTY' : analysisIndex
    const unsubscribe = aliceBlueService.subscribeQuotes([symbol], (quotes) => {
      const q = quotes.find((x) => x.symbol === symbol)
      if (q?.ltp) setSpot(q.ltp)
    })
    return unsubscribe
  }, [analysisIndex])

  // Chart data: keep the strikes around spot so the chart stays readable, and
  // never re-order/re-fit while the user is reading it.
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
            {chainError ? 'Stored snapshot' : isMarketOpenIST() ? 'Alice Blue · LIVE' : 'Alice Blue · Market closed'}
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
            className="p-4 rounded-lg border bg-[var(--bg-secondary)] border-[var(--border-subtle)] space-y-4"
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
                      onChange={() => setMode('live')}
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
                  onChange={(e) => setMarket(e.target.value)}
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
                  value={new Date().toISOString().slice(0, 10)}
                  readOnly
                  className="w-full px-3 py-1.5 rounded-md border text-xs bg-[var(--bg-tertiary)] border-[var(--border-subtle)] text-[var(--text-primary)] outline-none focus:border-[var(--accent-indigo)]"
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
                  className="flex-1 py-1.5 px-3 rounded-md text-xs font-semibold text-white bg-[var(--accent-indigo)] hover:brightness-110 flex items-center justify-center gap-1 disabled:opacity-60"
                >
                  {loading ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} fill="#fff" />}
                  Go
                </button>
                <button
                  className="flex-1 py-1.5 px-2 rounded-md border text-xs font-semibold border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-white hover:bg-[var(--bg-tertiary)]"
                >
                  Strike Prices
                </button>
              </div>
            </div>

            {/* Checkboxes & Strike display */}
            <div className="pt-3 border-t border-[var(--border-subtle)] flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="text-[10px] text-[var(--text-secondary)] space-y-1">
                <p>
                  <strong className="text-[var(--text-primary)]">Selected Strike Prices:</strong>{' '}
                  {visibleRows.length
                    ? visibleRows.map((r) => r.strike.toLocaleString('en-IN')).join(', ')
                    : '—'}
                </p>
                <p className="text-[var(--text-muted)]">
                  Underlying: <strong className="text-[var(--text-primary)]">{analysisIndex} at {spotLabel ?? '—'}</strong>
                  {expiry ? ` · Expiry ${expiry}` : ''}
                  {lastUpdated
                    ? ` as on ${new Date(lastUpdated).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour12: true })} IST`
                    : ''}
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

          {/* Interactive Statistics Table */}
          <motion.div
            variants={item}
            className="rounded-lg border overflow-hidden bg-[var(--bg-secondary)] border-[var(--border-subtle)]"
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
                    <th className="px-3 py-3">Diff. in OI</th>
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
                  {oiChangeData.length === 0 && (
                    <tr>
                      <td colSpan={16} className="px-3 py-10 text-center">
                        <p className="text-xs font-semibold text-[var(--text-primary)]">Collecting live OI snapshots…</p>
                        <p className="text-[11px] text-[var(--text-muted)] mt-1">
                          {chainError
                            ? chainError
                            : 'The change table fills in automatically as new option-chain snapshots arrive (about once a minute).'}
                        </p>
                      </td>
                    </tr>
                  )}
                  {oiChangeData.map((row, i) => {
                    const isBullish = row.sentiment === 'Bullish'
                    const dirIsNeg = row.directionChange < 0
                    
                    return (
                      <tr
                        key={i}
                        className="border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--bg-tertiary)] transition-colors duration-150"
                      >
                        <td className="px-3 py-3 text-center text-[var(--text-muted)] font-mono">{i + 1}</td>
                        <td className="px-3 py-3 text-left font-mono text-[var(--text-muted)]">{row.date}</td>
                        <td className="px-3 py-3 text-left font-mono text-[var(--text-primary)] font-semibold">{row.time}</td>
                        <td className="px-3 py-3 text-left font-semibold text-emerald-400">
                          {row.dhb && (
                            <span className="px-2 py-0.5 rounded text-[9px] bg-emerald-500/10 border border-emerald-500/20">
                              {row.dhb}
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-3 font-mono text-rose-400">{formatNumber(row.changeCallOi)}</td>
                        <td className="px-3 py-3 font-mono text-emerald-400">{formatNumber(row.changePutOi)}</td>
                        <td className="px-3 py-3 font-mono text-emerald-500 font-bold">{formatNumber(row.diffOi)}</td>
                        
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

                        <td className="px-3 py-3 font-mono" style={{ color: row.changeDirection < 0 ? 'var(--danger)' : 'var(--success)' }}>
                          {row.changeDirection < 0 ? '' : '+'}{formatNumber(row.changeDirection)}
                        </td>
                        <td className="px-3 py-3 font-mono text-rose-300">{row.totalCallLtpChg}</td>
                        <td className="px-3 py-3 font-mono text-rose-400">{row.cepeLtpChg}</td>
                        <td className="px-3 py-3 font-mono text-emerald-300">{row.putLtpChg}</td>
                        <td className="px-3 py-3 font-mono text-[var(--text-primary)]">{row.totalPutLtp}</td>
                        <td className="px-3 py-3 font-mono text-[var(--text-primary)] font-semibold">{row.netPcr}</td>
                        <td className="px-3 py-3 text-center text-emerald-400 font-bold font-mono">
                          {row.dhbDiffOi ? (
                            <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-500/10 border border-emerald-500/20">
                              {row.dhbDiffOi}
                            </span>
                          ) : '—'}
                        </td>
                        
                        {/* Sentiment badge */}
                        <td className="px-3 py-3 text-center">
                          <span
                            className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wide inline-block"
                            style={{
                              backgroundColor: isBullish ? 'var(--success-bg)' : 'var(--danger-bg)',
                              color: isBullish ? 'var(--success)' : 'var(--danger)',
                            }}
                          >
                            {row.sentiment}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
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
            className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-lg border bg-[var(--bg-secondary)] border-[var(--border-subtle)]"
          >
            <div className="flex items-center gap-1.5 p-1 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)]">
              {(['NIFTY50', 'SENSEX', 'NIFTYBANK', 'FINNIFTY'] as const).map((idx) => (
                <button
                  key={idx}
                  onClick={() => setAnalysisIndex(idx)}
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

              {isAdmin && (
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
              <div key={metric.label} className="p-3 rounded-lg border bg-[var(--bg-secondary)] border-[var(--border-subtle)]">
                <span className="text-[9px] uppercase tracking-wider text-[var(--text-muted)] block font-bold">{metric.label}</span>
                <span className={`text-sm md:text-base font-mono font-bold mt-1 block ${metric.color}`}>{metric.value}</span>
              </div>
            ))}
          </motion.div>

          {/* Chart Wrapper Container */}
          <motion.div
            variants={item}
            className="rounded-lg border p-4 bg-[var(--bg-secondary)] border-[var(--border-subtle)]"
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
                    contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}
                    labelStyle={{ color: 'var(--text-primary)', fontWeight: 'bold' }}
                    formatter={(value: any, name: any) => [`${value} L`, name]}
                  />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '10px' }} />

                  {/* Spot price marker - anchored to the real nearest strike */}
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
                      <Bar dataKey="CallChg" name="Call OI chg" fill="#06B6D4" radius={[2, 2, 0, 0]} />
                      <Bar dataKey="PutChg" name="Put OI chg" fill="#F97316" radius={[2, 2, 0, 0]} />
                    </>
                  ) : (
                    <>
                      <Bar dataKey="CallOI" name="Call OI" fill="#06B6D4" radius={[2, 2, 0, 0]} />
                      <Bar dataKey="PutOI" name="Put OI" fill="#F97316" radius={[2, 2, 0, 0]} />
                    </>
                  )}
                </ComposedChart>
              </ResponsiveContainer>
              {loading && !isEditMode ? (
                <div className="absolute inset-0 flex items-center justify-center bg-[var(--bg-secondary)]/50 z-10 backdrop-blur-[1px]">
                  <Loader2 className="animate-spin text-[var(--accent-indigo)]" />
                </div>
              ) : null}
              {!loading && !oiAnalysisChartData.length ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center px-6">
                  <AlertTriangle className="text-amber-400" size={22} />
                  <p className="text-xs font-semibold text-[var(--text-primary)]">No option chain data</p>
                  <p className="text-[11px] text-[var(--text-muted)] max-w-sm">
                    {chainError || 'Alice Blue returned no strikes for this expiry.'}
                  </p>
                </div>
              ) : null}
            </div>
            
            {/* Admin Edit Mode Table */}
            {isEditMode && isAdmin && (
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
                              className="w-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded px-2 py-1 outline-none focus:border-cyan-500 font-mono text-cyan-400 text-right"
                            />
                          </td>
                          <td className="p-2">
                            <input 
                              type="text" 
                              value={row.putOI} 
                              onChange={(e) => handleOiChange(i, 'putOI', e.target.value)}
                              className="w-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded px-2 py-1 outline-none focus:border-orange-500 font-mono text-orange-400 text-right"
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
            className="rounded-lg border p-4 bg-[var(--bg-secondary)] border-[var(--border-subtle)] space-y-3"
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
