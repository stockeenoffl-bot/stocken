import { motion } from 'framer-motion'
import {
  FileText,
  Target,
  Trophy,
  TrendingUp,
  Search,
  Download,
  CheckCircle2,
  XCircle,
  MinusCircle,
  Building2,
} from 'lucide-react'
import PerformanceDonut from '@/components/PerformanceDonut'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
}

const pastAnalyses = [
  { date: '29 Apr 2025', bias: 'Bullish', bullish: '24,050 – 24,150', bearish: '24,420 – 24,520', result: 'Pending', movement: '—', accuracy: '—', icon: 'bull' },
  { date: '28 Apr 2025', bias: 'Bullish', bullish: '24,000 – 24,120', bearish: '24,380 – 24,480', result: 'Hit', movement: '+132.45 pts', accuracy: '87.5%', icon: 'bull' },
  { date: '25 Apr 2025', bias: 'Bearish', bullish: '23,950 – 24,050', bearish: '24,300 – 24,400', result: 'Hit', movement: '+156.20 pts', accuracy: '81.3%', icon: 'bear' },
  { date: '24 Apr 2025', bias: 'Bullish', bullish: '23,900 – 24,020', bearish: '24,250 – 24,350', result: 'Hit', movement: '+188.45 pts', accuracy: '94.2%', icon: 'bull' },
  { date: '23 Apr 2025', bias: 'Bullish', bullish: '23,800 – 23,950', bearish: '24,150 – 24,250', result: 'Miss', movement: '-38.60 pts', accuracy: '32.1%', icon: 'bull' },
  { date: '22 Apr 2025', bias: 'Neutral', bullish: '23,850 – 23,950', bearish: '24,100 – 24,180', result: 'Neutral', movement: '+12.30 pts', accuracy: '50.0%', icon: 'neutral' },
  { date: '21 Apr 2025', bias: 'Bearish', bullish: '23,700 – 23,850', bearish: '23,980 – 24,080', result: 'Hit', movement: '+102.75 pts', accuracy: '79.6%', icon: 'bear' },
]

const sessionData = [
  { name: 'Asian Session', accuracy: 70, count: '7/10' },
  { name: 'London Session', accuracy: 80, count: '8/10' },
  { name: 'New York Session', accuracy: 75, count: '6/8' },
]

const donutData = [
  { name: 'Hit', value: 15, color: '#22C55E' },
  { name: 'Miss', value: 4, color: '#EF4444' },
  { name: 'Neutral', value: 1, color: '#F59E0B' },
]

const weeklyData = [
  { day: '1 Apr', price: 23800 },
  { day: '6 Apr', price: 24050 },
  { day: '11 Apr', price: 23900 },
  { day: '16 Apr', price: 24200 },
  { day: '21 Apr', price: 24100 },
  { day: '26 Apr', price: 24400 },
]

