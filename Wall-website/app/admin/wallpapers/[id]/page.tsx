import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import prisma from '@/lib/db'
import { WallpaperForm } from '../wallpaper-form'

export const metadata: Metadata = {
  title: 'Edit Wallpaper',
  description: 'Edit wallpaper details',
}

interface PageProps {
  params: Promise<{ id: string }>
}

async function getWallpaper(id: string) {
  return prisma.wallpaper.findUnique({
    where: { id },
  })
}

async function getCategories() {
  return prisma.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
  })
}

export default async function EditWallpaperPage({ params }: PageProps) {
  const { id } = await params
  const [wallpaper, categories] = await Promise.all([
    getWallpaper(id),
    getCategories(),
  ])

  if (!wallpaper) {
    notFound()
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Edit Wallpaper</h1>
        <p className="text-muted-foreground">Update wallpaper details</p>
      </div>

      <WallpaperForm categories={categories} wallpaper={wallpaper} />
    </div>
  )
}
