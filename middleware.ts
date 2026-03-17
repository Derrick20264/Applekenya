import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  // createMiddlewareClient refreshes the session cookie so the client-side
  // AuthContext always receives a valid, non-expired session.
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Calling getSession() here is what keeps the cookie alive.
  // We do NOT query the profiles table — that fails silently on the Edge
  // runtime and is what caused the original redirect loop.
  await supabase.auth.getSession()

  return res
}

// Run on every /admin route so the session cookie is always refreshed
export const config = {
  matcher: ['/admin/:path*'],
}
