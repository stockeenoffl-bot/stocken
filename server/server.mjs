/**
 * Zonal Edge - Alice Blue gateway (standalone, zero dependencies, Node >= 18)
 * Runs on your VPS. This is the ONLY place that talks to Alice Blue.
 *
 *   GET  ?action=status
 *   GET  ?action=quotes&symbols=NIFTY 50,BANKNIFTY
 *   GET  ?action=history&symbol=NIFTY 50&timeframe=15m&range=1W
 *   GET  ?action=search&q=RELI
 *   GET  ?action=stream&symbols=...        (Server-Sent Events: live quotes)
 *   POST action=generate-session|set-session|disconnect|diagnostics   (admin only)
 *
 * Session is stored on the VPS disk (DATA_DIR/session.json) - no Supabase needed
 * for it. Admin actions are verified against Supabase auth (JWT) + role.
 */
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const PORT = Number(process.env.PORT || 8787)
const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data')
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*'
const ALICE_BASE = 'https://a3.aliceblueonline.com'
const IST = 19800 // UTC+5:30 in seconds
const SESSION_OPEN = 9 * 3600 + 15 * 60 // 09:15 IST expressed from midnight

const env = (...names) => {
  for (const n of names) if (process.env[n]) return process.env[n]
  return ''
}

// ---------------------------------------------------------------------------
// Instruments. "EXCHANGE:SYMBOL:TOKEN" also works for anything else.
// ---------------------------------------------------------------------------
const idx = (symbol, name, exchange, token) => ({ symbol, name, exchange, token, kind: 'index' })
const eq = (symbol, name, token) => ({ symbol, name, exchange: 'NSE', token, kind: 'equity' })

const INSTRUMENTS = [
  idx('NIFTY 50', 'Nifty 50', 'NSE', '26000'),
  idx('BANKNIFTY', 'Nifty Bank', 'NSE', '26009'),
  idx('FINNIFTY', 'Nifty Financial Services', 'NSE', '26037'),
  idx('MIDCPNIFTY', 'Nifty Midcap Select', 'NSE', '26074'),
  idx('INDIA VIX', 'India VIX', 'NSE', '26017'),
  idx('SENSEX', 'S&P BSE Sensex', 'BSE', '1'),
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

const ALIASES = {
  NIFTY: 'NIFTY 50', NIFTY50: 'NIFTY 50', NSEI: 'NIFTY 50',
  NIFTYBANK: 'BANKNIFTY', 'NIFTY BANK': 'BANKNIFTY', NSEBANK: 'BANKNIFTY',
  'NIFTY FIN SERVICE': 'FINNIFTY', NIFTYFINSERVICE: 'FINNIFTY',
  VIX: 'INDIA VIX', INDIAVIX: 'INDIA VIX',
  BSESN: 'SENSEX', 'BSE SENSEX': 'SENSEX',
}

function resolveInstrument(raw) {
  if (!raw) return null
  const text = String(raw).trim()
  const parts = text.split(':')
  if (parts.length === 3 && /^\d+$/.test(parts[2])) {
    const exchange = parts[0].toUpperCase() === 'BSE' ? 'BSE' : 'NSE'
    const symbol = parts[1].toUpperCase()
    return { symbol: text, name: symbol, exchange, token: parts[2], kind: 'equity' }
  }
  let key = text.toUpperCase()
  key = ALIASES[key] || ALIASES[key.replace(/\s+/g, '')] || key
  return (
    INSTRUMENTS.find((i) => i.symbol === key) ||
    INSTRUMENTS.find((i) => i.symbol.replace(/\s+/g, '') === key.replace(/\s+/g, '')) ||
    null
  )
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const num = (v) => {
  const n = typeof v === 'number' ? v : parseFloat(String(v ?? '').replace(/,/g, ''))
  return Number.isFinite(n) ? n : 0
}

function isMarketOpen() {
  const ist = new Date(Date.now() + IST * 1000)
  const dow = ist.getUTCDay()
  if (dow === 0 || dow === 6) return false
  const mins = ist.getUTCHours() * 60 + ist.getUTCMinutes()
  return mins >= 9 * 60 && mins <= 15 * 60 + 35
}

function parseTime(t) {
  if (typeof t === 'number' || /^\d+(\.\d+)?$/.test(String(t))) {
    const n = Number(t)
    return Math.floor(n > 1e11 ? n / 1000 : n)
  }
  const s = String(t).trim()
  const iso = /[zZ]|[+-]\d{2}:?\d{2}$/.test(s) ? s.replace(' ', 'T') : s.replace(' ', 'T') + '+05:30'
  const ms = Date.parse(iso)
  return Number.isNaN(ms) ? 0 : Math.floor(ms / 1000)
}

const MINUTES = { '1m': 1, '5m': 5, '15m': 15, '30m': 30, '1H': 60, '4H': 240 }
const VALID_TF = ['1m', '5m', '15m', '30m', '1H', '4H', 'D', 'W', 'M']
const RANGE_DAYS = { '1D': 1, '1W': 7, '1M': 31, '3M': 92, '6M': 183, '1Y': 366, '2Y': 731, '5Y': 1827 }
const INTRADAY_MAX_DAYS = { '1m': 7, '5m': 45, '15m': 92, '30m': 150, '1H': 200, '4H': 366 }

function bucketStart(tf, t) {
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
  return dayStart - IST
}

function aggregate(rows, tf) {
  const sorted = [...rows].sort((a, b) => a.time - b.time)
  const out = []
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
      out.push({ ...c, time: key })
    }
  }
  return out
}

