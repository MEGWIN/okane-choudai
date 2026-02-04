import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Link from 'next/link'
import { Heart, Upload, User } from 'lucide-react'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'お金ちょうだい❤',
  description: '写真1枚で勝負する超シンプルマイクロ寄付プラットフォーム',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja" className="dark">
      <body className={`${inter.className} min-h-screen bg-background text-foreground antialiased`}>
        <div className="flex flex-col min-h-screen max-w-md mx-auto bg-black border-x border-white/10 shadow-2xl relative">
          
          {/* Header */}
          <header className="fixed top-0 w-full max-w-md z-50 glass-panel border-b border-white/5 px-4 h-16 flex items-center justify-between">
             <Link href="/" className="font-bold text-xl tracking-tighter flex items-center gap-2">
                <span className="text-2xl">💸</span>
                <span className="text-gradient">GiveMeMoney</span>
             </Link>
             <div className="flex gap-4">
               {/* Placeholder for Auth Status */}
             </div>
          </header>

          <main className="flex-1 pt-20 pb-20 px-4">
            {children}
          </main>

          {/* Bottom Nav */}
          <nav className="fixed bottom-0 w-full max-w-md z-50 glass-panel border-t border-white/5 px-6 h-16 flex items-center justify-between text-muted-foreground">
            <Link href="/" className="flex flex-col items-center gap-1 hover:text-primary transition-colors">
              <Heart className="w-6 h-6" />
              <span className="text-[10px] font-medium">Home</span>
            </Link>
            <Link href="/upload" className="flex flex-col items-center gap-1 -mt-6">
              <div className="bg-primary text-primary-foreground p-3 rounded-full shadow-lg hover:scale-105 transition-transform">
                <Upload className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-medium text-primary">Upload</span>
            </Link>
            <Link href="/profile" className="flex flex-col items-center gap-1 hover:text-primary transition-colors">
              <User className="w-6 h-6" />
              <span className="text-[10px] font-medium">Profile</span>
            </Link>
          </nav>

        </div>
      </body>
    </html>
  )
}
