'use client'

import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function ProfilePage() {
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [paypayId, setPaypayId] = useState('')
  const [user, setUser] = useState<any>(null)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)

      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()
      
      if (profile) {
        setDisplayName(profile.display_name || '')
        setPaypayId(profile.paypay_id || '')
      }
      setLoading(false)
    }
    loadProfile()
  }, [router, supabase])

  const handleUpdate = async () => {
    setUpdating(true)
    const { error } = await supabase
      .from('users')
      .update({
        display_name: displayName,
        paypay_id: paypayId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (error) {
      alert('Error updating profile: ' + error.message)
    } else {
      alert('プロフィールを更新しました')
    }
    setUpdating(false)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">プロフィール設定</h1>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">表示名</label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3"
            placeholder="あだ名を入力"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-pink-500">PayPay ID</label>
          <input
            type="text"
            value={paypayId}
            onChange={(e) => setPaypayId(e.target.value)}
            className="w-full bg-white/5 border border-pink-500/30 rounded-xl px-4 py-3"
            placeholder="例: paypay_user_id"
          />
          <p className="text-xs text-muted-foreground">
            ※ これがないとお金を受け取れません！<br />
            PayPayアプリのプロフィールからIDを確認・設定してください。
          </p>
        </div>

        <button
          onClick={handleUpdate}
          disabled={updating}
          className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors"
        >
          {updating ? '保存中...' : '保存する'}
        </button>

        <div className="pt-8 border-t border-white/10">
          <button
            onClick={handleSignOut}
            className="w-full py-3 bg-red-500/10 text-red-500 font-bold rounded-xl border border-red-500/50 hover:bg-red-500/20"
          >
            ログアウト
          </button>
        </div>
      </div>
    </div>
  )
}
