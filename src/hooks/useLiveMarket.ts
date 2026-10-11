import { useEffect, useState } from 'react'
import { broadcastSyncService, type FlashAlert, type LiveMarketData } from '@/services/broadcastSyncService'

/**
 * Subscribes a component to the admin's published state for `market`.
 * `justUpdated` is true for 3s after a new publish arrives (for "updated" badges).
 */
export function useLiveMarket(market: string) {
  const [data, setData] = useState<LiveMarketData>(() => broadcastSyncService.getMarketData(market))
  const [alert, setAlert] = useState<FlashAlert | null>(() => broadcastSyncService.getUrgentAlert())
  const [justUpdated, setJustUpdated] = useState(false)
  const [ready, setReady] = useState(broadcastSyncService.isReady())

  useEffect(() => {
    let last = broadcastSyncService.getMarketData(market).lastUpdated
    let timer: ReturnType<typeof setTimeout> | undefined
    setData(broadcastSyncService.getMarketData(market))
    setAlert(broadcastSyncService.getUrgentAlert())
    setReady(broadcastSyncService.isReady())

    const unsubscribe = broadcastSyncService.subscribe(() => {
      const next = broadcastSyncService.getMarketData(market)
      setData(next)
      setAlert(broadcastSyncService.getUrgentAlert())
      setReady(broadcastSyncService.isReady())
      if (next.lastUpdated && next.lastUpdated !== last) {
        last = next.lastUpdated
        setJustUpdated(true)
        if (timer) clearTimeout(timer)
        timer = setTimeout(() => setJustUpdated(false), 3500)
      }
    })
    return () => {
      unsubscribe()
      if (timer) clearTimeout(timer)
    }
  }, [market])

  return { data, alert, justUpdated, ready }
}
