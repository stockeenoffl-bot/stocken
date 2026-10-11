import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  createChart,
  ColorType,
  CrosshairMode,
  CandlestickSeries,
  HistogramSeries,
  type IChartApi,
  type ISeriesApi,
  type UTCTimestamp,
  type MouseEventParams,
} from 'lightweight-charts'
import {
  AlertTriangle,
  Crosshair,
  Loader2,
  Maximize2,
  Minimize2,
  Minus,
  Radio,
  RefreshCw,
  Search,
  Slash,
  Square,
  Trash2,
  Type,
  Undo2,
  Wifi,
  WifiOff,
} from 'lucide-react'
import { aliceBlueService, type AliceBlueQuote, type HistoryResponse } from '@/services/aliceBlueService'
import { marketDataService } from '@/services/marketDataService'
import {
  RANGES,
  TIMEFRAMES,
  bucketStart,
  fmtPrice,
  fromChartTime,
  isMarketOpenIST,
  toChartTime,
  type RangeKey,
  type Timeframe,
} from '@/lib/candles'
import type { ChartDrawing, DrawingType, ZoneDefinition } from '@/types/chart'

export type { ChartDrawing, ZoneDefinition }

const BAR_SECONDS: Record<string, number> = {
  '1m': 60, '5m': 300, '15m': 900, '30m': 1800, '1H': 3600, '4H': 14400, D: 86400, W: 604800, M: 2629800,
}

const QUICK_SYMBOLS = ['NIFTY 50', 'BANKNIFTY', 'FINNIFTY', 'SENSEX', 'INDIA VIX']

type Tool = 'cursor' | DrawingType

interface LiveChartProps {
  symbol?: string
  defaultTimeframe?: Timeframe
  defaultRange?: RangeKey
  height?: number
  bullishZone?: ZoneDefinition
  bearishZone?: ZoneDefinition
  liquidityZone?: ZoneDefinition
  invalidationLevel?: number | string
  drawings?: ChartDrawing[]
  /** Admin-only: enables drawing tools. Users always get a read-only chart. */
  editable?: boolean
  onDrawingsChange?: (d: ChartDrawing[]) => void
  onViewChange?: (v: { timeframe: Timeframe; range: RangeKey }) => void
  allowSymbolChange?: boolean
  onSymbolChange?: (symbol: string) => void
}

const validZone = (z?: ZoneDefinition) => Boolean(z && z.from > 0 && z.to > 0)

