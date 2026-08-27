import { Routes, Route } from 'react-router-dom'
import { MarketProvider } from '@/contexts/MarketContext'
import { AnalysisProvider } from '@/contexts/AnalysisContext'
import { AuthProvider } from '@/contexts/AuthContext'
import { AdminRoute, ClientRoute, PublicRoute } from '@/components/layout/RouteGuards'

import DashboardLayout from '@/components/layout/DashboardLayout'
import Landing from '@/pages/Landing'
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import Dashboard from '@/pages/Dashboard'
import Create from '@/pages/Create'
import Preview from '@/pages/Preview'
import OI from '@/pages/OI'
import Users from '@/pages/Users'
import Subscriptions from '@/pages/Subscriptions'
import Notifications from '@/pages/Notifications'
import Learning from '@/pages/Learning'
import Security from '@/pages/Security'
import Home from '@/pages/Home' // We'll create this or use existing

export default function App() {
  return (
    <AuthProvider>
      <MarketProvider>
        <AnalysisProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            
            <Route element={<PublicRoute />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Route>

            {/* Admin Routes */}
            <Route element={<AdminRoute />}>
              <Route element={<DashboardLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/users" element={<Users />} />
                <Route path="/subscriptions" element={<Subscriptions />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/learning" element={<Learning />} />
                <Route path="/security" element={<Security />} />
                <Route path="/create" element={<Create />} />
                <Route path="/preview" element={<Preview />} />
                <Route path="/oi" element={<OI />} />
              </Route>
            </Route>

            {/* Client Routes - We'll reuse DashboardLayout or create a ClientLayout later */}
            <Route element={<ClientRoute />}>
              <Route path="/app" element={
                <DashboardLayout isClient={true} />
              }>
                <Route index element={<Home />} />
                <Route path="oi" element={<OI />} />
                <Route path="learning" element={<Learning />} />
                <Route path="notifications" element={<Notifications />} />
                <Route path="subscription" element={<Subscriptions isClient={true} />} />
              </Route>
            </Route>
            
          </Routes>
        </AnalysisProvider>
      </MarketProvider>
    </AuthProvider>
  )
}
