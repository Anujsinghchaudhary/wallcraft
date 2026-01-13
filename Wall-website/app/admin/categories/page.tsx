import { Metadata } from 'next'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import prisma from '@/lib/db'
import { Button } from '@/components/ui/button'
import { CategoryActions } from './category-actions'

export const metadata: Metadata = {
  title: 'Manage Categories',
  description: 'Admin category management',
}

async function getCategories() {
  return prisma.category.findMany({
    orderBy: { sortOrder: 'asc' },
  })
}

export default async function AdminCategoriesPage() {
  const categories = await getCategories()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Categories</h1>
          <p className="text-muted-foreground">{categories.length} categories</p>
        </div>
        <Button asChild>
          <Link href="/admin/categories/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Link>
        </Button>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Name</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Slug</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Order</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {categories.map((category) => (
                <tr key={category.id} className="hover:bg-white/5">
                  <td className="p-4">
                    <p className="font-medium text-white">{category.name}</p>
                    {category.description && (
                      <p className="text-xs text-muted-foreground">{category.description}</p>
                    )}
                  </td>
                  <td className="p-4">
                    <span className="font-mono text-sm text-muted-foreground">{category.slug}</span>
                  </td>
                  <td className="p-4">
                    <span className="text-white">{category.sortOrder}</span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      category.isActive
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {category.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-4">
                    <CategoryActions category={category} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {categories.length === 0 && (
          <div className="p-12 text-center text-muted-foreground">
            No categories found
          </div>
        )}
      </div>
    </div>
  )
}
