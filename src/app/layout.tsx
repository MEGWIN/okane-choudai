import type { Metadata } from 'next'
import './globals.css'
import Link from 'next/link'
import { Home, Upload, User } from 'lucide-react'

export const metadata: Metadata = {
  title: 'お金ちょうだい',
  description: '写真1枚で勝負する超シンプルマイクロ寄付プラットフォーム',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-background text-foreground antialiased">
        <div className="flex flex-col min-h-screen max-w-md mx-auto bg-gradient-to-b from-[#87ceeb] via-[#98d8c8] to-[#7cb342] border-x border-primary/20 shadow-2xl relative">

          {/* Header - Animal Crossing Style */}
          <header className="fixed top-0 w-full max-w-md z-50 ac-header px-4 h-16 flex items-center justify-between">
             <Link href="/" className="font-bold text-xl tracking-tight flex items-center gap-3">
                <div className="leaf-icon scale-75"></div>
                <span className="text-white drop-shadow-md">お金ちょうだい</span>
             </Link>
             <div className="text-2xl">🔔</div>
          </header>

          <main className="flex-1 pt-20 pb-24 px-4">
            {children}
          </main>

          {/* Bottom Nav - Animal Crossing Style */}
          <nav className="fixed bottom-0 w-full max-w-md z-50 ac-nav px-6 h-20 flex items-center justify-around">
            <Link href="/" className="flex flex-col items-center gap-1 text-white/80 hover:text-white transition-colors">
              <div className="bg-white/20 p-2 rounded-xl">
                <Home className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold">ホーム</span>
            </Link>
            <Link href="/upload" className="flex flex-col items-center gap-1 -mt-8">
              <div className="bg-[#fffacd] text-[#5d4e37] p-4 rounded-full shadow-lg border-4 border-[#daa520] hover:scale-110 transition-transform">
                <Upload className="w-7 h-7" />
              </div>
              <span className="text-[10px] font-bold text-white mt-1">とうこう</span>
            </Link>
            <Link href="/profile" className="flex flex-col items-center gap-1 text-white/80 hover:text-white transition-colors">
              <div className="bg-white/20 p-2 rounded-xl">
                <User className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold">マイページ</span>
            </Link>
          </nav>

        </div>
      </body>
    </html>
  )
}
