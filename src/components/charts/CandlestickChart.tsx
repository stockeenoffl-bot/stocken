import { useEffect, useRef, useState } from 'react'
import {
  createChart,
  type IChartApi,
  type ISeriesApi,
  type Time,
  CandlestickSeries,
  LineSeries,
} from 'lightweight-charts'
import { Maximize2, Loader2, ShieldCheck } from 'lucide-react'
import { useMarket } from '@/contexts/MarketContext'
import { marketDataService } from '@/services/marketDataService'

const timeframes = ['5m', '15m', '1H', '4H', 'D'] as const

interface OHLCState {
  o: number
  h: number
  l: number
  c: number
  change: number
  changePercent: number
}

export default function CandlestickChart() {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const candlestickSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null)
  const lineSeriesRef = useRef<ISeriesApi<'Line'> | null>(null)

  const [activeTf, setActiveTf] = useState('15m')
  const [loading, setLoading] = useState(true)
  const { market } = useMarket()

  const [ohlc, setOhlc] = useState<OHLCState>({
    o: 24246.5,
    h: 24254.1,
    l: 24238.9,
    c: 24250.7,
    change: 4.2,
    changePercent: 0.02,
  })

  // Initialize lightweight-chart
  useEffect(() => {
    if (!chartContainerRef.current) return

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { color: 'var(--bg-secondary)' },
        textColor: 'var(--text-secondary)',
      },
      grid: {
        vertLines: { color: 'rgba(35, 42, 69, 0.5)' },
        horzLines: { color: 'rgba(35, 42, 69, 0.5)' },
      },
      crosshair: {
        mode: 1,
        vertLine: { color: 'var(--accent-indigo)', style: 2, width: 1 },
        horzLine: { color: 'var(--accent-indigo)', style: 2, width: 1 },
      },
      rightPriceScale: {
        borderColor: 'var(--border-subtle)',
        scaleMargins: { top: 0.1, bottom: 0.1 },
      },
      timeScale: {
        borderColor: 'var(--border-subtle)',
        timeVisible: true,
      },
      width: chartContainerRef.current.clientWidth,
      height: 420,
    })

    chartRef.current = chart

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#22C55E',
      downColor: '#EF4444',
      borderUpColor: '#22C55E',
      borderDownColor: '#EF4444',
      wickUpColor: '#22C55E',
      wickDownColor: '#EF4444',
    })
    candlestickSeriesRef.current = candlestickSeries

    const lineSeries = chart.addSeries(LineSeries, {
      color: 'rgba(99, 102, 241, 0.3)',
      lineStyle: 2,
      lineWidth: 1,
    })
    lineSeriesRef.current = lineSeries

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth })
      }
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      chart.remove()
      chartRef.current = null
      candlestickSeriesRef.current = null
      lineSeriesRef.current = null
    }
  }, [])

  // Strategy: 300ms Debounce on activeTf or market switch to eliminate excessive requests
  useEffect(() => {
    let isMounted = true
    setLoading(true)

    const timer = setTimeout(async () => {
      try {
        const candles = await marketDataService.getCandles(market, activeTf)
        if (!isMounted) return

        if (candlestickSeriesRef.current && candles.length > 0) {
          const chartData = candles.map((c) => ({
            time: c.time as unknown as Time,
            open: c.open,
            high: c.high,
            low: c.low,
            close: c.close,
          }))

          candlestickSeriesRef.current.setData(chartData)

          const latest = candles[candles.length - 1]
          const first = candles[0]
          const diff = latest.close - first.open
          const diffPercent = (diff / first.open) * 100

          setOhlc({
            o: latest.open,
            h: latest.high,
            l: latest.low,
            c: latest.close,
            change: diff,
            changePercent: diffPercent,
          })

          if (lineSeriesRef.current) {
            lineSeriesRef.current.setData(
              chartData.map((d) => ({ time: d.time, value: latest.close }))
            )
          }

          chartRef.current?.timeScale().fitContent()
        }
      } catch (err) {
        console.error('Failed to load market candles:', err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }, 300)

    return () => {
      isMounted = false
      clearTimeout(timer)
    }
  }, [market, activeTf])

  // Dynamic zones derived from current price
  const isPositive = ohlc.change >= 0
  const bullZoneLow = (ohlc.c * 0.992).toFixed(0)
  const bullZoneHigh = (ohlc.c * 0.996).toFixed(0)
  const bearZoneLow = (ohlc.c * 1.004).toFixed(0)
  const bearZoneHigh = (ohlc.c * 1.008).toFixed(0)

  return (
    <div
      className="rounded-lg border overflow-hidden relative"
      style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}
    >
      {/* Chart Header */}
      <div
        className="flex flex-wrap items-center justify-between px-4 py-3 border-b gap-2"
        style={{ borderColor: 'var(--border-subtle)' }}
      >
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            {market} &middot; {activeTf} &middot; Real Feed
          </h3>
          <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
            O {ohlc.o.toFixed(2)} H {ohlc.h.toFixed(2)} L {ohlc.l.toFixed(2)} C {ohlc.c.toFixed(2)}{' '}
            <span style={{ color: isPositive ? 'var(--success)' : 'var(--danger)' }}>
              {isPositive ? '+' : ''}
              {ohlc.change.toFixed(2)} ({isPositive ? '+' : ''}
              {ohlc.changePercent.toFixed(2)}%)
            </span>
          </span>
          <span
            className="hidden sm:inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
            title="Optimized with local caching and sliding-window rate limit protection"
          >
            <ShieldCheck size={12} />
            Quota Protected
          </span>
        </div>

        <div className="flex items-center gap-1">
          {timeframes.map((tf) => (
            <button
              key={tf}
              onClick={() => setActiveTf(tf)}
              disabled={loading}
              className="px-2.5 py-1 rounded text-xs font-medium transition-all duration-200 disabled:opacity-50"
              style={{
                backgroundColor: activeTf === tf ? 'var(--bg-tertiary)' : 'transparent',
                color: activeTf === tf ? 'var(--accent-indigo)' : 'var(--text-muted)',
                borderBottom: activeTf === tf ? '2px solid var(--accent-indigo)' : '2px solid transparent',
              }}
            >
              {tf}
            </button>
          ))}
          <button className="ml-2 p-1 rounded" style={{ color: 'var(--text-muted)' }}>
            <Maximize2 size={14} />
          </button>
        </div>
      </div>

      {/* Chart Canvas & Overlays */}
      <div className="relative">
        {loading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-[var(--bg-secondary)]/60 backdrop-blur-[1px]">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] shadow-sm">
              <Loader2 size={14} className="animate-spin text-[var(--accent-indigo)]" />
              Loading real market data...
            </div>
          </div>
        )}

        <div ref={chartContainerRef} style={{ width: '100%', height: 420 }} />

        {/* Dynamic Bullish Zone Badge */}
        <div
          className="absolute bottom-20 right-4 px-3 py-1.5 rounded-md text-xs font-semibold border pointer-events-none z-10"
          style={{
            backgroundColor: 'rgba(34, 197, 94, 0.15)',
            borderColor: 'var(--success)',
            color: 'var(--success)',
          }}
        >
          BULLISH ZONE<br />
          <span className="font-mono">
            {Number(bullZoneLow).toLocaleString('en-IN')} – {Number(bullZoneHigh).toLocaleString('en-IN')}
          </span>
        </div>

        {/* Dynamic Bearish Zone Badge */}
        <div
          className="absolute top-16 right-4 px-3 py-1.5 rounded-md text-xs font-semibold border pointer-events-none z-10"
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            borderColor: 'var(--danger)',
            color: 'var(--danger)',
          }}
        >
          BEARISH ZONE<br />
          <span className="font-mono">
            {Number(bearZoneLow).toLocaleString('en-IN')} – {Number(bearZoneHigh).toLocaleString('en-IN')}
          </span>
        </div>

        {/* Current Price Badge */}
        <div
          className="absolute right-0 top-1/2 -translate-y-1/2 px-2.5 py-1 text-xs font-mono font-bold pointer-events-none z-10 rounded-l shadow-sm"
          style={{
            backgroundColor: isPositive ? 'var(--success)' : 'var(--danger)',
            color: '#fff',
          }}
        >
          {ohlc.c.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      </div>

      {/* Time Range Footer */}
      <div
        className="flex items-center justify-between px-4 py-2 border-t text-xs"
        style={{ borderColor: 'var(--border-subtle)' }}
      >
        <div className="flex items-center gap-3">
          {['1D', '5D', '1M', '3M', '6M', 'YTD', '1Y', '5Y', 'All'].map((r) => (
            <button
              key={r}
              className="text-xs transition-colors hover:text-white"
              style={{ color: 'var(--text-muted)' }}
            >
              {r}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
          <span>(UTC+5:30 IST)</span>
          <span style={{ color: 'var(--accent-indigo)' }}>auto</span>
        </div>
      </div>
    </div>
  )
}
