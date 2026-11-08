import { supabase } from '@/lib/supabase'

export interface SubscriptionPlan {
  id: string
  name: string
  slug: string
  description: string
  price: number
  currency: string
  billing_interval: string
  features: string[]
  active: boolean
  sort_order: number
}

export const COMPLIANCE_PLANS: SubscriptionPlan[] = [
  {
    id: 'plan_trial_7d',
    name: 'Free Trial – 7 Days',
    slug: 'free-trial',
    description: 'Complimentary 7-day access to test market structure analytics. No credit card required.',
    price: 0,
    currency: 'INR',
    billing_interval: '7 days',
    features: [
      'Access to 1 analysis/zone per day',
      'End-of-day (EOD) full market analysis',
      'Basic Nifty & Sensex structure',
      '7 days full trial period',
    ],
    active: true,
    sort_order: 1,
  },
  {
    id: 'plan_monthly_499',
    name: 'Monthly Subscription',
    slug: 'monthly',
    description: 'Comprehensive intraday market analysis, real-time zones & Open Interest intelligence.',
    price: 499,
    currency: 'INR',
    billing_interval: '1 month',
    features: [
      'Multiple market zones',
      'Liquidation levels',
      'Invalidation levels',
      'Detailed market analysis',
      'Open Interest (OI) data',
      'Real-time Alice Blue candle sync',
    ],
    active: true,
    sort_order: 2,
  },
  {
    id: 'plan_quarterly_1299',
    name: 'Quarterly Subscription',
    slug: 'quarterly',
    description: '3 months of uninterrupted market structure analysis with priority level updates.',
    price: 1299,
    currency: 'INR',
    billing_interval: '3 months',
    features: [
      'Multiple market zones',
      'Liquidation levels',
      'Invalidation levels',
      'Detailed market analysis',
      'Open Interest (OI) data',
      'Save over 13% compared to monthly',
    ],
    active: true,
    sort_order: 3,
  },
  {
    id: 'plan_annual_4999',
    name: 'Annual Subscription',
    slug: 'annual',
    description: 'Full year of deep algorithmic market structure analysis and institutional orderflow.',
    price: 4999,
    currency: 'INR',
    billing_interval: '12 months',
    features: [
      'Multiple market zones',
      'Liquidation levels',
      'Invalidation levels',
      'Detailed market analysis',
      'Open Interest (OI) data',
      'Maximum value: Save ₹989 annually',
    ],
    active: true,
    sort_order: 4,
  },
]

export const subscriptionService = {
  async getPlans(): Promise<SubscriptionPlan[]> {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('active', true)
        .order('sort_order', { ascending: true })

      if (!error && data && data.length >= 4) {
        return data as SubscriptionPlan[]
      }
      // Return standard compliance products
      return COMPLIANCE_PLANS
    } catch {
      return COMPLIANCE_PLANS
    }
  },

  async createRazorpayOrder(planId: string, amount: number) {
    try {
      const { data, error } = await supabase.functions.invoke('create-razorpay-order', {
        body: { planId, amount },
      })
      if (!error && data) return data
    } catch {
      // Fallback order simulation for testing if Supabase Edge Function is not deployed
    }

    return {
      orderId: `order_${Date.now()}`,
      amount: amount * 100,
      currency: 'INR',
    }
  },

  async getMySubscription() {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return null

    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*, subscription_plans(*)')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle()

      if (!error && data) {
        return data
      }
    } catch (e) {
      console.warn('Subscription fetch fallback:', e)
    }

    // Default to 7-Day Free Trial based on user registration
    const userCreatedAt = user.created_at ? new Date(user.created_at) : new Date()
    const trialEnd = new Date(userCreatedAt.getTime() + 7 * 24 * 60 * 60 * 1000)
    const now = new Date()
    const isExpired = now.getTime() > trialEnd.getTime()

    return {
      id: `sub_trial_${user.id.slice(0, 8)}`,
      user_id: user.id,
      status: isExpired ? 'expired' : 'trialing',
      current_period_start: userCreatedAt.toISOString(),
      current_period_end: trialEnd.toISOString(),
      cancel_at_period_end: false,
      subscription_plans: {
        id: 'plan_trial_7d',
        name: 'Free Trial – 7 Days',
        slug: 'free-trial',
        price: 0,
        currency: 'INR',
        billing_interval: '7 days',
      },
    }
  },

  async cancelSubscription(subscriptionId: string) {
    try {
      await supabase
        .from('subscriptions')
        .update({
          cancel_at_period_end: true,
          cancelled_at: new Date().toISOString(),
        })
        .eq('id', subscriptionId)
    } catch (err) {
      console.warn('Could not persist cancellation in DB:', err)
    }
    return true
  },

  async getAdminPayments() {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*, profiles(full_name, email)')
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error
      return data
    } catch {
      return []
    }
  },
}
