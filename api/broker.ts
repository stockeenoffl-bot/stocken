/**
 * Alice Blue (ANT A3) gateway - single serverless function.
 *
 * Why server side?
 *  - The API secret and the daily userSession must NEVER reach the browser.
 *  - ONE admin login (OAuth authCode -> userSession) powers live data for ALL users.
 *  - Responses are cached in memory (and on the CDN) so hundreds of users do not
 *    hammer the broker API.
 *
 * Public (GET)   : ?action=status | quotes | history | search
 *                  All market data comes from Alice Blue only - no third-party fallbacks.
 * Admin  (POST)  : action = generate-session | set-session | disconnect | diagnostics
 *
 * The session is persisted in the Supabase table `broker_session`
 * (see supabase_live_sync.sql) so every serverless instance shares it.
 */
import crypto from 'crypto'

const ALICE_BASE = 'https://a3.aliceblueonline.com'
const IST = 19800 // seconds (UTC+5:30)
const SESSION_OPEN = 9 * 3600 + 15 * 60 // 09:15 IST in seconds from midnight

// ---------------------------------------------------------------------------
// Instruments (NSE/BSE tokens). Others can be passed as "EXCHANGE:SYMBOL:TOKEN".
// ---------------------------------------------------------------------------
interface Inst {
  symbol: string
  name: string
  exchange: 'NSE' | 'BSE'
  token: string
  kind: 'index' | 'equity'
}

const idx = (symbol: string, name: string, exchange: 'NSE' | 'BSE', token: string, _yahoo?: string[]): Inst => ({
  symbol, name, exchange, token, kind: 'index',
})
const eq = (symbol: string, name: string, token: string): Inst => ({
  symbol, name, exchange: 'NSE', token, kind: 'equity',
})

const INSTRUMENTS: Inst[] = [
  idx('NIFTY 50', 'Nifty 50', 'NSE', '26000', ['^NSEI']),
  idx('BANKNIFTY', 'Nifty Bank', 'NSE', '26009', ['^NSEBANK']),
  idx('FINNIFTY', 'Nifty Financial Services', 'NSE', '26037', ['NIFTY_FIN_SERVICE.NS']),
  idx('MIDCPNIFTY', 'Nifty Midcap Select', 'NSE', '26074', ['NIFTY_MID_SELECT.NS']),
  idx('INDIA VIX', 'India VIX', 'NSE', '26017', ['^INDIAVIX']),
  idx('SENSEX', 'S&P BSE Sensex', 'BSE', '1', ['^BSESN']),
  eq('RELIANCE', 'Reliance Industries', '2885'),
  eq('TCS', 'Tata Consultancy Services', '11536'),
  eq('HDFCBANK', 'HDFC Bank', '1333'),
  eq('INFY', 'Infosys', '1594'),
  eq('ICICIBANK', 'ICICI Bank', '4963'),
  eq('SBIN', 'State Bank of India', '3045'),
  eq('ITC', 'ITC', '1660'),
  eq('LT', 'Larsen & Toubro', '11483'),
  eq('AXISBANK', 'Axis Bank', '5900'),
  eq('KOTAKBANK', 'Kotak Mahindra Bank', '1922'),
  eq('BHARTIARTL', 'Bharti Airtel', '10604'),
  eq('HINDUNILVR', 'Hindustan Unilever', '1394'),
  eq('MARUTI', 'Maruti Suzuki', '10999'),
  eq('BAJFINANCE', 'Bajaj Finance', '317'),
  eq('TATAMOTORS', 'Tata Motors', '3456'),
  eq('SUNPHARMA', 'Sun Pharma', '3351'),
  eq('WIPRO', 'Wipro', '3787'),
  eq('ADANIENT', 'Adani Enterprises', '25'),
]

const ALIASES: Record<string, string> = {
  NIFTY: 'NIFTY 50',
  NIFTY50: 'NIFTY 50',
  NSEI: 'NIFTY 50',
  NIFTYBANK: 'BANKNIFTY',
  'NIFTY BANK': 'BANKNIFTY',
  NSEBANK: 'BANKNIFTY',
  'NIFTY FIN SERVICE': 'FINNIFTY',
  NIFTYFINSERVICE: 'FINNIFTY',
  VIX: 'INDIA VIX',
  INDIAVIX: 'INDIA VIX',
  BSESN: 'SENSEX',
  'BSE SENSEX': 'SENSEX',
}

