import { supabase } from '@/lib/supabase'

export interface AppNotification {
  id: string
  user_id: string
  title: string
  message: string
  is_read: boolean
  type: string
  link_url?: string
  created_at: string
}

export const notificationService = {
  async getMyNotifications(): Promise<AppNotification[]> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) throw error
    return data || []
  },

  async markAsRead(notificationId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)

    if (error) throw error
  },

  async markAllAsRead(): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)

    if (error) throw error
  },

  subscribeToNotifications(onNotification: (notification: AppNotification) => void) {
    return supabase
      .channel('public:notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications' },
        (payload) => {
          onNotification(payload.new as AppNotification)
        }
      )
      .subscribe()
  }
}
