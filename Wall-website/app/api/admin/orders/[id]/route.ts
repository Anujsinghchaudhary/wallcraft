import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin()
    const { id } = await params
    const body = await request.json()

    const order = await prisma.order.update({
      where: { id },
      data: {
        paymentStatus: body.paymentStatus,
        paidAt: body.paymentStatus === 'COMPLETED' ? new Date() : undefined,
      },
      include: {
        user: true,
        items: {
          include: { wallpaper: true },
        },
      },
    })

    // If marked as completed, create download records
    if (body.paymentStatus === 'COMPLETED') {
      for (const item of order.items) {
        const existingDownload = await prisma.download.findFirst({
          where: {
            orderId: order.id,
            wallpaperId: item.wallpaperId,
          },
        })

        if (!existingDownload) {
          await prisma.download.create({
            data: {
              userId: order.userId,
              orderId: order.id,
              wallpaperId: item.wallpaperId,
              expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
            },
          })

          // Increment download count for wallpaper
          await prisma.wallpaper.update({
            where: { id: item.wallpaperId },
            data: { downloads: { increment: 1 } },
          })
        }
      }
    }

    return NextResponse.json({ success: true, order })
  } catch (error) {
    console.error('Update order error:', error)
    if (error instanceof Error && error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
