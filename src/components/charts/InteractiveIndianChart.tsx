import { useState, useRef, useEffect, useMemo } from 'react'
import {
  Maximize2,
  Minimize2,
  Crosshair,
  Slash,
  Square,
  Type,
  Ruler,
  ZoomIn,
  Move,
  Trash2,
  TrendingUp,
  TrendingDown,
  Layers,
} from 'lucide-react'

export interface ZoneDefinition {
  from: number
  to: number
  color?: string
  label?: string
}

interface InteractiveIndianChartProps {
  market?: string
  timeframe?: string
  bullishZone: ZoneDefinition
  bearishZone: ZoneDefinition
  invalidationLevel?: number
  onBullishZoneChange?: (zone: ZoneDefinition) => void
  onBearishZoneChange?: (zone: ZoneDefinition) => void
  height?: number
  readOnly?: boolean
}

// Generate realistic Indian market intraday candles
function generateIndianCandles(market: string, basePrice: number, count = 48) {
  const candles = []
  let current = basePrice - 180
  const now = Date.now()
  const intervalMs = 15 * 60 * 1000 // 15m

  for (let i = count; i >= 0; i--) {
    const time = new Date(now - i * intervalMs)
    const volatility = market === 'SENSEX' ? 45 : 16
    const dir = Math.sin(i * 0.35) + (Math.random() - 0.48)
    const change = dir * volatility

    const open = Number(current.toFixed(2))
    const close = Number((open + change).toFixed(2))
    const high = Number((Math.max(open, close) + Math.random() * (volatility * 0.8)).toFixed(2))
    const low = Number((Math.min(open, close) - Math.random() * (volatility * 0.8)).toFixed(2))

    candles.push({
      time: time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false }),
      day: time.getDate().toString(),
      fullDate: time,
      open,
      high,
      low,
      close,
      isGreen: close >= open,
    })

    current = close
  }

  // Set latest close precisely around target
  if (candles.length > 0) {
    const last = candles[candles.length - 1]
    last.open = market === 'SENSEX' ? 79410.5 : 24246.5
    last.high = market === 'SENSEX' ? 79460.0 : 24254.1
    last.low = market === 'SENSEX' ? 79390.2 : 24238.9
    last.close = market === 'SENSEX' ? 79420.2 : 24250.7
    last.isGreen = true
  }

  return candles
}

