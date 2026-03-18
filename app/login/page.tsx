'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth, MASTER_ADMIN_EMAIL } from '@/lib/auth-context'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const { signIn, user, loading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo')

  const [formData, setFormData] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Flag set by handleSubmit so the useEffect doesn't fire a competing
  // redirect while handleSubmit is already mid-execution.
  const isSubmittingRef = useRef(false)

  // Handles only the "already logged in, navigated back to /login" case.
  // Post-login redirects are owned exclusively by handleSubmit.
  useEffect(() => {
    if (loading || !user || isSubmittingRef.current) return

    const go = async () => {
      if (redirectTo) { router.replace(redirectTo); return }
      if (user.email === MASTER_ADMIN_EMAIL) { router.replace('/admin'); return }

      const { data } = await supabase
        .from('profiles').select('role').eq('id', user.id).single()
      router.replace(data?.role === 'admin' ? '/admin' : '/')
    }
    go()
  }, [loading, user, redirectTo, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    isSubmittingRef.current = true  // block useEffect for the duration

    try {
      const { error: signInError } = await signIn(formData.email, formData.password)
      if (signInError) {
        setError(signInError.message)
        return
      }

      const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser()
      if (userError || !currentUser) {
        setError('Signed in but could not load your account. Please refresh.')
        return
      }

      // Master-key shortcut — no DB query needed
      if (currentUser.email === MASTER_ADMIN_EMAIL) {
        router.push(redirectTo ?? '/admin')
        return
      }

      const { data: profileData, error: profileError } = await supabase
        .from('profiles').select('role').eq('id', currentUser.id).single()

      if (profileError || !profileData) {
        setError('Could not fetch your account role. Please try again.')
        return
      }

      // Single redirect — only after role is confirmed
      router.push(redirectTo ?? (profileData.role === 'admin' ? '/admin' : '/'))

    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred')
    } finally {
      setIsLoading(false)
      isSubmittingRef.current = false
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
            <p className="text-gray-600">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link href="/signup" className="text-blue-600 hover:underline font-medium">
                Sign up
              </Link>
            </p>
          </div>

          <div className="mt-4 text-center">
            <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
              ← Back to store
            </Link>
          </div>
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm font-medium text-blue-900 mb-2">Demo Credentials:</p>
          <p className="text-xs text-blue-800">Admin: admin@example.com / admin123</p>
          <p className="text-xs text-blue-800">User: user@example.com / user123</p>
        </div>
      </div>
    </div>
  )
}
