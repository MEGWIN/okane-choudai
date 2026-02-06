'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Loader2, AlertTriangle } from 'lucide-react'

export default function VerifyAgePage() {
  const [loading, setLoading] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleVerify = async () => {
    if (!agreed) {
      alert('18歳以上であることを確認してください')
      return
    }

    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // DBのis_verified_adultをtrueに更新
      const { error } = await supabase
        .from('users')
        .update({ is_verified_adult: true })
        .eq('id', user.id)

      if (error) throw error

      router.push('/')
      router.refresh()
    } catch (error: any) {
      alert('エラーが発生しました: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async () => {
    // ログアウトしてトップへ
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6 px-4">
      {/* Warning Card */}
      <div className="ac-card bg-[#fff3e0] border-[#ff9800] p-6 text-center w-full max-w-sm space-y-4">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-[#ff9800] rounded-full flex items-center justify-center">
            <AlertTriangle className="w-10 h-10 text-white" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-[#e65100]">年齢確認</h1>

        <div className="text-left text-sm text-[#bf360c] space-y-2">
          <p>このサービスは<strong>18歳以上</strong>の方のみご利用いただけます。</p>
          <p>以下の内容をご確認の上、同意される場合はチェックを入れてください。</p>
        </div>

        <div className="bg-white rounded-xl p-4 text-left text-xs text-[#5d4e37] space-y-2 border-2 border-[#daa520]">
          <p>・投稿された写真に対して送金が発生する場合があります</p>
          <p>・送金はPayPayアプリを通じて行われます</p>
          <p>・なりすまし投稿にご注意ください</p>
          <p>・不適切な投稿は削除される場合があります</p>
        </div>

        {/* Checkbox */}
        <label className="flex items-center gap-3 cursor-pointer bg-white rounded-xl p-4 border-2 border-[#daa520]">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="w-6 h-6 accent-[#3cb371]"
          />
          <span className="text-sm font-bold text-[#5d4e37]">
            私は18歳以上であり、上記に同意します
          </span>
        </label>
      </div>

      {/* Buttons */}
      <div className="w-full max-w-sm space-y-3">
        <button
          onClick={handleVerify}
          disabled={loading || !agreed}
          className={`w-full py-4 font-bold rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg border-4 ${
            agreed
              ? 'bg-gradient-to-b from-[#3cb371] to-[#2e8b57] text-white border-[#1a5c36] hover:scale-[1.02] active:scale-95'
              : 'bg-gray-300 text-gray-500 border-gray-400 cursor-not-allowed'
          }`}
        >
          {loading ? (
            <Loader2 className="animate-spin" />
          ) : (
            <>
              <span>✅</span>
              同意して利用を開始
            </>
          )}
        </button>

        <button
          onClick={handleCancel}
          className="w-full py-3 bg-white text-[#8b7355] font-bold rounded-2xl border-3 border-[#daa520] hover:bg-[#fffacd] transition-colors"
        >
          キャンセル（ログアウト）
        </button>
      </div>
    </div>
  )
}