function resolveInstrument(raw: string): Inst | null {
  if (!raw) return null
  const text = String(raw).trim()
  // EXCHANGE:SYMBOL:TOKEN (from contract-master search)
  const parts = text.split(':')
  if (parts.length === 3 && /^\d+$/.test(parts[2])) {
    const exchange = parts[0].toUpperCase() === 'BSE' ? 'BSE' : 'NSE'
    const symbol = parts[1].toUpperCase()
    return {
      symbol: text,
      name: symbol,
      exchange,
      token: parts[2],
      kind: 'equity',
    }
  }
  let key = text.toUpperCase()
  key = ALIASES[key] || ALIASES[key.replace(/\s+/g, '')] || key
  return INSTRUMENTS.find((i) => i.symbol === key) || INSTRUMENTS.find((i) => i.symbol.replace(/\s+/g, '') === key.replace(/\s+/g, '')) || null
}

// ---------------------------------------------------------------------------
// Small utils
// ---------------------------------------------------------------------------
const env = (...names: string[]) => {
  for (const n of names) if (process.env[n]) return process.env[n] as string
  return ''
}
const num = (v: any): number => {
  const n = typeof v === 'number' ? v : parseFloat(String(v ?? '').replace(/,/g, ''))
  return Number.isFinite(n) ? n : 0
}

function isMarketOpen(): boolean {
  const ist = new Date(Date.now() + IST * 1000)
  const dow = ist.getUTCDay()
  if (dow === 0 || dow === 6) return false
  const mins = ist.getUTCHours() * 60 + ist.getUTCMinutes()
  return mins >= 9 * 60 && mins <= 15 * 60 + 35
}

/** "YYYY-MM-DD HH:MM:SS" (IST) | epoch(s|ms) -> unix seconds (UTC) */
function parseTime(t: any): number {
  if (typeof t === 'number' || /^\d+(\.\d+)?$/.test(String(t))) {
    const n = Number(t)
    return Math.floor(n > 1e11 ? n / 1000 : n)
  }
  const s = String(t).trim()
  const iso = /[zZ]|[+-]\d{2}:?\d{2}$/.test(s) ? s.replace(' ', 'T') : s.replace(' ', 'T') + '+05:30'
  const ms = Date.parse(iso)
  return Number.isNaN(ms) ? 0 : Math.floor(ms / 1000)
}

interface Candle { time: number; open: number; high: number; low: number; close: number; volume: number }

// ---------------------------------------------------------------------------
// Timeframes / aggregation
// ---------------------------------------------------------------------------
const MINUTES: Record<string, number> = { '1m': 1, '5m': 5, '15m': 15, '30m': 30, '1H': 60, '4H': 240 }
const VALID_TF = ['1m', '5m', '15m', '30m', '1H', '4H', 'D', 'W', 'M']
const RANGE_DAYS: Record<string, number> = { '1D': 1, '1W': 7, '1M': 31, '3M': 92, '6M': 183, '1Y': 366, '2Y': 731, '5Y': 1827 }
// Max calendar days of intraday history we are willing to assemble per timeframe
const INTRADAY_MAX_DAYS: Record<string, number> = { '1m': 7, '5m': 45, '15m': 92, '30m': 150, '1H': 200, '4H': 366 }

function bucketStart(tf: string, t: number): number {
  const ist = t + IST
  const dayStart = Math.floor(ist / 86400) * 86400
  const mins = MINUTES[tf]
  if (mins) {
    const off = ist - dayStart - SESSION_OPEN
    const b = Math.floor(off / (mins * 60)) * mins * 60
    return dayStart + SESSION_OPEN + b - IST
  }
  if (tf === 'W') {
    const dow = new Date(dayStart * 1000).getUTCDay()
    return dayStart - ((dow + 6) % 7) * 86400 - IST
  }
  if (tf === 'M') {
    const d = new Date(dayStart * 1000)
    return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1) / 1000 - IST
  }
  return dayStart - IST // D
}

