'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { useState, useTransition, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Category {
  id: string
  name: string
  slug: string
}

interface WallpaperFiltersProps {
  categories: Category[]
  selectedCategory?: string
  searchQuery?: string
  sortBy?: string
}

const sortOptions = [
  { value: 'newest', label: 'Newest' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
]

export function WallpaperFilters({
  categories,
  selectedCategory,
  searchQuery,
  sortBy = 'newest',
}: WallpaperFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [search, setSearch] = useState(searchQuery || '')
  const [showFilters, setShowFilters] = useState(false)

  const updateFilters = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString())

      Object.entries(updates).forEach(([key, value]) => {
        if (value === null) {
          params.delete(key)
        } else {
          params.set(key, value)
        }
      })

      // Reset to page 1 when filters change
      params.delete('page')

      startTransition(() => {
        router.push(`/wallpapers?${params.toString()}`)
      })
    },
    [router, searchParams]
  )

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateFilters({ search: search || null })
  }

  const handleCategoryChange = (category: string | null) => {
    updateFilters({ category })
  }

  const handleSortChange = (sort: string) => {
    updateFilters({ sort })
  }

  const clearFilters = () => {
    setSearch('')
    startTransition(() => {
      router.push('/wallpapers')
    })
  }

  const hasActiveFilters = selectedCategory || searchQuery || (sortBy && sortBy !== 'newest')

  return (
    <div className="space-y-4">
      {/* Search and Filter Toggle */}
      <div className="flex gap-3">
        <form onSubmit={handleSearch} className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search wallpapers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 h-12"
          />
        </form>
        <Button
          variant={showFilters ? 'default' : 'outline'}
          size="lg"
          onClick={() => setShowFilters(!showFilters)}
          className="h-12 px-4"
        >
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          Filters
          {hasActiveFilters && (
            <span className="ml-2 h-2 w-2 rounded-full bg-gold-400" />
          )}
        </Button>
      </div>

      {/* Expanded Filters */}
      {showFilters && (
        <div className="glass-card p-6 space-y-6 animate-in slide-in-from-top-2">
          {/* Categories */}
          <div>
            <h3 className="text-sm font-medium text-white mb-3">Categories</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleCategoryChange(null)}
                disabled={isPending}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium transition-colors',
                  !selectedCategory
                    ? 'bg-gold-500 text-black'
                    : 'bg-white/5 text-white hover:bg-white/10'
                )}
              >
                All
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryChange(category.name)}
                  disabled={isPending}
                  className={cn(
                    'px-4 py-2 rounded-full text-sm font-medium transition-colors',
                    selectedCategory === category.name
                      ? 'bg-gold-500 text-black'
                      : 'bg-white/5 text-white hover:bg-white/10'
                  )}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* Sort */}
          <div>
            <h3 className="text-sm font-medium text-white mb-3">Sort By</h3>
            <div className="flex flex-wrap gap-2">
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSortChange(option.value)}
                  disabled={isPending}
                  className={cn(
                    'px-4 py-2 rounded-full text-sm font-medium transition-colors',
                    sortBy === option.value
                      ? 'bg-gold-500 text-black'
                      : 'bg-white/5 text-white hover:bg-white/10'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <div className="pt-4 border-t border-white/10">
              <Button
                variant="ghost"
                onClick={clearFilters}
                disabled={isPending}
                className="text-muted-foreground"
              >
                <X className="h-4 w-4 mr-2" />
                Clear all filters
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Active Filters Tags */}
      {hasActiveFilters && !showFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {selectedCategory && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gold-500/10 text-gold-400 text-sm">
              {selectedCategory}
              <button
                onClick={() => handleCategoryChange(null)}
                className="hover:text-gold-300"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {searchQuery && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gold-500/10 text-gold-400 text-sm">
              &quot;{searchQuery}&quot;
              <button
                onClick={() => {
                  setSearch('')
                  updateFilters({ search: null })
                }}
                className="hover:text-gold-300"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {sortBy && sortBy !== 'newest' && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gold-500/10 text-gold-400 text-sm">
              {sortOptions.find((o) => o.value === sortBy)?.label}
              <button
                onClick={() => handleSortChange('newest')}
                className="hover:text-gold-300"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  )
}
