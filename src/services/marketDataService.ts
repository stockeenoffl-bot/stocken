// Provider interface to abstract Market Data sources (Kite, Upstox, AlphaVantage, etc.)

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

class MarketDataService {  // private apiKey: string = import.meta.env.VITE_MARKET_DATA_API_KEY || ''
  
  // This is a placeholder architecture. 
  // In production, this would call a Supabase Edge Function to hide the API key,
  // which then proxies to Kite/Upstox.

  async getCandles(symbol: string, _timeframe: string): Promise<Candle[]> {
    try {
      // Mocked fallback for UI demo purposes since we don't have a real API key yet.
      // Real Implementation:
      // const res = await fetch(`https://api.provider.com/v1/history?symbol=${symbol}&tf=${timeframe}`, { headers: { Authorization: `Bearer ${this.apiKey}` }})
      // return await res.json()
      
      const isNifty = symbol === 'NIFTY 50'
      const basePrice = isNifty ? 24200 : 79500
      
      // Generate some dummy candles based on symbol
      const now = new Date()
      return Array.from({ length: 60 }).map((_, i) => {
        const time = new Date(now.getTime() - (60 - i) * 15 * 60000)
        const open = basePrice + (Math.random() - 0.5) * 50
        const close = open + (Math.random() - 0.5) * 40
        return {
          time: time.toISOString().split('T')[0], // Simplified for demo
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
      // Real Implementation:
      // const res = await fetch(`https://api.provider.com/v1/options?symbol=${symbol}`)
      // return await res.json()

      const basePrice = symbol === 'NIFTY 50' ? 24200 : 79500
      const step = symbol === 'NIFTY 50' ? 50 : 100

      return Array.from({ length: 15 }).map((_, i) => {
        const strike = basePrice - (7 * step) + (i * step)
        const isATM = Math.abs(strike - basePrice) < step
        
        return {
          strike,
          callOI: isATM ? 15000000 : Math.floor(Math.random() * 10000000),
          putOI: isATM ? 12000000 : Math.floor(Math.random() * 10000000),
          callChange: Math.floor((Math.random() - 0.3) * 500000),
          putChange: Math.floor((Math.random() - 0.3) * 500000),
        }
      })
    } catch (error) {
      console.error('Error fetching option chain:', error)
      return []
    }
  }
}

export const marketDataService = new MarketDataService()
