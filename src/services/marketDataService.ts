import { supabase } from '@/lib/supabase'

export interface Candle {
  time: number // Unix timestamp in seconds for lightweight-charts
  open: number
  high: number
  low: number
  close: number
  volume?: number
}

export interface OIData {
  strike: number
  callOI: number
  putOI: number
  callChange: number
  putChange: number
}

// Twelve Data Free Tier Safeguards
const TWELVE_DATA_API_KEY =
  import.meta.env.VITE_TWELVE_DATA_API_KEY ||
  import.meta.env.VITE_MARKET_DATA_API_KEY ||
  '5c2a43f8af964efd87d007a386feef48'

const MAX_CALLS_PER_MINUTE = 7 // Free plan allows 8/min; keep a 1-call buffer
const CALL_WINDOW_MS = 60 * 1000

class MarketDataService {
  private callTimestamps: number[] = []
  private pendingRequests = new Map<string, Promise<Candle[]>>()

  /**
   * Check if Indian equity markets are actively trading (09:15 - 15:30 IST, Mon-Fri)
   */
  private isIndianMarketOpen(): boolean {
    const now = new Date()
    // Convert to IST (UTC + 5:30)
    const istOffset = 5.5 * 60 * 60 * 1000
    const istTime = new Date(now.getTime() + now.getTimezoneOffset() * 60000 + istOffset)
    const day = istTime.getDay() // 0 = Sun, 6 = Sat
    if (day === 0 || day === 6) return false

    const totalMinutes = istTime.getHours() * 60 + istTime.getMinutes()
    return totalMinutes >= 9 * 60 + 15 && totalMinutes <= 15 * 60 + 30
  }

  /**
   * Strategy 1: Dynamic Smart TTL
   * - During market hours: Cache for 5 minutes (avoids burning credits on intraday candles)
   * - Outside market hours & weekends: Cache for 4 hours (market is closed, candles do not change)
   */
  private getCacheTTL(): number {
    return this.isIndianMarketOpen() ? 5 * 60 * 1000 : 4 * 60 * 60 * 1000
  }

  /**
   * Strategy 2: Sliding-window Rate Limiter to protect Twelve Data 8/min limit
   */
  private canCallTwelveData(): boolean {
    const now = Date.now()
    this.callTimestamps = this.callTimestamps.filter(t => now - t < CALL_WINDOW_MS)
    return this.callTimestamps.length < MAX_CALLS_PER_MINUTE
  }

  private recordTwelveDataCall() {
    this.callTimestamps.push(Date.now())
  }

  /**
   * Get cached candles from localStorage
   */
  private getCached(key: string, maxAgeMs: number): Candle[] | null {
    try {
      const raw = localStorage.getItem(`candle_cache_${key}`)
      if (!raw) return null
      const parsed = JSON.parse(raw)
      if (Date.now() - parsed.timestamp < maxAgeMs && Array.isArray(parsed.data) && parsed.data.length > 0) {
        return parsed.data
      }
    } catch {
      // Ignore storage errors
    }
    return null
  }

  /**
   * Save candles to localStorage
   */
  private setCached(key: string, data: Candle[]) {
    try {
      localStorage.setItem(
        `candle_cache_${key}`,
        JSON.stringify({ timestamp: Date.now(), data })
      )
    } catch {
      // Ignore storage quota errors
    }
  }

  /**
   * Main Candle Fetcher with In-flight Deduplication + Smart Caching
   */
  async getCandles(symbol: string, timeframe: string = '15m'): Promise<Candle[]> {
    const cacheKey = `${symbol.toUpperCase().replace(/\s+/g, '_')}_${timeframe}`

    // 1. Check persistent cache with dynamic TTL
    const cached = this.getCached(cacheKey, this.getCacheTTL())
    if (cached) {
      return cached
    }

    // 2. In-flight Deduplication: Prevent multiple components from triggering identical calls
    if (this.pendingRequests.has(cacheKey)) {
      return this.pendingRequests.get(cacheKey)!
    }

    const fetchPromise = this.executeFetch(symbol, timeframe, cacheKey)
      .finally(() => {
        this.pendingRequests.delete(cacheKey)
      })

    this.pendingRequests.set(cacheKey, fetchPromise)
    return fetchPromise
  }

