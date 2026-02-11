import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import prisma from '@/lib/db'
import { sendOrderConfirmationEmail } from '@/lib/email'
import { formatPrice, getExpiryDate } from '@/lib/utils'

export async function POST(request: NextRequest) {
    try {
        const body = await request.text()
        const signature = request.headers.get('x-razorpay-signature')!

        // Verify webhook signature
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET!
        const expectedSignature = crypto
            .createHmac('sha256', webhookSecret)
            .update(body)
            .digest('hex')

        if (expectedSignature !== signature) {
            console.error('Razorpay webhook signature verification failed')
            return NextResponse.json(
                { error: 'Invalid signature' },
                { status: 400 }
            )
        }

        const event = JSON.parse(body)

        if (event.event === 'payment.captured') {
            const payment = event.payload.payment.entity
            const orderId = payment.notes?.orderId

            if (!orderId) {
                console.error('No order ID in payment notes')
                return NextResponse.json({ error: 'No order ID' }, { status: 400 })
            }

            // Update order status
            const order = await prisma.order.update({
                where: { id: orderId },
                data: {
                    paymentStatus: 'COMPLETED',
                    paidAt: new Date(),
                    paymentId: payment.id,
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

            console.log(`Order ${orderId} completed via Razorpay webhook`)
        }

        if (event.event === 'payment.failed') {
            const payment = event.payload.payment.entity
            const orderId = payment.notes?.orderId

            if (orderId) {
                await prisma.order.update({
                    where: { id: orderId },
                    data: { paymentStatus: 'FAILED' },
                })
                console.log(`Order ${orderId} payment failed`)
            }
        }

        return NextResponse.json({ received: true })
    } catch (error) {
        console.error('Razorpay webhook error:', error)
        return NextResponse.json(
            { error: 'Webhook handler failed' },
            { status: 500 }
        )
    }
}