// Cache + in-flight de-duplication
const cache = new Map()
const inflight = new Map()
function cached(key, ttlMs, fn) {
  const hit = cache.get(key)
  if (hit && hit.exp > Date.now()) return Promise.resolve(hit.data)
  const running = inflight.get(key)
  if (running) return running
  const p = fn().then((data) => {
    cache.set(key, { exp: Date.now() + ttlMs, data })
    if (cache.size > 500) {
      const first = cache.keys().next().value
      if (first) cache.delete(first)
    }
    return data
  }).finally(() => inflight.delete(key))
  inflight.set(key, p)
  return p
}

// ---------------------------------------------------------------------------
// Session (stored on the VPS disk)
// ---------------------------------------------------------------------------
let memSession = null
let sessionInvalid = false
let lastSessionError = ''
const SESSION_FILE = () => path.join(DATA_DIR, 'session.json')

function loadSession() {
  if (memSession) return memSession
  try {
    if (fs.existsSync(SESSION_FILE())) {
      const row = JSON.parse(fs.readFileSync(SESSION_FILE(), 'utf8'))
      if (row && row.userSession) memSession = row
    }
  } catch { /* ignore */ }
  if (!memSession) {
    const manual = env('ALICE_BLUE_USER_SESSION')
    if (manual) memSession = { userId: env('ALICE_BLUE_USER_ID') || 'USER', userSession: manual, createdAt: Date.now() }
  }
  return memSession
}

function saveSession(s) {
  memSession = s
  sessionInvalid = false
  lastSessionError = ''
  cache.clear()
  fs.mkdirSync(DATA_DIR, { recursive: true })
  fs.writeFileSync(SESSION_FILE(), JSON.stringify(s, null, 2), { mode: 0o600 })
}

function clearSession() {
  memSession = null
  sessionInvalid = false
  lastSessionError = ''
  cache.clear()
  try { fs.rmSync(SESSION_FILE(), { force: true }) } catch { /* ignore */ }
}

function sessionUsable(s) {
  return Boolean(s) && !sessionInvalid && Date.now() - s.createdAt < 26 * 3600 * 1000
}

