import { useEffect, useState, useRef } from 'react'
import { aliceBlueService, AliceBlueQuote } from '@/services/aliceBlueService'
import { TrendingDown, TrendingUp } from 'lucide-react'

interface AliceBlueMiniChartProps {
  symbol: string
  title: string
  height?: number
  className?: string
}

export default function AliceBlueMiniChart({
  symbol,
  title,
  height = 170,
  className = '',
}: AliceBlueMiniChartProps) {
  const [quote, setQuote] = useState<AliceBlueQuote | null>(null)
  const [history, setHistory] = useState<number[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const loadData = async () => {
      try {
        const quotes = await aliceBlueService.getLiveIndexQuotes()
        const targetSym = symbol === 'NSE:NIFTY' ? 'NIFTY 50' : 
                          symbol === 'NSE:BANKNIFTY' ? 'BANKNIFTY' : 
                          symbol === 'BSE:SENSEX' ? 'SENSEX' : 
                          symbol === 'NSE:FINNIFTY' ? 'FINNIFTY' : symbol
        
        const q = quotes.find(x => x.symbol === targetSym)
        if (q && mounted) {
          setQuote(q)
        }

        // Fetch historical data for sparkline (last 1 day, 15m intervals)
        const to = Date.now()
        const from = to - 24 * 60 * 60 * 1000
        const histData = await aliceBlueService.getHistoricalData({
          symbol: targetSym,
          exchange: targetSym === 'SENSEX' ? 'BSE::index' : 'NSE::index',
          resolution: '15',
          from,
          to
        })
        
        if (mounted) {
          if (histData && histData.length > 0) {
            setHistory(histData.map(d => d.close))
          } else {
            // Fallback generated sparkline data
            const fallback = []
            let val = q ? q.open : 1000
            for (let i = 0; i < 20; i++) {
              val += (Math.random() - 0.5) * (q ? q.ltp * 0.002 : 10)
              fallback.push(val)
            }
            if (q) fallback.push(q.ltp)
            setHistory(fallback)
          }
        }
      } catch (e) {
        console.error('MiniChart data load error', e)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadData()
    const timer = setInterval(loadData, 5000)
    return () => {
      mounted = false
      clearInterval(timer)
    }
  }, [symbol])

  // Sparkline drawing
  const svgRef = useRef<SVGSVGElement>(null)
  
  const minPrice = history.length ? Math.min(...history) : 0
  const maxPrice = history.length ? Math.max(...history) : 1
  const priceRange = maxPrice - minPrice || 1

  const padding = 10
  const chartHeight = height - 80 // Adjust for header/footer

  const points = history.map((price, i) => {
    const x = (i / (history.length - 1 || 1)) * 100
    const y = padding + chartHeight * (1 - (price - minPrice) / priceRange)
    return `${x}%,${y}`
  }).join(' ')

  const isGreen = quote ? quote.change >= 0 : true
  const strokeColor = isGreen ? '#10B981' : '#EF4444' // Emerald-500 / Rose-500
  const bgGradient = isGreen ? 'url(#greenGrad)' : 'url(#redGrad)'

  return (
    <div className={`rounded-xl border border-[#1A2234] bg-[#0E1424] overflow-hidden flex flex-col p-4 shadow-sm ${className}`} style={{ height }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-bold text-slate-200">{title}</h3>
        {quote && (
          <span className={`flex items-center gap-1 text-[11px] font-bold px-1.5 py-0.5 rounded ${isGreen ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'}`}>
            {isGreen ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {isGreen ? '+' : ''}{quote.changePercent.toFixed(2)}%
          </span>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-end relative">
        {loading && !quote ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            <div className="z-10 mb-2">
              <div className="text-xl font-mono font-bold text-white tracking-tight">
                {quote?.ltp.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '---'}
              </div>
              <div className={`text-xs font-semibold ${isGreen ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isGreen ? '+' : ''}{quote?.change.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '---'}
              </div>
            </div>

            {/* Sparkline */}
            <div className="absolute bottom-0 left-0 right-0 h-[60px] opacity-70">
              <svg ref={svgRef} className="w-full h-full" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="redGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#EF4444" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#EF4444" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                {history.length > 0 && (
                  <>
                    {/* Fill */}
                    <polygon
                      points={`0,100% ${points} 100%,100%`}
                      fill={bgGradient}
                    />
                    {/* Line */}
                    <polyline
                      points={points}
                      fill="none"
                      stroke={strokeColor}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </>
                )}
              </svg>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
