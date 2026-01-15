import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { getCurrentUser } from '@/lib/auth'

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const currentUser = await getCurrentUser()

  // Cast user to match Navbar's expected type
  const user = currentUser ? {
    ...currentUser,
    role: currentUser.role as 'USER' | 'ADMIN'
  } : null

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar user={user} />
      <main className="flex-1 pt-24">{children}</main>
      <Footer />
    </div>
  )
}
