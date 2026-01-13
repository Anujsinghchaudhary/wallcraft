import { redirect, notFound } from 'next/navigation'
import { Metadata } from 'next'
import prisma from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { CheckoutForm } from './checkout-form'

export const metadata: Metadata = {
  title: 'Checkout',
  description: 'Complete your purchase',
}

interface PageProps {
  searchParams: Promise<{ wallpaper?: string }>
}

export default async function CheckoutPage({ searchParams }: PageProps) {
  const params = await searchParams
  const user = await getCurrentUser()

  if (!user) {
    redirect(`/login?redirect=/checkout?wallpaper=${params.wallpaper}`)
  }

  if (!params.wallpaper) {
    redirect('/wallpapers')
  }

  const wallpaper = await prisma.wallpaper.findUnique({
    where: { id: params.wallpaper, isActive: true },
  })

  if (!wallpaper) {
    notFound()
  }

  // Check if already purchased
  const existingOrder = await prisma.order.findFirst({
    where: {
      userId: user.id,
      paymentStatus: 'COMPLETED',
      items: {
        some: { wallpaperId: wallpaper.id },
      },
    },
  })

  if (existingOrder) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen px-4 pb-24">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            Checkout
          </h1>
          <p className="text-muted-foreground">
            Complete your purchase securely
          </p>
        </div>

        <CheckoutForm wallpaper={wallpaper} user={user} />
      </div>
    </div>
  )
}
