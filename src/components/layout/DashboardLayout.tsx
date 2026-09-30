import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Sidebar from './Sidebar'
import TopHeader from './TopHeader'
import { ChevronUp, ChevronDown, Radio } from 'lucide-react'

export default function DashboardLayout({ isClient = false }: { isClient?: boolean }) {
  const location = useLocation()

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <Sidebar isClient={isClient} />
      <TopHeader />

      <main
        className="pt-16 pb-8 transition-all duration-300"
        style={{ marginLeft: 'var(--sidebar-width)' }}
      >


        {/* Page Content */}
        <div className="px-6 pt-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}
