// Shared chart/time helpers (client side). Mirrors the bucketing used by /api/broker.

export const IST_OFFSET = 19800 // seconds, UTC+5:30
const SESSION_OPEN = 9 * 3600 + 15 * 60

export type Timeframe = '1m' | '5m' | '15m' | '30m' | '1H' | '4H' | 'D' | 'W' | 'M'
export type RangeKey = '1D' | '1W' | '1M' | '3M' | '6M' | '1Y' | '2Y' | '5Y'

export const TIMEFRAMES: Timeframe[] = ['1m', '5m', '15m', '30m', '1H', '4H', 'D', 'W', 'M']
export const RANGES: RangeKey[] = ['1D', '1W', '1M', '3M', '6M', '1Y', '2Y', '5Y']

const MINUTES: Record<string, number> = { '1m': 1, '5m': 5, '15m': 15, '30m': 30, '1H': 60, '4H': 240 }

export function isTimeframe(v: any): v is Timeframe {
  return TIMEFRAMES.includes(v)
}
export function isRange(v: any): v is RangeKey {
  return RANGES.includes(v)
}

/** Start (unix seconds, UTC) of the candle that contains time `t`. */
export function bucketStart(tf: string, t: number): number {
  const ist = t + IST_OFFSET
  const dayStart = Math.floor(ist / 86400) * 86400
  const mins = MINUTES[tf]
  if (tf === '1m') return Math.floor(t / 60) * 60
  if (mins) {
    const off = ist - dayStart - SESSION_OPEN
    const b = Math.floor(off / (mins * 60)) * mins * 60
    return dayStart + SESSION_OPEN + b - IST_OFFSET
  }
  if (tf === 'W') {
    const dow = new Date(dayStart * 1000).getUTCDay()
    return dayStart - ((dow + 6) % 7) * 86400 - IST_OFFSET
  }
  if (tf === 'M') {
    const d = new Date(dayStart * 1000)
    return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1) / 1000 - IST_OFFSET
  }
  return dayStart - IST_OFFSET
}

/** lightweight-charts renders timestamps as UTC; shift so axis shows IST. */
export const toChartTime = (unix: number) => unix + IST_OFFSET
export const fromChartTime = (chart: number) => chart - IST_OFFSET

export function isMarketOpenIST(now = Date.now()): boolean {
  const ist = new Date(now + IST_OFFSET * 1000)
  const dow = ist.getUTCDay()
  if (dow === 0 || dow === 6) return false
  const mins = ist.getUTCHours() * 60 + ist.getUTCMinutes()
  return mins >= 9 * 60 + 15 && mins <= 15 * 60 + 30
}

export const fmtPrice = (n: number | undefined | null, digits = 2) =>
  typeof n === 'number' && Number.isFinite(n)
    ? n.toLocaleString('en-IN', { minimumFractionDigits: digits, maximumFractionDigits: digits })
    : '--'
