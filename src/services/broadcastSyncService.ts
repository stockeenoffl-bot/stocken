// Live sync: admin publishes -> Supabase `live_state` -> pushed to EVERY user via Realtime.
//
//  * Source of truth is the database (not the admin's browser), so users on other
//    devices/browsers get updates, and new visitors load the latest published state.
//  * Realtime push (~1s) + 15s polling safety net + refetch when a tab becomes visible.
//  * localStorage mirror makes first paint instant and works offline.
import { supabase } from '@/lib/supabase'
import type { ChartDrawing } from '@/types/chart'
import type { RangeKey, Timeframe } from '@/lib/candles'

export interface LiveMarketData {
  market: string
  bias: 'bullish' | 'bearish' | 'neutral'
  summary: string
  invalidationLevel: number | string
  supportZone: { from: number; to: number }
  resistanceZone: { from: number; to: number }
  bullishZone?: { from: number; to: number }
  bearishZone?: { from: number; to: number }
  liquidityZone?: { from: number; to: number }
  biasStatement?: string
  sessions?: {
    asian: 'Bullish' | 'Bearish' | 'Neutral'
    london: 'Bullish' | 'Bearish' | 'Neutral'
    newYork: 'Bullish' | 'Bearish' | 'Volatile'
  }
  target1?: number | string
  target2?: number | string
  notes?: string
  /** Admin's chart annotations, shown read-only to users. */
  drawings?: ChartDrawing[]
  /** The chart view the admin wants users to see by default. */
  chartTimeframe?: Timeframe
  chartRange?: RangeKey
  published?: boolean
  lastUpdated: number
  publishedAtFormatted?: string
  updatedBy?: string
  publishedByRole?: string
}

export interface FlashAlert {
  id: string
  title: string
  message: string
  severity: 'info' | 'warning' | 'alert' | 'success'
  timestamp: number
  active: boolean
}

const CACHE_KEY = 'zonal_edge_live_state_v3'
const ALERT_KEY = 'alert'
const marketKey = (m: string) => `market:${m}`

const emptyMarket = (market: string): LiveMarketData => ({
  market,
  bias: 'neutral',
  summary: 'Waiting for the admin to publish today\'s analysis.',
  invalidationLevel: '-',
  supportZone: { from: 0, to: 0 },
  resistanceZone: { from: 0, to: 0 },
  lastUpdated: 0,
  published: false,
})

type Row = { key: string; value: any; updated_at: string; updated_by: string | null }

class BroadcastSyncService {
  private markets: Record<string, LiveMarketData> = {}
  private alert: FlashAlert | null = null
  private listeners = new Set<() => void>()
  private started = false
  private ready = false
  private channelRef: ReturnType<typeof supabase.channel> | null = null
  private pollTimer: ReturnType<typeof setInterval> | null = null

  constructor() {
    this.readCache()
    if (typeof window !== 'undefined') {
      setTimeout(() => this.start(), 0)
    }
  }

  // ------------------------------ lifecycle ------------------------------
  private start() {
    if (this.started) return
    this.started = true
    void this.refresh()

    try {
      this.channelRef = supabase
        .channel('live_state_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'live_state' }, (payload: any) => {
          if (payload.eventType === 'DELETE') {
            const key = payload.old?.key
            if (key) this.applyRow({ key, value: null, updated_at: new Date().toISOString(), updated_by: null }, true)
          } else if (payload.new) {
            this.applyRow(payload.new as Row, true)
          }
        })
        .subscribe()
    } catch (e) {
      console.warn('[LiveSync] Realtime unavailable, using polling only', e)
    }

