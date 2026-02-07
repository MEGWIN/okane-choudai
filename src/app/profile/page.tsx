'use client'

import { createClient } from '@/utils/supabase/client'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Camera, Copy, Check, Share2, CheckCircle, LinkIcon } from 'lucide-react'
import Image from 'next/image'

export default function ProfilePage() {
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [paypayId, setPaypayId] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [referralCode, setReferralCode] = useState('')
  const [bonusHearts, setBonusHearts] = useState(0)
  const [copied, setCopied] = useState(false)
  const [xUsername, setXUsername] = useState<string | null>(null)
  const [tiktokUsername, setTiktokUsername] = useState<string | null>(null)
  const [isSnsVerified, setIsSnsVerified] = useState(false)
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
        setBonusHearts(profile.bonus_hearts || 0)
        setXUsername(profile.x_username || null)
        setTiktokUsername(profile.tiktok_username || null)
        setIsSnsVerified(profile.is_sns_verified || false)

        // Generate referral code if not exists
        if (profile.referral_code) {
          setReferralCode(profile.referral_code)
        } else {
          const code = Math.random().toString(36).substring(2, 10)
          await supabase
            .from('users')
            .update({ referral_code: code })
            .eq('id', user.id)
          setReferralCode(code)
        }
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

        {/* SNS連携セクション（なりすまし対策） */}
        <div className="ac-card bg-white/95 p-4 space-y-3">
          <label className="text-sm font-bold text-[#5d4e37] flex items-center gap-2">
            <LinkIcon className="w-4 h-4" /> SNS連携（信頼バッジ）
          </label>

          {isSnsVerified ? (
            <div className="bg-[#e8f5e9] border-2 border-[#4caf50] rounded-2xl p-3 space-y-2">
              <div className="flex items-center gap-2 text-[#2e7d32]">
                <CheckCircle className="w-5 h-5" />
                <span className="font-bold text-sm">SNS認証済み</span>
              </div>
              {xUsername && (
                <a href={`https://x.com/${xUsername}`} target="_blank" rel="noopener noreferrer" className="block text-sm text-[#2e7d32] pl-7 hover:underline">𝕏 @{xUsername}</a>
              )}
              {tiktokUsername && (
                <a href={`https://www.tiktok.com/@${tiktokUsername}`} target="_blank" rel="noopener noreferrer" className="block text-sm text-[#2e7d32] pl-7 hover:underline">TikTok @{tiktokUsername}</a>
              )}
              {!xUsername && !tiktokUsername && (
                <p className="text-sm text-[#2e7d32] pl-7">LINE認証済み</p>
              )}
              <p className="text-xs text-[#558b2f] pl-7">
                送金画面に信頼バッジが表示されます
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="bg-[#fff3e0] border-2 border-[#ff9800] rounded-2xl p-3">
                <p className="text-sm text-[#e65100]">
                  XまたはTikTokと連携すると、投稿に信頼バッジが表示されます。
                  なりすまし防止に効果的です。
                </p>
              </div>

              <button
                onClick={async () => {
                  // X連携（Supabase OAuth linkIdentity）
                  const { error } = await supabase.auth.linkIdentity({
                    provider: 'twitter',
                    options: {
                      redirectTo: `${location.origin}/auth/callback?next=/profile`,
                    },
                  })
                  if (error) alert('連携エラー: ' + error.message)
                }}
                className="w-full py-3 bg-black text-white font-bold rounded-2xl flex items-center justify-center gap-3 border-3 border-gray-800 hover:bg-gray-900 transition-colors"
              >
                <span className="text-lg font-bold">𝕏</span>
                Xアカウントを連携
              </button>

              <button
                onClick={() => {
                  // TikTokはSupabase未対応
                  alert('TikTok連携は準備中です')
                }}
                className="w-full py-3 bg-gradient-to-r from-[#25F4EE] via-[#000] to-[#FE2C55] text-white font-bold rounded-2xl flex items-center justify-center gap-3 border-3 border-gray-800 hover:opacity-90 transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="white">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
                TikTokアカウントを連携
              </button>
            </div>
          )}
        </div>

        {/* Invite Section */}
        <div className="ac-card bg-white/95 p-4 space-y-3">
          <label className="text-sm font-bold text-[#ff4567] flex items-center gap-2">
            <span>💌</span> 友だちを招待
          </label>

          {/* Bonus Hearts Display */}
          <div className="flex items-center gap-3 bg-[#fffacd] rounded-2xl p-3 border-2 border-[#daa520]">
            <span className="text-2xl">❤</span>
            <div>
              <p className="text-xs text-[#8b7355] font-bold">ボーナスハート</p>
              <p className="text-xl font-black text-[#ff4567]">{bonusHearts}</p>
            </div>
          </div>

          {/* Referral Code + Copy */}
          <div className="flex gap-2">
            <div className="flex-1 bg-[#fffacd] border-3 border-[#ff4567]/30 rounded-2xl px-4 py-3 text-[#5d4e37] font-mono font-bold text-center tracking-wider">
              {referralCode || '...'}
            </div>
            <button
              onClick={async () => {
                const url = `${window.location.origin}/invite/${referralCode}`
                await navigator.clipboard.writeText(url)
                setCopied(true)
                setTimeout(() => setCopied(false), 2000)
              }}
              className="px-4 rounded-2xl bg-[#ff4567] text-white font-bold border-3 border-[#d63050] active:scale-95 transition-all flex items-center gap-1"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'OK!' : 'コピー'}
            </button>
          </div>

          {/* Share Invite Links */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => {
                const url = `${window.location.origin}/invite/${referralCode}`
                const text = `推しポチ❤️に招待されました！登録してボーナスハートをもらおう🎁\n${url}`
                window.open(`https://line.me/R/share?text=${encodeURIComponent(text)}`, '_blank', 'noopener')
              }}
              className="flex flex-col items-center gap-1 py-3 rounded-2xl bg-[#06C755] text-white font-bold border-3 border-[#05a847] active:scale-95 transition-all"
            >
              <span className="text-xl">💬</span>
              <span className="text-xs">LINE</span>
            </button>
            <button
              onClick={() => {
                const url = `${window.location.origin}/invite/${referralCode}`
                const text = `推しポチ❤️に招待されました！登録してボーナスハートをもらおう🎁 #推しポチ`
                window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank', 'noopener')
              }}
              className="flex flex-col items-center gap-1 py-3 rounded-2xl bg-black text-white font-bold border-3 border-gray-700 active:scale-95 transition-all"
            >
              <span className="text-xl">𝕏</span>
              <span className="text-xs">X</span>
            </button>
            <button
              onClick={async () => {
                const url = `${window.location.origin}/invite/${referralCode}`
                await navigator.clipboard.writeText(url)
                setCopied(true)
                setTimeout(() => setCopied(false), 2000)
              }}
              className="flex flex-col items-center gap-1 py-3 rounded-2xl bg-gradient-to-br from-[#f09433] via-[#e6683c] to-[#bc1888] text-white font-bold border-3 border-[#c13584] active:scale-95 transition-all"
            >
              <span className="text-xl">📷</span>
              <span className="text-xs">{copied ? 'OK!' : 'Insta'}</span>
            </button>
          </div>

          <p className="text-xs text-[#8b7355]">
            友だちが登録すると、あなたと友だちの両方に❤5個ボーナス！
          </p>
        </div>

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
