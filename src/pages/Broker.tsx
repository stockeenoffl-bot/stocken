import { useCallback, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Activity,
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  ExternalLink,
  Globe,
  KeyRound,
  Layers,
  Plug,
  RefreshCw,
  Server,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  Unplug,
  Zap,
} from 'lucide-react'
import {
  aliceBlueService,
  type AliceBlueQuote,
  type ConnectionDiagnostic,
  type GatewayStatus,
} from '@/services/aliceBlueService'
import { useLiveQuotes } from '@/hooks/useLiveQuotes'
import { fmtPrice } from '@/lib/candles'
import { toast } from 'sonner'

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } }
const itemVariants = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }

const FEED = ['NIFTY 50', 'BANKNIFTY', 'FINNIFTY', 'SENSEX']

function QuoteCard({ q }: { q: AliceBlueQuote }) {
  const up = q.change >= 0
  return (
    <div className="p-4 rounded-xl border bg-[var(--bg-secondary)] border-[var(--border-subtle)] space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-[var(--text-primary)]">{q.symbol}</span>
        <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${
          q.source === 'aliceblue' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
        }`}>
          {q.source === 'aliceblue' ? 'ALICE BLUE' : 'BACKUP'}
        </span>
      </div>
      <div>
        <h4 className="text-2xl font-mono font-bold text-[var(--text-primary)]">{fmtPrice(q.ltp)}</h4>
        <div className={`flex items-center gap-1 text-xs font-semibold mt-1 ${up ? 'text-emerald-400' : 'text-rose-400'}`}>
          {up ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          <span>{up ? '+' : ''}{fmtPrice(q.change)} ({up ? '+' : ''}{q.changePercent.toFixed(2)}%)</span>
        </div>
      </div>
      <div className="pt-2 border-t border-[var(--border-subtle)] grid grid-cols-3 text-[10px] text-[var(--text-muted)]">
        <div>O <span className="font-mono text-[var(--text-secondary)]">{fmtPrice(q.open)}</span></div>
        <div>H <span className="font-mono text-[var(--text-secondary)]">{fmtPrice(q.high)}</span></div>
        <div>L <span className="font-mono text-[var(--text-secondary)]">{fmtPrice(q.low)}</span></div>
      </div>
    </div>
  )
}

export default function Broker() {
  const [status, setStatus] = useState<GatewayStatus | null>(aliceBlueService.getStatus())
  const [authInput, setAuthInput] = useState('')
  const [clientId, setClientId] = useState('')
  const [manualSession, setManualSession] = useState('')
  const [showManual, setShowManual] = useState(false)
  const [showToken, setShowToken] = useState(false)
  const [busy, setBusy] = useState<string | null>(null)
  const [diagnostics, setDiagnostics] = useState<ConnectionDiagnostic[]>([])
  const [myIp, setMyIp] = useState<string | null>(null)
  const { quotes, loaded } = useLiveQuotes(FEED)

  const reload = useCallback(async () => {
    const s = await aliceBlueService.refreshStatus()
    if (s) setStatus(s)
  }, [])

  useEffect(() => {
    void reload()
    const onChange = () => setStatus(aliceBlueService.getStatus())
    window.addEventListener('aliceblue-status-change', onChange)
    return () => window.removeEventListener('aliceblue-status-change', onChange)
  }, [reload])

  // After clicking "Login to Alice Blue", watch for the automatic connection
  // (the gateway's /callback creates the session) and confirm when it lands.
  const [awaiting, setAwaiting] = useState(false)
  useEffect(() => {
    if (!awaiting) return
    const id = setInterval(async () => {
      const s = await aliceBlueService.refreshStatus()
      if (s) setStatus(s)
      if (s?.connected) {
        setAwaiting(false)
        toast.success("Alice Blue connected! Live data is now flowing to all users.")
      }
    }, 2500)
    const stop = setTimeout(() => setAwaiting(false), 180000)
    return () => {
      clearInterval(id)
      clearTimeout(stop)
    }
  }, [awaiting])

  const connected = Boolean(status?.connected)
  const configured = Boolean(status?.configured)

  const handleGenerate = async () => {
    if (!authInput.trim()) return toast.error('Paste the authCode (or the full redirect URL) from Alice Blue first.')
    setBusy('generate')
    try {
      const res = await aliceBlueService.generateSession(authInput.trim(), clientId.trim() || undefined)
      if (res.success) {
        setAuthInput('')
        toast.success("Today's Alice Blue session is active. Live data now flows to ALL users.")
      } else {
        toast.error(res.error || 'Could not create session')
      }
    } catch (e: any) {
      toast.error(e?.message || 'Could not create session')
    } finally {
      setBusy(null)
    }
  }

  const handleManual = async () => {
    if (!clientId.trim() || !manualSession.trim()) return toast.error('Enter Client ID and userSession token.')
    setBusy('manual')
    try {
      const res = await aliceBlueService.setSession(clientId.trim(), manualSession.trim())
      if (res.success) {
        setManualSession('')
        toast.success('Session saved.')
      } else toast.error(res.error || 'Could not save session')
    } catch (e: any) {
      toast.error(e?.message)
    } finally {
      setBusy(null)
    }
  }

  const handleDisconnect = async () => {
    if (!window.confirm('Disconnect Alice Blue? Users will see backup data until you reconnect.')) return
    setBusy('disconnect')
    try {
      const res = await aliceBlueService.disconnect()
      if (res.success) toast.info('Alice Blue disconnected.')
      else toast.error(res.error || 'Failed')
    } catch (e: any) {
      toast.error(e?.message)
    } finally {
      setBusy(null)
    }
  }

  const handleDiagnostics = async () => {
    setBusy('diag')
    try {
      const res = await aliceBlueService.runDiagnostics()
      if (res.error && !res.diagnostics.length) return toast.error(res.error)
      setDiagnostics(res.diagnostics)
      res.success ? toast.success('All checks passed') : toast.warning('Some checks need attention')
    } catch (e: any) {
      toast.error(e?.message)
    } finally {
      setBusy(null)
    }
  }

  const detectIp = async () => {
    const ip = await aliceBlueService.detectPublicIp()
    setMyIp(ip)
    if (!ip) toast.error('Could not detect IP')
  }

  const created = status?.session?.createdAt ? new Date(status.session.createdAt) : null

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
            <span>Alice Blue Live Data Connection</span>
            <span className="text-[10px] uppercase px-2 py-0.5 rounded font-mono font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">A3 Open API</span>
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            One daily login here powers live charts and quotes for <strong>every user</strong>. Credentials and the session stay on the server — they are never sent to browsers.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleDiagnostics} disabled={busy === 'diag'}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold bg-[var(--bg-secondary)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-white hover:border-[var(--accent-indigo)] transition-all">
            <Activity size={14} className={busy === 'diag' ? 'animate-spin text-indigo-400' : ''} />
            {busy === 'diag' ? 'Testing…' : 'Run Diagnostics'}
          </button>
          <button onClick={() => void reload()} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold bg-[var(--bg-secondary)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-white">
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {/* Status */}
      <motion.div variants={itemVariants} className="p-5 rounded-xl border bg-[var(--bg-secondary)] border-[var(--border-subtle)] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${
            connected ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' : configured ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
          }`}><Server size={20} /></div>
          <div>
            <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">Live Feed</span>
            <span className="text-xs font-bold flex items-center gap-1.5 text-[var(--text-primary)]">
              <span className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-400 animate-pulse' : configured ? 'bg-amber-400' : 'bg-rose-400'}`} />
              {connected ? 'Connected · serving all users' : configured ? (status?.reason === 'expired' ? 'Session expired' : 'Login needed today') : 'Server keys missing'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] text-[var(--accent-indigo)]"><KeyRound size={20} /></div>
          <div>
            <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">App ID</span>
            <span className="text-xs font-mono font-semibold text-[var(--text-primary)]">{status?.appId || 'Not set on server'}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] text-purple-400"><Clock size={20} /></div>
          <div>
            <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">Session</span>
            <span className="text-xs font-semibold text-[var(--text-primary)]">
              {created ? `${status?.session?.userId} · ${created.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}` : 'None'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] text-blue-400"><Layers size={20} /></div>
          <div>
            <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">Market</span>
            <span className="text-xs font-bold text-[var(--text-primary)]">{status?.marketOpen ? 'Open (live ticks)' : 'Closed'}</span>
          </div>
        </div>
      </motion.div>

      {!configured && (
        <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 text-xs text-rose-200 space-y-1">
          <div className="font-bold flex items-center gap-1.5"><AlertCircle size={14} /> Server environment is not configured</div>
          <p>Add these in your hosting project settings (Vercel → Settings → Environment Variables) and redeploy:</p>
          <pre className="mt-1 p-2 rounded bg-black/30 font-mono text-[11px] whitespace-pre-wrap">{`ALICE_BLUE_APP_ID=...
ALICE_BLUE_API_SECRET=...
ALICE_BLUE_USER_ID=your client id (e.g. AB123456)
SUPABASE_SERVICE_ROLE_KEY=...   (stores the daily session)`}</pre>
        </div>
      )}

      {configured && status && !status.persisted && (
        <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 text-xs text-amber-200">
          <strong>SUPABASE_SERVICE_ROLE_KEY</strong> is not set on the server, so the session lives in memory only and may be lost between requests. Add it and run <code>supabase_live_sync.sql</code>.
        </div>
      )}

      {/* Daily login */}
      <motion.div variants={itemVariants} className="p-6 rounded-xl border bg-[var(--bg-secondary)] border-[var(--border-subtle)] space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
          <div>
            <h3 className="text-sm font-bold text-[var(--text-primary)]">Daily Login (one click + your TOTP)</h3>
            <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
              Alice Blue requires one sign-in per trading day (a broker rule for every API broker in India). After that it is automatic — no copy &amp; paste.
            </p>
          </div>
          {connected && (
            <button onClick={handleDisconnect} disabled={busy === 'disconnect'}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold border-rose-500/30 text-rose-400 hover:bg-rose-500/10">
              <Unplug size={14} /> Disconnect
            </button>
          )}
        </div>

        <ol className="space-y-4 text-xs text-[var(--text-secondary)]">
          <li className="flex gap-3">
            <span className="w-6 h-6 shrink-0 rounded-full bg-indigo-600 text-white text-[11px] font-bold flex items-center justify-center">1</span>
            <div className="space-y-1.5">
              <p>Click the button and sign in with your client ID, password and TOTP.</p>
              <a href={status?.loginUrl || '#'} target="_blank" rel="noreferrer"
                onClick={() => setAwaiting(true)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold ${status?.loginUrl ? 'bg-[var(--accent-indigo)] text-white hover:brightness-110' : 'bg-[var(--bg-tertiary)] text-[var(--text-muted)] pointer-events-none'}`}>
                <ExternalLink size={13} /> Login to Alice Blue <ArrowUpRight size={12} />
              </a>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="w-6 h-6 shrink-0 rounded-full bg-indigo-600 text-white text-[11px] font-bold flex items-center justify-center">2</span>
            <div className="flex-1 space-y-2">
              <p>That's it. Alice Blue redirects back to this site and the live session is created <strong>automatically</strong>.</p>
              {connected ? (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300">
                  <CheckCircle2 size={13} /> Connected — live data is flowing to all users.
                </div>
              ) : awaiting ? (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-xs text-indigo-200">
                  <RefreshCw size={13} className="animate-spin" /> Waiting for your Alice Blue sign-in… this page updates by itself.
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] text-xs text-[var(--text-muted)]">
                  <Clock size={13} /> Not connected yet — click the button above. If the redirect doesn't complete, use the manual fallback below.
                </div>
              )}
            </div>
          </li>
          <li className="flex gap-3">
            <span className="w-6 h-6 shrink-0 rounded-full bg-indigo-600 text-white text-[11px] font-bold flex items-center justify-center">3</span>
            <div className="flex-1 space-y-2">
              <button onClick={() => setShowManual((v) => !v)} className="text-[11px] text-[var(--accent-indigo)] hover:underline">
                {showManual ? 'Hide' : 'Manual fallback — paste the authCode URL yourself'}
              </button>
              {showManual && (
                <>
                  <p className="text-[11px] text-[var(--text-muted)]">
                    If you land on a page showing <code className="px-1 rounded bg-[var(--bg-tertiary)]">authCode=…</code>, copy the whole address and paste it here:
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input value={authInput} onChange={(e) => setAuthInput(e.target.value)} placeholder="Paste redirect URL or authCode"
                      className="flex-1 px-3 py-2 rounded-lg border text-xs font-mono outline-none bg-[var(--bg-tertiary)] border-[var(--border-subtle)] text-[var(--text-primary)] focus:border-[var(--accent-indigo)]" />
                    <input value={clientId} onChange={(e) => setClientId(e.target.value.toUpperCase())} placeholder="Client ID (if not in URL)"
                      className="sm:w-48 px-3 py-2 rounded-lg border text-xs font-mono outline-none bg-[var(--bg-tertiary)] border-[var(--border-subtle)] text-[var(--text-primary)] focus:border-[var(--accent-indigo)]" />
                    <button onClick={handleGenerate} disabled={busy === 'generate' || !configured}
                      className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:brightness-110 disabled:opacity-50">
                      {busy === 'generate' ? <RefreshCw size={13} className="animate-spin" /> : <Plug size={13} />}
                      Connect & go live
                    </button>
                  </div>
                  <p className="text-[10px] text-[var(--text-muted)]">The auth code is single-use. If it fails, log in again for a fresh one.</p>
                </>
              )}
            </div>
          </li>
        </ol>

        <button onClick={() => setShowToken((v) => !v)} className="text-[11px] text-[var(--accent-indigo)] hover:underline">
          {showToken ? 'Hide' : 'Already have a userSession token? Paste it manually'}
        </button>
        {showToken && (
          <div className="flex flex-col sm:flex-row gap-2">
            <input value={clientId} onChange={(e) => setClientId(e.target.value.toUpperCase())} placeholder="Client ID"
              className="sm:w-40 px-3 py-2 rounded-lg border text-xs font-mono bg-[var(--bg-tertiary)] border-[var(--border-subtle)] text-[var(--text-primary)]" />
            <input value={manualSession} onChange={(e) => setManualSession(e.target.value)} placeholder="userSession"
              className="flex-1 px-3 py-2 rounded-lg border text-xs font-mono bg-[var(--bg-tertiary)] border-[var(--border-subtle)] text-[var(--text-primary)]" />
            <button onClick={handleManual} disabled={busy === 'manual'} className="px-4 py-2 rounded-lg text-xs font-bold bg-[var(--accent-indigo)] text-white disabled:opacity-50">Save</button>
          </div>
        )}
      </motion.div>

      {/* Static IP note */}
      <motion.div variants={itemVariants} className="p-5 rounded-xl border bg-[var(--bg-secondary)] border-[var(--border-subtle)] space-y-2">
        <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2"><Globe size={15} className="text-indigo-400" /> Static IP requirement</h3>
        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
          Alice Blue only accepts API calls from the IP registered in the A3 portal. All market data is fetched by <strong>the VPS gateway</strong>, so the registered IP must be the VPS IP (147.93.19.24){status?.ipAddress ? <> — currently saved in the gateway config as <code className="px-1 rounded bg-[var(--bg-tertiary)]">{status.ipAddress}</code></> : null}. If Alice Blue rejects requests after a VPS migration, register the new IP in My Apps and update the gateway .env.
        </p>
        <div className="flex items-center gap-2 text-xs">
          <button onClick={detectIp} className="px-2.5 py-1 rounded border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-white">Show my browser's IP</button>
          {myIp && <code className="px-1.5 py-0.5 rounded bg-[var(--bg-tertiary)] font-mono">{myIp}</code>}
        </div>
      </motion.div>

      {/* Diagnostics */}
      {diagnostics.length > 0 && (
        <motion.div variants={itemVariants} className="p-6 rounded-xl border bg-[var(--bg-secondary)] border-[var(--border-subtle)] space-y-3">
          <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2"><ShieldCheck size={15} className="text-emerald-400" /> Diagnostics</h3>
          {diagnostics.map((d, i) => (
            <div key={i} className="p-3 rounded-lg border bg-[var(--bg-tertiary)] border-[var(--border-subtle)] flex items-start gap-3">
              {d.status === 'success' ? <CheckCircle2 size={16} className="text-emerald-400 mt-0.5" /> : <AlertCircle size={16} className={`${d.status === 'warning' ? 'text-amber-400' : 'text-rose-400'} mt-0.5`} />}
              <div className="flex-1">
                <div className="text-xs font-bold text-[var(--text-primary)]">{d.step}</div>
                <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">{d.message}</p>
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Live quotes */}
      <motion.div variants={itemVariants} className="space-y-3">
        <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2"><Zap size={15} className="text-amber-400" /> Live quotes (what users see)</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEED.map((s) => quotes[s] ? <QuoteCard key={s} q={quotes[s]} /> : (
            <div key={s} className="p-4 rounded-xl border bg-[var(--bg-secondary)] border-[var(--border-subtle)] text-xs text-[var(--text-muted)]">{s}: {loaded ? 'no data' : 'loading…'}</div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}
