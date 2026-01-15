'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useState } from 'react'
import {
  CreditCard,
  Bitcoin,
  Loader2,
  Shield,
  Check,
  ArrowRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { formatPrice, cn, PAYMENT_METHOD_LABELS } from '@/lib/utils'

interface Wallpaper {
  id: string
  title: string
  description: string | null
  price: number
  currency: string
  thumbnailUrl: string
  category: string
}

interface User {
  id: string
  email: string
  name: string | null
}

interface CheckoutFormProps {
  wallpaper: Wallpaper
  user: User
}

type PaymentMethod = 'RAZORPAY' | 'CRYPTO_USDT'

const paymentMethods: { id: PaymentMethod; label: string; icon: React.ElementType; description: string }[] = [
  {
    id: 'RAZORPAY',
    label: 'Cards / UPI / Netbanking',
    icon: CreditCard,
    description: 'Visa, Mastercard, GPay, PhonePe, Paytm',
  },
  {
    id: 'CRYPTO_USDT',
    label: 'USDT (TRC20)',
    icon: Bitcoin,
    description: 'Pay with cryptocurrency',
  },
]

export function CheckoutForm({ wallpaper, user }: CheckoutFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('RAZORPAY')
  const [isProcessing, setIsProcessing] = useState(false)

  const handlePayment = async () => {
    setIsProcessing(true)

    try {
      const response = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallpaperId: wallpaper.id,
          paymentMethod: selectedMethod,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Payment failed')
      }

      // Handle different payment methods
      switch (selectedMethod) {
        case 'RAZORPAY':
          // Initialize Razorpay
          if (data.orderId) {
            initRazorpay(data)
          }
          break
        case 'CRYPTO_USDT':
          // Redirect to crypto payment page
          if (data.url) {
            window.location.href = data.url
          }
          break
      }
    } catch (error) {
      console.error('Payment error:', error)
      toast({
        variant: 'destructive',
        title: 'Payment failed',
        description: error instanceof Error ? error.message : 'Please try again',
      })
      setIsProcessing(false)
    }
  }

  const initRazorpay = (data: { orderId: string; amount: number; currency: string; dbOrderId: string; key: string }) => {
    const options = {
      key: data.key,
      amount: data.amount,
      currency: data.currency,
      name: 'WallCraft',
      description: wallpaper.title,
      order_id: data.orderId,
      handler: async function (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) {
        // Verify payment on server
        const verifyResponse = await fetch('/api/payments/verify/razorpay', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...response,
            dbOrderId: data.dbOrderId,
          }),
        })

        if (verifyResponse.ok) {
          router.push('/dashboard?payment=success')
        } else {
          toast({
            variant: 'destructive',
            title: 'Payment verification failed',
            description: 'Please contact support',
          })
        }
      },
      prefill: {
        email: user.email,
        name: user.name || '',
      },
      theme: {
        color: '#c99033',
      },
    }

    // @ts-expect-error - Razorpay is loaded via script
    const rzp = new window.Razorpay(options)
    rzp.open()
    setIsProcessing(false)
  }

  return (
    <div className="grid lg:grid-cols-5 gap-8">
      {/* Order Summary */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="lg:col-span-2"
      >
        <div className="glass-card p-6 sticky top-28">
          <h2 className="text-lg font-semibold text-white mb-6">Order Summary</h2>

          <div className="flex gap-4 mb-6">
            <div className="relative w-24 h-40 rounded-xl overflow-hidden flex-shrink-0">
              <Image
                src={wallpaper.thumbnailUrl}
                alt={wallpaper.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-white line-clamp-2">{wallpaper.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{wallpaper.category}</p>
              <p className="text-gold-400 font-semibold mt-2">
                {formatPrice(wallpaper.price, wallpaper.currency)}
              </p>
            </div>
          </div>

          <div className="border-t border-white/10 pt-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="text-white">{formatPrice(wallpaper.price, wallpaper.currency)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tax</span>
              <span className="text-white">$0.00</span>
            </div>
            <div className="border-t border-white/10 pt-3 flex justify-between">
              <span className="font-medium text-white">Total</span>
              <span className="font-bold text-xl gradient-text">
                {formatPrice(wallpaper.price, wallpaper.currency)}
              </span>
            </div>
          </div>

          {/* Security badges */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4 text-green-400" />
              <span>Secure checkout with encryption</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Payment Methods */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        className="lg:col-span-3"
      >
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-white mb-6">Payment Method</h2>

          <div className="space-y-3 mb-8">
            {paymentMethods.map((method) => (
              <button
                key={method.id}
                onClick={() => setSelectedMethod(method.id)}
                disabled={isProcessing}
                className={cn(
                  'w-full flex items-center gap-4 p-4 rounded-xl border transition-all',
                  selectedMethod === method.id
                    ? 'border-gold-500 bg-gold-500/10'
                    : 'border-white/10 bg-white/5 hover:bg-white/10'
                )}
              >
                <div className={cn(
                  'h-12 w-12 rounded-xl flex items-center justify-center',
                  selectedMethod === method.id ? 'bg-gold-500/20' : 'bg-white/10'
                )}>
                  <method.icon className={cn(
                    'h-6 w-6',
                    selectedMethod === method.id ? 'text-gold-400' : 'text-white'
                  )} />
                </div>
                <div className="flex-1 text-left">
                  <p className={cn(
                    'font-medium',
                    selectedMethod === method.id ? 'text-gold-400' : 'text-white'
                  )}>
                    {method.label}
                  </p>
                  <p className="text-sm text-muted-foreground">{method.description}</p>
                </div>
                {selectedMethod === method.id && (
                  <div className="h-6 w-6 rounded-full bg-gold-500 flex items-center justify-center">
                    <Check className="h-4 w-4 text-black" />
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Delivery info */}
          <div className="bg-white/5 rounded-xl p-4 mb-8">
            <h3 className="font-medium text-white mb-2">Delivery to:</h3>
            <p className="text-muted-foreground">{user.email}</p>
            <p className="text-xs text-muted-foreground mt-2">
              Your wallpaper will be delivered to this email instantly after payment
            </p>
          </div>

          {/* Pay button */}
          <Button
            size="xl"
            className="w-full"
            onClick={handlePayment}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Pay {formatPrice(wallpaper.price, wallpaper.currency)}
                <ArrowRight className="h-5 w-5 ml-2" />
              </>
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground mt-4">
            By completing this purchase, you agree to our{' '}
            <a href="/terms" className="text-gold-400 hover:underline">Terms of Service</a>
          </p>
        </div>
      </motion.div>

      {/* Razorpay Script */}
      <script src="https://checkout.razorpay.com/v1/checkout.js" async />
    </div>
  )
}
