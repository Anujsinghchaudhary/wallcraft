import { Metadata } from 'next'
import prisma from '@/lib/db'
import { WallpaperForm } from '../wallpaper-form'

export const metadata: Metadata = {
  title: 'Add New Wallpaper',
  description: 'Add a new wallpaper to the store',
}

async function getCategories() {
  return prisma.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
  })
}

export default async function NewWallpaperPage() {
  const categories = await getCategories()

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Add New Wallpaper</h1>
        <p className="text-muted-foreground">Fill in the details to add a new wallpaper</p>
      </div>

      <WallpaperForm categories={categories} />
    </div>
  )
}
