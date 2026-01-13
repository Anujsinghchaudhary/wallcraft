import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Sparkles, Smartphone, Download, Shield, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { WallpaperCard } from '@/components/wallpaper-card'
import prisma from '@/lib/db'

async function getFeaturedWallpapers() {
  return prisma.wallpaper.findMany({
    where: {
      isActive: true,
      isFeatured: true,
    },
    take: 4,
    orderBy: {
      createdAt: 'desc',
    },
  })
}

async function getCategories() {
  return prisma.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
    take: 6,
  })
}

export default async function HomePage() {
  const [featuredWallpapers, categories] = await Promise.all([
    getFeaturedWallpapers(),
    getCategories(),
  ])

  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center px-4 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 -left-48 w-96 h-96 bg-gold-500/10 rounded-full blur-[120px] animate-float" />
          <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] animate-float animation-delay-400" />
        </div>

        <div className="relative max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="text-center lg:text-left stagger-item stagger-1">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold-500/10 border border-gold-500/20 mb-6">
              <Sparkles className="h-4 w-4 text-gold-400" />
              <span className="text-sm text-gold-400 font-medium">Premium Collection</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              <span className="text-white">Transform Your</span>
              <br />
              <span className="gradient-text">iPhone Experience</span>
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-8">
              Discover stunning live wallpapers crafted exclusively for iPhone. 
              Premium quality animations that bring your device to life.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button size="xl" asChild>
                <Link href="/wallpapers">
                  Browse Collection
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="xl" variant="outline" asChild>
                <Link href="#featured">
                  View Featured
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-8 mt-12 justify-center lg:justify-start">
              <div>
                <p className="text-2xl font-bold text-white">500+</p>
                <p className="text-sm text-muted-foreground">Wallpapers</p>
              </div>
              <div className="h-8 w-px bg-white/10" />
              <div>
                <p className="text-2xl font-bold text-white">50K+</p>
                <p className="text-sm text-muted-foreground">Downloads</p>
              </div>
              <div className="h-8 w-px bg-white/10" />
              <div>
                <p className="text-2xl font-bold text-white">4.9★</p>
                <p className="text-sm text-muted-foreground">Rating</p>
              </div>
            </div>
          </div>

          {/* iPhone Mockup */}
          <div className="relative hidden lg:flex justify-center stagger-item stagger-2">
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-gold-500/20 to-purple-500/20 blur-[60px] rounded-full" />
              
              {/* iPhone Frame */}
              <div className="relative iphone-frame glow-gold">
                <div className="iphone-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400">
                  <Image
                    src="https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=600&h=1200&fit=crop"
                    alt="Live Wallpaper Preview"
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              </div>

              {/* Floating badges */}
              <div className="absolute -right-8 top-1/4 glass-card px-4 py-3 animate-float">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Download className="h-4 w-4 text-green-400" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Instant</p>
                    <p className="text-sm font-semibold text-white">Delivery</p>
                  </div>
                </div>
              </div>

              <div className="absolute -left-8 bottom-1/3 glass-card px-4 py-3 animate-float animation-delay-600">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <Shield className="h-4 w-4 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">100%</p>
                    <p className="text-sm font-semibold text-white">Secure</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Why Choose WallCraft?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We deliver premium quality live wallpapers with an unmatched shopping experience
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Smartphone,
                title: 'iPhone Optimized',
                description: 'Designed specifically for iPhone displays with perfect resolution',
              },
              {
                icon: Zap,
                title: 'Instant Delivery',
                description: 'Download your wallpapers immediately after purchase',
              },
              {
                icon: Shield,
                title: 'Secure Payments',
                description: 'Multiple payment options with bank-grade security',
              },
              {
                icon: Download,
                title: 'Lifetime Access',
                description: 'Re-download your purchases anytime from your dashboard',
              },
            ].map((feature, index) => (
              <div
                key={feature.title}
                className="glass-card p-6 hover:bg-white/10 transition-colors group stagger-item"
                style={{ animationDelay: `${(index + 1) * 100}ms` }}
              >
                <div className="h-12 w-12 rounded-xl bg-gold-500/10 flex items-center justify-center mb-4 group-hover:bg-gold-500/20 transition-colors">
                  <feature.icon className="h-6 w-6 text-gold-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Wallpapers */}
      <section id="featured" className="py-24 px-4 bg-gradient-to-b from-transparent via-white/[0.02] to-transparent">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                Featured Wallpapers
              </h2>
              <p className="text-muted-foreground">
                Hand-picked premium wallpapers from our collection
              </p>
            </div>
            <Button variant="outline" asChild className="hidden sm:flex">
              <Link href="/wallpapers">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredWallpapers.map((wallpaper, index) => (
              <WallpaperCard
                key={wallpaper.id}
                wallpaper={wallpaper}
                index={index}
              />
            ))}
          </div>

          <div className="mt-8 text-center sm:hidden">
            <Button variant="outline" asChild>
              <Link href="/wallpapers">
                View All Wallpapers
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      {categories.length > 0 && (
        <section className="py-24 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Browse by Category
              </h2>
              <p className="text-muted-foreground">
                Find the perfect wallpaper for your style
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/wallpapers?category=${category.slug}`}
                  className="glass-card p-6 text-center hover:bg-white/10 transition-all hover:scale-105"
                >
                  <h3 className="font-semibold text-white">{category.name}</h3>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative glass-card p-12 text-center overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-r from-gold-500/10 via-transparent to-gold-500/10" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-gold-500/10 rounded-full blur-[100px]" />
            
            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Ready to Transform Your iPhone?
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto mb-8">
                Join thousands of iPhone users who have elevated their device with our premium live wallpapers.
              </p>
              <Button size="xl" asChild>
                <Link href="/wallpapers">
                  Start Browsing
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
