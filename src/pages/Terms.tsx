import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  ShieldAlert,
  FileText,
  Lock,
  CreditCard,
  Scale,
  AlertTriangle,
  HelpCircle,
} from 'lucide-react'

export default function Terms() {
  const [activeSection, setActiveSection] = useState('regulatory')

  const sections = [
    { id: 'regulatory', label: '1. Regulatory & SEBI Disclaimer', icon: ShieldAlert },
    { id: 'acceptance', label: '2. Acceptance & Eligibility', icon: FileText },
    { id: 'risk', label: '3. Market Risk Warning', icon: AlertTriangle },
    { id: 'accounts', label: '4. User Accounts & Security', icon: Lock },
    { id: 'billing', label: '5. Subscriptions & Payments', icon: CreditCard },
    { id: 'ip', label: '6. Intellectual Property', icon: Scale },
    { id: 'conduct', label: '7. Prohibited Conduct', icon: AlertTriangle },
    { id: 'liability', label: '8. Limitation of Liability', icon: Scale },
    { id: 'jurisdiction', label: '9. Governing Law', icon: Scale },
    { id: 'contact', label: '10. Contact & Support', icon: HelpCircle },
  ]

  const scrollTo = (id: string) => {
    setActiveSection(id)
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

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
            <span className="text-sm font-semibold text-[var(--text-primary)]">
              Terms of Service
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <Link
              to="/privacy"
              className="text-[var(--text-secondary)] hover:text-white transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              to="/sebi-disclaimer"
              className="text-[var(--text-secondary)] hover:text-white transition-colors"
            >
              SEBI Disclaimer
            </Link>
            <Link
              to="/refund-policy"
              className="text-[var(--text-secondary)] hover:text-white transition-colors"
            >
              Refund Policy
            </Link>
            <Link
              to="/about"
              className="text-[var(--text-secondary)] hover:text-white transition-colors"
            >
              About
            </Link>
            <Link
              to="/contact"
              className="text-[var(--text-secondary)] hover:text-white transition-colors"
            >
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
      <div className="border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)] py-10 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-[var(--accent-indigo)] border border-indigo-500/20 mb-3"
          >
            <FileText size={13} /> Legal Agreement
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text-primary)] mb-3"
          >
            Terms of Service
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-sm text-[var(--text-secondary)] max-w-2xl mx-auto"
          >
            Last Updated: January 2025. Please review these terms carefully before accessing or
            using Zonal Edge.
          </motion.p>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sticky Sidebar Navigation */}
          <aside className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24 space-y-1 p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
              <p className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider px-3 py-1.5">
                Table of Contents
              </p>
              {sections.map((sec) => {
                const Icon = sec.icon
                const isActive = activeSection === sec.id
                return (
                  <button
                    key={sec.id}
                    onClick={() => scrollTo(sec.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-left transition-all ${
                      isActive
                        ? 'bg-[var(--accent-indigo)] text-white shadow-sm'
                        : 'text-[var(--text-secondary)] hover:text-white hover:bg-[var(--bg-tertiary)]'
                    }`}
                  >
                    <Icon size={14} className="shrink-0" />
                    <span className="truncate">{sec.label}</span>
                  </button>
                )
              })}
            </div>
          </aside>

          {/* Detailed Terms Content */}
          <main className="lg:col-span-3 space-y-10">
            {/* 1. SEBI Disclaimer */}
            <section id="regulatory" className="scroll-mt-24">
              <div className="p-5 rounded-xl border border-amber-500/30 bg-amber-500/5 mb-6">
                <div className="flex items-start gap-3">
                  <ShieldAlert className="text-amber-400 shrink-0 mt-0.5" size={20} />
                  <div>
                    <h3 className="text-sm font-bold text-amber-300 mb-1">
                      Important Statutory & SEBI Regulatory Notice
                    </h3>
                    <p className="text-xs text-amber-200/90 leading-relaxed">
                      <strong>Zonal Edge is NOT a SEBI-registered Investment Adviser (RIA) or Research Analyst (RA).</strong>{' '}
                      All market analysis, Open Interest (OI) heatmaps, candlestick charts, algorithmic models,
                      and educational courses provided on this platform are for <strong>educational and informational purposes only</strong>.
                      Nothing contained herein constitutes financial advice, investment recommendations, or an offer to buy or sell securities.
                    </p>
                  </div>
                </div>
              </div>

              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                <ShieldAlert size={20} className="text-[var(--accent-indigo)]" />
                1. Regulatory Disclaimer & Nature of Services
              </h2>
              <div className="space-y-3 text-xs leading-relaxed text-[var(--text-secondary)]">
                <p>
                  By accessing Zonal Edge, including our daily zone outlook, community chats, and alert feeds
                  (including Telegram bots and email notifications), you acknowledge and agree that Zonal Edge
                  acts solely as a technology-driven educational analytics portal and does not guarantee trading profits or protection against capital losses.
                </p>
                <p>
                  Any commentary on the Indian Stock Market (including NIFTY 50, BANK NIFTY, SENSEX, and
                  individual equities) represents subjective analytical views and mathematical interpretations
                  of publicly available data. You must consult a licensed SEBI-registered financial adviser
                  before initiating any real-capital financial commitments.
                </p>
              </div>
            </section>

            {/* 2. Acceptance & Eligibility */}
            <section id="acceptance" className="scroll-mt-24 border-t border-[var(--border-subtle)] pt-8">
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                <FileText size={20} className="text-[var(--accent-indigo)]" />
                2. Acceptance of Terms & Eligibility
              </h2>
              <div className="space-y-3 text-xs leading-relaxed text-[var(--text-secondary)]">
                <p>
                  These Terms of Service constitute a legally binding agreement between you ("User", "you")
                  and Zonal Edge ("Company", "we", "us"). By checking the acceptance box during registration or
                  by browsing the platform, you confirm that:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-[var(--text-secondary)]">
                  <li>You are at least 18 years of age and legally competent to enter into contracts under Indian law.</li>
                  <li>You reside in a jurisdiction where accessing financial educational tools is legally permissible.</li>
                  <li>All registration information you submit is accurate, current, and complete.</li>
                </ul>
              </div>
            </section>

            {/* 3. Market Risk Warning */}
            <section id="risk" className="scroll-mt-24 border-t border-[var(--border-subtle)] pt-8">
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                <AlertTriangle size={20} className="text-rose-400" />
                3. Market Risk Warning (SEBI F&O Risk Disclosures)
              </h2>
              <div className="space-y-3 text-xs leading-relaxed text-[var(--text-secondary)]">
                <div className="p-4 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-2">
                  <p className="font-semibold text-[var(--text-primary)]">
                    Per SEBI Study on Derivatives (Futures & Options):
                  </p>
                  <p className="text-[var(--text-muted)]">
                    9 out of 10 individual traders in the equity Futures and Options (F&O) segment incurred net losses.
                    Trading in financial instruments involves significant risk of loss and is not suitable for every investor.
                  </p>
                </div>
                <p>
                  You acknowledge that stock market trading involves inherent risks, including volatility, slippage,
                  execution delays, and potential loss of your entire principal. Past performance of any setup or analysis
                  is never indicative of future results.
                </p>
              </div>
            </section>

            {/* 4. User Accounts */}
            <section id="accounts" className="scroll-mt-24 border-t border-[var(--border-subtle)] pt-8">
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                <Lock size={20} className="text-[var(--accent-indigo)]" />
                4. User Accounts & Security
              </h2>
              <div className="space-y-3 text-xs leading-relaxed text-[var(--text-secondary)]">
                <p>
                  When creating an account, you must provide a valid email and secure password. You are solely
                  responsible for maintaining the confidentiality of your login credentials and for all activities
                  conducted through your account.
                </p>
                <p>
                  Account sharing or simultaneous multi-device credential distribution is strictly prohibited.
                  If suspicious or concurrent usage is detected, we reserve the right to immediately terminate or
                  restrict your account without notice or refund.
                </p>
              </div>
            </section>

            {/* 5. Subscriptions & Payments */}
            <section id="billing" className="scroll-mt-24 border-t border-[var(--border-subtle)] pt-8">
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                <CreditCard size={20} className="text-[var(--accent-indigo)]" />
                5. Subscriptions, Payments & Razorpay Terms
              </h2>
              <div className="space-y-3 text-xs leading-relaxed text-[var(--text-secondary)]">
                <p>
                  We offer Free, Pro, and VIP subscription tiers. All payments are processed securely through authorized
                  payment partners including <strong>Razorpay</strong>.
                </p>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li><strong>Currency & Pricing:</strong> All fees are stated in Indian Rupees (INR) unless otherwise indicated.</li>
                  <li><strong>Recurring Billing:</strong> Subscriptions automatically renew at the end of each billing cycle unless cancelled prior to the renewal date.</li>
                  <li><strong>Refund Policy:</strong> Due to the immediate digital delivery of educational content, live charts, and proprietary OI analytics, all paid subscription fees are strictly non-refundable once activated.</li>
                </ul>
              </div>
            </section>

            {/* 6. Intellectual Property */}
            <section id="ip" className="scroll-mt-24 border-t border-[var(--border-subtle)] pt-8">
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                <Scale size={20} className="text-[var(--accent-indigo)]" />
                6. Intellectual Property Rights
              </h2>
              <div className="space-y-3 text-xs leading-relaxed text-[var(--text-secondary)]">
                <p>
                  All proprietary intellectual property, including zone calculations, educational coursework, videos,
                  visual branding, UI designs, and trademarks displayed on Zonal Edge are the exclusive property of Zonal Edge.
                </p>
                <p>
                  You are granted a limited, personal, non-exclusive, non-transferable license to access the platform.
                  You may not copy, reverse-engineer, redistribute, screen-record for commercial sale, or resell any
                  material without explicit prior written authorization.
                </p>
              </div>
            </section>

            {/* 7. Prohibited Conduct */}
            <section id="conduct" className="scroll-mt-24 border-t border-[var(--border-subtle)] pt-8">
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                <AlertTriangle size={20} className="text-[var(--danger)]" />
                7. Prohibited Activities
              </h2>
              <div className="space-y-3 text-xs leading-relaxed text-[var(--text-secondary)]">
                <p>You agree not to engage in any of the following activities:</p>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>Using scrapers, spiders, or automated bots to harvest market data or user profiles.</li>
                  <li>Attempting to bypass our API rate limiters, caching layers, or security tokens.</li>
                  <li>Using the platform to manipulate market sentiment or post unauthorized promotional links.</li>
                  <li>Attempting unauthorized access to administrative endpoints or other users' data.</li>
                </ul>
              </div>
            </section>

            {/* 8. Limitation of Liability */}
            <section id="liability" className="scroll-mt-24 border-t border-[var(--border-subtle)] pt-8">
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                <Scale size={20} className="text-[var(--accent-indigo)]" />
                8. Limitation of Liability
              </h2>
              <div className="space-y-3 text-xs leading-relaxed text-[var(--text-secondary)]">
                <p>
                  To the maximum extent permitted by applicable Indian law, Zonal Edge, its creators, analysts, and
                  affiliates shall NOT be liable for any direct, indirect, incidental, punitive, or consequential damages,
                  including but not limited to financial losses, loss of profits, trading drawdowns, or data loss arising out of
                  the use or inability to use this platform.
                </p>
                <p>
                  Market feeds and third-party data providers may experience latency, network delays, or intermittent outages.
                  We make no guarantee of uninterrupted service or tick-by-tick real-time accuracy.
                </p>
              </div>
            </section>

            {/* 9. Governing Law */}
            <section id="jurisdiction" className="scroll-mt-24 border-t border-[var(--border-subtle)] pt-8">
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                <Scale size={20} className="text-[var(--accent-indigo)]" />
                9. Governing Law & Dispute Resolution
              </h2>
              <div className="space-y-3 text-xs leading-relaxed text-[var(--text-secondary)]">
                <p>
                  These Terms shall be governed by and construed in accordance with the laws of India.
                  Any dispute, claim, or controversy arising out of or relating to these Terms shall be subject
                  to the exclusive jurisdiction of the competent courts in Tamil Nadu, India.
                </p>
              </div>
            </section>

            {/* 10. Contact */}
            <section id="contact" className="scroll-mt-24 border-t border-[var(--border-subtle)] pt-8">
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                <HelpCircle size={20} className="text-[var(--accent-indigo)]" />
                10. Contact & Support
              </h2>
              <div className="space-y-3 text-xs leading-relaxed text-[var(--text-secondary)]">
                <p>
                  For inquiries, technical support, or clarification regarding these Terms of Service, please reach out to:
                </p>
                <div className="p-4 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-1">
                  <p className="font-semibold text-[var(--text-primary)]">Zonal Edge Support & Legal Team</p>
                  <p className="text-[var(--text-muted)]">Email: support@zonaledge.in</p>
                  <p className="text-[var(--text-muted)]">Location: Tamil Nadu, India</p>
                </div>
              </div>
            </section>
          </main>
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
            <Link to="/about" className="hover:text-white transition-colors">About Us</Link>
            <Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link>
            <Link to="/login" className="hover:text-white transition-colors">Sign In</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
