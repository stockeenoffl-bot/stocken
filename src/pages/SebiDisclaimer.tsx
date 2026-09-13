import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  ShieldAlert,
  AlertTriangle,
  FileText,
  TrendingDown,
  Info,
  Scale,
  PhoneCall,
  CheckCircle2,
} from 'lucide-react'

export default function SebiDisclaimer() {
  const [acknowledged, setAcknowledged] = useState(false)

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
                SEBI Disclaimer & Risk Notice
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
            <Link to="/refund-policy" className="text-[var(--text-secondary)] hover:text-white transition-colors">
              Refund Policy
            </Link>
            <Link to="/about" className="text-[var(--text-secondary)] hover:text-white transition-colors">
              About Us
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
      <div className="border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)] py-12 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30 mb-4"
          >
            <ShieldAlert size={14} /> Statutory Regulatory Compliance
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text-primary)] mb-4"
          >
            SEBI Regulatory Disclaimer & Risk Disclosure
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-sm text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed"
          >
            Mandatory statutory disclosures, non-registration notice, and capital risk guidelines
            for visitors and subscribers of Zonal Edge under Securities and Exchange Board of India (SEBI) guidelines.
          </motion.p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8">
        {/* SEBI F&O Study Warning Card */}
        <div className="p-6 rounded-2xl border border-rose-500/30 bg-rose-500/5 backdrop-blur-sm relative overflow-hidden">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center shrink-0 text-rose-400">
              <TrendingDown size={24} />
            </div>
            <div className="space-y-2">
              <h2 className="text-base font-bold text-rose-300 flex items-center gap-2">
                Mandatory SEBI Risk Disclosure on Derivatives (F&O)
              </h2>
              <p className="text-xs text-rose-200/90 leading-relaxed">
                As per SEBI study dated January 25, 2023 on "Analysis of Profit and Loss of Individual Traders in equity Futures and Options (F&O) Segment":
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3 rounded-lg bg-[var(--bg-secondary)] border border-rose-500/20 text-center">
                  <div className="text-xl font-extrabold text-rose-400">9 out of 10</div>
                  <div className="text-[10px] text-[var(--text-muted)] mt-0.5">Individual traders incurred net losses</div>
                </div>
                <div className="p-3 rounded-lg bg-[var(--bg-secondary)] border border-rose-500/20 text-center">
                  <div className="text-xl font-extrabold text-rose-400">₹1,25,000</div>
                  <div className="text-[10px] text-[var(--text-muted)] mt-0.5">Average net loss per loss-maker</div>
                </div>
                <div className="p-3 rounded-lg bg-[var(--bg-secondary)] border border-rose-500/20 text-center">
                  <div className="text-xl font-extrabold text-rose-400">28% Extra</div>
                  <div className="text-[10px] text-[var(--text-muted)] mt-0.5">Paid additionally in transaction costs</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Core Notice: Not SEBI Registered */}
        <div className="p-6 rounded-2xl border border-amber-500/30 bg-amber-500/5 space-y-3">
          <div className="flex items-center gap-3">
            <ShieldAlert size={22} className="text-amber-400 shrink-0" />
            <h3 className="text-base font-bold text-amber-300">
              1. Non-Registration with SEBI Notice
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-amber-100/90 leading-relaxed">
            <strong>Zonal Edge (along with its operators, analysts, mentors, and developers) is NOT registered with the Securities and Exchange Board of India (SEBI)</strong> as an Investment Adviser (RIA) under SEBI (Investment Advisers) Regulations, 2013, nor as a Research Analyst (RA) under SEBI (Research Analysts) Regulations, 2014.
          </p>
          <p className="text-xs text-amber-200/80 leading-relaxed">
            Neither Zonal Edge nor any of its representatives provide personalized investment recommendations, portfolio advisory services, managed accounts, or guaranteed capital returns in any form.
          </p>
        </div>

        {/* 2. Educational and Research Nature */}
        <div className="p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] space-y-4">
          <div className="flex items-center gap-3">
            <Info size={20} className="text-[var(--accent-indigo)] shrink-0" />
            <h3 className="text-base font-bold text-[var(--text-primary)]">
              2. Strictly Educational and Analytical Purpose
            </h3>
          </div>
          <div className="space-y-3 text-xs leading-relaxed text-[var(--text-secondary)]">
            <p>
              All materials published on Zonal Edge — including daily market structure analysis for NIFTY 50 and SENSEX, supply and demand zones, Open Interest (OI) heatmaps, candlestick charting patterns, invalidation levels, live TradingView charts, and educational modules — are developed solely for <strong>educational, informational, and theoretical study purposes</strong>.
            </p>
            <p>
              Any price levels, support/resistance zones, or directional biases discussed on the platform represent historical market structure analysis and mathematical models. They should never be treated as trading tips, buy/sell signals, or solicitation to invest capital.
            </p>
          </div>
        </div>

        {/* 3. Comprehensive Risk Disclosure */}
        <div className="p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] space-y-4">
          <div className="flex items-center gap-3">
            <AlertTriangle size={20} className="text-amber-400 shrink-0" />
            <h3 className="text-base font-bold text-[var(--text-primary)]">
              3. Nature of Stock and Derivatives Market Risk
            </h3>
          </div>
          <div className="space-y-3 text-xs leading-relaxed text-[var(--text-secondary)]">
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong className="text-[var(--text-primary)]">Capital Loss Risk:</strong> Trading in equities, futures, options, commodities, and currencies carries substantial financial risk. You could sustain a total or partial loss of your initial investment capital. Never trade with capital you cannot afford to lose.
              </li>
              <li>
                <strong className="text-[var(--text-primary)]">Leverage Hazard:</strong> Derivative instruments (Futures and Options) involve leverage that can amplify both gains and losses rapidly. Unfavorable price moves or weekend gap openings can cause significant drawdowns.
              </li>
              <li>
                <strong className="text-[var(--text-primary)]">Theta Decay & Volatility:</strong> Options trading involves time decay (theta) and implied volatility fluctuations, which can erode contract value regardless of index movement.
              </li>
              <li>
                <strong className="text-[var(--text-primary)]">Execution & Technological Risk:</strong> Internet connectivity, latency, platform outages, and broker order execution delays may affect trading outcomes.
              </li>
            </ul>
          </div>
        </div>

        {/* 4. Independent Financial Consultation */}
        <div className="p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] space-y-4">
          <div className="flex items-center gap-3">
            <Scale size={20} className="text-[var(--accent-indigo)] shrink-0" />
            <h3 className="text-base font-bold text-[var(--text-primary)]">
              4. Consult Licensed Financial Professionals
            </h3>
          </div>
          <p className="text-xs leading-relaxed text-[var(--text-secondary)]">
            Before making any real-market financial investments or executing trades, you are strongly advised to seek independent advice from a certified SEBI-registered Investment Adviser (RIA), chartered wealth manager, or certified financial planner who can assess your risk tolerance, financial position, and personal investment objectives.
          </p>
        </div>

        {/* 5. User Responsibility & Acknowledgment */}
        <div className="p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] space-y-4">
          <div className="flex items-center gap-3">
            <FileText size={20} className="text-emerald-400 shrink-0" />
            <h3 className="text-base font-bold text-[var(--text-primary)]">
              5. Trader Responsibility & Due Diligence
            </h3>
          </div>
          <p className="text-xs leading-relaxed text-[var(--text-secondary)]">
            By accessing or subscribing to Zonal Edge, you agree that you are solely responsible for all financial decisions, trade entries, exits, stop-loss management, and resulting profits or losses. Zonal Edge, its developers, and contributors disclaim any liability for any trading or financial decisions made by users based on the platform's analytical tools.
          </p>

          {/* Interactive Checkbox */}
          <div className="pt-3 border-t border-[var(--border-subtle)] flex items-start gap-3">
            <button
              onClick={() => setAcknowledged(!acknowledged)}
              className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                acknowledged
                  ? 'bg-emerald-500 border-emerald-500 text-white'
                  : 'border-[var(--border-active)] bg-[var(--bg-tertiary)]'
              }`}
            >
              {acknowledged && <CheckCircle2 size={14} />}
            </button>
            <p
              onClick={() => setAcknowledged(!acknowledged)}
              className="text-xs text-[var(--text-muted)] cursor-pointer select-none leading-relaxed"
            >
              I have read, understood, and accept this SEBI Regulatory Disclaimer and Risk Notice. I acknowledge that Zonal Edge is purely an educational platform and does not provide financial advisory or guaranteed returns.
            </p>
          </div>
        </div>

        {/* Compliance Contact */}
        <div className="p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-bold text-[var(--text-primary)]">Have Compliance or Legal Questions?</h4>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Contact our compliance desk directly for any clarification.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="mailto:compliance@zonaledge.in"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] text-xs font-medium text-[var(--text-primary)] hover:border-[var(--accent-indigo)] transition-colors"
            >
              <PhoneCall size={14} /> compliance@zonaledge.in
            </a>
            <Link
              to="/contact"
              className="px-4 py-2 rounded-lg bg-[var(--accent-indigo)] text-white text-xs font-medium hover:brightness-110 transition-all"
            >
              Contact Us
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
            <Link to="/sebi-disclaimer" className="hover:text-white transition-colors text-[var(--accent-indigo)]">SEBI Disclaimer</Link>
            <Link to="/refund-policy" className="hover:text-white transition-colors">Refund Policy</Link>
            <Link to="/about" className="hover:text-white transition-colors">About Us</Link>
            <Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link>
            <Link to="/login" className="hover:text-white transition-colors">Sign In</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
