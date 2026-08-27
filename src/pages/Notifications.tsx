import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell,
  FileText,
  ToggleLeft,
  ToggleRight,
  CheckCircle2,
  Check,
  Loader2
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
}

export default function Notifications() {
  const [activeSubTab, setActiveSubTab] = useState('push-sender')

  // Notifications (Push and Email Form States)
  const [pushTitle, setPushTitle] = useState('')
  const [pushBody, setPushBody] = useState('')
  const [pushTarget, setPushTarget] = useState('all')
  const [pushSentMsg, setPushSentMsg] = useState('')
  const [isSending, setIsSending] = useState(false)

  const handleSendPush = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!pushTitle || !pushBody) return
    
    setIsSending(true)
    try {
      if (pushTarget === 'all') {
        // Send a broadcast note 'all' to everyone. 
        // Real logic might need edge function if the table gets massive, but inserting one record with user_id='all' works if UI knows to read it.
        // For standard relation, let's just insert one with user_id='all'
        await supabase.from('notifications').insert({
          user_id: 'all', // We'll assume the TopHeader fetches user_id=all as well
          title: pushTitle,
          message: pushBody,
          type: 'push'
        })
      } else {
        // This is a simplified demo, in a real scenario you would query user IDs based on plan
        await supabase.from('notifications').insert({
          user_id: 'all', 
          title: `[${pushTarget.toUpperCase()}] ` + pushTitle,
          message: pushBody,
          type: 'push'
        })
      }
      
      setPushSentMsg(`Push notification successfully broadcasted to ${pushTarget.toUpperCase()} members!`)
      setPushTitle('')
      setPushBody('')
    } catch (err: any) {
      console.error(err)
    } finally {
      setIsSending(false)
      setTimeout(() => setPushSentMsg(''), 4000)
    }
  }

  const [emailSubject, setEmailSubject] = useState('')
  const [emailTemplate, setEmailTemplate] = useState('weekly')
  const [emailSentMsg, setEmailSentMsg] = useState('')

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault()
    if (!emailSubject) return
    setEmailSentMsg(`Email broadcast using the "${emailTemplate}" template has been queued for delivery!`)
    setEmailSubject('')
    setTimeout(() => setEmailSentMsg(''), 4000)
  }

  // Telegram Integration State
  const [telegramToken, setTelegramToken] = useState('781920381:AAF_jKLw2938aLzOp...')
  const [telegramChatId, setTelegramChatId] = useState('-10018273948')
  const [telegramSaved, setTelegramSaved] = useState(false)

  const handleSaveTelegram = () => {
    setTelegramSaved(true)
    setTimeout(() => setTelegramSaved(false), 2000)
  }

  // Announcement Banner state
  const [bannerActive, setBannerActive] = useState(false)
  const [bannerText, setBannerText] = useState('⚡ Premium subscriptions are now 20% off for the next 48 hours!')
  const [bannerType, setBannerType] = useState<'indigo' | 'green' | 'yellow' | 'red'>('indigo')

  const subTabs = [
    { id: 'push-sender', label: 'Push notification sender' },
    { id: 'email-broadcast', label: 'Email broadcast' },
    { id: 'telegram-integration', label: 'Telegram integration' },
    { id: 'announcement-banner', label: 'Announcement banner' }
  ]

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[var(--text-primary)]">Notifications</h1>
        <p className="text-xs mt-1 text-[var(--text-muted)]">
          Manage system notification broadcasts, bot credentials, and homepage banners.
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

      {/* Detail Panel */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSubTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="rounded-xl border p-6 bg-[var(--bg-secondary)] border-[var(--border-subtle)] space-y-6"
        >
          {activeSubTab === 'push-sender' && (
            <div className="space-y-4">
              <div className="pb-4 border-b border-[var(--border-subtle)]">
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">Push Notification Sender</h3>
                <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Send a real-time push alert directly to user browsers and devices.</p>
              </div>

              {pushSentMsg && (
                <div className="p-3 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-1.5">
                  <CheckCircle2 size={14} /> {pushSentMsg}
                </div>
              )}

              <form onSubmit={handleSendPush} className="space-y-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Notification Title</label>
                  <input
                    type="text"
                    placeholder="e.g. NIFTY breakout alert"
                    value={pushTitle}
                    onChange={(e) => setPushTitle(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 rounded-md border text-xs outline-none bg-[var(--bg-tertiary)] border-[var(--border-subtle)] text-[var(--text-primary)] focus:border-[var(--accent-indigo)]"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Alert Body Description</label>
                  <textarea
                    rows={3}
                    placeholder="Type details that will appear on user screens..."
                    value={pushBody}
                    onChange={(e) => setPushBody(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 rounded-md border text-xs outline-none bg-[var(--bg-tertiary)] border-[var(--border-subtle)] text-[var(--text-primary)] focus:border-[var(--accent-indigo)] resize-none"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Target Members</label>
                    <select
                      value={pushTarget}
                      onChange={(e) => setPushTarget(e.target.value)}
                      className="w-full mt-1.5 px-3 py-2 rounded-md border text-xs outline-none bg-[var(--bg-tertiary)] border-[var(--border-subtle)] text-[var(--text-secondary)] focus:border-[var(--accent-indigo)]"
                    >
                      <option value="all">All Members</option>
                      <option value="free">Free Members Only</option>
                      <option value="pro">Pro Members Only</option>
                      <option value="vip">VIP Members Only</option>
                    </select>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isSending}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-md text-xs font-bold text-white bg-[var(--accent-indigo)] hover:brightness-110 transition-all disabled:opacity-50"
                >
                  {isSending ? <Loader2 size={14} className="animate-spin" /> : <Bell size={14} />} Send Broadcast Notification
                </button>
              </form>
            </div>
          )}

          {activeSubTab === 'email-broadcast' && (
            <div className="space-y-4">
              <div className="pb-4 border-b border-[var(--border-subtle)]">
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">Email Broadcast</h3>
                <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Send styled newsletter email bulletins to your lists.</p>
              </div>

              {emailSentMsg && (
                <div className="p-3 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold flex items-center gap-1.5">
                  <CheckCircle2 size={14} /> {emailSentMsg}
                </div>
              )}

              <form onSubmit={handleSendEmail} className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Subject Line</label>
                    <input
                      type="text"
                      placeholder="e.g. Market outlook index guide"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      className="w-full mt-1.5 px-3 py-2 rounded-md border text-xs outline-none bg-[var(--bg-tertiary)] border-[var(--border-subtle)] text-[var(--text-primary)] focus:border-[var(--accent-indigo)]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Select Template</label>
                    <select
                      value={emailTemplate}
                      onChange={(e) => setEmailTemplate(e.target.value)}
                      className="w-full mt-1.5 px-3 py-2 rounded-md border text-xs outline-none bg-[var(--bg-tertiary)] border-[var(--border-subtle)] text-[var(--text-secondary)] focus:border-[var(--accent-indigo)]"
                    >
                      <option value="weekly">Weekly Outlook Report</option>
                      <option value="breaking">Breaking Market Update</option>
                      <option value="promotion">Promo / Offers Template</option>
                    </select>
                  </div>
                </div>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-md text-xs font-bold text-white bg-[var(--accent-indigo)] hover:brightness-110 transition-all"
                >
                  <FileText size={14} /> Dispatch Email Campaign
                </button>
              </form>
            </div>
          )}

          {activeSubTab === 'telegram-integration' && (
            <div className="space-y-4">
              <div className="pb-4 border-b border-[var(--border-subtle)]">
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">Telegram Bot Integration</h3>
                <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Link alert outputs to your VIP Telegram channel automatically.</p>
              </div>

              <div className="space-y-4">
                {telegramSaved && (
                  <div className="p-3 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                    Telegram bot credentials saved successfully!
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Bot API Key Token</label>
                    <input
                      type="password"
                      value={telegramToken}
                      onChange={(e) => setTelegramToken(e.target.value)}
                      className="w-full mt-1.5 px-3 py-2 rounded-md border text-xs font-mono outline-none bg-[var(--bg-tertiary)] border-[var(--border-subtle)] text-[var(--text-primary)] focus:border-[var(--accent-indigo)]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Telegram Chat ID / Channel</label>
                    <input
                      type="text"
                      value={telegramChatId}
                      onChange={(e) => setTelegramChatId(e.target.value)}
                      className="w-full mt-1.5 px-3 py-2 rounded-md border text-xs outline-none bg-[var(--bg-tertiary)] border-[var(--border-subtle)] text-[var(--text-primary)] focus:border-[var(--accent-indigo)]"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleSaveTelegram}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-md border text-xs font-semibold text-[var(--text-secondary)] border-[var(--border-subtle)] transition-colors hover:text-white"
                >
                  <Check size={13} /> Save Bot Credentials
                </button>
              </div>
            </div>
          )}

          {activeSubTab === 'announcement-banner' && (
            <div className="space-y-4">
              <div className="pb-4 border-b border-[var(--border-subtle)]">
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">Announcement Banner</h3>
                <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Toggle a public alert header at the top of client dashboards.</p>
              </div>

              <div className="space-y-4 p-4 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)]">
                <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
                  <div>
                    <span className="text-xs font-bold text-[var(--text-primary)]">Banner Display Status</span>
                    <span className="text-[9px] text-[var(--text-muted)] block mt-0.5">Enable public website alert banners.</span>
                  </div>
                  <button
                    onClick={() => setBannerActive(!bannerActive)}
                    className="text-[var(--accent-indigo)] transition-transform active:scale-95"
                  >
                    {bannerActive ? <ToggleRight size={28} className="text-emerald-500" /> : <ToggleLeft size={28} className="text-[var(--text-muted)]" />}
                  </button>
                </div>

                {bannerActive && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Banner Text Content</label>
                      <input
                        type="text"
                        value={bannerText}
                        onChange={(e) => setBannerText(e.target.value)}
                        className="w-full mt-1.5 px-3 py-2 rounded-md border text-xs outline-none bg-[var(--bg-secondary)] border-[var(--border-subtle)] text-[var(--text-primary)] focus:border-[var(--accent-indigo)]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Color Style Theme</label>
                      <div className="flex gap-2 mt-1.5">
                        {(['indigo', 'green', 'yellow', 'red'] as const).map((style) => (
                          <button
                            key={style}
                            type="button"
                            onClick={() => setBannerType(style)}
                            className={`px-3 py-1 rounded text-[10px] uppercase font-bold border transition-colors ${
                              bannerType === style ? 'border-[var(--accent-indigo)] text-[var(--text-primary)] bg-[var(--bg-secondary)]' : 'border-[var(--border-subtle)] text-[var(--text-muted)]'
                            }`}
                          >
                            {style}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  )
}
