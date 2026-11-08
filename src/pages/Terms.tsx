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
  RotateCcw,
  Clock,
  Building2,
} from 'lucide-react'

export default function Terms() {
  const [activeSection, setActiveSection] = useState('operator')

  const sections = [
    { id: 'operator', label: '1. Website Operator & Entity', icon: Building2 },
    { id: 'regulatory', label: '2. Regulatory & SEBI Notice', icon: ShieldAlert },
    { id: 'acceptance', label: '3. Acceptance & Eligibility', icon: FileText },
    { id: 'services', label: '4. Subscription Services & Limitations', icon: Scale },
    { id: 'billing', label: '5. Pricing, Billing & Payment Terms', icon: CreditCard },
    { id: 'refund', label: '6. Return & Refund Policy', icon: RotateCcw },
    { id: 'cancellation', label: '7. Cancellation Policy', icon: Clock },
    { id: 'accounts', label: '8. User Accounts & Responsibilities', icon: Lock },
    { id: 'ip', label: '9. Intellectual Property', icon: Scale },
    { id: 'liability', label: '10. Limitation of Liability', icon: AlertTriangle },
    { id: 'jurisdiction', label: '11. Governing Law & Jurisdiction', icon: Scale },
    { id: 'contact', label: '12. Contact & Legal Notices', icon: HelpCircle },
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
            <div className="flex items-center gap-2">
              <img src="/images/ZonalEdge.jpeg" alt="Zonal Edge" className="w-5 h-5 rounded object-cover" />
              <span className="text-sm font-semibold text-[var(--text-primary)]">
                Terms & Conditions
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-3 text-xs">
            <Link to="/privacy" className="text-[var(--text-secondary)] hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link to="/refund-policy" className="text-[var(--text-secondary)] hover:text-white transition-colors">
              Refund Policy
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
      <div className="border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)] py-10 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-[var(--accent-indigo)] border border-indigo-500/20 mb-3"
          >
            <FileText size={13} /> Legal Agreement & Compliance
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text-primary)] mb-3"
          >
            Terms & Conditions
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-sm text-[var(--text-secondary)] max-w-2xl mx-auto"
          >
            Last Updated: November 2026. Please review these terms carefully before accessing or using Zonal Edge.
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
            {/* 1. Website Operator Notice */}
            <section id="operator" className="scroll-mt-24">
              <div className="p-5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 mb-6">
                <div className="flex items-start gap-3">
                  <Building2 className="text-indigo-400 shrink-0 mt-0.5" size={20} />
                  <div>
                    <h3 className="text-sm font-bold text-white mb-1">
                      Website Operator Identification
                    </h3>
                    <p className="text-xs text-indigo-200/90 leading-relaxed">
                      <strong>This website is operated by Vedgetechnologies.</strong> All services, subscriptions, and analytical materials offered on Zonal Edge (https://www.zonaledge.com) are governed and provided under the legal trade name <strong>Vedgetechnologies</strong>, represented by its legal proprietor <strong>Viknesh</strong>.
                    </p>
                  </div>
                </div>
              </div>

              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                <Building2 size={20} className="text-[var(--accent-indigo)]" />
                1. Operator & Business Entity Information
              </h2>
              <div className="space-y-3 text-xs leading-relaxed text-[var(--text-secondary)]">
                <p>
                  Throughout this document, the terms "we", "us", "our", and "Zonal Edge" refer to the operational entity <strong>Vedgetechnologies</strong>, having its registered office at:
                </p>
                <div className="p-4 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-1 font-mono text-[11px]">
                  <p className="text-white font-bold">Trade Name: Vedgetechnologies</p>
                  <p className="text-slate-300">Legal Name: Viknesh</p>
                  <p className="text-slate-300">Registered Address: 4, Muslim Kallaray Street, Nethaji Nagar II, Uppalam, Puducherry – 605001, India</p>
                  <p className="text-slate-300">Website: https://www.zonaledge.com</p>
                  <p className="text-slate-300">Official Business Email: support@zonaledge.com</p>
                </div>
              </div>
            </section>

            {/* 2. Statutory & SEBI Notice */}
            <section id="regulatory" className="scroll-mt-24 border-t border-[var(--border-subtle)] pt-8">
              <div className="p-5 rounded-xl border border-amber-500/30 bg-amber-500/5 mb-6">
                <div className="flex items-start gap-3">
                  <ShieldAlert className="text-amber-400 shrink-0 mt-0.5" size={20} />
                  <div>
                    <h3 className="text-sm font-bold text-amber-300 mb-1">
                      Important Statutory & SEBI Regulatory Notice
                    </h3>
                    <p className="text-xs text-amber-200/90 leading-relaxed">
                      <strong>Zonal Edge is an educational and analytics platform and is NOT a SEBI-registered Investment Adviser (RIA) or Research Analyst (RA).</strong>{' '}
                      All market analysis, supply/demand zones, Open Interest (OI) metrics, candlestick overlays, and levels provided on this platform are for <strong>informational and educational purposes only</strong>. Nothing contained herein constitutes financial advice, trade signals, or recommendations to buy or sell securities.
                    </p>
                  </div>
                </div>
              </div>

              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                <ShieldAlert size={20} className="text-[var(--accent-indigo)]" />
                2. Regulatory Status & Scope of Analytics
              </h2>
              <div className="space-y-3 text-xs leading-relaxed text-[var(--text-secondary)]">
                <p>
                  Zonal Edge provides market analysis, bullish and bearish zones, liquidation levels, invalidation levels, and relevant open interest (OI) data to help traders understand market structure and develop their own independent trading decisions.
                </p>
                <p>
                  The platform does not guarantee profits or specific financial outcomes. Users bear sole responsibility for their trading capital and investment executions.
                </p>
              </div>
            </section>

            {/* 3. Acceptance of Terms */}
            <section id="acceptance" className="scroll-mt-24 border-t border-[var(--border-subtle)] pt-8">
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                <FileText size={20} className="text-[var(--accent-indigo)]" />
                3. Acceptance & Eligibility
              </h2>
              <div className="space-y-3 text-xs leading-relaxed text-[var(--text-secondary)]">
                <p>
                  By creating an account, accessing, or subscribing to Zonal Edge, you agree to be bound by these Terms & Conditions. You confirm that you are at least 18 years of age and legally capable of entering into binding contracts under the laws of India.
                </p>
              </div>
            </section>

            {/* 4. Subscription Services & Limitations */}
            <section id="services" className="scroll-mt-24 border-t border-[var(--border-subtle)] pt-8">
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                <Scale size={20} className="text-[var(--accent-indigo)]" />
                4. Subscription Services & Service Limitations
              </h2>
              <div className="space-y-3 text-xs leading-relaxed text-[var(--text-secondary)]">
                <p>
                  We offer digital subscription tiers providing real-time and end-of-day market structure insights, charts, and OI tools for Indian market indices (NIFTY 50 and SENSEX):
                </p>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li><strong>Free Trial – 7 Days:</strong> ₹0, valid for 7 days. Includes 1 analysis/zone per day and end-of-day (EOD) full market analysis.</li>
                  <li><strong>Monthly Subscription:</strong> ₹499 per month. Includes multiple market zones, liquidation levels, invalidation levels, detailed market analysis, and Open Interest (OI) data.</li>
                  <li><strong>Quarterly Subscription:</strong> ₹1,299 per 3 months. Includes all monthly features with extended quarterly access.</li>
                  <li><strong>Annual Subscription:</strong> ₹4,999 per 12 months. Includes full annual access to all market zones, levels, and analytical tools.</li>
                </ul>
                <p>
                  <strong>Service Limitations:</strong> While we endeavor to maintain high uptime, market feeds, broker API relays (including Alice Blue), and network providers may experience latency, downtime, or maintenance. Zonal Edge does not guarantee uninterrupted or error-free transmissions.
                </p>
              </div>
            </section>

            {/* 5. Pricing, Billing & Payment Terms */}
            <section id="billing" className="scroll-mt-24 border-t border-[var(--border-subtle)] pt-8">
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                <CreditCard size={20} className="text-[var(--accent-indigo)]" />
                5. Pricing, Billing & Payment Gateway Terms
              </h2>
              <div className="space-y-3 text-xs leading-relaxed text-[var(--text-secondary)]">
                <p>
                  All subscription payments are denominated in Indian Rupees (INR) and processed securely through RBI-authorized payment gateways (e.g. Razorpay).
                </p>
                <p>
                  Users must provide valid billing credentials. By initiating a transaction, you authorize our payment processor to charge the applicable subscription fee.
                </p>
              </div>
            </section>

            {/* 6. Return & Refund Policy */}
            <section id="refund" className="scroll-mt-24 border-t border-[var(--border-subtle)] pt-8">
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                <RotateCcw size={20} className="text-rose-400" />
                6. Return & Refund Policy
              </h2>
              <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 mb-4">
                <p className="text-xs text-white font-semibold leading-relaxed">
                  “All purchases and subscription payments made on Zonal Edge are final and non-refundable. Once a purchase is completed, no refunds will be issued. Users are advised to review the subscription plan and service details carefully before making a payment.”
                </p>
              </div>
              <div className="space-y-3 text-xs leading-relaxed text-[var(--text-secondary)]">
                <p>
                  Because our platform provides immediate digital access to real-time market structure calculations, proprietary zones, and analytical models, all payments made on Zonal Edge are final and non-refundable upon order completion.
                </p>
                <p>
                  Users are encouraged to utilize the <strong>7-Day Free Trial (₹0)</strong> to evaluate the analytical tools before committing to any paid subscription.
                </p>
              </div>
            </section>

            {/* 7. Cancellation Policy */}
            <section id="cancellation" className="scroll-mt-24 border-t border-[var(--border-subtle)] pt-8">
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                <Clock size={20} className="text-amber-400" />
                7. Cancellation Policy
              </h2>
              <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 mb-4">
                <p className="text-xs text-white font-semibold leading-relaxed">
                  “Users can cancel their subscription at any time during the free trial period. Once the free trial ends and a paid subscription begins, the subscription payment is non-refundable. Users should review the applicable subscription terms before proceeding with payment.”
                </p>
              </div>
              <div className="space-y-3 text-xs leading-relaxed text-[var(--text-secondary)]">
                <p>
                  <strong>How to Cancel:</strong> You can cancel your subscription at any time with one click by navigating to <strong>My Subscription</strong> inside your dashboard or by emailing our team at <strong>support@zonaledge.com</strong>.
                </p>
                <p>
                  <strong>Effective Timing:</strong> If you cancel during the 7-day trial period, your trial remains active for the full 7 days, and no paid charge will be incurred. If you cancel during an active paid subscription cycle, cancellation takes effect at the end of the paid billing interval, without prorated refunds.
                </p>
              </div>
            </section>

            {/* 8. User Accounts & Responsibilities */}
            <section id="accounts" className="scroll-mt-24 border-t border-[var(--border-subtle)] pt-8">
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                <Lock size={20} className="text-[var(--accent-indigo)]" />
                8. User Accounts & Responsibilities
              </h2>
              <div className="space-y-3 text-xs leading-relaxed text-[var(--text-secondary)]">
                <p>
                  Users must safeguard their login credentials. Concurrent login abuse, scraping, automated bot usage, reverse-engineering our zone algorithms, or redistributing proprietary charts without prior written authorization is strictly prohibited and subject to account suspension.
                </p>
              </div>
            </section>

            {/* 9. Intellectual Property */}
            <section id="ip" className="scroll-mt-24 border-t border-[var(--border-subtle)] pt-8">
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                <Scale size={20} className="text-[var(--accent-indigo)]" />
                9. Intellectual Property Rights
              </h2>
              <div className="space-y-3 text-xs leading-relaxed text-[var(--text-secondary)]">
                <p>
                  All proprietary content, brand assets, user interface designs, mathematical models, and zone interpretations are the intellectual property of <strong>Vedgetechnologies</strong>.
                </p>
              </div>
            </section>

            {/* 10. Limitation of Liability */}
            <section id="liability" className="scroll-mt-24 border-t border-[var(--border-subtle)] pt-8">
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                <AlertTriangle size={20} className="text-[var(--danger)]" />
                10. Limitation of Liability
              </h2>
              <div className="space-y-3 text-xs leading-relaxed text-[var(--text-secondary)]">
                <p>
                  Under no circumstances shall Vedgetechnologies, Viknesh, or Zonal Edge analysts be liable for any trading losses, loss of profits, slippage, market gaps, or consequential damages resulting from the use or inability to use the platform.
                </p>
              </div>
            </section>

            {/* 11. Governing Law & Dispute Resolution */}
            <section id="jurisdiction" className="scroll-mt-24 border-t border-[var(--border-subtle)] pt-8">
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                <Scale size={20} className="text-[var(--accent-indigo)]" />
                11. Governing Law & Jurisdiction
              </h2>
              <div className="space-y-3 text-xs leading-relaxed text-[var(--text-secondary)]">
                <p>
                  These Terms shall be governed by and construed in accordance with the laws of India. Any legal dispute or claim arising out of these terms shall be subject to the exclusive jurisdiction of the competent courts in Puducherry, India.
                </p>
              </div>
            </section>

            {/* 12. Contact & Legal Notices */}
            <section id="contact" className="scroll-mt-24 border-t border-[var(--border-subtle)] pt-8">
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                <HelpCircle size={20} className="text-[var(--accent-indigo)]" />
                12. Contact & Support
              </h2>
              <div className="space-y-3 text-xs leading-relaxed text-[var(--text-secondary)]">
                <p>For inquiries, support, or legal questions regarding these Terms, please reach out to:</p>
                <div className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-1.5">
                  <p className="font-bold text-white">Vedgetechnologies (Zonal Edge)</p>
                  <p className="text-[var(--text-muted)]">Proprietor / Legal Name: Viknesh</p>
                  <p className="text-[var(--text-muted)]">Registered Address: 4, Muslim Kallaray Street, Nethaji Nagar II, Uppalam, Puducherry – 605001, India</p>
                  <p className="text-[var(--text-muted)]">Business Email: support@zonaledge.com</p>
                  <p className="text-[var(--text-muted)]">Website: https://www.zonaledge.com</p>
                </div>
              </div>
            </section>
          </main>
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
            <Link to="/terms" className="hover:text-white transition-colors text-white font-semibold">Terms & Conditions</Link>
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/refund-policy" className="hover:text-white transition-colors">Refund Policy</Link>
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
