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
  Building2,
  Lock,
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
            <Link to="/refund-policy" className="text-[var(--text-secondary)] hover:text-white transition-colors">
              Refund Policy
            </Link>
            <Link to="/cancellation-policy" className="text-[var(--text-secondary)] hover:text-white transition-colors">
              Cancellation Policy
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
            About Zonal Edge
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-sm sm:text-base text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed"
          >
            A market analysis and educational platform empowering Indian traders with pure market structure and institutional levels.
          </motion.p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 space-y-16">
        {/* Core Compliance Section - EXACT Text from Requirement 6 */}
        <div className="p-8 rounded-2xl border-2 border-indigo-500/40 bg-indigo-500/5 shadow-xl space-y-4">
          <div className="flex items-center gap-2 text-[var(--accent-indigo)] font-bold text-xs uppercase tracking-wider">
            <Compass size={18} />
            <span>Platform Overview & Purpose</span>
          </div>

          <h2 className="text-2xl font-bold text-white">About Zonal Edge</h2>

          <div className="space-y-4 text-sm sm:text-base leading-relaxed text-slate-200">
            <p>
              “Zonal Edge is a market analysis and educational platform designed to help traders understand market structure and key price zones in the Indian stock market, particularly Nifty and Sensex.
            </p>
            <p>
              The platform provides market analysis, bullish and bearish zones, liquidation levels, invalidation levels, and relevant open interest (OI) data to support users in understanding market behaviour and developing their own trading decisions.
            </p>
            <p>
              Zonal Edge is intended for informational and educational purposes. The platform does not guarantee profits or specific trading outcomes. Users are responsible for their own trading decisions and should understand the risks associated with trading in financial markets.”
            </p>
          </div>
        </div>

        {/* Legal & Business Entity Information - Requirement 5 */}
        <div className="p-6 sm:p-8 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] space-y-4">
          <div className="flex items-center gap-2 text-white font-bold text-base">
            <Building2 size={20} className="text-[var(--accent-indigo)]" />
            <span>Corporate & Legal Identity</span>
          </div>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            Zonal Edge is owned and operated by <strong>Vedgetechnologies</strong>. All subscription billing, intellectual property, and client compliance are managed under the registered details below:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] space-y-1 text-xs">
              <span className="text-[10px] text-[var(--text-muted)] uppercase font-bold block">Trade Name</span>
              <p className="text-white font-bold text-sm">Vedgetechnologies</p>
              <span className="text-[10px] text-[var(--text-muted)] uppercase font-bold block pt-2">Legal Name (Proprietor)</span>
              <p className="text-white font-bold text-sm">Viknesh</p>
            </div>

            <div className="p-4 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] space-y-1 text-xs">
              <span className="text-[10px] text-[var(--text-muted)] uppercase font-bold block">Registered Address</span>
              <p className="text-white font-medium">4, Muslim Kallaray Street, Nethaji Nagar II, Uppalam, Puducherry – 605001, India</p>
              <div className="pt-2 flex flex-col gap-1 text-[11px] text-[var(--text-muted)]">
                <span>Official Business Email: <strong className="text-white">support@zonaledge.com</strong></span>
                <span>Website: <strong className="text-white">https://www.zonaledge.com</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Pillars / Features */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-[var(--accent-indigo)] flex items-center justify-center">
              <Layers size={20} />
            </div>
            <h3 className="text-base font-bold text-white">Market Structure & Zones</h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              We map institutional liquidity pools, premium/discount price zones, and orderblocks for NIFTY 50 and SENSEX before market open.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <BarChart3 size={20} />
            </div>
            <h3 className="text-base font-bold text-white">Live Open Interest (OI)</h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Unpack strike-wise call and put accumulations, change in open interest, and PCR trends to understand big-player positioning.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Shield size={20} />
            </div>
            <h3 className="text-base font-bold text-white">Strict Invalidation Levels</h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Every market bias has an objective invalidation line. If the price violates the level, the setup is abandoned — removing emotional bias.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center p-10 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] space-y-5">
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
            Ready to trade with clarity?
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] max-w-lg mx-auto leading-relaxed">
            Experience the 7-Day Free Trial (₹0) and join disciplined traders who analyze market structure objectively.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => navigate('/register')}
              className="px-6 py-2.5 rounded-lg bg-[var(--accent-indigo)] text-white text-xs font-semibold hover:brightness-110 transition-all shadow-md"
            >
              Start 7-Day Free Trial (₹0)
            </button>
            <Link
              to="/contact"
              className="px-6 py-2.5 rounded-lg border border-[var(--border-subtle)] text-xs font-medium text-[var(--text-secondary)] hover:text-white hover:bg-[var(--bg-tertiary)] transition-colors"
            >
              Contact Our Desk
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)] py-8 px-4 text-center text-xs text-[var(--text-muted)]">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-left">
            <p className="font-semibold text-[var(--text-primary)]">Vedgetechnologies &middot; Zonal Edge</p>
            <p className="text-[10px] text-[var(--text-muted)]">4, Muslim Kallaray Street, Nethaji Nagar II, Uppalam, Puducherry – 605001, India</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
            <Link to="/terms" className="hover:text-white transition-colors">Terms & Conditions</Link>
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/refund-policy" className="hover:text-white transition-colors">Refund Policy</Link>
            <Link to="/cancellation-policy" className="hover:text-white transition-colors">Cancellation Policy</Link>
            <Link to="/sebi-disclaimer" className="hover:text-white transition-colors">SEBI Disclaimer</Link>
            <Link to="/about" className="hover:text-white transition-colors text-white font-semibold">About Us</Link>
            <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
