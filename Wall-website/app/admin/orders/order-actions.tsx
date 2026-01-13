'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Mail, MoreHorizontal, Loader2, RefreshCw, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useToast } from '@/components/ui/use-toast'

interface Order {
  id: string
  orderNumber: string
  paymentStatus: string
  user: {
    email: string
    name: string | null
  }
}

interface OrderActionsProps {
  order: Order
}

export function OrderActions({ order }: OrderActionsProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const handleResendEmail = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/orders/${order.id}/resend`, {
        method: 'POST',
      })

      if (!response.ok) throw new Error('Failed to resend email')

      toast({
        title: 'Email sent',
        description: `Download email sent to ${order.user.email}`,
      })
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to resend email',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleMarkComplete = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus: 'COMPLETED' }),
      })

      if (!response.ok) throw new Error('Failed to update order')

      toast({
        title: 'Order marked as completed',
      })
      router.refresh()
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update order',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleMarkFailed = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus: 'FAILED' }),
      })

      if (!response.ok) throw new Error('Failed to update order')

      toast({
        title: 'Order marked as failed',
      })
      router.refresh()
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update order',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <MoreHorizontal className="h-4 w-4" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {order.paymentStatus === 'COMPLETED' && (
          <DropdownMenuItem onClick={handleResendEmail}>
            <Mail className="h-4 w-4 mr-2" />
            Resend Download Email
          </DropdownMenuItem>
        )}
        {order.paymentStatus !== 'COMPLETED' && (
          <DropdownMenuItem onClick={handleMarkComplete}>
            <CheckCircle className="h-4 w-4 mr-2" />
            Mark as Completed
          </DropdownMenuItem>
        )}
        {order.paymentStatus !== 'FAILED' && (
          <DropdownMenuItem onClick={handleMarkFailed} className="text-red-400">
            <XCircle className="h-4 w-4 mr-2" />
            Mark as Failed
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
