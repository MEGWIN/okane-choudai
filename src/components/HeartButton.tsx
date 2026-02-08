'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'

interface HeartButtonProps {
  postId: string
  heartCount: number
  onVote: () => void
}

export default function HeartButton({ postId, heartCount, onVote }: HeartButtonProps) {
  const [remainingHearts, setRemainingHearts] = useState(10)
  const [userId, setUserId] = useState<string | null>(null)
  const [topicId, setTopicId] = useState<string | null>(null)
  const supabase = createClient()

  // バッチ送信用
  const pendingRef = useRef(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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

      // 今時間の残りハート数を取得
      const hourStart = getCurrentHourStart()
      const { data } = await supabase
        .from('heart_votes')
        .select('hearts')
        .eq('user_id', user.id)
        .gte('created_at', hourStart)

      const used = data?.reduce((sum, v) => sum + v.hearts, 0) || 0
      setRemainingHearts(Math.max(0, 10 - used))

      // 現在のtopic_idをキャッシュ（毎クリック取得しない）
      const now = new Date().toISOString()
      const { data: topic } = await supabase
        .from('hourly_topics')
        .select('id')
        .lte('starts_at', now)
        .gt('ends_at', now)
        .eq('is_active', true)
        .limit(1)
        .single()

      if (topic) setTopicId(topic.id)
    }
    init()
  }, [supabase])

  // バッチ送信: 溜まったハートを1回のRPCで送る
  const flush = useCallback(() => {
    const count = pendingRef.current
    if (count <= 0 || !userId) return
    pendingRef.current = 0

    // .then() で実行をトリガー（supabase-jsは遅延実行）
    supabase.rpc('batch_vote_hearts', {
      p_user_id: userId,
      p_post_id: postId,
      p_topic_id: topicId,
      p_hearts: count,
    }).then(({ error }) => {
      if (error) console.error('heart vote failed:', error)
    })
  }, [userId, postId, topicId, supabase])

  // flushの最新版をrefで保持（cleanup用）
  const flushRef = useRef(flush)
  useEffect(() => { flushRef.current = flush }, [flush])

  // アンマウント時に残りを送信
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      flushRef.current()
    }
  }, [])

  const handleVote = () => {
    if (!userId || remainingHearts <= 0) return

    // 即座にUI更新（optimistic）
    setRemainingHearts(prev => prev - 1)
    onVote()

    // バッチに蓄積
    pendingRef.current += 1

    // 300ms後にまとめて送信（連射対応）
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(flush, 300)
  }

  const isDisabled = !userId || remainingHearts <= 0

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
