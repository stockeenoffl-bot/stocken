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
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) throw error
    return data
  }
}