function aggregate(rows: Candle[], tf: string): Candle[] {
  const sorted = [...rows].sort((a, b) => a.time - b.time)
  const out: Candle[] = []
  for (const c of sorted) {
    if (!(c.open > 0 && c.high > 0 && c.low > 0 && c.close > 0)) continue
    const key = tf === '1m' ? c.time : bucketStart(tf, c.time)
    const last = out[out.length - 1]
    if (last && last.time === key) {
      last.high = Math.max(last.high, c.high)
      last.low = Math.min(last.low, c.low)
      last.close = c.close
      last.volume += c.volume
    } else {
      out.push({ time: key, open: c.open, high: c.high, low: c.low, close: c.close, volume: c.volume })
    }
  }
  return out
}

// ---------------------------------------------------------------------------
// Caching
// ---------------------------------------------------------------------------
const cache = new Map<string, { exp: number; data: any }>()
const inflight = new Map<string, Promise<any>>()

async function cached<T>(key: string, ttlMs: number, fn: () => Promise<T>): Promise<T> {
  const hit = cache.get(key)
  if (hit && hit.exp > Date.now()) return hit.data as T
  const running = inflight.get(key)
  if (running) return running as Promise<T>
  const p = fn()
    .then((data) => {
      cache.set(key, { exp: Date.now() + ttlMs, data })
      if (cache.size > 400) {
        const first = cache.keys().next().value
        if (first) cache.delete(first)
      }
      return data
    })
    .finally(() => inflight.delete(key))
  inflight.set(key, p)
  return p
}

// ---------------------------------------------------------------------------
// Supabase REST helpers (service role, server side only)
// ---------------------------------------------------------------------------
function sbConf() {
  const url = env('SUPABASE_URL', 'VITE_SUPABASE_URL')
  const key = env('SUPABASE_SERVICE_ROLE_KEY')
  return url && key ? { url: url.replace(/\/$/, ''), key } : null
}

async function sbFetch(path: string, init: any = {}) {
  const c = sbConf()
  if (!c) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured on the server')
  return fetch(`${c.url}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: c.key,
      Authorization: `Bearer ${c.key}`,
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  })
}

// ---------------------------------------------------------------------------
// Session management
// ---------------------------------------------------------------------------
interface Session { userId: string; userSession: string; createdAt: number }
let memSession: Session | null = null
let sessionCheckedAt = 0
let sessionInvalid = false
let lastSessionError = ''

async function loadSession(): Promise<Session | null> {
  const now = Date.now()
  if (now - sessionCheckedAt > 20000) {
    sessionCheckedAt = now
    if (sbConf()) {
      try {
        const r = await sbFetch('broker_session?id=eq.1&select=user_id,user_session,created_at')
        if (r.ok) {
          const rows = await r.json()
          const row = rows?.[0]
          if (row?.user_session) {
            const created = Date.parse(row.created_at) || now
            if (!memSession || memSession.userSession !== row.user_session) sessionInvalid = false
            memSession = { userId: row.user_id, userSession: row.user_session, createdAt: created }
          } else {
            memSession = null
          }
        }
      } catch {
        /* keep in-memory copy */
      }
    }
  }
  if (!memSession) {
    const manual = env('ALICE_BLUE_USER_SESSION')
    if (manual) memSession = { userId: env('ALICE_BLUE_USER_ID') || 'USER', userSession: manual, createdAt: now }
  }
  return memSession
}

async function saveSession(s: Session) {
  memSession = s
  sessionInvalid = false
  sessionCheckedAt = Date.now()
  lastSessionError = ''
  cache.clear()
  if (sbConf()) {
    const r = await sbFetch('broker_session?on_conflict=id', {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
      body: JSON.stringify({
        id: 1,
        user_id: s.userId,
        user_session: s.userSession,
        created_at: new Date(s.createdAt).toISOString(),
      }),
    })
    if (!r.ok) {
      const t = await r.text().catch(() => '')
      throw new Error(`Could not persist session in Supabase (HTTP ${r.status}). Run supabase_live_sync.sql. ${t.slice(0, 120)}`)
    }
  }
}

async function clearSession() {
  memSession = null
  sessionInvalid = false
  sessionCheckedAt = Date.now()
  cache.clear()
  if (sbConf()) await sbFetch('broker_session?id=eq.1', { method: 'DELETE' }).catch(() => null)
}

function sessionUsable(s: Session | null): s is Session {
  if (!s || sessionInvalid) return false
  return Date.now() - s.createdAt < 26 * 3600 * 1000
}

// ---------------------------------------------------------------------------
// Alice Blue calls
// ---------------------------------------------------------------------------
async function alice(path: string, body: any, s: Session) {
  const r = await fetch(ALICE_BASE + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${s.userId} ${s.userSession}` },
    body: JSON.stringify(body),
  })
  const text = await r.text()
  let json: any = null
  try { json = JSON.parse(text) } catch { /* html / empty */ }
  const emsg = String(json?.emsg || json?.message || json?.reason || '')
  if (r.status === 401 || r.status === 403 || /session|invalid.*token|not.*authori/i.test(emsg)) {
    sessionInvalid = true
    lastSessionError = emsg || `HTTP ${r.status}`
  }
  return { status: r.status, ok: r.ok, json, text }
}