// ---------------------------------------------------------------------------
// Alice Blue
// ---------------------------------------------------------------------------
async function alice(route, body, s) {
  const r = await fetch(ALICE_BASE + route, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${s.userId} ${s.userSession}`,
    },
    body: JSON.stringify(body),
  })
  const text = await r.text()
  let json = null
  try { json = JSON.parse(text) } catch { /* html / empty */ }
  const emsg = String(json?.emsg || json?.message || json?.reason || '')
  if (r.status === 401 || r.status === 403 || /session|invalid.*token|not.*authori/i.test(emsg)) {
    sessionInvalid = true
    lastSessionError = emsg || `HTTP ${r.status}`
  }
  return { status: r.status, ok: r.ok, json, text }
}

let preferredUnit = 'ms'
let unitConfirmed = false

function extractRows(json) {
  const arr = Array.isArray(json?.result) ? json.result : Array.isArray(json?.data) ? json.data : Array.isArray(json) ? json : []
  const out = []
  for (const r of arr) {
    const time = parseTime(r.time ?? r.t ?? r.datetime ?? r.date)
    const c = {
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

async function aliceHistoryChunk(inst, resolution, fromSec, toSec, s) {
  const exchange = inst.kind === 'index' ? `${inst.exchange}::index` : inst.exchange
  const units = unitConfirmed ? [preferredUnit] : [preferredUnit, preferredUnit === 'ms' ? 's' : 'ms']
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

async function aliceHistory(inst, tf, range) {
  const s = loadSession()
  if (!sessionUsable(s)) return null

  const intraday = Boolean(MINUTES[tf])
  let days = RANGE_DAYS[range] || 7
  let clamped = false
  if (intraday && days > INTRADAY_MAX_DAYS[tf]) {
    days = INTRADAY_MAX_DAYS[tf]
    clamped = true
  }
  const now = Math.floor(Date.now() / 1000)
  const fetchDays = range === '1D' ? 6 : days // 1D = the latest session (handles weekends)
  const from = now - fetchDays * 86400
  const chunkDays = intraday ? 20 : 700
  const resolution = intraday ? '1' : 'D'

  const chunks = []
  for (let end = now; end > from; end -= chunkDays * 86400) chunks.push([Math.max(from, end - chunkDays * 86400), end])

  let rows = []
  for (let i = 0; i < chunks.length; i += 4) {
    const part = await Promise.all(chunks.slice(i, i + 4).map(([a, b]) => aliceHistoryChunk(inst, resolution, a, b, s)))
    rows.push(...part.flat())
    if (sessionInvalid) return null
  }
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
async function aliceQuotes(list) {
  const s = loadSession()
  if (!sessionUsable(s) || !list.length) return []
  const res = await alice(
    '/open-api/od/ChartAPIService/chart/get/multi/ohlc',
    list.map((i) => ({ exchange: i.exchange, token: i.token })),
    s
  )
  const rows = Array.isArray(res.json?.result) ? res.json.result : []
  const out = []
  for (const r of rows) {
    const inst = list.find((i) => i.token === String(r.tk ?? r.token))
    if (!inst) continue
    const ltp = num(r.ltp ?? r.lp)
    if (!ltp) continue
    const prevClose = num(r.pc ?? r.prevClose ?? r.close) || ltp
    const change = +(ltp - prevClose).toFixed(2)
    out.push({
      symbol: inst.symbol,
      name: inst.name,
      exchange: inst.exchange,
      kind: inst.kind,
      ltp,
      change,
      changePercent: prevClose ? +((change / prevClose) * 100).toFixed(2) : 0,
      open: num(r.open ?? r.o) || ltp,
      high: num(r.high ?? r.h) || ltp,
      low: num(r.low ?? r.l) || ltp,
      prevClose,
      volume: num(r.volume ?? r.v),
      ts: Date.now(),
      source: 'aliceblue',
    })
  }
  return out
}

function getQuotes(list) {
  const key = 'q:' + list.map((i) => i.symbol).sort().join(',')
  return cached(key, isMarketOpen() ? 900 : 15000, async () => {
    try {
      return await aliceQuotes(list)
    } catch (e) {
      console.error('[quotes]', e?.message || e)
      return []
    }
  })
}

// ---------------------------------------------------------------------------
// Contract master search (best effort)
// ---------------------------------------------------------------------------
function loadContractMaster(exch) {
  return cached(`cm:${exch}`, 12 * 3600 * 1000, async () => {
    const urls = [
      `https://v2api.aliceblueonline.com/restpy/contract_master?exch=${exch}`,
      `https://v2api.aliceblueonline.com/restpy/static/contract_master/V2/${exch}.json`,
    ]
    for (const u of urls) {
      try {
        const r = await fetch(u)
        if (!r.ok) continue
        const j = await r.json()
        const list = Array.isArray(j) ? j : Array.isArray(j?.[exch]) ? j[exch] : []
        if (list.length) return list
      } catch { /* try next */ }
    }
    return []
  })
}

