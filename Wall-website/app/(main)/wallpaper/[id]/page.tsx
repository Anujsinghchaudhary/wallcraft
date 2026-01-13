import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import prisma from '@/lib/db'
import { WallpaperDetail } from './wallpaper-detail'
import { getCurrentUser } from '@/lib/auth'

interface PageProps {
  params: Promise<{ id: string }>
}

async function getWallpaper(id: string) {
  const wallpaper = await prisma.wallpaper.findUnique({
    where: { id, isActive: true },
  })
  
  if (wallpaper) {
    // Increment view count
    await prisma.wallpaper.update({
      where: { id },
      data: { views: { increment: 1 } },
    })
  }
  
  return wallpaper
}

async function getRelatedWallpapers(category: string, currentId: string) {
  return prisma.wallpaper.findMany({
    where: {
      category,
      isActive: true,
      id: { not: currentId },
    },
    take: 4,
    orderBy: { downloads: 'desc' },
  })
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const wallpaper = await prisma.wallpaper.findUnique({
    where: { id },
    select: { title: true, description: true, thumbnailUrl: true },
  })

  if (!wallpaper) {
    return { title: 'Wallpaper Not Found' }
  }

  return {
    title: wallpaper.title,
    description: wallpaper.description || `Premium iPhone live wallpaper - ${wallpaper.title}`,
    openGraph: {
      title: wallpaper.title,
      description: wallpaper.description || `Premium iPhone live wallpaper - ${wallpaper.title}`,
      images: [wallpaper.thumbnailUrl],
    },
  }
}

export default async function WallpaperPage({ params }: PageProps) {
  const { id } = await params
  const [wallpaper, user] = await Promise.all([
    getWallpaper(id),
    getCurrentUser(),
  ])

  if (!wallpaper) {
    notFound()
  }

  const relatedWallpapers = await getRelatedWallpapers(wallpaper.category, wallpaper.id)

  // Check if user already owns this wallpaper
  let isOwned = false
  if (user) {
    const existingOrder = await prisma.order.findFirst({
      where: {
        userId: user.id,
        paymentStatus: 'COMPLETED',
        items: {
          some: {
            wallpaperId: wallpaper.id,
          },
        },
      },
    })
    isOwned = !!existingOrder
  }

  return (
    <WallpaperDetail 
      wallpaper={wallpaper} 
      relatedWallpapers={relatedWallpapers}
      user={user}
      isOwned={isOwned}
    />
  )
}
