import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
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
  LineChart,
} from 'lucide-react'
import LiveChart from '@/components/charts/LiveChart'

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
          <div className="hidden md:flex items-center gap-6">
            <button
              onClick={() => scrollToSection('live-chart')}
              className="text-xs font-medium transition-colors hover:text-white flex items-center gap-1"
              style={{ color: 'var(--accent-indigo)' }}
            >
              <LineChart size={13} /> Live Chart
            </button>
            {['Pricing', 'Features'].map((item) => (
              <button
                key={item}
                onClick={() => scrollToSection(item.toLowerCase())}
                className="text-xs font-medium transition-colors hover:text-white"
                style={{ color: 'var(--text-secondary)' }}
              >
                {item}
              </button>
            ))}
            <Link
              to="/about"
              className="text-xs font-medium transition-colors hover:text-white"
              style={{ color: 'var(--text-secondary)' }}
            >
              About Us
            </Link>
            <Link
              to="/contact"
              className="text-xs font-medium transition-colors hover:text-white"
              style={{ color: 'var(--text-secondary)' }}
            >
              Contact
            </Link>
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
              <span className="text-[11px] font-medium" style={{ color: 'var(--accent-indigo)' }}>The Zonal Edge Solution</span>
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

      {/* Live Alice Blue Chart Showcase */}
      <section id="live-chart" className="py-16 px-6 border-t border-b" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}>
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border mb-3" style={{ backgroundColor: 'rgba(99,102,241,0.1)', borderColor: 'rgba(99,102,241,0.3)' }}>
                <LineChart size={13} style={{ color: 'var(--accent-indigo)' }} />
                <span className="text-[11px] font-semibold" style={{ color: 'var(--accent-indigo)' }}>Live Market Terminal</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                See the Live Market Chart
              </h2>
              <p className="text-xs md:text-sm mt-1 max-w-xl" style={{ color: 'var(--text-secondary)' }}>
                Real-time NSE candles streamed from Alice Blue across every timeframe, with expert supply and demand zones published live by our analysts.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/register')}
                className="px-4 py-2 rounded-md text-xs font-semibold text-white transition-all hover:brightness-110"
                style={{ backgroundColor: 'var(--accent-indigo)' }}
              >
                Unlock Pro Zones →
              </button>
            </div>
          </div>

          <div className="shadow-2xl rounded-xl overflow-hidden border" style={{ borderColor: 'var(--border-subtle)' }}>
            <LiveChart symbol="NIFTY 50" height={520} />
          </div>
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
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
              Not a Signal Service.<br />
              We Provide <span style={{ color: 'var(--accent-indigo)' }}>Clarity.</span>
            </h2>
            <div className="rounded-xl border p-6 max-w-xl mx-auto" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}>
              <div className="text-3xl mb-3" style={{ color: 'var(--accent-indigo)' }}>"</div>
              <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                We don't predict the market. We prepare you for it.
              </p>
            </div>
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

      {/* Pricing - All 4 Compliance Plans in INR */}
      <section id="pricing" className="py-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-[var(--accent-indigo)] border border-indigo-500/20 mb-3">
              Transparent Indian Rupee (INR) Pricing
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3" style={{ color: 'var(--text-primary)' }}>
              Simple Pricing. Serious Value.
            </h2>
            <p className="text-xs sm:text-sm" style={{ color: 'var(--text-muted)' }}>
              Choose the plan that suits your trading discipline. All fees are in Indian Rupees (₹) with zero hidden deductions.
            </p>
          </div>

          {/* 4 Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Product 1: Free Trial – 7 Days */}
            <div
              className="p-6 rounded-2xl border flex flex-col justify-between transition-all"
              style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}
            >
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Trial Period</span>
                <h3 className="text-lg font-bold mt-1 mb-2" style={{ color: 'var(--text-primary)' }}>
                  Free Trial – 7 Days
                </h3>
                <div className="flex items-baseline gap-1 mb-3 pb-3 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                  <span className="text-3xl font-extrabold" style={{ color: 'var(--text-primary)' }}>₹0</span>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>/ 7 days</span>
                </div>
                <p className="text-xs mb-4 min-h-[32px]" style={{ color: 'var(--text-secondary)' }}>
                  Complimentary 7-day evaluation. No credit card required.
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-start gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                    <Check size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                    <span>Access to 1 analysis/zone per day</span>
                  </li>
                  <li className="flex items-start gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                    <Check size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                    <span>End-of-day (EOD) full market analysis</span>
                  </li>
                  <li className="flex items-start gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                    <Check size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                    <span>NIFTY 50 & SENSEX levels</span>
                  </li>
                </ul>
              </div>

              <div>
                <button
                  onClick={() => navigate('/register')}
                  className="w-full py-2.5 rounded-xl text-xs font-bold transition-all hover:brightness-110"
                  style={{ backgroundColor: 'var(--bg-tertiary)', color: '#fff', border: '1px solid var(--border-subtle)' }}
                >
                  Start 7-Day Free Trial
                </button>
                <p className="text-[10px] text-center mt-2" style={{ color: 'var(--text-muted)' }}>
                  Expires automatically after 7 days
                </p>
              </div>
            </div>

            {/* Product 2: Monthly Subscription */}
            <div
              className="p-6 rounded-2xl border flex flex-col justify-between transition-all relative shadow-xl"
              style={{ backgroundColor: 'rgba(99, 102, 241, 0.08)', borderColor: 'rgba(99, 102, 241, 0.4)' }}
            >
              <div className="absolute -top-3 right-4">
                <span className="px-3 py-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-[9px] font-black rounded-full uppercase tracking-wider shadow">
                  MOST POPULAR
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent-indigo)]">Monthly Plan</span>
                <h3 className="text-lg font-bold mt-1 mb-2" style={{ color: 'var(--text-primary)' }}>
                  Monthly Subscription
                </h3>
                <div className="flex items-baseline gap-1 mb-3 pb-3 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                  <span className="text-3xl font-extrabold" style={{ color: 'var(--text-primary)' }}>₹499</span>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>/ 1 month</span>
                </div>
                <p className="text-xs mb-4 min-h-[32px]" style={{ color: 'var(--text-secondary)' }}>
                  Full intraday and swing market structure intelligence.
                </p>
                <ul className="space-y-2 mb-6">
                  {[
                    'Multiple market zones',
                    'Liquidation levels',
                    'Invalidation levels',
                    'Detailed market analysis',
                    'Open Interest (OI) data',
                  ].map((feat, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                      <Check size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <button
                  onClick={() => navigate('/register')}
                  className="w-full py-2.5 rounded-xl text-xs font-bold text-white transition-all hover:brightness-110 shadow-lg"
                  style={{ backgroundColor: 'var(--accent-indigo)' }}
                >
                  Get Monthly Access (₹499)
                </button>
                <p className="text-[10px] text-center mt-2" style={{ color: 'var(--text-muted)' }}>
                  Non-refundable upon billing
                </p>
              </div>
            </div>

            {/* Product 3: Quarterly Subscription */}
            <div
              className="p-6 rounded-2xl border flex flex-col justify-between transition-all"
              style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}
            >
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">Quarterly Plan</span>
                <h3 className="text-lg font-bold mt-1 mb-2" style={{ color: 'var(--text-primary)' }}>
                  Quarterly Subscription
                </h3>
                <div className="flex items-baseline gap-1 mb-3 pb-3 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                  <span className="text-3xl font-extrabold" style={{ color: 'var(--text-primary)' }}>₹1,299</span>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>/ 3 months</span>
                </div>
                <p className="text-xs mb-4 min-h-[32px]" style={{ color: 'var(--text-secondary)' }}>
                  Save over 13% with 3 continuous months of market structure.
                </p>
                <ul className="space-y-2 mb-6">
                  {[
                    'Multiple market zones',
                    'Liquidation levels',
                    'Invalidation levels',
                    'Detailed market analysis',
                    'Open Interest (OI) data',
                  ].map((feat, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                      <Check size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <button
                  onClick={() => navigate('/register')}
                  className="w-full py-2.5 rounded-xl text-xs font-bold transition-all hover:brightness-110"
                  style={{ backgroundColor: 'var(--bg-tertiary)', color: '#fff', border: '1px solid var(--border-subtle)' }}
                >
                  Get Quarterly Access (₹1,299)
                </button>
                <p className="text-[10px] text-center mt-2" style={{ color: 'var(--text-muted)' }}>
                  Save ₹198 over monthly
                </p>
              </div>
            </div>

            {/* Product 4: Annual Subscription */}
            <div
              className="p-6 rounded-2xl border flex flex-col justify-between transition-all"
              style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}
            >
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Annual Plan</span>
                <h3 className="text-lg font-bold mt-1 mb-2" style={{ color: 'var(--text-primary)' }}>
                  Annual Subscription
                </h3>
                <div className="flex items-baseline gap-1 mb-3 pb-3 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                  <span className="text-3xl font-extrabold" style={{ color: 'var(--text-primary)' }}>₹4,999</span>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>/ 12 months</span>
                </div>
                <p className="text-xs mb-4 min-h-[32px]" style={{ color: 'var(--text-secondary)' }}>
                  Complete 1-year institutional zone access & maximum savings.
                </p>
                <ul className="space-y-2 mb-6">
                  {[
                    'Multiple market zones',
                    'Liquidation levels',
                    'Invalidation levels',
                    'Detailed market analysis',
                    'Open Interest (OI) data',
                  ].map((feat, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                      <Check size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <button
                  onClick={() => navigate('/register')}
                  className="w-full py-2.5 rounded-xl text-xs font-bold transition-all hover:brightness-110"
                  style={{ backgroundColor: 'var(--bg-tertiary)', color: '#fff', border: '1px solid var(--border-subtle)' }}
                >
                  Get Annual Access (₹4,999)
                </button>
                <p className="text-[10px] text-center mt-2" style={{ color: 'var(--text-muted)' }}>
                  Save ₹989 annually
                </p>
              </div>
            </div>
          </div>

          {/* Pre-Checkout Legal Terms & Policy Notices */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            <div className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] space-y-1.5">
              <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">Refund Policy</span>
              <p className="text-xs text-[var(--text-secondary)] italic leading-relaxed">
                “All purchases and subscription payments made on Zonal Edge are final and non-refundable. Once a purchase is completed, no refunds will be issued. Users are advised to review the subscription plan and service details carefully before making a payment.”
              </p>
            </div>

            <div className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] space-y-1.5">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Cancellation Policy</span>
              <p className="text-xs text-[var(--text-secondary)] italic leading-relaxed">
                “Users can cancel their subscription at any time during the free trial period. Once the free trial ends and a paid subscription begins, the subscription payment is non-refundable. Users should review the applicable subscription terms before proceeding with payment.”
              </p>
            </div>
          </div>
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
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => navigate('/register')}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 hover:brightness-110 shadow-lg"
                style={{ backgroundColor: 'var(--accent-indigo)', color: '#fff' }}
              >
                Start 7-Day Free Trial (₹0) <ArrowRight size={14} />
              </button>
              <Link
                to="/about"
                className="px-6 py-2.5 rounded-xl border text-sm font-medium transition-all duration-200 hover:bg-[var(--bg-tertiary)]"
                style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}
              >
                Learn About Zonal Edge
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer - Full Compliance Details */}
      <footer className="border-t py-12 px-6" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}>
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="grid md:grid-cols-5 gap-8">
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center gap-2">
                <img src="/images/ZonalEdge.jpeg" alt="Zonal Edge" className="w-7 h-7 rounded-lg object-cover" />
                <span className="text-base font-bold text-white">Zonal Edge</span>
              </div>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed max-w-sm">
                Market analysis and educational platform designed to help traders understand market structure and key price zones in the Indian stock market (Nifty and Sensex).
              </p>
              <div className="pt-1 text-[11px] text-[var(--text-muted)] space-y-1">
                <p><strong>Trade Name:</strong> Vedgetechnologies</p>
                <p><strong>Legal Name:</strong> Viknesh</p>
                <p><strong>Registered Address:</strong> 4, Muslim Kallaray Street, Nethaji Nagar II, Uppalam, Puducherry – 605001, India</p>
                <p><strong>Business Email:</strong> support@zonaledge.com</p>
              </div>

            </div>

            <div>
              <h4 className="text-xs font-semibold mb-3 text-[var(--text-primary)]">Platform</h4>
              <ul className="space-y-2 text-xs">
                {['Features', 'Pricing'].map((l) => (
                  <li key={l}>
                    <button
                      onClick={() => scrollToSection(l.toLowerCase())}
                      className="text-[var(--text-muted)] hover:text-white transition-colors"
                    >
                      {l}
                    </button>
                  </li>
                ))}
                <li>
                  <Link to="/about" className="text-[var(--text-muted)] hover:text-white transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-[var(--text-muted)] hover:text-white transition-colors">
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold mb-3 text-[var(--text-primary)]">Compliance & Legal</h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link to="/terms" className="text-[var(--text-muted)] hover:text-white transition-colors">
                    Terms & Conditions
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="text-[var(--text-muted)] hover:text-white transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/refund-policy" className="text-[var(--text-muted)] hover:text-white transition-colors">
                    Return & Refund Policy
                  </Link>
                </li>
                <li>
                  <Link to="/cancellation-policy" className="text-[var(--text-muted)] hover:text-white transition-colors">
                    Cancellation Policy
                  </Link>
                </li>
                <li>
                  <Link to="/sebi-disclaimer" className="text-[var(--text-muted)] hover:text-white transition-colors">
                    SEBI Disclaimer
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold mb-3 text-[var(--text-primary)]">Statutory Disclaimer</h4>
              <p className="text-[10px] leading-relaxed text-[var(--text-muted)]">
                Zonal Edge is operated by Vedgetechnologies. Intended for informational and educational purposes only. The platform does not guarantee profits or specific trading outcomes. Users are responsible for their own trading decisions and should understand market risks.
              </p>
            </div>
          </div>

          <div className="border-t pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[var(--text-muted)]" style={{ borderColor: 'var(--border-subtle)' }}>
            <p>© 2026 Vedgetechnologies (Zonal Edge). All rights reserved.</p>
            <p>https://www.zonaledge.com &middot; Puducherry, India</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
