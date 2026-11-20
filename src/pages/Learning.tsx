import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText,
  Play,
  FolderPlus,
  Plus,
  XCircle,
  ExternalLink,
  GraduationCap,
  Eye,
  Settings,
  BookOpen,
  CheckCircle,
  Video,
  Download,
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

/** Extracts a clean embed URL for YouTube videos (short/standard/live) */
function getYoutubeEmbedUrl(url: string): string | null {
  if (!url) return null
  try {
    const trimmed = url.trim()
    const ytMatch = trimmed.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/)
    if (ytMatch && ytMatch[1]) {
      return `https://www.youtube.com/embed/${ytMatch[1]}?rel=0&modestbranding=1`
    }
  } catch {
    // not youtube
  }
  return null
}

/** Extracts URLs from lesson content string */
function extractUrls(text: string): string[] {
  if (!text) return []
  const matches = text.match(/https?:\/\/[^\s]+/g)
  return matches ? matches.map((m) => m.replace(/[.,;!?)]+$/, '')) : []
}

export default function Learning() {
  const { profile, hasAdminAccess, hasEditorAccess, isAdmin: isAuthAdmin } = useAuth()
  const canManage = hasAdminAccess || hasEditorAccess || isAuthAdmin || profile?.role === 'admin' || profile?.role === 'super_admin' || profile?.role === 'editor'

  const [previewAsStudent, setPreviewAsStudent] = useState(false)
  const [activeSubTab, setActiveSubTab] = useState('upload-pdfs')

  const [courses, setCourses] = useState<Course[]>([])
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [selectedCourse, setSelectedCourse] = useState<string>('')
  const [activeLessonId, setActiveLessonId] = useState<string>('')

  // New Course Form
  const [newCourseTitle, setNewCourseTitle] = useState('')
  const [newCourseDesc, setNewCourseDesc] = useState('')

  // New Lesson Form
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
        // Default to first published course for students, or first course for admin
        const initialCourse = c.find((x) => x.published) || c[0]
        setSelectedCourse(initialCourse.id)
        const l = await learningService.getLessons(initialCourse.id)
        setLessons(l)
        if (l.length > 0) {
          setActiveLessonId(l[0].id)
        }
      }
    } catch (err) {
      console.error('Failed to load learning data', err)
    }
  }

  const handleSelectCourse = async (courseId: string) => {
    setSelectedCourse(courseId)
    try {
      const l = await learningService.getLessons(courseId)
      setLessons(l)
      if (l.length > 0) {
        setActiveLessonId(l[0].id)
      } else {
        setActiveLessonId('')
      }
    } catch (err) {
      console.error('Failed to load lessons for course', err)
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
      toast.success('Lesson added successfully')
      setNewLessonTitle('')
      setNewLessonVideo('')
      setNewLessonContent('')
      const l = await learningService.getLessons(selectedCourse)
      setLessons(l)
      if (l.length > 0 && !activeLessonId) {
        setActiveLessonId(l[0].id)
      }
    } catch (err: any) {
      toast.error('Error: ' + err.message)
    }
  }

  const toggleCourseStatus = async (id: string, currentPublished: boolean) => {
    try {
      await learningService.toggleCourseStatus(id, currentPublished)
      setCourses((prev) =>
        prev.map((c) => (c.id === id ? { ...c, published: !currentPublished } : c))
      )
      toast.success(`Course ${!currentPublished ? 'published for students' : 'set to draft'}`)
    } catch (err) {
      toast.error('Failed to update course status')
    }
  }

  const subTabs = [
    { id: 'upload-pdfs', label: 'Upload PDFs / Lessons' },
    { id: 'video-management', label: 'Video Management' },
    { id: 'course-management', label: 'Course Management' },
    { id: 'categories', label: 'Categories' },
  ]

  const activeLesson = lessons.find((l) => l.id === activeLessonId) || lessons[0]
  const currentCourse = courses.find((c) => c.id === selectedCourse)
  const embedUrl = activeLesson?.video_url ? getYoutubeEmbedUrl(activeLesson.video_url) : null
  const resourceLinks = activeLesson?.content ? extractUrls(activeLesson.content) : []

  // Accessible courses for student: published only (or all if admin)
  const visibleCourses = canManage && !previewAsStudent ? courses : courses.filter((c) => c.published || courses.length <= 1)

  // -------------------------------------------------------------------------
  // STUDENT HUB VIEW (Non-admin or admin previewing student mode)
  // -------------------------------------------------------------------------
  if (!canManage || previewAsStudent) {
    return (
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
        {/* Admin Preview Banner */}
        {canManage && previewAsStudent && (
          <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-between text-xs text-amber-300">
            <div className="flex items-center gap-2">
              <Eye size={16} className="text-amber-400" />
              <span>You are previewing the <strong>Student Learning Hub</strong>. Students only see published videos & documents.</span>
            </div>
            <button
              onClick={() => setPreviewAsStudent(false)}
              className="px-3 py-1 rounded bg-amber-500 text-black font-bold hover:bg-amber-400 transition-colors"
            >
              Back to Admin Console
            </button>
          </div>
        )}

        {/* Page Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <GraduationCap size={18} />
              </div>
              <h1 className="text-xl font-bold text-[var(--text-primary)]">Learning Hub & Blueprints</h1>
            </div>
            <p className="text-xs mt-1 text-[var(--text-muted)]">
              Exclusive video lessons, technical breakdowns, PDF guides, and downloadable worksheets uploaded by your mentor.
            </p>
          </div>

          {canManage && !previewAsStudent && (
            <button
              onClick={() => setPreviewAsStudent(true)}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg border border-indigo-500/30 bg-indigo-500/10 text-xs font-bold text-indigo-300 hover:bg-indigo-500/20 transition-all shadow-sm"
            >
              <Eye size={14} />
              <span>Preview as Student</span>
            </button>
          )}
        </div>

        {/* Course Selection Pills / Tabs */}
        {visibleCourses.length > 0 && (
          <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-2">
            {visibleCourses.map((course) => {
              const isSelected = course.id === selectedCourse
              return (
                <button
                  key={course.id}
                  onClick={() => handleSelectCourse(course.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20'
                      : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:text-white hover:border-slate-700'
                  }`}
                >
                  {course.title}
                </button>
              )
            })}
          </motion.div>
        )}

        {/* Course Content Area */}
        {visibleCourses.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] space-y-3">
            <BookOpen size={40} className="mx-auto text-[var(--text-muted)] opacity-60" />
            <h3 className="text-sm font-bold text-[var(--text-primary)]">No Published Courses Yet</h3>
            <p className="text-xs text-[var(--text-muted)] max-w-md mx-auto">
              Your instructor will publish lessons, video masterclasses, and downloadable worksheets here soon.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Main Player & Lesson Content */}
            <div className="lg:col-span-2 space-y-5">
              {activeLesson ? (
                <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] overflow-hidden shadow-sm">
                  {/* Video Player or Document Placeholder */}
                  {activeLesson.video_url ? (
                    embedUrl ? (
                      <div className="relative w-full aspect-video bg-black">
                        <iframe
                          src={embedUrl}
                          title={activeLesson.title}
                          className="w-full h-full border-0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    ) : (
                      <div className="relative w-full aspect-video bg-black flex items-center justify-center">
                        <video
                          controls
                          src={activeLesson.video_url}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    )
                  ) : (
                    <div className="p-10 text-center bg-gradient-to-b from-indigo-950/20 to-transparent border-b border-[var(--border-subtle)]">
                      <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-3 text-indigo-400">
                        <FileText size={26} />
                      </div>
                      <h4 className="text-sm font-bold text-[var(--text-primary)]">Study Material & Worksheet</h4>
                      <p className="text-xs text-[var(--text-muted)] mt-1">Read the lesson guide and review resources below.</p>
                    </div>
                  )}

                  {/* Lesson Meta & Details */}
                  <div className="p-6 space-y-4">
                    <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-[var(--border-subtle)]">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[var(--accent-indigo)] tracking-wider">
                          {currentCourse?.title || 'Trading Course'}
                        </span>
                        <h2 className="text-lg font-bold text-[var(--text-primary)] mt-1">
                          {activeLesson.title}
                        </h2>
                      </div>

                      {activeLesson.video_url && (
                        <a
                          href={activeLesson.video_url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-tertiary)] text-xs text-[var(--text-secondary)] hover:text-white transition-colors"
                        >
                          <ExternalLink size={13} />
                          <span>Watch External</span>
                        </a>
                      )}
                    </div>

                    {/* Lesson Notes & Explanations */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold uppercase text-[var(--text-muted)] tracking-wider">
                        Lesson Notes & Instructions
                      </h4>
                      <p className="text-xs text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">
                        {activeLesson.content || 'No detailed written notes for this lesson. Refer to the video blueprint above.'}
                      </p>
                    </div>

                    {/* Resource / Downloadable PDFs Links */}
                    {resourceLinks.length > 0 && (
                      <div className="space-y-2 pt-3 border-t border-[var(--border-subtle)]">
                        <h4 className="text-xs font-bold uppercase text-emerald-400 tracking-wider flex items-center gap-1.5">
                          <Download size={14} /> Downloadable Worksheets & Resources
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                          {resourceLinks.map((url, idx) => (
                            <a
                              key={idx}
                              href={url}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center justify-between p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 text-xs font-semibold text-emerald-300 transition-all group"
                            >
                              <div className="flex items-center gap-2 truncate">
                                <FileText size={15} className="text-emerald-400 flex-shrink-0" />
                                <span className="truncate">Resource {idx + 1}: {url.split('/').pop() || 'Worksheet'}</span>
                              </div>
                              <ExternalLink size={13} className="text-emerald-400 opacity-60 group-hover:opacity-100 flex-shrink-0" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-12 text-center rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
                  <p className="text-xs text-[var(--text-muted)]">No lessons uploaded yet for this course.</p>
                </div>
              )}
            </div>

            {/* Right Col: Course Curriculum List */}
            <div className="space-y-3">
              <div className="p-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] space-y-3 shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
                  <div>
                    <h3 className="text-xs font-bold text-[var(--text-primary)]">Curriculum</h3>
                    <span className="text-[10px] text-[var(--text-muted)]">
                      {lessons.length} {lessons.length === 1 ? 'Lesson' : 'Lessons'} available
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    Official
                  </span>
                </div>

                <div className="space-y-1.5 max-h-[560px] overflow-y-auto pr-1">
                  {lessons.map((lesson, idx) => {
                    const isActive = lesson.id === activeLessonId
                    return (
                      <button
                        key={lesson.id}
                        type="button"
                        onClick={() => setActiveLessonId(lesson.id)}
                        className={`w-full text-left p-3 rounded-xl transition-all border flex items-center justify-between gap-3 ${
                          isActive
                            ? 'bg-indigo-600/15 border-indigo-500/40 text-white shadow-sm'
                            : 'bg-[var(--bg-tertiary)] border-transparent text-[var(--text-secondary)] hover:text-white hover:border-[var(--border-subtle)]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <div
                            className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
                              isActive
                                ? 'bg-indigo-600 text-white'
                                : 'bg-[var(--bg-secondary)] text-[var(--text-muted)]'
                            }`}
                          >
                            {idx + 1}
                          </div>
                          <div className="truncate">
                            <span className="text-xs font-bold block truncate">{lesson.title}</span>
                            <span className="text-[10px] text-[var(--text-muted)] flex items-center gap-1 mt-0.5">
                              {lesson.video_url ? (
                                <>
                                  <Video size={10} className="text-emerald-400" />
                                  <span>Video Lesson</span>
                                </>
                              ) : (
                                <>
                                  <FileText size={10} className="text-indigo-400" />
                                  <span>Notes / Worksheet</span>
                                </>
                              )}
                            </span>
                          </div>
                        </div>

                        {isActive && (
                          <div className="w-2 h-2 rounded-full bg-indigo-400 flex-shrink-0 animate-pulse" />
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    )
  }

  // -------------------------------------------------------------------------
  // ADMIN CONSOLE VIEW (For Admins and Editors to manage content)
  // -------------------------------------------------------------------------
  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[var(--text-primary)]">Learning Management</h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
              Admin & Editor Console
            </span>
          </div>
          <p className="text-xs mt-1 text-[var(--text-muted)]">
            Publish courses, upload PDF worksheets, attach video blueprints, and manage student curriculum.
          </p>
        </div>

        <button
          onClick={() => setPreviewAsStudent(true)}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg border border-indigo-500/30 bg-indigo-500/10 text-xs font-bold text-indigo-300 hover:bg-indigo-500/20 transition-all shadow-sm"
          title="Preview what subscribers see"
        >
          <Eye size={14} />
          <span>Preview as Student</span>
        </button>
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
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">Upload Course PDFs & Video Lessons</h3>
                <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
                  Publish worksheets, study PDFs, and video lessons for subscribers.
                </p>
              </div>

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
                      {courses.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.title} ({c.published ? 'Published' : 'Draft'})
                        </option>
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
                    <label className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Video URL (YouTube or MP4)</label>
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
                  <label className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Content / Notes / Downloadable PDF Links</label>
                  <textarea
                    placeholder="Add lesson breakdown, worksheet download links (Google Drive, Dropbox, PDF URLs), key takeaways..."
                    value={newLessonContent}
                    onChange={(e) => setNewLessonContent(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 rounded-md border text-xs outline-none bg-[var(--bg-secondary)] border-[var(--border-subtle)] text-[var(--text-primary)] focus:border-[var(--accent-indigo)]"
                    rows={4}
                  />
                </div>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-[var(--accent-indigo)] text-white text-xs font-bold hover:brightness-110 transition-all shadow-sm"
                >
                  <Plus size={14} /> Add Lesson
                </button>
              </form>

              {/* Lessons list */}
              <div className="space-y-2 mt-4">
                <span className="text-[9px] uppercase font-bold text-[var(--text-muted)] block">Lessons in Selected Course</span>
                {lessons.length > 0 ? (
                  lessons.map((lesson) => (
                    <div key={lesson.id} className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] text-xs">
                      <div className="flex items-center gap-2">
                        {lesson.video_url ? (
                          <Video size={16} className="text-emerald-400" />
                        ) : (
                          <FileText size={16} className="text-[var(--accent-indigo)]" />
                        )}
                        <div>
                          <span className="font-semibold text-[var(--text-primary)] block">{lesson.title}</span>
                          <span className="text-[9px] text-[var(--text-muted)] block mt-0.5 truncate max-w-sm">
                            {lesson.content || 'No content provided'}
                          </span>
                        </div>
                      </div>
                      <span className="font-mono text-[9px] text-[var(--text-muted)]">
                        {new Date(lesson.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-xs text-[var(--text-muted)]">No lessons uploaded yet for this course.</div>
                )}
              </div>
            </div>
          )}

          {activeSubTab === 'video-management' && (
            <div className="space-y-4">
              <div className="pb-4 border-b border-[var(--border-subtle)]">
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">Video Course Management</h3>
                <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Control published statuses for learning videos and courses.</p>
              </div>

              <div className="space-y-2">
                {courses.length > 0 ? (
                  courses.map((course) => (
                    <div key={course.id} className="flex items-center justify-between p-3.5 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)]">
                      <div className="flex items-center gap-3">
                        <Play size={16} className="text-emerald-400" />
                        <div>
                          <span className="text-xs font-bold text-[var(--text-primary)] block">{course.title}</span>
                          <span className="text-[9px] text-[var(--text-muted)] block mt-0.5">{course.description || 'No description'}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleCourseStatus(course.id, course.published)}
                        className={`px-3 py-1 rounded text-[10px] font-bold border transition-colors ${
                          course.published
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                            : 'bg-slate-500/10 border-slate-500/20 text-[var(--text-secondary)]'
                        }`}
                      >
                        {course.published ? 'Published' : 'Draft'}
                      </button>
                    </div>
                  ))
                ) : (
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
                <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Create courses and organize curricula blocks.</p>
              </div>

              <div className="space-y-3">
                <form onSubmit={handleCreateCourse} className="p-4 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] space-y-3 mb-6">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Course Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Advanced Options & Volatility Trading"
                      value={newCourseTitle}
                      onChange={(e) => setNewCourseTitle(e.target.value)}
                      className="w-full mt-1.5 px-3 py-2 rounded-md border text-xs outline-none bg-[var(--bg-secondary)] border-[var(--border-subtle)] text-[var(--text-primary)] focus:border-[var(--accent-indigo)]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Description</label>
                    <input
                      type="text"
                      placeholder="e.g. Step-by-step masterclass on reading open interest and institutional zones."
                      value={newCourseDesc}
                      onChange={(e) => setNewCourseDesc(e.target.value)}
                      className="w-full mt-1.5 px-3 py-2 rounded-md border text-xs outline-none bg-[var(--bg-secondary)] border-[var(--border-subtle)] text-[var(--text-primary)] focus:border-[var(--accent-indigo)]"
                    />
                  </div>
                  <button type="submit" className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[var(--accent-indigo)] text-white text-xs font-bold hover:brightness-110 transition-colors shadow-sm">
                    <FolderPlus size={13} />
                    Create New Course
                  </button>
                </form>

                {courses.map((course) => (
                  <div key={course.id} className="p-4 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-[var(--text-primary)]">{course.title}</span>
                      <span className="text-[10px] text-[var(--text-muted)]">{course.published ? 'Published' : 'Draft'}</span>
                    </div>
                    <div className="h-1 rounded-full bg-[var(--bg-secondary)] overflow-hidden">
                      <div className="h-full bg-[var(--accent-indigo)]" style={{ width: '100%' }} />
                    </div>
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