  private async executeFetch(symbol: string, timeframe: string, cacheKey: string): Promise<Candle[]> {
    // Attempt Twelve Data if rate limit allows
    if (this.canCallTwelveData()) {
      try {
        const candles = await this.fetchFromTwelveData(symbol, timeframe)
        if (candles && candles.length > 0) {
          this.setCached(cacheKey, candles)
          return candles
        }
      } catch (err) {
        console.warn('[MarketData] Twelve Data fetch failed or symbol restricted, trying live fallback:', err)
      }
    } else {
      console.warn('[MarketData] Twelve Data rate limit reached (7/min). Using live fallback feed.')
    }

    // Fallback: Real Indian Market data via Yahoo Finance / local proxy
    try {
      const fallbackCandles = await this.fetchFromYahooFinance(symbol, timeframe)
      if (fallbackCandles && fallbackCandles.length > 0) {
        this.setCached(cacheKey, fallbackCandles)
        return fallbackCandles
      }
    } catch (fallbackErr) {
      console.error('[MarketData] Live fallback also failed:', fallbackErr)
    }

    // Stale cache fallback (better than synthetic data)
    const stale = this.getCached(cacheKey, 7 * 24 * 60 * 60 * 1000)
    if (stale && stale.length > 0) {
      return stale
    }

    // Last resort fallback: generate realistic initial baseline
    return this.generateBaselineCandles(symbol)
  }

  /**
   * Provider 1: Twelve Data API
   */
  private async fetchFromTwelveData(symbol: string, timeframe: string): Promise<Candle[]> {
    // Map timeframes to Twelve Data format
    const intervalMap: Record<string, string> = {
      '5m': '5min',
      '15m': '15min',
      '1H': '1h',
      '4H': '4h',
      'D': '1day',
    }
    const interval = intervalMap[timeframe] || '15min'

    // Map common index names to Twelve Data symbols
    let tdSymbol = symbol
    if (symbol === 'NIFTY 50' || symbol === 'NIFTY') tdSymbol = 'NSEI'
    else if (symbol === 'SENSEX') tdSymbol = 'SNSX50'
    else if (symbol === 'BANKNIFTY' || symbol === 'NIFTYBANK') tdSymbol = 'NSEBANK'

    this.recordTwelveDataCall()

    const url = `https://api.twelvedata.com/time_series?symbol=${encodeURIComponent(
      tdSymbol
    )}&interval=${interval}&outputsize=60&apikey=${TWELVE_DATA_API_KEY}`

    const res = await fetch(url)
    const json = await res.json()

    if (json.status === 'error') {
      throw new Error(json.message || 'Twelve Data API returned an error')
    }

    if (!json.values || !Array.isArray(json.values)) {
      throw new Error('Invalid values format from Twelve Data')
    }

    // Twelve Data returns newest first; sort chronologically
    const candles: Candle[] = json.values
      .map((v: any) => ({
        time: Math.floor(new Date(v.datetime).getTime() / 1000),
        open: parseFloat(v.open),
        high: parseFloat(v.high),
        low: parseFloat(v.low),
        close: parseFloat(v.close),
        volume: v.volume ? parseFloat(v.volume) : undefined,
      }))
      .filter((c: Candle) => !isNaN(c.open) && !isNaN(c.close))
      .sort((a: Candle, b: Candle) => a.time - b.time)

    return candles
  }

