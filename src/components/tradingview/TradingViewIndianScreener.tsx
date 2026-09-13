import { useEffect, useRef } from 'react'
import { Filter } from 'lucide-react'

interface TradingViewIndianScreenerProps {
  height?: number | string
  className?: string
}

export default function TradingViewIndianScreener({
  height = 580,
  className = '',
}: TradingViewIndianScreenerProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.innerHTML = ''

    const widgetDiv = document.createElement('div')
    widgetDiv.className = 'tradingview-widget-container__widget'
    container.appendChild(widgetDiv)

    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-screener.js'
    script.async = true
    script.innerHTML = JSON.stringify({
      width: '100%',
      height: typeof height === 'number' ? height : 580,
      defaultColumn: 'overview',
      defaultScreen: 'general',
      market: 'india',
      showToolbar: true,
      colorTheme: 'dark',
      locale: 'en',
      isTransparent: true,
    })

    container.appendChild(script)

    return () => {
      if (container) {
        container.innerHTML = ''
      }
    }
  }, [height])

  return (
    <div
      className={`rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] overflow-hidden flex flex-col ${className}`}
    >
      <div className="p-3 border-b border-[var(--border-subtle)] bg-[var(--bg-tertiary)]/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter size={15} className="text-[var(--accent-indigo)]" />
          <span className="text-xs font-bold text-[var(--text-primary)]">
            NSE & BSE Real-Time Stock Screener
          </span>
        </div>
        <span className="text-[10px] text-[var(--text-muted)] bg-[var(--bg-secondary)] px-2 py-0.5 rounded border border-[var(--border-subtle)]">
          India Market • Live Screener
        </span>
      </div>

      <div className="tradingview-widget-container flex-1">
        <div ref={containerRef} className="w-full" style={{ height }} />
      </div>
    </div>
  )
}
