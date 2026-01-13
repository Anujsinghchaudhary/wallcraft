import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { getCurrentUser } from '@/lib/auth'

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar user={user} />
      <main className="flex-1 pt-24">{children}</main>
      <Footer />
    </div>
  )
}
