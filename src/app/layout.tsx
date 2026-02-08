import type { Metadata } from 'next'
import './globals.css'
import Link from 'next/link'
import BottomNav from '@/components/BottomNav'

export const metadata: Metadata = {
  title: '推しポチ❤️ | OshiPochi',
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
                <span className="text-white drop-shadow-md">推しポチ❤️</span>
             </Link>
          </header>

          <main className="flex-1 pt-20 pb-24 px-4">
            {children}
          </main>

          <BottomNav />

        </div>
      </body>
    </html>
  )
}
