import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Radio, Lock, PenSquare } from 'lucide-react'
import LiveChart from '@/components/charts/LiveChart'
import QuotesBoard from '@/components/charts/QuotesBoard'
import { useMarket } from '@/contexts/MarketContext'
import { useAuth } from '@/contexts/AuthContext'
import { useLiveMarket } from '@/hooks/useLiveMarket'

const WATCHLIST = ['NIFTY 50', 'BANKNIFTY', 'FINNIFTY', 'SENSEX', 'INDIA VIX', 'RELIANCE', 'HDFCBANK', 'TCS', 'INFY', 'ICICIBANK']

export default function LiveChartPage() {
  const { market } = useMarket()
  const { hasAdminAccess } = useAuth()
  const [symbol, setSymbol] = useState<string | null>(null)
  const active = symbol || market
  const { data } = useLiveMarket(active)

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-bold text-[var(--text-primary)]">Live Chart</h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
              <Radio size={10} className="animate-pulse" /> ALICE BLUE LIVE
            </span>
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Real-time NSE/BSE candles from Alice Blue — every timeframe (1m to Monthly) and range (1D to 5Y). Zones and notes below are published by the admin.
          </p>
        </div>
        {hasAdminAccess ? (
          <Link to="/create" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[var(--accent-indigo)] text-white hover:brightness-110">
            <PenSquare size={13} /> Edit & publish analysis
          </Link>
        ) : (
          <span className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)]">
            <Lock size={12} /> View only — analysis is updated by the admin in real time
          </span>
        )}
      </div>

      <LiveChart
        symbol={active}
        height={640}
        defaultTimeframe={data.chartTimeframe || '15m'}
        defaultRange={data.chartRange || '1W'}
        bullishZone={data.bullishZone || data.supportZone}
        bearishZone={data.bearishZone || data.resistanceZone}
        liquidityZone={data.liquidityZone}
        invalidationLevel={data.invalidationLevel}
        drawings={data.drawings || []}
        allowSymbolChange
        onSymbolChange={setSymbol}
      />

      <QuotesBoard title="Watchlist" symbols={WATCHLIST} selected={active} onSelect={setSymbol} />
    </div>
  )
}
