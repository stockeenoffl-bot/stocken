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
} from 'lucide-react'

export default function Privacy() {
  const [activeSection, setActiveSection] = useState('overview')

  const sections = [
    { id: 'overview', label: '1. Overview & Commitment', icon: ShieldCheck },
    { id: 'collection', label: '2. Information We Collect', icon: Database },
    { id: 'usage', label: '3. How We Use Information', icon: Eye },
    { id: 'cookies', label: '4. Cookies & Local Storage', icon: Cookie },
    { id: 'payments', label: '5. Payment Security (Razorpay)', icon: CreditCard },
    { id: 'thirdparties', label: '6. Third-Party Services', icon: Lock },
    { id: 'retention', label: '7. Data Security & Storage', icon: Lock },
    { id: 'rights', label: '8. Your Rights & Choices', icon: UserX },
    { id: 'compliance', label: '9. DPDPA 2023 Compliance', icon: FileCheck },
    { id: 'contact', label: '10. Grievance Redressal', icon: HelpCircle },
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
              Privacy Policy
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <Link
              to="/terms"
              className="text-[var(--text-secondary)] hover:text-white transition-colors"
            >
              Terms of Service
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
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-3"
          >
            <ShieldCheck size={13} /> Your Privacy Matters
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
            className="text-sm text-[var(--text-secondary)] max-w-2xl mx-auto"
          >
            Last Updated: January 2025. Learn how Zonal Edge protects, uses, and respects
            your personal and transactional data.
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
                Quick Navigation
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
            {/* 1. Overview */}
            <section id="overview" className="scroll-mt-24">
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                <ShieldCheck size={20} className="text-emerald-400" />
                1. Overview & Commitment
              </h2>
              <div className="space-y-3 text-xs leading-relaxed text-[var(--text-secondary)]">
                <p>
                  Zonal Edge ("we", "our", or "us") respects your privacy and is committed to protecting
                  the personal data of all users, visitors, and subscribers. This Privacy Policy explains our practices
                  regarding data collection, storage, and processing.
                </p>
                <p>
                  This Privacy Policy outlines the types of personal and analytical information we collect, how it is stored
                  securely, and the rigorous measures we undertake to ensure your data is never sold or misused.
                </p>
              </div>
            </section>

            {/* 2. Collection */}
            <section id="collection" className="scroll-mt-24 border-t border-[var(--border-subtle)] pt-8">
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                <Database size={20} className="text-[var(--accent-indigo)]" />
                2. Information We Collect
              </h2>
              <div className="space-y-3 text-xs leading-relaxed text-[var(--text-secondary)]">
                <p>We only collect information necessary to provide and enhance our educational services:</p>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li><strong>Account Information:</strong> Your full name, email address, password hash, and optional display profile.</li>
                  <li><strong>Subscription Data:</strong> Your plan tier (Free, Pro, or VIP), billing cycle dates, and payment transaction identifiers.</li>
                  <li><strong>Usage Data:</strong> Pages visited, charting preferences (e.g. selected timeframe, active index), and interaction logs.</li>
                  <li><strong>Technical Data:</strong> Browser type, operating system, IP address, and session timestamps for security and abuse detection.</li>
                </ul>
              </div>
            </section>

            {/* 3. How We Use Data */}
            <section id="usage" className="scroll-mt-24 border-t border-[var(--border-subtle)] pt-8">
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                <Eye size={20} className="text-[var(--accent-indigo)]" />
                3. How We Use Your Information
              </h2>
              <div className="space-y-3 text-xs leading-relaxed text-[var(--text-secondary)]">
                <p>We process your data for the following specific purposes:</p>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>To authenticate your identity and grant access to subscribed educational tiers.</li>
                  <li>To provide personalized market analysis, Open Interest charts, and real-time feeds.</li>
                  <li>To send critical account alerts, password resets, and transaction receipts.</li>
                  <li>To protect against malicious scraping, unauthorized account sharing, and DDoS attacks.</li>
                </ul>
              </div>
            </section>

            {/* 4. Cookies & Local Storage */}
            <section id="cookies" className="scroll-mt-24 border-t border-[var(--border-subtle)] pt-8">
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                <Cookie size={20} className="text-amber-400" />
                4. Cookies, Session Tokens & Local Storage
              </h2>
              <div className="space-y-3 text-xs leading-relaxed text-[var(--text-secondary)]">
                <p>
                  We utilize browser Local Storage and secure HTTP session tokens exclusively for essential functional purposes:
                </p>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li><strong>Authentication Tokens:</strong> Maintained via Supabase Auth to keep you securely signed in.</li>
                  <li><strong>Market Data Caching:</strong> We store recent candlestick and OI data in your browser's local cache to protect API quotas and load charts instantly without redundant network calls.</li>
                  <li><strong>UI Preferences:</strong> Dark mode settings and selected indices (NIFTY 50, SENSEX, BANK NIFTY).</li>
                </ul>
                <p className="text-[var(--text-muted)]">
                  We do NOT use third-party tracking cookies or sell cross-site behavioral advertising data.
                </p>
              </div>
            </section>

            {/* 5. Payments (Razorpay) */}
            <section id="payments" className="scroll-mt-24 border-t border-[var(--border-subtle)] pt-8">
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                <CreditCard size={20} className="text-emerald-400" />
                5. Payment Information & Gateway Security (Razorpay)
              </h2>
              <div className="space-y-3 text-xs leading-relaxed text-[var(--text-secondary)]">
                <p>
                  All online payments on Zonal Edge are processed through <strong>Razorpay</strong>, a PCI-DSS Level 1 certified payment aggregator.
                  When you subscribe to our pro plan or courses:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-[var(--text-secondary)]">
                  <li>
                    Zonal Edge does NOT store, process, or have access to your credit/debit card numbers, CVVs, net banking credentials, or UPI PINs.
                  </li>
                </ul>
                <p className="text-[var(--text-muted)]">
                  All transaction credentials are encrypted directly through Razorpay's compliant infrastructure.
                </p>
              </div>
            </section>

            {/* 6. Third-Party Services */}
            <section id="thirdparties" className="scroll-mt-24 border-t border-[var(--border-subtle)] pt-8">
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                <Lock size={20} className="text-[var(--accent-indigo)]" />
                6. Third-Party Service Providers
              </h2>
              <div className="space-y-3 text-xs leading-relaxed text-[var(--text-secondary)]">
                <p>We work with vetted technology providers who adhere to strict data security standards:</p>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li><strong>Supabase:</strong> For enterprise-grade encrypted database storage, Row-Level Security (RLS), and authentication.</li>
                  <li><strong>Razorpay:</strong> For handling domestic UPI, cards, and net-banking transactions.</li>
                  <li><strong>Twelve Data / Market Feeds:</strong> For retrieving aggregated market analytics and candlestick datasets.</li>
                  <li><strong>Telegram Bot API:</strong> For optional automated broadcast notifications requested by users.</li>
                </ul>
              </div>
            </section>

            {/* 7. Security & Retention */}
            <section id="retention" className="scroll-mt-24 border-t border-[var(--border-subtle)] pt-8">
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                <Lock size={20} className="text-[var(--accent-indigo)]" />
                7. Data Security & Retention
              </h2>
              <div className="space-y-3 text-xs leading-relaxed text-[var(--text-secondary)]">
                <p>
                  We implement robust technical and organizational measures to safeguard your information:
                </p>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>End-to-end SSL/TLS 256-bit encryption for all data in transit.</li>
                  <li>PostgreSQL Row-Level Security (RLS) ensuring users can only read their authorized records.</li>
                  <li>We retain personal account data only as long as your account remains active or as required by applicable tax and commercial record-keeping regulations.</li>
                </ul>
              </div>
            </section>

            {/* 8. User Rights */}
            <section id="rights" className="scroll-mt-24 border-t border-[var(--border-subtle)] pt-8">
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                <UserX size={20} className="text-[var(--accent-indigo)]" />
                8. Your Rights & Data Controls
              </h2>
              <div className="space-y-3 text-xs leading-relaxed text-[var(--text-secondary)]">
                <p>Under applicable Indian data protection principles, you possess the right to:</p>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li><strong>Access & Rectification:</strong> View and update your profile details via your account settings.</li>
                  <li><strong>Data Portability & Erasure:</strong> Request the deletion of your account and associated personal data by contacting our support team.</li>
                  <li><strong>Opt-Out:</strong> Unsubscribe from non-essential notification channels at any time.</li>
                </ul>
              </div>
            </section>

            {/* 9. DPDPA 2023 */}
            <section id="compliance" className="scroll-mt-24 border-t border-[var(--border-subtle)] pt-8">
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                <FileCheck size={20} className="text-emerald-400" />
                9. Digital Personal Data Protection Act (DPDPA 2023)
              </h2>
              <div className="space-y-3 text-xs leading-relaxed text-[var(--text-secondary)]">
                <p>
                  Zonal Edge complies with the Digital Personal Data Protection Act, 2023 (DPDPA) of India.
                  We process personal data based on your lawful and informed consent, which you freely provide when
                  accepting this Privacy Policy during registration.
                </p>
              </div>
            </section>

            {/* 10. Contact & Grievance */}
            <section id="contact" className="scroll-mt-24 border-t border-[var(--border-subtle)] pt-8">
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                <HelpCircle size={20} className="text-[var(--accent-indigo)]" />
                10. Grievance Officer & Contact
              </h2>
              <div className="space-y-3 text-xs leading-relaxed text-[var(--text-secondary)]">
                <p>
                  In accordance with the Information Technology Act, 2000 and the DPDPA 2023, if you have any questions,
                  concerns, or grievances regarding your data, please contact our Grievance Officer:
                </p>
                <div className="p-4 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-1">
                  <p className="font-semibold text-[var(--text-primary)]">Data Grievance Officer</p>
                  <p className="text-[var(--text-muted)]">Platform: Zonal Edge</p>
                  <p className="text-[var(--text-muted)]">Email: privacy@zonaledge.in</p>
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
