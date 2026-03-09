import Link from 'next/link'
import { ReactNode } from 'react'

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-900 text-white min-h-screen">
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-8">Admin Panel</h2>
            <nav className="space-y-2">
              <Link
                href="/admin"
                className="block px-4 py-2 rounded hover:bg-gray-800"
              >
                Dashboard
              </Link>
              <Link
                href="/admin/products"
                className="block px-4 py-2 rounded hover:bg-gray-800"
              >
                Products
              </Link>
              <Link
                href="/admin/orders"
                className="block px-4 py-2 rounded hover:bg-gray-800"
              >
                Orders
              </Link>
              <Link
                href="/"
                className="block px-4 py-2 rounded hover:bg-gray-800 mt-8"
              >
                ← Back to Store
              </Link>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
