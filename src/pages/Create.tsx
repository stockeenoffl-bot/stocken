import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  PenSquare,
  Calendar,
  TrendingUp,
  TrendingDown,
  Minus,
  Plus,
  Save,
  Trash2,
  Send,
} from 'lucide-react'
import CandlestickChart from '@/components/charts/CandlestickChart'
import { useAnalysis } from '@/contexts/AnalysisContext'
import { useAuth } from '@/contexts/AuthContext'
import { analysisService } from '@/services/analysisService'
import { toast } from 'sonner'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
}

export default function Create() {
  const { analysis, setAnalysis } = useAnalysis()
  const { profile } = useAuth()
  const [bias, setBias] = useState<'Bullish' | 'Bearish' | 'Neutral'>(analysis.overallBias)
  const [markets, setMarkets] = useState<any[]>([])
  const [selectedMarketId, setSelectedMarketId] = useState<string>('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    async function loadMarkets() {
      try {
        const data = await analysisService.getMarkets()
        setMarkets(data)
        if (data && data.length > 0) {
          setSelectedMarketId(data[0].id)
        }
      } catch (err) {
        console.error('Error loading markets', err)
      }
    }
    loadMarkets()
  }, [])

  const updateBias = (b: 'Bullish' | 'Bearish' | 'Neutral') => {
    setBias(b)
    setAnalysis({ ...analysis, overallBias: b })
  }

  const handleSave = async (status: 'draft' | 'published') => {
    if (!profile) return toast.error('You must be logged in to save')
    if (!selectedMarketId) return toast.error('Select a market first')
    
    setIsSaving(true)
    try {
      const payload = {
        market_id: selectedMarketId,
        title: `${markets.find(m => m.id === selectedMarketId)?.name || 'Market'} Update`,
        analysis_date: new Date().toISOString().split('T')[0],
        overall_bias: bias.toLowerCase() as 'bullish' | 'bearish' | 'neutral',
        invalidation_level: analysis.invalidationLevel,
        detailed_notes: analysis.notes,
        bias_statement: analysis.biasStatement, // Note: Need to handle schema naming if it differs
        status,
        visibility: 'free' as const, // Default for now
        author_id: profile.id
      }
      
      const zones = [
        { zone_type: 'support' as const, direction: 'bullish' as const, price_from: analysis.bullishZone.from, price_to: analysis.bullishZone.to },
        { zone_type: 'resistance' as const, direction: 'bearish' as const, price_from: analysis.bearishZone.from, price_to: analysis.bearishZone.to },
        { zone_type: 'liquidity' as const, price_from: analysis.liquidityZone.from, price_to: analysis.liquidityZone.to }
      ]

      await analysisService.createAnalysis(payload, zones)
      toast.success(`Analysis ${status === 'draft' ? 'saved as draft' : 'published'} successfully!`)
    } catch (err: any) {
      toast.error(err.message || 'Failed to save analysis')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-5">
      {/* Header */}
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Create / Edit Analysis</h1>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Mark zones, set bias and publish for your subscribers</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border" style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-subtle)' }}>
          <Calendar size={14} style={{ color: 'var(--text-muted)' }} />
          <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>29 Apr 2025</span>
        </div>
      </motion.div>

      {/* Step 1: Select Market */}
      <motion.div variants={item} className="rounded-lg border p-4" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: 'var(--accent-indigo)' }}>1</div>
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Select Market</h3>
        </div>
        <div className="flex items-center gap-2">
          {markets.map((m) => (
            <button
              key={m.id}
              onClick={() => setSelectedMarketId(m.id)}
              className="flex items-center gap-2 px-4 py-2 rounded-md border text-sm font-medium transition-all duration-200"
              style={{
                backgroundColor: selectedMarketId === m.id ? 'var(--accent-indigo)' : 'transparent',
                borderColor: selectedMarketId === m.id ? 'var(--accent-indigo)' : 'var(--border-subtle)',
                color: selectedMarketId === m.id ? '#fff' : 'var(--text-secondary)',
              }}
            >
              <PenSquare size={14} />
              {m.name}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Step 2: Market Chart */}
      <motion.div variants={item}>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: 'var(--accent-indigo)' }}>2</div>
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Market Chart (NIFTY 50 &middot; 15m &middot; NSE)</h3>
        </div>
        <CandlestickChart />
      </motion.div>

      {/* Step 3 & 4: Zones + Bias */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Zones */}
        <motion.div variants={item} className="rounded-lg border p-4" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: 'var(--accent-indigo)' }}>3</div>
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Zones</h3>
          </div>

          {/* Bullish Zone */}
          <div className="mb-4">
            <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--success)' }}>Bullish Zone</label>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <span className="text-[10px] uppercase" style={{ color: 'var(--text-muted)' }}>From</span>
                <input
                  type="number"
                  value={analysis.bullishZone.from}
                  onChange={(e) => setAnalysis({ ...analysis, bullishZone: { ...analysis.bullishZone, from: Number(e.target.value) } })}
                  className="w-full mt-1 px-3 py-2 rounded-md border text-sm font-mono outline-none transition-colors focus:border-[var(--accent-indigo)]"
                  style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
                />
              </div>
              <div className="flex-1">
                <span className="text-[10px] uppercase" style={{ color: 'var(--text-muted)' }}>To</span>
                <input
                  type="number"
                  value={analysis.bullishZone.to}
                  onChange={(e) => setAnalysis({ ...analysis, bullishZone: { ...analysis.bullishZone, to: Number(e.target.value) } })}
                  className="w-full mt-1 px-3 py-2 rounded-md border text-sm font-mono outline-none transition-colors focus:border-[var(--accent-indigo)]"
                  style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
                />
              </div>
              <div className="w-8 h-8 rounded" style={{ backgroundColor: 'var(--success)' }} />
            </div>
          </div>

          {/* Bearish Zone */}
          <div className="mb-4">
            <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--danger)' }}>Bearish Zone</label>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <span className="text-[10px] uppercase" style={{ color: 'var(--text-muted)' }}>From</span>
                <input
                  type="number"
                  value={analysis.bearishZone.from}
                  onChange={(e) => setAnalysis({ ...analysis, bearishZone: { ...analysis.bearishZone, from: Number(e.target.value) } })}
                  className="w-full mt-1 px-3 py-2 rounded-md border text-sm font-mono outline-none transition-colors focus:border-[var(--accent-indigo)]"
                  style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
                />
              </div>
              <div className="flex-1">
                <span className="text-[10px] uppercase" style={{ color: 'var(--text-muted)' }}>To</span>
                <input
                  type="number"
                  value={analysis.bearishZone.to}
                  onChange={(e) => setAnalysis({ ...analysis, bearishZone: { ...analysis.bearishZone, to: Number(e.target.value) } })}
                  className="w-full mt-1 px-3 py-2 rounded-md border text-sm font-mono outline-none transition-colors focus:border-[var(--accent-indigo)]"
                  style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
                />
              </div>
              <div className="w-8 h-8 rounded" style={{ backgroundColor: 'var(--danger)' }} />
            </div>
          </div>

          {/* Liquidity Zone */}
          <div className="mb-4">
            <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--accent-purple)' }}>Liquidity Zone</label>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <span className="text-[10px] uppercase" style={{ color: 'var(--text-muted)' }}>From</span>
                <input
                  type="number"
                  value={analysis.liquidityZone.from}
                  onChange={(e) => setAnalysis({ ...analysis, liquidityZone: { ...analysis.liquidityZone, from: Number(e.target.value) } })}
                  className="w-full mt-1 px-3 py-2 rounded-md border text-sm font-mono outline-none transition-colors focus:border-[var(--accent-indigo)]"
                  style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
                />
              </div>
              <div className="flex-1">
                <span className="text-[10px] uppercase" style={{ color: 'var(--text-muted)' }}>To</span>
                <input
                  type="number"
                  value={analysis.liquidityZone.to}
                  onChange={(e) => setAnalysis({ ...analysis, liquidityZone: { ...analysis.liquidityZone, to: Number(e.target.value) } })}
                  className="w-full mt-1 px-3 py-2 rounded-md border text-sm font-mono outline-none transition-colors focus:border-[var(--accent-indigo)]"
                  style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
                />
              </div>
              <div className="w-8 h-8 rounded" style={{ backgroundColor: 'var(--accent-purple)' }} />
            </div>
          </div>

          <button className="flex items-center gap-1.5 text-xs font-medium transition-colors" style={{ color: 'var(--accent-indigo)' }}>
            <Plus size={14} /> Add Additional Zone (Optional)
          </button>
        </motion.div>

        {/* Bias & Invalidation */}
        <motion.div variants={item} className="rounded-lg border p-4" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: 'var(--accent-indigo)' }}>4</div>
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Bias & Invalidation</h3>
          </div>

          <div className="mb-4">
            <label className="text-[10px] uppercase tracking-wider mb-2 block" style={{ color: 'var(--text-muted)' }}>Overall Bias</label>
            <div className="flex items-center gap-2">
              {(['Bullish', 'Bearish', 'Neutral'] as const).map((b) => (
                <button
                  key={b}
                  onClick={() => updateBias(b)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md border text-xs font-medium transition-all duration-200"
                  style={{
                    backgroundColor: bias === b ? (b === 'Bullish' ? 'var(--success)' : b === 'Bearish' ? 'var(--danger)' : 'var(--warning)') : 'transparent',
                    borderColor: bias === b ? (b === 'Bullish' ? 'var(--success)' : b === 'Bearish' ? 'var(--danger)' : 'var(--warning)') : 'var(--border-subtle)',
                    color: bias === b ? '#fff' : 'var(--text-secondary)',
                  }}
                >
                  {b === 'Bullish' && <TrendingUp size={14} />}
                  {b === 'Bearish' && <TrendingDown size={14} />}
                  {b === 'Neutral' && <Minus size={14} />}
                  {b}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="text-[10px] uppercase tracking-wider mb-2 block" style={{ color: 'var(--text-muted)' }}>Bias Statement</label>
            <input
              type="text"
              value={analysis.biasStatement}
              onChange={(e) => setAnalysis({ ...analysis, biasStatement: e.target.value })}
              className="w-full px-3 py-2 rounded-md border text-sm outline-none transition-colors focus:border-[var(--accent-indigo)]"
              style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
            />
            <span className="text-[10px] mt-1 block text-right" style={{ color: 'var(--text-muted)' }}>{analysis.biasStatement.length}/100</span>
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-wider mb-2 block" style={{ color: 'var(--text-muted)' }}>Invalidation Level</label>
            <input
              type="number"
              value={analysis.invalidationLevel}
              onChange={(e) => setAnalysis({ ...analysis, invalidationLevel: Number(e.target.value) })}
              className="w-full px-3 py-2 rounded-md border text-sm font-mono outline-none transition-colors focus:border-[var(--accent-indigo)]"
              style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
            />
            <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>Below this level, the bias will be considered invalid.</p>
          </div>
        </motion.div>
      </div>

      {/* Step 5: Notes */}
      <motion.div variants={item} className="rounded-lg border p-4" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: 'var(--accent-indigo)' }}>5</div>
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Notes / Explanation</h3>
        </div>
        <textarea
          value={analysis.notes}
          onChange={(e) => setAnalysis({ ...analysis, notes: e.target.value })}
          rows={6}
          className="w-full px-3 py-2 rounded-md border text-sm outline-none transition-colors resize-none focus:border-[var(--accent-indigo)]"
          style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
        />
        <span className="text-[10px] mt-1 block text-right" style={{ color: 'var(--text-muted)' }}>{analysis.notes.length}/5000</span>
      </motion.div>

      {/* Action Buttons */}
      <motion.div variants={item} className="flex items-center justify-end gap-3 pb-4">
        <button 
          onClick={() => handleSave('draft')}
          disabled={isSaving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-md border text-sm font-medium transition-all duration-200 hover:bg-[var(--bg-tertiary)] disabled:opacity-50" 
          style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}
        >
          <Save size={16} /> Save as Draft
        </button>
        <button className="flex items-center gap-2 px-5 py-2.5 rounded-md border text-sm font-medium transition-all duration-200 hover:bg-[var(--bg-tertiary)]" style={{ borderColor: 'var(--border-subtle)', color: 'var(--danger)' }}>
          <Trash2 size={16} /> Clear All
        </button>
        <motion.button
          onClick={() => handleSave('published')}
          disabled={isSaving}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 px-6 py-2.5 rounded-md text-sm font-medium text-white transition-all duration-200 disabled:opacity-50"
          style={{ backgroundColor: 'var(--accent-indigo)', boxShadow: '0 0 20px rgba(99,102,241,0.3)' }}
        >
          <Send size={16} /> Preview & Publish
          <span className="text-[10px] opacity-80 block">Publish analysis for subscribers</span>
        </motion.button>
      </motion.div>
    </motion.div>
  )
}
