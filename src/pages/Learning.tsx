import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload,
  FileText,
  Play,
  FolderPlus,
  Plus,
  XCircle
} from 'lucide-react'
import { learningService } from '@/services/learningService'
import type { LearningVideo } from '@/services/learningService'
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

  // Learning State (Upload PDFs & Video drafts)
  const [pdfTitle, setPdfTitle] = useState('')
  const [pdfCategory, setPdfCategory] = useState('Technical Analysis')
  const [uploadedPdfs, setUploadedPdfs] = useState<any[]>([])
  const [learningVideos, setLearningVideos] = useState<LearningVideo[]>([])

  useEffect(() => {
    async function loadLearningData() {
      try {
        const videos = await learningService.getVideos()
        const docs = await learningService.getDocuments()
        setLearningVideos(videos)
        setUploadedPdfs(docs)
      } catch (err) {
        console.error('Failed to load learning data', err)
      }
    }
    loadLearningData()
  }, [])

  const handleUploadPdf = (e: React.FormEvent) => {
    e.preventDefault()
    if (!pdfTitle) return
    // In a real app this would upload to Supabase Storage
    toast.success('PDF Upload simulated successfully')
    setPdfTitle('')
  }

  const toggleVideoStatus = async (id: string, currentStatus: string) => {
    try {
      await learningService.toggleVideoStatus(id, currentStatus)
      setLearningVideos(prev =>
        prev.map(v => v.id === id ? { ...v, status: currentStatus === 'Published' ? 'Draft' : 'Published' } : v)
      )
      toast.success('Video status updated')
    } catch (err) {
      toast.error('Failed to update video status')
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

              <form onSubmit={handleUploadPdf} className="space-y-3 p-4 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)]">
                <div className="border border-dashed border-[var(--border-subtle)] rounded-lg p-6 text-center hover:border-[var(--accent-indigo)] transition-colors cursor-pointer">
                  <Upload className="mx-auto text-[var(--text-muted)] mb-2" size={24} />
                  <span className="text-xs text-[var(--text-secondary)] block">Drag & Drop files here or click to browse</span>
                  <span className="text-[9px] text-[var(--text-muted)] block mt-1">PDF file formats up to 25MB</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Document Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Master Class Volume Mechanics"
                      value={pdfTitle}
                      onChange={(e) => setPdfTitle(e.target.value)}
                      className="w-full mt-1.5 px-3 py-2 rounded-md border text-xs outline-none bg-[var(--bg-secondary)] border-[var(--border-subtle)] text-[var(--text-primary)] focus:border-[var(--accent-indigo)]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Folder Category</label>
                    <select
                      value={pdfCategory}
                      onChange={(e) => setPdfCategory(e.target.value)}
                      className="w-full mt-1.5 px-3 py-2 rounded-md border text-xs outline-none bg-[var(--bg-secondary)] border-[var(--border-subtle)] text-[var(--text-secondary)] focus:border-[var(--accent-indigo)]"
                    >
                      <option value="Technical Analysis">Technical Analysis</option>
                      <option value="Volume Profile">Volume Profile</option>
                      <option value="Risk Management">Risk Management</option>
                    </select>
                  </div>
                </div>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-[var(--accent-indigo)] text-white text-xs font-bold hover:brightness-110 transition-all"
                >
                  <Plus size={14} /> Add Document
                </button>
              </form>

              {/* PDF list */}
              <div className="space-y-2">
                <span className="text-[9px] uppercase font-bold text-[var(--text-muted)] block">Uploaded Documents</span>
                  {uploadedPdfs.length > 0 ? uploadedPdfs.map(pdf => (
                    <div key={pdf.id} className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] text-xs">
                      <div className="flex items-center gap-2">
                        <FileText size={16} className="text-[var(--accent-indigo)]" />
                        <div>
                          <span className="font-semibold text-[var(--text-primary)] block">{pdf.title}</span>
                          <span className="text-[9px] text-[var(--text-muted)] block mt-0.5">{pdf.category || 'General'} &middot; {pdf.size || '1.2 MB'}</span>
                        </div>
                      </div>
                      <span className="font-mono text-[9px] text-[var(--text-muted)]">{new Date(pdf.created_at).toLocaleDateString()}</span>
                    </div>
                  )) : (
                    <div className="p-4 text-center text-xs text-[var(--text-muted)]">No documents uploaded yet.</div>
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
                {learningVideos.length > 0 ? learningVideos.map(video => (
                  <div key={video.id} className="flex items-center justify-between p-3.5 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)]">
                    <div className="flex items-center gap-3">
                      <Play size={16} className="text-emerald-400" />
                      <div>
                        <span className="text-xs font-bold text-[var(--text-primary)] block">{video.title}</span>
                        <span className="text-[9px] text-[var(--text-muted)] block mt-0.5">Length: {video.duration || '00:00'}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleVideoStatus(video.id, video.status)}
                      className={`px-3 py-1 rounded text-[10px] font-bold border transition-colors ${
                        video.status === 'Published' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-slate-500/10 border-slate-500/20 text-[var(--text-secondary)]'
                      }`}
                    >
                      {video.status}
                    </button>
                  </div>
                )) : (
                  <div className="p-4 text-center text-xs text-[var(--text-muted)] border rounded-lg border-dashed border-[var(--border-subtle)]">
                    No videos available. Please configure the database table.
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
                <div className="p-4 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-[var(--text-primary)]">Volume Profile Masterclass</span>
                    <span className="text-[10px] text-[var(--text-muted)]">3 Modules</span>
                  </div>
                  <div className="h-1 rounded-full bg-[var(--bg-secondary)] overflow-hidden"><div className="h-full bg-[var(--accent-indigo)]" style={{ width: '100%' }} /></div>
                </div>

                <div className="p-4 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-[var(--text-primary)]">Index Trading Breakouts 101</span>
                    <span className="text-[10px] text-[var(--text-muted)]">4 Modules</span>
                  </div>
                  <div className="h-1 rounded-full bg-[var(--bg-secondary)] overflow-hidden"><div className="h-full bg-[var(--accent-indigo)]" style={{ width: '75%' }} /></div>
                </div>

                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] hover:text-white transition-colors">
                  <FolderPlus size={13} />
                  New Course Blueprint
                </button>
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
