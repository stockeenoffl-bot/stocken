import React, { createContext, useContext, useEffect, useState } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  display_name: string | null
  avatar_url: string | null
  role: 'super_admin' | 'admin' | 'analyst' | 'user'
  status: 'active' | 'inactive' | 'suspended' | 'banned' | 'pending'
}

interface AuthContextType {
  session: Session | null
  user: User | null
  profile: Profile | null
  loading: boolean
  isAdmin: boolean
  isSuperAdmin: boolean
  isUser: boolean
  hasAdminAccess: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  elevateToAdmin: () => void
  elevateToSuperAdmin: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  loading: true,
  isAdmin: false,
  isSuperAdmin: false,
  isUser: true,
  hasAdminAccess: false,
  signOut: async () => {},
  refreshProfile: async () => {},
  elevateToAdmin: () => {},
  elevateToSuperAdmin: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = async (userId: string) => {
    try {
      const { data: authData } = await supabase.auth.getUser()
      const userEmail = authData?.user?.email?.toLowerCase().trim() || ''

      // Configured admin emails
      const envAdminEmails = (import.meta.env.VITE_ADMIN_EMAILS as string || '')
        .toLowerCase()
        .split(',')
        .map(e => e.trim())
        .filter(Boolean)
      const isKnownAdminEmail = userEmail === 'stockenofficial@gmail.com' || envAdminEmails.includes(userEmail)

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error || !data) {
        // Self-healing: Create profile with admin if known admin email, otherwise user
        const assignedRole = isKnownAdminEmail ? 'admin' : 'user'
        const userDisplayName = isKnownAdminEmail ? 'Admin' : 'User'
        const userFullName = authData?.user?.user_metadata?.full_name || authData?.user?.email?.split('@')[0] || (isKnownAdminEmail ? 'Admin' : 'User')

        if (authData?.user) {
          const { data: newProfile } = await supabase
            .from('profiles')
            .upsert(
              {
                id: userId,
                email: authData.user.email || '',
                full_name: userFullName,
                display_name: userDisplayName,
                role: assignedRole,
                status: 'active',
              },
              { onConflict: 'id' }
            )
            .select()
            .single()

          if (newProfile) {
            setProfile(newProfile)
          } else {
            // In-memory fallback
            setProfile({
              id: userId,
              email: authData.user.email || '',
              full_name: userFullName,
              display_name: userDisplayName,
              avatar_url: null,
              role: assignedRole,
              status: 'active',
            })
          }
        }
      } else {
        // If it is a known admin email and not yet admin in db, auto-upgrade in DB & memory
        if (isKnownAdminEmail && data.role !== 'admin') {
          supabase.from('profiles').update({ role: 'admin' }).eq('id', userId).then(() => {})
          setProfile({ ...data, role: 'admin' })
        } else {
          setProfile(data)
        }
      }
    } catch (err) {
      console.error('Unexpected error fetching profile:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const isSuperAdmin = Boolean(profile?.role === 'super_admin')
  const isAdmin = Boolean(profile && ['admin', 'super_admin', 'analyst'].includes(profile.role))
  const isUser = Boolean(!profile || profile.role === 'user')
  const hasAdminAccess = isAdmin

  const elevateToSuperAdmin = async () => {
    await elevateToAdmin()
  }

  const elevateToAdmin = async () => {
    if (user && profile) {
      const updated: Profile = { ...profile, role: 'admin' }
      setProfile(updated)
      try {
        await supabase.from('profiles').update({ role: 'admin' }).eq('id', user.id)
      } catch (err) {
        console.warn('Could not persist admin role to DB:', err)
      }
    }
  }

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id)
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setSession(null)
    setUser(null)
    setProfile(null)
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        loading,
        isAdmin,
        isSuperAdmin,
        isUser,
        hasAdminAccess,
        signOut,
        refreshProfile,
        elevateToAdmin,
        elevateToSuperAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
