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

class MarketDataService {
  private pending = new Map<string, Promise<HistoryResponse>>()

  /** Full OHLCV history from Alice Blue (via the secure gateway). Concurrent identical calls are shared. */
  getHistory(symbol: string, timeframe: Timeframe, range: RangeKey): Promise<HistoryResponse> {
    const key = `${symbol}|${timeframe}|${range}`
    const running = this.pending.get(key)
    if (running) return running
    const p = aliceBlueService.getHistory(symbol, timeframe, range).finally(() => this.pending.delete(key))
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
