import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import prisma from '@/lib/db'
import { sendOrderConfirmationEmail } from '@/lib/email'
import { formatPrice, getExpiryDate } from '@/lib/utils'
import { getSession } from '@/lib/auth'

export async function POST(request: NextRequest) {
    try {
        // Verify user is authenticated
        const session = await getSession()
        if (!session) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            )
        }

        const body = await request.json()
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, dbOrderId } = body

        // Verify signature
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest('hex')

        if (expectedSignature !== razorpay_signature) {
            return NextResponse.json(
                { error: 'Invalid payment signature' },
                { status: 400 }
            )
        }

        // Update order status
        const order = await prisma.order.update({
            where: { id: dbOrderId },
            data: {
                paymentStatus: 'COMPLETED',
                paidAt: new Date(),
                paymentId: razorpay_payment_id,
            },
            include: {
                user: true,
                items: {
                    include: { wallpaper: true },
                },
            },
        })

        // Create download records and send emails
        for (const item of order.items) {
            // Create download record
            const download = await prisma.download.create({
                data: {
                    userId: order.userId,
                    orderId: order.id,
                    wallpaperId: item.wallpaperId,
                    expiresAt: getExpiryDate(parseInt(process.env.DOWNLOAD_LINK_EXPIRY_HOURS || '24')),
                },
            })

            // Update wallpaper download count
            await prisma.wallpaper.update({
                where: { id: item.wallpaperId },
                data: { downloads: { increment: 1 } },
            })

            // Send confirmation email
            await sendOrderConfirmationEmail({
                to: order.user.email,
                orderNumber: order.orderNumber,
                wallpaperTitle: item.wallpaper.title,
                downloadToken: download.downloadToken,
                expiresAt: download.expiresAt,
                price: formatPrice(item.price, item.currency),
            })
        }

        console.log(`Order ${dbOrderId} completed via Razorpay`)

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Razorpay verification error:', error)
        return NextResponse.json(
            { error: 'Payment verification failed' },
            { status: 500 }
        )
    }
}
