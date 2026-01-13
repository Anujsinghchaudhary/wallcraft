import prisma from '@/lib/db'
import { WallpaperCard } from '@/components/wallpaper-card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface WallpaperGridProps {
  category?: string
  search?: string
  sort?: string
  page: number
}

const ITEMS_PER_PAGE = 12

export async function WallpaperGrid({ category, search, sort, page }: WallpaperGridProps) {
  const skip = (page - 1) * ITEMS_PER_PAGE

  // Build where clause
  const where: Record<string, unknown> = {
    isActive: true,
  }

  if (category) {
    where.category = category
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { tags: { hasSome: [search.toLowerCase()] } },
    ]
  }

  // Build orderBy
  let orderBy: Record<string, string> = { createdAt: 'desc' }
  
  switch (sort) {
    case 'price-low':
      orderBy = { price: 'asc' }
      break
    case 'price-high':
      orderBy = { price: 'desc' }
      break
    case 'popular':
      orderBy = { downloads: 'desc' }
      break
    case 'newest':
    default:
      orderBy = { createdAt: 'desc' }
  }

  const [wallpapers, totalCount] = await Promise.all([
    prisma.wallpaper.findMany({
      where,
      orderBy,
      skip,
      take: ITEMS_PER_PAGE,
    }),
    prisma.wallpaper.count({ where }),
  ])

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)

  // Build pagination URLs
  const buildUrl = (newPage: number) => {
    const params = new URLSearchParams()
    if (category) params.set('category', category)
    if (search) params.set('search', search)
    if (sort) params.set('sort', sort)
    params.set('page', newPage.toString())
    return `/wallpapers?${params.toString()}`
  }

  if (wallpapers.length === 0) {
    return (
      <div className="text-center py-24">
        <p className="text-muted-foreground text-lg mb-4">No wallpapers found</p>
        <p className="text-sm text-muted-foreground mb-8">
          Try adjusting your filters or search query
        </p>
        <Button variant="outline" asChild>
          <Link href="/wallpapers">Clear Filters</Link>
        </Button>
      </div>
    )
  }

  return (
    <div>
      {/* Results count */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-muted-foreground">
          Showing {skip + 1}-{Math.min(skip + ITEMS_PER_PAGE, totalCount)} of {totalCount} wallpapers
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        {wallpapers.map((wallpaper, index) => (
          <WallpaperCard key={wallpaper.id} wallpaper={wallpaper} index={index} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-12">
          <Button
            variant="outline"
            size="icon"
            disabled={page <= 1}
            asChild={page > 1}
          >
            {page > 1 ? (
              <Link href={buildUrl(page - 1)}>
                <ChevronLeft className="h-4 w-4" />
              </Link>
            ) : (
              <span><ChevronLeft className="h-4 w-4" /></span>
            )}
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => {
                // Show first, last, current, and adjacent pages
                return p === 1 || p === totalPages || Math.abs(p - page) <= 1
              })
              .map((p, i, arr) => {
                // Add ellipsis where pages are skipped
                const showEllipsisBefore = i > 0 && p - arr[i - 1] > 1

                return (
                  <span key={p} className="flex items-center">
                    {showEllipsisBefore && (
                      <span className="px-2 text-muted-foreground">...</span>
                    )}
                    <Button
                      variant={p === page ? 'default' : 'ghost'}
                      size="sm"
                      className="w-10"
                      asChild={p !== page}
                    >
                      {p !== page ? (
                        <Link href={buildUrl(p)}>{p}</Link>
                      ) : (
                        <span>{p}</span>
                      )}
                    </Button>
                  </span>
                )
              })}
          </div>

          <Button
            variant="outline"
            size="icon"
            disabled={page >= totalPages}
            asChild={page < totalPages}
          >
            {page < totalPages ? (
              <Link href={buildUrl(page + 1)}>
                <ChevronRight className="h-4 w-4" />
              </Link>
            ) : (
              <span><ChevronRight className="h-4 w-4" /></span>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
