'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'

// 固定お題リスト（時間帯別・JST）
const FIXED_TOPICS = [
  '深夜のひとりごと',   // 0時
  '眠れない夜に',       // 1時
  '真夜中の告白',       // 2時
  '夜更かしの理由',     // 3時
  '早起きさんへ',       // 4時
  '朝焼けの空',         // 5時
  '目覚めの一枚',       // 6時
  '朝の一杯',           // 7時
  '通勤・通学風景',     // 8時
  '今日のデスク周り',   // 9時
  '午前のおやつ',       // 10時
  'お昼ごはん',         // 11時
  '午後のひととき',     // 12時
  '推しグッズ自慢',     // 13時
  '散歩で見つけたもの', // 14時
  '今日のおやつ',       // 15時
  '夕焼けの空',         // 16時
  '晩ごはん',           // 17時
  '今日の推し活',       // 18時
  '夜のリラックスタイム', // 19時
  '今日のベストショット', // 20時
  '寝る前の一枚',       // 21時
  '深夜のお供',         // 22時
  '今日のありがとう',   // 23時
]

function getJSTHour() {
  const now = new Date()
  const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000)
  return jst.getUTCHours()
}

function getJSTNextHour() {
  const now = new Date()
  const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000)
  const nextHour = new Date(Date.UTC(jst.getUTCFullYear(), jst.getUTCMonth(), jst.getUTCDate(), jst.getUTCHours() + 1, 0, 0))
  // UTC に戻す
  return new Date(nextHour.getTime() - 9 * 60 * 60 * 1000)
}

export default function TopicBanner() {
  const [topic, setTopic] = useState<{ id: string; title: string; ends_at: string } | null>(null)
  const [timeLeft, setTimeLeft] = useState('')
  const supabase = createClient()

  useEffect(() => {
    async function fetchTopic() {
      const now = new Date().toISOString()
      const { data } = await supabase
        .from('hourly_topics')
        .select('id, title, ends_at')
        .lte('starts_at', now)
        .gt('ends_at', now)
        .eq('is_active', true)
        .order('starts_at', { ascending: false })
        .limit(1)
        .single()

      if (data) {
        setTopic(data)
      } else {
        // DB にお題が無い場合、固定リストからフォールバック表示
        const hour = getJSTHour()
        const nextHour = getJSTNextHour()
        setTopic({
          id: 'fallback',
          title: FIXED_TOPICS[hour],
          ends_at: nextHour.toISOString(),
        })
      }
    }
    fetchTopic()
  }, [supabase])

  useEffect(() => {
    if (!topic) return
    const timer = setInterval(() => {
      const now = new Date().getTime()
      const end = new Date(topic.ends_at).getTime()
      const remaining = end - now
      if (remaining <= 0) {
        setTimeLeft('終了！')
        clearInterval(timer)
        return
      }
      const m = Math.floor(remaining / 60000)
      const s = Math.floor((remaining % 60000) / 1000)
      setTimeLeft(`${m}:${s.toString().padStart(2, '0')}`)
    }, 1000)
    return () => clearInterval(timer)
  }, [topic])

  if (!topic) return null

  return (
    <div className="ac-card bg-gradient-to-r from-[#3cb371] to-[#2e8b57] px-4 py-2.5 text-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">📝</span>
          <p className="text-base font-bold">{topic.title}</p>
        </div>
        <div className="flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1">
          <span className="text-xs font-bold text-white/70">残り</span>
          <p className="text-base font-mono font-bold">{timeLeft}</p>
        </div>
      </div>
    </div>
  )
}
