import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import prisma from '@/lib/db'
import { sendOrderConfirmationEmail } from '@/lib/email'
import { formatPrice, getExpiryDate } from '@/lib/utils'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')!

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      const orderId = session.metadata?.orderId

      if (!orderId) {
        console.error('No order ID in session metadata')
        return NextResponse.json({ error: 'No order ID' }, { status: 400 })
      }

      // Update order status
      const order = await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: 'COMPLETED',
          paidAt: new Date(),
          paymentId: session.payment_intent as string,
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

      console.log(`Order ${orderId} completed via Stripe`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Stripe webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

// Disable body parsing for webhook
export const config = {
  api: {
    bodyParser: false,
  },
}
