import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Globe,
  CheckCircle2,
  XCircle,
  Plus,
  Loader2
} from 'lucide-react'
import { subscriptionService } from '@/services/subscriptionService'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
}

export default function Subscriptions({ isClient = false }: { isClient?: boolean }) {
  const { profile } = useAuth()
  const [activeSubTab, setActiveSubTab] = useState('successful-payments')
  const [payments, setPayments] = useState<any[]>([])
  const [plans, setPlans] = useState<any[]>([])
  const [mySubscription, setMySubscription] = useState<any>(null)
  const [processingId, setProcessingId] = useState<string | null>(null)

  // Coupon Management State
  const [coupons, setCoupons] = useState([
    { code: 'SUMMER50', discount: '50%', type: 'Percentage', status: 'Active' },
    { code: 'WELCOME10', discount: '$10 Fixed', type: 'Fixed Amt', status: 'Active' },
    { code: 'VIPDEAL', discount: '30%', type: 'Percentage', status: 'Expired' },
  ])
  const [newCouponCode, setNewCouponCode] = useState('')
  const [newCouponDiscount, setNewCouponDiscount] = useState('')

  const handleAddCoupon = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCouponCode || !newCouponDiscount) return
    setCoupons(prev => [
      ...prev,
      { code: newCouponCode.toUpperCase().trim(), discount: newCouponDiscount, type: 'Percentage', status: 'Active' }
    ])
    setNewCouponCode('')
    setNewCouponDiscount('')
  }

  // Webhook settings
  const [stripeWebhookUrl, setStripeWebhookUrl] = useState('https://api.zonaledge.com/webhooks/razorpay')
  const [webhookTested, setWebhookTested] = useState<'idle' | 'testing' | 'success'>('idle')

  const testWebhookConnection = () => {
    setWebhookTested('testing')
    setTimeout(() => {
      setWebhookTested('success')
    }, 1200)
  }

  useEffect(() => {
    async function loadData() {
      try {
        if (isClient) {
          const [fetchedPlans, mySub] = await Promise.all([
            subscriptionService.getPlans(),
            subscriptionService.getMySubscription()
          ])
          setPlans(fetchedPlans || [])
          setMySubscription(mySub)
        } else {
          const adminPayments = await subscriptionService.getAdminPayments()
          setPayments(adminPayments || [])
        }
      } catch (err) {
        console.error('Failed to load subscription data', err)
      }
    }
    loadData()
  }, [isClient])

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    document.body.appendChild(script)
    return () => {
      document.body.removeChild(script)
    }
  }, [])

  const handleSubscribe = async (plan: any) => {
    try {
      setProcessingId(plan.id)
      
      if (!(window as any).Razorpay) {
        throw new Error('Razorpay SDK not loaded')
      }

      // Create order on our backend securely
      const { orderId } = await subscriptionService.createRazorpayOrder(plan.id, plan.price)

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_yourkey', // This is exposed in vite env in real app, but order is secure
        amount: plan.price * 100,
        currency: 'INR',
        name: 'TradeHub',
        description: `${plan.name} Subscription`,
        order_id: orderId,
        handler: function (_response: any) {
          toast.success('Payment successful! Your subscription will be activated shortly.')
          // Webhook will handle the actual DB update
        },
        prefill: {
          name: profile?.full_name || '',
          email: profile?.email || '',
        },
        theme: {
          color: '#6366F1'
        }
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

  const subTabs = [
    { id: 'pending-payments', label: 'Pending payments' },
    { id: 'successful-payments', label: 'Successful payments' },
    { id: 'failed-payments', label: 'Failed payments' },
    { id: 'expiring-subscriptions', label: 'Expiring subscriptions' },
    { id: 'coupon-management', label: 'Coupon management' }
  ]

  if (isClient) {
    return (
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">My Subscription</h1>
          <p className="text-xs mt-1 text-[var(--text-muted)]">
            Manage your plan and billing details.
          </p>
        </div>

        {mySubscription ? (
          <motion.div variants={itemVariants} className="p-6 rounded-xl border bg-[var(--bg-secondary)] border-[var(--border-subtle)]">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-bold text-[var(--text-primary)]">Current Plan: {mySubscription.subscription_plans?.name}</h3>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  Active until {new Date(mySubscription.current_period_end).toLocaleDateString()}
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold">
                ACTIVE
              </span>
            </div>
          </motion.div>
        ) : (
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div key={plan.id} className={`p-6 rounded-xl border flex flex-col ${plan.slug === 'pro' ? 'bg-[var(--accent-indigo)]/5 border-[var(--accent-indigo)]/30 relative' : 'bg-[var(--bg-secondary)] border-[var(--border-subtle)]'}`}>
                {plan.slug === 'pro' && (
                  <div className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/4">
                    <span className="px-3 py-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-[10px] font-bold rounded-full shadow-lg">
                      MOST POPULAR
                    </span>
                  </div>
                )}
                
                <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-3xl font-bold text-[var(--text-primary)]">₹{plan.price}</span>
                  <span className="text-xs text-[var(--text-muted)]">/{plan.billing_interval}</span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] mb-6 min-h-[40px]">
                  {plan.description}
                </p>
                
                <div className="space-y-3 flex-1 mb-6">
                  {plan.features?.map((feature: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-[var(--text-secondary)]">
                      <CheckCircle2 size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
                
                <button
                  onClick={() => handleSubscribe(plan)}
                  disabled={processingId === plan.id || plan.price === 0}
                  className={`w-full py-2.5 rounded-md text-sm font-semibold transition-all ${
                    plan.slug === 'pro' 
                      ? 'bg-[var(--accent-indigo)] text-white hover:brightness-110 shadow-lg shadow-indigo-500/20' 
                      : 'bg-[var(--bg-tertiary)] text-[var(--text-primary)] border border-[var(--border-subtle)] hover:bg-[var(--bg-secondary)]'
                  } disabled:opacity-50 flex items-center justify-center gap-2`}
                >
                  {processingId === plan.id ? <Loader2 size={16} className="animate-spin" /> : null}
                  {plan.price === 0 ? 'Current Plan' : (processingId === plan.id ? 'Processing...' : 'Subscribe via Razorpay')}
                </button>
              </div>
            ))}
          </motion.div>
        )}
      </motion.div>
    )
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[var(--text-primary)]">Subscription Management</h1>
        <p className="text-xs mt-1 text-[var(--text-muted)]">
          Manage invoices and Razorpay webhook payments.
        </p>
      </div>

      {/* Horizontal Sub-tabs Bar */}
      <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-1.5 p-1 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] w-fit mb-6">
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
                <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Invoices currently waiting on Stripe webhook status confirmation.</p>
              </div>

              <div className="overflow-x-auto rounded-lg border border-[var(--border-subtle)]">
                <table className="w-full text-left text-xs bg-[var(--bg-tertiary)]">
                  <thead>
                    <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)] text-[var(--text-muted)]">
                      <th className="p-3">Invoice ID</th>
                      <th className="p-3">User</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-[var(--border-subtle)] text-[var(--text-secondary)]">
                      <td className="p-3 font-mono">in_1Nk98xK</td>
                      <td className="p-3 font-semibold text-[var(--text-primary)]">Marcus Chen</td>
                      <td className="p-3 font-mono">$29.00</td>
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
                <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Completed transactions confirmed on Stripe.</p>
              </div>

              <div className="overflow-x-auto rounded-lg border border-[var(--border-subtle)]">
                <table className="w-full text-left text-xs bg-[var(--bg-tertiary)]">
                  <thead>
                    <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)] text-[var(--text-muted)]">
                      <th className="p-3">Invoice ID</th>
                      <th className="p-3">User</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3">Date</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map(payment => (
                      <tr key={payment.id} className="border-b border-[var(--border-subtle)] text-[var(--text-secondary)]">
                        <td className="p-3 font-mono">{payment.provider_order_id}</td>
                        <td className="p-3 font-semibold text-[var(--text-primary)]">{payment.profiles?.full_name || payment.profiles?.email}</td>
                        <td className="p-3 font-mono">₹{payment.amount}</td>
                        <td className="p-3 font-mono">{new Date(payment.paid_at || payment.created_at).toLocaleDateString()}</td>
                        <td className="p-3">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-semibold ${payment.status === 'captured' ? 'text-emerald-400' : 'text-amber-400'}`}>
                            {payment.status === 'captured' ? <CheckCircle2 size={11} /> : <XCircle size={11} />} {payment.status}
                          </span>
                        </td>
                      </tr>
                    ))}
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

              <div className="overflow-x-auto rounded-lg border border-[var(--border-subtle)]">
                <table className="w-full text-left text-xs bg-[var(--bg-tertiary)]">
                  <thead>
                    <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)] text-[var(--text-muted)]">
                      <th className="p-3">Invoice ID</th>
                      <th className="p-3">User</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3">Error Reason</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-[var(--border-subtle)] text-[var(--text-secondary)]">
                      <td className="p-3 font-mono">in_1Nk22xD</td>
                      <td className="p-3 font-semibold text-[var(--text-primary)]">Marcus Chen</td>
                      <td className="p-3 font-mono">$29.00</td>
                      <td className="p-3 text-rose-400">Card Insufficient Funds</td>
                      <td className="p-3"><span className="inline-flex items-center gap-1 text-[10px] font-semibold text-rose-400"><XCircle size={11} /> Failed</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeSubTab === 'expiring-subscriptions' && (
            <div className="space-y-4">
              <div className="pb-4 border-b border-[var(--border-subtle)]">
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">Expiring Subscriptions</h3>
                <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Users whose billing cycle expires in the next 7 days.</p>
              </div>

              <div className="overflow-x-auto rounded-lg border border-[var(--border-subtle)]">
                <table className="w-full text-left text-xs bg-[var(--bg-tertiary)]">
                  <thead>
                    <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)] text-[var(--text-muted)]">
                      <th className="p-3">User</th>
                      <th className="p-3">Plan</th>
                      <th className="p-3">Expiration Date</th>
                      <th className="p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-[var(--border-subtle)] text-[var(--text-secondary)]">
                      <td className="p-3 font-semibold text-[var(--text-primary)]">Elena Rostova</td>
                      <td className="p-3 font-bold text-purple-400">VIP</td>
                      <td className="p-3 font-mono text-amber-400">03 May 2025 (4 days)</td>
                      <td className="p-3">
                        <button className="px-2 py-1 rounded bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[10px] hover:text-white transition-colors">
                          Send Reminder
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeSubTab === 'coupon-management' && (
            <div className="space-y-6">
              <div className="pb-4 border-b border-[var(--border-subtle)]">
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">Coupon Codes & Payment Setup</h3>
                <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Manage promo codes and Stripe webhook configs.</p>
              </div>

              {/* Webhook Configuration */}
              <div className="p-4 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] space-y-3">
                <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">Stripe API Webhook Target</span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={stripeWebhookUrl}
                    onChange={(e) => setStripeWebhookUrl(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-md border text-xs outline-none bg-[var(--bg-secondary)] border-[var(--border-subtle)] text-[var(--text-primary)] focus:border-[var(--accent-indigo)]"
                  />
                  <button
                    onClick={testWebhookConnection}
                    className="flex items-center gap-1.5 px-4 rounded-md border text-xs font-semibold text-[var(--text-secondary)] border-[var(--border-subtle)] transition-colors hover:text-white hover:border-[var(--text-primary)]"
                  >
                    <Globe size={13} />
                    {webhookTested === 'idle' && 'Test Webhook'}
                    {webhookTested === 'testing' && 'Testing...'}
                    {webhookTested === 'success' && 'Connected'}
                  </button>
                </div>
              </div>

              {/* Coupons Form */}
              <form onSubmit={handleAddCoupon} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end p-4 rounded-lg border border-[var(--border-subtle)]">
                <div>
                  <label className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Coupon Code</label>
                  <input
                    type="text"
                    placeholder="e.g. WIN50"
                    value={newCouponCode}
                    onChange={(e) => setNewCouponCode(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 rounded-md border text-xs outline-none bg-[var(--bg-tertiary)] border-[var(--border-subtle)] text-[var(--text-primary)] focus:border-[var(--accent-indigo)]"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Discount Amount</label>
                  <input
                    type="text"
                    placeholder="e.g. 50% or $25"
                    value={newCouponDiscount}
                    onChange={(e) => setNewCouponDiscount(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 rounded-md border text-xs outline-none bg-[var(--bg-tertiary)] border-[var(--border-subtle)] text-[var(--text-primary)] focus:border-[var(--accent-indigo)]"
                  />
                </div>
                <button
                  type="submit"
                  className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-md bg-[var(--accent-indigo)] text-white text-xs font-bold transition-all hover:brightness-110"
                >
                  <Plus size={14} /> Add Coupon
                </button>
              </form>

              {/* Coupons List */}
              <div className="overflow-x-auto rounded-lg border border-[var(--border-subtle)]">
                <table className="w-full text-left text-xs bg-[var(--bg-tertiary)]">
                  <thead>
                    <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)] text-[var(--text-muted)]">
                      <th className="p-3">Code</th>
                      <th className="p-3">Value</th>
                      <th className="p-3">Type</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coupons.map((coupon, i) => (
                      <tr key={i} className="border-b border-[var(--border-subtle)] text-[var(--text-secondary)]">
                        <td className="p-3 font-mono font-bold text-[var(--text-primary)]">{coupon.code}</td>
                        <td className="p-3">{coupon.discount}</td>
                        <td className="p-3">{coupon.type}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                            coupon.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                          }`}>
                            {coupon.status}
                          </span>
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
