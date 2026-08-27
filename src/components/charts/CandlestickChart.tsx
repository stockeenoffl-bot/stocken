import { useEffect, useRef, useState } from 'react'
import { createChart, type IChartApi, type CandlestickData, type Time, CandlestickSeries, LineSeries } from 'lightweight-charts'
import { Maximize2 } from 'lucide-react'
import { useMarket } from '@/contexts/MarketContext'

const timeframes = ['5m', '15m', '1H', '4H', 'D'] as const

function generateMockData(): CandlestickData[] {
  const data: CandlestickData[] = []
  let price = 24200
  const now = new Date('2025-04-29T09:15:00')
  for (let i = 0; i < 100; i++) {
    const change = (Math.random() - 0.48) * 40
    const open = price
    const close = price + change
    const high = Math.max(open, close) + Math.random() * 15
    const low = Math.min(open, close) - Math.random() * 15
    const time = new Date(now.getTime() + i * 15 * 60 * 1000)
    data.push({
      time: Math.floor(time.getTime() / 1000) as unknown as Time,
      open,
      high,
      low,
      close,
    })
    price = close
  }
  return data
}

export default function CandlestickChart() {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const [activeTf, setActiveTf] = useState('15m')
  const { market } = useMarket()

  const ohlc = { o: 24246.50, h: 24254.10, l: 24238.90, c: 24250.70 }

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

    const data = generateMockData()
    candlestickSeries.setData(data)

    // Add a line for current price
    const lineSeries = chart.addSeries(LineSeries, {
      color: 'rgba(99, 102, 241, 0.3)',
      lineStyle: 2,
      lineWidth: 1,
    })
    lineSeries.setData(data.map(d => ({ time: d.time, value: 24250.70 })))

    chart.timeScale().fitContent()

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth })
      }
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      chart.remove()
    }
  }, [market])

  return (
    <div
      className="rounded-lg border overflow-hidden"
      style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}
    >
      {/* Chart Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="flex items-center gap-4">
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            {market} &middot; 15m &middot; NSE
          </h3>
          <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
            O {ohlc.o.toFixed(2)} H {ohlc.h.toFixed(2)} L {ohlc.l.toFixed(2)} C {ohlc.c.toFixed(2)}{' '}
            <span style={{ color: 'var(--success)' }}>+4.20 (+0.02%)</span>
          </span>
        </div>
        <div className="flex items-center gap-1">
          {timeframes.map((tf) => (
            <button
              key={tf}
              onClick={() => setActiveTf(tf)}
              className="px-2.5 py-1 rounded text-xs font-medium transition-all duration-200"
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

      {/* Zone Labels Overlay */}
      <div className="relative">
        <div ref={chartContainerRef} style={{ width: '100%', height: 420 }} />

        {/* Bullish Zone Badge */}
        <div
          className="absolute bottom-20 right-4 px-3 py-1.5 rounded-md text-xs font-semibold border"
          style={{
            backgroundColor: 'rgba(34, 197, 94, 0.2)',
            borderColor: 'var(--success)',
            color: 'var(--success)',
          }}
        >
          BULLISH ZONE<br />
          <span className="font-mono">24,050 – 24,150</span>
        </div>

        {/* Bearish Zone Badge */}
        <div
          className="absolute top-16 right-4 px-3 py-1.5 rounded-md text-xs font-semibold border"
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.2)',
            borderColor: 'var(--danger)',
            color: 'var(--danger)',
          }}
        >
          BEARISH ZONE<br />
          <span className="font-mono">24,420 – 24,520</span>
        </div>

        {/* Current Price */}
        <div
          className="absolute right-0 top-1/2 -translate-y-1/2 px-2 py-1 text-xs font-mono font-bold"
          style={{ backgroundColor: 'var(--success)', color: '#fff' }}
        >
          24,250.70
        </div>
      </div>

      {/* Time Range */}
      <div className="flex items-center justify-between px-4 py-2 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
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
          <span>08:15:32 (UTC+5:30)</span>
          <span>%</span>
          <span>log</span>
          <span style={{ color: 'var(--accent-indigo)' }}>auto</span>
        </div>
      </div>
    </div>
  )
}
