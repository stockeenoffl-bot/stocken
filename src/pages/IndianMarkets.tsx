import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Clock, Radio } from 'lucide-react'
import AliceBlueMiniChart from '@/components/charts/AliceBlueMiniChart'
import QuotesBoard from '@/components/charts/QuotesBoard'
import LiveChart from '@/components/charts/LiveChart'
import { isMarketOpenIST } from '@/lib/candles'

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } }
const itemVariants = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }

const INDICES = ['NIFTY 50', 'BANKNIFTY', 'FINNIFTY', 'SENSEX', 'INDIA VIX', 'MIDCPNIFTY']
const STOCKS = ['RELIANCE', 'HDFCBANK', 'ICICIBANK', 'TCS', 'INFY', 'SBIN', 'ITC', 'LT', 'AXISBANK', 'KOTAKBANK', 'BHARTIARTL', 'HINDUNILVR', 'MARUTI', 'BAJFINANCE', 'TATAMOTORS', 'SUNPHARMA', 'WIPRO', 'ADANIENT']

export default function IndianMarkets() {
  const [istTime, setIstTime] = useState('')
  const [open, setOpen] = useState(isMarketOpenIST())
  const [symbol, setSymbol] = useState('NIFTY 50')

  useEffect(() => {
    const tick = () => {
      setIstTime(new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }) + ' IST')
      setOpen(isMarketOpenIST())
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-5">
      <motion.div variants={itemVariants} className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-[var(--text-primary)]">Indian Markets</h1>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1.5 ${
              open ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' : 'text-zinc-400 border-zinc-600/30 bg-zinc-800/40'
            }`}>
              <Radio size={12} className={open ? 'animate-pulse' : ''} />
              {open ? 'MARKET OPEN (9:15 – 15:30)' : 'MARKET CLOSED'}
            </span>
          </div>
          <p className="text-xs text-[var(--text-muted)]">Live NSE & BSE indices and top stocks streamed from Alice Blue.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)]">
          <Clock size={14} className="text-[var(--accent-indigo)]" />
          <span className="text-xs font-mono font-medium text-[var(--text-primary)]">{istTime || '…'}</span>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <AliceBlueMiniChart symbol="NIFTY 50" title="NIFTY 50" height={150} />
        <AliceBlueMiniChart symbol="BANKNIFTY" title="BANK NIFTY" height={150} />
        <AliceBlueMiniChart symbol="SENSEX" title="BSE SENSEX" height={150} />
        <AliceBlueMiniChart symbol="FINNIFTY" title="FIN NIFTY" height={150} />
      </motion.div>

      <motion.div variants={itemVariants}>
        <LiveChart symbol={symbol} height={560} allowSymbolChange onSymbolChange={setSymbol} />
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <QuotesBoard title="Indices" symbols={INDICES} selected={symbol} onSelect={setSymbol} />
        <div className="xl:col-span-2">
          <QuotesBoard title="Top Stocks (NSE)" symbols={STOCKS} selected={symbol} onSelect={setSymbol} />
        </div>
      </motion.div>
    </motion.div>
  )
}
