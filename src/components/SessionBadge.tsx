import { Minus, TrendingUp, Zap } from 'lucide-react'

interface SessionBadgeProps {
  session: 'Neutral' | 'Bullish' | 'Volatile'
  label: string
}

export default function SessionBadge({ session, label }: SessionBadgeProps) {
  const config = {
    Neutral: { icon: Minus, color: 'var(--warning)', bg: 'rgba(245, 158, 11, 0.1)' },
    Bullish: { icon: TrendingUp, color: 'var(--success)', bg: 'rgba(34, 197, 94, 0.1)' },
    Volatile: { icon: Zap, color: 'var(--accent-indigo)', bg: 'rgba(99, 102, 241, 0.1)' },
  }

  const { icon: Icon, color, bg } = config[session]

  return (
    <div className="flex items-center gap-2 py-1.5">
      <span className="text-xs" style={{ color: 'var(--text-secondary)', minWidth: 90 }}>{label}</span>
      <div className="flex items-center gap-1.5 px-2 py-1 rounded-md" style={{ backgroundColor: bg }}>
        <Icon size={14} style={{ color }} />
        <span className="text-xs font-semibold" style={{ color }}>{session}</span>
      </div>
    </div>
  )
}
