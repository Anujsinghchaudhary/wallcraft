'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Edit, Trash2, Eye, EyeOff, Star, MoreHorizontal, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useToast } from '@/components/ui/use-toast'

interface Wallpaper {
  id: string
  title: string
  isActive: boolean
  isFeatured: boolean
}

interface WallpaperActionsProps {
  wallpaper: Wallpaper
}

export function WallpaperActions({ wallpaper }: WallpaperActionsProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const handleToggleActive = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/wallpapers/${wallpaper.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !wallpaper.isActive }),
      })

      if (!response.ok) throw new Error('Failed to update')

      toast({
        title: wallpaper.isActive ? 'Wallpaper hidden' : 'Wallpaper published',
      })
      router.refresh()
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update wallpaper',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleFeatured = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/wallpapers/${wallpaper.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFeatured: !wallpaper.isFeatured }),
      })

      if (!response.ok) throw new Error('Failed to update')

      toast({
        title: wallpaper.isFeatured ? 'Removed from featured' : 'Added to featured',
      })
      router.refresh()
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update wallpaper',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this wallpaper?')) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/wallpapers/${wallpaper.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete')

      toast({
        title: 'Wallpaper deleted',
      })
      router.refresh()
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete wallpaper',
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
        <DropdownMenuItem asChild>
          <Link href={`/admin/wallpapers/${wallpaper.id}`}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleToggleActive}>
          {wallpaper.isActive ? (
            <>
              <EyeOff className="h-4 w-4 mr-2" />
              Hide
            </>
          ) : (
            <>
              <Eye className="h-4 w-4 mr-2" />
              Publish
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleToggleFeatured}>
          <Star className="h-4 w-4 mr-2" />
          {wallpaper.isFeatured ? 'Remove from Featured' : 'Add to Featured'}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleDelete} className="text-red-400">
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