let preferredUnit: 'ms' | 's' = 'ms'
let unitConfirmed = false

function extractRows(json: any): Candle[] {
  const arr = Array.isArray(json?.result) ? json.result : Array.isArray(json?.data) ? json.data : Array.isArray(json) ? json : []
  const out: Candle[] = []
  for (const r of arr) {
    const time = parseTime(r.time ?? r.t ?? r.datetime ?? r.date)
    const c: Candle = {
      time,
      open: num(r.open ?? r.o),
      high: num(r.high ?? r.h),
      low: num(r.low ?? r.l),
      close: num(r.close ?? r.c),
      volume: num(r.volume ?? r.v),
    }
    if (time > 0 && c.close > 0) out.push(c)
  }
  return out
}

async function aliceHistoryChunk(inst: Inst, resolution: '1' | 'D', fromSec: number, toSec: number, s: Session): Promise<Candle[]> {
  const exchange = inst.kind === 'index' ? `${inst.exchange}::index` : inst.exchange
  const units: Array<'ms' | 's'> = unitConfirmed ? [preferredUnit] : [preferredUnit, preferredUnit === 'ms' ? 's' : 'ms']
  for (const unit of units) {
    const mul = unit === 'ms' ? 1000 : 1
    const res = await alice(
      '/open-api/od/ChartAPIService/api/chart/history',
      { token: inst.token, resolution, from: String(fromSec * mul), to: String(toSec * mul), exchange },
      s
    )
    const rows = extractRows(res.json)
    if (rows.length) {
      preferredUnit = unit
      unitConfirmed = true
      return rows
    }
    if (sessionInvalid) break
  }
  return []
}

async function aliceHistory(inst: Inst, tf: string, range: string): Promise<{ candles: Candle[]; clamped: boolean } | null> {
  const s = await loadSession()
  if (!sessionUsable(s)) return null

  const intraday = !!MINUTES[tf]
  let days = RANGE_DAYS[range] || 7
  let clamped = false
  if (intraday) {
    const max = INTRADAY_MAX_DAYS[tf]
    if (days > max) { days = max; clamped = true }
  }
  const now = Math.floor(Date.now() / 1000)
  const fetchDays = range === '1D' ? 6 : days // 1D = latest session only (handles weekends/holidays)
  const from = now - fetchDays * 86400
  const chunkDays = intraday ? 20 : 700
  const resolution: '1' | 'D' = intraday ? '1' : 'D'

  const chunks: Array<[number, number]> = []
  for (let end = now; end > from; end -= chunkDays * 86400) {
    chunks.push([Math.max(from, end - chunkDays * 86400), end])
  }
  const results: Candle[][] = []
  for (let i = 0; i < chunks.length; i += 4) {
    const part = await Promise.all(chunks.slice(i, i + 4).map(([a, b]) => aliceHistoryChunk(inst, resolution, a, b, s)))
    results.push(...part)
    if (sessionInvalid) return null
  }
  const rows = results.flat()
  if (!rows.length) return null

  let candles = aggregate(rows, tf)
  if (range === '1D' && intraday && candles.length) {
    const lastDay = Math.floor((candles[candles.length - 1].time + IST) / 86400)
    candles = candles.filter((c) => Math.floor((c.time + IST) / 86400) === lastDay)
  }
  return { candles, clamped }
}

