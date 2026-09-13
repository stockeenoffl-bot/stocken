import { useEffect, useRef, useState } from 'react'
import { LayoutGrid } from 'lucide-react'

interface TradingViewStockHeatmapProps {
  height?: number | string
  className?: string
  defaultSource?: 'SENSEX' | 'NIFTY50'
}

export default function TradingViewStockHeatmap({
  height = 540,
  className = '',
  defaultSource = 'SENSEX',
}: TradingViewStockHeatmapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [dataSource, setDataSource] = useState<'SENSEX' | 'NIFTY50'>(defaultSource)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.innerHTML = ''

    const widgetDiv = document.createElement('div')
    widgetDiv.className = 'tradingview-widget-container__widget'
    container.appendChild(widgetDiv)

    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-stock-heatmap.js'
    script.async = true
    script.innerHTML = JSON.stringify({
      exchanges: [],
      dataSource: dataSource,
      grouping: 'sector',
      blockSize: 'market_cap_calc',
      blockColor: 'change',
      locale: 'en',
      symbolUrl: '',
      colorTheme: 'dark',
      hasTopBar: true,
      isDataSetEnabled: true,
      isZoomEnabled: true,
      hasSymbolTooltip: true,
      isMonoSize: false,
      width: '100%',
      height: typeof height === 'number' ? height : 540,
    })

    container.appendChild(script)

    return () => {
      if (container) {
        container.innerHTML = ''
      }
    }
  }, [dataSource, height])

  return (
    <div
      className={`rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] overflow-hidden flex flex-col ${className}`}
    >
      <div className="p-3 border-b border-[var(--border-subtle)] bg-[var(--bg-tertiary)]/50 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <LayoutGrid size={15} className="text-[var(--accent-indigo)]" />
          <span className="text-xs font-bold text-[var(--text-primary)]">
            Indian Equities Sector Heatmap
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setDataSource('SENSEX')}
            className={`px-3 py-1 rounded-md text-[11px] font-semibold transition-all ${
              dataSource === 'SENSEX'
                ? 'bg-[var(--accent-indigo)] text-white'
                : 'bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-white'
            }`}
          >
            SENSEX Heatmap
          </button>
          <button
            onClick={() => setDataSource('NIFTY50')}
            className={`px-3 py-1 rounded-md text-[11px] font-semibold transition-all ${
              dataSource === 'NIFTY50'
                ? 'bg-[var(--accent-indigo)] text-white'
                : 'bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-white'
            }`}
          >
            NIFTY 50 Heatmap
          </button>
        </div>
      </div>

      <div className="tradingview-widget-container flex-1 p-1">
        <div ref={containerRef} className="w-full" style={{ height }} />
      </div>
    </div>
  )
}
