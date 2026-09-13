import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Target,
  Compass,
  Shield,
  Layers,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  LineChart,
} from 'lucide-react'

export default function AboutUs() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)]/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium text-[var(--text-secondary)] hover:text-white hover:bg-[var(--bg-tertiary)] transition-colors"
            >
              <ArrowLeft size={14} /> Back to Home
            </Link>
            <span className="text-[var(--border-subtle)]">|</span>
            <div className="flex items-center gap-2">
              <img src="/images/ZonalEdge.jpeg" alt="Zonal Edge" className="w-5 h-5 rounded object-cover" />
              <span className="text-sm font-semibold text-[var(--text-primary)]">
                About Zonal Edge
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-3 text-xs">
            <Link to="/terms" className="text-[var(--text-secondary)] hover:text-white transition-colors">
              Terms
            </Link>
            <Link to="/privacy" className="text-[var(--text-secondary)] hover:text-white transition-colors">
              Privacy
            </Link>
            <Link to="/sebi-disclaimer" className="text-[var(--text-secondary)] hover:text-white transition-colors">
              SEBI Disclaimer
            </Link>
            <Link to="/refund-policy" className="text-[var(--text-secondary)] hover:text-white transition-colors">
              Refund Policy
            </Link>
            <Link to="/contact" className="text-[var(--text-secondary)] hover:text-white transition-colors">
              Contact
            </Link>
            <Link
              to="/login"
              className="px-3 py-1.5 rounded-md bg-[var(--accent-indigo)] text-white font-medium hover:brightness-110 transition-all"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Header */}
      <div className="border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)] py-16 px-4 sm:px-6 relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-[var(--accent-indigo)] border border-indigo-500/30 mb-4"
          >
            <Target size={14} /> Trade with Clarity. Not Confusion.
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[var(--text-primary)] mb-4"
          >
            Empowering Indian Traders with Pure Market Structure
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-sm sm:text-base text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed"
          >
            Zonal Edge was born out of a simple frustration: the Indian retail trading landscape is saturated with chaotic indicators, unverified screenshots, and conflicting tips. We built the antidote.
          </motion.p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 space-y-16">
        {/* Mission Statement */}
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--accent-indigo)] uppercase tracking-wider">
              Our Vision
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] leading-snug">
              We replace analysis paralysis with structural simplicity.
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              Most traders don't fail because they lack passion or intelligence. They fail because their charts are crowded with 15 lagging indicators, while their minds are overwhelmed by dozens of social media channels.
            </p>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              At <strong>Zonal Edge</strong>, we believe price action and market structure are supreme. Every single trading day, our models map out the key demand and supply zones where big players react, giving you unambiguous direction and risk boundaries before the market opens.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] space-y-4">
            <h3 className="text-base font-bold text-[var(--text-primary)] mb-2">What Zonal Edge Delivers:</h3>
            <ul className="space-y-3">
              {[
                'Daily institutional supply & demand zones for NIFTY 50 and SENSEX',
                'Clear directional bias statements so you know who controls the session',
                'Strict invalidation levels so you know exactly when your setup is negated',
                'Interactive live TradingView chart with full drawing and marking tools',
                'Live Open Interest (OI) analysis tracking real institutional positioning',
                'Zero buy/sell spam, zero emotional gambling, 100% structured logic',
              ].map((point, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs text-[var(--text-secondary)] leading-relaxed">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 4 Core Pillars */}
        <div className="space-y-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-2">
              The 4 Pillars of the Zonal Edge Method
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-muted)]">
              Every analysis, lesson, and chart level we publish is built upon four non-negotiable principles.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] space-y-3 hover:border-[var(--border-active)] transition-colors">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-[var(--accent-indigo)] flex items-center justify-center">
                <Layers size={22} />
              </div>
              <h3 className="text-base font-bold text-[var(--text-primary)]">1. Precise Zones</h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                We identify high-probability zones where institutional liquidity resides — not arbitrary indicator lines.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] space-y-3 hover:border-[var(--border-active)] transition-colors">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <Compass size={22} />
              </div>
              <h3 className="text-base font-bold text-[var(--text-primary)]">2. Clear Bias</h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Know whether the market is bullish above key pivots or weak below resistance. Never trade against prevailing momentum.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] space-y-3 hover:border-[var(--border-active)] transition-colors">
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
                <Shield size={22} />
              </div>
              <h3 className="text-base font-bold text-[var(--text-primary)]">3. Invalidation</h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Professional trading is about risk management. We define the exact price point that invalidates the thesis so losses stay small.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] space-y-3 hover:border-[var(--border-active)] transition-colors">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <Target size={22} />
              </div>
              <h3 className="text-base font-bold text-[var(--text-primary)]">4. Dispassionate Execution</h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                No emotion, no revenge trading, no chasing breakouts. You plan the trade before the session and execute like an institution.
              </p>
            </div>
          </div>
        </div>

        {/* Feature Highlights: Live TradingView Chart */}
        <div className="p-8 rounded-2xl border border-[var(--border-subtle)] bg-gradient-to-r from-[var(--bg-secondary)] to-[var(--bg-tertiary)] flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-indigo-500/10 text-[var(--accent-indigo)] border border-indigo-500/20">
              <LineChart size={13} /> Live Technical Charting
            </div>
            <h3 className="text-2xl font-bold text-[var(--text-primary)]">
              Draw, Mark, and Analyze on Live TradingView Charts
            </h3>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              Zonal Edge integrates official TradingView real-time charting with full left-side drawing toolbars. Mark your own supply/demand zones, draw trendlines, calculate Fibonacci ratios, and apply technical indicators on live streaming NSE/BSE feeds.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <Link
              to="/dashboard"
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[var(--accent-indigo)] text-white text-xs font-semibold hover:brightness-110 transition-all shadow-lg shadow-indigo-500/20"
            >
              <BarChart3 size={15} /> Explore Live Chart <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center p-10 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] space-y-5">
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
            Ready to trade with clarity?
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] max-w-lg mx-auto leading-relaxed">
            Join disciplined traders who rely on Zonal Edge daily to plan trades, respect invalidation levels, and manage risk properly.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => navigate('/register')}
              className="px-6 py-2.5 rounded-lg bg-[var(--accent-indigo)] text-white text-xs font-semibold hover:brightness-110 transition-all"
            >
              Start 7-Day Free Trial
            </button>
            <Link
              to="/contact"
              className="px-6 py-2.5 rounded-lg border border-[var(--border-subtle)] text-xs font-medium text-[var(--text-secondary)] hover:text-white hover:bg-[var(--bg-tertiary)] transition-colors"
            >
              Contact Our Team
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)] py-8 px-4 text-center text-xs text-[var(--text-muted)]">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2025 Zonal Edge. All rights reserved.</p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/sebi-disclaimer" className="hover:text-white transition-colors">SEBI Disclaimer</Link>
            <Link to="/refund-policy" className="hover:text-white transition-colors">Refund Policy</Link>
            <Link to="/about" className="hover:text-white transition-colors text-[var(--accent-indigo)]">About Us</Link>
            <Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link>
            <Link to="/login" className="hover:text-white transition-colors">Sign In</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
