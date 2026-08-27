import { supabase } from '@/lib/supabase'

export interface Candle {
  time: string
  open: number
  high: number
  low: number
  close: number
}

export interface OIData {
  strike: number
  callOI: number
  putOI: number
  callChange: number
  putChange: number
}

class MarketDataService {
  async getCandles(symbol: string, _timeframe: string): Promise<Candle[]> {
    try {
      const isNifty = symbol === 'NIFTY 50'
      const basePrice = isNifty ? 24200 : 79500
      
      const now = new Date()
      return Array.from({ length: 60 }).map((_, i) => {
        const time = new Date(now.getTime() - (60 - i) * 15 * 60000)
        const open = basePrice + (Math.random() - 0.5) * 50
        const close = open + (Math.random() - 0.5) * 40
        return {
          time: time.toISOString().split('T')[0],
          open,
          high: Math.max(open, close) + Math.random() * 20,
          low: Math.min(open, close) - Math.random() * 20,
          close,
        }
      })
    } catch (error) {
      console.error('Error fetching candles:', error)
      return []
    }
  }

  async getOptionChain(symbol: string): Promise<OIData[]> {
    try {
      const { data, error } = await supabase
        .from('options_data')
        .select('*')
        .eq('symbol', symbol)
        .order('strike_price', { ascending: true })

      if (error) throw error

      if (!data || data.length === 0) {
        // Fallback for initial load if DB is empty
        const basePrice = symbol === 'NIFTY 50' ? 24200 : 79500
        const step = symbol === 'NIFTY 50' ? 50 : 100
        return Array.from({ length: 15 }).map((_, i) => {
          const strike = basePrice - (7 * step) + (i * step)
          return {
            strike,
            callOI: 0,
            putOI: 0,
            callChange: 0,
            putChange: 0,
          }
        })
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
        updated_at: new Date().toISOString()
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
