import { supabase } from '@/lib/supabase'

export const userService = {
  async getDashboardStats() {
    // In a real app, you would use an RPC call or edge function to aggregate these securely
    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })

    const { count: proUsers } = await supabase
      .from('subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')
      // Note: Needs a join with subscription_plans to check if it's PRO

    return {
      totalUsers: totalUsers || 0,
      proUsers: proUsers || 0,
    }
  },

  async getAllUsers() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*, subscriptions(*, subscription_plans(*))')
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) throw error
    return data
  },

  async updateUserStatus(userId: string, status: string) {
    const { data, error } = await supabase
      .from('profiles')
      .update({ status })
      .eq('id', userId)

    if (error) throw error
    return data
  },

  async updateUserPlan(userId: string, planSlug: string) {
    // 1. Get plan id from slug
    const { data: planData, error: planError } = await supabase
      .from('subscription_plans')
      .select('id')
      .eq('slug', planSlug.toLowerCase())
      .single()
      
    if (planError) throw planError

    // 2. Upsert subscription
    const { data, error } = await supabase
      .from('subscriptions')
      .upsert({
        user_id: userId,
        plan_id: planData.id,
        status: 'active',
        current_period_end: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(), // Give 1 year access
        auto_renew: false
      }, { onConflict: 'user_id' })

    if (error) throw error
    return data
  }
}
