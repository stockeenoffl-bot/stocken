import { useEffect, useMemo, useState } from 'react'
import { TrendingDown, TrendingUp } from 'lucide-react'
import { marketDataService } from '@/services/marketDataService'
import { useLiveQuotes } from '@/hooks/useLiveQuotes'
import { fmtPrice } from '@/lib/candles'

interface Props {
  symbol: string // gateway symbol e.g. 'NIFTY 50', 'SENSEX'
  title: string
  height?: number
  className?: string
}

/** Live index tile: Alice Blue LTP + intraday sparkline. */
export default function AliceBlueMiniChart({ symbol, title, height = 150, className = '' }: Props) {
  const symbols = useMemo(() => [symbol], [symbol])
  const { quotes, dirs } = useLiveQuotes(symbols)
  const quote = quotes[symbol]
  const [series, setSeries] = useState<number[]>([])

  useEffect(() => {
    let alive = true
    const load = () =>
      marketDataService
        .getCandles(symbol, '5m', '1D')
        .then((c) => alive && setSeries(c.map((x) => x.close)))
        .catch(() => undefined)
    void load()
    const id = setInterval(load, 60000)
    return () => { alive = false; clearInterval(id) }
  }, [symbol])

  const points = useMemo(() => {
    const data = quote && series.length ? [...series.slice(0, -1), quote.ltp] : series
    if (data.length < 2) return ''
    const min = Math.min(...data)
    const max = Math.max(...data)
    const span = max - min || 1
    return data.map((v, i) => `${(i / (data.length - 1)) * 100},${88 - ((v - min) / span) * 76}`).join(' ')
  }, [series, quote])

  const up = (quote?.change ?? 0) >= 0
  const color = up ? '#10B981' : '#EF4444'
  const gid = `g_${symbol.replace(/\W/g, '')}`

  return (
    <div className={`rounded-xl border border-[#1A2234] bg-[#0E1424] overflow-hidden relative p-4 ${className}`} style={{ height }}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-200">{title}</h3>
        {quote && (
          <span className={`flex items-center gap-1 text-[11px] font-bold px-1.5 py-0.5 rounded ${up ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'}`}>
            {up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {up ? '+' : ''}{quote.changePercent.toFixed(2)}%
          </span>
        )}
      </div>
      <div className="relative z-10 mt-1">
        <div className={`text-xl font-mono font-bold tracking-tight transition-colors ${dirs[symbol] === 'up' ? 'text-emerald-300' : dirs[symbol] === 'down' ? 'text-rose-300' : 'text-white'}`}>
          {quote ? fmtPrice(quote.ltp) : '---'}
        </div>
        <div className={`text-xs font-semibold ${up ? 'text-emerald-400' : 'text-rose-400'}`}>
          {quote ? `${up ? '+' : ''}${fmtPrice(quote.change)}` : ''}
        </div>
      </div>
      {points && (
        <svg className="absolute bottom-0 left-0 right-0 h-[55%] w-full opacity-80" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.3" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
          <polygon points={`0,100 ${points} 100,100`} fill={`url(#${gid})`} />
          <polyline points={points} fill="none" stroke={color} strokeWidth="1.6" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
        </svg>
      )}
    </div>
  )
}