async function searchSymbols(q) {
  const term = String(q || '').trim().toUpperCase()
  if (term.length < 2) return []
  const out = INSTRUMENTS
    .filter((i) => i.symbol.includes(term) || i.name.toUpperCase().includes(term))
    .map((i) => ({ symbol: i.symbol, name: i.name, exchange: i.exchange, token: i.token, kind: i.kind, ref: i.symbol }))
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
  } catch { /* optional */ }
  return out.slice(0, 25)
}

// ---------------------------------------------------------------------------
// Admin auth (Supabase JWT + admin role)
// ---------------------------------------------------------------------------
async function requireAdmin(req) {
  const token = String(req.headers?.authorization || '').replace(/^Bearer\s+/i, '')
  if (!token) return { ok: false, error: 'Missing auth token. Please log in again.' }
  const url = env('SUPABASE_URL', 'VITE_SUPABASE_URL').replace(/\/$/, '')
  const anon = env('SUPABASE_ANON_KEY', 'VITE_SUPABASE_ANON_KEY')
  if (!url || !anon) return { ok: false, error: 'Supabase is not configured on the gateway.' }
  try {
    const r = await fetch(`${url}/auth/v1/user`, { headers: { apikey: anon, Authorization: `Bearer ${token}` } })
    if (!r.ok) return { ok: false, error: 'Invalid or expired login.' }
    const user = await r.json()
    const email = String(user?.email || '').toLowerCase()
    const known = ['stockenofficial@gmail.com', ...env('ADMIN_EMAILS').toLowerCase().split(',').map((e) => e.trim())].filter(Boolean)
    if (known.includes(email)) return { ok: true, email }
    const svc = env('SUPABASE_SERVICE_ROLE_KEY')
    if (svc) {
      const pr = await fetch(`${url}/rest/v1/profiles?id=eq.${encodeURIComponent(user.id)}&select=role`, {
        headers: { apikey: svc, Authorization: `Bearer ${svc}` },
      })
      if (pr.ok) {
        const rows = await pr.json()
        if (['admin', 'super_admin', 'analyst'].includes(rows?.[0]?.role)) return { ok: true, email }
      }
    }
    return { ok: false, error: 'Admin access required.' }
  } catch (e) {
    return { ok: false, error: e?.message || 'Auth check failed.' }
  }
}

// ---------------------------------------------------------------------------
// SSE live quote stream
// ---------------------------------------------------------------------------
const sseClients = new Set() // { res, symbols: string[] }

function sseWrite(res, event, data) {
  try {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
  } catch { /* client gone */ }
}

