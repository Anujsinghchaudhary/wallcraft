import type { Metadata, Viewport } from 'next'
import { Outfit, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-geist-sans',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'WallCraft - Premium iPhone Live Wallpapers',
    template: '%s | WallCraft',
  },
  description:
    'Discover and purchase stunning live wallpapers designed exclusively for iPhone. Premium quality, instant delivery.',
  keywords: [
    'iPhone wallpapers',
    'live wallpapers',
    'dynamic wallpapers',
    'iOS wallpapers',
    'premium wallpapers',
    'phone backgrounds',
  ],
  authors: [{ name: 'WallCraft' }],
  creator: 'WallCraft',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    title: 'WallCraft - Premium iPhone Live Wallpapers',
    description:
      'Discover and purchase stunning live wallpapers designed exclusively for iPhone.',
    siteName: 'WallCraft',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WallCraft - Premium iPhone Live Wallpapers',
    description:
      'Discover and purchase stunning live wallpapers designed exclusively for iPhone.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#0a0a0a',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${outfit.variable} ${jetbrainsMono.variable} font-sans`}>
        <div className="relative min-h-screen overflow-hidden">
          {/* Background effects */}
          <div className="fixed inset-0 -z-50">
            <div className="absolute inset-0 bg-[#050505]" />
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-gold-500/5 rounded-full blur-[128px]" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-[128px]" />
            <div className="absolute inset-0 noise-overlay" />
          </div>
          
          {children}
        </div>
        <Toaster />
      </body>
    </html>
  )
}
