import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText,
  Play,
  FolderPlus,
  Plus,
  XCircle
} from 'lucide-react'
import { learningService } from '@/services/learningService'
import type { Course, Lesson } from '@/services/learningService'
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

export default function Learning() {
  const [activeSubTab, setActiveSubTab] = useState('upload-pdfs')

  const { profile } = useAuth()
  const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin'

  const [courses, setCourses] = useState<Course[]>([])
  const [lessons, setLessons] = useState<Lesson[]>([])

  // New Course Form
  const [newCourseTitle, setNewCourseTitle] = useState('')
  const [newCourseDesc, setNewCourseDesc] = useState('')

  // New Lesson Form
  const [selectedCourse, setSelectedCourse] = useState<string>('')
  const [newLessonTitle, setNewLessonTitle] = useState('')
  const [newLessonVideo, setNewLessonVideo] = useState('')
  const [newLessonContent, setNewLessonContent] = useState('')

  useEffect(() => {
    loadLearningData()
  }, [])

  const loadLearningData = async () => {
    try {
      const c = await learningService.getCourses()
      setCourses(c)
      if (c.length > 0) {
        setSelectedCourse(c[0].id)
        const l = await learningService.getLessons(c[0].id)
        setLessons(l)
      }
    } catch (err) {
      console.error('Failed to load learning data', err)
    }
  }

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCourseTitle) return
    try {
      await learningService.createCourse(newCourseTitle, newCourseDesc)
      toast.success('Course created')
      setNewCourseTitle('')
      setNewCourseDesc('')
      loadLearningData()
    } catch (err: any) {
      toast.error('Error: ' + err.message)
    }
  }

  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newLessonTitle || !selectedCourse) return
    try {
      await learningService.createLesson(selectedCourse, newLessonTitle, newLessonVideo, newLessonContent)
      toast.success('Lesson added')
      setNewLessonTitle('')
      setNewLessonVideo('')
      setNewLessonContent('')
      const l = await learningService.getLessons(selectedCourse)
      setLessons(l)
    } catch (err: any) {
      toast.error('Error: ' + err.message)
    }
  }

  const toggleCourseStatus = async (id: string, currentPublished: boolean) => {
    try {
      await learningService.toggleCourseStatus(id, currentPublished)
      setCourses(prev =>
        prev.map(c => c.id === id ? { ...c, published: !currentPublished } : c)
      )
      toast.success('Course status updated')
    } catch (err) {
      toast.error('Failed to update course status')
    }
  }

  const subTabs = [
    { id: 'upload-pdfs', label: 'Upload PDFs' },
    { id: 'video-management', label: 'Video management' },
    { id: 'course-management', label: 'Course management' },
    { id: 'categories', label: 'Categories' }
  ]

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[var(--text-primary)]">Learning</h1>
        <p className="text-xs mt-1 text-[var(--text-muted)]">
          Manage member worksheets, lessons, video blueprints, and folders.
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

      {/* Detail Area */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSubTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="rounded-xl border p-6 bg-[var(--bg-secondary)] border-[var(--border-subtle)] space-y-6"
        >
          {activeSubTab === 'upload-pdfs' && (
            <div className="space-y-6">
              <div className="pb-4 border-b border-[var(--border-subtle)]">
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">Upload Course PDFs</h3>
                <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Publish manual books and trading worksheets for VIP/Pro subscribers.</p>
              </div>

              {isAdmin && (
                <form onSubmit={handleCreateLesson} className="space-y-3 p-4 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)]">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Select Course</label>
                      <select
                        value={selectedCourse}
                        onChange={async (e) => {
                          setSelectedCourse(e.target.value)
                          if (e.target.value) {
                            const l = await learningService.getLessons(e.target.value)
                            setLessons(l)
                          }
                        }}
                        className="w-full mt-1.5 px-3 py-2 rounded-md border text-xs outline-none bg-[var(--bg-secondary)] border-[var(--border-subtle)] text-[var(--text-secondary)] focus:border-[var(--accent-indigo)]"
                      >
                        {courses.map(c => (
                          <option key={c.id} value={c.id}>{c.title}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Lesson Title</label>
                      <input
                        type="text"
                        placeholder="e.g. Master Class Volume Mechanics"
                        value={newLessonTitle}
                        onChange={(e) => setNewLessonTitle(e.target.value)}
                        className="w-full mt-1.5 px-3 py-2 rounded-md border text-xs outline-none bg-[var(--bg-secondary)] border-[var(--border-subtle)] text-[var(--text-primary)] focus:border-[var(--accent-indigo)]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Video URL (optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. https://youtube.com/watch?v=..."
                        value={newLessonVideo}
                        onChange={(e) => setNewLessonVideo(e.target.value)}
                        className="w-full mt-1.5 px-3 py-2 rounded-md border text-xs outline-none bg-[var(--bg-secondary)] border-[var(--border-subtle)] text-[var(--text-primary)] focus:border-[var(--accent-indigo)]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Content / Notes</label>
                    <textarea
                      placeholder="Add PDF links, lesson notes, etc."
                      value={newLessonContent}
                      onChange={(e) => setNewLessonContent(e.target.value)}
                      className="w-full mt-1.5 px-3 py-2 rounded-md border text-xs outline-none bg-[var(--bg-secondary)] border-[var(--border-subtle)] text-[var(--text-primary)] focus:border-[var(--accent-indigo)]"
                      rows={3}
                    />
                  </div>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-[var(--accent-indigo)] text-white text-xs font-bold hover:brightness-110 transition-all"
                  >
                    <Plus size={14} /> Add Lesson
                  </button>
                </form>
              )}

              {/* Lessons list */}
              <div className="space-y-2 mt-4">
                <span className="text-[9px] uppercase font-bold text-[var(--text-muted)] block">Lessons in Selected Course</span>
                  {lessons.length > 0 ? lessons.map(lesson => (
                    <div key={lesson.id} className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] text-xs">
                      <div className="flex items-center gap-2">
                        <FileText size={16} className="text-[var(--accent-indigo)]" />
                        <div>
                          <span className="font-semibold text-[var(--text-primary)] block">{lesson.title}</span>
                          <span className="text-[9px] text-[var(--text-muted)] block mt-0.5 truncate max-w-sm">{lesson.content || 'No content provided'}</span>
                        </div>
                      </div>
                      <span className="font-mono text-[9px] text-[var(--text-muted)]">{new Date(lesson.created_at).toLocaleDateString()}</span>
                    </div>
                  )) : (
                    <div className="p-4 text-center text-xs text-[var(--text-muted)]">No lessons uploaded yet for this course.</div>
                  )}
              </div>
            </div>
          )}

          {activeSubTab === 'video-management' && (
            <div className="space-y-4">
              <div className="pb-4 border-b border-[var(--border-subtle)]">
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">Video Course Management</h3>
                <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Control published statuses for learning videos.</p>
              </div>

              <div className="space-y-2">
                {courses.length > 0 ? courses.map(course => (
                  <div key={course.id} className="flex items-center justify-between p-3.5 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)]">
                    <div className="flex items-center gap-3">
                      <Play size={16} className="text-emerald-400" />
                      <div>
                        <span className="text-xs font-bold text-[var(--text-primary)] block">{course.title}</span>
                        <span className="text-[9px] text-[var(--text-muted)] block mt-0.5">{course.description || 'No description'}</span>
                      </div>
                    </div>
                    {isAdmin && (
                      <button
                        onClick={() => toggleCourseStatus(course.id, course.published)}
                        className={`px-3 py-1 rounded text-[10px] font-bold border transition-colors ${
                          course.published ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-slate-500/10 border-slate-500/20 text-[var(--text-secondary)]'
                        }`}
                      >
                        {course.published ? 'Published' : 'Draft'}
                      </button>
                    )}
                  </div>
                )) : (
                  <div className="p-4 text-center text-xs text-[var(--text-muted)] border rounded-lg border-dashed border-[var(--border-subtle)]">
                    No courses available.
                  </div>
                )}
              </div>
            </div>
          )}

          {activeSubTab === 'course-management' && (
            <div className="space-y-4">
              <div className="pb-4 border-b border-[var(--border-subtle)]">
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">Course Outline Builder</h3>
                <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Organize layout modules and curricula blocks.</p>
              </div>

              <div className="space-y-3">
                {isAdmin && (
                  <form onSubmit={handleCreateCourse} className="p-4 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] space-y-3 mb-6">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Course Title</label>
                      <input
                        type="text"
                        required
                        value={newCourseTitle}
                        onChange={(e) => setNewCourseTitle(e.target.value)}
                        className="w-full mt-1.5 px-3 py-2 rounded-md border text-xs outline-none bg-[var(--bg-secondary)] border-[var(--border-subtle)] text-[var(--text-primary)] focus:border-[var(--accent-indigo)]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Description</label>
                      <input
                        type="text"
                        value={newCourseDesc}
                        onChange={(e) => setNewCourseDesc(e.target.value)}
                        className="w-full mt-1.5 px-3 py-2 rounded-md border text-xs outline-none bg-[var(--bg-secondary)] border-[var(--border-subtle)] text-[var(--text-primary)] focus:border-[var(--accent-indigo)]"
                      />
                    </div>
                    <button type="submit" className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[var(--accent-indigo)] text-white text-xs font-bold hover:brightness-110 transition-colors">
                      <FolderPlus size={13} />
                      Create New Course
                    </button>
                  </form>
                )}

                {courses.map(course => (
                  <div key={course.id} className="p-4 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-[var(--text-primary)]">{course.title}</span>
                      <span className="text-[10px] text-[var(--text-muted)]">{course.published ? 'Published' : 'Draft'}</span>
                    </div>
                    <div className="h-1 rounded-full bg-[var(--bg-secondary)] overflow-hidden"><div className="h-full bg-[var(--accent-indigo)]" style={{ width: '100%' }} /></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSubTab === 'categories' && (
            <div className="space-y-4">
              <div className="pb-4 border-b border-[var(--border-subtle)]">
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">Learning Categories</h3>
                <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Manage taxonomy filter folders for documents and lessons.</p>
              </div>

              <div className="flex flex-wrap gap-2">
                {['Technical Analysis', 'Volume Profile', 'Risk Management', 'Options Chain', 'Swing Trading'].map((cat, i) => (
                  <div key={i} className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)]">
                    <span>{cat}</span>
                    <XCircle size={12} className="text-[var(--text-muted)] hover:text-rose-400 cursor-pointer" />
                  </div>
                ))}
                <button className="flex items-center gap-1 px-3 py-1 rounded-full border border-dashed border-[var(--border-subtle)] text-xs text-[var(--text-muted)] hover:text-white transition-colors">
                  <Plus size={12} /> Add Tag
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  )
}
