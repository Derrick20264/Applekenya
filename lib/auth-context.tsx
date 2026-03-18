'use client'

import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react'
import { supabase } from './supabase'
import { User } from '@supabase/supabase-js'

export const MASTER_ADMIN_EMAIL = 'wachiraderrick01@gmail.com'

interface UserProfile {
  id: string
  email: string
  role: 'admin' | 'user'
  full_name?: string
}

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  isAdmin: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  // Track which userId we last fetched so we don't double-fetch for the
  // same user, but DO allow a fresh fetch when the user changes.
  const lastFetchedUserId = useRef<string | null>(null)

  const fetchProfile = async (userId: string) => {
    // Skip if we already fetched for this exact user id
    if (lastFetchedUserId.current === userId) return
    lastFetchedUserId.current = userId

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      setProfile(data)
    } catch (err) {
      console.error('Error fetching profile:', err)
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // onAuthStateChange fires immediately with the current session on mount,
    // so no separate getSession() call is needed (that caused the double-fetch).
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)

      if (currentUser) {
        fetchProfile(currentUser.id)
      } else {
        // Signed out — reset everything
        lastFetchedUserId.current = null
        setProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const refreshProfile = async () => {
    if (!user) return
    // Force a fresh fetch by clearing the cache ref
    lastFetchedUserId.current = null
    await fetchProfile(user.id)
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }

  const signUp = async (email: string, password: string, fullName?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })

    if (data.user && !error) {
      await supabase.from('profiles').insert({
        id: data.user.id,
        email: data.user.email,
        full_name: fullName,
        role: 'user',
      })
    }

    return { error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    lastFetchedUserId.current = null
    setUser(null)
    setProfile(null)
  }

  // isAdmin is derived from the DB role OR the master-key email.
  // Checking user?.email (not profile?.email) means the master key works
  // immediately after sign-in, before the profile fetch completes.
  const isAdmin = profile?.role === 'admin' || user?.email === MASTER_ADMIN_EMAIL

  return (
    <AuthContext.Provider
      value={{ user, profile, loading, isAdmin, signIn, signUp, signOut, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