    this.pollTimer = setInterval(() => void this.refresh(), 15000)
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) void this.refresh()
    })
    window.addEventListener('online', () => void this.refresh())
    window.addEventListener('storage', (e) => {
      if (e.key === CACHE_KEY) {
        this.readCache()
        this.notify()
      }
    })
  }

  private readCache() {
    try {
      const raw = localStorage.getItem(CACHE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw)
      this.markets = parsed.markets || {}
      this.alert = parsed.alert || null
    } catch { /* ignore */ }
  }

  private writeCache() {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ markets: this.markets, alert: this.alert }))
    } catch { /* quota */ }
  }

  private notify() {
    this.listeners.forEach((fn) => {
      try { fn() } catch (e) { console.error('[LiveSync] listener error', e) }
    })
    window.dispatchEvent(new CustomEvent('zonal_edge_sync_change'))
  }

  /** Fetch the latest published state from the database. */
  public async refresh(): Promise<void> {
    try {
      const { data, error } = await supabase.from('live_state').select('key,value,updated_at,updated_by')
      if (error) throw error
      let changed = !this.ready
      const seen = new Set<string>()
      for (const row of (data || []) as Row[]) {
        seen.add(row.key)
        if (this.applyRow(row, false)) changed = true
      }
      // Rows deleted server side (e.g. alert cleared)
      if (!seen.has(ALERT_KEY) && this.alert) {
        this.alert = null
        changed = true
      }
      this.ready = true
      if (changed) {
        this.writeCache()
        this.notify()
      }
    } catch (e) {
      // Table missing / offline: keep whatever we have (cache)
      if (!this.ready) console.warn('[LiveSync] Could not load live_state. Run supabase_live_sync.sql.', e)
    }
  }

  private applyRow(row: Row, notifyNow: boolean): boolean {
    let changed = false
    if (row.key === ALERT_KEY) {
      const next = row.value && Object.keys(row.value).length ? (row.value as FlashAlert) : null
      if (JSON.stringify(next) !== JSON.stringify(this.alert)) {
        this.alert = next
        changed = true
      }
    } else if (row.key.startsWith('market:')) {
      const name = row.key.slice(7)
      if (!row.value) {
        if (this.markets[name]) {
          delete this.markets[name]
          changed = true
        }
      } else {
        const next = { ...emptyMarket(name), ...row.value, market: name } as LiveMarketData
        const prev = this.markets[name]
        if (!prev || prev.lastUpdated !== next.lastUpdated || JSON.stringify(prev) !== JSON.stringify(next)) {
          this.markets[name] = next
          changed = true
        }
      }
    }
    if (changed && notifyNow) {
      this.writeCache()
      this.notify()
    }
    return changed
  }

  // ------------------------------ subscribe ------------------------------
  public subscribe(callback: () => void): () => void {
    this.listeners.add(callback)
    return () => {
      this.listeners.delete(callback)
    }
  }

  public isReady() {
    return this.ready
  }

  // ------------------------------ read ------------------------------
  public getAllMarkets(): Record<string, LiveMarketData> {
    return this.markets
  }

  public getMarketData(market: string): LiveMarketData {
    return this.markets[market] || emptyMarket(market)
  }

  public getUrgentAlert(): FlashAlert | null {
    const a = this.alert
    if (a && a.active && Date.now() - a.timestamp < 12 * 60 * 60 * 1000) return a
    return null
  }

  // ------------------------------ admin write ------------------------------
  private async write(key: string, value: any, author: string) {
    const { error } = await supabase
      .from('live_state')
      .upsert({ key, value, updated_at: new Date().toISOString(), updated_by: author }, { onConflict: 'key' })
    if (error) throw new Error(`Could not publish to users: ${error.message}. Make sure supabase_live_sync.sql has been run and you are logged in as admin.`)
  }

  /** Admin only (enforced by RLS): publish a market update to every user. */
  public async broadcastMarketUpdate(
    market: string,
    update: Partial<LiveMarketData>,
    authorName = 'Admin'
  ): Promise<LiveMarketData> {
    const current = this.getMarketData(market)
    const updated: LiveMarketData = {
      ...current,
      ...update,
      market,
      published: true,
      lastUpdated: Date.now(),
      updatedBy: authorName,
    }
    await this.write(marketKey(market), updated, authorName)
    this.markets[market] = updated
    this.writeCache()
    this.notify()
    return updated
  }

  public async broadcastUrgentAlert(
    alert: Omit<FlashAlert, 'id' | 'timestamp' | 'active'>,
    authorName = 'Admin'
  ): Promise<FlashAlert> {
    const full: FlashAlert = { ...alert, id: `ALERT_${Date.now()}`, timestamp: Date.now(), active: true }
    await this.write(ALERT_KEY, full, authorName)
    this.alert = full
    this.writeCache()
    this.notify()
    return full
  }

  public async clearUrgentAlert(authorName = 'Admin'): Promise<void> {
    await this.write(ALERT_KEY, {}, authorName)
    this.alert = null
    this.writeCache()
    this.notify()
  }
}

export const broadcastSyncService = new BroadcastSyncService()
