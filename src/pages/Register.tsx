import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mail,
  Lock,
  User,
  Loader2,
  Eye,
  EyeOff,
  CheckCircle2,
  ShieldAlert,
  X,
  FileText,
  AlertTriangle,
} from 'lucide-react'

export default function Register() {
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Terms & Privacy Checkbox State
  const [agreedTerms, setAgreedTerms] = useState(false)
  const [showTermsModal, setShowTermsModal] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validation: Terms Acceptance
    if (!agreedTerms) {
      setError('Please review and accept the Terms of Service and Privacy Policy to proceed.')
      return
    }

    // Validation: Passwords Match
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify and retype.')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.')
      return
    }

    setLoading(true)

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })

      if (signUpError) {
        setError(signUpError.message)
        return
      }

      if (data.user) {
        // Self-healing: Upsert basic profile record in case the Supabase database trigger was omitted
        try {
          await supabase.from('profiles').upsert(
            {
              id: data.user.id,
              email: data.user.email,
              full_name: fullName,
              role: 'subscriber',
              status: 'active',
            },
            { onConflict: 'id' }
          )
        } catch (profileErr) {
          console.warn('Profile self-healing note:', profileErr)
        }

        // Check if email confirmation is disabled and session was returned immediately
        if (data.session) {
          navigate('/app')
        } else {
          setSuccess(true)
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to register account')
    } finally {
      setLoading(false)
    }
  }

  // Success Confirmation Screen (if email confirmation required)
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md p-8 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] shadow-xl text-center"
        >
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4">
            <Mail size={32} />
          </div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Check your email</h2>
          <p className="text-xs text-[var(--text-secondary)] mb-6 leading-relaxed">
            We've sent a verification link to <strong>{email}</strong>. Please click the link to confirm your account and log in.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="w-full py-2.5 rounded-md bg-[var(--accent-indigo)] text-white text-sm font-medium hover:brightness-110 transition-all"
          >
            Return to Login
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] p-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md p-6 sm:p-8 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] shadow-xl"
      >
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Create an Account</h1>
          <p className="text-xs text-[var(--text-muted)] mt-1.5">
            Join TradeHub to access real-time charts & market analytics
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-md bg-[var(--danger)]/10 border border-[var(--danger)]/20 text-[var(--danger)] text-xs flex items-start gap-2">
            <AlertTriangle size={15} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-3.5">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full pl-10 pr-3 py-2 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-tertiary)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent-indigo)] transition-colors"
                placeholder="Barath Kumar"
              />
            </div>
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-3 py-2 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-tertiary)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent-indigo)] transition-colors"
                placeholder="you@example.com"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full pl-10 pr-10 py-2 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-tertiary)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent-indigo)] transition-colors"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-white"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="w-full pl-10 pr-10 py-2 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-tertiary)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent-indigo)] transition-colors"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-white"
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Mandatory Terms & Privacy Checkbox */}
          <div className="pt-2">
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)]">
              <input
                type="checkbox"
                id="termsCheck"
                checked={agreedTerms}
                onChange={(e) => setAgreedTerms(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-[var(--border-subtle)] text-[var(--accent-indigo)] focus:ring-[var(--accent-indigo)] cursor-pointer accent-indigo-600"
              />
              <label htmlFor="termsCheck" className="text-xs text-[var(--text-secondary)] leading-relaxed select-none cursor-pointer">
                I have read and agree to the{' '}
                <Link
                  to="/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--accent-indigo)] font-medium hover:underline"
                >
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link
                  to="/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--accent-indigo)] font-medium hover:underline"
                >
                  Privacy Policy
                </Link>
                .
              </label>
            </div>

            <div className="flex justify-end mt-1.5">
              <button
                type="button"
                onClick={() => setShowTermsModal(true)}
                className="text-[11px] text-[var(--accent-indigo)] hover:underline flex items-center gap-1"
              >
                <FileText size={12} /> Read Key Disclosures & Terms Summary
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-md bg-[var(--accent-indigo)] text-white text-sm font-medium hover:brightness-110 transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-70 shadow-md"
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : null}
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-xs text-[var(--text-muted)] mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-[var(--accent-indigo)] font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </motion.div>

      {/* Interactive Quick-Read Modal */}
      <AnimatePresence>
        {showTermsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg max-h-[85vh] flex flex-col rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] shadow-2xl overflow-hidden"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-subtle)]">
                <div className="flex items-center gap-2 text-sm font-bold text-[var(--text-primary)]">
                  <ShieldAlert size={18} className="text-amber-400" />
                  Key Terms & Privacy Disclosures
                </div>
                <button
                  onClick={() => setShowTermsModal(false)}
                  className="p-1 rounded-md text-[var(--text-muted)] hover:text-white hover:bg-[var(--bg-tertiary)]"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Modal Scrollable Body */}
              <div className="p-5 overflow-y-auto space-y-4 text-xs text-[var(--text-secondary)] leading-relaxed">
                <div className="p-3.5 rounded-lg border border-amber-500/20 bg-amber-500/5 space-y-1.5">
                  <p className="font-bold text-amber-300 flex items-center gap-1.5">
                    <ShieldAlert size={14} /> Statutory Regulatory Disclaimer (SEBI)
                  </p>
                  <p className="text-amber-200/90 text-[11px]">
                    TradeHub / Zonal Edge is solely an educational and analytical charting tool. We are NOT
                    SEBI-registered Investment Advisers or Research Analysts. We do not provide buy/sell signals,
                    portfolio management, or guaranteed returns.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <p className="font-semibold text-[var(--text-primary)]">1. Market Risk Acknowledgment</p>
                  <p>
                    Per SEBI statistics, 9 out of 10 individual traders incur net losses in the Futures and Options (F&O)
                    market. Capital is at risk. Past setups are strictly for historical study.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <p className="font-semibold text-[var(--text-primary)]">2. Digital Subscriptions & Payments</p>
                  <p>
                    All subscription fees processed through Razorpay are non-refundable once digital analytics access
                    is provisioned. Subscriptions renew automatically unless cancelled before the renewal date.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <p className="font-semibold text-[var(--text-primary)]">3. Data Privacy & Zero Spam</p>
                  <p>
                    We never sell or rent your personal information. Payment credentials are handled directly by
                    PCI-compliant Razorpay; we never store CVVs or UPI PINs.
                  </p>
                </div>

                <div className="pt-2 text-[11px] text-[var(--text-muted)] border-t border-[var(--border-subtle)]">
                  For the full legal documents, visit the dedicated{' '}
                  <Link to="/terms" target="_blank" className="text-[var(--accent-indigo)] underline">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" target="_blank" className="text-[var(--accent-indigo)] underline">
                    Privacy Policy
                  </Link>{' '}
                  pages.
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-between px-5 py-3.5 border-t border-[var(--border-subtle)] bg-[var(--bg-tertiary)]">
                <button
                  type="button"
                  onClick={() => setShowTermsModal(false)}
                  className="px-4 py-2 rounded-md text-xs text-[var(--text-muted)] hover:text-white"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAgreedTerms(true)
                    setShowTermsModal(false)
                  }}
                  className="px-4 py-2 rounded-md bg-[var(--accent-indigo)] text-white text-xs font-medium hover:brightness-110 flex items-center gap-1.5"
                >
                  <CheckCircle2 size={14} /> Accept & Check Box
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
