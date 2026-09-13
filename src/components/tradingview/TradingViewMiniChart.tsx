import { useEffect, useRef } from 'react'

interface TradingViewMiniChartProps {
  symbol: string
  title?: string
  height?: number
  className?: string
  dateRange?: '1D' | '1M' | '3M' | '12M' | 'ALL'
}

export default function TradingViewMiniChart({
  symbol,
  title,
  height = 200,
  className = '',
  dateRange = '1D',
}: TradingViewMiniChartProps) {
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
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js'
    script.async = true
    script.innerHTML = JSON.stringify({
      symbol,
      width: '100%',
      height,
      locale: 'en',
      dateRange,
      colorTheme: 'dark',
      isTransparent: true,
      autosize: true,
      largeChartUrl: '',
    })

    container.appendChild(script)

    return () => {
      if (container) {
        container.innerHTML = ''
      }
    }
  }, [symbol, height, dateRange])

  return (
    <div
      className={`rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] overflow-hidden p-2 flex flex-col ${className}`}
    >
      {title && (
        <div className="px-2 pt-1 pb-2 flex items-center justify-between text-xs font-semibold text-[var(--text-secondary)]">
          <span>{title}</span>
          <span className="text-[10px] text-[var(--accent-indigo)] font-mono">{symbol}</span>
        </div>
      )}
      <div className="tradingview-widget-container flex-1">
        <div ref={containerRef} className="w-full" style={{ height }} />
      </div>
    </div>
  )
}
