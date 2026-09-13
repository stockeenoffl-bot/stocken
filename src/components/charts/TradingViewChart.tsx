import { useEffect, useRef, useState, useId } from 'react'
import {
  Maximize2,
  Minimize2,
  PenTool,
  TrendingUp,
  RefreshCw,
  Sparkles,
  Layers,
  X,
  CheckCircle2,
} from 'lucide-react'

declare global {
  interface Window {
    TradingView: any
  }
}

interface TradingViewChartProps {
  defaultSymbol?: string
  height?: number | string
  allowSymbolChange?: boolean
  showQuickBar?: boolean
  className?: string
}

type SymbolCategory = 'indices' | 'banking' | 'bluechips'

interface PresetSymbol {
  label: string
  symbol: string
  desc: string
  category: SymbolCategory
}

const PRESET_SYMBOLS: PresetSymbol[] = [
  // Indian Indices
  { label: 'NIFTY 50', symbol: 'NSE:NIFTY', desc: 'National Stock Exchange 50', category: 'indices' },
  { label: 'BANK NIFTY', symbol: 'NSE:BANKNIFTY', desc: 'Banking Sector Index', category: 'indices' },
  { label: 'SENSEX', symbol: 'BSE:SENSEX', desc: 'Bombay Stock Exchange 30', category: 'indices' },
  { label: 'FIN NIFTY', symbol: 'NSE:FINNIFTY', desc: 'Financial Services Index', category: 'indices' },
  { label: 'MIDCPNIFTY', symbol: 'NSE:MIDCPNIFTY', desc: 'Midcap Select Index', category: 'indices' },
  { label: 'INDIA VIX', symbol: 'NSE:INDIAVIX', desc: 'India Volatility Index', category: 'indices' },

  // Indian Banking Heavyweights
  { label: 'HDFC BANK', symbol: 'NSE:HDFCBANK', desc: 'HDFC Bank Ltd', category: 'banking' },
  { label: 'ICICI BANK', symbol: 'NSE:ICICIBANK', desc: 'ICICI Bank Ltd', category: 'banking' },
  { label: 'SBIN', symbol: 'NSE:SBIN', desc: 'State Bank of India', category: 'banking' },
  { label: 'KOTAK', symbol: 'NSE:KOTAKBANK', desc: 'Kotak Mahindra Bank', category: 'banking' },
  { label: 'AXIS BANK', symbol: 'NSE:AXISBANK', desc: 'Axis Bank Ltd', category: 'banking' },

  // Indian Bluechips
  { label: 'RELIANCE', symbol: 'NSE:RELIANCE', desc: 'Reliance Industries', category: 'bluechips' },
  { label: 'TCS', symbol: 'NSE:TCS', desc: 'Tata Consultancy Services', category: 'bluechips' },
  { label: 'INFOSYS', symbol: 'NSE:INFY', desc: 'Infosys Limited', category: 'bluechips' },
  { label: 'TATA MOTORS', symbol: 'NSE:TATAMOTORS', desc: 'Tata Motors', category: 'bluechips' },
  { label: 'L&T', symbol: 'NSE:LT', desc: 'Larsen & Toubro', category: 'bluechips' },
  { label: 'ITC', symbol: 'NSE:ITC', desc: 'ITC Limited', category: 'bluechips' },
]