export default function History() {
  const getResultBadge = (result: string) => {
    if (result === 'Hit') return <span className="flex items-center gap-1 text-xs font-medium" style={{ color: 'var(--success)' }}><CheckCircle2 size={14} /> Hit</span>
    if (result === 'Miss') return <span className="flex items-center gap-1 text-xs font-medium" style={{ color: 'var(--danger)' }}><XCircle size={14} /> Miss</span>
    if (result === 'Neutral') return <span className="flex items-center gap-1 text-xs font-medium" style={{ color: 'var(--warning)' }}><MinusCircle size={14} /> Neutral</span>
    return <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Pending</span>
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-5">
      {/* Header */}
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>History & Performance</h1>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Track past analysis and market performance</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border" style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-subtle)' }}>
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>NIFTY 50</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border" style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-subtle)' }}>
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>01 Apr 2025 – 29 Apr 2025</span>
          </div>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total Analyses', value: '20', sub: 'This Period', icon: <FileText size={18} style={{ color: 'var(--accent-indigo)' }} /> },
          { label: 'Accuracy (Hit Rate)', value: '75.0%', sub: '15/20 Successful', icon: <Target size={18} style={{ color: 'var(--accent-indigo)' }} /> },
          { label: 'Avg. Zone Accuracy', value: '82.4%', sub: 'High precision zones', icon: <Target size={18} style={{ color: 'var(--accent-indigo)' }} /> },
          { label: 'Best Day', value: '24 Apr 2025', sub: '+188.45 pts', icon: <Trophy size={18} style={{ color: 'var(--accent-indigo)' }} /> },
          { label: 'Avg. Move Captured', value: '124.6 pts', sub: 'Per successful day', icon: <TrendingUp size={18} style={{ color: 'var(--accent-indigo)' }} /> },
        ].map((card, i) => (
          <div key={i} className="rounded-lg border p-4" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}>
            <div className="flex items-start justify-between mb-2">
              <span className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{card.label}</span>
              {card.icon}
            </div>
            <div className="text-xl font-mono font-bold" style={{ color: 'var(--text-primary)' }}>{card.value}</div>
            <div className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>{card.sub}</div>
          </div>
        ))}
      </motion.div>

      {/* Performance Overview + Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div variants={item} className="lg:col-span-2 rounded-lg border p-4" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Performance Overview</h3>
            <div className="flex items-center gap-1 text-[10px]">
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--accent-indigo)' }} /> Price</span>
              <span className="flex items-center gap-1 ml-2"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--success)' }} /> Bullish Zone</span>
              <span className="flex items-center gap-1 ml-2"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--danger)' }} /> Bearish Zone</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(35,42,69,0.5)" />
              <XAxis dataKey="day" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={{ stroke: 'var(--border-subtle)' }} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={{ stroke: 'var(--border-subtle)' }} domain={['dataMin - 500', 'dataMax + 500']} />
              <Tooltip
                contentStyle={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)', fontSize: 12 }}
                itemStyle={{ color: 'var(--accent-indigo)' }}
              />
              <Bar dataKey="price" fill="var(--accent-indigo)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div variants={item} className="rounded-lg border p-4" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}>
          <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Performance Summary</h3>
          <PerformanceDonut data={donutData} total={20} label="Analyses" />
        </motion.div>
      </div>

      {/* Past Analyses Table */}
      <motion.div variants={item} className="rounded-lg border overflow-hidden" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}>
        <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-subtle)' }}>
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Past Analyses</h3>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border" style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-subtle)' }}>
              <Search size={14} style={{ color: 'var(--text-muted)' }} />
              <input type="text" placeholder="Search analysis..." className="bg-transparent text-xs outline-none w-40" style={{ color: 'var(--text-primary)' }} />
            </div>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs font-medium transition-colors" style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}>
              <Download size={14} /> Export CSV
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                {['Date', 'Bias', 'Bullish Zone', 'Bearish Zone', 'Result', 'Price Movement', 'Accuracy', 'Action'].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left text-[10px] uppercase tracking-wider font-medium" style={{ color: 'var(--text-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pastAnalyses.map((row, i) => (
                <tr key={i} className="border-b transition-colors duration-150 hover:bg-[var(--bg-tertiary)]" style={{ borderColor: 'var(--border-subtle)' }}>
                  <td className="px-4 py-3">
                    <div className="text-xs" style={{ color: 'var(--text-primary)' }}>{row.date}</div>
                    {i === 0 && <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>(Today)</div>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium ${row.bias === 'Bullish' ? 'text-green-400' : row.bias === 'Bearish' ? 'text-red-400' : 'text-yellow-400'}`}>
                      {row.bias} {row.bias === 'Bullish' ? '↗' : row.bias === 'Bearish' ? '↘' : '→'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs font-mono" style={{ color: 'var(--success)' }}>{row.bullish}</td>
                  <td className="px-4 py-3 text-xs font-mono" style={{ color: 'var(--danger)' }}>{row.bearish}</td>
                  <td className="px-4 py-3">{getResultBadge(row.result)}</td>
                  <td className="px-4 py-3 text-xs font-mono" style={{ color: row.movement.startsWith('+') ? 'var(--success)' : row.movement.startsWith('-') ? 'var(--danger)' : 'var(--text-muted)' }}>
                    {row.movement}
                  </td>
                  <td className="px-4 py-3 text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>{row.accuracy}</td>
                  <td className="px-4 py-3">
                    <button className="flex items-center gap-1 text-xs px-2 py-1 rounded border transition-colors hover:bg-[var(--bg-tertiary)]" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}>
                      <FileText size={12} /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Detailed Metrics + Accuracy by Session */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div variants={item} className="rounded-lg border p-4" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}>
          <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Detailed Performance Metrics</h3>
          <div className="space-y-3">
            {[
              { label: 'Total Analyses', value: '20' },
              { label: 'Successful Analyses', value: '15' },
              { label: 'Hit Rate', value: '75.0%' },
              { label: 'Average Reward (Hit)', value: '+142.35 pts', positive: true },
              { label: 'Average Loss (Miss)', value: '-52.10 pts', negative: true },
              { label: 'Risk:Reward Ratio', value: '2.73' },
              { label: 'Best Streak', value: '6 Wins', positive: true },
              { label: 'Worst Streak', value: '2 Losses', negative: true },
            ].map((m, i) => (
              <div key={i} className="flex items-center justify-between py-1.5 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                <span className="text-xs flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                  {m.positive && <CheckCircle2 size={12} style={{ color: 'var(--success)' }} />}
                  {m.negative && <XCircle size={12} style={{ color: 'var(--danger)' }} />}
                  {!m.positive && !m.negative && <FileText size={12} style={{ color: 'var(--text-muted)' }} />}
                  {m.label}
                </span>
                <span className={`text-xs font-mono font-semibold ${m.positive ? 'text-green-400' : m.negative ? 'text-red-400' : 'text-slate-200'}`}>{m.value}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div variants={item} className="rounded-lg border p-4" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}>
          <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Accuracy by Session</h3>
          <div className="space-y-4">
            {sessionData.map((s) => (
              <div key={s.name}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <Building2 size={14} style={{ color: 'var(--text-muted)' }} />
                    <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{s.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-semibold" style={{ color: 'var(--success)' }}>{s.accuracy}%</span>
                    <span className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>{s.count}</span>
                  </div>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${s.accuracy}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: 'var(--success)' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Note */}
      <motion.div variants={item} className="flex items-start gap-2 pb-4">
        <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: 'rgba(99,102,241,0.2)' }}>
          <span className="text-xs font-bold" style={{ color: 'var(--accent-indigo)' }}>i</span>
        </div>
        <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          Performance is calculated based on price action reaching the given zones within the same trading day. Neutral days are considered when price stays between zones.
        </p>
      </motion.div>
    </motion.div>
  )
}
