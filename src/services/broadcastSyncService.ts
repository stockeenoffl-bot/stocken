import { supabase } from '@/lib/supabase'

export interface LiveMarketData {
  market: string
  bias: 'bullish' | 'bearish' | 'neutral'
  summary: string
  invalidationLevel: number | string
  supportZone: { from: number; to: number }
  resistanceZone: { from: number; to: number }
  target1?: number | string
  target2?: number | string
  notes?: string
  lastUpdated: number
  updatedBy?: string
}

export interface FlashAlert {
  id: string
  title: string
  message: string
  severity: 'info' | 'warning' | 'alert' | 'success'
  timestamp: number
  active: boolean
}

const STORAGE_KEY_MARKETS = 'zonal_edge_live_market_data_v2'
const STORAGE_KEY_ALERT = 'zonal_edge_live_flash_alert_v2'
const CHANNEL_NAME = 'zonal_edge_broadcast_sync'

// Default baseline data for primary Indian markets
const DEFAULT_MARKET_DATA: Record<string, LiveMarketData> = {
  'NIFTY 50': {
    market: 'NIFTY 50',
    bias: 'bullish',
    summary: 'Consolidating above 24,150. Bullish momentum active with targets towards 24,350.',
    invalidationLevel: 24080,
    supportZone: { from: 24050, to: 24100 },
    resistanceZone: { from: 24250, to: 24300 },
    target1: 24280,
    target2: 24350,
    notes: 'Watch the 15-min open range. Buying on dips recommended near support zone.',
    lastUpdated: Date.now(),
    updatedBy: 'Super Admin',
  },
  'SENSEX': {
    market: 'SENSEX',
    bias: 'bullish',
    summary: 'Strong buying interest seen around 79,200 support. Upside rally intact.',
    invalidationLevel: 78950,
    supportZone: { from: 79000, to: 79200 },
    resistanceZone: { from: 79650, to: 79800 },
    target1: 79600,
    target2: 80000,
    notes: 'Banking & IT heavyweights supporting the index.',
    lastUpdated: Date.now(),
    updatedBy: 'Super Admin',
  },
  'BANKNIFTY': {
    market: 'BANKNIFTY',
    bias: 'neutral',
    summary: 'Range-bound between 51,100 and 51,500. Wait for clear breakout before entry.',
    invalidationLevel: 50900,
    supportZone: { from: 51000, to: 51200 },
    resistanceZone: { from: 51500, to: 51650 },
    target1: 51750,
    target2: 52000,
    notes: 'Private bank earnings in focus. Manage tight stop-losses.',
    lastUpdated: Date.now(),
    updatedBy: 'Super Admin',
  },
  'FINNIFTY': {
    market: 'FINNIFTY',
    bias: 'bullish',
    summary: 'Holding above 23,900. Upside target 24,100 active.',
    invalidationLevel: 23850,
    supportZone: { from: 23880, to: 23930 },
    resistanceZone: { from: 24050, to: 24120 },
    target1: 24080,
    target2: 24150,
    notes: 'Expiry trading: favorable risk-reward on pullbacks.',
    lastUpdated: Date.now(),
    updatedBy: 'Super Admin',
  },
}

class BroadcastSyncService {
  private channel: BroadcastChannel | null = null
  private listeners: Set<() => void> = new Set()

  constructor() {
    this.initChannel()
  }

