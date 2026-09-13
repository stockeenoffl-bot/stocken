import { useState } from 'react'
import TradingViewChart from '@/components/charts/TradingViewChart'
import {
  TradingViewMarketQuotes,
  TradingViewTechnicalAnalysis,
  TradingViewStockHeatmap,
} from '@/components/tradingview'
import { useMarket } from '@/contexts/MarketContext'
import { Activity, BarChart3, LayoutGrid, ChevronDown, ChevronUp } from 'lucide-react'

export default function LiveChartPage() {
  const { market } = useMarket()
  const [showIndianWidgets, setShowIndianWidgets] = useState(false)
  const [activeWidgetTab, setActiveWidgetTab] = useState<'quotes' | 'technical' | 'heatmap'>('quotes')

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
          <button
            onClick={() => setShowIndianWidgets(!showIndianWidgets)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 ${
              showIndianWidgets
                ? 'bg-[var(--accent-indigo)] text-white border-transparent'
                : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:text-white'
            }`}
          >
            <Activity size={13} />
            <span>{showIndianWidgets ? 'Hide Indian Market Panel' : 'Show Indian Market Panel'}</span>
            {showIndianWidgets ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>

          <div className="text-right hidden sm:block">
            <div className="text-[10px] uppercase text-[var(--text-muted)]">Active Market</div>
            <div className="text-xs font-bold text-[var(--text-primary)]">{market}</div>
          </div>
        </div>
      </div>

      {/* Optional Indian Market Widgets Drawer */}
      {showIndianWidgets && (
        <div className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-3">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-[var(--text-primary)]">
                Indian Market Companion Widgets
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/30">
                NSE & BSE Live
              </span>
            </div>

            <div className="flex items-center gap-1 p-0.5 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] text-xs">
              {[
                { id: 'quotes', label: 'Market Quotes', icon: BarChart3 },
                { id: 'technical', label: 'Technical Gauge', icon: Activity },
                { id: 'heatmap', label: 'Sector Heatmap', icon: LayoutGrid },
              ].map((tab) => {
                const Icon = tab.icon
                const isActive = activeWidgetTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveWidgetTab(tab.id as any)}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-semibold transition-all ${
                      isActive
                        ? 'bg-[var(--accent-indigo)] text-white'
                        : 'text-[var(--text-secondary)] hover:text-white'
                    }`}
                  >
                    <Icon size={12} />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            {activeWidgetTab === 'quotes' && (
              <TradingViewMarketQuotes height={460} />
            )}
            {activeWidgetTab === 'technical' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TradingViewTechnicalAnalysis defaultSymbol="NSE:NIFTY" height={420} />
                <TradingViewTechnicalAnalysis defaultSymbol="NSE:BANKNIFTY" height={420} />
              </div>
            )}
            {activeWidgetTab === 'heatmap' && (
              <TradingViewStockHeatmap height={480} />
            )}
          </div>
        </div>
      )}

      {/* Main Full-Size Interactive Chart */}
      <TradingViewChart
        defaultSymbol={defaultSymbol}
        height="calc(100vh - 220px)"
        allowSymbolChange={true}
        showQuickBar={true}
      />
    </div>
  )
}
