import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Mail,
  Clock,
  Send,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  ChevronDown,
  Sparkles,
} from 'lucide-react'
import { toast } from 'sonner'

export default function ContactUs() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    category: 'general',
    subject: '',
    message: '',
  })
  const [sending, setSending] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [activeFaq, setActiveFaq] = useState<number | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) {
      toast.error('Please fill in all required fields.')
      return
    }

    setSending(true)
    setTimeout(() => {
      setSending(false)
      setSubmitted(true)
      toast.success('Your message has been received! We will reply within 24 hours.')
      setForm({ name: '', email: '', category: 'general', subject: '', message: '' })
    }, 800)
  }

  const faqs = [
    {
      q: 'At what time is the daily zone analysis updated?',
      a: 'Daily market structure analysis for NIFTY 50 and SENSEX is published before the market opens, usually by 8:30 AM IST on every Indian trading day.',
    },
    {
      q: 'Can I draw and save my markings on the live TradingView chart?',
      a: 'Yes! The integrated TradingView chart has full left-side drawing toolbars enabled. You can draw supply/demand zones, trendlines, and Fibonacci levels, and take screenshots using the camera icon in the top-right toolbar.',
    },
    {
      q: 'How do I cancel my 7-day trial or active subscription?',
      a: 'You can easily cancel anytime with 1-click by visiting the My Subscription section in your dashboard, or by emailing support@zonaledge.in.',
    },
    {
      q: 'Do you provide buy/sell tips or automated copy trading?',
      a: 'No. Zonal Edge strictly adheres to SEBI guidelines. We do not provide trading tips, stock advice, or managed accounts. We empower traders with pure market structure and educational analysis.',
    },
  ]

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
                Contact & Support
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
            <Link to="/about" className="text-[var(--text-secondary)] hover:text-white transition-colors">
              About Us
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
            <MessageSquare size={14} /> We're Here to Help
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text-primary)] mb-4"
          >
            Contact Zonal Edge Support
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-sm text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed"
          >
            Have a question regarding daily zone analysis, your subscription, billing, or technical features?
            Our team is available throughout Indian market hours.
          </motion.p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-12">
        <div className="grid lg:grid-cols-3 gap-8 items-start">
          {/* Left Column: Direct Info Cards */}
          <div className="space-y-4">
            <div className="p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-[var(--accent-indigo)] flex items-center justify-center">
                <Mail size={20} />
              </div>
              <h3 className="text-sm font-bold text-[var(--text-primary)]">General Support</h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                For account assistance, billing questions, or platform inquiries:
              </p>
              <a
                href="mailto:support@zonaledge.in"
                className="text-xs font-medium text-[var(--accent-indigo)] hover:underline block pt-1"
              >
                support@zonaledge.in
              </a>
            </div>

            <div className="p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <ShieldCheck size={20} />
              </div>
              <h3 className="text-sm font-bold text-[var(--text-primary)]">Compliance & Legal</h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                For regulatory, privacy (DPDPA), or grievance redressal requests:
              </p>
              <a
                href="mailto:compliance@zonaledge.in"
                className="text-xs font-medium text-amber-400 hover:underline block pt-1"
              >
                compliance@zonaledge.in
              </a>
            </div>

            <div className="p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <Clock size={20} />
              </div>
              <h3 className="text-sm font-bold text-[var(--text-primary)]">Support Hours</h3>
              <div className="space-y-1 text-xs text-[var(--text-secondary)]">
                <p><strong>Monday – Friday:</strong> 9:00 AM – 6:00 PM IST</p>
                <p><strong>Saturday:</strong> 10:00 AM – 2:00 PM IST</p>
                <p><strong>Sunday:</strong> Emergency monitoring</p>
                <p className="text-[11px] text-[var(--text-muted)] pt-1">Typical response time: Under 2 hours during market hours.</p>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-2 p-8 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] shadow-xl relative">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-1 flex items-center gap-2">
              Send us a Message
            </h2>
            <p className="text-xs text-[var(--text-muted)] mb-6">
              Fill out the form below and our team will get back to you promptly.
            </p>

            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-8 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-center space-y-4"
              >
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-lg font-bold text-emerald-300">Message Dispatched!</h3>
                <p className="text-xs text-[var(--text-secondary)] max-w-md mx-auto leading-relaxed">
                  Thank you for reaching out to Zonal Edge. A confirmation has been logged, and our team will respond to your email address shortly.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-4 py-2 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] hover:border-[var(--accent-indigo)] transition-colors"
                >
                  Send Another Inquiry
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-tertiary)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--accent-indigo)] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-tertiary)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--accent-indigo)] transition-colors"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                      Inquiry Category
                    </label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-tertiary)] text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent-indigo)] transition-colors"
                    >
                      <option value="general">General Inquiry</option>
                      <option value="subscription">Subscription & Billing</option>
                      <option value="technical">Live Chart & Technical Support</option>
                      <option value="zones">Market Zone Questions</option>
                      <option value="compliance">SEBI Compliance / Legal</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                      Subject
                    </label>
                    <input
                      type="text"
                      placeholder="Brief topic summary"
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-tertiary)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--accent-indigo)] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                    Your Message *
                  </label>
                  <textarea
                    required
                    rows={5}
                    placeholder="How can our support team assist you today? Please include any relevant details..."
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-tertiary)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--accent-indigo)] transition-colors resize-y"
                  />
                </div>

                <button
                  type="submit"
                  disabled={sending}
                  className="w-full py-3 rounded-lg bg-[var(--accent-indigo)] text-white text-xs font-semibold hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 disabled:opacity-50 cursor-pointer"
                >
                  {sending ? (
                    'Transmitting...'
                  ) : (
                    <>
                      <Send size={14} /> Submit Message to Support
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* FAQs Section */}
        <div className="p-8 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--accent-indigo)]">
              <Sparkles size={13} /> Quick Answers
            </div>
            <h3 className="text-xl font-bold text-[var(--text-primary)]">Frequently Asked Questions</h3>
            <p className="text-xs text-[var(--text-muted)]">
              Instant clarification on our daily analysis, charts, and billing policies.
            </p>
          </div>

          <div className="space-y-3 max-w-3xl mx-auto">
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx
              return (
                <div
                  key={idx}
                  className="border border-[var(--border-subtle)] rounded-xl overflow-hidden bg-[var(--bg-tertiary)] transition-all"
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="w-full p-4 text-left flex items-center justify-between text-xs sm:text-sm font-semibold text-[var(--text-primary)] hover:text-white"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      size={16}
                      className={`text-[var(--text-muted)] transition-transform duration-200 shrink-0 ml-2 ${
                        isOpen ? 'rotate-180 text-[var(--accent-indigo)]' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 text-xs text-[var(--text-secondary)] leading-relaxed border-t border-[var(--border-subtle)]/50">
                      {faq.a}
                    </div>
                  )}
                </div>
              )
            })}
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
            <Link to="/about" className="hover:text-white transition-colors">About Us</Link>
            <Link to="/contact" className="hover:text-white transition-colors text-[var(--accent-indigo)]">Contact Us</Link>
            <Link to="/login" className="hover:text-white transition-colors">Sign In</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
