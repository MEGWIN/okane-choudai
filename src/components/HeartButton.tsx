'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'

interface HeartButtonProps {
  postId: string
  heartCount: number
  onVote: () => void
}

export default function HeartButton({ postId, heartCount, onVote }: HeartButtonProps) {
  const [remainingHearts, setRemainingHearts] = useState(10)
  const [sending, setSending] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const supabase = createClient()

  function getCurrentHourStart() {
    const now = new Date()
    now.setMinutes(0, 0, 0)
    return now.toISOString()
  }

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)

      const hourStart = getCurrentHourStart()
      const { data } = await supabase
        .from('heart_votes')
        .select('hearts')
        .eq('user_id', user.id)
        .gte('created_at', hourStart)

      const used = data?.reduce((sum, v) => sum + v.hearts, 0) || 0
      setRemainingHearts(Math.max(0, 10 - used))
    }
    init()
  }, [supabase])

  const handleVote = async () => {
    if (!userId || remainingHearts <= 0 || sending) return

    setSending(true)

    const now = new Date().toISOString()
    const { data: topic } = await supabase
      .from('hourly_topics')
      .select('id')
      .lte('starts_at', now)
      .gt('ends_at', now)
      .eq('is_active', true)
      .limit(1)
      .single()

    const { error } = await supabase
      .from('heart_votes')
      .insert({
        user_id: userId,
        post_id: postId,
        topic_id: topic?.id || null,
        hearts: 1,
      })

    if (!error) {
      await supabase
        .from('posts')
        .update({ heart_count: heartCount + 1 })
        .eq('id', postId)

      setRemainingHearts(prev => prev - 1)
      onVote()
    }

    setSending(false)
  }

  const isDisabled = !userId || remainingHearts <= 0 || sending

  return (
    <div className="relative">
      <button
        onClick={handleVote}
        disabled={isDisabled}
        className={`
          flex items-center gap-1.5 px-3 py-2.5 rounded-2xl font-bold transition-all active:scale-90 border-3 whitespace-nowrap
          ${!isDisabled
            ? 'bg-gradient-to-b from-[#ff6b8a] to-[#ff4567] text-white border-[#cc3355] shadow-lg hover:scale-105'
            : 'bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed'
          }
        `}
      >
        <span className="text-base">❤</span>
        <span className="text-xs font-bold">
          {!userId ? 'ログイン' : `残り${remainingHearts}`}
        </span>
      </button>
    </div>
  )
}
