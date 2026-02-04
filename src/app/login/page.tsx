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
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Welcome</h1>
        <p className="text-muted-foreground">ログインして始めましょう</p>
      </div>

      <div className="w-full max-w-sm space-y-4">
        {/* Social Login Buttons - Placeholders for now until keys are set */}
        <button 
          onClick={() => handleOAuthLogin('google')}
          className="w-full py-3 bg-white text-black font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
        >
          {/* <img src="/google.svg" className="w-5 h-5" /> */}
          Googleでログイン
        </button>
        
        {/*
        <button 
          onClick={() => handleOAuthLogin('twitter')}
          className="w-full py-3 bg-black border border-white/20 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-zinc-900 transition-colors"
        >
          Twitter (X) でログイン
        </button>
        */}

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-white/10" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              または メールアドレス
            </span>
          </div>
        </div>

        {/* Email Form */}
        <form onSubmit={handleEmailLogin} className="space-y-4">
          <input
            type="email"
            placeholder="メールアドレス"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50"
            required
          />
          <input
            type="password"
            placeholder="パスワード"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-center"
          >
            {loading ? <Loader2 className="animate-spin" /> : (isSignUp ? '新規登録' : 'ログイン')}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground cursor-pointer hover:underline" onClick={() => setIsSignUp(!isSignUp)}>
          {isSignUp ? 'すでにアカウントをお持ちの方はログイン' : 'アカウントをお持ちでない方は新規登録'}
        </p>
      </div>
    </div>
  )
}
