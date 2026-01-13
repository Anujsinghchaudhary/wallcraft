import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { requireAdmin } from '@/lib/auth'
import { sendOrderConfirmationEmail } from '@/lib/email'
import { formatPrice } from '@/lib/utils'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin()
    const { id } = await params

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: true,
        items: {
          include: { wallpaper: true },
        },
        downloads: true,
      },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (order.paymentStatus !== 'COMPLETED') {
      return NextResponse.json(
        { error: 'Can only resend email for completed orders' },
        { status: 400 }
      )
    }

    // Send email for each item
    for (const item of order.items) {
      const download = order.downloads.find((d) => d.wallpaperId === item.wallpaperId)
      
      if (download) {
        await sendOrderConfirmationEmail({
          to: order.user.email,
          orderNumber: order.orderNumber,
          wallpaperTitle: item.wallpaper.title,
          downloadToken: download.downloadToken,
          expiresAt: download.expiresAt,
          price: formatPrice(item.price, item.currency),
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Resend email error:', error)
    if (error instanceof Error && error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
