import { supabase } from '@/lib/supabase'

export const subscriptionService = {
  async getPlans() {
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('active', true)
      .order('sort_order', { ascending: true })

    if (error) throw error
    return data
  },

  async createRazorpayOrder(planId: string, amount: number) {
    const { data, error } = await supabase.functions.invoke('create-razorpay-order', {
      body: { planId, amount }
    })

    if (error) throw error
    return data
  },

  async getMySubscription() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('subscriptions')
      .select('*, subscription_plans(*)')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle()
      
    if (error) throw error
    return data
  },
  
  async getAdminPayments() {
    const { data, error } = await supabase
      .from('payments')
      .select('*, profiles(full_name, email)')
      .order('created_at', { ascending: false })
      .limit(50)
      
    if (error) throw error
    return data
  }
}
