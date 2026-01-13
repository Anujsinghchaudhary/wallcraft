import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import prisma from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { generateOrderNumber } from '@/lib/utils'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await request.json()
    const { wallpaperId, paymentMethod } = body

    // Get wallpaper
    const wallpaper = await prisma.wallpaper.findUnique({
      where: { id: wallpaperId, isActive: true },
    })

    if (!wallpaper) {
      return NextResponse.json(
        { error: 'Wallpaper not found' },
        { status: 404 }
      )
    }

    // Check if already purchased
    const existingOrder = await prisma.order.findFirst({
      where: {
        userId: user.id,
        paymentStatus: 'COMPLETED',
        items: {
          some: { wallpaperId },
        },
      },
    })

    if (existingOrder) {
      return NextResponse.json(
        { error: 'You already own this wallpaper' },
        { status: 400 }
      )
    }

    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId: user.id,
        totalAmount: wallpaper.price,
        currency: wallpaper.currency,
        paymentMethod,
        items: {
          create: {
            wallpaperId,
            price: wallpaper.price,
            currency: wallpaper.currency,
          },
        },
      },
    })

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    // Handle different payment methods
    switch (paymentMethod) {
      case 'STRIPE': {
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          line_items: [
            {
              price_data: {
                currency: wallpaper.currency.toLowerCase(),
                product_data: {
                  name: wallpaper.title,
                  description: wallpaper.description || 'Premium Live Wallpaper',
                  images: [wallpaper.thumbnailUrl],
                },
                unit_amount: Math.round(wallpaper.price * 100),
              },
              quantity: 1,
            },
          ],
          mode: 'payment',
          success_url: `${appUrl}/dashboard?payment=success&order=${order.id}`,
          cancel_url: `${appUrl}/checkout?wallpaper=${wallpaperId}`,
          customer_email: user.email,
          metadata: {
            orderId: order.id,
            userId: user.id,
            wallpaperId,
          },
        })

        // Update order with Stripe session ID
        await prisma.order.update({
          where: { id: order.id },
          data: { paymentId: session.id },
        })

        return NextResponse.json({ url: session.url })
      }

      case 'PAYPAL': {
        // For PayPal, return the order ID and let the client handle it
        // In production, you'd create a PayPal order here
        return NextResponse.json({
          orderId: order.id,
          paypalOrderId: order.id, // In production, create PayPal order and return its ID
          amount: wallpaper.price,
          currency: wallpaper.currency,
        })
      }

      case 'RAZORPAY': {
        // For Razorpay, return order details for client-side checkout
        // In production, you'd create a Razorpay order here
        const razorpayOrderId = `rzp_${order.id}` // In production, create Razorpay order

        await prisma.order.update({
          where: { id: order.id },
          data: { paymentId: razorpayOrderId },
        })

        return NextResponse.json({
          orderId: razorpayOrderId,
          amount: Math.round(wallpaper.price * 100), // Razorpay expects paise
          currency: 'INR', // Convert to INR for Razorpay
          dbOrderId: order.id,
        })
      }

      case 'CRYPTO_USDT': {
        // For crypto payments, redirect to a crypto payment page or use NOWPayments
        // In production, you'd integrate with a crypto payment provider
        const cryptoAmount = wallpaper.price // In production, convert to USDT rate

        await prisma.order.update({
          where: { id: order.id },
          data: {
            metadata: {
              cryptoAmount,
              cryptoCurrency: 'USDT_TRC20',
              walletAddress: process.env.CRYPTO_WALLET_ADDRESS,
            },
          },
        })

        return NextResponse.json({
          orderId: order.id,
          amount: cryptoAmount,
          currency: 'USDT',
          network: 'TRC20',
          walletAddress: process.env.CRYPTO_WALLET_ADDRESS,
          // In production, redirect to crypto payment gateway
          url: `${appUrl}/checkout/crypto?order=${order.id}`,
        })
      }

      default:
        return NextResponse.json(
          { error: 'Invalid payment method' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Payment creation error:', error)
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
