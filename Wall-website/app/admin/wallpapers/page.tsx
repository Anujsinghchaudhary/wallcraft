import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Plus, Edit, Trash2, Eye, EyeOff, Star } from 'lucide-react'
import prisma from '@/lib/db'
import { formatPrice, formatDateTime } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { WallpaperActions } from './wallpaper-actions'

export const metadata: Metadata = {
  title: 'Manage Wallpapers',
  description: 'Admin wallpaper management',
}

interface PageProps {
  searchParams: Promise<{ page?: string; search?: string }>
}

const ITEMS_PER_PAGE = 10

async function getWallpapers(page: number, search?: string) {
  const skip = (page - 1) * ITEMS_PER_PAGE

  const where = search
    ? {
        OR: [
          { title: { contains: search, mode: 'insensitive' as const } },
          { category: { contains: search, mode: 'insensitive' as const } },
        ],
      }
    : {}

  const [wallpapers, total] = await Promise.all([
    prisma.wallpaper.findMany({
      where,
      skip,
      take: ITEMS_PER_PAGE,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.wallpaper.count({ where }),
  ])

  return { wallpapers, total, totalPages: Math.ceil(total / ITEMS_PER_PAGE) }
}

export default async function AdminWallpapersPage({ searchParams }: PageProps) {
  const params = await searchParams
  const page = params.page ? parseInt(params.page) : 1
  const { wallpapers, total, totalPages } = await getWallpapers(page, params.search)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Wallpapers</h1>
          <p className="text-muted-foreground">{total} total wallpapers</p>
        </div>
        <Button asChild>
          <Link href="/admin/wallpapers/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Wallpaper
          </Link>
        </Button>
      </div>

      {/* Search */}
      <form className="flex gap-2">
        <input
          type="search"
          name="search"
          placeholder="Search wallpapers..."
          defaultValue={params.search}
          className="flex-1 h-10 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold-500/50"
        />
        <Button type="submit" variant="secondary">
          Search
        </Button>
      </form>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Wallpaper</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Category</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Price</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Stats</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {wallpapers.map((wallpaper) => (
                <tr key={wallpaper.id} className="hover:bg-white/5">
                  <td className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="relative w-12 h-20 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={wallpaper.thumbnailUrl}
                          alt={wallpaper.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-medium text-white line-clamp-1">{wallpaper.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDateTime(wallpaper.createdAt)}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-1 rounded-full bg-white/10 text-xs text-white">
                      {wallpaper.category}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="text-gold-400 font-medium">
                      {formatPrice(wallpaper.price, wallpaper.currency)}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <span>{wallpaper.views} views</span>
                      <span>{wallpaper.downloads} sales</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {wallpaper.isActive ? (
                        <span className="flex items-center gap-1 text-green-400 text-xs">
                          <Eye className="h-3 w-3" /> Active
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-muted-foreground text-xs">
                          <EyeOff className="h-3 w-3" /> Hidden
                        </span>
                      )}
                      {wallpaper.isFeatured && (
                        <span className="flex items-center gap-1 text-gold-400 text-xs">
                          <Star className="h-3 w-3" fill="currentColor" />
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <WallpaperActions wallpaper={wallpaper} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {wallpapers.length === 0 && (
          <div className="p-12 text-center text-muted-foreground">
            No wallpapers found
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/admin/wallpapers?page=${p}${params.search ? `&search=${params.search}` : ''}`}
              className={`px-4 py-2 rounded-lg text-sm ${
                p === page
                  ? 'bg-gold-500 text-black'
                  : 'bg-white/5 text-white hover:bg-white/10'
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
