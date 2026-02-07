'use client'

import Link from 'next/link'

export default function AuthCodeErrorPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
      <div className="ac-card bg-[#fffacd]/95 p-6 text-center max-w-sm w-full">
        <div className="text-4xl mb-4">😢</div>
        <h1 className="text-xl font-bold text-[#5d4e37] mb-3">ログインエラー</h1>
        <p className="text-sm text-[#8b7355] mb-6">
          ログインに失敗しました。もう一度お試しください。
        </p>
        <Link
          href="/login"
          className="inline-block bg-[#daa520] text-white font-bold py-3 px-8 rounded-2xl hover:bg-[#b8860b] transition-colors"
        >
          ログインページへ戻る
        </Link>
      </div>
    </div>
  )
}
