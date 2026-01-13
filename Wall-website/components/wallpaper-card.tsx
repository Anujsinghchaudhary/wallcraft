'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Play, Eye } from 'lucide-react'
import { useState, useRef } from 'react'
import { formatPrice } from '@/lib/utils'

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
  isFeatured: boolean
}

interface WallpaperCardProps {
  wallpaper: Wallpaper
  index?: number
}

export function WallpaperCard({ wallpaper, index = 0 }: WallpaperCardProps) {
  const [isHovering, setIsHovering] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const handleMouseEnter = () => {
    setIsHovering(true)
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        // Autoplay might be blocked
      })
    }
  }

  const handleMouseLeave = () => {
    setIsHovering(false)
    if (videoRef.current) {
      videoRef.current.pause()
      videoRef.current.currentTime = 0
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Link
        href={`/wallpaper/${wallpaper.id}`}
        className="group block"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="relative aspect-[9/16] rounded-2xl overflow-hidden bg-card border border-white/10 transition-all duration-300 group-hover:border-gold-500/30 group-hover:shadow-lg group-hover:shadow-gold-500/10">
          {/* Thumbnail Image */}
          <Image
            src={wallpaper.thumbnailUrl}
            alt={wallpaper.title}
            fill
            className={`object-cover transition-opacity duration-300 ${isHovering ? 'opacity-0' : 'opacity-100'}`}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />

          {/* Video Preview */}
          <video
            ref={videoRef}
            src={wallpaper.previewUrl}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${isHovering ? 'opacity-100' : 'opacity-0'}`}
            loop
            muted
            playsInline
            preload="none"
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Play indicator */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="h-14 w-14 rounded-full bg-white/20 backdrop-blur-xl flex items-center justify-center border border-white/30">
              <Play className="h-6 w-6 text-white ml-1" fill="currentColor" />
            </div>
          </div>

          {/* Featured badge */}
          {wallpaper.isFeatured && (
            <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-gold-500/90 text-black text-xs font-semibold">
              Featured
            </div>
          )}

          {/* Category badge */}
          <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-sm text-white/80 text-xs">
            {wallpaper.category}
          </div>

          {/* Info overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white/60 text-xs">
                <Eye className="h-3.5 w-3.5" />
                <span>Preview</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card info */}
        <div className="mt-3 px-1">
          <h3 className="font-semibold text-white group-hover:text-gold-400 transition-colors line-clamp-1">
            {wallpaper.title}
          </h3>
          <div className="flex items-center justify-between mt-1">
            <p className="text-sm text-muted-foreground">{wallpaper.category}</p>
            <p className="text-sm font-semibold text-gold-400">
              {formatPrice(wallpaper.price, wallpaper.currency)}
            </p>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
