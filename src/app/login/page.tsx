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

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
      {/* Welcome Card - Animal Crossing Style */}
      <div className="ac-card bg-[#fffacd]/95 p-6 text-center w-full max-w-sm">
        <div className="text-5xl mb-4 bell-animate">🔔</div>
        <h1 className="text-2xl font-bold text-[#5d4e37]">ようこそ！</h1>
        <p className="text-[#8b7355] mt-2">ログインして始めましょう</p>
      </div>

      <div className="w-full max-w-sm space-y-4">
        {/* Social Login Buttons - Animal Crossing Style */}
        <button
          onClick={() => handleOAuthLogin('google')}
          className="w-full py-4 bg-white text-[#5d4e37] font-bold rounded-2xl flex items-center justify-center gap-2 border-3 border-[#daa520] hover:bg-[#fffacd] transition-colors shadow-md"
        >
          <span className="text-xl">🌐</span>
          Googleでログイン
        </button>

        <div className="relative my-6">
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
