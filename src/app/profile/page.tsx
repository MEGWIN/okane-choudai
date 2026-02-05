'use client'

import { createClient } from '@/utils/supabase/client'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Camera } from 'lucide-react'
import Image from 'next/image'

export default function ProfilePage() {
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [paypayId, setPaypayId] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [user, setUser] = useState<any>(null)
  const avatarInputRef = useRef<HTMLInputElement>(null)
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
        setAvatarUrl(profile.avatar_url || null)
      }
      setLoading(false)
    }
    loadProfile()
  }, [router, supabase])

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    setUploadingAvatar(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/avatar.${fileExt}`

      // Upload to avatars bucket (overwrite existing)
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)

      // Add cache buster to force refresh
      const newUrl = `${publicUrl}?t=${Date.now()}`

      // Update user profile
      await supabase
        .from('users')
        .update({ avatar_url: newUrl })
        .eq('id', user.id)

      setAvatarUrl(newUrl)
    } catch (error: any) {
      alert('アバターのアップロードに失敗しました: ' + error.message)
    } finally {
      setUploadingAvatar(false)
    }
  }

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

  if (loading) return (
    <div className="flex justify-center p-10">
      <Loader2 className="animate-spin text-[#3cb371] w-8 h-8" />
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header Card - Animal Crossing Style */}
      <div className="ac-card bg-[#fffacd]/95 p-5">
        <div className="flex items-center gap-4">
          <button
            onClick={() => avatarInputRef.current?.click()}
            disabled={uploadingAvatar}
            className="relative w-16 h-16 rounded-full bg-[#3cb371] border-4 border-[#daa520] flex items-center justify-center text-3xl shadow-md overflow-hidden group"
          >
            {uploadingAvatar ? (
              <Loader2 className="w-6 h-6 animate-spin text-white" />
            ) : avatarUrl ? (
              <Image src={avatarUrl} alt="avatar" width={64} height={64} className="object-cover w-full h-full" />
            ) : (
              <span>🏠</span>
            )}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="w-5 h-5 text-white" />
            </div>
          </button>
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarUpload}
          />
          <div>
            <h1 className="text-xl font-bold text-[#5d4e37]">マイページ</h1>
            <p className="text-sm text-[#8b7355]">アイコンをタップで変更</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* Display Name Input */}
        <div className="ac-card bg-white/95 p-4 space-y-2">
          <label className="text-sm font-bold text-[#5d4e37] flex items-center gap-2">
            <span>🏷️</span> 表示名
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full bg-[#fffacd] border-3 border-[#daa520] rounded-2xl px-4 py-3 text-[#5d4e37] placeholder-[#8b7355]/50 focus:outline-none focus:ring-2 focus:ring-[#3cb371]"
            placeholder="あだ名を入力"
          />
        </div>

        {/* PayPay ID Input */}
        <div className="ac-card bg-white/95 p-4 space-y-2">
          <label className="text-sm font-bold text-[#3cb371] flex items-center gap-2">
            <span>💳</span> PayPay ID
          </label>
          <input
            type="text"
            value={paypayId}
            onChange={(e) => setPaypayId(e.target.value)}
            className="w-full bg-[#fffacd] border-3 border-[#3cb371] rounded-2xl px-4 py-3 text-[#5d4e37] placeholder-[#8b7355]/50 focus:outline-none focus:ring-2 focus:ring-[#3cb371]"
            placeholder="例: paypay_user_id"
          />
          <p className="text-xs text-[#8b7355] bg-[#fffacd]/50 rounded-xl p-2">
            ※ これがないとお金を受け取れません！<br />
            PayPayアプリのプロフィールからIDを確認・設定してください。
          </p>
        </div>

        {/* Save Button */}
        <button
          onClick={handleUpdate}
          disabled={updating}
          className="w-full py-4 bg-gradient-to-b from-[#3cb371] to-[#2e8b57] text-white font-bold rounded-2xl border-4 border-[#1a5c36] shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          {updating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              保存中...
            </>
          ) : (
            <>
              <span>💾</span> 保存する
            </>
          )}
        </button>

        {/* Logout Section */}
        <div className="pt-6 border-t-2 border-[#daa520]/30">
          <button
            onClick={handleSignOut}
            className="w-full py-3 bg-white text-red-500 font-bold rounded-2xl border-3 border-red-300 hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
          >
            <span>🚪</span> ログアウト
          </button>
        </div>
      </div>
    </div>
  )
}
