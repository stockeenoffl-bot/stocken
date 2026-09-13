import { useEffect, useRef, useState } from 'react'
import { Activity } from 'lucide-react'

interface TradingViewTechnicalAnalysisProps {
  defaultSymbol?: string
  height?: number | string
  className?: string
  showSymbolPicker?: boolean
}

const INDIAN_TA_SYMBOLS = [
  { label: 'NIFTY 50', symbol: 'NSE:NIFTY' },
  { label: 'BANK NIFTY', symbol: 'NSE:BANKNIFTY' },
  { label: 'SENSEX', symbol: 'BSE:SENSEX' },
  { label: 'FIN NIFTY', symbol: 'NSE:FINNIFTY' },
  { label: 'RELIANCE', symbol: 'NSE:RELIANCE' },
  { label: 'HDFC BANK', symbol: 'NSE:HDFCBANK' },
  { label: 'TCS', symbol: 'NSE:TCS' },
  { label: 'TATA MOTORS', symbol: 'NSE:TATAMOTORS' },
]

export default function TradingViewTechnicalAnalysis({
  defaultSymbol = 'NSE:NIFTY',
  height = 450,
  className = '',
  showSymbolPicker = true,
}: TradingViewTechnicalAnalysisProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [selectedSymbol, setSelectedSymbol] = useState(defaultSymbol)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.innerHTML = ''

    const widgetDiv = document.createElement('div')
    widgetDiv.className = 'tradingview-widget-container__widget'
    container.appendChild(widgetDiv)

    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-technical-analysis.js'
    script.async = true
    script.innerHTML = JSON.stringify({
      interval: '15m',
      width: '100%',
      isTransparent: true,
      height: typeof height === 'number' ? height : 450,
      symbol: selectedSymbol,
      showIntervalTabs: true,
      displayMode: 'single',
      locale: 'en',
      colorTheme: 'dark',
    })

    container.appendChild(script)

    return () => {
      if (container) {
        container.innerHTML = ''
      }
    }
  }, [selectedSymbol, height])

  return (
    <div
      className={`rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] overflow-hidden flex flex-col ${className}`}
    >
      {showSymbolPicker && (
        <div className="p-3 border-b border-[var(--border-subtle)] bg-[var(--bg-tertiary)]/50 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Activity size={15} className="text-[var(--accent-indigo)]" />
            <span className="text-xs font-bold text-[var(--text-primary)]">
              Indian Market Technical Sentiment
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1">
            {INDIAN_TA_SYMBOLS.map((item) => (
              <button
                key={item.symbol}
                onClick={() => setSelectedSymbol(item.symbol)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                  selectedSymbol === item.symbol
                    ? 'bg-[var(--accent-indigo)] text-white'
                    : 'bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="tradingview-widget-container p-2 flex-1 flex items-center justify-center">
        <div ref={containerRef} className="w-full" style={{ minHeight: height }} />
      </div>
    </div>
  )
}
