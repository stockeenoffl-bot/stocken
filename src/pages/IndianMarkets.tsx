import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp,
  Activity,
  BarChart3,
  Filter,
  LayoutGrid,
  Clock,
  Radio,
  ExternalLink,
} from 'lucide-react'
import {
  TradingViewMarketQuotes,
  TradingViewTechnicalAnalysis,
  TradingViewStockHeatmap,
  TradingViewIndianScreener,
  TradingViewMiniChart,
} from '@/components/tradingview'
import TradingViewChart from '@/components/charts/TradingViewChart'

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
}

type TabType = 'quotes' | 'screener' | 'heatmap' | 'technical' | 'chart'

export default function IndianMarkets() {
  const [activeTab, setActiveTab] = useState<TabType>('quotes')
  const [istTime, setIstTime] = useState<string>('')
  const [marketStatus, setMarketStatus] = useState<{
    label: string
    isOpen: boolean
    color: string
  }>({
    label: 'Checking...',
    isOpen: false,
    color: 'text-amber-400 border-amber-400/30 bg-amber-400/10',
  })

  // Calculate IST Time and Indian Market Trading Status
  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      // Convert to IST (UTC + 5:30)
      const istDate = new Date(
        now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })
      )
      setIstTime(
        istDate.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        }) + ' IST'
      )

      const day = istDate.getDay() // 0 = Sun, 6 = Sat
      const hours = istDate.getHours()
      const minutes = istDate.getMinutes()
      const currentMinuteOfDay = hours * 60 + minutes

      const isWeekday = day >= 1 && day <= 5
      const isPreMarket = isWeekday && currentMinuteOfDay >= 9 * 60 && currentMinuteOfDay < 9 * 60 + 15
      const isRegularHours =
        isWeekday && currentMinuteOfDay >= 9 * 60 + 15 && currentMinuteOfDay <= 15 * 60 + 30

      if (isRegularHours) {
        setMarketStatus({
          label: 'MARKET OPEN (9:15 - 15:30)',
          isOpen: true,
          color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
        })
      } else if (isPreMarket) {
        setMarketStatus({
          label: 'PRE-MARKET SESSION',
          isOpen: true,
          color: 'text-sky-400 border-sky-500/30 bg-sky-500/10',
        })
      } else {
        setMarketStatus({
          label: 'MARKET CLOSED',
          isOpen: false,
          color: 'text-zinc-400 border-zinc-600/30 bg-zinc-800/40',
        })
      }
    }

    updateTime()
    const timer = setInterval(updateTime, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-5"
    >
      {/* Top Header Banner */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)]"
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[var(--text-primary)]">
              Indian Markets Command Center
            </h1>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1.5 ${marketStatus.color}`}
            >
              <Radio
                size={12}
                className={marketStatus.isOpen ? 'animate-pulse' : ''}
              />
              {marketStatus.label}
            </span>
          </div>
          <p className="text-xs text-[var(--text-muted)]">
            Live institutional feeds for NSE & BSE indices, top banking stocks, equities heatmap, and technical sentiment.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)]">
            <Clock size={14} className="text-[var(--accent-indigo)]" />
            <span className="text-xs font-mono font-medium text-[var(--text-primary)]">
              {istTime || 'Loading IST...'}
            </span>
          </div>

          <a
            href="https://www.tradingview.com/markets/india/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--accent-indigo)]/10 text-[var(--accent-indigo)] hover:bg-[var(--accent-indigo)]/20 text-xs font-semibold transition-colors"
          >
            <span>TradingView India</span>
            <ExternalLink size={12} />
          </a>
        </div>
      </motion.div>

      {/* Mini Indices Overview Strip */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"
      >
        <TradingViewMiniChart
          symbol="NSE:NIFTY"
          title="NIFTY 50"
          height={170}
        />
        <TradingViewMiniChart
          symbol="NSE:BANKNIFTY"
          title="BANK NIFTY"
          height={170}
        />
        <TradingViewMiniChart
          symbol="BSE:SENSEX"
          title="BSE SENSEX"
          height={170}
        />
        <TradingViewMiniChart
          symbol="NSE:FINNIFTY"
          title="FIN NIFTY"
          height={170}
        />
      </motion.div>

      {/* Tab Navigation */}
      <motion.div
        variants={itemVariants}
        className="flex flex-wrap items-center gap-1.5 p-1 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] w-fit"
      >
        {[
          { id: 'quotes', label: 'Market Overview & Quotes', icon: BarChart3 },
          { id: 'screener', label: 'Indian Stock Screener', icon: Filter },
          { id: 'heatmap', label: 'Sector Heatmap', icon: LayoutGrid },
          { id: 'technical', label: 'Technical Sentiment', icon: Activity },
          { id: 'chart', label: 'Interactive Terminal', icon: TrendingUp },
        ].map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all duration-200"
              style={{
                backgroundColor: isActive
                  ? 'var(--accent-indigo)'
                  : 'transparent',
                color: isActive ? '#fff' : 'var(--text-secondary)',
              }}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </motion.div>

      {/* Tab Content Display */}
      <motion.div variants={itemVariants} className="space-y-4">
        {activeTab === 'quotes' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <TradingViewMarketQuotes height={560} />
            </div>
            <div className="space-y-4">
              <TradingViewTechnicalAnalysis
                defaultSymbol="NSE:NIFTY"
                height={480}
              />
            </div>
          </div>
        )}

        {activeTab === 'screener' && (
          <TradingViewIndianScreener height={640} />
        )}

        {activeTab === 'heatmap' && (
          <TradingViewStockHeatmap height={600} />
        )}

        {activeTab === 'technical' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TradingViewTechnicalAnalysis
              defaultSymbol="NSE:NIFTY"
              height={440}
            />
            <TradingViewTechnicalAnalysis
              defaultSymbol="NSE:BANKNIFTY"
              height={440}
            />
          </div>
        )}

        {activeTab === 'chart' && (
          <div className="space-y-3">
            <TradingViewChart
              defaultSymbol="NSE:NIFTY"
              height={620}
              allowSymbolChange={true}
              showQuickBar={true}
            />
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
