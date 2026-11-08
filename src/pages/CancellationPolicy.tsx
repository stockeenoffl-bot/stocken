import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Clock,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Building2,
  Lock,
  Calendar,
  Smartphone,
} from 'lucide-react'

export default function CancellationPolicy() {
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
                Cancellation Policy
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
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30 mb-4"
          >
            <Clock size={14} /> Subscription Management
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text-primary)] mb-4"
          >
            Cancellation Policy
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-sm text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed"
          >
            Last Updated: November 2026. Clear guidelines on how to cancel your subscription, effective cancellation timing, and trial expiration terms.
          </motion.p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8">
        {/* Core Verbatim Policy Banner */}
        <div className="p-6 rounded-2xl border-2 border-amber-500/40 bg-amber-500/10 shadow-xl space-y-3">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm uppercase tracking-wider">
            <Clock size={18} />
            <span>Cancellation Policy</span>
          </div>
          <blockquote className="text-base sm:text-lg font-semibold text-white leading-relaxed italic">
            “Users can cancel their subscription at any time during the free trial period. Once the free trial ends and a paid subscription begins, the subscription payment is non-refundable. Users should review the applicable subscription terms before proceeding with payment.”
          </blockquote>
          <p className="text-xs text-amber-200/90 leading-relaxed pt-1">
            Cancellation can be performed instantly online with zero customer service friction.
          </p>
        </div>

        {/* 1. Step-by-Step Cancellation Process */}
        <div className="p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] space-y-4">
          <div className="flex items-center gap-3">
            <Smartphone size={20} className="text-[var(--accent-indigo)] shrink-0" />
            <h3 className="text-base font-bold text-[var(--text-primary)]">
              1. How to Cancel Your Subscription (Step-by-Step)
            </h3>
          </div>
          <div className="space-y-3 text-xs leading-relaxed text-[var(--text-secondary)]">
            <p>You can cancel your subscription at any time using either of the following two simple methods:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="p-4 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] space-y-1.5">
                <span className="text-xs font-bold text-white block">Method A: 1-Click Online Portal (Instant)</span>
                <ol className="list-decimal pl-4 space-y-1 text-[11px] text-[var(--text-secondary)]">
                  <li>Log in to your account at https://www.zonaledge.com/app</li>
                  <li>Click on <strong>My Subscription</strong> in the sidebar or bottom navigation.</li>
                  <li>Click the red <strong>"Cancel Subscription"</strong> button.</li>
                  <li>Confirm the prompt. Your cancellation is immediately active.</li>
                </ol>
              </div>

              <div className="p-4 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] space-y-1.5">
                <span className="text-xs font-bold text-white block">Method B: Email Request</span>
                <p className="text-[11px] text-[var(--text-secondary)]">
                  Send an email from your registered account email to <strong>support@zonaledge.com</strong> with the subject line <em>"Cancel Subscription Request"</em>. Our support desk will process your request within 24 business hours.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Effective Timing of Cancellation */}
        <div className="p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] space-y-4">
          <div className="flex items-center gap-3">
            <Calendar size={20} className="text-emerald-400 shrink-0" />
            <h3 className="text-base font-bold text-[var(--text-primary)]">
              2. Effective Timing & Access Duration
            </h3>
          </div>
          <div className="space-y-3 text-xs leading-relaxed text-[var(--text-secondary)]">
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>During the 7-Day Free Trial:</strong> If you cancel during your complimentary 7-day trial period, your trial access remains completely active until the 7th day concludes. No paid subscription will begin, and no charge will be applied to your payment method.
              </li>
              <li>
                <strong>During an Active Paid Cycle:</strong> If you cancel an active Monthly (₹499), Quarterly (₹1,299), or Annual (₹4,999) plan, your cancellation prevents any future recurring renewals. Your analytical access to charts and zones remains fully accessible until the end of your current pre-paid billing cycle.
              </li>
              <li>
                <strong>No Prorated Refunds:</strong> In accordance with our Return & Refund Policy, fees already paid for an active cycle are non-refundable once the paid subscription commences.
              </li>
            </ul>
          </div>
        </div>

        {/* 3. What Happens When Free Trial Expires */}
        <div className="p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] space-y-4">
          <div className="flex items-center gap-3">
            <Clock size={20} className="text-amber-400 shrink-0" />
            <h3 className="text-base font-bold text-[var(--text-primary)]">
              3. What Happens When the Free Trial Expires
            </h3>
          </div>
          <div className="space-y-3 text-xs leading-relaxed text-[var(--text-secondary)]">
            <p>
              When your 7-day free trial expires without upgrading to a paid subscription, your account transitions to restricted status. You will no longer receive daily market zones, liquidation levels, or OI models until you choose to activate a paid plan.
            </p>
            <p>
              We do <strong>NOT</strong> automatically charge credit cards without explicit user checkout authorization.
            </p>
          </div>
        </div>

        {/* 4. Entity & Support Details */}
        <div className="p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] space-y-4">
          <div className="flex items-center gap-3">
            <Building2 size={20} className="text-[var(--accent-indigo)] shrink-0" />
            <h3 className="text-base font-bold text-[var(--text-primary)]">
              4. Business & Support Information
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
            <Link to="/refund-policy" className="hover:text-white transition-colors">Refund Policy</Link>
            <Link to="/cancellation-policy" className="hover:text-white transition-colors text-white font-semibold">Cancellation Policy</Link>
            <Link to="/sebi-disclaimer" className="hover:text-white transition-colors">SEBI Disclaimer</Link>
            <Link to="/about" className="hover:text-white transition-colors">About Us</Link>
            <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

