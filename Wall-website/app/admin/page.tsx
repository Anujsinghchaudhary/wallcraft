import { Metadata } from 'next'
import Link from 'next/link'
import { 
  TrendingUp, 
  DollarSign, 
  Image, 
  Users, 
  ShoppingCart,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import prisma from '@/lib/db'
import { formatPrice, formatDateTime } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  description: 'WallCraft admin dashboard',
}

async function getDashboardStats() {
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)

  const [
    totalWallpapers,
    totalUsers,
    totalOrders,
    completedOrders,
    recentOrders,
    currentPeriodRevenue,
    previousPeriodRevenue,
  ] = await Promise.all([
    prisma.wallpaper.count({ where: { isActive: true } }),
    prisma.user.count(),
    prisma.order.count(),
    prisma.order.count({ where: { paymentStatus: 'COMPLETED' } }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { email: true, name: true } },
        items: {
          include: { wallpaper: { select: { title: true } } },
        },
      },
    }),
    prisma.order.aggregate({
      where: {
        paymentStatus: 'COMPLETED',
        createdAt: { gte: thirtyDaysAgo },
      },
      _sum: { totalAmount: true },
    }),
    prisma.order.aggregate({
      where: {
        paymentStatus: 'COMPLETED',
        createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
      },
      _sum: { totalAmount: true },
    }),
  ])

  const currentRevenue = currentPeriodRevenue._sum.totalAmount || 0
  const previousRevenue = previousPeriodRevenue._sum.totalAmount || 0
  const revenueChange = previousRevenue > 0 
    ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 
    : 0

  return {
    totalWallpapers,
    totalUsers,
    totalOrders,
    completedOrders,
    recentOrders,
    currentRevenue,
    revenueChange,
  }
}

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats()

  const statCards = [
    {
      title: 'Total Revenue (30d)',
      value: formatPrice(stats.currentRevenue),
      change: stats.revenueChange,
      icon: DollarSign,
      color: 'gold',
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders.toString(),
      subtitle: `${stats.completedOrders} completed`,
      icon: ShoppingCart,
      color: 'green',
    },
    {
      title: 'Active Wallpapers',
      value: stats.totalWallpapers.toString(),
      icon: Image,
      color: 'purple',
    },
    {
      title: 'Registered Users',
      value: stats.totalUsers.toString(),
      icon: Users,
      color: 'blue',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-muted-foreground">Welcome to your admin dashboard</p>
        </div>
        <Button asChild>
          <Link href="/admin/wallpapers/new">
            Add New Wallpaper
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <div key={stat.title} className="glass-card p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                {stat.subtitle && (
                  <p className="text-xs text-muted-foreground mt-1">{stat.subtitle}</p>
                )}
                {typeof stat.change === 'number' && (
                  <div className={`flex items-center gap-1 mt-2 text-sm ${stat.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {stat.change >= 0 ? (
                      <ArrowUpRight className="h-4 w-4" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4" />
                    )}
                    <span>{Math.abs(stat.change).toFixed(1)}% vs last period</span>
                  </div>
                )}
              </div>
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center bg-${stat.color}-500/20`}>
                <stat.icon className={`h-5 w-5 text-${stat.color}-400`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="glass-card overflow-hidden">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Recent Orders</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/orders">View All</Link>
          </Button>
        </div>
        <div className="divide-y divide-white/10">
          {stats.recentOrders.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              No orders yet
            </div>
          ) : (
            stats.recentOrders.map((order) => (
              <div key={order.id} className="p-4 sm:p-6 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white truncate">
                    {order.user.name || order.user.email}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">
                    {order.items.map((i) => i.wallpaper.title).join(', ')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gold-400">
                    {formatPrice(order.totalAmount, order.currency)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDateTime(order.createdAt)}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  order.paymentStatus === 'COMPLETED' 
                    ? 'bg-green-500/20 text-green-400' 
                    : order.paymentStatus === 'PENDING'
                    ? 'bg-yellow-500/20 text-yellow-400'
                    : 'bg-red-500/20 text-red-400'
                }`}>
                  {order.paymentStatus}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
