import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { motion } from 'framer-motion'
import { Mail, Lock, Loader2, Eye, EyeOff, AlertTriangle } from 'lucide-react'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        setError(signInError.message)
        return
      }

      if (data.user) {
        // Query user's profile role to route appropriately
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', data.user.id)
            .single()

          if (profile && ['super_admin', 'admin', 'analyst'].includes(profile.role)) {
            navigate('/dashboard')
          } else {
            navigate('/app')
          }
        } catch {
          // Fallback route
          navigate('/app')
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign in')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] p-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md p-6 sm:p-8 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] shadow-xl"
      >
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Welcome Back</h1>
          <p className="text-xs text-[var(--text-muted)] mt-1.5">
            Sign in to your Zonal Edge account
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-md bg-[var(--danger)]/10 border border-[var(--danger)]/20 text-[var(--danger)] text-xs flex items-start gap-2">
            <AlertTriangle size={15} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                size={16}
              />
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

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-[var(--text-secondary)]">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs text-[var(--accent-indigo)] hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                size={16}
              />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
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

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-md bg-[var(--accent-indigo)] text-white text-sm font-medium hover:brightness-110 transition-all flex items-center justify-center gap-2 mt-6 disabled:opacity-70 shadow-md"
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : null}
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-xs text-[var(--text-muted)] mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-[var(--accent-indigo)] font-medium hover:underline">
            Sign up
          </Link>
        </p>

        {/* Footer Links */}
        <div className="mt-8 pt-4 border-t border-[var(--border-subtle)] flex items-center justify-center gap-4 text-[11px] text-[var(--text-muted)]">
          <Link to="/terms" className="hover:text-white transition-colors">
            Terms of Service
          </Link>
          <span>&middot;</span>
          <Link to="/privacy" className="hover:text-white transition-colors">
            Privacy Policy
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
