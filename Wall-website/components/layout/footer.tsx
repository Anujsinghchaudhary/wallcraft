import Link from 'next/link'
import { Sparkles, Twitter, Instagram, Github } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-white/10 mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Sparkles className="h-6 w-6 text-gold-400" />
              <span className="text-lg font-bold gradient-text">WallCraft</span>
            </Link>
            <p className="text-muted-foreground text-sm max-w-xs">
              Premium live wallpapers designed exclusively for iPhone. Transform your device with stunning animations.
            </p>
            <div className="flex gap-4 mt-6">
              <a
                href="#"
                className="text-muted-foreground hover:text-white transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-white transition-colors"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/wallpapers" className="text-muted-foreground hover:text-white text-sm transition-colors">
                  Browse Wallpapers
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-muted-foreground hover:text-white text-sm transition-colors">
                  Categories
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-muted-foreground hover:text-white text-sm transition-colors">
                  My Purchases
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-white mb-4">Support</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/help" className="text-muted-foreground hover:text-white text-sm transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-white text-sm transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-white text-sm transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <a href="mailto:support@wallcraft.com" className="text-muted-foreground hover:text-white text-sm transition-colors">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} WallCraft. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <span>Made with</span>
            <span className="text-red-500">♥</span>
            <span>for iPhone users</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
