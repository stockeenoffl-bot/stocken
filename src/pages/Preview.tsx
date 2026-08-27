import { useState } from 'react'
import { motion } from 'framer-motion'
import { Eye, Smartphone, Monitor, ShieldCheck, Calendar, ArrowUpRight } from 'lucide-react'
import { useAnalysis } from '@/contexts/AnalysisContext'
import { useMarket } from '@/contexts/MarketContext'
import CandlestickChart from '@/components/charts/CandlestickChart'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
}

export default function Preview() {
  const { analysis } = useAnalysis()
  const { market } = useMarket()
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop')

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">Live Preview</h1>
          <p className="text-xs mt-1 text-[var(--text-muted)]">
            Preview exactly how your active analysis looks on the subscriber portal
          </p>
        </div>
        
        {/* Device Viewport Selector */}
        <div className="flex items-center gap-1.5 p-1 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
          <button
            onClick={() => setViewMode('desktop')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200`}
            style={{
              backgroundColor: viewMode === 'desktop' ? 'var(--accent-indigo)' : 'transparent',
              color: viewMode === 'desktop' ? '#fff' : 'var(--text-secondary)',
            }}
          >
            <Monitor size={14} />
            Desktop
          </button>
          <button
            onClick={() => setViewMode('mobile')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200`}
            style={{
              backgroundColor: viewMode === 'mobile' ? 'var(--accent-indigo)' : 'transparent',
              color: viewMode === 'mobile' ? '#fff' : 'var(--text-secondary)',
            }}
          >
            <Smartphone size={14} />
            Mobile
          </button>
        </div>
      </motion.div>

      {/* Viewport Frame */}
      <motion.div
        variants={item}
        className="flex justify-center items-start w-full min-h-[600px] py-6 px-4 rounded-xl border border-[var(--border-subtle)] bg-[rgba(15,20,35,0.4)] transition-all duration-300"
      >
        <div
          className={`w-full transition-all duration-300 border border-[var(--border-subtle)] rounded-xl overflow-hidden shadow-2xl bg-[var(--bg-primary)] ${
            viewMode === 'mobile' ? 'max-w-[390px] min-h-[680px]' : 'max-w-full'
          }`}
        >
          {/* Mock Browser/Device Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
              <span className="text-[10px] ml-2 text-[var(--text-muted)] font-mono select-none">
                zonaledge.com/portal/active-bias
              </span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <ShieldCheck size={11} className="text-emerald-400" />
              <span className="text-[9px] font-semibold text-emerald-400">SECURE PORTAL</span>
            </div>
          </div>

          {/* Portal Content */}
          <div className="p-4 md:p-6 space-y-6 overflow-y-auto">
            {/* Logo/Identity */}
            <div className="flex items-center justify-between pb-4 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-2">
                <img src="/images/ZonalEdge.jpeg" alt="Zonal Edge" className="w-7 h-7 rounded-lg object-cover" />
                <div>
                  <span className="text-xs font-bold text-[var(--text-primary)] block">Zonal Edge Portal</span>
                  <span className="text-[8px] uppercase tracking-wider text-[var(--text-muted)] block">Subscriber Zone</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
                <Calendar size={12} className="text-[var(--text-muted)]" />
                <span>29 Apr 2025</span>
              </div>
            </div>

            {/* Title / Hero */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-semibold bg-indigo-500/10 border border-indigo-500/20 text-[var(--accent-indigo)]">
                <Eye size={12} />
                LATEST PUBLISHED ANALYSIS
              </div>
              <h2 className="text-lg font-bold text-[var(--text-primary)]">
                {market} Active Outlook & Levels
              </h2>
            </div>

            {/* Interactive Chart */}
            <div className="rounded-lg overflow-hidden border border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
              <CandlestickChart />
            </div>

            {/* Analysis Summary Blocks */}
            <div className={`grid gap-4 ${viewMode === 'mobile' ? 'grid-cols-1' : 'grid-cols-2'}`}>
              {/* Left Column: Zones */}
              <div className="rounded-lg border border-[var(--border-subtle)] p-4 bg-[var(--bg-secondary)] space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Key Levels & Zones</h3>
                
                <div className="space-y-3">
                  {/* Bullish Zone */}
                  <div className="p-3 rounded-md bg-emerald-500/5 border border-emerald-500/10">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wide">Bullish Zone</span>
                      <ArrowUpRight size={14} className="text-emerald-400" />
                    </div>
                    <p className="text-sm font-mono font-bold text-[var(--text-primary)]">
                      {analysis.bullishZone.from.toLocaleString()} – {analysis.bullishZone.to.toLocaleString()}
                    </p>
                  </div>

                  {/* Bearish Zone */}
                  <div className="p-3 rounded-md bg-rose-500/5 border border-rose-500/10">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wide">Bearish Zone</span>
                      <ArrowUpRight size={14} className="text-rose-400 rotate-90" />
                    </div>
                    <p className="text-sm font-mono font-bold text-[var(--text-primary)]">
                      {analysis.bearishZone.from.toLocaleString()} – {analysis.bearishZone.to.toLocaleString()}
                    </p>
                  </div>

                  {/* Liquidity Zone */}
                  <div className="p-3 rounded-md bg-purple-500/5 border border-purple-500/10">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wide">Liquidity Zone</span>
                      <ArrowUpRight size={14} className="text-purple-400 rotate-45" />
                    </div>
                    <p className="text-sm font-mono font-bold text-[var(--text-primary)]">
                      {analysis.liquidityZone.from.toLocaleString()} – {analysis.liquidityZone.to.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column: Bias & Invalidation */}
              <div className="rounded-lg border border-[var(--border-subtle)] p-4 bg-[var(--bg-secondary)] space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Bias & Conditions</h3>

                <div className="space-y-4">
                  <div>
                    <span className="text-[9px] uppercase text-[var(--text-muted)] font-semibold">Overall Outlook</span>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className="px-2.5 py-1 rounded text-xs font-bold uppercase"
                        style={{
                          backgroundColor:
                            analysis.overallBias === 'Bullish'
                              ? 'var(--success-bg)'
                              : analysis.overallBias === 'Bearish'
                              ? 'var(--danger-bg)'
                              : 'rgba(245, 158, 11, 0.1)',
                          color:
                            analysis.overallBias === 'Bullish'
                              ? 'var(--success)'
                              : analysis.overallBias === 'Bearish'
                              ? 'var(--danger)'
                              : 'var(--warning)',
                        }}
                      >
                        {analysis.overallBias}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[9px] uppercase text-[var(--text-muted)] font-semibold">Bias Statement</span>
                    <p className="text-xs font-medium text-[var(--text-primary)] mt-1">
                      {analysis.biasStatement}
                    </p>
                  </div>

                  <div>
                    <span className="text-[9px] uppercase text-[var(--text-muted)] font-semibold">Trend Invalidation Level</span>
                    <p className="text-xs font-mono font-bold text-rose-400 mt-1">
                      {analysis.invalidationLevel.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes Section */}
            <div className="rounded-lg border border-[var(--border-subtle)] p-4 bg-[var(--bg-secondary)] space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Notes & Context</h3>
              <p className="text-xs leading-relaxed text-[var(--text-secondary)] whitespace-pre-line">
                {analysis.notes}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
