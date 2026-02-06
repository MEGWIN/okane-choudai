'use client'

import { createClient } from '@/utils/supabase/client'
import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        })
        if (error) throw error
        alert('確認メールを送信しました！メールを確認してください。')
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        router.push('/')
        router.refresh()
      }
    } catch (error: any) {
      alert('エラー: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleOAuthLogin = async (provider: 'google' | 'twitter') => {
    setLoading(true)

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    })
    if (error) {
      alert(error.message)
      setLoading(false)
    }
  }

  const handleLineLogin = () => {
    setLoading(true)
    // カスタム OAuth APIルートへリダイレクト
    window.location.href = '/api/auth/line'
  }

  const handleTikTokLogin = () => {
    setLoading(true)
    // カスタム OAuth APIルートへリダイレクト
    window.location.href = '/api/auth/tiktok'
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
      {/* Welcome Card - Animal Crossing Style */}
      <div className="ac-card bg-[#fffacd]/95 p-6 text-center w-full max-w-sm">
        <div className="text-5xl mb-4 bell-animate">🔔</div>
        <h1 className="text-2xl font-bold text-[#5d4e37]">ようこそ！</h1>
        <p className="text-[#8b7355] mt-2">ログインして始めましょう</p>
      </div>

      <div className="w-full max-w-sm space-y-3">
        {/* Social Login Buttons */}
        <button
          onClick={() => handleOAuthLogin('google')}
          disabled={loading}
          className="w-full py-4 bg-white text-[#5d4e37] font-bold rounded-2xl flex items-center justify-center gap-3 border-3 border-[#daa520] hover:bg-[#fffacd] transition-colors shadow-md disabled:opacity-50"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Googleでログイン
        </button>

        <button
          onClick={handleLineLogin}
          disabled={loading}
          className="w-full py-4 bg-[#06C755] text-white font-bold rounded-2xl flex items-center justify-center gap-3 border-3 border-[#05a847] hover:bg-[#05a847] transition-colors shadow-md disabled:opacity-50"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="white">
            <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .195-.093.365-.23.482l-1.61 1.223 1.61 1.223c.137.117.23.287.23.482 0 .346-.281.63-.63.63-.168 0-.318-.064-.435-.172l-2.022-1.54c-.138-.104-.23-.273-.23-.469s.092-.365.23-.469l2.022-1.54c.117-.108.267-.172.435-.172zM12 2C6.48 2 2 5.813 2 10.5c0 3.972 3.18 7.312 7.5 8.204v2.796c0 .276.224.5.5.5.138 0 .264-.057.355-.148l3.645-3.645C18.52 17.812 22 14.472 22 10.5 22 5.813 17.52 2 12 2z"/>
          </svg>
          LINEでログイン
        </button>

        <button
          onClick={() => handleOAuthLogin('twitter')}
          disabled={loading}
          className="w-full py-4 bg-black text-white font-bold rounded-2xl flex items-center justify-center gap-3 border-3 border-gray-800 hover:bg-gray-900 transition-colors shadow-md disabled:opacity-50"
        >
          <span className="text-xl font-bold">𝕏</span>
          Xでログイン
        </button>

        <button
          onClick={handleTikTokLogin}
          disabled={loading}
          className="w-full py-4 bg-gradient-to-r from-[#25F4EE] via-[#000] to-[#FE2C55] text-white font-bold rounded-2xl flex items-center justify-center gap-3 border-3 border-gray-800 hover:opacity-90 transition-colors shadow-md disabled:opacity-50"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="white">
            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
          </svg>
          TikTokでログイン
        </button>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t-2 border-[#daa520]/30" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-transparent px-3 py-1 text-[#8b7355] bg-[#98d8c8] rounded-full">
              または メールアドレス
            </span>
          </div>
        </div>

        {/* Email Form - Animal Crossing Style */}
        <form onSubmit={handleEmailLogin} className="space-y-4">
          <input
            type="email"
            placeholder="メールアドレス"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-[#fffacd] border-3 border-[#daa520] rounded-2xl px-4 py-3 text-[#5d4e37] placeholder-[#8b7355]/50 focus:outline-none focus:ring-2 focus:ring-[#3cb371]"
            required
          />
          <input
            type="password"
            placeholder="パスワード"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-[#fffacd] border-3 border-[#daa520] rounded-2xl px-4 py-3 text-[#5d4e37] placeholder-[#8b7355]/50 focus:outline-none focus:ring-2 focus:ring-[#3cb371]"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-b from-[#3cb371] to-[#2e8b57] text-white font-bold rounded-2xl border-4 border-[#1a5c36] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg"
          >
            {loading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <>
                <span>{isSignUp ? '📝' : '🚪'}</span>
                {isSignUp ? '新規登録' : 'ログイン'}
              </>
            )}
          </button>
        </form>

        <p
          className="text-center text-sm text-[#5d4e37] cursor-pointer hover:text-[#3cb371] transition-colors bg-white/50 rounded-xl py-2"
          onClick={() => setIsSignUp(!isSignUp)}
        >
          {isSignUp ? 'すでにアカウントをお持ちの方はログイン' : 'アカウントをお持ちでない方は新規登録'}
        </p>
      </div>
    </div>
  )
}
