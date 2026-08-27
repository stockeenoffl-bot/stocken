import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface StatCardProps {
  label: string
  value: string | number
  sublabel?: string
  sentiment?: 'bullish' | 'bearish' | 'neutral'
  sparkline?: boolean
  icon?: React.ReactNode
}

export default function StatCard({ label, value, sublabel, sentiment = 'neutral', icon }: StatCardProps) {
  const isBullish = sentiment === 'bullish'
  const isBearish = sentiment === 'bearish'

  return (
    <motion.div
      whileHover={{ scale: 1.005 }}
      className="rounded-lg border p-4 transition-all duration-200"
      style={{
        backgroundColor: 'var(--bg-secondary)',
        borderColor: 'var(--border-subtle)',
        boxShadow: isBullish ? '0 0 20px rgba(34, 197, 94, 0.08)' : isBearish ? '0 0 20px rgba(239, 68, 68, 0.08)' : 'none',
      }}
    >
      <div className="flex items-start justify-between mb-2">
        <span className="text-[10px] uppercase tracking-wider font-medium" style={{ color: 'var(--text-muted)' }}>
          {label}
        </span>
        {icon && <div style={{ color: 'var(--text-muted)' }}>{icon}</div>}
      </div>
      <div className="flex items-center gap-2 mb-1">
        {isBullish && <TrendingUp size={16} style={{ color: 'var(--success)' }} />}
        {isBearish && <TrendingDown size={16} style={{ color: 'var(--danger)' }} />}
        <span
          className="text-lg font-mono font-bold"
          style={{
            color: isBullish ? 'var(--success)' : isBearish ? 'var(--danger)' : 'var(--text-primary)',
          }}
        >
          {value}
        </span>
      </div>
      {sublabel && (
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{sublabel}</span>
      )}
    </motion.div>
  )
}
