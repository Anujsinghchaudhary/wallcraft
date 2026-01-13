import { redirect } from 'next/navigation'
import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Download, Package, Clock, CheckCircle2, XCircle, ArrowRight } from 'lucide-react'
import prisma from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { formatPrice, formatDateTime, PAYMENT_STATUS_LABELS, PAYMENT_METHOD_LABELS } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Manage your purchases',
}

async function getUserOrders(userId: string) {
  return prisma.order.findMany({
    where: { userId },
    include: {
      items: {
        include: {
          wallpaper: true,
        },
      },
      downloads: true,
    },
    orderBy: { createdAt: 'desc' },
  })
}

export default async function DashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login?redirect=/dashboard')
  }

  const orders = await getUserOrders(user.id)
  const completedOrders = orders.filter((o) => o.paymentStatus === 'COMPLETED')
  const totalSpent = completedOrders.reduce((sum, o) => sum + o.totalAmount, 0)

  return (
    <div className="min-h-screen px-4 pb-24">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            My Dashboard
          </h1>
          <p className="text-muted-foreground">
            Welcome back, {user.name || user.email}
          </p>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-3 gap-4 mb-12">
          <div className="glass-card p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-gold-500/20 flex items-center justify-center">
                <Package className="h-6 w-6 text-gold-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold text-white">{orders.length}</p>
              </div>
            </div>
          </div>
          <div className="glass-card p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                <Download className="h-6 w-6 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Wallpapers Owned</p>
                <p className="text-2xl font-bold text-white">
                  {completedOrders.reduce((sum, o) => sum + o.items.length, 0)}
                </p>
              </div>
            </div>
          </div>
          <div className="glass-card p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <span className="text-xl">💰</span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Spent</p>
                <p className="text-2xl font-bold text-white">{formatPrice(totalSpent)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Orders */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-6">Your Purchases</h2>

          {orders.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No purchases yet</h3>
              <p className="text-muted-foreground mb-6">
                Start exploring our collection of premium wallpapers
              </p>
              <Button asChild>
                <Link href="/wallpapers">
                  Browse Wallpapers
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="glass-card overflow-hidden">
                  {/* Order header */}
                  <div className="p-4 sm:p-6 bg-white/5 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        'h-10 w-10 rounded-full flex items-center justify-center',
                        order.paymentStatus === 'COMPLETED' && 'bg-green-500/20',
                        order.paymentStatus === 'PENDING' && 'bg-yellow-500/20',
                        order.paymentStatus === 'FAILED' && 'bg-red-500/20',
                        !['COMPLETED', 'PENDING', 'FAILED'].includes(order.paymentStatus) && 'bg-gray-500/20'
                      )}>
                        {order.paymentStatus === 'COMPLETED' && <CheckCircle2 className="h-5 w-5 text-green-400" />}
                        {order.paymentStatus === 'PENDING' && <Clock className="h-5 w-5 text-yellow-400" />}
                        {order.paymentStatus === 'FAILED' && <XCircle className="h-5 w-5 text-red-400" />}
                      </div>
                      <div>
                        <p className="font-medium text-white">
                          Order #{order.orderNumber.slice(-8).toUpperCase()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatDateTime(order.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          {PAYMENT_METHOD_LABELS[order.paymentMethod]}
                        </p>
                        <p className={cn(
                          'text-sm font-medium',
                          order.paymentStatus === 'COMPLETED' && 'text-green-400',
                          order.paymentStatus === 'PENDING' && 'text-yellow-400',
                          order.paymentStatus === 'FAILED' && 'text-red-400'
                        )}>
                          {PAYMENT_STATUS_LABELS[order.paymentStatus]}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Total</p>
                        <p className="font-semibold text-gold-400">
                          {formatPrice(order.totalAmount, order.currency)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Order items */}
                  <div className="p-4 sm:p-6 space-y-4">
                    {order.items.map((item) => {
                      const download = order.downloads.find((d) => d.wallpaperId === item.wallpaperId)
                      const canDownload = order.paymentStatus === 'COMPLETED' && download

                      return (
                        <div key={item.id} className="flex gap-4">
                          <div className="relative w-16 h-28 sm:w-20 sm:h-36 rounded-lg overflow-hidden flex-shrink-0">
                            <Image
                              src={item.wallpaper.thumbnailUrl}
                              alt={item.wallpaper.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <Link
                              href={`/wallpaper/${item.wallpaperId}`}
                              className="font-medium text-white hover:text-gold-400 transition-colors line-clamp-1"
                            >
                              {item.wallpaper.title}
                            </Link>
                            <p className="text-sm text-muted-foreground mt-1">
                              {item.wallpaper.category}
                            </p>
                            <p className="text-sm text-gold-400 mt-1">
                              {formatPrice(item.price, item.currency)}
                            </p>
                            
                            {canDownload && (
                              <div className="mt-3">
                                <Button size="sm" asChild>
                                  <a href={`/api/download/${download.downloadToken}`}>
                                    <Download className="h-4 w-4 mr-2" />
                                    Download
                                  </a>
                                </Button>
                                <p className="text-xs text-muted-foreground mt-2">
                                  {download.downloadCount}/{download.maxDownloads} downloads used
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
