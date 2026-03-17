'use client'

import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react'
import { supabase } from './supabase'
import { User } from '@supabase/supabase-js'

// The master-key email — grants admin access even if the DB profile is delayed
const MASTER_ADMIN_EMAIL = 'wachiraderrick01@gmail.com'

interface UserProfile {
  id: string
  email: string
  role: 'admin' | 'user'
  full_name?: string
}

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  /** true while the initial session + profile fetch is in flight */
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

  // Prevent fetchProfile from running concurrently (the double-fire race)
  const fetchingRef = useRef(false)

  const fetchProfile = async (userId: string) => {
    if (fetchingRef.current) return
    fetchingRef.current = true

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
      fetchingRef.current = false
      setLoading(false)
    }
  }

  useEffect(() => {
    // onAuthStateChange fires immediately with the current session,
    // so we don't need a separate getSession() call — that's what caused
    // the double fetchProfile race.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)

      if (currentUser) {
        fetchProfile(currentUser.id)
      } else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const refreshProfile = async () => {
    if (user) {
      fetchingRef.current = false // allow a fresh fetch
      await fetchProfile(user.id)
    }
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
    setUser(null)
    setProfile(null)
  }

  // isAdmin: DB role OR master-key email (checked against user, not profile,
  // so it works even before the profile fetch completes)
  const isAdmin =
    profile?.role === 'admin' || user?.email === MASTER_ADMIN_EMAIL

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