  /**
   * Provider 2: Real Market Data Fallback (Yahoo Finance for Indian Indices)
   */
  private async fetchFromYahooFinance(symbol: string, timeframe: string): Promise<Candle[]> {
    const symbolMap: Record<string, string> = {
      'NIFTY 50': '^NSEI',
      'NIFTY': '^NSEI',
      'SENSEX': '^BSESN',
      'NIFTYBANK': '^NSEBANK',
      'BANKNIFTY': '^NSEBANK',
      'FINNIFTY': 'NIFTY_FIN_SERVICE.NS',
    }
    const ySymbol = symbolMap[symbol] || symbol

    const intervalMap: Record<string, { interval: string; range: string }> = {
      '5m': { interval: '5m', range: '1d' },
      '15m': { interval: '15m', range: '5d' },
      '1H': { interval: '1h', range: '1mo' },
      '4H': { interval: '1h', range: '1mo' },
      'D': { interval: '1d', range: '1y' },
    }
    const { interval, range } = intervalMap[timeframe] || { interval: '15m', range: '5d' }

    // Use local Vite dev proxy if available, or direct endpoint
    const query = `v8/finance/chart/${encodeURIComponent(ySymbol)}?interval=${interval}&range=${range}`
    let url = `/api/yahoo/${query}`

    let res: Response
    try {
      res = await fetch(url)
      if (!res.ok) throw new Error(`Proxy returned status ${res.status}`)
    } catch {
      // Direct fallback
      url = `https://query1.finance.yahoo.com/${query}`
      res = await fetch(url)
    }

    const json = await res.json()
    const result = json?.chart?.result?.[0]
    if (!result || !result.timestamp || !result.indicators?.quote?.[0]) {
      throw new Error('Invalid chart response from market feed')
    }

    const timestamps: number[] = result.timestamp
    const quote = result.indicators.quote[0]
    const candles: Candle[] = []

    for (let i = 0; i < timestamps.length; i++) {
      const o = quote.open[i]
      const h = quote.high[i]
      const l = quote.low[i]
      const c = quote.close[i]
      if (o !== null && h !== null && l !== null && c !== null) {
        candles.push({
          time: timestamps[i],
          open: Number(o.toFixed(2)),
          high: Number(h.toFixed(2)),
          low: Number(l.toFixed(2)),
          close: Number(c.toFixed(2)),
          volume: quote.volume?.[i] || 0,
        })
      }
    }

    return candles
  }

  /**
   * Baseline Fallback when completely offline
   */
  private generateBaselineCandles(symbol: string): Candle[] {
    const isNifty = symbol === 'NIFTY 50' || symbol === 'NIFTY'
    let price = isNifty ? 23450 : 76500
    const now = Math.floor(Date.now() / 1000)
    const candles: Candle[] = []

    for (let i = 59; i >= 0; i--) {
      const time = now - i * 15 * 60
      const change = (Math.random() - 0.48) * 35
      const open = price
      const close = price + change
      const high = Math.max(open, close) + Math.random() * 15
      const low = Math.min(open, close) - Math.random() * 15
      candles.push({
        time,
        open: Number(open.toFixed(2)),
        high: Number(high.toFixed(2)),
        low: Number(low.toFixed(2)),
        close: Number(close.toFixed(2)),
      })
      price = close
    }
    return candles
  }

  // --- OPTION CHAIN METHODS ---

  async getOptionChain(symbol: string): Promise<OIData[]> {
    try {
      const { data, error } = await supabase
        .from('options_data')
        .select('*')
        .eq('symbol', symbol)
        .order('strike_price', { ascending: true })

      if (error) throw error

      if (!data || data.length === 0) {
        const basePrice = symbol === 'NIFTY 50' || symbol === 'NIFTY50' ? 24200 : 79500
        const step = symbol === 'NIFTY 50' || symbol === 'NIFTY50' ? 50 : 100
        return Array.from({ length: 15 }).map((_, i) => ({
          strike: basePrice - 7 * step + i * step,
          callOI: 0,
          putOI: 0,
          callChange: 0,
          putChange: 0,
        }))
      }

      return data.map(d => ({
        strike: Number(d.strike_price),
        callOI: Number(d.call_oi),
        putOI: Number(d.put_oi),
        callChange: Number(d.call_change),
        putChange: Number(d.put_change),
      }))
    } catch (error) {
      console.error('Error fetching option chain:', error)
      return []
    }
  }

  async updateOptionChain(symbol: string, updates: OIData[]) {
    try {
      const payload = updates.map(u => ({
        symbol,
        strike_price: u.strike,
        call_oi: u.callOI,
        put_oi: u.putOI,
        call_change: u.callChange,
        put_change: u.putChange,
        updated_at: new Date().toISOString(),
      }))

      const { error } = await supabase
        .from('options_data')
        .upsert(payload, { onConflict: 'symbol,strike_price' })

      if (error) throw error
    } catch (error) {
      console.error('Error updating option chain:', error)
      throw error
    }
  }
}

export const marketDataService = new MarketDataService()
