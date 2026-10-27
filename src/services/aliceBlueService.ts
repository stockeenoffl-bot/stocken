// Alice Blue ANT A3 - browser client.
//
// SECURITY MODEL
//  * The API secret and the daily userSession live ONLY on the server
//    (api/broker.ts + Supabase `broker_session`). They are never sent to browsers.
//  * Every visitor (admin or subscriber) reads market data through the gateway,
//    so one admin login powers live charts for all users.
//  * Only a logged-in admin can create/clear the session.
import { supabase } from '@/lib/supabase'
import { isMarketOpenIST, type RangeKey, type Timeframe } from '@/lib/candles'

export type { RangeKey, Timeframe }

// Gateway base URL. In production this points at the VPS (server/server.mjs),
// e.g. https://gw.zonaledge.com - set VITE_BROKER_API_URL in Vercel/.env.
// Falls back to the local /api/broker handler (vite dev / Vercel serverless).
const API = ((import.meta.env.VITE_BROKER_API_URL as string | undefined) || '/api/broker').replace(/\/+$/, '')
const REMOTE = /^https?:\/\//.test(API) // a real gateway URL => can stream

export interface Candle {
  time: number // unix seconds (UTC)
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface AliceBlueQuote {
  symbol: string
  name: string
  exchange: string
  kind: 'index' | 'equity' | string
  ltp: number
  change: number
  changePercent: number
  open: number
  high: number
  low: number
  prevClose: number
  volume: number
  ts: number
  source: 'aliceblue'
}

export interface GatewayStatus {
  configured: boolean
  appId?: string
  ipAddress?: string
  connected: boolean
  reason: 'ok' | 'no-session' | 'expired' | 'stale' | string
  lastError?: string
  persisted: boolean
  marketOpen: boolean
  session: { userId: string; createdAt: number } | null
  loginUrl: string | null
  serverTime: number
}

export interface HistoryResponse {
  symbol: string
  name: string
  exchange: string
  timeframe: Timeframe
  range: RangeKey
  source: 'aliceblue'
  clamped: boolean
  marketOpen: boolean
  serverTime: number
  candles: Candle[]
}

export interface ConnectionDiagnostic {
  step: string
  status: 'pending' | 'success' | 'warning' | 'error'
  message: string
}

export interface SymbolResult {
  symbol: string
  name: string
  exchange: string
  token: string
  kind: string
  ref: string
}

/** One strike of the live option chain (Open Interest from Alice Blue). */
export interface OptionChainRow {
  strike: number
  callOI: number
  putOI: number
  callChange: number
  putChange: number
  callLtp: number
  putLtp: number
  callPrevOI: number
  putPrevOI: number
  callToken: string
  putToken: string
}

export interface OptionChainResponse {
  market: string
  underlying: string
  exchange: string
  expiry: string | null
  expiries: string[]
  marketOpen: boolean
  serverTime: number
  rows: OptionChainRow[]
}

async function getJson<T>(params: Record<string, string>): Promise<T> {
  const qs = new URLSearchParams(params).toString()
  const res = await fetch(`${API}?${qs}`, { headers: { Accept: 'application/json' } })
  const text = await res.text()
  let json: any = null
  try { json = JSON.parse(text) } catch { /* not json */ }
  if (!res.ok || !json) {
    throw new Error(json?.error || `Market data service unavailable (HTTP ${res.status})`)
  }
  return json as T
}

async function adminPost<T = any>(action: string, payload: Record<string, any> = {}): Promise<T> {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  const res = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token || ''}` },
    body: JSON.stringify({ action, ...payload }),
  })
  const text = await res.text()
  let json: any = null
  try { json = JSON.parse(text) } catch { /* not json */ }
  if (!json) {
    throw new Error(
      res.status === 404
        ? 'Broker gateway not found. Deploy the /api folder (Vercel) or run `npm run dev` which serves it locally.'
        : `Broker gateway error (HTTP ${res.status})`
    )
  }
  return json as T
}

type QuoteListener = (quotes: AliceBlueQuote[], meta: { marketOpen: boolean }) => void

class AliceBlueService {
  private status: GatewayStatus | null = null
  private statusPromise: Promise<GatewayStatus | null> | null = null
  private pollTimer: ReturnType<typeof setInterval> | null = null

  constructor() {
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        void this.refreshStatus()
        this.pollTimer = setInterval(() => void this.refreshStatus(), 60000)
      }, 0)
    }
  }

  // ------------------------------- status ---------------------------------
  public async refreshStatus(): Promise<GatewayStatus | null> {
    if (this.statusPromise) return this.statusPromise
    this.statusPromise = (async () => {
      try {
        const s = await getJson<GatewayStatus>({ action: 'status' })
        const changed = JSON.stringify([this.status?.connected, this.status?.configured]) !== JSON.stringify([s.connected, s.configured])
        this.status = s
        if (changed || !this.status) window.dispatchEvent(new CustomEvent('aliceblue-status-change', { detail: s }))
        return s
      } catch {
        return this.status
      } finally {
        this.statusPromise = null
      }
    })()
    const s = await this.statusPromise
    return s
  }

  public getStatus(): GatewayStatus | null {
    return this.status
  }

  /** Server has App ID + secret. */
  public isConfigured(): boolean {
    return Boolean(this.status?.configured)
  }

  /** Server holds a valid Alice Blue session -> live broker data is flowing. */
  public isSessionActive(): boolean {
    return Boolean(this.status?.connected)
  }

  // ------------------------------- market data ----------------------------
  public async getQuotes(symbols: string[]): Promise<{ quotes: AliceBlueQuote[]; marketOpen: boolean }> {
    const r = await getJson<{ quotes: AliceBlueQuote[]; marketOpen: boolean }>({
      action: 'quotes',
      symbols: symbols.join(','),
    })
    return r
  }

  /** Back-compat helper used by dashboards: the 4 headline indices. */
  public async getLiveIndexQuotes(): Promise<AliceBlueQuote[]> {
    const { quotes } = await this.getQuotes(['NIFTY 50', 'SENSEX', 'BANKNIFTY', 'FINNIFTY'])
    return quotes
  }

  public async getHistory(symbol: string, timeframe: Timeframe, range: RangeKey): Promise<HistoryResponse> {
    return getJson<HistoryResponse>({ action: 'history', symbol, timeframe, range })
  }

  public async searchSymbols(q: string): Promise<SymbolResult[]> {
    const r = await getJson<{ results: SymbolResult[] }>({ action: 'search', q })
    return r.results
  }

  /** Expiry dates available for an option-chain market (NIFTY50, SENSEX, ...). */
  public async getOptionExpiries(market: string): Promise<string[]> {
    const r = await getJson<{ expiries: string[] }>({ action: 'option-expiries', market })
    return r.expiries || []
  }

  /** Live option chain with Open Interest for one expiry. */
  public async getOptionChain(market: string, expiry?: string, interval?: number): Promise<OptionChainResponse> {
    const params: Record<string, string> = { action: 'option-chain', market }
    if (expiry) params.expiry = expiry
    if (interval) params.interval = String(interval)
    return getJson<OptionChainResponse>(params)
  }

  /**
   * Live quote stream.
   *  1. Preferred: Server-Sent Events pushed by the VPS gateway (ticks arrive
   *     continuously while the market is open - chart updates as prices move).
   *  2. Fallback: adaptive polling (1.5s open / 20s closed) if SSE is unavailable.
   */
  public subscribeQuotes(symbols: string[], cb: QuoteListener): () => void {
    let stopped = false
    let timer: ReturnType<typeof setTimeout> | null = null
    let es: EventSource | null = null
    let sseFailures = 0

    const poll = async () => {
      if (stopped) return
      let delay = isMarketOpenIST() ? 1000 : 20000
      if (typeof document !== 'undefined' && document.hidden) {
        delay = 5000
      } else {
        try {
          const r = await this.getQuotes(symbols)
          if (!stopped) cb(r.quotes, { marketOpen: r.marketOpen })
          delay = r.marketOpen ? 1000 : 20000
        } catch {
          delay = 8000
        }
      }
      if (!stopped) timer = setTimeout(poll, delay)
    }

    const startPolling = () => {
      if (stopped || timer) return
      void poll()
    }

    const startStream = () => {
      if (stopped || !REMOTE || typeof EventSource === 'undefined') return false
      try {
        es = new EventSource(`${API}?action=stream&symbols=${encodeURIComponent(symbols.join(','))}`)
        es.addEventListener('quotes', (ev: MessageEvent) => {
          if (stopped) return
          sseFailures = 0
          try {
            const data = JSON.parse(ev.data)
            cb(data.quotes || [], { marketOpen: Boolean(data.marketOpen) })
          } catch { /* ignore malformed frame */ }
        })
        es.onerror = () => {
          sseFailures += 1
          if (sseFailures >= 3) {
            try { es?.close() } catch { /* ignore */ }
            es = null
            startPolling() // gateway unreachable / proxy without SSE -> poll
          }
        }
        return true
      } catch {
        return false
      }
    }

    // One immediate fetch so the UI is populated instantly, then stream.
    void this.getQuotes(symbols)
      .then((r) => { if (!stopped) cb(r.quotes, { marketOpen: r.marketOpen }) })
      .catch(() => undefined)
      .finally(() => { if (!startStream()) startPolling() })

    return () => {
      stopped = true
      if (timer) clearTimeout(timer)
      if (es) {
        try { es.close() } catch { /* ignore */ }
        es = null
      }
    }
  }

  // ------------------------------- admin ----------------------------------
  /** Exchange the OAuth authCode (or the full redirect URL) for today's session. */
  public async generateSession(authCodeOrUrl: string, userId?: string) {
    const r = await adminPost<{ success: boolean; error?: string }>('generate-session', { authCode: authCodeOrUrl, userId })
    await this.refreshStatus()
    return r
  }

  public async setSession(userId: string, userSession: string) {
    const r = await adminPost<{ success: boolean; error?: string }>('set-session', { userId, userSession })
    await this.refreshStatus()
    return r
  }

  public async disconnect() {
    const r = await adminPost<{ success: boolean; error?: string }>('disconnect')
    await this.refreshStatus()
    return r
  }

  public async runDiagnostics(): Promise<{ success: boolean; diagnostics: ConnectionDiagnostic[]; error?: string }> {
    const r = await adminPost<{ success: boolean; diagnostics?: ConnectionDiagnostic[]; error?: string }>('diagnostics')
    return { success: Boolean(r.success), diagnostics: r.diagnostics || [], error: r.error }
  }

  public async detectPublicIp(): Promise<string | null> {
    try {
      const res = await fetch('https://api.ipify.org?format=json')
      if (!res.ok) return null
      const data = await res.json()
      return data.ip || null
    } catch {
      return null
    }
  }
}

export const aliceBlueService = new AliceBlueService()
