'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  ShoppingCart, 
  Check, 
  Download,
  Eye,
  Share2,
  Heart,
  Smartphone
} from 'lucide-react'
import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { WallpaperCard } from '@/components/wallpaper-card'
import { formatPrice } from '@/lib/utils'
import { useToast } from '@/components/ui/use-toast'

interface Wallpaper {
  id: string
  title: string
  description: string | null
  price: number
  currency: string
  previewUrl: string
  thumbnailUrl: string
  category: string
  tags: string | string[]
  resolution: string | null
  fileSize: string | null
  duration: string | null
  views: number
  downloads: number
  isFeatured: boolean
}

interface User {
  id: string
  email: string
  name: string | null
}

interface WallpaperDetailProps {
  wallpaper: Wallpaper
  relatedWallpapers: Wallpaper[]
  user: User | null
  isOwned: boolean
}

export function WallpaperDetail({ wallpaper, relatedWallpapers, user, isOwned }: WallpaperDetailProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [showVideo, setShowVideo] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const { toast } = useToast()

  const togglePlayback = () => {
    if (!videoRef.current) return

    if (isPlaying) {
      videoRef.current.pause()
    } else {
      videoRef.current.play()
    }
    setIsPlaying(!isPlaying)
    setShowVideo(true)
  }

  const handleShare = async () => {
    try {
      await navigator.share({
        title: wallpaper.title,
        text: `Check out this amazing live wallpaper: ${wallpaper.title}`,
        url: window.location.href,
      })
    } catch {
      // Fallback to copying URL
      await navigator.clipboard.writeText(window.location.href)
      toast({
        title: 'Link copied!',
        description: 'Share it with your friends',
      })
    }
  }

  return (
    <div className="min-h-screen px-4 pb-24">
      <div className="max-w-7xl mx-auto">
        {/* Back button */}
        <Link
          href="/wallpapers"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Wallpapers
        </Link>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Preview Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <div className="sticky top-28">
              {/* iPhone mockup */}
              <div className="flex justify-center">
                <div className="relative">
                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-gold-500/10 to-purple-500/10 blur-[60px] rounded-full" />
                  
                  {/* iPhone Frame */}
                  <div className="relative iphone-frame glow-gold-sm">
                    <div className="iphone-screen relative">
                      {/* Thumbnail */}
                      <Image
                        src={wallpaper.thumbnailUrl}
                        alt={wallpaper.title}
                        fill
                        className={`object-cover transition-opacity duration-300 ${showVideo ? 'opacity-0' : 'opacity-100'}`}
                        priority
                      />
                      
                      {/* Video */}
                      <video
                        ref={videoRef}
                        src={wallpaper.previewUrl}
                        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${showVideo ? 'opacity-100' : 'opacity-0'}`}
                        loop
                        muted
                        playsInline
                        onEnded={() => setIsPlaying(false)}
                      />

                      {/* Play/Pause overlay */}
                      <button
                        onClick={togglePlayback}
                        className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity"
                      >
                        <div className="h-16 w-16 rounded-full bg-white/20 backdrop-blur-xl flex items-center justify-center border border-white/30">
                          {isPlaying ? (
                            <Pause className="h-7 w-7 text-white" fill="currentColor" />
                          ) : (
                            <Play className="h-7 w-7 text-white ml-1" fill="currentColor" />
                          )}
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Preview controls */}
              <div className="flex justify-center mt-6">
                <Button
                  variant="outline"
                  onClick={togglePlayback}
                  className="gap-2"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="h-4 w-4" />
                      Pause Preview
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      Play Preview
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Details Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-8"
          >
            {/* Header */}
            <div>
              {wallpaper.isFeatured && (
                <span className="inline-block px-3 py-1 rounded-full bg-gold-500/10 text-gold-400 text-sm font-medium mb-4">
                  Featured
                </span>
              )}
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                {wallpaper.title}
              </h1>
              <p className="text-muted-foreground">
                {wallpaper.description || 'Premium live wallpaper for iPhone'}
              </p>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                <span>{wallpaper.views.toLocaleString()} views</span>
              </div>
              <div className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                <span>{wallpaper.downloads.toLocaleString()} downloads</span>
              </div>
            </div>

            {/* Price */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Price</p>
                  <p className="text-3xl font-bold gradient-text">
                    {formatPrice(wallpaper.price, wallpaper.currency)}
                  </p>
                </div>
                {isOwned && (
                  <span className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 text-green-400">
                    <Check className="h-4 w-4" />
                    Purchased
                  </span>
                )}
              </div>

              {isOwned ? (
                <Button size="lg" className="w-full" asChild>
                  <Link href="/dashboard">
                    <Download className="h-5 w-5 mr-2" />
                    Download from Dashboard
                  </Link>
                </Button>
              ) : user ? (
                <Button size="lg" className="w-full" asChild>
                  <Link href={`/checkout?wallpaper=${wallpaper.id}`}>
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Buy Now
                  </Link>
                </Button>
              ) : (
                <Button size="lg" className="w-full" asChild>
                  <Link href={`/login?redirect=/wallpaper/${wallpaper.id}`}>
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Sign in to Purchase
                  </Link>
                </Button>
              )}

              {/* Action buttons */}
              <div className="flex gap-3 mt-4">
                <Button variant="outline" className="flex-1" onClick={handleShare}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
                <Button variant="outline" size="icon">
                  <Heart className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Specs */}
            <div className="glass-card p-6 space-y-4">
              <h3 className="font-semibold text-white">Specifications</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground mb-1">Category</p>
                  <p className="text-white">{wallpaper.category}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Resolution</p>
                  <p className="text-white">{wallpaper.resolution || '1290x2796'}</p>
                </div>
                {wallpaper.fileSize && (
                  <div>
                    <p className="text-muted-foreground mb-1">File Size</p>
                    <p className="text-white">{wallpaper.fileSize}</p>
                  </div>
                )}
                {wallpaper.duration && (
                  <div>
                    <p className="text-muted-foreground mb-1">Duration</p>
                    <p className="text-white">{wallpaper.duration}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Compatibility */}
            <div className="glass-card p-6">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                  <Smartphone className="h-6 w-6 text-gold-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">iPhone Optimized</h3>
                  <p className="text-sm text-muted-foreground">
                    Compatible with iPhone 12 and later. Designed for Super Retina XDR displays
                    with smooth 60fps animation.
                  </p>
                </div>
              </div>
            </div>

            {/* Tags */}
            {(() => {
              const tags = typeof wallpaper.tags === 'string' 
                ? JSON.parse(wallpaper.tags || '[]') 
                : wallpaper.tags
              return tags.length > 0 && (
                <div>
                  <h3 className="font-semibold text-white mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag: string) => (
                      <Link
                        key={tag}
                        href={`/wallpapers?search=${tag}`}
                        className="px-3 py-1.5 rounded-full bg-white/5 text-sm text-muted-foreground hover:bg-white/10 hover:text-white transition-colors"
                      >
                        #{tag}
                      </Link>
                    ))}
                  </div>
                </div>
              )
            })()}
          </motion.div>
        </div>

        {/* Related Wallpapers */}
        {relatedWallpapers.length > 0 && (
          <section className="mt-24">
            <h2 className="text-2xl font-bold text-white mb-8">
              More in {wallpaper.category}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {relatedWallpapers.map((wp, index) => (
                <WallpaperCard key={wp.id} wallpaper={wp} index={index} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
