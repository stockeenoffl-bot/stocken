import { supabase } from '@/lib/supabase'

export interface AnalysisPayload {
  market_id: string
  title: string
  analysis_date: string
  overall_bias: 'bullish' | 'bearish' | 'neutral'
  invalidation_level?: number
  summary?: string
  detailed_notes?: string
  status: 'draft' | 'scheduled' | 'published' | 'archived'
  visibility: 'free' | 'pro' | 'vip'
  author_id: string
}

export interface ZonePayload {
  zone_type: 'support' | 'resistance' | 'liquidity' | 'demand' | 'supply'
  direction?: 'bullish' | 'bearish' | 'neutral'
  price_from: number
  price_to: number
  label?: string
  strength?: number
  notes?: string
}

export const analysisService = {
  async getMarkets() {
    const { data, error } = await supabase.from('markets').select('*').eq('active', true)
    if (error) throw error
    return data
  },

  async createAnalysis(analysis: AnalysisPayload, zones: ZonePayload[]) {
    const { data: analysisData, error: analysisError } = await supabase
      .from('analyses')
      .insert(analysis)
      .select()
      .single()

    if (analysisError) throw analysisError

    if (zones.length > 0) {
      const zonesWithId = zones.map(z => ({ ...z, analysis_id: analysisData.id }))
      const { error: zonesError } = await supabase
        .from('analysis_zones')
        .insert(zonesWithId)

      if (zonesError) throw zonesError
    }

    return analysisData
  },

  async getPublishedAnalyses(visibility?: 'free' | 'pro' | 'vip') {
    let query = supabase
      .from('analyses')
      .select('*, markets(symbol, name), analysis_zones(*)')
      .eq('status', 'published')
      .order('created_at', { ascending: false })

    if (visibility) {
      // In a real app, you would handle complex RLS or Edge Function logic for visibility.
      query = query.eq('visibility', visibility)
    }

    const { data, error } = await query
    if (error) throw error
    return data
  },

  async getAdminAnalyses() {
    const { data, error } = await supabase
      .from('analyses')
      .select('*, markets(symbol, name)')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  }
}