// ---------------------------------------------------------------------------
// Quotes
// ---------------------------------------------------------------------------
interface Quote {
  symbol: string; name: string; exchange: string; kind: string
  ltp: number; change: number; changePercent: number
  open: number; high: number; low: number; prevClose: number; volume: number
  ts: number; source: 'aliceblue'
}

async function aliceQuotes(list: Inst[]): Promise<Quote[]> {
  const s = await loadSession()
  if (!sessionUsable(s) || !list.length) return []
  const res = await alice(
    '/open-api/od/ChartAPIService/chart/get/multi/ohlc',
    list.map((i) => ({ exchange: i.exchange, token: i.token })),
    s
  )
  const rows = Array.isArray(res.json?.result) ? res.json.result : []
  const out: Quote[] = []
  for (const r of rows) {
    const inst = list.find((i) => i.token === String(r.tk ?? r.token))
    if (!inst) continue
    const ltp = num(r.ltp ?? r.lp)
    if (!ltp) continue
    const prevClose = num(r.pc ?? r.prevClose ?? r.close) || ltp
    const change = +(ltp - prevClose).toFixed(2)
    out.push({
      symbol: inst.symbol, name: inst.name, exchange: inst.exchange, kind: inst.kind,
      ltp, change, changePercent: prevClose ? +((change / prevClose) * 100).toFixed(2) : 0,
      open: num(r.open ?? r.o) || ltp, high: num(r.high ?? r.h) || ltp, low: num(r.low ?? r.l) || ltp,
      prevClose, volume: num(r.volume ?? r.v), ts: Date.now(), source: 'aliceblue',
    })
  }
  return out
}

async function getQuotes(list: Inst[]): Promise<Quote[]> {
  const key = 'q:' + list.map((i) => i.symbol).sort().join(',')
  return cached(key, isMarketOpen() ? 900 : 15000, async () => {
    try {
      return await aliceQuotes(list)
    } catch {
      return []
    }
  })
}

// ---------------------------------------------------------------------------
// Contract master search (best effort)
// ---------------------------------------------------------------------------
async function loadContractMaster(exch: string): Promise<any[]> {
  return cached(`cm:${exch}`, 12 * 3600 * 1000, async () => {
    const urls = [
      `https://v2api.aliceblueonline.com/restpy/contract_master?exch=${exch}`,
      `https://v2api.aliceblueonline.com/restpy/static/contract_master/V2/${exch}.json`,
    ]
    for (const u of urls) {
      try {
        const r = await fetch(u)
        if (!r.ok) continue
        const j: any = await r.json()
        const list = Array.isArray(j) ? j : Array.isArray(j?.[exch]) ? j[exch] : []
        if (list.length) return list
      } catch { /* try next */ }
    }
    return []
  })
}

async function searchSymbols(q: string) {
  const term = q.trim().toUpperCase()
  if (term.length < 2) return []
  const builtIn = INSTRUMENTS.filter((i) => i.symbol.includes(term) || i.name.toUpperCase().includes(term)).map((i) => ({
    symbol: i.symbol, name: i.name, exchange: i.exchange, token: i.token, kind: i.kind, ref: i.symbol,
  }))
  const out = [...builtIn]
  try {
    const list = await loadContractMaster('NSE')
    for (const r of list) {
      const sym = String(r.trading_symbol || r.symbol || '').toUpperCase()
      const series = String(r.series || r.instrument_type || 'EQ').toUpperCase()
      if (!sym || (series && series !== 'EQ' && series !== 'EQUITY' && series !== 'INDEX') || !sym.includes(term)) continue
      const token = String(r.token || r.exchange_token || '')
      if (!/^\d+$/.test(token) || out.find((o) => o.token === token && o.exchange === 'NSE')) continue
      const clean = sym.replace(/-EQ$/, '')
      out.push({ symbol: clean, name: String(r.name || r.formatted_ins_name || sym), exchange: 'NSE', token, kind: 'equity', ref: `NSE:${clean}:${token}` })
      if (out.length >= 25) break
    }
  } catch { /* contract master is optional */ }
  return out.slice(0, 25)
}

