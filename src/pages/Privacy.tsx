import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  ShieldCheck,
  Lock,
  Database,
  Eye,
  Cookie,
  CreditCard,
  UserX,
  FileCheck,
  HelpCircle,
  Building2,
} from 'lucide-react'

export default function Privacy() {
  const [activeSection, setActiveSection] = useState('entity')

  const sections = [
    { id: 'entity', label: '1. Data Controller Information', icon: Building2 },
    { id: 'collection', label: '2. Information We Collect', icon: Database },
    { id: 'usage', label: '3. How We Use & Store Data', icon: Eye },
    { id: 'payments', label: '4. Payment & Subscription Data Handling', icon: CreditCard },
    { id: 'thirdparties', label: '5. Third-Party Service Providers', icon: Lock },
    { id: 'security', label: '6. Data Security Measures', icon: ShieldCheck },
    { id: 'cookies', label: '7. Cookies & Local Storage', icon: Cookie },
    { id: 'rights', label: '8. User Privacy Rights', icon: UserX },
    { id: 'compliance', label: '9. DPDPA 2023 Statutory Compliance', icon: FileCheck },
    { id: 'contact', label: '10. Grievance & Contact Queries', icon: HelpCircle },
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
                Privacy Policy
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-3 text-xs">
            <Link to="/terms" className="text-[var(--text-secondary)] hover:text-white transition-colors">
              Terms
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
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-3"
          >
            <ShieldCheck size={13} /> DPDPA 2023 Compliant &middot; Bank-Grade Privacy
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text-primary)] mb-3"
          >
            Privacy Policy
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-sm text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed"
          >
            Last Updated: November 2026. This Privacy Policy details how Vedgetechnologies ("Zonal Edge") collects, protects, stores, and handles your personal information.
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

          {/* Detailed Policy Content */}
          <main className="lg:col-span-3 space-y-10">
            {/* 1. Entity Info */}
            <section id="entity" className="scroll-mt-24">
              <div className="p-5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 mb-6 space-y-2">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <Building2 size={16} className="text-indigo-400" />
                  <span>Data Fiduciary & Business Operator</span>
                </div>
                <p className="text-xs text-indigo-200 leading-relaxed">
                  Zonal Edge (https://www.zonaledge.com) is operated by <strong>Vedgetechnologies</strong>, having its principal place of business at <strong>4, Muslim Kallaray Street, Nethaji Nagar II, Uppalam, Puducherry – 605001, India</strong>. Represented by its legal proprietor <strong>Viknesh</strong>.
                </p>
              </div>

              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                <Building2 size={20} className="text-[var(--accent-indigo)]" />
                1. Data Controller & Entity Commitment
              </h2>
              <div className="space-y-3 text-xs leading-relaxed text-[var(--text-secondary)]">
                <p>
                  At Vedgetechnologies, we respect your privacy and are committed to safeguarding your personal data in accordance with the Digital Personal Data Protection Act, 2023 (DPDPA) and the Information Technology Act, 2000 of India.
                </p>
              </div>
            </section>

            {/* 2. Information We Collect */}
            <section id="collection" className="scroll-mt-24 border-t border-[var(--border-subtle)] pt-8">
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                <Database size={20} className="text-[var(--accent-indigo)]" />
                2. Information We Collect From Users
              </h2>
              <div className="space-y-3 text-xs leading-relaxed text-[var(--text-secondary)]">
                <p>We collect only the minimum necessary information to provide access to our analytics platform:</p>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li><strong>Account Information:</strong> Full name, email address, password hash (encrypted via bcrypt/Argon2 by Supabase Auth), and role preference (Subscriber or Editor).</li>
                  <li><strong>Subscription Data:</strong> Active plan slug, start date, expiration date, trial status, and cancellation status.</li>
                  <li><strong>Technical & Usage Data:</strong> IP address, browser type, device type, operating system, and session timestamps for security audit logs.</li>
                </ul>
              </div>
            </section>

            {/* 3. How We Use & Store Information */}
            <section id="usage" className="scroll-mt-24 border-t border-[var(--border-subtle)] pt-8">
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                <Eye size={20} className="text-[var(--accent-indigo)]" />
                3. How Personal Information is Used and Stored
              </h2>
              <div className="space-y-3 text-xs leading-relaxed text-[var(--text-secondary)]">
                <p>We process your data exclusively for lawful purposes:</p>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>Authenticating your account and enforcing subscription tier permissions.</li>
                  <li>Delivering daily market zones, liquidation levels, and OI analytics.</li>
                  <li>Sending critical account status updates and billing receipts.</li>
                  <li>Detecting unauthorized multi-device sharing or scraping attempts.</li>
                </ul>
                <p>
                  <strong>Data Storage:</strong> User records are stored in secure cloud database instances managed by Supabase (PostgreSQL) hosted in high-security data centers with end-to-end encryption at rest (AES-256) and in transit (TLS 1.3).
                </p>
              </div>
            </section>

            {/* 4. Payment Data Handling */}
            <section id="payments" className="scroll-mt-24 border-t border-[var(--border-subtle)] pt-8">
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                <CreditCard size={20} className="text-[var(--accent-indigo)]" />
                4. Payment & Subscription-Related Data Handling
              </h2>
              <div className="space-y-3 text-xs leading-relaxed text-[var(--text-secondary)]">
                <p>
                  All online payments and subscription billing are processed securely through certified, RBI-authorized payment aggregators, primarily <strong>Razorpay</strong>.
                </p>
                <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 space-y-1.5">
                  <p className="font-bold text-emerald-300">PCI-DSS Level 1 Compliance</p>
                  <p className="text-[11px] text-emerald-200">
                    Zonal Edge and Vedgetechnologies <strong>NEVER store, process, or view your raw credit/debit card numbers, CVVs, or net banking passwords</strong>. All financial transactions are directly tokenized and processed within Razorpay's PCI-DSS compliant secure vaults.
                  </p>
                </div>
                <p>
                  We store only non-sensitive transactional identifiers (such as Razorpay Order ID, Payment ID, amount paid in INR, payment timestamp, and payment status) for accounting, taxation, and subscription provisioning.
                </p>
              </div>
            </section>

            {/* 5. Third-Party Service Providers */}
            <section id="thirdparties" className="scroll-mt-24 border-t border-[var(--border-subtle)] pt-8">
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                <Lock size={20} className="text-[var(--accent-indigo)]" />
                5. Data Security & Third-Party Service Providers
              </h2>
              <div className="space-y-3 text-xs leading-relaxed text-[var(--text-secondary)]">
                <p>We work only with vetted, enterprise-grade third-party service providers:</p>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li><strong>Razorpay:</strong> Payment processing and subscription invoicing.</li>
                  <li><strong>Supabase:</strong> Encrypted user authentication, profile data, and database storage.</li>
                  <li><strong>Alice Blue API:</strong> Streaming real-time market quotes and historical candlestick feeds.</li>
                </ul>
                <p>
                  We never sell, rent, monetize, or trade your personal information with any third-party advertisers or marketing agencies.
                </p>
              </div>
            </section>

            {/* 6. Data Security Measures */}
            <section id="security" className="scroll-mt-24 border-t border-[var(--border-subtle)] pt-8">
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                <ShieldCheck size={20} className="text-emerald-400" />
                6. Data Security Safeguards
              </h2>
              <div className="space-y-3 text-xs leading-relaxed text-[var(--text-secondary)]">
                <p>We enforce strict technical and organizational measures:</p>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>Enforced HTTPS/TLS 1.3 encryption across all website endpoints.</li>
                  <li>Strict Row-Level Security (RLS) in the PostgreSQL database layer ensuring users can only read their own data.</li>
                  <li>Role-based access control preventing non-admin accounts from viewing customer payments or subscriptions.</li>
                  <li>Regular system audits and secure API token handling.</li>
                </ul>
              </div>
            </section>

            {/* 7. Cookies */}
            <section id="cookies" className="scroll-mt-24 border-t border-[var(--border-subtle)] pt-8">
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                <Cookie size={20} className="text-[var(--accent-indigo)]" />
                7. Cookies & Local Storage
              </h2>
              <div className="space-y-3 text-xs leading-relaxed text-[var(--text-secondary)]">
                <p>
                  We use essential session cookies and browser LocalStorage strictly to keep you authenticated, store your theme preference, and preserve your active market chart selection (NIFTY 50 / SENSEX). We do not use third-party tracking cookies for targeted behavioral advertising.
                </p>
              </div>
            </section>

            {/* 8. User Privacy Rights */}
            <section id="rights" className="scroll-mt-24 border-t border-[var(--border-subtle)] pt-8">
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                <UserX size={20} className="text-[var(--accent-indigo)]" />
                8. User Privacy Rights
              </h2>
              <div className="space-y-3 text-xs leading-relaxed text-[var(--text-secondary)]">
                <p>Under the Digital Personal Data Protection Act, 2023, you have the right to:</p>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li><strong>Right to Access:</strong> View all personal data held about you in your user profile.</li>
                  <li><strong>Right to Correction:</strong> Request correction of inaccurate or incomplete personal records.</li>
                  <li><strong>Right to Erasure:</strong> Request the deletion of your account and personal identifiers by contacting us at <strong>support@zonaledge.com</strong>.</li>
                  <li><strong>Right of Grievance Redressal:</strong> Submit a complaint regarding data processing directly to our Grievance Officer.</li>
                </ul>
              </div>
            </section>

            {/* 9. DPDPA 2023 Compliance */}
            <section id="compliance" className="scroll-mt-24 border-t border-[var(--border-subtle)] pt-8">
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                <FileCheck size={20} className="text-emerald-400" />
                9. DPDPA 2023 Statutory Compliance
              </h2>
              <div className="space-y-3 text-xs leading-relaxed text-[var(--text-secondary)]">
                <p>
                  Vedgetechnologies acts as the Data Fiduciary. By creating an account and selecting the consent checkbox, you grant lawful, specific, and informed consent for data processing strictly as described herein. You may withdraw consent at any time by closing your account.
                </p>
              </div>
            </section>

            {/* 10. Grievance Officer & Contact */}
            <section id="contact" className="scroll-mt-24 border-t border-[var(--border-subtle)] pt-8">
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                <HelpCircle size={20} className="text-[var(--accent-indigo)]" />
                10. Privacy Queries & Grievance Redressal
              </h2>
              <div className="space-y-3 text-xs leading-relaxed text-[var(--text-secondary)]">
                <p>
                  If you have any questions, concerns, or grievances regarding this Privacy Policy or how your data is handled, please contact our designated Grievance Officer:
                </p>
                <div className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-1.5 font-mono text-[11px]">
                  <p className="text-white font-bold">Grievance Officer: Viknesh</p>
                  <p className="text-slate-300">Entity: Vedgetechnologies (Zonal Edge)</p>
                  <p className="text-slate-300">Registered Office: 4, Muslim Kallaray Street, Nethaji Nagar II, Uppalam, Puducherry – 605001, India</p>
                  <p className="text-slate-300">Official Email: support@zonaledge.com</p>
                  <p className="text-slate-300">Website: https://www.zonaledge.com</p>
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
            <Link to="/terms" className="hover:text-white transition-colors">Terms & Conditions</Link>
            <Link to="/privacy" className="hover:text-white transition-colors text-white font-semibold">Privacy Policy</Link>
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
