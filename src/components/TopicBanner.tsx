'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'

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

      if (data) setTopic(data)
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