// ---------------------------------------------------------------------------
// Admin verification (Supabase JWT + profile role)
// ---------------------------------------------------------------------------
async function requireAdmin(req: any): Promise<{ ok: boolean; error?: string; email?: string }> {
  const header = String(req.headers?.authorization || '')
  const token = header.replace(/^Bearer\s+/i, '')
  if (!token) return { ok: false, error: 'Missing auth token. Please log in again.' }
  const url = env('SUPABASE_URL', 'VITE_SUPABASE_URL').replace(/\/$/, '')
  const anon = env('SUPABASE_ANON_KEY', 'VITE_SUPABASE_ANON_KEY')
  if (!url || !anon) return { ok: false, error: 'Supabase is not configured on the server.' }
  try {
    const r = await fetch(`${url}/auth/v1/user`, { headers: { apikey: anon, Authorization: `Bearer ${token}` } })
    if (!r.ok) return { ok: false, error: 'Invalid or expired login.' }
    const user: any = await r.json()
    const email = String(user?.email || '').toLowerCase()
    const known = ['stockenofficial@gmail.com', ...env('VITE_ADMIN_EMAILS', 'ADMIN_EMAILS').toLowerCase().split(',').map((e) => e.trim())].filter(Boolean)
    if (known.includes(email)) return { ok: true, email }
    if (sbConf()) {
      const pr = await sbFetch(`profiles?id=eq.${encodeURIComponent(user.id)}&select=role`)
      if (pr.ok) {
        const rows = await pr.json()
        if (['admin', 'super_admin', 'analyst'].includes(rows?.[0]?.role)) return { ok: true, email }
      }
    }
    return { ok: false, error: 'Admin access required.' }
  } catch (e: any) {
    return { ok: false, error: e?.message || 'Auth check failed.' }
  }
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------
function parseAuthInput(input: string, fallbackUser: string) {
  let authCode = String(input || '').trim()
  let userId = fallbackUser
  if (/[?&]authCode=/i.test(authCode) || /^https?:\/\//i.test(authCode)) {
    try {
      const u = new URL(authCode)
      authCode = u.searchParams.get('authCode') || u.searchParams.get('authcode') || authCode
      userId = u.searchParams.get('userId') || u.searchParams.get('userid') || userId
    } catch { /* keep raw */ }
  }
  return { authCode, userId: userId.toUpperCase().trim() }
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (req.method === 'OPTIONS') return res.status(200).end()

  const apiSecret = env('ALICE_BLUE_API_SECRET', 'VITE_ALICE_BLUE_API_SECRET')
  const appId = env('ALICE_BLUE_APP_ID', 'VITE_ALICE_BLUE_APP_ID')
  const ipAddress = env('ALICE_BLUE_PUBLIC_IP', 'VITE_ALICE_BLUE_PUBLIC_IP')
  const defaultUser = env('ALICE_BLUE_USER_ID', 'VITE_ALICE_BLUE_USER_ID')

  try {
    const query = req.query || Object.fromEntries(new URL(req.url, 'http://x').searchParams)
    const body = typeof req.body === 'string' ? (req.body ? JSON.parse(req.body) : {}) : req.body || {}
    const action = String(query.action || body.action || (req.method === 'GET' ? 'status' : ''))

    // ------------------------------ public ---------------------------------
    if (action === 'status') {
      const s = await loadSession()
      const usable = sessionUsable(s)
      res.setHeader('Cache-Control', 'no-store')
      return res.status(200).json({
        configured: Boolean(apiSecret && appId),
        appId,
        ipAddress,
        connected: usable,
        reason: usable ? 'ok' : !s ? 'no-session' : sessionInvalid ? 'expired' : 'stale',
        lastError: lastSessionError || undefined,
        persisted: Boolean(sbConf()),
        marketOpen: isMarketOpen(),
        session: s ? { userId: s.userId, createdAt: s.createdAt } : null,
        loginUrl: appId ? `https://ant.aliceblueonline.com/?appcode=${encodeURIComponent(appId)}` : null,
        serverTime: Date.now(),
      })
    }

    if (action === 'quotes') {
      const symbols = String(query.symbols || 'NIFTY 50').split(',').map((x) => x.trim()).filter(Boolean).slice(0, 40)
      const list = symbols.map(resolveInstrument).filter(Boolean) as Inst[]
      if (!list.length) return res.status(400).json({ error: 'No valid symbols' })
      const quotes = await getQuotes(list)
      if (!quotes.length) {
        const s = await loadSession()
        return res.status(502).json({
          error: sessionUsable(s)
            ? 'Alice Blue returned no quotes for these symbols.'
            : "Alice Blue is not connected. Admin: open the Broker page and generate today's session.",
        })
      }
      res.setHeader('Cache-Control', 'public, s-maxage=1, stale-while-revalidate=3')
      return res.status(200).json({ quotes, marketOpen: isMarketOpen(), serverTime: Date.now() })
    }

    if (action === 'history') {
      const inst = resolveInstrument(String(query.symbol || 'NIFTY 50'))
      if (!inst) return res.status(400).json({ error: 'Unknown symbol' })
      let tf = String(query.timeframe || '15m')
      if (tf === '1h') tf = '1H'
      if (tf === '4h') tf = '4H'
      if (tf === 'd' || tf === '1D') tf = 'D'
      if (!VALID_TF.includes(tf)) return res.status(400).json({ error: `Invalid timeframe. Use ${VALID_TF.join(', ')}` })
      const range = String(query.range || '1W').toUpperCase()
      if (!RANGE_DAYS[range]) return res.status(400).json({ error: `Invalid range. Use ${Object.keys(RANGE_DAYS).join(', ')}` })

      const open = isMarketOpen()
      const intraday = !!MINUTES[tf]
      const ttl = intraday ? (open ? 8000 : 300000) : open ? 60000 : 3600000
      const key = `h:${inst.symbol}:${tf}:${range}`
      const result = await cached(key, ttl, async () => {
        let out: { candles: Candle[]; clamped: boolean } | null = null
        try { out = await aliceHistory(inst, tf, range) } catch { out = null }
        return { source: 'aliceblue' as const, candles: out?.candles || [], clamped: out?.clamped || false }
      })
      if (!result.candles.length) {
        const s = await loadSession()
        return res.status(502).json({
          error: sessionUsable(s)
            ? `Alice Blue returned no ${tf} history for ${inst.symbol}.`
            : "Alice Blue is not connected. Admin: open the Broker page and generate today's session.",
          source: 'aliceblue',
        })
      }
      res.setHeader('Cache-Control', `public, s-maxage=${Math.floor(ttl / 1000)}, stale-while-revalidate=${Math.floor(ttl / 500)}`)
      return res.status(200).json({
        symbol: inst.symbol, name: inst.name, exchange: inst.exchange,
        timeframe: tf, range, source: result.source, clamped: result.clamped,
        marketOpen: open, serverTime: Date.now(), candles: result.candles,
      })
    }

    if (action === 'search') {
      const results = await searchSymbols(String(query.q || ''))
      res.setHeader('Cache-Control', 'public, s-maxage=60')
      return res.status(200).json({ results })
    }

    // ------------------------------ admin ----------------------------------
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
    const admin = await requireAdmin(req)
    if (!admin.ok) return res.status(403).json({ success: false, error: admin.error })

    if (action === 'generate-session') {
      if (!apiSecret || !appId) return res.status(500).json({ success: false, error: 'ALICE_BLUE_API_SECRET / ALICE_BLUE_APP_ID are not configured on the server.' })
      const { authCode, userId } = parseAuthInput(body.authCode, String(body.userId || defaultUser || ''))
      if (!authCode) return res.status(400).json({ success: false, error: 'authCode is required. Login at the Alice Blue URL and paste the redirect URL or authCode.' })
      if (!userId) return res.status(400).json({ success: false, error: 'Client ID is required.' })
      const checkSum = crypto.createHash('sha256').update(`${userId}${authCode}${apiSecret}`).digest('hex')
      const r = await fetch(`${ALICE_BASE}/open-api/od/v1/vendor/getUserDetails`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checkSum }),
      })
      const data: any = await r.json().catch(() => null)
      if (!(r.ok && data?.stat === 'Ok' && data?.userSession)) {
        return res.status(502).json({ success: false, error: data?.emsg || `Alice Blue rejected the authCode (HTTP ${r.status}). Auth codes are single-use - login again for a fresh one.` })
      }
      await saveSession({ userId: String(data.clientId || userId).toUpperCase(), userSession: data.userSession, createdAt: Date.now() })
      return res.status(200).json({ success: true, userId: data.clientId || userId, createdAt: Date.now() })
    }

    if (action === 'set-session') {
      const userSession = String(body.userSession || '').trim()
      const userId = String(body.userId || defaultUser || '').toUpperCase().trim()
      if (!userSession || !userId) return res.status(400).json({ success: false, error: 'userId and userSession are required.' })
      await saveSession({ userId, userSession, createdAt: Date.now() })
      return res.status(200).json({ success: true })
    }

    if (action === 'disconnect') {
      await clearSession()
      return res.status(200).json({ success: true })
    }

    if (action === 'diagnostics') {
      const steps: Array<{ step: string; status: 'success' | 'warning' | 'error'; message: string }> = []
      steps.push(apiSecret && appId
        ? { step: 'Server credentials', status: 'success', message: `App ID ${appId} and API secret loaded from server environment.` }
        : { step: 'Server credentials', status: 'error', message: 'Set ALICE_BLUE_APP_ID and ALICE_BLUE_API_SECRET in the server environment (Vercel project settings).' })
      steps.push(ipAddress
        ? { step: 'Registered static IP', status: 'warning', message: `Configured: ${ipAddress}. Alice Blue only accepts calls from this IP - Vercel egress IPs are dynamic, so use a static-IP proxy if requests are rejected.` }
        : { step: 'Registered static IP', status: 'warning', message: 'ALICE_BLUE_PUBLIC_IP not set (informational only).' })
      steps.push(sbConf()
        ? { step: 'Session persistence', status: 'success', message: 'Supabase service role configured - session is shared by all server instances.' }
        : { step: 'Session persistence', status: 'warning', message: 'SUPABASE_SERVICE_ROLE_KEY missing - session is kept in memory only and lost on restart.' })
      const s = await loadSession()
      if (!s) {
        steps.push({ step: 'Alice Blue session', status: 'error', message: "No session. Login via Alice Blue and generate today's session." })
      } else if (!sessionUsable(s)) {
        steps.push({ step: 'Alice Blue session', status: 'error', message: `Session expired/invalid ${lastSessionError ? `(${lastSessionError})` : ''}. Generate a new one.` })
      } else {
        steps.push({ step: 'Alice Blue session', status: 'success', message: `Session for ${s.userId} created ${new Date(s.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST.` })
        const nifty = resolveInstrument('NIFTY 50')!
        const q = await aliceQuotes([nifty]).catch(() => [] as Quote[])
        steps.push(q.length
          ? { step: 'Live quote (multi-OHLC)', status: 'success', message: `NIFTY 50 LTP ${q[0].ltp} received from Alice Blue.` }
          : { step: 'Live quote (multi-OHLC)', status: 'error', message: 'No quote returned. Check IP whitelisting / session.' })
        const now = Math.floor(Date.now() / 1000)
        const h = await aliceHistoryChunk(nifty, '1', now - 6 * 86400, now, s).catch(() => [] as Candle[])
        steps.push(h.length
          ? { step: 'History API (1-minute)', status: 'success', message: `${h.length} minute candles received for NIFTY 50.` }
          : { step: 'History API (1-minute)', status: 'error', message: 'No candles returned from the history endpoint.' })
        const d = await aliceHistoryChunk(nifty, 'D', now - 60 * 86400, now, s).catch(() => [] as Candle[])
        steps.push(d.length
          ? { step: 'History API (daily)', status: 'success', message: `${d.length} daily candles received.` }
          : { step: 'History API (daily)', status: 'warning', message: 'No daily candles returned.' })
      }
      return res.status(200).json({ success: !steps.some((x) => x.status === 'error'), diagnostics: steps })
    }

    return res.status(400).json({ success: false, error: 'Unknown action' })
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || 'Server error' })
  }
}
