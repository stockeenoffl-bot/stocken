import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  BookOpen,
  Loader2,
  Play
} from 'lucide-react'
import { marketDataService } from '@/services/marketDataService'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
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
  const [interval, setInterval] = useState('5 min')
  const [showGraph, setShowGraph] = useState(false)
  const [showPositional, setShowPositional] = useState(false)

  // OI Analysis States
  const [analysisIndex, setAnalysisIndex] = useState<'NIFTY50' | 'SENSEX' | 'NIFTYBANK' | 'FINNIFTY'>('NIFTY50')
  const [activeOiSubTab, setActiveOiSubTab] = useState<OiSubTab>('oi')
  const [analysisMode, setAnalysisMode] = useState<'intraday' | 'historical'>('intraday')
  const [notesText, setNotesText] = useState('')

  // Mock Data for OI Change Table
  const oiChangeData: OiChangeRow[] = [
    { date: '17-02-2025', time: '11:13:00', dhb: null, changeCallOi: 10336050, changePutOi: 16314675, diffOi: 5978625, directionChange: -24.53, changeDirection: -1943700, totalCallLtpChg: 3217.6, cepeLtpChg: -1031.95, putLtpChg: -359.1, totalPutLtp: 2465.25, netPcr: 1.58, dhbDiffOi: null, sentiment: 'Bullish' },
    { date: '17-02-2025', time: '11:10:00', dhb: null, changeCallOi: 10246275, changePutOi: 18168600, diffOi: 7922325, directionChange: -22.21, changeDirection: -2261550, totalCallLtpChg: 3488.2, cepeLtpChg: -761.35, putLtpChg: -325.25, totalPutLtp: 2228.5, netPcr: 1.77, dhbDiffOi: null, sentiment: 'Bullish' },
    { date: '17-02-2025', time: '11:05:00', dhb: null, changeCallOi: 9413700, changePutOi: 19597575, diffOi: 10183875, directionChange: -3.86, changeDirection: -409050, totalCallLtpChg: 3757.9, cepeLtpChg: -491.65, putLtpChg: -182.15, totalPutLtp: 2101.9, netPcr: 2.08, dhbDiffOi: null, sentiment: 'Bullish' },
    { date: '17-02-2025', time: '11:00:00', dhb: null, changeCallOi: 9128475, changePutOi: 19721400, diffOi: 10592925, directionChange: 3.98, changeDirection: 405375, totalCallLtpChg: 3883.25, cepeLtpChg: -366.3, putLtpChg: -153.95, totalPutLtp: 2004.75, netPcr: 2.16, dhbDiffOi: 'D.H.B.', sentiment: 'Bullish' },
    { date: '17-02-2025', time: '10:55:00', dhb: null, changeCallOi: 9436275, changePutOi: 19623825, diffOi: 10187550, directionChange: 10.93, changeDirection: 1004175, totalCallLtpChg: 4228.4, cepeLtpChg: -21.15, putLtpChg: 8.3, totalPutLtp: 1821.85, netPcr: 2.08, dhbDiffOi: 'D.H.B.', sentiment: 'Bullish' },
    { date: '17-02-2025', time: '10:50:00', dhb: 'D.H.B. (22916.15)', changeCallOi: 9512625, changePutOi: 18696000, diffOi: 9183375, directionChange: 29.24, changeDirection: 2077425, totalCallLtpChg: 4158.2, cepeLtpChg: -91.35, putLtpChg: -35.25, totalPutLtp: 1848.5, netPcr: 1.97, dhbDiffOi: 'D.H.B.', sentiment: 'Bullish' },
    { date: '17-02-2025', time: '10:45:00', dhb: 'D.H.B. (22907.25)', changeCallOi: 10109025, changePutOi: 17214975, diffOi: 7105950, directionChange: 14.73, changeDirection: 912075, totalCallLtpChg: 4277.75, cepeLtpChg: 28.2, putLtpChg: 5.65, totalPutLtp: 1769.85, netPcr: 1.70, dhbDiffOi: 'D.H.B.', sentiment: 'Bullish' },
    { date: '17-02-2025', time: '10:40:00', dhb: 'D.H.B. (22874.75)', changeCallOi: 10075575, changePutOi: 16269450, diffOi: 6193875, directionChange: 2606.82, changeDirection: 5965050, totalCallLtpChg: 3913.55, cepeLtpChg: -336.0, putLtpChg: -178.9, totalPutLtp: 1949.5, netPcr: 1.61, dhbDiffOi: 'D.H.B.', sentiment: 'Bullish' }
  ]

  const [oiAnalysisChartData, setOiAnalysisChartData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchOiData() {
      try {
        setLoading(true)
        const data = await marketDataService.getOptionChain(analysisIndex)
        
        // Format for Recharts
        const chartData = data.map(d => ({
          strike: d.strike.toLocaleString('en-IN'),
          CallOI: d.callOI / 100000, // Convert to Lakhs for chart visibility
          PutOI: d.putOI / 100000,
        }))
        
        setOiAnalysisChartData(chartData)
      } catch (err) {
        console.error('Failed to fetch OI data', err)
      } finally {
        setLoading(false)
      }
    }
    
    if (activeMainTab === 'oiAnalysis') {
      fetchOiData()
    }
  }, [analysisIndex, activeMainTab])

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-IN').format(num)
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

        <div className="flex items-center gap-2 text-[var(--text-muted)] text-xs">
          <span>Last Updated: 29 Apr 2025, 11:15 AM</span>
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
                  defaultValue="2025-02-17"
                  className="w-full px-3 py-1.5 rounded-md border text-xs bg-[var(--bg-tertiary)] border-[var(--border-subtle)] text-[var(--text-primary)] outline-none focus:border-[var(--accent-indigo)]"
                />
              </div>

              {/* Expiry Date */}
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">Expiry Date</span>
                <select
                  defaultValue="20-Feb-2025"
                  className="w-full px-3 py-1.5 rounded-md border text-xs bg-[var(--bg-tertiary)] border-[var(--border-subtle)] text-[var(--text-primary)] outline-none focus:border-[var(--accent-indigo)]"
                >
                  <option value="20-Feb-2025">20-Feb-2025</option>
                  <option value="27-Feb-2025">27-Feb-2025</option>
                  <option value="06-Mar-2025">06-Mar-2025</option>
                </select>
              </div>

              {/* Interval */}
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">Time Interval</span>
                <select
                  value={interval}
                  onChange={(e) => setInterval(e.target.value)}
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
                  className="flex-1 py-1.5 px-3 rounded-md text-xs font-semibold text-white bg-[var(--accent-indigo)] hover:brightness-110 flex items-center justify-center gap-1"
                >
                  <Play size={12} fill="#fff" />
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
                  <strong className="text-[var(--text-primary)]">Selected Strike Prices:</strong> 22450, 22500, 22550, 22600, 22650, 22700, 22750, 22800, 22850, 22900, 22950, 23000, 23050, 23100, 23150
                </p>
                <p className="text-[var(--text-muted)]">
                  Underlying: <strong className="text-[var(--text-primary)]">NIFTY 50 at 22806.35</strong>, Chg: <span className="text-rose-400 font-bold">-122.90 (-0.54%)</span> as on 17 Feb 2025, 11:14:00 IST
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
                <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Date:</span>
                <select className="bg-transparent border border-[var(--border-subtle)] rounded px-2 py-1 text-xs text-[var(--text-secondary)] outline-none">
                  <option value="07 Jul 2026">07 Jul 2026</option>
                  <option value="14 Jul 2026">14 Jul 2026</option>
                </select>
              </div>

              <button
                className="py-1 px-3 rounded-md text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 shadow-md shadow-purple-600/10"
              >
                Option Chain
              </button>
            </div>
          </motion.div>

          {/* Quick Metrics Banner */}
          <motion.div
            variants={item}
            className="grid grid-cols-3 gap-4"
          >
            {[
              { label: 'Spot Price', value: '24,125.45', color: 'var(--text-primary)' },
              { label: 'Total Calls', value: '1,394.40 L', color: 'text-rose-400' },
              { label: 'Total Puts', value: '1,545.34 L', color: 'text-emerald-400' },
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
            <div className="h-[380px] w-full mt-2 relative">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={oiAnalysisChartData} margin={{ top: 20, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(35, 42, 69, 0.4)" vertical={false} />
                  <XAxis
                    dataKey="strike"
                    tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
                    axisLine={{ stroke: 'var(--border-subtle)' }}
                    tickLine={false}
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
                  />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '10px' }} />
                  
                  {/* Spot Price vertical marker line */}
                  <ReferenceLine
                    x="24,100"
                    stroke="#818CF8"
                    strokeDasharray="4 4"
                    label={{
                      value: 'Spot Price: 24,125.45',
                      position: 'top',
                      fill: '#818CF8',
                      fontSize: 9,
                      fontWeight: 'bold',
                    }}
                  />
                  
                  <Bar
                    dataKey="CallOI"
                    name="Call OI"
                    fill="#06B6D4" // Cyan/Teal
                    radius={[2, 2, 0, 0]}
                  />
                  <Bar
                    dataKey="PutOI"
                    name="Put OI"
                    fill="#F97316" // Orange/Red
                    radius={[2, 2, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
              {loading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-[var(--bg-secondary)]/50 z-10 backdrop-blur-[1px]">
                  <Loader2 className="animate-spin text-[var(--accent-indigo)]" />
                </div>
              ) : null}
            </div>

            {/* Bottom Controls Toggle */}
            <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between">
              <span className="text-[10px] text-[var(--text-muted)] font-mono">
                Updated: Thu 02 Jul 2026 12:24:25 PM
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
