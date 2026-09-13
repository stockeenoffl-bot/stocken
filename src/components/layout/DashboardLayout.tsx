import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Sidebar from './Sidebar'
import TopHeader from './TopHeader'
import { TradingViewTickerTape } from '@/components/tradingview'
import { ChevronUp, ChevronDown, Radio } from 'lucide-react'

export default function DashboardLayout({ isClient = false }: { isClient?: boolean }) {
  const location = useLocation()
  const [showTicker, setShowTicker] = useState(true)

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <Sidebar isClient={isClient} />
      <TopHeader />

      <main
        className="pt-16 pb-8 transition-all duration-300"
        style={{ marginLeft: 'var(--sidebar-width)' }}
      >
        {/* Global Live Indian Market Ticker Tape Banner */}
        <div className="border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)]/90 backdrop-blur-sm sticky top-16 z-30 transition-all">
          <div className="flex items-center justify-between px-4 py-1 text-[11px] bg-[var(--bg-tertiary)]/50 border-b border-[var(--border-subtle)]/50">
            <div className="flex items-center gap-1.5 font-semibold text-[var(--text-secondary)]">
              <Radio size={12} className="text-emerald-400 animate-pulse" />
              <span className="text-[10px] tracking-wider uppercase text-emerald-400">NSE & BSE LIVE TAPE</span>
              <span className="text-[var(--text-muted)] text-[10px] hidden sm:inline">• Real-Time Indian Market Feed</span>
            </div>
            <button
              onClick={() => setShowTicker(!showTicker)}
              className="flex items-center gap-1 text-[10px] font-medium text-[var(--text-muted)] hover:text-white transition-colors"
              title={showTicker ? 'Hide Live Ticker Tape' : 'Show Live Ticker Tape'}
            >
              <span>{showTicker ? 'Hide Tape' : 'Show Tape'}</span>
              {showTicker ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
          </div>

          {showTicker && (
            <div className="h-11 overflow-hidden transition-all">
              <TradingViewTickerTape isTransparent={true} />
            </div>
          )}
        </div>

        {/* Page Content */}
        <div className="px-6 pt-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}
