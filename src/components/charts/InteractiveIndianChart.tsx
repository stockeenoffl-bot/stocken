import { useState, useRef, useEffect, useCallback } from 'react'
import { createChart, ColorType, IChartApi, ISeriesApi, Time, CandlestickData } from 'lightweight-charts'
import {
  Maximize2,
  Minimize2,
  Crosshair,
  Slash,
  Square,
  Type,
  Radio,
  RotateCcw,
} from 'lucide-react'
import { aliceBlueService } from '@/services/aliceBlueService'

export interface ZoneDefinition {
  from: number
  to: number
  color?: string
  label?: string
}

export interface LogicalDrawing {
  id: string
  type: 'line' | 'zone' | 'text'
  time1: number
  price1: number
  time2: number
  price2: number
  text?: string
}

interface InteractiveIndianChartProps {
  market?: string
  timeframe?: string
  bullishZone: ZoneDefinition
  bearishZone: ZoneDefinition
  invalidationLevel?: number
  onBullishZoneChange?: (zone: ZoneDefinition) => void
  onBearishZoneChange?: (zone: ZoneDefinition) => void
  customDrawings?: LogicalDrawing[]
  onCustomDrawingsChange?: (drawings: LogicalDrawing[]) => void
  height?: number
  readOnly?: boolean
}

