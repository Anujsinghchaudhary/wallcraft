import Link from 'next/link'
import { Sparkles } from 'lucide-react'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="p-6">
        <Link href="/" className="inline-flex items-center gap-2 group">
          <div className="relative">
            <div className="absolute inset-0 bg-gold-500/20 blur-xl rounded-full group-hover:bg-gold-500/30 transition-all duration-300" />
            <Sparkles className="relative h-7 w-7 text-gold-400" />
          </div>
          <span className="text-lg font-bold gradient-text">WallCraft</span>
        </Link>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center p-4">
        {children}
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} WallCraft. All rights reserved.
      </footer>
    </div>
  )
}
