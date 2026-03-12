'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'
import { useAuth } from '@/lib/auth-context'

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const { signOut, profile } = useAuth()

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: '📊' },
    { href: '/admin/products', label: 'Products', icon: '📦' },
    { href: '/admin/orders', label: 'Orders', icon: '🛒' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-900 text-white min-h-screen fixed left-0 top-0">
          <div className="p-6">
            <Link href="/admin" className="text-2xl font-bold mb-8 block">
              Admin Panel
            </Link>
            
            {profile && (
              <div className="mb-8 pb-6 border-b border-gray-700">
                <p className="text-sm text-gray-400">Logged in as</p>
                <p className="font-medium truncate">{profile.email}</p>
                <span className="inline-block mt-2 px-2 py-1 bg-blue-600 text-xs rounded">
                  {profile.role}
                </span>
              </div>
            )}

            <nav className="space-y-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-gray-800'
                    }`}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                  </Link>
                )
              })}
            </nav>

            <div className="mt-8 pt-6 border-t border-gray-700 space-y-2">
              <Link
                href="/"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 transition"
              >
                <span className="text-xl">🏠</span>
                <span className="font-medium">Back to Store</span>
              </Link>
              
              <button
                onClick={() => signOut()}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-red-600 hover:text-white transition"
              >
                <span className="text-xl">🚪</span>
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 ml-64 p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
