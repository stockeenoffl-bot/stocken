import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  TrendingUp,
  X,
  Users,
  HelpCircle,
  BarChart3,
  Shield,
  FileText,
  Check,
  ArrowRight,
  Star,
  Zap,
  Activity,
  Layers,
  Compass,
  Twitter,
  Youtube,
  Linkedin,
  Instagram,
} from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: 'easeOut' as const },
  }),
}

export default function Landing() {
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Navbar */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'border-b' : ''}`}
        style={{
          backgroundColor: scrolled ? 'rgba(11, 14, 20, 0.95)' : 'transparent',
          backdropFilter: scrolled ? 'blur(12px)' : 'none',
          borderColor: 'var(--border-subtle)',
        }}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src="/images/ZonalEdge.jpeg" alt="Zonal Edge" className="w-8 h-8 rounded-lg object-cover" />
            <div>
              <span className="text-sm font-bold text-white">Zonal Edge</span>
              <span className="text-[8px] uppercase tracking-widest block" style={{ color: 'var(--text-muted)' }}>Trade with Clarity</span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-8">
            {['Dashboard', 'Pricing', 'History', 'Features', 'About'].map((item) => (
              <button
                key={item}
                onClick={() => scrollToSection(item.toLowerCase())}
                className="text-xs font-medium transition-colors hover:text-white"
                style={{ color: 'var(--text-secondary)' }}
              >
                {item}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-xs font-medium px-4 py-2 rounded-md transition-colors hover:text-white"
              style={{ color: 'var(--text-secondary)' }}
            >
              Login
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="text-xs font-medium px-4 py-2 rounded-md text-white transition-all duration-200 hover:brightness-110"
              style={{ backgroundColor: 'var(--accent-indigo)' }}
            >
              Get Started →
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-28 pb-20 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border mb-6" style={{ backgroundColor: 'rgba(99,102,241,0.1)', borderColor: 'rgba(99,102,241,0.3)' }}>
              <Zap size={12} style={{ color: 'var(--accent-indigo)' }} />
              <span className="text-[11px] font-medium" style={{ color: 'var(--accent-indigo)' }}>Smart Market Structure Analysis</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4" style={{ color: 'var(--text-primary)' }}>
              Trade with <span style={{ color: 'var(--accent-indigo)' }}>Clarity.</span><br />
              Not Confusion.
            </h1>
            <p className="text-sm leading-relaxed mb-8 max-w-md" style={{ color: 'var(--text-secondary)' }}>
              Daily NIFTY & SENSEX analysis with precise zones, clear bias and invalidation levels. No signals. No noise. Just structured market insight.
            </p>
            <div className="flex items-center gap-3 mb-8">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-medium text-white transition-all duration-200"
                style={{ backgroundColor: 'var(--accent-indigo)', boxShadow: '0 0 30px rgba(99,102,241,0.25)' }}
              >
                Get Today's Analysis <ArrowRight size={14} />
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="px-5 py-2.5 rounded-md border text-sm font-medium transition-all duration-200 hover:bg-[var(--bg-tertiary)]"
                style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}
              >
                Start 7-Day Free Trial
              </button>
            </div>
            <div className="flex items-center gap-5">
              {[
                { icon: <X size={14} />, text: 'No Signals' },
                { icon: <X size={14} />, text: 'No Noise' },
                { icon: <Check size={14} />, text: 'Just Structure' },
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
                  <span style={{ color: f.text === 'Just Structure' ? 'var(--success)' : 'var(--text-muted)' }}>{f.icon}</span>
                  {f.text}
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}>
              <img src="/images/hero-chart.jpg" alt="Trading Dashboard" className="w-full" />
            </div>
            {/* Floating stats cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="absolute -bottom-4 -left-4 px-4 py-3 rounded-lg border"
              style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}
            >
              <div className="text-[10px] uppercase" style={{ color: 'var(--text-muted)' }}>Overall Bias</div>
              <div className="text-sm font-bold" style={{ color: 'var(--success)' }}>BULLISH</div>
              <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Above 24,220</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="absolute -top-4 -right-4 px-4 py-3 rounded-lg border"
              style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}
            >
              <div className="text-[10px] uppercase" style={{ color: 'var(--text-muted)' }}>NIFTY 50</div>
              <div className="text-sm font-mono font-bold" style={{ color: 'var(--text-primary)' }}>24,250.70</div>
              <div className="text-[10px]" style={{ color: 'var(--success)' }}>+42.10 (0.17%)</div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Problem Section */}
      <section id="features" className="py-16 px-6">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl md:text-3xl font-bold mb-4"
            style={{ color: 'var(--text-primary)' }}
          >
            Tired of random calls and confusing charts?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-sm"
            style={{ color: 'var(--text-secondary)' }}
          >
            Most traders don't lose because they lack knowledge. They lose because they <span className="font-semibold text-white">lack clarity.</span>
          </motion.p>
        </div>
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-5">
          {[
            { icon: <BarChart3 size={24} />, title: 'Too Many Indicators', desc: 'Charts overloaded leads to analysis paralysis.' },
            { icon: <Users size={24} />, title: 'Too Many Opinions', desc: 'Conflicting calls create more confusion.' },
            { icon: <HelpCircle size={24} />, title: 'No Clear Direction', desc: 'No one tells you where price will actually react.' },
          ].map((card, i) => (
            <motion.div
              key={i}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="rounded-xl border p-6 text-center transition-all duration-200 hover:border-[var(--border-active)]"
              style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}
            >
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--accent-indigo)' }}>
                {card.icon}
              </div>
              <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{card.title}</h3>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{card.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border mb-4" style={{ backgroundColor: 'rgba(99,102,241,0.1)', borderColor: 'rgba(99,102,241,0.3)' }}>
              <span className="text-[11px] font-medium" style={{ color: 'var(--accent-indigo)' }}>The Structra Solution</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              We simplify the market into one clear plan.
            </h2>
            <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
              Every day, we analyze the market structure and bring you the most important levels. No jargon. No fluff.
            </p>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: <Activity size={16} />, title: 'Precise Zones', desc: 'Bullish & bearish zones where price may react.' },
                { icon: <Compass size={16} />, title: 'Clear Bias', desc: 'Know the market bias and key breakout level.' },
                { icon: <Shield size={16} />, title: 'Invalidation Level', desc: 'Critical level that invalidates the bias.' },
                { icon: <FileText size={16} />, title: 'Simple Explanation', desc: 'Plain and simple notes. No jargon. No fluff.' },
              ].map((f, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--accent-indigo)' }}>
                    {f.icon}
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{f.title}</h4>
                    <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <img src="/images/dashboard-preview.png" alt="Dashboard Preview" className="w-full" />
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl font-bold mb-4"
            style={{ color: 'var(--text-primary)' }}
          >
            How Zonal Edge Works
          </motion.h2>
        </div>
        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8 relative">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-12 left-1/4 right-1/4 h-px" style={{ background: 'linear-gradient(90deg, var(--accent-indigo), var(--accent-purple))' }} />
          {[
            { step: '1', icon: <Activity size={24} />, title: 'We Analyze', desc: 'We analyze market structure, liquidity, momentum and key levels.' },
            { step: '2', icon: <Layers size={24} />, title: 'We Mark Key Zones', desc: 'We mark precise zones, bias and invalidation levels.' },
            { step: '3', icon: <TrendingUp size={24} />, title: 'You Trade with Clarity', desc: 'You get clarity to plan your trades and manage risk better.' },
          ].map((s, i) => (
            <motion.div
              key={i}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="text-center relative"
            >
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-sm font-bold relative z-10" style={{ background: 'linear-gradient(135deg, var(--accent-indigo), var(--accent-purple))' }}>
                {s.step}
              </div>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--accent-indigo)' }}>
                {s.icon}
              </div>
              <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{s.title}</h3>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Not a Signal Service */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
              Not a Signal Service.<br />
              We Provide <span style={{ color: 'var(--accent-indigo)' }}>Clarity.</span>
            </h2>
            <div className="rounded-xl border p-6" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}>
              <div className="text-3xl mb-3" style={{ color: 'var(--accent-indigo)' }}>"</div>
              <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                We don't predict the market. We prepare you for it.
              </p>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="rounded-xl border overflow-hidden" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}
          >
            <div className="grid grid-cols-3 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
              <div className="px-4 py-3 text-xs font-medium" style={{ color: 'var(--text-muted)' }}></div>
              <div className="px-4 py-3 text-xs font-semibold text-center" style={{ color: 'var(--text-muted)' }}>Others</div>
              <div className="px-4 py-3 text-xs font-semibold text-center" style={{ color: 'var(--accent-indigo)' }}>Zonal Edge</div>
            </div>
            {[
              { feature: 'Buy / Sell Signals', others: false, us: true },
              { feature: 'Fake Targets', others: false, us: true },
              { feature: '100% Accuracy Claims', others: false, us: true },
              { feature: 'Market Structure', others: false, us: true },
              { feature: 'Risk Management', others: false, us: true },
              { feature: 'Decision Clarity', others: false, us: true },
            ].map((row, i) => (
              <div key={i} className="grid grid-cols-3 border-b last:border-b-0" style={{ borderColor: 'var(--border-subtle)' }}>
                <div className="px-4 py-3 text-xs" style={{ color: 'var(--text-secondary)' }}>{row.feature}</div>
                <div className="px-4 py-3 flex justify-center">
                  {row.others ? <Check size={14} style={{ color: 'var(--success)' }} /> : <X size={14} style={{ color: 'var(--danger)' }} />}
                </div>
                <div className="px-4 py-3 flex justify-center">
                  {row.us ? <Check size={14} style={{ color: 'var(--success)' }} /> : <X size={14} style={{ color: 'var(--danger)' }} />}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Product Preview */}
      <section id="dashboard" className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-between mb-8"
          >
            <div>
              <span className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--accent-indigo)' }}>Product Preview</span>
              <h2 className="text-2xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>Your daily trading dashboard</h2>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Everything you need. Nothing you don't.</p>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="hidden md:flex items-center gap-2 px-4 py-2 rounded-md border text-xs font-medium transition-all hover:bg-[var(--bg-tertiary)]"
              style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}
            >
              Explore Dashboard <ArrowRight size={12} />
            </button>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="rounded-xl border overflow-hidden"
            style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}
          >
            <img src="/images/hero-chart.jpg" alt="Dashboard" className="w-full" />
          </motion.div>
        </div>
      </section>

      {/* Real Analysis Results */}
      <section id="history" className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-8"
          >
            <span className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--accent-indigo)' }}>Proof, Not Promises</span>
            <h2 className="text-2xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>Real analysis. Real results.</h2>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>See verified past examples from our analysis.</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { date: '24 Apr 2025', type: 'Bullish Zone', result: '+188.45 pts', desc: 'Price bounced perfectly from our bullish zone.' },
              { date: '22 Apr 2025', type: 'Bearish Zone', result: '+156.20 pts', desc: 'Bearish zone respected and price moved down.' },
              { date: '18 Apr 2025', type: 'Bullish Bias', result: '+132.45 pts', desc: 'Bullish bias worked as expected all day.' },
            ].map((card, i) => (
              <motion.div
                key={i}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="rounded-xl border p-5 transition-all duration-200 hover:border-[var(--border-active)]"
                style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{card.date}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success)' }}>{card.type}</span>
                </div>
                <div className="text-lg font-mono font-bold mb-2" style={{ color: card.result.startsWith('+') ? 'var(--success)' : 'var(--danger)' }}>{card.result}</div>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{card.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl font-bold text-center mb-10"
            style={{ color: 'var(--text-primary)' }}
          >
            Loved by Traders
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { name: 'Rahul Sharma', role: 'Options Trader', image: '/images/testimonial-1.jpg', quote: 'Finally a platform that shows the real levels that matter. My consistency has improved a lot.', rating: 5 },
              { name: 'Aman Verma', role: 'Swing Trader', image: '/images/testimonial-2.jpg', quote: 'Clear bias and invalidation levels help me avoid bad trades. Highly recommended!', rating: 5 },
              { name: 'Neha Patel', role: 'Full-time Trader', image: '/images/testimonial-3.jpg', quote: 'Simple, clean and effective. Exactly what I was looking for.', rating: 5 },
            ].map((t, i) => (
              <motion.div
                key={i}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="rounded-xl border p-5 transition-all duration-200 hover:border-[var(--border-active)]"
                style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}
              >
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} size={12} fill="var(--warning)" style={{ color: 'var(--warning)' }} />
                  ))}
                </div>
                <p className="text-xs leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <img src={t.image} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <div className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{t.name}</div>
                    <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid lg:grid-cols-2 gap-8 items-center rounded-2xl border p-8"
            style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}
          >
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                Simple Pricing.<br />
                Serious Value.
              </h2>
              <p className="text-xs mb-6" style={{ color: 'var(--text-muted)' }}>Everything you need to trade with clarity.</p>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>₹499</span>
                <span className="text-sm" style={{ color: 'var(--text-muted)' }}>/ month</span>
              </div>
              <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Cancel anytime. No hidden charges.</p>
            </div>
            <div>
              <div className="rounded-xl border p-6 mb-4" style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-subtle)' }}>
                <div className="text-[10px] uppercase tracking-wider mb-4 font-semibold" style={{ color: 'var(--accent-indigo)' }}>Pro Plan</div>
                <ul className="space-y-2 mb-6">
                  {[
                    'Daily NIFTY & SENSEX Analysis',
                    'Zones, Bias & Invalidation Levels',
                    'Session Expectations',
                    'Detailed Explanations',
                    'History & Performance',
                    'Priority Updates',
                  ].map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                      <Check size={14} style={{ color: 'var(--success)' }} /> {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="w-full py-2.5 rounded-md text-sm font-medium text-white transition-all duration-200 hover:brightness-110"
                  style={{ backgroundColor: 'var(--accent-indigo)', boxShadow: '0 0 20px rgba(99,102,241,0.25)' }}
                >
                  Start 7-Day Free Trial
                </button>
                <p className="text-[10px] text-center mt-2" style={{ color: 'var(--text-muted)' }}>No credit card required</p>
              </div>
              <p className="text-[10px] text-center" style={{ color: 'var(--text-muted)' }}>Limited time early pricing</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-5xl mx-auto rounded-2xl p-10 text-center relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #1A2035 0%, #232A45 50%, #1A2035 100%)', border: '1px solid var(--border-subtle)' }}
        >
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(99,102,241,0.3) 1px, transparent 0)', backgroundSize: '32px 32px' }} />
          <div className="relative z-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
              Stop guessing. Start trading with structure.
            </h2>
            <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>
              Join traders who trade with clarity and consistency every day.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 px-6 py-2.5 rounded-md text-sm font-medium transition-all duration-200 hover:brightness-110"
                style={{ backgroundColor: 'var(--accent-indigo)', color: '#fff', boxShadow: '0 0 30px rgba(99,102,241,0.25)' }}
              >
                Get Today's Analysis <ArrowRight size={14} />
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="px-6 py-2.5 rounded-md border text-sm font-medium transition-all duration-200 hover:bg-[var(--bg-tertiary)]"
                style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}
              >
                Start Free Trial
              </button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 px-6" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-5 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <img src="/images/ZonalEdge.jpeg" alt="Zonal Edge" className="w-6 h-6 rounded-lg object-cover" />
                <span className="text-sm font-bold text-white">Zonal Edge</span>
              </div>
              <p className="text-xs mb-4 max-w-xs" style={{ color: 'var(--text-muted)' }}>
                Trade with clarity, not confusion.
              </p>
              <div className="flex items-center gap-3">
                {[Twitter, Youtube, Linkedin, Instagram].map((Icon, i) => (
                  <button key={i} className="w-8 h-8 rounded-md flex items-center justify-center transition-colors hover:bg-[var(--bg-tertiary)]" style={{ color: 'var(--text-muted)' }}>
                    <Icon size={14} />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-xs font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Product</h4>
              <ul className="space-y-2">
                {['Dashboard', 'Analysis', 'Features', 'Pricing', 'History'].map((l) => (
                  <li key={l}><button onClick={() => scrollToSection(l.toLowerCase())} className="text-xs transition-colors hover:text-white" style={{ color: 'var(--text-muted)' }}>{l}</button></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Company</h4>
              <ul className="space-y-2">
                {['Terms of Use', 'Privacy Policy', 'Refund Policy', 'Careers', 'Terms of Service'].map((l) => (
                  <li key={l}><span className="text-xs" style={{ color: 'var(--text-muted)' }}>{l}</span></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Disclaimer</h4>
              <p className="text-[10px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                This platform is for educational purposes only. We do not provide any buy/sell signals or financial advice. Please consult your financial advisor before making any investment decisions.
              </p>
            </div>
          </div>
          <div className="border-t pt-6 flex items-center justify-between" style={{ borderColor: 'var(--border-subtle)' }}>
            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>© 2025 Zonal Edge. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
