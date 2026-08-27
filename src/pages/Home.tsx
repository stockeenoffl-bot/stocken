import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp,
  TrendingDown,
  FileText,
  BarChart3,
  Target,
  Lock
} from 'lucide-react'
import CandlestickChart from '@/components/charts/CandlestickChart'
import StatCard from '@/components/StatCard'
import { useMarket } from '@/contexts/MarketContext'
import { analysisService } from '@/services/analysisService'
import { useAuth } from '@/contexts/AuthContext'
import { Link } from 'react-router-dom'

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
}

export default function Home() {
  const { market } = useMarket()
  const { profile } = useAuth()
  const [analyses, setAnalyses] = useState<any[]>([])

  useEffect(() => {
    async function loadAnalyses() {
      try {
        setLoading(true)
        // Note: For now we fetch 'free' and rely on RLS/filtering to limit PRO access later, 
        // or we fetch all published and restrict in UI for demo purposes.
        // If the user has a PRO subscription, they'd get PRO data via backend logic.
        const data = await analysisService.getPublishedAnalyses()
        setAnalyses(data || [])
      } catch (err) {
        console.error('Failed to load analyses', err)
      }
    }
    loadAnalyses()
  }, [])

  const currentAnalysis = analyses.find(a => a.markets?.name === market)

  const isPro = profile?.role === 'admin' || profile?.role === 'super_admin' // Real logic requires subscription checking

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-5">
      <motion.div variants={itemVariants} className="flex justify-between items-center">
        <h1 className="text-xl font-bold text-[var(--text-primary)]">Market Outlook</h1>
        {!isPro && (
          <Link to="/app/subscription" className="px-4 py-1.5 rounded bg-indigo-500/10 text-indigo-400 text-xs font-semibold hover:bg-indigo-500/20 transition-colors flex items-center gap-1.5">
            <Lock size={12} /> Unlock Pro Features
          </Link>
        )}
      </motion.div>

      {/* Summary Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Market" value={market} sentiment="neutral" icon={<BarChart3 size={18} />} />
        {currentAnalysis ? (
          <>
            <StatCard 
              label="Overall Bias" 
              value={currentAnalysis.overall_bias.toUpperCase()} 
              sentiment={currentAnalysis.overall_bias} 
              icon={currentAnalysis.overall_bias === 'bullish' ? <TrendingUp size={18} /> : <TrendingDown size={18} />} 
            />
            <StatCard label="Bias Statement" value={currentAnalysis.summary || 'Wait for breakout'} sentiment="neutral" icon={<Target size={18} />} />
            <StatCard label="Invalid Below" value={currentAnalysis.invalidation_level?.toString() || '-'} sentiment="bearish" sublabel="Trend invalidation" icon={<TrendingDown size={18} />} />
          </>
        ) : (
          <>
            <StatCard label="Overall Bias" value="WAITING" sentiment="neutral" icon={<TrendingUp size={18} />} />
            <StatCard label="Bias Statement" value="-" sentiment="neutral" icon={<Target size={18} />} />
            <StatCard label="Invalid Below" value="-" sentiment="neutral" sublabel="Trend invalidation" icon={<TrendingDown size={18} />} />
          </>
        )}
      </motion.div>

      {/* Chart */}
      <motion.div variants={itemVariants}>
        <CandlestickChart />
      </motion.div>

      {/* Detailed Analysis Content */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Analysis Details */}
        <div className="rounded-lg border p-4 bg-[var(--bg-secondary)] border-[var(--border-subtle)] relative overflow-hidden">
          <div className="flex items-center gap-2 mb-4">
            <FileText size={16} className="text-[var(--accent-indigo)]" />
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">Detailed Notes</h3>
          </div>
          
          {!isPro && currentAnalysis?.visibility !== 'free' ? (
            <div className="absolute inset-0 z-10 backdrop-blur-[2px] bg-[var(--bg-secondary)]/60 flex flex-col items-center justify-center text-center p-6 mt-12">
              <Lock size={32} className="text-indigo-400 mb-3" />
              <h4 className="text-sm font-bold text-[var(--text-primary)] mb-1">Premium Content</h4>
              <p className="text-xs text-[var(--text-muted)] mb-4">Detailed notes and advanced zones are restricted to Pro members.</p>
              <Link to="/app/subscription" className="px-5 py-2 rounded bg-[var(--accent-indigo)] text-white text-xs font-semibold hover:brightness-110 transition-colors">
                Upgrade Now
              </Link>
            </div>
          ) : null}
          
          {currentAnalysis ? (
            <div className="space-y-4">
               <div>
                  <p className="text-xs leading-relaxed text-[var(--text-secondary)] whitespace-pre-wrap">
                    {currentAnalysis.detailed_notes || 'No detailed notes provided for today.'}
                  </p>
               </div>
            </div>
          ) : (
            <div className="text-sm text-[var(--text-muted)]">No analysis published for {market} yet.</div>
          )}
        </div>

        {/* Support & Resistance Zones */}
        <div className="space-y-4">
          <div className="rounded-lg border p-4 bg-[var(--bg-secondary)] border-[var(--border-subtle)]">
            <h4 className="text-xs font-semibold mb-3 text-[var(--text-primary)]">Key Trading Zones</h4>
            
            {currentAnalysis?.analysis_zones?.map((zone: any) => (
              <div key={zone.id} className="flex justify-between items-center text-xs mb-3 pb-3 border-b border-[var(--border-subtle)] last:border-0 last:mb-0 last:pb-0">
                <span className="text-[var(--text-muted)] capitalize">{zone.zone_type} Zone</span>
                <span className="font-mono font-bold text-[var(--text-primary)]">{zone.price_from} – {zone.price_to}</span>
              </div>
            )) || <span className="text-xs text-[var(--text-muted)]">No zones defined.</span>}
            
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
