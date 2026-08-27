import { supabase } from '@/lib/supabase'

export interface LearningVideo {
  id: string
  title: string
  duration: string
  status: 'Published' | 'Draft'
  category_id?: string
  video_url?: string
}

export interface LearningDocument {
  id: string
  title: string
  category: string
  size: string
  created_at: string
  file_url?: string
}

export const learningService = {
  async getVideos(): Promise<LearningVideo[]> {
    const { data, error } = await supabase
      .from('learning_modules')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  async toggleVideoStatus(id: string, currentStatus: string): Promise<void> {
    const newStatus = currentStatus === 'Published' ? 'Draft' : 'Published'
    const { error } = await supabase
      .from('learning_modules')
      .update({ status: newStatus })
      .eq('id', id)
      
    if (error) throw error
  },

  async getDocuments(): Promise<LearningDocument[]> {
    // For demo purposes this pulls from a mock table, but you could create 'learning_documents' 
    // table in supabase. We'll use learning_modules for both for now to save schema space if needed,
    // or just return mock if table doesn't exist.
    const { data, error } = await supabase
      .from('learning_modules')
      .select('*')
      .eq('content_type', 'pdf')
      .order('created_at', { ascending: false })

    if (error) {
      console.warn("Table might not exist, returning empty", error)
      return []
    }
    return data || []
  }
}
