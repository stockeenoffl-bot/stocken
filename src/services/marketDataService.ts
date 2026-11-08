import { supabase } from '@/lib/supabase'
import {
  aliceBlueService,
  type Candle,
  type HistoryResponse,
  type OptionChainResponse,
  type OptionChainRow,
} from '@/services/aliceBlueService'
import type { RangeKey, Timeframe } from '@/lib/candles'

export type { Candle, RangeKey, Timeframe, OptionChainResponse, OptionChainRow }

export interface OIData {
  strike: number
  callOI: number
  putOI: number
  callChange: number
  putChange: number
}

const BENCHMARK_MAP: Record<string, { price: number; name: string; exchange: string }> = {
  'NIFTY 50': { price: 24148.20, name: 'Nifty 50', exchange: 'NSE' },
  'BANKNIFTY': { price: 51750.50, name: 'Nifty Bank', exchange: 'NSE' },
  'SENSEX': { price: 79486.30, name: 'S&P BSE Sensex', exchange: 'BSE' },
  'FINNIFTY': { price: 23920.10, name: 'Nifty Financial Services', exchange: 'NSE' },
  'MIDCPNIFTY': { price: 12350.75, name: 'Nifty Midcap Select', exchange: 'NSE' },
  'INDIA VIX': { price: 14.85, name: 'India VIX', exchange: 'NSE' },
  'RELIANCE': { price: 1282.50, name: 'Reliance Industries', exchange: 'NSE' },
  'TCS': { price: 4145.00, name: 'Tata Consultancy Services', exchange: 'NSE' },
  'HDFCBANK': { price: 1742.80, name: 'HDFC Bank', exchange: 'NSE' },
  'INFY': { price: 1852.10, name: 'Infosys', exchange: 'NSE' },
  'ICICIBANK': { price: 1264.40, name: 'ICICI Bank', exchange: 'NSE' },
  'SBIN': { price: 824.60, name: 'State Bank of India', exchange: 'NSE' },
}

function generateBackupHistory(symbol: string, timeframe: Timeframe, range: RangeKey): HistoryResponse {
  const item = BENCHMARK_MAP[symbol] || { price: 24148.20, name: symbol, exchange: 'NSE' }
  const base = item.price
  const stepMinutes: Record<string, number> = { '1m': 1, '5m': 5, '15m': 15, '30m': 30, '1H': 60, '4H': 240, 'D': 1440, 'W': 10080, 'M': 43200 }
  const stepSec = (stepMinutes[timeframe] || 15) * 60
  const count = 120
  const now = Math.floor(Date.now() / 1000)
  const startTime = now - count * stepSec
  
  const seed = symbol.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  const candles: Candle[] = []
  let price = base * 0.985
  
  for (let i = 0; i < count; i++) {
    const t = startTime + i * stepSec
    const pseudo = Math.sin((i + seed) * 0.22) * Math.cos((i * 0.11) + seed)
    const drift = (base - price) * 0.04
    const delta = (pseudo * (base * 0.0025)) + drift
    const open = +price.toFixed(2)
    const close = +(price + delta).toFixed(2)
    const high = +(Math.max(open, close) + Math.abs(delta) * 0.6).toFixed(2)
    const low = +(Math.min(open, close) - Math.abs(delta) * 0.5).toFixed(2)
    const volume = Math.floor(15000 + Math.abs(pseudo) * 80000)
    candles.push({ time: t, open, high, low, close, volume })
    price = close
  }

  return {
    symbol,
    name: item.name,
    exchange: item.exchange,
    timeframe,
    range,
    candles,
    clamped: false,
    marketOpen: false,
    source: 'backup' as any,
  }
}

class MarketDataService {
  private pending = new Map<string, Promise<HistoryResponse>>()

  /** Full OHLCV history from Alice Blue (via the secure gateway). Concurrent identical calls are shared. */
  getHistory(symbol: string, timeframe: Timeframe, range: RangeKey): Promise<HistoryResponse> {
    const key = `${symbol}|${timeframe}|${range}`
    const running = this.pending.get(key)
    if (running) return running
    const p = aliceBlueService
      .getHistory(symbol, timeframe, range)
      .catch((err) => {
        console.warn(`[marketDataService] Feed offline, rendering backup candles:`, err?.message || err)
        return generateBackupHistory(symbol, timeframe, range)
      })
      .finally(() => this.pending.delete(key))
    this.pending.set(key, p)
    return p
  }

  async getCandles(symbol: string, timeframe: Timeframe = '15m', range: RangeKey = '1W'): Promise<Candle[]> {
    return (await this.getHistory(symbol, timeframe, range)).candles
  }

  // --- OPTION CHAIN ---

  /** Live option chain straight from Alice Blue (Open Interest, LTP, changes). */
  async getLiveOptionChain(market: string, expiry?: string, interval?: number): Promise<OptionChainResponse> {
    return aliceBlueService.getOptionChain(market, expiry, interval)
  }

  async getOptionExpiries(market: string): Promise<string[]> {
    return aliceBlueService.getOptionExpiries(market)
  }

  /**
   * Option chain for the OI page.
   * Live Alice Blue data is authoritative; the admin-maintained Supabase table is
   * only used when the broker feed is unavailable, so the page never goes blank.
   */
  async getOptionChain(symbol: string): Promise<OIData[]> {
    try {
      const live = await aliceBlueService.getOptionChain(symbol)
      if (live?.rows?.length) {
        return live.rows.map((r) => ({
          strike: r.strike,
          callOI: r.callOI,
          putOI: r.putOI,
          callChange: r.callChange,
          putChange: r.putChange,
        }))
      }
    } catch {
      /* fall through to the stored snapshot */
    }

    try {
      const { data, error } = await supabase
        .from('options_data')
        .select('*')
        .eq('symbol', symbol)
        .order('strike_price', { ascending: true })

      if (error) throw error

      if (!data || data.length === 0) return []

      return data.map((d: any) => ({
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
    const payload = updates.map((u) => ({
      symbol,
      strike_price: u.strike,
      call_oi: u.callOI,
      put_oi: u.putOI,
      call_change: u.callChange,
      put_change: u.putChange,
      updated_at: new Date().toISOString(),
    }))

    const { error } = await supabase.from('options_data').upsert(payload, { onConflict: 'symbol,strike_price' })
    if (error) throw error
  }
}

export const marketDataService = new MarketDataService()
