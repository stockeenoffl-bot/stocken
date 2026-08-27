import { supabase } from '@/lib/supabase'

export interface Course {
  id: string
  title: string
  description?: string
  visibility: string
  published: boolean
  thumbnail_url?: string
  created_at: string
}

export interface Lesson {
  id: string
  course_id: string
  title: string
  description?: string
  content?: string
  video_url?: string
  created_at: string
}

export const learningService = {
  async getCourses(): Promise<Course[]> {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  async toggleCourseStatus(id: string, currentPublished: boolean): Promise<void> {
    const { error } = await supabase
      .from('courses')
      .update({ published: !currentPublished })
      .eq('id', id)
      
    if (error) throw error
  },

  async createCourse(title: string, description: string): Promise<void> {
    const { error } = await supabase
      .from('courses')
      .insert([{ title, description, slug: title.toLowerCase().replace(/ /g, '-'), published: false }])
    
    if (error) throw error
  },

  async getLessons(courseId: string): Promise<Lesson[]> {
    const { data, error } = await supabase
      .from('lessons')
      .select('*')
      .eq('course_id', courseId)
      .order('sort_order', { ascending: true })

    if (error) throw error
    return data || []
  },

  async createLesson(courseId: string, title: string, videoUrl: string, content: string = ''): Promise<void> {
    const { error } = await supabase
      .from('lessons')
      .insert([{ course_id: courseId, title, video_url: videoUrl, content }])
      
    if (error) throw error
  }
}
