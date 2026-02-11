import { NextRequest, NextResponse } from 'next/server'
import Razorpay from 'razorpay'
import prisma from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { generateOrderNumber } from '@/lib/utils'

// Lazy initialization to avoid build-time errors when env vars are not set
let razorpayClient: Razorpay | null = null

function getRazorpay(): Razorpay {
  if (!razorpayClient) {
    razorpayClient = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    })
  }
  return razorpayClient
}

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

    // Create order in database
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
      case 'RAZORPAY': {
        // Create Razorpay order
        const razorpayOrder = await getRazorpay().orders.create({
          amount: Math.round(wallpaper.price * 100), // Amount in paise
          currency: 'INR',
          receipt: order.id,
          notes: {
            orderId: order.id,
            userId: user.id,
            wallpaperId,
          },
        })

        // Update order with Razorpay order ID
        await prisma.order.update({
          where: { id: order.id },
          data: { paymentId: razorpayOrder.id },
        })

        return NextResponse.json({
          orderId: razorpayOrder.id,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          dbOrderId: order.id,
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        })
      }

      case 'CRYPTO_USDT': {
        // For crypto payments, redirect to a crypto payment page or use NOWPayments
        const cryptoAmount = wallpaper.price // In production, convert to USDT rate

        await prisma.order.update({
          where: { id: order.id },
          data: {
            metadata: JSON.stringify({
              cryptoAmount,
              cryptoCurrency: 'USDT_TRC20',
              walletAddress: process.env.CRYPTO_WALLET_ADDRESS,
            }),
          },
        })

        return NextResponse.json({
          orderId: order.id,
          amount: cryptoAmount,
          currency: 'USDT',
          network: 'TRC20',
          walletAddress: process.env.CRYPTO_WALLET_ADDRESS,
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
