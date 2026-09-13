import TradingViewChart from '@/components/charts/TradingViewChart'
import { useMarket } from '@/contexts/MarketContext'

export default function LiveChartPage() {
  const { market } = useMarket()

  const defaultSymbol = market === 'SENSEX' ? 'BSE:SENSEX' : 'NSE:NIFTY'

  return (
    <div className="space-y-4">
      {/* Top Header Ribbon */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-bold text-[var(--text-primary)]">
              Live Technical Workspace
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              LIVE TICK
            </span>
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Full-feature TradingView terminal with real-time Indian & global exchange data, indicators, and complete drawing toolbars.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-[10px] uppercase text-[var(--text-muted)]">Active Market</div>
            <div className="text-xs font-bold text-[var(--text-primary)]">{market}</div>
          </div>
        </div>
      </div>

      {/* Main Full-Size Interactive Chart */}
      <TradingViewChart
        defaultSymbol={defaultSymbol}
        height="calc(100vh - 200px)"
        allowSymbolChange={true}
        showQuickBar={true}
      />
    </div>
  )
}
