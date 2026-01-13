import { Suspense } from 'react'
import { WallpaperGrid } from './wallpaper-grid'
import { WallpaperFilters } from './wallpaper-filters'
import prisma from '@/lib/db'

interface PageProps {
  searchParams: Promise<{
    category?: string
    search?: string
    sort?: string
    page?: string
  }>
}

async function getCategories() {
  return prisma.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
  })
}

export const metadata = {
  title: 'Browse Wallpapers',
  description: 'Discover our collection of premium iPhone live wallpapers',
}

export default async function WallpapersPage({ searchParams }: PageProps) {
  const params = await searchParams
  const categories = await getCategories()

  return (
    <div className="min-h-screen px-4 pb-24">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Browse Wallpapers
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Explore our curated collection of premium live wallpapers for your iPhone
          </p>
        </div>

        {/* Filters */}
        <WallpaperFilters 
          categories={categories} 
          selectedCategory={params.category}
          searchQuery={params.search}
          sortBy={params.sort}
        />

        {/* Grid */}
        <Suspense fallback={<WallpaperGridSkeleton />}>
          <WallpaperGrid
            category={params.category}
            search={params.search}
            sort={params.sort}
            page={params.page ? parseInt(params.page) : 1}
          />
        </Suspense>
      </div>
    </div>
  )
}

function WallpaperGridSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-[9/16] rounded-2xl bg-white/5" />
          <div className="mt-3 space-y-2">
            <div className="h-4 bg-white/5 rounded w-3/4" />
            <div className="h-3 bg-white/5 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}
