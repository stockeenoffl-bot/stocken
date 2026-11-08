import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Globe,
  CheckCircle2,
  XCircle,
  Plus,
  Loader2,
  Trash2,
  Calendar,
  Clock,
  ShieldCheck,
  RotateCcw,
  AlertTriangle,
  Lock,
  ArrowRight,
  Sparkles,
} from 'lucide-react'
import { subscriptionService, COMPLIANCE_PLANS, type SubscriptionPlan } from '@/services/subscriptionService'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'
import { Link } from 'react-router-dom'

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
}

export default function Subscriptions({ isClient = false }: { isClient?: boolean }) {
  const { profile, hasAdminAccess, isEditor } = useAuth()
  const [activeSubTab, setActiveSubTab] = useState('successful-payments')
  const [payments, setPayments] = useState<any[]>([])
  const [plans, setPlans] = useState<SubscriptionPlan[]>(COMPLIANCE_PLANS)
  const [mySubscription, setMySubscription] = useState<any>(null)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [cancelling, setCancelling] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)

  // Coupon Management State
  const [coupons, setCoupons] = useState([
    { code: 'SUMMER50', discount: '50%', type: 'Percentage', status: 'Active' },
    { code: 'WELCOME10', discount: '₹100 Fixed', type: 'Fixed Amt', status: 'Active' },
    { code: 'VIPDEAL', discount: '30%', type: 'Percentage', status: 'Expired' },
  ])
  const [newCouponCode, setNewCouponCode] = useState('')
  const [newCouponDiscount, setNewCouponDiscount] = useState('')

  const handleAddCoupon = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCouponCode || !newCouponDiscount) return
    setCoupons((prev) => [
      ...prev,
      { code: newCouponCode.toUpperCase().trim(), discount: newCouponDiscount, type: 'Percentage', status: 'Active' },
    ])
    setNewCouponCode('')
    setNewCouponDiscount('')
    toast.success(`Coupon ${newCouponCode.toUpperCase().trim()} added!`)
  }

  const handleDeleteCoupon = (code: string) => {
    setCoupons((prev) => prev.filter((c) => c.code !== code))
    toast.success(`Coupon ${code} removed`)
  }

  const handleToggleCouponStatus = (code: string) => {
    setCoupons((prev) =>
      prev.map((c) => (c.code === code ? { ...c, status: c.status === 'Active' ? 'Expired' : 'Active' } : c))
    )
    toast.success(`Coupon status updated`)
  }

  useEffect(() => {
    async function loadData() {
      try {
        if (isClient) {
          const [fetchedPlans, mySub] = await Promise.all([
            subscriptionService.getPlans(),
            subscriptionService.getMySubscription(),
          ])
          setPlans(fetchedPlans && fetchedPlans.length > 0 ? fetchedPlans : COMPLIANCE_PLANS)
          setMySubscription(mySub)
        } else {
          if (hasAdminAccess) {
            const adminPayments = await subscriptionService.getAdminPayments()
            setPayments(adminPayments || [])
          }
        }
      } catch (err) {
        console.error('Failed to load subscription data', err)
      }
    }
    loadData()
  }, [isClient, hasAdminAccess])

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    document.body.appendChild(script)
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script)
      }
    }
  }, [])

  const handleSubscribe = async (plan: SubscriptionPlan) => {
    if (plan.price === 0) {
      toast.info('You already have active access to the 7-Day Free Trial!')
      return
    }

    try {
      setProcessingId(plan.id)

      if (!(window as any).Razorpay) {
        toast.info(`Checkout initiated for ${plan.name} (₹${plan.price.toLocaleString('en-IN')}). Gateway connecting...`)
        return
      }

      // Create order securely via backend
      const { orderId } = await subscriptionService.createRazorpayOrder(plan.id, plan.price)

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_placeholder',
        amount: plan.price * 100,
        currency: 'INR',
        name: 'Zonal Edge',
        description: `${plan.name} (${plan.billing_interval})`,
        order_id: orderId,
        handler: function (_response: any) {
          toast.success('Payment captured! Your subscription has been upgraded successfully.')
          subscriptionService.getMySubscription().then((sub) => setMySubscription(sub))
        },
        prefill: {
          name: profile?.full_name || '',
          email: profile?.email || '',
        },
        theme: {
          color: '#6366F1',
        },
      }

      const rzp = new (window as any).Razorpay(options)
      rzp.on('payment.failed', function (response: any) {
        toast.error(`Payment failed: ${response.error.description}`)
      })
      rzp.open()
    } catch (err: any) {
      toast.error(err.message || 'Failed to initiate checkout')
    } finally {
      setProcessingId(null)
    }
  }

  const handleCancelSubscription = async () => {
    if (!mySubscription) return
    setCancelling(true)
    try {
      await subscriptionService.cancelSubscription(mySubscription.id)
      setMySubscription((prev: any) => ({ ...prev, cancel_at_period_end: true, status: 'cancelled' }))
      toast.success('Subscription cancellation recorded. Access remains active until period end.')
      setShowCancelModal(false)
    } catch (err: any) {
      toast.error('Failed to cancel subscription: ' + err.message)
    } finally {
      setCancelling(false)
    }
  }

  // If Editor is viewing the admin subscriptions page, block access:
  if (!isClient && isEditor && !hasAdminAccess) {
    return (
      <div className="p-8 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] text-center max-w-xl mx-auto space-y-4">
        <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto">
          <Lock size={24} />
        </div>
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Restricted Access</h2>
        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
          Customer subscription data and payment revenue records are confidential and restricted to the Super Administrator.
        </p>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--accent-indigo)] text-white text-xs font-semibold hover:brightness-110"
        >
          Return to Dashboard
        </Link>
      </div>
    )
  }

  const subTabs = [
    { id: 'pending-payments', label: 'Pending payments' },
    { id: 'successful-payments', label: 'Successful payments' },
    { id: 'failed-payments', label: 'Failed payments' },
    { id: 'coupon-management', label: 'Coupon management' },
  ]

  // SUBSCRIBER CLIENT VIEW
  if (isClient) {
    const startDate = mySubscription?.current_period_start
      ? new Date(mySubscription.current_period_start).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      : new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

    const endDate = mySubscription?.current_period_end
      ? new Date(mySubscription.current_period_end).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

    const isCancelled = mySubscription?.cancel_at_period_end || mySubscription?.status === 'cancelled'
    const planName = mySubscription?.subscription_plans?.name || 'Free Trial – 7 Days'

    return (
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">My Subscription & Profile</h1>
          <p className="text-xs mt-1 text-[var(--text-muted)]">
            Manage your active plan, track validity dates, or upgrade your membership.
          </p>
        </div>

        {/* Current Subscription Card */}
        <motion.div
          variants={itemVariants}
          className="p-5 sm:p-6 rounded-2xl border bg-[var(--bg-secondary)] border-[var(--border-subtle)] shadow-sm space-y-4"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-subtle)]">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-bold text-[var(--text-primary)]">{planName}</span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                    isCancelled
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                      : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  }`}
                >
                  {isCancelled ? 'CANCELLED (Active until expiry)' : 'ACTIVE'}
                </span>
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                Account Email: <strong className="text-[var(--text-secondary)]">{profile?.email}</strong>
              </p>
            </div>

            {!isCancelled && (
              <button
                onClick={() => setShowCancelModal(true)}
                className="px-3 py-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-300 text-xs font-semibold hover:bg-rose-500/20 transition-all self-start sm:self-auto"
              >
                Cancel Subscription
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
            <div className="p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-subtle)]">
              <span className="text-[10px] text-[var(--text-muted)] font-semibold uppercase block">Start Date</span>
              <div className="flex items-center gap-1.5 mt-1 text-xs font-mono font-bold text-[var(--text-primary)]">
                <Calendar size={13} className="text-indigo-400" />
                <span>{startDate}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-subtle)]">
              <span className="text-[10px] text-[var(--text-muted)] font-semibold uppercase block">Expiry / End Date</span>
              <div className="flex items-center gap-1.5 mt-1 text-xs font-mono font-bold text-[var(--text-primary)]">
                <Clock size={13} className="text-amber-400" />
                <span>{endDate}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-subtle)]">
              <span className="text-[10px] text-[var(--text-muted)] font-semibold uppercase block">Currency & Billing</span>
              <div className="flex items-center gap-1.5 mt-1 text-xs font-mono font-bold text-emerald-400">
                <ShieldCheck size={13} />
                <span>INR (₹) &middot; Pre-paid</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Free Trial Expiration Notice */}
        <div className="p-4 rounded-xl border border-indigo-500/30 bg-indigo-500/10 text-xs text-indigo-200 leading-relaxed flex items-start gap-3">
          <Sparkles size={18} className="text-indigo-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-white block font-semibold mb-0.5">Free Trial & Expiration Terms</strong>
            Your complimentary trial gives 7 days of full analytical access. Once the free trial period ends, access to daily zones, liquidation levels, and OI models will be paused until an active plan is purchased. No automatic surprise deductions will ever occur.
          </div>
        </div>

        {/* Products & Plans Grid (All 4 Plans in INR) */}
        <div className="space-y-3 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h2 className="text-lg font-bold text-[var(--text-primary)]">Available Subscription Plans</h2>
            <span className="text-xs text-[var(--text-muted)]">All prices displayed in Indian Rupees (INR)</span>
          </div>

          <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {plans.map((plan) => {
              const isCurrent = plan.name === planName || (plan.price === 0 && planName.includes('Free Trial'))
              return (
                <div
                  key={plan.id}
                  className={`p-5 rounded-2xl border flex flex-col justify-between transition-all relative ${
                    plan.slug === 'monthly'
                      ? 'bg-indigo-500/10 border-indigo-500/40 shadow-lg'
                      : 'bg-[var(--bg-secondary)] border-[var(--border-subtle)]'
                  }`}
                >
                  {plan.slug === 'monthly' && (
                    <div className="absolute -top-2.5 right-4">
                      <span className="px-2.5 py-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-[9px] font-black rounded-full uppercase tracking-wider shadow">
                        POPULAR
                      </span>
                    </div>
                  )}

                  <div>
                    <h3 className="text-base font-bold text-[var(--text-primary)] mb-1">{plan.name}</h3>
                    <p className="text-[11px] text-[var(--text-muted)] mb-3 min-h-[32px] leading-tight">
                      {plan.description}
                    </p>

                    <div className="flex items-baseline gap-1 mb-4 pb-3 border-b border-[var(--border-subtle)]">
                      <span className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)]">
                        ₹{plan.price.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[11px] text-[var(--text-muted)]">/{plan.billing_interval}</span>
                    </div>

                    <div className="space-y-2 mb-6">
                      {plan.features?.map((feature: string, idx: number) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-[var(--text-secondary)]">
                          <CheckCircle2 size={13} className="text-emerald-400 shrink-0 mt-0.5" />
                          <span className="leading-tight">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <button
                      onClick={() => handleSubscribe(plan)}
                      disabled={processingId === plan.id || isCurrent}
                      className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                        isCurrent
                          ? 'bg-[var(--bg-tertiary)] text-[var(--text-muted)] border border-[var(--border-subtle)] cursor-default'
                          : plan.slug === 'monthly'
                          ? 'bg-[var(--accent-indigo)] text-white hover:brightness-110 shadow-md'
                          : 'bg-[var(--bg-tertiary)] text-white border border-[var(--border-subtle)] hover:border-[var(--accent-indigo)]'
                      } disabled:opacity-60`}
                    >
                      {processingId === plan.id ? <Loader2 size={14} className="animate-spin" /> : null}
                      {isCurrent ? 'Current Active Plan' : `Upgrade to ${plan.name}`}
                    </button>
                    <p className="text-[9px] text-center text-[var(--text-muted)] mt-1.5">
                      {plan.price === 0 ? 'Full 7-Day Access' : 'Secure Razorpay Checkout'}
                    </p>
                  </div>
                </div>
              )
            })}
          </motion.div>
        </div>

        {/* MANDATORY PRE-CHECKOUT COMPLIANCE POLICIES */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
          {/* Refund Policy Card */}
          <div className="p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] space-y-2">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider">
              <RotateCcw size={14} />
              <span>Return & Refund Policy</span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed italic bg-[var(--bg-tertiary)] p-3 rounded-xl border border-[var(--border-subtle)]">
              “All purchases and subscription payments made on Zonal Edge are final and non-refundable. Once a purchase is completed, no refunds will be issued. Users are advised to review the subscription plan and service details carefully before making a payment.”
            </p>
            <div className="text-[11px] text-[var(--text-muted)] flex justify-between items-center pt-1">
              <span>Non-refundable digital analytics.</span>
              <Link to="/refund-policy" className="text-[var(--accent-indigo)] hover:underline">
                Read Full Refund Policy &rarr;
              </Link>
            </div>
          </div>

          {/* Cancellation Policy Card */}
          <div className="p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
              <Clock size={14} />
              <span>Cancellation Policy</span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed italic bg-[var(--bg-tertiary)] p-3 rounded-xl border border-[var(--border-subtle)]">
              “Users can cancel their subscription at any time during the free trial period. Once the free trial ends and a paid subscription begins, the subscription payment is non-refundable. Users should review the applicable subscription terms before proceeding with payment.”
            </p>
            <div className="text-[11px] text-[var(--text-muted)] flex justify-between items-center pt-1">
              <span>Instant 1-click self cancellation.</span>
              <Link to="/cancellation-policy" className="text-[var(--accent-indigo)] hover:underline">
                Read Cancellation Terms &rarr;
              </Link>
            </div>
          </div>
        </div>

        {/* Cancellation Confirmation Modal */}
        <AnimatePresence>
          {showCancelModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-md rounded-2xl border p-6 bg-[var(--bg-secondary)] border-[var(--border-subtle)] shadow-2xl space-y-4"
              >
                <div className="flex items-center gap-2 text-rose-400">
                  <AlertTriangle size={20} />
                  <h3 className="text-base font-bold text-white">Confirm Subscription Cancellation</h3>
                </div>

                <div className="text-xs text-[var(--text-secondary)] leading-relaxed space-y-2">
                  <p>
                    Are you sure you wish to cancel your subscription to <strong>{planName}</strong>?
                  </p>
                  <p className="p-3 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] text-[11px]">
                    <strong>Effective Timing:</strong> You can cancel your subscription at any time during the free trial period. Once cancelled, your analytical access will remain valid until <strong>{endDate}</strong>, and you will not be billed thereafter.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCancelModal(false)}
                    className="px-4 py-2 rounded-lg text-xs font-semibold bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-white"
                  >
                    Keep Subscription
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelSubscription}
                    disabled={cancelling}
                    className="px-4 py-2 rounded-lg text-xs font-bold bg-rose-500 text-white hover:bg-rose-600 flex items-center gap-1.5"
                  >
                    {cancelling ? <Loader2 size={13} className="animate-spin" /> : null}
                    <span>{cancelling ? 'Cancelling...' : 'Confirm Cancellation'}</span>
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    )
  }

  // SUPER ADMIN BILLING MANAGEMENT VIEW
  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[var(--text-primary)]">Subscription & Billing Management</h1>
        <p className="text-xs mt-1 text-[var(--text-muted)]">
          Manage invoices, incoming Razorpay webhook captures, and promotional coupons.
        </p>
      </div>

      {/* Horizontal Sub-tabs Bar */}
      <motion.div
        variants={itemVariants}
        className="flex flex-wrap items-center gap-1.5 p-1 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] w-fit mb-6"
      >
        {subTabs.map((sub) => {
          const isSubActive = activeSubTab === sub.id
          return (
            <button
              key={sub.id}
              onClick={() => setActiveSubTab(sub.id)}
              className="px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200"
              style={{
                backgroundColor: isSubActive ? 'var(--accent-indigo)' : 'transparent',
                color: isSubActive ? '#fff' : 'var(--text-secondary)',
              }}
            >
              {sub.label}
            </button>
          )
        })}
      </motion.div>

      {/* Details Area */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSubTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="rounded-xl border p-6 bg-[var(--bg-secondary)] border-[var(--border-subtle)] space-y-6"
        >
          {activeSubTab === 'pending-payments' && (
            <div className="space-y-4">
              <div className="pb-4 border-b border-[var(--border-subtle)]">
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">Pending Payments</h3>
                <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
                  Orders awaiting confirmation from the payment gateway.
                </p>
              </div>

              <div className="overflow-x-auto rounded-lg border border-[var(--border-subtle)]">
                <table className="w-full text-left text-xs bg-[var(--bg-tertiary)]">
                  <thead>
                    <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)] text-[var(--text-muted)]">
                      <th className="p-3">Order ID</th>
                      <th className="p-3">User</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-[var(--border-subtle)] text-[var(--text-secondary)]">
                      <td className="p-3 font-mono">order_pending_1</td>
                      <td className="p-3 font-semibold text-[var(--text-primary)]">Sample Subscriber</td>
                      <td className="p-3 font-mono">₹499.00</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-500/10 text-amber-400">
                          Pending
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeSubTab === 'successful-payments' && (
            <div className="space-y-4">
              <div className="pb-4 border-b border-[var(--border-subtle)]">
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">Successful Payments</h3>
                <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
                  Completed transactions confirmed on Razorpay.
                </p>
              </div>

              <div className="overflow-x-auto rounded-lg border border-[var(--border-subtle)]">
                <table className="w-full text-left text-xs bg-[var(--bg-tertiary)]">
                  <thead>
                    <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)] text-[var(--text-muted)]">
                      <th className="p-3">Order ID</th>
                      <th className="p-3">User</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3">Date</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.length > 0 ? (
                      payments.map((payment) => (
                        <tr key={payment.id} className="border-b border-[var(--border-subtle)] text-[var(--text-secondary)]">
                          <td className="p-3 font-mono">{payment.provider_order_id || payment.id}</td>
                          <td className="p-3 font-semibold text-[var(--text-primary)]">
                            {payment.profiles?.full_name || payment.profiles?.email || 'Customer'}
                          </td>
                          <td className="p-3 font-mono">₹{payment.amount}</td>
                          <td className="p-3 font-mono">
                            {new Date(payment.paid_at || payment.created_at).toLocaleDateString()}
                          </td>
                          <td className="p-3">
                            <span
                              className={`inline-flex items-center gap-1 text-[10px] font-semibold ${
                                payment.status === 'captured' ? 'text-emerald-400' : 'text-amber-400'
                              }`}
                            >
                              {payment.status === 'captured' ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
                              {payment.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="p-6 text-center text-[var(--text-muted)]">
                          No recent transactions recorded.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeSubTab === 'failed-payments' && (
            <div className="space-y-4">
              <div className="pb-4 border-b border-[var(--border-subtle)]">
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">Failed Payments</h3>
                <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Rejected card transactions or expired checkouts.</p>
              </div>
              <div className="p-6 text-center text-xs text-[var(--text-muted)]">No failed payments recorded.</div>
            </div>
          )}

          {activeSubTab === 'coupon-management' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-4 border-b border-[var(--border-subtle)]">
                <div>
                  <h3 className="text-sm font-semibold text-[var(--text-primary)]">Promotional Coupons</h3>
                  <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Create and manage coupon discounts.</p>
                </div>

                <form onSubmit={handleAddCoupon} className="flex flex-wrap items-center gap-2">
                  <input
                    type="text"
                    placeholder="CODE"
                    value={newCouponCode}
                    onChange={(e) => setNewCouponCode(e.target.value)}
                    className="w-24 px-2 py-1 rounded border text-xs bg-[var(--bg-tertiary)] border-[var(--border-subtle)] text-[var(--text-primary)]"
                  />
                  <input
                    type="text"
                    placeholder="Discount (e.g. 20%)"
                    value={newCouponDiscount}
                    onChange={(e) => setNewCouponDiscount(e.target.value)}
                    className="w-32 px-2 py-1 rounded border text-xs bg-[var(--bg-tertiary)] border-[var(--border-subtle)] text-[var(--text-primary)]"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1 rounded bg-[var(--accent-indigo)] text-white text-xs font-semibold hover:brightness-110 flex items-center gap-1"
                  >
                    <Plus size={12} /> Add
                  </button>
                </form>
              </div>

              <div className="overflow-x-auto rounded-lg border border-[var(--border-subtle)]">
                <table className="w-full text-left text-xs bg-[var(--bg-tertiary)]">
                  <thead>
                    <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)] text-[var(--text-muted)]">
                      <th className="p-3">Coupon Code</th>
                      <th className="p-3">Discount</th>
                      <th className="p-3">Type</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coupons.map((coupon) => (
                      <tr key={coupon.code} className="border-b border-[var(--border-subtle)] text-[var(--text-secondary)]">
                        <td className="p-3 font-mono font-bold text-[var(--text-primary)]">{coupon.code}</td>
                        <td className="p-3 font-mono">{coupon.discount}</td>
                        <td className="p-3">{coupon.type}</td>
                        <td className="p-3">
                          <button
                            onClick={() => handleToggleCouponStatus(coupon.code)}
                            className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                              coupon.status === 'Active'
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : 'bg-rose-500/10 text-rose-400'
                            }`}
                          >
                            {coupon.status}
                          </button>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleDeleteCoupon(coupon.code)}
                            className="text-rose-400 hover:text-rose-300 p-1"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  )
}
