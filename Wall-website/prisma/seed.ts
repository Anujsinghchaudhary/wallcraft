import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@wallcraft.com' },
    update: {},
    create: {
      email: 'admin@wallcraft.com',
      password: adminPassword,
      name: 'Admin',
      role: 'ADMIN',
    },
  })
  console.log('✅ Admin user created:', admin.email)

  // Create categories
  const categories = [
    { name: 'Nature', slug: 'nature', description: 'Beautiful nature scenes' },
    { name: 'Abstract', slug: 'abstract', description: 'Artistic abstract patterns' },
    { name: 'Space', slug: 'space', description: 'Cosmic and space themes' },
    { name: 'Minimal', slug: 'minimal', description: 'Clean minimal designs' },
    { name: 'Neon', slug: 'neon', description: 'Vibrant neon aesthetics' },
    { name: 'Anime', slug: 'anime', description: 'Anime and illustration' },
    { name: '3D', slug: '3d', description: '3D renders and graphics' },
    { name: 'Seasonal', slug: 'seasonal', description: 'Holiday and seasonal themes' },
  ]

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    })
  }
  console.log('✅ Categories created')

  // Create sample wallpapers (tags as JSON string for SQLite)
  const wallpapers = [
    {
      title: 'Aurora Borealis',
      description: 'Mesmerizing northern lights dancing across the night sky',
      price: 2.99,
      previewUrl: 'https://res.cloudinary.com/demo/video/upload/v1/samples/sea-turtle.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800',
      fileUrl: '/protected/aurora-borealis.mov',
      category: 'Nature',
      tags: JSON.stringify(['aurora', 'night', 'sky', 'nature']),
      isFeatured: true,
    },
    {
      title: 'Neon City Rain',
      description: 'Cyberpunk cityscape with rain reflections',
      price: 3.99,
      previewUrl: 'https://res.cloudinary.com/demo/video/upload/v1/samples/elephants.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=800',
      fileUrl: '/protected/neon-city.mov',
      category: 'Neon',
      tags: JSON.stringify(['neon', 'city', 'rain', 'cyberpunk']),
      isFeatured: true,
    },
    {
      title: 'Cosmic Nebula',
      description: 'Deep space nebula with swirling colors',
      price: 2.49,
      previewUrl: 'https://res.cloudinary.com/demo/video/upload/v1/samples/sea-turtle.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800',
      fileUrl: '/protected/cosmic-nebula.mov',
      category: 'Space',
      tags: JSON.stringify(['space', 'nebula', 'cosmic', 'stars']),
      isFeatured: true,
    },
    {
      title: 'Liquid Metal',
      description: 'Flowing liquid metal abstract animation',
      price: 1.99,
      previewUrl: 'https://res.cloudinary.com/demo/video/upload/v1/samples/elephants.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
      fileUrl: '/protected/liquid-metal.mov',
      category: 'Abstract',
      tags: JSON.stringify(['abstract', 'metal', 'liquid', 'silver']),
    },
    {
      title: 'Cherry Blossoms',
      description: 'Gentle cherry blossom petals falling',
      price: 2.49,
      previewUrl: 'https://res.cloudinary.com/demo/video/upload/v1/samples/sea-turtle.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?w=800',
      fileUrl: '/protected/cherry-blossoms.mov',
      category: 'Nature',
      tags: JSON.stringify(['cherry', 'blossoms', 'spring', 'nature']),
    },
    {
      title: 'Geometric Waves',
      description: 'Minimalist geometric wave patterns',
      price: 1.49,
      previewUrl: 'https://res.cloudinary.com/demo/video/upload/v1/samples/elephants.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=800',
      fileUrl: '/protected/geometric-waves.mov',
      category: 'Minimal',
      tags: JSON.stringify(['minimal', 'geometric', 'waves', 'simple']),
    },
    {
      title: 'Dragon Flight',
      description: 'Majestic dragon soaring through clouds',
      price: 3.49,
      previewUrl: 'https://res.cloudinary.com/demo/video/upload/v1/samples/sea-turtle.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1577493340887-b7bfff550145?w=800',
      fileUrl: '/protected/dragon-flight.mov',
      category: 'Anime',
      tags: JSON.stringify(['dragon', 'anime', 'fantasy', 'flight']),
    },
    {
      title: 'Crystal Cave',
      description: 'Sparkling crystal formations in 3D',
      price: 2.99,
      previewUrl: 'https://res.cloudinary.com/demo/video/upload/v1/samples/elephants.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800',
      fileUrl: '/protected/crystal-cave.mov',
      category: '3D',
      tags: JSON.stringify(['3d', 'crystal', 'cave', 'sparkle']),
      isFeatured: true,
    },
  ]

  for (const wp of wallpapers) {
    await prisma.wallpaper.create({
      data: wp,
    })
  }
  console.log('✅ Sample wallpapers created')

  console.log('🎉 Seed completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
