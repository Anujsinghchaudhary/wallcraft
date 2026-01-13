import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Mail, RotateCcw } from 'lucide-react'
import prisma from '@/lib/db'
import { formatPrice, formatDateTime, PAYMENT_STATUS_LABELS, PAYMENT_METHOD_LABELS } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { OrderActions } from './order-actions'

export const metadata: Metadata = {
  title: 'Manage Orders',
  description: 'Admin order management',
}

interface PageProps {
  searchParams: Promise<{ page?: string; status?: string }>
}

const ITEMS_PER_PAGE = 20

async function getOrders(page: number, status?: string) {
  const skip = (page - 1) * ITEMS_PER_PAGE

  const where = status
    ? { paymentStatus: status as 'PENDING' | 'COMPLETED' | 'FAILED' }
    : {}

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      skip,
      take: ITEMS_PER_PAGE,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { email: true, name: true } },
        items: {
          include: { wallpaper: { select: { title: true, thumbnailUrl: true } } },
        },
        downloads: true,
      },
    }),
    prisma.order.count({ where }),
  ])

  return { orders, total, totalPages: Math.ceil(total / ITEMS_PER_PAGE) }
}

export default async function AdminOrdersPage({ searchParams }: PageProps) {
  const params = await searchParams
  const page = params.page ? parseInt(params.page) : 1
  const { orders, total, totalPages } = await getOrders(page, params.status)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Orders</h1>
        <p className="text-muted-foreground">{total} total orders</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <Link
          href="/admin/orders"
          className={`px-4 py-2 rounded-lg text-sm ${
            !params.status ? 'bg-gold-500 text-black' : 'bg-white/5 text-white hover:bg-white/10'
          }`}
        >
          All
        </Link>
        {['PENDING', 'COMPLETED', 'FAILED'].map((status) => (
          <Link
            key={status}
            href={`/admin/orders?status=${status}`}
            className={`px-4 py-2 rounded-lg text-sm ${
              params.status === status ? 'bg-gold-500 text-black' : 'bg-white/5 text-white hover:bg-white/10'
            }`}
          >
            {PAYMENT_STATUS_LABELS[status]}
          </Link>
        ))}
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Order</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Customer</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Items</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Total</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Payment</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-white/5">
                  <td className="p-4">
                    <div>
                      <p className="font-medium text-white font-mono">
                        #{order.orderNumber.slice(-8).toUpperCase()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDateTime(order.createdAt)}
                      </p>
                    </div>
                  </td>
                  <td className="p-4">
                    <div>
                      <p className="text-white">{order.user.name || 'Guest'}</p>
                      <p className="text-xs text-muted-foreground">{order.user.email}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex -space-x-2">
                      {order.items.slice(0, 3).map((item) => (
                        <div
                          key={item.id}
                          className="relative w-8 h-12 rounded-md overflow-hidden border-2 border-card"
                        >
                          <Image
                            src={item.wallpaper.thumbnailUrl}
                            alt={item.wallpaper.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <div className="w-8 h-12 rounded-md bg-white/10 border-2 border-card flex items-center justify-center text-xs text-white">
                          +{order.items.length - 3}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-gold-400 font-medium">
                      {formatPrice(order.totalAmount, order.currency)}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-muted-foreground">
                      {PAYMENT_METHOD_LABELS[order.paymentMethod]}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      order.paymentStatus === 'COMPLETED' 
                        ? 'bg-green-500/20 text-green-400' 
                        : order.paymentStatus === 'PENDING'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {PAYMENT_STATUS_LABELS[order.paymentStatus]}
                    </span>
                  </td>
                  <td className="p-4">
                    <OrderActions order={order} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {orders.length === 0 && (
          <div className="p-12 text-center text-muted-foreground">
            No orders found
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/admin/orders?page=${p}${params.status ? `&status=${params.status}` : ''}`}
              className={`px-4 py-2 rounded-lg text-sm ${
                p === page
                  ? 'bg-gold-500 text-black'
                  : 'bg-white/5 text-white hover:bg-white/10'
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
