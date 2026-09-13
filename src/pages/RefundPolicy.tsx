import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  CreditCard,
  Clock,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Mail,
  ShieldCheck,
  Ban,
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
                Refund & Cancellation Policy
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
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-[var(--accent-indigo)] border border-indigo-500/30 mb-4"
          >
            <RotateCcw size={14} /> Transparency & Fair Billing
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text-primary)] mb-4"
          >
            Refund & Cancellation Policy
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-sm text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed"
          >
            Clear terms regarding trial periods, recurring subscription billing, cancellation workflows,
            and digital access provisioning across Zonal Edge.
          </motion.p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8">
        {/* Quick Highlights Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] space-y-2">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 size={20} />
            </div>
            <h4 className="text-sm font-bold text-[var(--text-primary)]">7-Day Free Trial</h4>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Experience the full Pro analytics for 7 days. Cancel anytime before renewal with zero charge.
            </p>
          </div>

          <div className="p-5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] space-y-2">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-[var(--accent-indigo)] flex items-center justify-center">
              <Clock size={20} />
            </div>
            <h4 className="text-sm font-bold text-[var(--text-primary)]">5-7 Business Days</h4>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Approved refunds are credited directly back to your original payment method via Razorpay.
            </p>
          </div>

          <div className="p-5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] space-y-2">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <RotateCcw size={20} />
            </div>
            <h4 className="text-sm font-bold text-[var(--text-primary)]">Cancel Anytime</h4>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Easily manage or pause your subscription directly from your user dashboard with one click.
            </p>
          </div>
        </div>

        {/* 1. Digital Content Nature */}
        <div className="p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] space-y-4">
          <div className="flex items-center gap-3">
            <CreditCard size={20} className="text-[var(--accent-indigo)] shrink-0" />
            <h3 className="text-base font-bold text-[var(--text-primary)]">
              1. Nature of Digital Services
            </h3>
          </div>
          <div className="space-y-3 text-xs leading-relaxed text-[var(--text-secondary)]">
            <p>
              Zonal Edge provides immediate digital access to real-time market structure models, proprietary supply and demand zones, live candlestick charting overlays, Open Interest calculations, and educational curriculum.
            </p>
            <p>
              Because access to digital information, proprietary research, and analytical tools is granted instantly upon subscription activation, subscription fees are generally <strong>non-refundable once the billing cycle commences</strong>, except as explicitly provided below.
            </p>
          </div>
        </div>

        {/* 2. 7-Day Free Trial Terms */}
        <div className="p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] space-y-4">
          <div className="flex items-center gap-3">
            <ShieldCheck size={20} className="text-emerald-400 shrink-0" />
            <h3 className="text-base font-bold text-[var(--text-primary)]">
              2. 7-Day Free Trial Terms & Policies
            </h3>
          </div>
          <div className="space-y-3 text-xs leading-relaxed text-[var(--text-secondary)]">
            <p>
              New subscribers may be offered a 7-Day Free Trial to experience all premium features of Zonal Edge without upfront payment commitment.
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>You may cancel your trial at any time within the 7-day period from your Account Settings.</li>
              <li>If you cancel prior to the end of the trial period, your card will not be charged.</li>
              <li>If you do not cancel before the 7-day trial concludes, your subscription will automatically renew into the chosen monthly or annual billing plan.</li>
            </ul>
          </div>
        </div>

        {/* 3. Cancellation Policy */}
        <div className="p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] space-y-4">
          <div className="flex items-center gap-3">
            <Ban size={20} className="text-rose-400 shrink-0" />
            <h3 className="text-base font-bold text-[var(--text-primary)]">
              3. Subscription Cancellation Procedure
            </h3>
          </div>
          <div className="space-y-3 text-xs leading-relaxed text-[var(--text-secondary)]">
            <p>
              You may cancel your recurring subscription at any time:
            </p>
            <ol className="list-decimal pl-5 space-y-1.5">
              <li>Log in to your Zonal Edge account.</li>
              <li>Navigate to <strong>My Subscription</strong> in your sidebar menu.</li>
              <li>Click on <strong>Cancel Subscription</strong> or manage recurring billing.</li>
              <li>Alternatively, email our support team at <a href="mailto:support@zonaledge.in" className="text-[var(--accent-indigo)] underline">support@zonaledge.in</a> at least 24 hours prior to your next renewal date.</li>
            </ol>
            <p className="text-[var(--text-muted)] pt-1">
              Upon cancellation, your Pro access will remain fully active until the end of your current paid billing period, and no further renewals will be charged.
            </p>
          </div>
        </div>

        {/* 4. Eligible Refund Conditions */}
        <div className="p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] space-y-4">
          <div className="flex items-center gap-3">
            <AlertCircle size={20} className="text-amber-400 shrink-0" />
            <h3 className="text-base font-bold text-[var(--text-primary)]">
              4. Exceptional Circumstances for Refund
            </h3>
          </div>
          <div className="space-y-3 text-xs leading-relaxed text-[var(--text-secondary)]">
            <p>
              While digital subscriptions are non-refundable in standard scenarios, we review and grant refunds under the following verified technical conditions:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                <strong>Duplicate / Erroneous Billing:</strong> If your account or card was billed multiple times due to a payment gateway glitch or network timeout.
              </li>
              <li>
                <strong>Deduction without Access:</strong> If amount was deducted from your bank/card through Razorpay, but your Zonal Edge Pro account was not activated within 24 hours.
              </li>
              <li>
                <strong>Platform Outage:</strong> If severe platform-wide technical failure prevented service delivery for an extended consecutive duration of more than 5 business days.
              </li>
            </ul>
          </div>
        </div>

        {/* 5. Processing Timeline */}
        <div className="p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] space-y-4">
          <div className="flex items-center gap-3">
            <Clock size={20} className="text-indigo-400 shrink-0" />
            <h3 className="text-base font-bold text-[var(--text-primary)]">
              5. Refund Timeline & Payout Method
            </h3>
          </div>
          <div className="space-y-3 text-xs leading-relaxed text-[var(--text-secondary)]">
            <p>
              Once a valid refund request is approved by our billing desk:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>The refund is initiated immediately through our payment partner, <strong>Razorpay</strong>.</li>
              <li>Depending on your banking partner or card issuer, funds will reflect in your account within <strong>5 to 7 business days</strong>.</li>
              <li>All refunds are issued strictly to the original payment source (UPI, Credit/Debit Card, or Net Banking) from which the transaction originated.</li>
            </ul>
          </div>
        </div>

        {/* Support Card */}
        <div className="p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
              <HelpCircle size={16} className="text-[var(--accent-indigo)]" /> Need Help with Billing or Cancellation?
            </h4>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Our billing support team is available during Indian market hours to assist you.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="mailto:support@zonaledge.in"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] text-xs font-medium text-[var(--text-primary)] hover:border-[var(--accent-indigo)] transition-colors"
            >
              <Mail size={14} /> support@zonaledge.in
            </a>
            <Link
              to="/contact"
              className="px-4 py-2 rounded-lg bg-[var(--accent-indigo)] text-white text-xs font-medium hover:brightness-110 transition-all"
            >
              Contact Desk
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
            <Link to="/refund-policy" className="hover:text-white transition-colors text-[var(--accent-indigo)]">Refund Policy</Link>
            <Link to="/about" className="hover:text-white transition-colors">About Us</Link>
            <Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link>
            <Link to="/login" className="hover:text-white transition-colors">Sign In</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