export default function LiveChart({
  symbol = 'NIFTY 50',
  defaultTimeframe = '15m',
  defaultRange = '1W',
  height = 520,
  bullishZone,
  bearishZone,
  liquidityZone,
  invalidationLevel,
  drawings = [],
  editable = false,
  onDrawingsChange,
  onViewChange,
  allowSymbolChange = false,
  onSymbolChange,
}: LiveChartProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const candleRef = useRef<ISeriesApi<'Candlestick'> | null>(null)
  const volumeRef = useRef<ISeriesApi<'Histogram'> | null>(null)
  const dataRef = useRef<Array<{ time: number; open: number; high: number; low: number; close: number; volume: number }>>([])
  const fitNextRef = useRef(true)
  const rafRef = useRef(0)

  const [timeframe, setTimeframe] = useState<Timeframe>(defaultTimeframe)
  const [range, setRange] = useState<RangeKey>(defaultRange)
  const [fullscreen, setFullscreen] = useState(false)
  const [tool, setTool] = useState<Tool>('cursor')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [meta, setMeta] = useState<Pick<HistoryResponse, 'source' | 'clamped' | 'marketOpen'> | null>(null)
  const [quote, setQuote] = useState<AliceBlueQuote | null>(null)
  const [tickDir, setTickDir] = useState<'up' | 'down' | 'flat'>('flat')
  const [hover, setHover] = useState<{ open: number; high: number; low: number; close: number } | null>(null)
  const [, setOverlayTick] = useState(0)
  const [draft, setDraft] = useState<{ type: DrawingType; x1: number; y1: number; x2: number; y2: number } | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [searchResults, setSearchResults] = useState<Array<{ symbol: string; ref: string; name: string; exchange: string }>>([])
  const lastPriceRef = useRef(0)

  // Admin pushed a new default view -> follow it
  useEffect(() => { setTimeframe(defaultTimeframe) }, [defaultTimeframe])
  useEffect(() => { setRange(defaultRange) }, [defaultRange])
  useEffect(() => { fitNextRef.current = true }, [symbol])

  const scheduleOverlay = useCallback(() => {
    if (rafRef.current) return
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = 0
      setOverlayTick((t) => t + 1)
    })
  }, [])

  // ---------------------------------------------------------------- chart init
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const chart = createChart(el, {
      autoSize: true,
      layout: { background: { type: ColorType.Solid, color: '#0A0D16' }, textColor: '#94A3B8', fontSize: 11 },
      grid: { vertLines: { color: '#131A2B' }, horzLines: { color: '#131A2B' } },
      crosshair: { mode: CrosshairMode.Normal },
      rightPriceScale: { borderColor: '#1A2234', scaleMargins: { top: 0.08, bottom: 0.18 } },
      timeScale: { borderColor: '#1A2234', timeVisible: true, secondsVisible: false, rightOffset: 6 },
      localization: { priceFormatter: (p: number) => fmtPrice(p) },
    })

    const candles = chart.addSeries(CandlestickSeries, {
      upColor: '#22C55E',
      downColor: '#EF4444',
      borderVisible: false,
      wickUpColor: '#22C55E',
      wickDownColor: '#EF4444',
      priceFormat: { type: 'price', precision: 2, minMove: 0.05 },
    })
    const volume = chart.addSeries(HistogramSeries, {
      priceFormat: { type: 'volume' },
      priceScaleId: 'vol',
      lastValueVisible: false,
      priceLineVisible: false,
    })
    chart.priceScale('vol').applyOptions({ scaleMargins: { top: 0.84, bottom: 0 } })

    chartRef.current = chart
    candleRef.current = candles
    volumeRef.current = volume

    chart.timeScale().subscribeVisibleLogicalRangeChange(scheduleOverlay)
    const onCross = (p: MouseEventParams) => {
      const d: any = p.seriesData.get(candles)
      setHover(d && typeof d.open === 'number' ? { open: d.open, high: d.high, low: d.low, close: d.close } : null)
      scheduleOverlay()
    }
    chart.subscribeCrosshairMove(onCross)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = 0
      chart.unsubscribeCrosshairMove(onCross)
      chart.remove()
      chartRef.current = null
      candleRef.current = null
      volumeRef.current = null
    }
  }, [scheduleOverlay])

  // ---------------------------------------------------------------- history
  const applyHistory = useCallback((res: HistoryResponse) => {
    const rows: typeof dataRef.current = []
    let prev = -1
    for (const c of res.candles) {
      const t = toChartTime(c.time)
      if (t <= prev) continue
      prev = t
      rows.push({ time: t, open: c.open, high: c.high, low: c.low, close: c.close, volume: c.volume })
    }
    dataRef.current = rows
    candleRef.current?.setData(rows.map((r) => ({ time: r.time as UTCTimestamp, open: r.open, high: r.high, low: r.low, close: r.close })))
    const hasVolume = rows.some((r) => r.volume > 0)
    volumeRef.current?.setData(
      hasVolume
        ? rows.map((r) => ({
            time: r.time as UTCTimestamp,
            value: r.volume,
            color: r.close >= r.open ? 'rgba(34,197,94,0.35)' : 'rgba(239,68,68,0.35)',
          }))
        : []
    )
    if (rows.length) lastPriceRef.current = rows[rows.length - 1].close
    if (fitNextRef.current) {
      chartRef.current?.timeScale().fitContent()
      fitNextRef.current = false
    }
    scheduleOverlay()
  }, [scheduleOverlay])

  useEffect(() => {
    let cancelled = false
    fitNextRef.current = true
    setLoading(true)
    setError(null)
    marketDataService
      .getHistory(symbol, timeframe, range)
      .then((res) => {
        if (cancelled) return
        applyHistory(res)
        setMeta({ source: res.source, clamped: res.clamped, marketOpen: res.marketOpen })
      })
      .catch((e: any) => {
        if (cancelled) return
        dataRef.current = []
        candleRef.current?.setData([])
        volumeRef.current?.setData([])
        setError(e?.message || 'Could not load market data')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [symbol, timeframe, range, reloadKey, applyHistory])

  // Silent refresh while the market is open (keeps candles exact vs broker)
  useEffect(() => {
    const id = setInterval(() => {
      if (document.hidden || !isMarketOpenIST()) return
      marketDataService
        .getHistory(symbol, timeframe, range)
        .then((res) => applyHistory(res))
        .catch(() => undefined)
    }, 60000)
    return () => clearInterval(id)
  }, [symbol, timeframe, range, applyHistory])

  // ---------------------------------------------------------------- live ticks
  useEffect(() => {
    const unsubscribe = aliceBlueService.subscribeQuotes([symbol], (quotes, m) => {
      const q = quotes.find((x) => x.symbol === symbol) || quotes[0]
      if (!q) return
      if (lastPriceRef.current && q.ltp !== lastPriceRef.current) setTickDir(q.ltp > lastPriceRef.current ? 'up' : 'down')
      setQuote(q)

      const series = candleRef.current
      const data = dataRef.current
      if (!series || !data.length || !m.marketOpen || !isMarketOpenIST()) return
      lastPriceRef.current = q.ltp

      const nowBucket = toChartTime(bucketStart(timeframe, Math.floor(Date.now() / 1000)))
      const last = data[data.length - 1]
      if (nowBucket > last.time) {
        const fresh = { time: nowBucket, open: last.close, high: Math.max(last.close, q.ltp), low: Math.min(last.close, q.ltp), close: q.ltp, volume: 0 }
        data.push(fresh)
        series.update({ time: fresh.time as UTCTimestamp, open: fresh.open, high: fresh.high, low: fresh.low, close: fresh.close })
      } else {
        last.high = Math.max(last.high, q.ltp)
        last.low = Math.min(last.low, q.ltp)
        last.close = q.ltp
        series.update({ time: last.time as UTCTimestamp, open: last.open, high: last.high, low: last.low, close: last.close })
      }
      scheduleOverlay()
    })
    return unsubscribe
  }, [symbol, timeframe, scheduleOverlay])

  // ---------------------------------------------------------------- fullscreen
  useEffect(() => {
    if (!fullscreen) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setFullscreen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [fullscreen])
  useEffect(() => { scheduleOverlay() }, [fullscreen, scheduleOverlay])

  // ---------------------------------------------------------------- symbol search
  useEffect(() => {
    if (!searchOpen || searchText.trim().length < 2) { setSearchResults([]); return }
    const id = setTimeout(() => {
      aliceBlueService.searchSymbols(searchText.trim()).then(setSearchResults).catch(() => setSearchResults([]))
    }, 250)
    return () => clearTimeout(id)
  }, [searchText, searchOpen])

  // ---------------------------------------------------------------- coordinate helpers
  const barSeconds = BAR_SECONDS[timeframe] || 900

  const timeToLogical = (t: number): number | null => {
    const arr = dataRef.current
    if (!arr.length) return null
    let lo = 0, hi = arr.length
    while (lo < hi) {
      const mid = (lo + hi) >> 1
      if (arr[mid].time < t) lo = mid + 1
      else hi = mid
    }
    if (lo < arr.length && arr[lo].time === t) return lo
    if (lo === 0) return (t - arr[0].time) / barSeconds
    if (lo === arr.length) return arr.length - 1 + (t - arr[arr.length - 1].time) / barSeconds
    return lo - 1 + (t - arr[lo - 1].time) / (arr[lo].time - arr[lo - 1].time)
  }

  const logicalToTime = (l: number): number | null => {
    const arr = dataRef.current
    if (!arr.length) return null
    if (l <= 0) return arr[0].time + l * barSeconds
    if (l >= arr.length - 1) return arr[arr.length - 1].time + (l - (arr.length - 1)) * barSeconds
    const lo = Math.floor(l)
    return arr[lo].time + (l - lo) * (arr[lo + 1].time - arr[lo].time)
  }

  const xFromUnix = (unix: number): number | null => {
    const chart = chartRef.current
    if (!chart) return null
    const l = timeToLogical(toChartTime(unix))
    if (l === null) return null
    const x = chart.timeScale().logicalToCoordinate(l as any)
    return x === null || x === undefined ? null : Number(x)
  }
  const yFromPrice = (p: number): number | null => {
    const y = candleRef.current?.priceToCoordinate(p)
    return y === null || y === undefined ? null : Number(y)
  }
  const pointFromEvent = (e: React.MouseEvent) => {
    const rect = svgRef.current!.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }
  const toData = (x: number, y: number) => {
    const chart = chartRef.current
    const series = candleRef.current
    if (!chart || !series) return null
    const l = chart.timeScale().coordinateToLogical(x)
    const price = series.coordinateToPrice(y)
    if (l === null || price === null) return null
    const t = logicalToTime(Number(l))
    if (t === null) return null
    return { time: fromChartTime(Math.round(t)), price: Number(price) }
  }

  // ---------------------------------------------------------------- drawing (admin)
  const commit = (next: ChartDrawing[]) => onDrawingsChange?.(next)

  const onSvgDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!editable || tool === 'cursor') return
    const { x, y } = pointFromEvent(e)
    if (tool === 'text') {
      const text = window.prompt('Annotation text (visible to all users):')
      const d = toData(x, y)
      if (text && d) commit([...drawings, { id: `d_${Date.now()}`, type: 'text', time1: d.time, price1: d.price, time2: d.time, price2: d.price, text }])
      setTool('cursor')
      return
    }
    if (tool === 'hline') {
      const d = toData(x, y)
      if (d) commit([...drawings, { id: `d_${Date.now()}`, type: 'hline', time1: d.time, price1: d.price, time2: d.time, price2: d.price }])
      setTool('cursor')
      return
    }
    setDraft({ type: tool, x1: x, y1: y, x2: x, y2: y })
  }
  const onSvgMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!draft) return
    const { x, y } = pointFromEvent(e)
    setDraft({ ...draft, x2: x, y2: y })
  }
  const onSvgUp = () => {
    if (!draft) return
    const a = toData(draft.x1, draft.y1)
    const b = toData(draft.x2, draft.y2)
    if (a && b && (Math.abs(draft.x2 - draft.x1) > 3 || Math.abs(draft.y2 - draft.y1) > 3)) {
      commit([...drawings, { id: `d_${Date.now()}`, type: draft.type, time1: a.time, price1: a.price, time2: b.time, price2: b.price }])
    }
    setDraft(null)
    setTool('cursor')
  }
  const removeDrawing = (id: string) => editable && commit(drawings.filter((d) => d.id !== id))

  // ---------------------------------------------------------------- derived
  const plotWidth = chartRef.current ? chartRef.current.timeScale().width() : 0
  const lastCandle = dataRef.current[dataRef.current.length - 1]
  const shown = hover || (lastCandle ? { open: lastCandle.open, high: lastCandle.high, low: lastCandle.low, close: lastCandle.close } : null)
  const liveLtp = quote?.ltp ?? lastCandle?.close
  const change = quote ? quote.change : 0
  const changePct = quote ? quote.changePercent : 0
  const isUp = change >= 0
  const marketOpenNow = isMarketOpenIST()
  const fromAlice = meta?.source === 'aliceblue'
  const invalidation = useMemo(() => {
    const n = typeof invalidationLevel === 'number' ? invalidationLevel : parseFloat(String(invalidationLevel ?? ''))
    return Number.isFinite(n) && n > 0 ? n : null
  }, [invalidationLevel])

  const zones: Array<{ z: ZoneDefinition | undefined; color: string; label: string }> = [
    { z: bearishZone, color: '#EF4444', label: 'Bearish zone' },
    { z: bullishZone, color: '#22C55E', label: 'Bullish zone' },
    { z: liquidityZone, color: '#A855F7', label: 'Liquidity zone' },
  ]

  const toolBtn = (t: Tool, icon: React.ReactNode, title: string) => (
    <button
      key={t}
      title={title}
      onClick={() => setTool(t)}
      className={`p-1.5 rounded transition-all ${tool === t ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-[#1A2234]'}`}
    >
      {icon}
    </button>
  )

  const renderDrawing = (d: ChartDrawing, preview = false) => {
    const x1 = xFromUnix(d.time1)
    const y1 = yFromPrice(d.price1)
    const x2 = xFromUnix(d.time2)
    const y2 = yFromPrice(d.price2)
    const interactive = editable && !preview && tool === 'cursor'
    const common = interactive
      ? { style: { pointerEvents: 'stroke' as const, cursor: 'pointer' }, onDoubleClick: () => removeDrawing(d.id) }
      : {}
    if (d.type === 'hline') {
      if (y1 === null) return null
      return (
        <g key={d.id}>
          <line x1={0} x2={plotWidth} y1={y1} y2={y1} stroke="#38BDF8" strokeWidth={1.5} strokeDasharray="6 4" />
          <line x1={0} x2={plotWidth} y1={y1} y2={y1} stroke="transparent" strokeWidth={12} {...common}>
            <title>{editable ? 'Double-click to delete' : `Level ${fmtPrice(d.price1)}`}</title>
          </line>
          <text x={6} y={y1 - 4} fill="#7DD3FC" fontSize={11} fontWeight={700}>{fmtPrice(d.price1)}</text>
        </g>
      )
    }
    if (d.type === 'text') {
      if (x1 === null || y1 === null) return null
      return (
        <text key={d.id} x={x1} y={y1} fill="#E2E8F0" fontSize={12} fontWeight={700} stroke="#0A0D16" strokeWidth={3} paintOrder="stroke"
          {...(interactive ? { style: { pointerEvents: 'all' as const, cursor: 'pointer' }, onDoubleClick: () => removeDrawing(d.id) } : {})}>
          {d.text}
        </text>
      )
    }
    if (x1 === null || y1 === null || x2 === null || y2 === null) return null
    if (d.type === 'zone') {
      return (
        <rect key={d.id} x={Math.min(x1, x2)} y={Math.min(y1, y2)} width={Math.abs(x2 - x1)} height={Math.abs(y2 - y1)}
          fill="#3B82F6" fillOpacity={0.18} stroke="#3B82F6" strokeWidth={1.5}
          {...(interactive ? { style: { pointerEvents: 'all' as const, cursor: 'pointer' }, onDoubleClick: () => removeDrawing(d.id) } : {})} />
      )
    }
    return (
      <g key={d.id}>
        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#818CF8" strokeWidth={2} />
        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="transparent" strokeWidth={12} {...common} />
      </g>
    )
  }

  const draftAsDrawing = (): ChartDrawing | null => {
    if (!draft) return null
    const a = toData(draft.x1, draft.y1)
    const b = toData(draft.x2, draft.y2)
    if (!a || !b) return null
    return { id: 'draft', type: draft.type, time1: a.time, price1: a.price, time2: b.time, price2: b.price }
  }

  const changeView = (tf: Timeframe, r: RangeKey) => {
    setTimeframe(tf)
    setRange(r)
    onViewChange?.({ timeframe: tf, range: r })
  }

  return (
    <div
      ref={rootRef}
      className={`rounded-xl border border-[#1A2234] bg-[#0C1019] overflow-hidden flex flex-col select-none ${
        fullscreen ? 'fixed inset-0 z-50 rounded-none' : ''
      }`}
      style={{ height: fullscreen ? '100vh' : height }}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 border-b border-[#1A2234] bg-[#0E1424]">
        <div className="flex flex-wrap items-center gap-3 min-w-0">
          <div className="relative">
            <button
              onClick={() => allowSymbolChange && setSearchOpen((o) => !o)}
              className={`flex items-center gap-1.5 text-sm font-bold text-white ${allowSymbolChange ? 'hover:text-indigo-300' : 'cursor-default'}`}
            >
              {allowSymbolChange && <Search size={13} className="text-slate-400" />}
              {symbol}
              <span className="text-[10px] font-medium text-slate-500">{symbol === 'SENSEX' ? 'BSE' : 'NSE'}</span>
            </button>
            {searchOpen && allowSymbolChange && (
              <div className="absolute z-30 top-full left-0 mt-1 w-64 rounded-lg border border-[#1A2234] bg-[#0E1424] shadow-xl p-2 space-y-1">
                <input
                  autoFocus
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder="Search index / stock (e.g. RELIANCE)"
                  className="w-full px-2 py-1.5 rounded bg-[#141B2E] border border-[#1A2234] text-xs text-white outline-none focus:border-indigo-500"
                />
                <div className="max-h-56 overflow-y-auto">
                  {(searchText.trim().length < 2 ? QUICK_SYMBOLS.map((s) => ({ symbol: s, ref: s, name: '', exchange: '' })) : searchResults).map((r) => (
                    <button
                      key={r.ref}
                      onClick={() => { onSymbolChange?.(r.ref); setSearchOpen(false); setSearchText('') }}
                      className="w-full flex items-center justify-between px-2 py-1.5 rounded text-xs text-slate-200 hover:bg-[#1A2234]"
                    >
                      <span className="font-semibold">{r.symbol}</span>
                      <span className="text-[10px] text-slate-500 truncate ml-2">{r.name} {r.exchange}</span>
                    </button>
                  ))}
                  {searchText.trim().length >= 2 && searchResults.length === 0 && (
                    <div className="px-2 py-2 text-[11px] text-slate-500">No matches</div>
                  )}
                </div>
              </div>
            )}
          </div>

          {liveLtp !== undefined && (
            <div className="flex items-baseline gap-2 font-mono">
              <span className={`text-base font-bold px-1 rounded transition-colors ${
                tickDir === 'up' ? 'text-emerald-300 bg-emerald-500/10' : tickDir === 'down' ? 'text-rose-300 bg-rose-500/10' : 'text-white'
              }`}>{fmtPrice(liveLtp)}</span>
              {quote && (
                <span className={`text-xs font-semibold ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {isUp ? '+' : ''}{fmtPrice(change)} ({isUp ? '+' : ''}{changePct.toFixed(2)}%)
                </span>
              )}
            </div>
          )}

          <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-bold ${
            fromAlice && marketOpenNow
              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
              : fromAlice
              ? 'bg-sky-500/15 border-sky-500/30 text-sky-400'
              : 'bg-amber-500/15 border-amber-500/30 text-amber-400'
          }`}>
            {fromAlice ? (marketOpenNow ? <Radio size={11} className="animate-pulse" /> : <Wifi size={11} />) : <WifiOff size={11} />}
            <span>
              {fromAlice
                ? marketOpenNow ? 'Alice Blue · LIVE' : 'Alice Blue · Market closed'
                : meta ? 'Backup feed (Alice Blue offline)' : 'Connecting…'}
            </span>
          </div>

          {shown && (
            <div className="hidden xl:flex items-center gap-2.5 text-[11px] font-mono text-slate-400">
              <span>O <span className="text-white">{fmtPrice(shown.open)}</span></span>
              <span>H <span className="text-emerald-400">{fmtPrice(shown.high)}</span></span>
              <span>L <span className="text-rose-400">{fmtPrice(shown.low)}</span></span>
              <span>C <span className="text-white">{fmtPrice(shown.close)}</span></span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-[#141B2E] border border-[#1A2234]">
            {TIMEFRAMES.map((tf) => (
              <button key={tf} onClick={() => changeView(tf, range)}
                className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${timeframe === tf ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>
                {tf}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-[#141B2E] border border-[#1A2234]">
            {RANGES.map((r) => (
              <button key={r} onClick={() => changeView(timeframe, r)}
                className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${range === r ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}>
                {r}
              </button>
            ))}
          </div>
          <button onClick={() => setReloadKey((k) => k + 1)} title="Reload" className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-[#1A2234]">
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          </button>
          <button onClick={() => setFullscreen((f) => !f)} title="Fullscreen (Esc to exit)" className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-[#1A2234]">
            {fullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>
      </div>

      <div className="flex-1 flex min-h-0 relative">
        {/* Admin-only drawing toolbar */}
        {editable && (
          <div className="w-10 border-r border-[#1A2234] bg-[#0E1424] flex flex-col items-center py-2 gap-1.5 z-20 shrink-0">
            {toolBtn('cursor', <Crosshair size={15} />, 'Cursor (double-click a drawing to delete)')}
            {toolBtn('line', <Slash size={15} />, 'Trendline')}
            {toolBtn('hline', <Minus size={15} />, 'Horizontal level')}
            {toolBtn('zone', <Square size={15} />, 'Zone box')}
            {toolBtn('text', <Type size={15} />, 'Text note')}
            <div className="h-px w-5 bg-[#1A2234] my-1" />
            <button title="Undo last drawing" disabled={!drawings.length} onClick={() => commit(drawings.slice(0, -1))}
              className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-[#1A2234] disabled:opacity-30">
              <Undo2 size={15} />
            </button>
            <button title="Clear all drawings" disabled={!drawings.length}
              onClick={() => window.confirm('Remove all drawings?') && commit([])}
              className="p-1.5 rounded text-slate-400 hover:text-rose-400 hover:bg-[#1A2234] disabled:opacity-30">
              <Trash2 size={15} />
            </button>
          </div>
        )}

        <div className="flex-1 relative min-w-0" onWheel={scheduleOverlay} onMouseUp={scheduleOverlay}>
          <div ref={containerRef} className="absolute inset-0" />

          {/* Overlay: zones, invalidation, drawings */}
          <svg
            ref={svgRef}
            className="absolute inset-0 w-full h-full z-10"
            style={{ pointerEvents: editable && tool !== 'cursor' ? 'auto' : 'none', cursor: editable && tool !== 'cursor' ? 'crosshair' : 'default' }}
            onMouseDown={onSvgDown}
            onMouseMove={onSvgMove}
            onMouseUp={onSvgUp}
            onMouseLeave={onSvgUp}
          >
            {zones.map(({ z, color, label }) => {
              if (!validZone(z)) return null
              const yA = yFromPrice(z!.from)
              const yB = yFromPrice(z!.to)
              if (yA === null || yB === null) return null
              const y = Math.min(yA, yB)
              const h = Math.max(2, Math.abs(yB - yA))
              return (
                <g key={label}>
                  <rect x={0} y={y} width={plotWidth} height={h} fill={color} fillOpacity={0.13} stroke={color} strokeOpacity={0.55} strokeWidth={1} />
                  <text x={8} y={y + 12} fill={color} fontSize={10} fontWeight={700} opacity={0.95}>
                    {label} {z!.from}–{z!.to}
                  </text>
                </g>
              )
            })}
            {invalidation !== null && (() => {
              const y = yFromPrice(invalidation)
              if (y === null) return null
              return (
                <g>
                  <line x1={0} x2={plotWidth} y1={y} y2={y} stroke="#F59E0B" strokeWidth={1.5} strokeDasharray="7 5" />
                  <text x={plotWidth - 8} y={y - 4} textAnchor="end" fill="#FBBF24" fontSize={10} fontWeight={700}>
                    Invalidation {fmtPrice(invalidation, 0)}
                  </text>
                </g>
              )
            })()}
            {drawings.map((d) => renderDrawing(d))}
            {(() => { const dd = draftAsDrawing(); return dd ? renderDrawing(dd, true) : null })()}
          </svg>

          {loading && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#0A0D16]/70 pointer-events-none">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#141B2E] border border-[#1A2234] text-xs text-slate-300">
                <Loader2 size={14} className="animate-spin text-indigo-400" />
                Loading {symbol} {range} · {timeframe}…
              </div>
            </div>
          )}

          {error && !loading && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#0A0D16]/85">
              <div className="max-w-sm text-center space-y-3 p-4">
                <AlertTriangle className="mx-auto text-amber-400" size={28} />
                <p className="text-sm font-semibold text-white">Live data unavailable</p>
                <p className="text-xs text-slate-400">{error}</p>
                <button onClick={() => setReloadKey((k) => k + 1)} className="px-3 py-1.5 rounded-md bg-indigo-600 text-white text-xs font-bold hover:brightness-110">
                  Try again
                </button>
              </div>
            </div>
          )}

          {!loading && !error && meta?.clamped && (
            <div className="absolute bottom-2 left-2 z-20 px-2 py-0.5 rounded bg-black/60 border border-slate-700/50 text-[9px] text-slate-400 pointer-events-none">
              Intraday history is limited for {timeframe}; showing the maximum available. Use D / W / M for longer ranges.
            </div>
          )}
          {!loading && !error && meta && !fromAlice && editable && (
            <div className="absolute top-2 left-2 z-20 px-2 py-1 rounded bg-amber-500/15 border border-amber-500/30 text-[10px] text-amber-300 pointer-events-none">
              Alice Blue session inactive — go to Broker → generate today's session. Showing backup data.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
