import { createContext, useContext, useState, type ReactNode } from 'react'

type Market = 'NIFTY 50' | 'SENSEX'

interface MarketContextType {
  market: Market
  setMarket: (m: Market) => void
}

const MarketContext = createContext<MarketContextType | undefined>(undefined)

export function MarketProvider({ children }: { children: ReactNode }) {
  const [market, setMarket] = useState<Market>('NIFTY 50')
  return (
    <MarketContext.Provider value={{ market, setMarket }}>
      {children}
    </MarketContext.Provider>
  )
}

export function useMarket() {
  const ctx = useContext(MarketContext)
  if (!ctx) throw new Error('useMarket must be used within MarketProvider')
  return ctx
}
