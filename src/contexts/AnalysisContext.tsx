import { createContext, useContext, useState, type ReactNode } from 'react'

export interface Zone {
  from: number
  to: number
}

export interface SessionExpectation {
  asian: 'Bullish' | 'Bearish' | 'Neutral'
  london: 'Bullish' | 'Bearish' | 'Neutral'
  newYork: 'Bullish' | 'Bearish' | 'Volatile'
}

export interface AnalysisData {
  bullishZone: Zone
  bearishZone: Zone
  liquidityZone: Zone
  overallBias: 'Bullish' | 'Bearish' | 'Neutral'
  biasStatement: string
  invalidationLevel: number
  sessions: SessionExpectation
  notes: string
}

interface AnalysisContextType {
  analysis: AnalysisData
  setAnalysis: (a: AnalysisData) => void
}

const defaultAnalysis: AnalysisData = {
  bullishZone: { from: 24050, to: 24150 },
  bearishZone: { from: 24420, to: 24520 },
  liquidityZone: { from: 24200, to: 24280 },
  overallBias: 'Bullish',
  biasStatement: 'Bullish above 24,220',
  invalidationLevel: 24100,
  sessions: { asian: 'Neutral', london: 'Bullish', newYork: 'Volatile' },
  notes: 'Liquidity sweep below previous swing low followed by strong rejection. Expect bullish momentum if 24,220 holds. Watch reaction near bearish zone for reversal signs.',
}

const AnalysisContext = createContext<AnalysisContextType | undefined>(undefined)

export function AnalysisProvider({ children }: { children: ReactNode }) {
  const [analysis, setAnalysis] = useState<AnalysisData>(defaultAnalysis)
  return (
    <AnalysisContext.Provider value={{ analysis, setAnalysis }}>
      {children}
    </AnalysisContext.Provider>
  )
}

export function useAnalysis() {
  const ctx = useContext(AnalysisContext)
  if (!ctx) throw new Error('useAnalysis must be used within AnalysisProvider')
  return ctx
}
