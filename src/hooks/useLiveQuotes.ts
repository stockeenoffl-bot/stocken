import { useEffect, useRef, useState } from 'react'
import { aliceBlueService, type AliceBlueQuote } from '@/services/aliceBlueService'

/** Live quotes (Alice Blue via gateway) with tick direction for flash effects. */
export function useLiveQuotes(symbols: string[]) {
  const [quotes, setQuotes] = useState<Record<string, AliceBlueQuote>>({})
  const [dirs, setDirs] = useState<Record<string, 'up' | 'down' | 'flat'>>({})
  const [marketOpen, setMarketOpen] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const prev = useRef<Record<string, number>>({})
  const key = symbols.join('|')

  useEffect(() => {
    const unsub = aliceBlueService.subscribeQuotes(symbols, (list, m) => {
      const nextDirs: Record<string, 'up' | 'down' | 'flat'> = {}
      const map: Record<string, AliceBlueQuote> = {}
      for (const q of list) {
        const p = prev.current[q.symbol]
        nextDirs[q.symbol] = p === undefined || p === q.ltp ? 'flat' : q.ltp > p ? 'up' : 'down'
        prev.current[q.symbol] = q.ltp
        map[q.symbol] = q
      }
      setQuotes((old) => ({ ...old, ...map }))
      setDirs((old) => ({ ...old, ...nextDirs }))
      setMarketOpen(m.marketOpen)
      setLoaded(true)
    })
    return unsub
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  return { quotes, dirs, marketOpen, loaded }
}
