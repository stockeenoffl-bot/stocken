import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TrendingUp,
  TrendingDown,
  FileText,
  BarChart3,
  Shield,
  Lock,
  Megaphone,
  Radio,
  X,
  Clock,
  ShieldCheck,
} from 'lucide-react'
import LiveChart from '@/components/charts/LiveChart'
import StatCard from '@/components/StatCard'
import { useMarket } from '@/contexts/MarketContext'
import { useAuth } from '@/contexts/AuthContext'
import { useLiveMarket } from '@/hooks/useLiveMarket'
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
  const { profile, isSuperAdmin, isAdmin, hasEditorAccess, hasAdminAccess } = useAuth()

  // Everything below comes from what the admin published (database + realtime push)
  const { data: liveData, alert, justUpdated, ready } = useLiveMarket(market)
  const [dismissedAlert, setDismissedAlert] = useState<string | null>(null)
  const flashAlert = alert && alert.id !== dismissedAlert ? alert : null

  const isPro = profile?.role === 'admin' || profile?.role === 'super_admin'
  const published = Boolean(liveData.published)

  const effectiveBias = liveData.bias || 'neutral'
  const effectiveInvalidation = String(liveData.invalidationLevel || '-')

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-5">
      {/* Urgent Super Admin Flash Alert Banner */}
      <AnimatePresence>
        {flashAlert && flashAlert.active && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 shadow-md ${
              flashAlert.severity === 'alert'
                ? 'bg-rose-500/15 border-rose-500/30 text-rose-300'
                : flashAlert.severity === 'warning'
                ? 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                : 'bg-indigo-500/15 border-indigo-500/30 text-indigo-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-500/30 flex items-center justify-center flex-shrink-0">
                <Megaphone size={16} className="text-rose-400 animate-bounce" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider bg-rose-500 text-white px-1.5 py-0.2 rounded">
                    LIVE ALERT
                  </span>
                  <span className="text-xs font-bold text-white">{flashAlert.title}</span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">{flashAlert.message}</p>
              </div>
            </div>
            <button
              onClick={() => setDismissedAlert(flashAlert.id)}
              className="p-1 rounded text-[var(--text-muted)] hover:text-white hover:bg-white/10 transition-colors"
              title="Dismiss Alert"
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div variants={itemVariants} className="flex flex-wrap justify-between items-center gap-2">
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl font-bold text-[var(--text-primary)]">Market Outlook ({market})</h1>
          <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/30">
            <Radio size={10} className="animate-pulse" />
            LIVE SYNCED
          </span>
          {justUpdated && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500 text-white font-bold animate-pulse">
              ⚡ UPDATED JUST NOW
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {hasEditorAccess && (
            <Link
              to="/dashboard"
              className="px-3 py-1.5 rounded-lg bg-amber-500/15 text-amber-300 text-xs font-bold border border-amber-500/30 hover:bg-amber-500/25 transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <ShieldCheck size={13} className="text-amber-400" />
              <span>{hasAdminAccess ? 'Admin Console' : 'Editor Dashboard'}</span>
            </Link>
          )}
          <Link
            to="/app/subscription"
            className="px-3 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-300 text-xs font-semibold hover:bg-indigo-500/20 transition-colors flex items-center gap-1.5 border border-indigo-500/20"
          >
            <span>My Plan & Validity</span>
          </Link>
        </div>
      </motion.div>

      {/* Summary Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Market" value={market} sentiment="neutral" icon={<BarChart3 size={18} />} />
        <StatCard
          label="Overall Bias"
          value={effectiveBias.toUpperCase()}
          sentiment={effectiveBias}
          icon={effectiveBias === 'bullish' ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
        />
        <StatCard
          label="Support / Resistance"
          value={`${liveData.resistanceZone?.from || liveData.supportZone?.from || '-'} - ${liveData.resistanceZone?.to || liveData.supportZone?.to || '-'}`}
          sentiment="bullish"
          sublabel="Key price zone"
          icon={<Shield size={18} />}
        />
        <StatCard
          label="Invalid Below/Above"
          value={effectiveInvalidation}
          sentiment="bearish"
          sublabel="Trend invalidation"
          icon={<TrendingDown size={18} />}
        />
      </motion.div>

      {/* Verified Publication & Broadcast Info Banner */}
      <motion.div
        variants={itemVariants}
        className="p-3.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 flex flex-wrap items-center justify-between gap-3 text-xs shadow-sm"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center flex-shrink-0">
            <Radio size={16} className="text-indigo-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-xs">Official Analysis & Live Zones</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                ALICE BLUE LIVE FEED
              </span>
            </div>
            <p className="text-slate-300 text-[11px] mt-0.5">
              {published ? (
                (isSuperAdmin || isAdmin) ? (
                  <>Published by <strong className="text-white">{liveData.updatedBy || 'Admin'}</strong> &middot; Updates appear here automatically</>
                ) : (
                  <>Official analysis is live &middot; Updates appear here automatically</>
                )
              ) : ready ? (
                <>No analysis published yet for {market}. It will appear here automatically.</>
              ) : (
                <>Loading latest analysis…</>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px]">
          <Clock size={13} className="text-indigo-400" />
          <span>Published: <strong className="text-indigo-200">{liveData.publishedAtFormatted || '—'}</strong></span>
        </div>
      </motion.div>

      {/* Live Alice Blue chart (read only for users) */}
      <motion.div variants={itemVariants} className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[var(--text-primary)]">Live Chart · {market}</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
              Alice Blue · Real-time
            </span>
          </div>
          <span className="flex items-center gap-1 text-[10px] text-[var(--text-muted)]">
            <Lock size={11} /> Zones & drawings are published live
          </span>
        </div>

        <LiveChart
          symbol={market}
          height={620}
          defaultTimeframe={liveData.chartTimeframe || '15m'}
          defaultRange={liveData.chartRange || '1W'}
          bullishZone={published ? liveData.bullishZone || liveData.supportZone : undefined}
          bullishZones={
            published
              ? liveData.bullishZones && liveData.bullishZones.length > 0
                ? liveData.bullishZones
                : ([liveData.bullishZone || liveData.supportZone, liveData.bullishZone2, liveData.bullishZone3].filter(Boolean) as any)
              : undefined
          }
          bearishZone={published ? liveData.bearishZone || liveData.resistanceZone : undefined}
          bearishZones={
            published
              ? liveData.bearishZones && liveData.bearishZones.length > 0
                ? liveData.bearishZones
                : ([liveData.bearishZone || liveData.resistanceZone, liveData.bearishZone2, liveData.bearishZone3].filter(Boolean) as any)
              : undefined
          }
          liquidityZone={published ? liveData.liquidityZone : undefined}
          invalidationLevel={published ? liveData.invalidationLevel : undefined}
          drawings={published ? liveData.drawings || [] : []}
        />
      </motion.div>

      {/* Detailed Analysis Content */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Analysis Details - 100% Unlocked for All Users */}
        <div className="rounded-lg border p-4 bg-[var(--bg-secondary)] border-[var(--border-subtle)] relative overflow-hidden flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <FileText size={16} className="text-[var(--accent-indigo)]" />
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">Detailed Notes & Analysis</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] uppercase font-bold text-[var(--accent-indigo)]">
                  Live Commentary ({market})
                </span>
                <span className="text-[9px] font-mono text-[var(--text-muted)]">
                  {published
                    ? `Updated ${new Date(liveData.lastUpdated).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`
                    : 'Not published yet'}
                </span>
              </div>
              <p className="text-xs leading-relaxed text-[var(--text-secondary)] whitespace-pre-wrap">
                {liveData.summary}
              </p>
              {liveData.notes && (
                <p className="text-[11px] text-[var(--text-muted)] mt-2 italic">
                  Note: {liveData.notes}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Support & Resistance Zones */}
        <div className="rounded-lg border p-4 bg-[var(--bg-secondary)] border-[var(--border-subtle)] flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-semibold text-[var(--text-primary)]">Key Trading Zones</h4>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                ACTIVE
              </span>
            </div>
            
            <div className="space-y-2.5 pt-1">
              {(() => {
                const bZones = (liveData.bullishZones && liveData.bullishZones.length > 0
                  ? liveData.bullishZones
                  : [liveData.bullishZone || liveData.supportZone, liveData.bullishZone2, liveData.bullishZone3]
                ).filter((z) => z && z.from > 0 && z.to > 0)
                const beZones = (liveData.bearishZones && liveData.bearishZones.length > 0
                  ? liveData.bearishZones
                  : [liveData.bearishZone || liveData.resistanceZone, liveData.bearishZone2, liveData.bearishZone3]
                ).filter((z) => z && z.from > 0 && z.to > 0)

                return (
                  <>
                    {bZones.map((z, idx) => (
                      <div key={`hb_${idx}`} className="flex justify-between items-center text-xs pb-2 border-b border-[var(--border-subtle)]">
                        <span className="text-emerald-400 font-bold">
                          {bZones.length > 1 ? `Support / Bullish Zone ${idx + 1}` : 'Support / Bullish Zone'}
                        </span>
                        <span className="font-mono font-bold text-[var(--text-primary)]">
                          {z.from} – {z.to}
                        </span>
                      </div>
                    ))}
                    {beZones.map((z, idx) => (
                      <div key={`hbe_${idx}`} className="flex justify-between items-center text-xs pb-2 border-b border-[var(--border-subtle)]">
                        <span className="text-rose-400 font-bold">
                          {beZones.length > 1 ? `Resistance / Bearish Zone ${idx + 1}` : 'Resistance / Bearish Zone'}
                        </span>
                        <span className="font-mono font-bold text-[var(--text-primary)]">
                          {z.from} – {z.to}
                        </span>
                      </div>
                    ))}
                  </>
                )
              })()}
              <div className="flex justify-between items-center text-xs">
                <span className="text-amber-400 font-bold">Invalidation Level</span>
                <span className="font-mono font-bold text-[var(--text-primary)]">
                  {effectiveInvalidation}
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>


    </motion.div>
  )
}
