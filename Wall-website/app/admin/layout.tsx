import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Sparkles, LayoutDashboard, Image, ShoppingCart, Users, Settings, LogOut } from 'lucide-react'
import { getCurrentUser } from '@/lib/auth'
import { AdminSidebar } from './admin-sidebar'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  if (!user || user.role !== 'ADMIN') {
    redirect('/login?redirect=/admin')
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <AdminSidebar user={user} />

      {/* Main content */}
      <main className="flex-1 lg:ml-64">
        <div className="p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  )
}
