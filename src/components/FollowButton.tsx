'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function FollowButton({
  targetUserId,
  currentUserId,
  initialFollowing,
}: {
  targetUserId: string
  currentUserId: string | null
  initialFollowing: boolean
}) {
  const [isFollowing, setIsFollowing] = useState(initialFollowing)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  // 未ログインor自分自身なら表示しない
  if (!currentUserId || currentUserId === targetUserId) return null

  const handleToggle = async () => {
    setLoading(true)
    if (isFollowing) {
      await supabase
        .from('follows')
        .delete()
        .eq('follower_id', currentUserId)
        .eq('following_id', targetUserId)
      setIsFollowing(false)
    } else {
      await supabase
        .from('follows')
        .insert({ follower_id: currentUserId, following_id: targetUserId })
      setIsFollowing(true)
    }
    setLoading(false)
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all active:scale-95 border-2 ${
        isFollowing
          ? 'bg-white/90 text-[#3cb371] border-[#3cb371]'
          : 'bg-[#3cb371] text-white border-[#2e8b57]'
      }`}
    >
      {isFollowing ? 'フォロー中' : 'フォロー'}
    </button>
  )
}
