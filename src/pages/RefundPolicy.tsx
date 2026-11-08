import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  RotateCcw,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Building2,
  Lock,
} from 'lucide-react'

export default function RefundPolicy() {
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
                Return & Refund Policy
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
            <Link to="/cancellation-policy" className="text-[var(--text-secondary)] hover:text-white transition-colors">
              Cancellation Policy
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
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30 mb-4"
          >
            <RotateCcw size={14} /> Official Policy Notice
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text-primary)] mb-4"
          >
            Return & Refund Policy
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-sm text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed"
          >
            Last Updated: November 2026. Please read this policy carefully before subscribing or completing any payment on Zonal Edge.
          </motion.p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8">
        {/* Core Verbatim Policy Banner */}
        <div className="p-6 rounded-2xl border-2 border-rose-500/40 bg-rose-500/10 shadow-xl space-y-3">
          <div className="flex items-center gap-2 text-rose-400 font-bold text-sm uppercase tracking-wider">
            <AlertCircle size={18} />
            <span>Refund Policy</span>
          </div>
          <blockquote className="text-base sm:text-lg font-semibold text-white leading-relaxed italic">
            “All purchases and subscription payments made on Zonal Edge are final and non-refundable. Once a purchase is completed, no refunds will be issued. Users are advised to review the subscription plan and service details carefully before making a payment.”
          </blockquote>
          <p className="text-xs text-rose-200/90 leading-relaxed pt-1">
            This policy applies to all subscription tiers, including Monthly (₹499), Quarterly (₹1,299), and Annual (₹4,999) plans.
          </p>
        </div>

        {/* 1. Nature of Digital Analytics Services */}
        <div className="p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] space-y-4">
          <div className="flex items-center gap-3">
            <Lock size={20} className="text-[var(--accent-indigo)] shrink-0" />
            <h3 className="text-base font-bold text-[var(--text-primary)]">
              1. Nature of Instant Digital Content & Services
            </h3>
          </div>
          <div className="space-y-3 text-xs leading-relaxed text-[var(--text-secondary)]">
            <p>
              Zonal Edge provides immediate digital access to real-time market structure models, proprietary bullish and bearish zones, liquidation levels, invalidation thresholds, and Open Interest (OI) analytics for Indian equities and indices (Nifty and Sensex).
            </p>
            <p>
              Because access to digital information and proprietary analytical setups is granted immediately upon order activation, <strong>all purchases are strictly non-refundable and final</strong> once completed.
            </p>
          </div>
        </div>

        {/* 2. Complimentary 7-Day Free Trial */}
        <div className="p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] space-y-4">
          <div className="flex items-center gap-3">
            <ShieldCheck size={20} className="text-emerald-400 shrink-0" />
            <h3 className="text-base font-bold text-[var(--text-primary)]">
              2. Free Trial to Evaluate Platform Suitability
            </h3>
          </div>
          <div className="space-y-3 text-xs leading-relaxed text-[var(--text-secondary)]">
            <p>
              To ensure complete transparency and user satisfaction, Zonal Edge provides a <strong>7-Day Free Trial (₹0)</strong>. The free trial grants:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Access to 1 analysis/zone per day.</li>
              <li>End-of-day (EOD) full market analysis.</li>
              <li>Complete overview of our charting platform and levels.</li>
            </ul>
            <p>
              Users are advised to thoroughly evaluate the platform during this complimentary 7-day period prior to purchasing a paid subscription.
            </p>
          </div>
        </div>

        {/* 3. Pre-Payment Review Notice */}
        <div className="p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] space-y-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 size={20} className="text-[var(--accent-indigo)] shrink-0" />
            <h3 className="text-base font-bold text-[var(--text-primary)]">
              3. Review Before Payment
            </h3>
          </div>
          <div className="space-y-3 text-xs leading-relaxed text-[var(--text-secondary)]">
            <p>
              Before completing any payment through our gateway (Razorpay), users are presented with the plan details, duration, included features, and this non-refundable policy. Completing the payment signifies your unequivocal understanding and agreement that all fees are final.
            </p>
            <p>
              For cancellation details during or after the free trial period, please refer to our{' '}
              <Link to="/cancellation-policy" className="text-[var(--accent-indigo)] font-semibold hover:underline">
                Cancellation Policy &rarr;
              </Link>
            </p>
          </div>
        </div>

        {/* 4. Entity & Support Details */}
        <div className="p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] space-y-4">
          <div className="flex items-center gap-3">
            <Building2 size={20} className="text-[var(--accent-indigo)] shrink-0" />
            <h3 className="text-base font-bold text-[var(--text-primary)]">
              4. Business & Contact Information
            </h3>
          </div>
          <div className="p-4 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] text-xs space-y-1.5">
            <p className="font-bold text-white">Vedgetechnologies (Operates Zonal Edge)</p>
            <p className="text-[var(--text-muted)]">Legal Name: Viknesh</p>
            <p className="text-[var(--text-muted)]">Registered Address: 4, Muslim Kallaray Street, Nethaji Nagar II, Uppalam, Puducherry – 605001, India</p>
            <p className="text-[var(--text-muted)]">Official Email: support@zonaledge.com</p>
            <p className="text-[var(--text-muted)]">Website: https://www.zonaledge.com</p>
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
            <Link to="/refund-policy" className="hover:text-white transition-colors text-white font-semibold">Refund Policy</Link>
            <Link to="/cancellation-policy" className="hover:text-white transition-colors">Cancellation Policy</Link>
            <Link to="/sebi-disclaimer" className="hover:text-white transition-colors">SEBI Disclaimer</Link>
            <Link to="/about" className="hover:text-white transition-colors">About Us</Link>
            <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
