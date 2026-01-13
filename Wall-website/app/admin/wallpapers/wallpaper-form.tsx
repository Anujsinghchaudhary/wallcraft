'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Loader2, Save, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import Link from 'next/link'

interface Category {
  id: string
  name: string
  slug: string
}

interface Wallpaper {
  id: string
  title: string
  description: string | null
  price: number
  currency: string
  previewUrl: string
  thumbnailUrl: string
  fileUrl: string
  category: string
  tags: string[]
  resolution: string | null
  fileSize: string | null
  duration: string | null
  isActive: boolean
  isFeatured: boolean
}

interface WallpaperFormProps {
  categories: Category[]
  wallpaper?: Wallpaper
}

export function WallpaperForm({ categories, wallpaper }: WallpaperFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: wallpaper?.title || '',
    description: wallpaper?.description || '',
    price: wallpaper?.price?.toString() || '',
    category: wallpaper?.category || (categories[0]?.name || ''),
    tags: wallpaper?.tags?.join(', ') || '',
    previewUrl: wallpaper?.previewUrl || '',
    thumbnailUrl: wallpaper?.thumbnailUrl || '',
    fileUrl: wallpaper?.fileUrl || '',
    resolution: wallpaper?.resolution || '1290x2796',
    fileSize: wallpaper?.fileSize || '',
    duration: wallpaper?.duration || '',
    isActive: wallpaper?.isActive ?? true,
    isFeatured: wallpaper?.isFeatured ?? false,
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const payload = {
        title: formData.title,
        description: formData.description || null,
        price: parseFloat(formData.price),
        category: formData.category,
        tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
        previewUrl: formData.previewUrl,
        thumbnailUrl: formData.thumbnailUrl,
        fileUrl: formData.fileUrl,
        resolution: formData.resolution || null,
        fileSize: formData.fileSize || null,
        duration: formData.duration || null,
        isActive: formData.isActive,
        isFeatured: formData.isFeatured,
      }

      const url = wallpaper
        ? `/api/admin/wallpapers/${wallpaper.id}`
        : '/api/admin/wallpapers'
      const method = wallpaper ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save wallpaper')
      }

      toast({
        title: wallpaper ? 'Wallpaper updated' : 'Wallpaper created',
        description: 'Changes saved successfully',
      })

      router.push('/admin/wallpapers')
      router.refresh()
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save wallpaper',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="glass-card p-6 space-y-6">
        <h2 className="text-lg font-semibold text-white">Basic Information</h2>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Wallpaper title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the wallpaper..."
              rows={3}
              className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold-500/50"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price (USD) *</Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={handleChange}
                placeholder="0.00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-gold-500/50"
                required
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma separated)</Label>
            <Input
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="nature, landscape, mountains"
            />
          </div>
        </div>
      </div>

      <div className="glass-card p-6 space-y-6">
        <h2 className="text-lg font-semibold text-white">Media Files</h2>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="thumbnailUrl">Thumbnail URL *</Label>
            <Input
              id="thumbnailUrl"
              name="thumbnailUrl"
              type="url"
              value={formData.thumbnailUrl}
              onChange={handleChange}
              placeholder="https://..."
              required
            />
            <p className="text-xs text-muted-foreground">Static image for preview cards</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="previewUrl">Preview Video URL *</Label>
            <Input
              id="previewUrl"
              name="previewUrl"
              type="url"
              value={formData.previewUrl}
              onChange={handleChange}
              placeholder="https://..."
              required
            />
            <p className="text-xs text-muted-foreground">Short video preview for customers</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fileUrl">Download File URL *</Label>
            <Input
              id="fileUrl"
              name="fileUrl"
              value={formData.fileUrl}
              onChange={handleChange}
              placeholder="/protected/wallpaper.mov or https://..."
              required
            />
            <p className="text-xs text-muted-foreground">Actual wallpaper file for download (kept private)</p>
          </div>
        </div>
      </div>

      <div className="glass-card p-6 space-y-6">
        <h2 className="text-lg font-semibold text-white">Technical Details</h2>
        
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="resolution">Resolution</Label>
            <Input
              id="resolution"
              name="resolution"
              value={formData.resolution}
              onChange={handleChange}
              placeholder="1290x2796"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fileSize">File Size</Label>
            <Input
              id="fileSize"
              name="fileSize"
              value={formData.fileSize}
              onChange={handleChange}
              placeholder="15 MB"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Duration</Label>
            <Input
              id="duration"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              placeholder="5 seconds"
            />
          </div>
        </div>
      </div>

      <div className="glass-card p-6 space-y-6">
        <h2 className="text-lg font-semibold text-white">Publishing Options</h2>
        
        <div className="space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="h-5 w-5 rounded border-white/10 bg-white/5 text-gold-500 focus:ring-gold-500/50"
            />
            <div>
              <p className="text-white font-medium">Active</p>
              <p className="text-sm text-muted-foreground">Show this wallpaper in the store</p>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="isFeatured"
              checked={formData.isFeatured}
              onChange={handleChange}
              className="h-5 w-5 rounded border-white/10 bg-white/5 text-gold-500 focus:ring-gold-500/50"
            />
            <div>
              <p className="text-white font-medium">Featured</p>
              <p className="text-sm text-muted-foreground">Display in featured section on homepage</p>
            </div>
          </label>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button type="button" variant="outline" asChild>
          <Link href="/admin/wallpapers">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Cancel
          </Link>
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {wallpaper ? 'Update Wallpaper' : 'Create Wallpaper'}
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
