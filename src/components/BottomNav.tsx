'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Upload, User, Trophy } from 'lucide-react'

const NAV_ITEMS = [
  { href: '/', icon: Home, label: 'ホーム' },
  { href: '/ranking', icon: Trophy, label: 'ランキング' },
  { href: '/profile', icon: User, label: 'マイページ' },
] as const

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 w-full max-w-md z-50 ac-nav px-6 h-20 flex items-center justify-around">
      {NAV_ITEMS.slice(0, 1).map(item => (
        <Link
          key={item.href}
          href={item.href}
          className={`flex flex-col items-center gap-1 transition-colors ${
            pathname === item.href ? 'text-white' : 'text-white/80 hover:text-white'
          }`}
          prefetch={true}
        >
          <div className={`p-2 rounded-xl ${pathname === item.href ? 'bg-white/30' : 'bg-white/20'}`}>
            <item.icon className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-bold">{item.label}</span>
        </Link>
      ))}

      <Link href="/upload" className="flex flex-col items-center gap-1 -mt-8" prefetch={true}>
        <div className="bg-[#fffacd] text-[#5d4e37] p-4 rounded-full shadow-lg border-4 border-[#daa520] hover:scale-110 transition-transform">
          <Upload className="w-7 h-7" />
        </div>
        <span className="text-[10px] font-bold text-white mt-1">とうこう</span>
      </Link>

      {NAV_ITEMS.slice(1).map(item => (
        <Link
          key={item.href}
          href={item.href}
          className={`flex flex-col items-center gap-1 transition-colors ${
            pathname === item.href ? 'text-white' : 'text-white/80 hover:text-white'
          }`}
          prefetch={true}
        >
          <div className={`p-2 rounded-xl ${pathname === item.href ? 'bg-white/30' : 'bg-white/20'}`}>
            <item.icon className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-bold">{item.label}</span>
        </Link>
      ))}
    </nav>
  )
}
