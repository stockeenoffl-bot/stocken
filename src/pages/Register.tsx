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
  LineChart,
  PenSquare,
} from 'lucide-react'

export default function Register() {
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Account Role State: 'user' (Subscriber) or 'editor' (Chart Editor / Analyst)
  const [selectedRole, setSelectedRole] = useState<'user' | 'editor'>('user')

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
      setError('Please review and accept the Terms of Service, Privacy Policy, and Refund & Cancellation Policies to proceed.')
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
            role: selectedRole,
          },
        },
      })

      if (signUpError) {
        if (/already registered/i.test(signUpError.message) || signUpError.status === 422) {
          setError('This email is already registered. Please log in to your account.')
        } else {
          setError(signUpError.message)
        }
        return
      }

      if (data.user) {
        // Only write to profiles directly if session is active (to avoid 403 when unauthenticated)
        if (data.session) {
          try {
            await supabase.from('profiles').upsert(
              {
                id: data.user.id,
                email: data.user.email,
                full_name: fullName,
                role: selectedRole,
                status: 'active',
              },
              { onConflict: 'id' }
            )
          } catch (profileErr) {
            console.warn('Profile self-healing note:', profileErr)
          }
        }

        // Check if session was returned immediately (email confirmation disabled)
        if (data.session) {
          if (selectedRole === 'editor') {
            navigate('/dashboard')
          } else {
            navigate('/app')
          }
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

  // Success Confirmation Screen
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
          <Link to="/" className="inline-flex items-center gap-2 mb-3">
            <img src="/images/ZonalEdge.jpeg" alt="Zonal Edge" className="w-8 h-8 rounded-lg object-cover" />
            <span className="text-lg font-bold text-white">Zonal Edge</span>
          </Link>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Create an Account</h1>
          <p className="text-xs text-[var(--text-muted)] mt-1.5">
            Join Zonal Edge to access real-time charts & market structure
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-md bg-[var(--danger)]/10 border border-[var(--danger)]/20 text-[var(--danger)] text-xs flex items-start gap-2">
            <AlertTriangle size={15} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-3.5">
          {/* Account Role Selection */}
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
              Select Account Role
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSelectedRole('user')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  selectedRole === 'user'
                    ? 'bg-[var(--accent-indigo)]/15 border-[var(--accent-indigo)] text-white shadow-sm'
                    : 'bg-[var(--bg-tertiary)] border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs text-white">
                  <LineChart size={14} className="text-emerald-400" />
                  <span>Subscriber</span>
                </div>
                <p className="text-[10px] text-[var(--text-muted)] mt-1 leading-tight">
                  View live charts, zones, OI data & market analysis
                </p>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole('editor')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  selectedRole === 'editor'
                    ? 'bg-blue-500/15 border-blue-500 text-white shadow-sm'
                    : 'bg-[var(--bg-tertiary)] border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs text-white">
                  <PenSquare size={14} className="text-blue-400" />
                  <span>Chart Editor</span>
                </div>
                <p className="text-[10px] text-[var(--text-muted)] mt-1 leading-tight">
                  Edit & publish charts/zones, add users (billing restricted)
                </p>
              </button>
            </div>
          </div>

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
                placeholder="Viknesh"
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
                placeholder="trader@example.com"
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

          {/* Mandatory Terms, Privacy & Policy Checkbox */}
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
                </Link>
                ,{' '}
                <Link
                  to="/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--accent-indigo)] font-medium hover:underline"
                >
                  Privacy Policy
                </Link>
                ,{' '}
                <Link
                  to="/refund-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--accent-indigo)] font-medium hover:underline"
                >
                  Return & Refund Policy
                </Link>
                , and{' '}
                <Link
                  to="/cancellation-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--accent-indigo)] font-medium hover:underline"
                >
                  Cancellation Policy
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
                <FileText size={12} /> Read Key Disclosures & Compliance Summary
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
            {loading ? 'Creating account...' : `Register as ${selectedRole === 'editor' ? 'Chart Editor' : 'Subscriber'}`}
          </button>
        </form>

        <p className="text-center text-xs text-[var(--text-muted)] mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-[var(--accent-indigo)] font-medium hover:underline">
            Sign In
          </Link>
        </p>
      </motion.div>

      {/* Disclosures & Terms Summary Modal */}
      <AnimatePresence>
        {showTermsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] shadow-2xl flex flex-col max-h-[85vh] overflow-hidden"
            >
              <div className="p-4 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-tertiary)]">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="text-amber-400" size={18} />
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">
                    Legal & Compliance Disclosures
                  </h3>
                </div>
                <button
                  onClick={() => setShowTermsModal(false)}
                  className="p-1 rounded-md text-[var(--text-muted)] hover:text-white hover:bg-white/10"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-4 text-xs leading-relaxed text-[var(--text-secondary)]">
                <div className="p-3 rounded-lg border border-indigo-500/30 bg-indigo-500/10 space-y-1">
                  <p className="font-bold text-white">Operated by Vedgetechnologies</p>
                  <p className="text-[11px] text-indigo-200">
                    Trade Name: Vedgetechnologies &middot; Legal Name: Viknesh &middot; Registered Address: 4, Muslim Kallaray Street, Nethaji Nagar II, Uppalam, Puducherry – 605001, India.
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="font-bold text-[var(--text-primary)]">1. Educational Nature of Services</p>
                  <p>
                    Zonal Edge is an educational market analysis portal providing market structure models, zones, liquidation levels, and OI analytics for Indian equities and indices (Nifty, Sensex). It does NOT provide SEBI-registered advisory services or guaranteed trading returns.
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="font-bold text-[var(--text-primary)]">2. Refund Policy</p>
                  <p className="p-2.5 rounded bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] italic">
                    “All purchases and subscription payments made on Zonal Edge are final and non-refundable. Once a purchase is completed, no refunds will be issued. Users are advised to review the subscription plan and service details carefully before making a payment.”
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="font-bold text-[var(--text-primary)]">3. Cancellation Policy</p>
                  <p className="p-2.5 rounded bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] italic">
                    “Users can cancel their subscription at any time during the free trial period. Once the free trial ends and a paid subscription begins, the subscription payment is non-refundable. Users should review the applicable subscription terms before proceeding with payment.”
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="font-bold text-[var(--text-primary)]">4. Market Risk Acknowledgment</p>
                  <p>
                    Trading futures, options, and cash equities in the Indian markets carries substantial capital risk. You bear 100% individual responsibility for all trade executions.
                  </p>
                </div>
              </div>

              <div className="p-4 border-t border-[var(--border-subtle)] bg-[var(--bg-tertiary)] flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setAgreedTerms(true)
                    setShowTermsModal(false)
                  }}
                  className="px-4 py-2 rounded-md bg-[var(--accent-indigo)] text-white text-xs font-semibold hover:brightness-110"
                >
                  I Understand & Accept
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