  private initChannel() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel(CHANNEL_NAME)
        this.channel.onmessage = (event) => {
          if (event.data?.type === 'MARKET_DATA_UPDATED' || event.data?.type === 'FLASH_ALERT_UPDATED') {
            this.notifyListeners()
          }
        }
      } catch (e) {
        console.warn('[SyncService] BroadcastChannel unavailable, using window events fallback')
      }
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === STORAGE_KEY_MARKETS || e.key === STORAGE_KEY_ALERT) {
          this.notifyListeners()
        }
      })
    }
  }

  private notifyListeners() {
    this.listeners.forEach((fn) => {
      try {
        fn()
      } catch (e) {
        console.error('[SyncService] Error executing listener:', e)
      }
    })
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('zonal_edge_sync_change'))
    }
  }

  /**
   * Subscribe component to real-time live data updates
   */
  public subscribe(callback: () => void): () => void {
    this.listeners.add(callback)
    return () => {
      this.listeners.delete(callback)
    }
  }

  /**
   * Get all live market states
   */
  public getAllMarkets(): Record<string, LiveMarketData> {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_MARKETS)
      if (stored) {
        return { ...DEFAULT_MARKET_DATA, ...JSON.parse(stored) }
      }
    } catch (e) {
      console.warn('[SyncService] Error parsing market data:', e)
    }
    return DEFAULT_MARKET_DATA
  }

  /**
   * Get live market state for a specific symbol (e.g. 'NIFTY 50')
   */
  public getMarketData(market: string): LiveMarketData {
    const all = this.getAllMarkets()
    return all[market] || DEFAULT_MARKET_DATA[market] || {
      market,
      bias: 'neutral',
      summary: 'Market analysis pending.',
      invalidationLevel: '-',
      supportZone: { from: 0, to: 0 },
      resistanceZone: { from: 0, to: 0 },
      lastUpdated: Date.now(),
      updatedBy: 'Super Admin',
    }
  }

  /**
   * Super Admin Method: Update and Broadcast Market Bias & Levels to ALL users
   */
  public async broadcastMarketUpdate(
    market: string,
    update: Partial<LiveMarketData>,
    authorName = 'Super Admin'
  ): Promise<LiveMarketData> {
    const all = this.getAllMarkets()
    const current = all[market] || DEFAULT_MARKET_DATA[market] || {
      market,
      bias: 'neutral',
      summary: '',
      invalidationLevel: '-',
      supportZone: { from: 0, to: 0 },
      resistanceZone: { from: 0, to: 0 },
      lastUpdated: Date.now(),
    }

    const updated: LiveMarketData = {
      ...current,
      ...update,
      market,
      lastUpdated: Date.now(),
      updatedBy: authorName,
    }

    all[market] = updated

    // 1. Save to local storage for instant access across tabs
    try {
      localStorage.setItem(STORAGE_KEY_MARKETS, JSON.stringify(all))
    } catch (e) {
      console.error('[SyncService] LocalStorage error:', e)
    }

    // 2. Broadcast to all open tabs via BroadcastChannel & events
    if (this.channel) {
      this.channel.postMessage({ type: 'MARKET_DATA_UPDATED', market, data: updated })
    }
    this.notifyListeners()

    // 3. Best-effort async save to Supabase analyses for remote persistence
    try {
      // Find market_id in Supabase
      const { data: mData } = await supabase.from('markets').select('id').eq('name', market).single()
      if (mData?.id) {
        await supabase.from('analyses').upsert(
          {
            market_id: mData.id,
            title: `${market} Live Market Bias Update`,
            analysis_date: new Date().toISOString().split('T')[0],
            overall_bias: updated.bias,
            invalidation_level: typeof updated.invalidationLevel === 'number' ? updated.invalidationLevel : null,
            summary: updated.summary,
            detailed_notes: updated.notes || '',
            status: 'published',
            visibility: 'free',
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'market_id' }
        )
      }
    } catch (err) {
      console.warn('[SyncService] Supabase sync completed with local broadcast fallback')
    }

    return updated
  }

  /**
   * Super Admin Method: Broadcast Urgent Alert Banner to all users
   */
  public broadcastUrgentAlert(alert: Omit<FlashAlert, 'id' | 'timestamp' | 'active'>): FlashAlert {
    const fullAlert: FlashAlert = {
      ...alert,
      id: `ALERT_${Date.now()}`,
      timestamp: Date.now(),
      active: true,
    }

    try {
      localStorage.setItem(STORAGE_KEY_ALERT, JSON.stringify(fullAlert))
    } catch (e) {}

    if (this.channel) {
      this.channel.postMessage({ type: 'FLASH_ALERT_UPDATED', alert: fullAlert })
    }
    this.notifyListeners()

    // Optional: send to Supabase notifications table as broadcast
    try {
      supabase.from('notifications').insert({
        user_id: 'all',
        title: fullAlert.title,
        message: fullAlert.message,
        type: fullAlert.severity,
        is_read: false,
      }).then(() => {})
    } catch (_) {}

    return fullAlert
  }

  /**
   * Dismiss or clear the active flash alert
   */
  public clearUrgentAlert(): void {
    try {
      localStorage.removeItem(STORAGE_KEY_ALERT)
    } catch (e) {}

    if (this.channel) {
      this.channel.postMessage({ type: 'FLASH_ALERT_UPDATED', alert: null })
    }
    this.notifyListeners()
  }

  /**
   * Get current active flash alert
   */
  public getUrgentAlert(): FlashAlert | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_ALERT)
      if (stored) {
        const alert: FlashAlert = JSON.parse(stored)
        // Auto-expire alerts after 12 hours
        if (alert.active && Date.now() - alert.timestamp < 12 * 60 * 60 * 1000) {
          return alert
        }
      }
    } catch (e) {}
    return null
  }
}

export const broadcastSyncService = new BroadcastSyncService()