function generateIndianCandles(market: string, basePrice: number, count = 100) {
  const candles: CandlestickData[] = []
  let current = basePrice - 180
  const now = Math.floor(Date.now() / 1000)
  const interval = 15 * 60 // 15m in seconds

  for (let i = count; i >= 0; i--) {
    const time = (now - i * interval) as Time
    const volatility = market === 'SENSEX' ? 45 : 16
    const dir = Math.sin(i * 0.35) + (Math.random() - 0.48)
    const change = dir * volatility

    const open = Number(current.toFixed(2))
    const close = Number((open + change).toFixed(2))
    const high = Number((Math.max(open, close) + Math.random() * (volatility * 0.8)).toFixed(2))
    const low = Number((Math.min(open, close) - Math.random() * (volatility * 0.8)).toFixed(2))

    candles.push({ time, open, high, low, close })
    current = close
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
  customDrawings: externalCustomDrawings,
  onCustomDrawingsChange,
  height = 460,
  readOnly = false,
}: InteractiveIndianChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null)

  const [activeTf, setActiveTf] = useState(timeframe)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [activeTool, setActiveTool] = useState<'cursor' | 'line' | 'zone' | 'text'>('cursor')
  
  const [internalCustomDrawings, setInternalCustomDrawings] = useState<LogicalDrawing[]>([])
  const customDrawings = externalCustomDrawings ?? internalCustomDrawings
  const setCustomDrawings = onCustomDrawingsChange ?? setInternalCustomDrawings

  const [currentDrawing, setCurrentDrawing] = useState<{
    type: 'line' | 'zone' | 'text'
    x1: number
    y1: number
    x2: number
    y2: number
  } | null>(null)
  
  // Need to force re-render when chart pans/zooms to update SVG overlay
  const [, setRenderTrigger] = useState(0)
  const forceUpdate = useCallback(() => setRenderTrigger(t => t + 1), [])

  const [liveQuote, setLiveQuote] = useState<any>(null)
  const [lastTickDir, setLastTickDir] = useState<'up' | 'down' | 'flat'>('flat')
  
  const basePrice = market === 'SENSEX' ? 79420.2 : 24250.7

  // Initialize Lightweight Chart
  useEffect(() => {
    if (!chartContainerRef.current) return

    const handleResize = () => {
      chartRef.current?.applyOptions({ width: chartContainerRef.current?.clientWidth })
      forceUpdate()
    }

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#0A0D16' },
        textColor: '#64748B',
      },
      grid: {
        vertLines: { color: '#161E30', style: 3 }, // style 3 is dashed
        horzLines: { color: '#161E30', style: 3 },
      },
      crosshair: {
        mode: 1, // Normal mode
        vertLine: { color: '#334155', width: 1, style: 1 },
        horzLine: { color: '#334155', width: 1, style: 1 },
      },
      timeScale: {
        borderColor: '#1A2234',
        timeVisible: true,
        secondsVisible: false,
      },
      rightPriceScale: {
        borderColor: '#1A2234',
      },
      width: chartContainerRef.current.clientWidth,
      height: isFullscreen ? window.innerHeight - 50 : height - 50,
    })

    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#22C55E',
      downColor: '#EF4444',
      borderVisible: false,
      wickUpColor: '#22C55E',
      wickDownColor: '#EF4444',
    })

    chartRef.current = chart
    seriesRef.current = candlestickSeries

    // Load initial data
    const fetchHistory = async () => {
      try {
        const toTime = Date.now()
        const fromTime = toTime - 3 * 24 * 60 * 60 * 1000
        const data = await aliceBlueService.getHistoricalData({
          symbol: market,
          exchange: 'NSE',
          resolution: '1',
          from: fromTime,
          to: toTime
        })

        if (data && data.length > 0) {
          const mapped = data.map((d: any) => ({
            time: (new Date(d.time).getTime() / 1000) as Time,
            open: d.open,
            high: d.high,
            low: d.low,
            close: d.close,
          })).sort((a: any, b: any) => (a.time as number) - (b.time as number))
          candlestickSeries.setData(mapped)
        } else {
          candlestickSeries.setData(generateIndianCandles(market, basePrice))
        }
      } catch (err) {
        candlestickSeries.setData(generateIndianCandles(market, basePrice))
      }
      
      // Auto scale once data is loaded
      chart.timeScale().fitContent()
    }
    fetchHistory()

    chart.timeScale().subscribeVisibleTimeRangeChange(() => {
      forceUpdate()
    })
    chart.subscribeCrosshairMove(() => {
      forceUpdate()
    })

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      chart.remove()
    }
  }, [market, height, isFullscreen])

  // Real-time WebSockets Live Data
  useEffect(() => {
    let lastP = basePrice
    const token = market === 'SENSEX' ? 'BSE|1' : 'NSE|26000'
    let unsubscribeWs = () => {}

    const setupWs = async () => {
      try {
        await aliceBlueService.connectWebSocket()
        aliceBlueService.subscribeMarketData(token)
        
        unsubscribeWs = aliceBlueService.onWsMessage((data) => {
          if ((data.t === 'tf' || data.t === 'tk') && data.lp) {
            const ltp = parseFloat(data.lp)
            if (isNaN(ltp)) return
            
            if (ltp > lastP) setLastTickDir('up')
            else if (ltp < lastP) setLastTickDir('down')
            lastP = ltp
            
            setLiveQuote((prev: any) => {
              const updated = {
                ltp,
                change: data.pc ? (ltp * parseFloat(data.pc) / 100) : (prev?.change ?? 0),
                changePercent: data.pc ? parseFloat(data.pc) : (prev?.changePercent ?? 0),
                open: data.o ? parseFloat(data.o) : (prev?.open ?? ltp),
                high: data.h ? parseFloat(data.h) : Math.max(prev?.high ?? ltp, ltp),
                low: data.l ? parseFloat(data.l) : Math.min(prev?.low ?? ltp, ltp),
              }
              // Update chart candle
              if (seriesRef.current) {
                const now = Math.floor(Date.now() / 1000) as Time
                seriesRef.current.update({
                  time: now,
                  open: updated.open,
                  high: updated.high,
                  low: updated.low,
                  close: updated.ltp,
                })
                forceUpdate()
              }
              return updated
            })
          }
        })
      } catch (err) {
        console.warn('Alice Blue WS stream error:', err)
      }
    }
    
    setupWs()

    return () => {
      unsubscribeWs()
    }
  }, [market, basePrice])

  // Drawing Tools Logic
  const handleSvgMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (readOnly || activeTool === 'cursor' || !chartRef.current || !seriesRef.current) return

    const rect = svgRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    if (activeTool === 'text') {
      const text = window.prompt('Enter annotation text:')
      if (text) {
        const time = chartRef.current.timeScale().coordinateToTime(x) as number
        const price = seriesRef.current.coordinateToPrice(y)
        if (time && price) {
          setCustomDrawings([
            ...customDrawings,
            { id: Date.now().toString(), type: 'text', time1: time, price1: price, time2: time, price2: price, text },
          ])
        }
      }
      setActiveTool('cursor')
      return
    }

    if (activeTool === 'line' || activeTool === 'zone') {
      setCurrentDrawing({ type: activeTool, x1: x, y1: y, x2: x, y2: y })
    }
  }

  const handleSvgMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!currentDrawing || readOnly) return
    const rect = svgRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    setCurrentDrawing((prev) => (prev ? { ...prev, x2: x, y2: y } : null))
  }

  const handleSvgMouseUp = () => {
    if (currentDrawing && chartRef.current && seriesRef.current) {
      if (Math.abs(currentDrawing.x2 - currentDrawing.x1) > 2 || Math.abs(currentDrawing.y2 - currentDrawing.y1) > 2) {
        
        const time1 = chartRef.current.timeScale().coordinateToTime(currentDrawing.x1) as number
        const price1 = seriesRef.current.coordinateToPrice(currentDrawing.y1)
        const time2 = chartRef.current.timeScale().coordinateToTime(currentDrawing.x2) as number
        const price2 = seriesRef.current.coordinateToPrice(currentDrawing.y2)

        if (time1 && price1 && time2 && price2) {
          setCustomDrawings([
            ...customDrawings,
            { id: Date.now().toString(), type: currentDrawing.type, time1, price1, time2, price2 }
          ])
        }
      }
      setCurrentDrawing(null)
    }
  }

  const mapLogicalToScreen = (d: LogicalDrawing) => {
    if (!chartRef.current || !seriesRef.current) return null
    const x1 = chartRef.current.timeScale().timeToCoordinate(d.time1 as Time)
    const y1 = seriesRef.current.priceToCoordinate(d.price1)
    const x2 = chartRef.current.timeScale().timeToCoordinate(d.time2 as Time)
    const y2 = seriesRef.current.priceToCoordinate(d.price2)

    if (x1 === null || y1 === null || x2 === null || y2 === null) return null
    return { ...d, x1, y1, x2, y2 }
  }

  const mappedDrawings = customDrawings.map(mapLogicalToScreen).filter(Boolean) as any[]

  // Bullish/Bearish predefined Zones to SVG
  const mapZoneToScreen = (zone: ZoneDefinition) => {
    if (!seriesRef.current || !chartRef.current) return null
    const yTop = seriesRef.current.priceToCoordinate(zone.to)
    const yBottom = seriesRef.current.priceToCoordinate(zone.from)
    if (yTop === null || yBottom === null) return null
    const width = chartRef.current.timeScale().width() - 50 // Leave space for price scale
    return {
      y: Math.min(yTop, yBottom),
      height: Math.abs(yBottom - yTop),
      width
    }
  }
  const bullishScreenZone = mapZoneToScreen(bullishZone)
  const bearishScreenZone = mapZoneToScreen(bearishZone)

  return (
    <div
      className={`rounded-xl border border-[var(--border-subtle)] bg-[#0C1019] overflow-hidden flex flex-col select-none transition-all ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none border-none' : ''
      }`}
      style={{ height: isFullscreen ? '100vh' : height }}
    >
      {/* Top Chart Header */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2.5 border-b border-[#1A2234] bg-[#0E1424] gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-white tracking-wide">
              {market} &middot; {activeTf} &middot; NSE
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>

          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-bold text-emerald-400">
            <Radio size={11} className="animate-pulse" />
            <span>Alice Blue Live Feed</span>
          </div>

          <div className="hidden lg:flex items-center gap-2.5 text-[11px] font-mono">
            {liveQuote ? (
              <>
                <span className="text-slate-400">O <span className="text-white">{liveQuote.open?.toFixed(2)}</span></span>
                <span className="text-slate-400">H <span className="text-emerald-400">{liveQuote.high?.toFixed(2)}</span></span>
                <span className="text-slate-400">L <span className="text-rose-400">{liveQuote.low?.toFixed(2)}</span></span>
                <span className="text-slate-400">
                  C{' '}
                  <span className={`font-bold px-1 rounded transition-colors ${
                    lastTickDir === 'up' ? 'bg-emerald-500/20 text-emerald-300' :
                    lastTickDir === 'down' ? 'bg-rose-500/20 text-rose-300' : 'text-emerald-400'
                  }`}>
                    {liveQuote.ltp?.toFixed(2)}
                  </span>
                </span>
              </>
            ) : (
              <span className="text-slate-500">Waiting for tick data...</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={() => setIsFullscreen(!isFullscreen)} className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-[#1A2234]">
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Toolbar */}
        {!readOnly && (
          <div className="w-10 border-r border-[#1A2234] bg-[#0E1424] flex flex-col items-center py-2.5 gap-2 z-20">
            <button onClick={() => setActiveTool('cursor')} className={`p-1.5 rounded transition-all ${activeTool === 'cursor' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>
              <Crosshair size={15} />
            </button>
            <button onClick={() => setActiveTool('line')} className={`p-1.5 rounded transition-all ${activeTool === 'line' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>
              <Slash size={15} />
            </button>
            <button onClick={() => setActiveTool('zone')} className={`p-1.5 rounded transition-all ${activeTool === 'zone' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>
              <Square size={15} />
            </button>
            <button onClick={() => setActiveTool('text')} className={`p-1.5 rounded transition-all ${activeTool === 'text' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>
              <Type size={15} />
            </button>
          </div>
        )}

        {/* Chart Area */}
        <div className="flex-1 relative">
          <div ref={chartContainerRef} className="absolute inset-0" />
          
          {/* Drawing SVG Overlay */}
          <svg
            ref={svgRef}
            className={`absolute inset-0 w-full h-full z-10 ${activeTool !== 'cursor' ? 'cursor-crosshair pointer-events-auto' : 'pointer-events-none'}`}
            onMouseDown={handleSvgMouseDown}
            onMouseMove={handleSvgMouseMove}
            onMouseUp={handleSvgMouseUp}
            onMouseLeave={handleSvgMouseUp}
          >
            {/* Bullish & Bearish Built-in Zones */}
            {bearishScreenZone && (
              <rect
                x={0}
                y={bearishScreenZone.y}
                width={bearishScreenZone.width}
                height={bearishScreenZone.height}
                fill="#EF4444"
                fillOpacity="0.15"
                stroke="#EF4444"
                strokeWidth="1"
              />
            )}
            {bullishScreenZone && (
              <rect
                x={0}
                y={bullishScreenZone.y}
                width={bullishScreenZone.width}
                height={bullishScreenZone.height}
                fill="#22C55E"
                fillOpacity="0.15"
                stroke="#22C55E"
                strokeWidth="1"
              />
            )}

            {/* User Custom Drawings */}
            {[...mappedDrawings, ...(currentDrawing ? [{ id: 'current', ...currentDrawing }] : [])].map((d) => {
              if (d.type === 'line') {
                return (
                  <line key={d.id} x1={d.x1} y1={d.y1} x2={d.x2} y2={d.y2} stroke="#6366F1" strokeWidth="2"
                    className="pointer-events-auto cursor-pointer"
                    onDoubleClick={() => !readOnly && setCustomDrawings(customDrawings.filter((p) => p.id !== d.id))}
                  />
                )
              } else if (d.type === 'zone') {
                const x = Math.min(d.x1, d.x2)
                const y = Math.min(d.y1, d.y2)
                const w = Math.abs(d.x2 - d.x1)
                const h = Math.abs(d.y2 - d.y1)
                return (
                  <rect key={d.id} x={x} y={y} width={w} height={h} fill="#3B82F6" fillOpacity="0.2" stroke="#3B82F6" strokeWidth="1.5"
                    className="pointer-events-auto cursor-pointer"
                    onDoubleClick={() => !readOnly && setCustomDrawings(customDrawings.filter((p) => p.id !== d.id))}
                  />
                )
              } else if (d.type === 'text') {
                return (
                  <text key={d.id} x={d.x1} y={d.y1} fill="#E2E8F0" fontSize="12" fontWeight="bold"
                    className="pointer-events-auto cursor-pointer"
                    onDoubleClick={() => !readOnly && setCustomDrawings(customDrawings.filter((p) => p.id !== d.id))}
                  >
                    {d.text}
                  </text>
                )
              }
              return null
            })}
          </svg>
        </div>
      </div>
    </div>
  )
}