export default function TradingViewChart({
  defaultSymbol = 'NSE:NIFTY',
  height = 580,
  allowSymbolChange = true,
  showQuickBar = true,
  className = '',
}: TradingViewChartProps) {
  const containerUid = useId().replace(/[:]/g, '_')
  const containerId = `tv_chart_container_${containerUid}`
  const containerRef = useRef<HTMLDivElement>(null)

  const [activeCategory, setActiveCategory] = useState<SymbolCategory>('indices')
  const [currentSymbol, setCurrentSymbol] = useState(defaultSymbol)
  const [currentInterval, setCurrentInterval] = useState('15')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showGuide, setShowGuide] = useState(false)
  const [scriptLoaded, setScriptLoaded] = useState(false)

  // Load TradingView script once
  useEffect(() => {
    if (window.TradingView) {
      setScriptLoaded(true)
      return
    }

    const existingScript = document.getElementById('tradingview-widget-script')
    if (existingScript) {
      existingScript.addEventListener('load', () => setScriptLoaded(true))
      return
    }

    const script = document.createElement('script')
    script.id = 'tradingview-widget-script'
    script.src = 'https://s3.tradingview.com/tv.js'
    script.async = true
    script.onload = () => setScriptLoaded(true)
    document.head.appendChild(script)
  }, [])

  // Instantiate or re-instantiate widget when symbol or interval changes
  useEffect(() => {
    if (!scriptLoaded || !window.TradingView) return

    const containerEl = document.getElementById(containerId)
    if (!containerEl) return

    // Clear previous widget iframe
    containerEl.innerHTML = ''

    try {
      new window.TradingView.widget({
        autosize: true,
        symbol: currentSymbol,
        interval: currentInterval,
        timezone: 'Asia/Kolkata',
        theme: 'dark',
        style: '1', // Candlestick
        locale: 'en',
        toolbar_bg: '#0B0E14',
        enable_publishing: false,
        allow_symbol_change: allowSymbolChange,
        hide_side_toolbar: false, // CRITICAL: Enables all drawing/marking tools!
        hide_top_toolbar: false,
        withdateranges: true,
        save_image: true, // Camera screenshot button
        hide_volume: false,
        details: true,
        hotlist: true,
        calendar: true,
        studies: [
          'STD;SMA',
          'STD;RSI',
        ],
        container_id: containerId,
        loading_screen: { backgroundColor: '#0B0E14', foregroundColor: '#6366F1' },
      })
    } catch (err) {
      console.error('TradingView initialization error:', err)
    }
  }, [scriptLoaded, currentSymbol, currentInterval, containerId, allowSymbolChange, isFullscreen])

  // Handle ESC key to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isFullscreen])

  return (
    <div
      ref={containerRef}
      className={`rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] overflow-hidden transition-all duration-300 ${
        isFullscreen
          ? 'fixed inset-0 z-50 rounded-none border-none p-4 flex flex-col bg-[#0B0E14]'
          : className
      }`}
    >
      {/* Quick Switcher & Toolbar Header */}
      {showQuickBar && (
        <div className="p-3 border-b border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-3 bg-[var(--bg-tertiary)]/60 backdrop-blur-sm">
          {/* Category Tabs + Preset Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] p-0.5">
              {(
                [
                  { id: 'indices', label: 'Indices' },
                  { id: 'banking', label: 'Banking' },
                  { id: 'bluechips', label: 'Bluechips' },
                ] as const
              ).map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveCategory(cat.id)
                    const firstInCat = PRESET_SYMBOLS.find((s) => s.category === cat.id)
                    if (
                      firstInCat &&
                      !PRESET_SYMBOLS.filter((s) => s.category === cat.id).some(
                        (s) => s.symbol === currentSymbol
                      )
                    ) {
                      setCurrentSymbol(firstInCat.symbol)
                    }
                  }}
                  className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                    activeCategory === cat.id
                      ? 'bg-[var(--accent-indigo)] text-white shadow-sm'
                      : 'text-[var(--text-secondary)] hover:text-white'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="h-4 w-px bg-[var(--border-subtle)] hidden sm:block" />

            <div className="flex flex-wrap items-center gap-1.5">
              {PRESET_SYMBOLS.filter((s) => s.category === activeCategory).map((s) => {
                const active = currentSymbol === s.symbol
                return (
                  <button
                    key={s.symbol}
                    onClick={() => setCurrentSymbol(s.symbol)}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                      active
                        ? 'bg-[var(--accent-indigo)] text-white shadow-sm ring-1 ring-white/20'
                        : 'bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-white hover:border-[var(--border-active)]'
                    }`}
                    title={s.desc}
                  >
                    {s.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Right Action Tools: Timeframes, Guide, Fullscreen */}
          <div className="flex items-center gap-2">
            {/* Timeframe selector */}
            <div className="flex items-center rounded-md bg-[var(--bg-secondary)] border border-[var(--border-subtle)] p-0.5">
              {[
                { label: '5m', value: '5' },
                { label: '15m', value: '15' },
                { label: '1H', value: '60' },
                { label: '1D', value: 'D' },
              ].map((tf) => (
                <button
                  key={tf.value}
                  onClick={() => setCurrentInterval(tf.value)}
                  className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                    currentInterval === tf.value
                      ? 'bg-[var(--accent-indigo)] text-white'
                      : 'text-[var(--text-muted)] hover:text-white'
                  }`}
                >
                  {tf.label}
                </button>
              ))}
            </div>

            {/* Drawing Tips Button */}
            <button
              onClick={() => setShowGuide(!showGuide)}
              className="px-2.5 py-1.5 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-white hover:border-[var(--accent-indigo)] text-xs flex items-center gap-1.5 transition-colors"
              title="How to mark zones & use drawing tools"
            >
              <PenTool size={13} className="text-[var(--accent-indigo)]" />
              <span className="hidden sm:inline">Draw & Mark Guide</span>
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-white hover:border-[var(--accent-indigo)] transition-colors"
              title={isFullscreen ? 'Exit Fullscreen (Esc)' : 'Fullscreen Chart'}
            >
              {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
            </button>
          </div>
        </div>
      )}

      {/* Guide Info Drawer / Modal */}
      {showGuide && (
        <div className="p-4 bg-[var(--accent-indigo)]/5 border-b border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] relative animate-in fade-in slide-in-from-top-2">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 font-bold text-[var(--text-primary)]">
                <Sparkles size={14} className="text-[var(--accent-indigo)]" />
                <span>How to Mark Your Zones & Use Interactive Tools:</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-1">
                <div className="p-2.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-1">
                  <span className="font-semibold text-emerald-400 flex items-center gap-1">
                    <Layers size={12} /> 1. Supply / Demand Zones
                  </span>
                  <p className="text-[11px] text-[var(--text-muted)]">
                    Click the <strong>Geometric Shapes (Rectangle)</strong> icon on the left toolbar to draw support/resistance zones directly across candles.
                  </p>
                </div>

                <div className="p-2.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-1">
                  <span className="font-semibold text-[var(--accent-indigo)] flex items-center gap-1">
                    <TrendingUp size={12} /> 2. Trendlines & Levels
                  </span>
                  <p className="text-[11px] text-[var(--text-muted)]">
                    Select <strong>Trend Line</strong> or <strong>Horizontal Line</strong> (Alt + H) to pinpoint key pivot levels and bias invalidations.
                  </p>
                </div>

                <div className="p-2.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-1">
                  <span className="font-semibold text-amber-400 flex items-center gap-1">
                    <PenTool size={12} /> 3. Text Notes & Callouts
                  </span>
                  <p className="text-[11px] text-[var(--text-muted)]">
                    Use the <strong>Text (T)</strong> tool on the left to write session notes, risk-reward targets, or execution triggers.
                  </p>
                </div>

                <div className="p-2.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-1">
                  <span className="font-semibold text-sky-400 flex items-center gap-1">
                    <CheckCircle2 size={12} /> 4. Save & Snapshot
                  </span>
                  <p className="text-[11px] text-[var(--text-muted)]">
                    Click the <strong>Camera icon</strong> in the top-right toolbar to download a screenshot of your marked chart.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowGuide(false)}
              className="p-1 rounded text-[var(--text-muted)] hover:text-white hover:bg-[var(--bg-secondary)] transition-colors shrink-0"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Main Chart Canvas Container */}
      <div
        className="relative w-full flex-1"
        style={{
          height: isFullscreen ? 'calc(100vh - 80px)' : (typeof height === 'number' ? `${height}px` : height),
          minHeight: '450px',
        }}
      >
        {!scriptLoaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[var(--bg-secondary)] z-10">
            <RefreshCw size={24} className="text-[var(--accent-indigo)] animate-spin" />
            <span className="text-xs text-[var(--text-muted)] font-medium">Connecting to TradingView live tick feed...</span>
          </div>
        )}
        <div id={containerId} className="w-full h-full" />
      </div>
    </div>
  )
}
