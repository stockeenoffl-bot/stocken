import React, { createContext, useContext, useEffect, useState } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  display_name: string | null
  avatar_url: string | null
  role: 'super_admin' | 'admin' | 'analyst' | 'support' | 'subscriber'
  status: 'active' | 'inactive' | 'suspended' | 'banned' | 'pending'
}

interface AuthContextType {
  session: Session | null
  user: User | null
  profile: Profile | null
  loading: boolean
  isSuperAdmin: boolean
  isAdmin: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  elevateToSuperAdmin: () => void
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  loading: true,
  isSuperAdmin: false,
  isAdmin: false,
  signOut: async () => {},
  refreshProfile: async () => {},
  elevateToSuperAdmin: () => {},
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
        // Self-healing: Create profile with super_admin if known admin email
        const assignedRole = isKnownAdminEmail ? 'super_admin' : 'subscriber'
        if (authData?.user) {
          const { data: newProfile } = await supabase
            .from('profiles')
            .upsert(
              {
                id: userId,
                email: authData.user.email || '',
                full_name: authData.user.user_metadata?.full_name || null,
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
              full_name: authData.user.user_metadata?.full_name || 'Admin',
              display_name: 'Super Admin',
              avatar_url: null,
              role: assignedRole,
              status: 'active',
            })
          }
        }
      } else {
        // If it is a known admin email and not yet super_admin in db, auto-upgrade in DB & memory
        if (isKnownAdminEmail && data.role !== 'super_admin') {
          supabase.from('profiles').update({ role: 'super_admin' }).eq('id', userId).then(() => {})
          setProfile({ ...data, role: 'super_admin' })
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
  const isAdmin = Boolean(profile && ['super_admin', 'admin', 'analyst'].includes(profile.role))

  const elevateToSuperAdmin = async () => {
    if (user && profile) {
      const updated: Profile = { ...profile, role: 'super_admin' }
      setProfile(updated)
      try {
        await supabase.from('profiles').update({ role: 'super_admin' }).eq('id', user.id)
      } catch (err) {
        console.warn('Could not persist super_admin role to DB:', err)
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
        isSuperAdmin,
        isAdmin,
        signOut,
        refreshProfile,
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