export default function InteractiveIndianChart({
  market = 'NIFTY 50',
  timeframe = '15m',
  bullishZone,
  bearishZone,
  invalidationLevel = 24100,
  onBullishZoneChange,
  onBearishZoneChange,
  height = 460,
  readOnly = false,
}: InteractiveIndianChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  const [activeTf, setActiveTf] = useState(timeframe)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [activeTool, setActiveTool] = useState<'cursor' | 'line' | 'zone' | 'text' | 'measure'>('cursor')
  const [dragState, setDragState] = useState<{
    zone: 'bullish' | 'bearish'
    edge: 'top' | 'bottom' | 'move'
    startY: number
    initialFrom: number
    initialTo: number
  } | null>(null)

  const basePrice = market === 'SENSEX' ? 79420.2 : 24250.7
  const candles = useMemo(() => generateIndianCandles(market, basePrice), [market, activeTf])

  const latestCandle = candles[candles.length - 1] || {
    open: 24246.5,
    high: 24254.1,
    low: 24238.9,
    close: 24250.7,
  }

  // Calculate price boundaries for scaling
  const allPrices = candles.flatMap((c) => [c.high, c.low])
  allPrices.push(bullishZone.from, bullishZone.to, bearishZone.from, bearishZone.to)
  if (invalidationLevel) allPrices.push(invalidationLevel)

  const minPrice = Math.min(...allPrices) - 60
  const maxPrice = Math.max(...allPrices) + 60
  const priceRange = maxPrice - minPrice || 1

  // Chart dimensions inside SVG
  const paddingRight = 90
  const paddingBottom = 30
  const paddingTop = 20
  const paddingLeft = 10
  const chartHeight = height - paddingTop - paddingBottom

  // Conversion: price to Y pixel
  const priceToY = (price: number) => {
    const ratio = (price - minPrice) / priceRange
    return paddingTop + chartHeight * (1 - ratio)
  }

  // Conversion: Y pixel to price
  const yToPrice = (y: number) => {
    const ratio = (y - paddingTop) / chartHeight
    const raw = maxPrice - ratio * priceRange
    return Math.round(raw / 5) * 5 // snap to nearest 5 points
  }

  // Price scale grid steps
  const priceStep = market === 'SENSEX' ? 200 : 100
  const startGridPrice = Math.ceil(minPrice / priceStep) * priceStep
  const gridPrices = []
  for (let p = startGridPrice; p <= maxPrice; p += priceStep) {
    gridPrices.push(p)
  }

  // Handle Dragging / Resizing of Zones directly on the chart
  const handleMouseDown = (zone: 'bullish' | 'bearish', edge: 'top' | 'bottom' | 'move', e: React.MouseEvent) => {
    if (readOnly) return
    e.stopPropagation()
    const target = zone === 'bullish' ? bullishZone : bearishZone
    setDragState({
      zone,
      edge,
      startY: e.clientY,
      initialFrom: target.from,
      initialTo: target.to,
    })
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragState || !svgRef.current) return
      const rect = svgRef.current.getBoundingClientRect()
      const currentY = e.clientY - rect.top
      const newPrice = yToPrice(currentY)

      if (dragState.zone === 'bullish' && onBullishZoneChange) {
        if (dragState.edge === 'top') {
          onBullishZoneChange({
            ...bullishZone,
            to: Math.max(newPrice, bullishZone.from + 10),
          })
        } else if (dragState.edge === 'bottom') {
          onBullishZoneChange({
            ...bullishZone,
            from: Math.min(newPrice, bullishZone.to - 10),
          })
        } else if (dragState.edge === 'move') {
          const deltaPrice = yToPrice(e.clientY) - yToPrice(dragState.startY)
          onBullishZoneChange({
            ...bullishZone,
            from: Math.round(dragState.initialFrom + deltaPrice),
            to: Math.round(dragState.initialTo + deltaPrice),
          })
        }
      } else if (dragState.zone === 'bearish' && onBearishZoneChange) {
        if (dragState.edge === 'top') {
          onBearishZoneChange({
            ...bearishZone,
            to: Math.max(newPrice, bearishZone.from + 10),
          })
        } else if (dragState.edge === 'bottom') {
          onBearishZoneChange({
            ...bearishZone,
            from: Math.min(newPrice, bearishZone.to - 10),
          })
        } else if (dragState.edge === 'move') {
          const deltaPrice = yToPrice(e.clientY) - yToPrice(dragState.startY)
          onBearishZoneChange({
            ...bearishZone,
            from: Math.round(dragState.initialFrom + deltaPrice),
            to: Math.round(dragState.initialTo + deltaPrice),
          })
        }
      }
    }

    const handleMouseUp = () => {
      setDragState(null)
    }

    if (dragState) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [dragState, bullishZone, bearishZone, onBullishZoneChange, onBearishZoneChange])

  // Zone Coordinates
  const bearishYTop = Math.min(priceToY(bearishZone.to), priceToY(bearishZone.from))
  const bearishYBottom = Math.max(priceToY(bearishZone.to), priceToY(bearishZone.from))
  const bearishHeight = Math.max(16, bearishYBottom - bearishYTop)

  const bullishYTop = Math.min(priceToY(bullishZone.to), priceToY(bullishZone.from))
  const bullishYBottom = Math.max(priceToY(bullishZone.to), priceToY(bullishZone.from))
  const bullishHeight = Math.max(16, bullishYBottom - bullishYTop)

  const currentPriceY = priceToY(latestCandle.close)

  return (
    <div
      ref={containerRef}
      className={`rounded-xl border border-[var(--border-subtle)] bg-[#0C1019] overflow-hidden flex flex-col select-none transition-all ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none border-none' : ''
      }`}
      style={{ height: isFullscreen ? '100vh' : height + 50 }}
    >
      {/* Top Chart Header matching Screenshot 2 */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2.5 border-b border-[#1A2234] bg-[#0E1424] gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-white tracking-wide">
              {market} &middot; {activeTf} &middot; NSE
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>

          {/* Timeframe Buttons */}
          <div className="flex items-center gap-1 bg-[#131B2E] p-0.5 rounded-md border border-[#1E293B]">
            {['5m', '15m', '1H', '4H', 'D'].map((tf) => (
              <button
                key={tf}
                type="button"
                onClick={() => setActiveTf(tf)}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all ${
                  activeTf === tf
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* OHLC Bar */}
          <div className="hidden lg:flex items-center gap-2.5 text-[11px] font-mono">
            <span className="text-slate-400">O <span className="text-white">{latestCandle.open.toFixed(2)}</span></span>
            <span className="text-slate-400">H <span className="text-emerald-400">{latestCandle.high.toFixed(2)}</span></span>
            <span className="text-slate-400">L <span className="text-rose-400">{latestCandle.low.toFixed(2)}</span></span>
            <span className="text-slate-400">C <span className="text-emerald-400">{latestCandle.close.toFixed(2)}</span></span>
            <span className="text-emerald-400 font-bold">+4.20 (+0.02%)</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-[#1A2234] transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>
      </div>

      {/* Main Chart Body: Left Toolbar + Candlestick SVG + Right Price Scale */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Toolbar (matching Screenshot 2) */}
        {!readOnly && (
          <div className="w-10 border-r border-[#1A2234] bg-[#0E1424] flex flex-col items-center py-2.5 gap-2 z-10">
            <button
              type="button"
              onClick={() => setActiveTool('cursor')}
              className={`p-1.5 rounded transition-all ${
                activeTool === 'cursor' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Crosshair Cursor"
            >
              <Crosshair size={15} />
            </button>
            <button
              type="button"
              onClick={() => setActiveTool('line')}
              className={`p-1.5 rounded transition-all ${
                activeTool === 'line' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Trendline Tool"
            >
              <Slash size={15} />
            </button>
            <button
              type="button"
              onClick={() => setActiveTool('zone')}
              className={`p-1.5 rounded transition-all ${
                activeTool === 'zone' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Zone Rectangle Tool (Click & Drag to mark)"
            >
              <Square size={15} />
            </button>
            <button
              type="button"
              onClick={() => setActiveTool('text')}
              className={`p-1.5 rounded transition-all ${
                activeTool === 'text' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Annotation Text Tool"
            >
              <Type size={15} />
            </button>
            <button
              type="button"
              onClick={() => setActiveTool('measure')}
              className={`p-1.5 rounded transition-all ${
                activeTool === 'measure' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Measure Risk / Reward"
            >
              <Ruler size={15} />
            </button>
            <button
              type="button"
              className="p-1.5 rounded text-slate-400 hover:text-white transition-all mt-auto"
              title="Zoom In"
            >
              <ZoomIn size={15} />
            </button>
          </div>
        )}

        {/* SVG Drawing Canvas & Candlesticks */}
        <div className="flex-1 relative overflow-hidden bg-[#0A0D16]">
          <svg
            ref={svgRef}
            className="w-full h-full cursor-crosshair"
            viewBox={`0 0 1000 ${height}`}
            preserveAspectRatio="none"
          >
            <defs>
              {/* Bearish Gradient */}
              <linearGradient id="bearishGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#EF4444" stopOpacity="0.28" />
                <stop offset="100%" stopColor="#EF4444" stopOpacity="0.14" />
              </linearGradient>
              {/* Bullish Gradient */}
              <linearGradient id="bullishGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22C55E" stopOpacity="0.28" />
                <stop offset="100%" stopColor="#22C55E" stopOpacity="0.14" />
              </linearGradient>
            </defs>

            {/* Grid Lines */}
            {gridPrices.map((price) => {
              const y = priceToY(price)
              return (
                <g key={price}>
                  <line
                    x1="0"
                    y1={y}
                    x2={1000 - paddingRight}
                    y2={y}
                    stroke="#161E30"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                  {/* Right Axis Price Label */}
                  <text
                    x={1000 - paddingRight + 8}
                    y={y + 3.5}
                    fill="#64748B"
                    fontSize="10"
                    fontFamily="monospace"
                  >
                    {price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </text>
                </g>
              )
            })}

            {/* Time Grid Lines */}
            {candles.map((c, i) => {
              if (i % 8 !== 0) return null
              const x = (i / candles.length) * (1000 - paddingRight - paddingLeft) + paddingLeft
              return (
                <g key={i}>
                  <line
                    x1={x}
                    y1={paddingTop}
                    x2={x}
                    y2={height - paddingBottom}
                    stroke="#141B2B"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                  />
                  <text
                    x={x}
                    y={height - 10}
                    fill="#64748B"
                    fontSize="10"
                    fontFamily="monospace"
                    textAnchor="middle"
                  >
                    {c.day ? `${c.day} ` : ''}{c.time}
                  </text>
                </g>
              )
            })}

            {/* VISUAL BEARISH ZONE OVERLAY (Red Box matching Screenshot 2) */}
            {bearishZone && bearishZone.from > 0 && bearishZone.to > 0 && (
              <g className="group transition-all">
                {/* Translucent Zone Box */}
                <rect
                  x="40"
                  y={bearishYTop}
                  width={1000 - paddingRight - 40}
                  height={bearishHeight}
                  fill="url(#bearishGrad)"
                  stroke="#EF4444"
                  strokeWidth="1.5"
                  className={readOnly ? '' : 'cursor-move hover:stroke-rose-400'}
                  onMouseDown={(e) => handleMouseDown('bearish', 'move', e)}
                />
                {/* Top Drag Handle */}
                {!readOnly && (
                  <rect
                    x="40"
                    y={bearishYTop - 3}
                    width={1000 - paddingRight - 40}
                    height="6"
                    fill="transparent"
                    className="cursor-ns-resize"
                    onMouseDown={(e) => handleMouseDown('bearish', 'top', e)}
                  />
                )}
                {/* Bottom Drag Handle */}
                {!readOnly && (
                  <rect
                    x="40"
                    y={bearishYBottom - 3}
                    width={1000 - paddingRight - 40}
                    height="6"
                    fill="transparent"
                    className="cursor-ns-resize"
                    onMouseDown={(e) => handleMouseDown('bearish', 'bottom', e)}
                  />
                )}
                {/* Zone Label Badge (Top-Right inside zone) */}
                <rect
                  x={1000 - paddingRight - 150}
                  y={bearishYTop + 4}
                  width="142"
                  height="20"
                  rx="4"
                  fill="#7F1D1D"
                  fillOpacity="0.85"
                  stroke="#EF4444"
                  strokeWidth="1"
                />
                <text
                  x={1000 - paddingRight - 79}
                  y={bearishYTop + 18}
                  fill="#FECDD3"
                  fontSize="9.5"
                  fontWeight="bold"
                  textAnchor="middle"
                  letterSpacing="0.5"
                >
                  BEARISH ZONE {bearishZone.from} - {bearishZone.to}
                </text>
              </g>
            )}

            {/* VISUAL BULLISH ZONE OVERLAY (Green Box matching Screenshot 2) */}
            {bullishZone && bullishZone.from > 0 && bullishZone.to > 0 && (
              <g className="group transition-all">
                {/* Translucent Zone Box */}
                <rect
                  x="40"
                  y={bullishYTop}
                  width={1000 - paddingRight - 40}
                  height={bullishHeight}
                  fill="url(#bullishGrad)"
                  stroke="#22C55E"
                  strokeWidth="1.5"
                  className={readOnly ? '' : 'cursor-move hover:stroke-emerald-400'}
                  onMouseDown={(e) => handleMouseDown('bullish', 'move', e)}
                />
                {/* Top Drag Handle */}
                {!readOnly && (
                  <rect
                    x="40"
                    y={bullishYTop - 3}
                    width={1000 - paddingRight - 40}
                    height="6"
                    fill="transparent"
                    className="cursor-ns-resize"
                    onMouseDown={(e) => handleMouseDown('bullish', 'top', e)}
                  />
                )}
                {/* Bottom Drag Handle */}
                {!readOnly && (
                  <rect
                    x="40"
                    y={bullishYBottom - 3}
                    width={1000 - paddingRight - 40}
                    height="6"
                    fill="transparent"
                    className="cursor-ns-resize"
                    onMouseDown={(e) => handleMouseDown('bullish', 'bottom', e)}
                  />
                )}
                {/* Zone Label Badge (Bottom-Right inside zone) */}
                <rect
                  x={1000 - paddingRight - 150}
                  y={bullishYTop + 4}
                  width="142"
                  height="20"
                  rx="4"
                  fill="#14532D"
                  fillOpacity="0.85"
                  stroke="#22C55E"
                  strokeWidth="1"
                />
                <text
                  x={1000 - paddingRight - 79}
                  y={bullishYTop + 18}
                  fill="#BBF7D0"
                  fontSize="9.5"
                  fontWeight="bold"
                  textAnchor="middle"
                  letterSpacing="0.5"
                >
                  BULLISH ZONE {bullishZone.from} - {bullishZone.to}
                </text>
              </g>
            )}

            {/* CANDLESTICKS */}
            {candles.map((c, i) => {
              const x = (i / candles.length) * (1000 - paddingRight - paddingLeft) + paddingLeft
              const candleWidth = Math.max(3, (1000 - paddingRight) / candles.length - 3)

              const yHigh = priceToY(c.high)
              const yLow = priceToY(c.low)
              const yOpen = priceToY(c.open)
              const yClose = priceToY(c.close)

              const rectY = Math.min(yOpen, yClose)
              const rectHeight = Math.max(2, Math.abs(yClose - yOpen))
              const color = c.isGreen ? '#22C55E' : '#EF4444'

              return (
                <g key={i} className="hover:opacity-80">
                  {/* Upper/Lower Wick */}
                  <line
                    x1={x + candleWidth / 2}
                    y1={yHigh}
                    x2={x + candleWidth / 2}
                    y2={yLow}
                    stroke={color}
                    strokeWidth="1.25"
                  />
                  {/* Real Body */}
                  <rect
                    x={x}
                    y={rectY}
                    width={candleWidth}
                    height={rectHeight}
                    fill={color}
                    rx="1"
                  />
                </g>
              )
            })}

            {/* CURRENT LIVE PRICE DASHED LINE */}
            <line
              x1="0"
              y1={currentPriceY}
              x2={1000 - paddingRight}
              y2={currentPriceY}
              stroke="#22C55E"
              strokeWidth="1"
              strokeDasharray="4 3"
            />
            {/* Live Price Tag on Axis */}
            <rect
              x={1000 - paddingRight}
              y={currentPriceY - 9}
              width="85"
              height="18"
              rx="3"
              fill="#22C55E"
            />
            <text
              x={1000 - paddingRight + 42}
              y={currentPriceY + 3.5}
              fill="#062812"
              fontSize="10"
              fontWeight="bold"
              fontFamily="monospace"
              textAnchor="middle"
            >
              {latestCandle.close.toFixed(2)}
            </text>

            {/* TradingView Logo Watermark (bottom-left) */}
            <g transform={`translate(20, ${height - 45})`} opacity="0.4">
              <rect width="24" height="24" rx="4" fill="#1E293B" />
              <text x="5" y="16" fill="#94A3B8" fontSize="12" fontWeight="black">17</text>
            </g>
          </svg>
        </div>
      </div>
    </div>
  )
}