async function sseTick() {
  if (!sseClients.size) return
  const symbols = new Set()
  for (const c of sseClients) for (const s of c.symbols) symbols.add(s)
  const list = [...symbols].map(resolveInstrument).filter(Boolean)
  if (!list.length) return
  const quotes = await getQuotes(list)
  const payload = { quotes, marketOpen: isMarketOpen(), serverTime: Date.now() }
  for (const c of sseClients) {
    const filtered = quotes.filter((q) => c.symbols.includes(q.symbol))
    sseWrite(c.res, 'quotes', { ...payload, quotes: filtered.length ? filtered : quotes })
  }
}

setInterval(() => {
  if (isMarketOpen()) void sseTick()
}, 2000)

setInterval(() => {
  if (!isMarketOpen()) void sseTick()
}, 20000)

setInterval(() => {
  for (const c of sseClients) sseWrite(c.res, 'ping', { t: Date.now() })
}, 20000)

// ---------------------------------------------------------------------------
// HTTP
// ---------------------------------------------------------------------------
function send(res, code, obj, headers = {}) {
  const body = JSON.stringify(obj)
  res.writeHead(code, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': CORS_ORIGIN,
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    ...headers,
  })
  res.end(body)
}

function parseAuthInput(input, fallbackUser) {
  let authCode = String(input || '').trim()
  let userId = fallbackUser
  if (/[?&]authCode=/i.test(authCode) || /^https?:\/\//i.test(authCode)) {
    try {
      const u = new URL(authCode)
      authCode = u.searchParams.get('authCode') || u.searchParams.get('authcode') || authCode
      userId = u.searchParams.get('userId') || u.searchParams.get('userid') || userId
    } catch { /* keep raw */ }
  }
  return { authCode, userId: String(userId || '').toUpperCase().trim() }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`)
  const q = Object.fromEntries(url.searchParams)

  if (req.method === 'OPTIONS') return send(res, 200, {})

  const apiSecret = env('ALICE_BLUE_API_SECRET')
  const appId = env('ALICE_BLUE_APP_ID')
  const ipAddress = env('ALICE_BLUE_PUBLIC_IP')
  const defaultUser = env('ALICE_BLUE_USER_ID')

  try {
    const action = String(q.action || (req.method === 'GET' ? 'status' : ''))

    if (url.pathname === '/health') return send(res, 200, { ok: true, uptime: process.uptime() })

    // ------------------------- public -------------------------
    if (action === 'status') {
      const s = loadSession()
      const usable = sessionUsable(s)
      return send(res, 200, {
        configured: Boolean(apiSecret && appId),
        appId,
        ipAddress,
        connected: usable,
        reason: usable ? 'ok' : !s ? 'no-session' : sessionInvalid ? 'expired' : 'stale',
        lastError: lastSessionError || undefined,
        persisted: true,
        marketOpen: isMarketOpen(),
        session: s ? { userId: s.userId, createdAt: s.createdAt } : null,
        loginUrl: appId ? `https://ant.aliceblueonline.com/?appcode=${encodeURIComponent(appId)}` : null,
        serverTime: Date.now(),
      }, { 'Cache-Control': 'no-store' })
    }

    if (action === 'quotes') {
      const symbols = String(q.symbols || 'NIFTY 50').split(',').map((x) => x.trim()).filter(Boolean).slice(0, 40)
      const list = symbols.map(resolveInstrument).filter(Boolean)
      if (!list.length) return send(res, 400, { error: 'No valid symbols' })
      const quotes = await getQuotes(list)
      if (!quotes.length) {
        const s = loadSession()
        return send(res, 502, {
          error: sessionUsable(s)
            ? 'Alice Blue returned no quotes for these symbols.'
            : 'Alice Blue is not connected. Admin: open Broker and generate today\'s session.',
        })
      }
      return send(res, 200, { quotes, marketOpen: isMarketOpen(), serverTime: Date.now() }, {
        'Cache-Control': 'public, s-maxage=1, stale-while-revalidate=3',
      })
    }

    if (action === 'history') {
      const inst = resolveInstrument(String(q.symbol || 'NIFTY 50'))
      if (!inst) return send(res, 400, { error: 'Unknown symbol' })
      let tf = String(q.timeframe || '15m')
      if (tf === '1h') tf = '1H'
      if (tf === '4h') tf = '4H'
      if (tf === 'd' || tf === '1D') tf = 'D'
      if (!VALID_TF.includes(tf)) return send(res, 400, { error: `Invalid timeframe. Use ${VALID_TF.join(', ')}` })
      const range = String(q.range || '1W').toUpperCase()
      if (!RANGE_DAYS[range]) return send(res, 400, { error: `Invalid range. Use ${Object.keys(RANGE_DAYS).join(', ')}` })

      const open = isMarketOpen()
      const intraday = Boolean(MINUTES[tf])
      const ttl = intraday ? (open ? 8000 : 300000) : open ? 60000 : 3600000
      const result = await cached(`h:${inst.symbol}:${tf}:${range}`, ttl, () => aliceHistory(inst, tf, range))

      if (!result || !result.candles?.length) {
        const s = loadSession()
        return send(res, 502, {
          error: sessionUsable(s)
            ? `Alice Blue returned no ${tf} history for ${inst.symbol}.`
            : 'Alice Blue is not connected. Admin: open Broker and generate today\'s session.',
          source: 'aliceblue',
        })
      }
      return send(res, 200, {
        symbol: inst.symbol,
        name: inst.name,
        exchange: inst.exchange,
        timeframe: tf,
        range,
        source: 'aliceblue',
        clamped: result.clamped,
        marketOpen: open,
        serverTime: Date.now(),
        candles: result.candles,
      }, { 'Cache-Control': `public, s-maxage=${Math.floor(ttl / 1000)}, stale-while-revalidate=${Math.floor(ttl / 500)}` })
    }

    if (action === 'search') {
      return send(res, 200, { results: await searchSymbols(q.q) }, { 'Cache-Control': 'public, s-maxage=60' })
    }

    if (action === 'stream') {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        'Access-Control-Allow-Origin': CORS_ORIGIN,
        'X-Accel-Buffering': 'no',
      })
      res.write(': connected\n\n')
      const symbols = String(q.symbols || 'NIFTY 50').split(',').map((x) => x.trim()).filter(Boolean).slice(0, 20)
      const client = { res, symbols }
      sseClients.add(client)
      req.on('close', () => sseClients.delete(client))
      return
    }

    // ------------------------- admin -------------------------
    if (req.method !== 'POST') return send(res, 405, { error: 'Method not allowed' })

    let raw = ''
    for await (const chunk of req) raw += chunk
    let body = {}
    try { body = raw ? JSON.parse(raw) : {} } catch { body = {} }

    const admin = await requireAdmin(req)
    if (!admin.ok) return send(res, 403, { success: false, error: admin.error })

    if (action === 'generate-session') {
      if (!apiSecret || !appId) {
        return send(res, 500, { success: false, error: 'ALICE_BLUE_API_SECRET / ALICE_BLUE_APP_ID are not set in the gateway .env file.' })
      }
      const { authCode, userId } = parseAuthInput(body.authCode, String(body.userId || defaultUser || ''))
      if (!authCode) return send(res, 400, { success: false, error: 'authCode is required. Login at the Alice Blue URL and paste the redirect URL or authCode.' })
      if (!userId) return send(res, 400, { success: false, error: 'Client ID is required (set ALICE_BLUE_USER_ID).' })
      const checkSum = crypto.createHash('sha256').update(`${userId}${authCode}${apiSecret}`).digest('hex')
      const r = await fetch(`${ALICE_BASE}/open-api/od/v1/vendor/getUserDetails`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checkSum }),
      })
      const data = await r.json().catch(() => null)
      if (!(r.ok && data?.stat === 'Ok' && data?.userSession)) {
        return send(res, 502, {
          success: false,
          error: data?.emsg || `Alice Blue rejected the authCode (HTTP ${r.status}). Auth codes are single-use - log in again for a fresh one.`,
        })
      }
      saveSession({ userId: String(data.clientId || userId).toUpperCase(), userSession: data.userSession, createdAt: Date.now() })
      return send(res, 200, { success: true, userId: data.clientId || userId, createdAt: Date.now() })
    }

    if (action === 'set-session') {
      const userSession = String(body.userSession || '').trim()
      const userId = String(body.userId || defaultUser || '').toUpperCase().trim()
      if (!userSession || !userId) return send(res, 400, { success: false, error: 'userId and userSession are required.' })
      saveSession({ userId, userSession, createdAt: Date.now() })
      return send(res, 200, { success: true })
    }

    if (action === 'disconnect') {
      clearSession()
      return send(res, 200, { success: true })
    }

    if (action === 'diagnostics') {
      const steps = []
      steps.push(apiSecret && appId
        ? { step: 'Server credentials', status: 'success', message: `App ID ${appId} and API secret loaded from the gateway .env.` }
        : { step: 'Server credentials', status: 'error', message: 'Set ALICE_BLUE_APP_ID and ALICE_BLUE_API_SECRET in the gateway .env file.' })
      const myIp = ipAddress || '(not set)'
      steps.push({ step: 'IP whitelist', status: 'warning', message: `This VPS must be whitelisted in the A3 portal. ALICE_BLUE_PUBLIC_IP is ${myIp} - register ${myIp} (or visit https://api.ipify.org from the VPS to confirm its IP).` })
      const s = loadSession()
      if (!s) {
        steps.push({ step: 'Alice Blue session', status: 'error', message: "No session. Use the Broker page to log in and generate today's session." })
      } else if (!sessionUsable(s)) {
        steps.push({ step: 'Alice Blue session', status: 'error', message: `Session expired/invalid ${lastSessionError ? `(${lastSessionError})` : ''}. Generate a new one.` })
      } else {
        steps.push({ step: 'Alice Blue session', status: 'success', message: `Session for ${s.userId} created ${new Date(s.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST.` })
        const nifty = resolveInstrument('NIFTY 50')
        const quotes = await aliceQuotes([nifty]).catch(() => [])
        steps.push(quotes.length
          ? { step: 'Live quote (multi-OHLC)', status: 'success', message: `NIFTY 50 LTP ${quotes[0].ltp} received from Alice Blue.` }
          : { step: 'Live quote (multi-OHLC)', status: 'error', message: 'No quote returned. Check IP whitelisting / session.' })
        const now = Math.floor(Date.now() / 1000)
        const m = await aliceHistoryChunk(nifty, '1', now - 6 * 86400, now, s).catch(() => [])
        steps.push(m.length
          ? { step: 'History API (1-minute)', status: 'success', message: `${m.length} minute candles received for NIFTY 50.` }
          : { step: 'History API (1-minute)', status: 'error', message: 'No candles returned from the history endpoint.' })
        const d = await aliceHistoryChunk(nifty, 'D', now - 60 * 86400, now, s).catch(() => [])
        steps.push(d.length
          ? { step: 'History API (daily)', status: 'success', message: `${d.length} daily candles received.` }
          : { step: 'History API (daily)', status: 'warning', message: 'No daily candles returned.' })
      }
      return send(res, 200, { success: !steps.some((x) => x.status === 'error'), diagnostics: steps })
    }

    return send(res, 400, { success: false, error: 'Unknown action' })
  } catch (err) {
    console.error('[gateway]', err)
    return send(res, 500, { success: false, error: err?.message || 'Server error' })
  }
})

server.listen(PORT, () => {
  console.log(`Zonal Edge Alice Blue gateway listening on :${PORT}`)
  console.log(`  market: ${isMarketOpen() ? 'OPEN' : 'closed'} | session: ${sessionUsable(loadSession()) ? 'active' : 'none'}`)
})
