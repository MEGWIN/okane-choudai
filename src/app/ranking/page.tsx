'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import Image from 'next/image'
import { Loader2, X } from 'lucide-react'
import PostCard from '@/components/PostCard'

interface RankedPost {
  id: string
  image_url: string
  caption: string | null
  heart_count: number
  users: {
    display_name: string | null
    avatar_url: string | null
    paypay_id: string | null
  } | null
}

interface Topic {
  id: string
  title: string
  starts_at: string
  ends_at: string
}

export default function RankingPage() {
  const [currentTopic, setCurrentTopic] = useState<Topic | null>(null)
  const [pastTopics, setPastTopics] = useState<Topic[]>([])
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null)
  const [posts, setPosts] = useState<RankedPost[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPost, setSelectedPost] = useState<{ post: RankedPost, rank: number } | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function fetchTopics() {
      const now = new Date().toISOString()

      const { data: current } = await supabase
        .from('hourly_topics')
        .select('*')
        .lte('starts_at', now)
        .gt('ends_at', now)
        .eq('is_active', true)
        .limit(1)
        .single()

      if (current) {
        setCurrentTopic(current)
        setSelectedTopic(current)
      }

      const todayStart = new Date()
      todayStart.setHours(0, 0, 0, 0)

      const { data: past } = await supabase
        .from('hourly_topics')
        .select('*')
        .gte('starts_at', todayStart.toISOString())
        .lt('ends_at', now)
        .eq('is_active', true)
        .order('starts_at', { ascending: false })

      if (past) setPastTopics(past)
      setLoading(false)
    }
    fetchTopics()
  }, [supabase])

  useEffect(() => {
    if (!selectedTopic) return

    async function fetchRanking() {
      const { data } = await supabase
        .from('posts')
        .select(`
          id,
          image_url,
          caption,
          heart_count,
          users (
            display_name,
            avatar_url,
            paypay_id
          )
        `)
        .eq('topic_id', selectedTopic!.id)
        .order('heart_count', { ascending: false })
        .limit(20)

      // @ts-ignore
      if (data) setPosts(data)
    }
    fetchRanking()

    // リアルタイム購読: heart_countが変わったら即ランキング更新
    const channel = supabase
      .channel(`ranking-${selectedTopic.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'posts',
          filter: `topic_id=eq.${selectedTopic.id}`,
        },
        (payload) => {
          const updated = payload.new as { id: string; heart_count: number }
          setPosts(prev => {
            const newPosts = prev.map(p =>
              p.id === updated.id ? { ...p, heart_count: updated.heart_count } : p
            )
            return newPosts.sort((a, b) => (b.heart_count || 0) - (a.heart_count || 0))
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [selectedTopic, supabase])

  if (loading) return (
    <div className="flex justify-center p-10">
      <Loader2 className="animate-spin text-[#3cb371] w-8 h-8" />
    </div>
  )

  const maxHearts = posts.length > 0 ? Math.max(...posts.map(p => p.heart_count || 0), 1) : 1

  return (
    <>
      <div className="space-y-3">
        {/* Topic Selector */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {currentTopic && (
            <button
              onClick={() => setSelectedTopic(currentTopic)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-bold transition-all border-2 ${
                selectedTopic?.id === currentTopic.id
                  ? 'bg-[#3cb371] text-white border-[#2e8b57]'
                  : 'bg-white text-[#5d4e37] border-[#daa520]'
              }`}
            >
              📝 {currentTopic.title}（NOW）
            </button>
          )}
          {pastTopics.map(topic => (
            <button
              key={topic.id}
              onClick={() => setSelectedTopic(topic)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-bold transition-all border-2 ${
                selectedTopic?.id === topic.id
                  ? 'bg-[#3cb371] text-white border-[#2e8b57]'
                  : 'bg-white text-[#5d4e37] border-[#daa520]'
              }`}
            >
              {topic.title}
            </button>
          ))}
        </div>

        {/* Ranking List */}
        {posts.length === 0 ? (
          <div className="ac-card bg-[#fffacd]/95 p-8 text-center">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-[#8b7355] font-bold">まだ投稿がありません</p>
          </div>
        ) : (
          <div className="space-y-2">
            {posts.map((post, i) => {
              const imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/posts/${post.image_url}`
              const hearts = post.heart_count || 0
              const barWidth = Math.max((hearts / maxHearts) * 100, 8)
              const isTop3 = i < 3
              const rankEmoji = i === 0 ? '👑' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`

              return (
                <button
                  key={post.id}
                  onClick={() => setSelectedPost({ post, rank: i + 1 })}
                  className={`w-full text-left rounded-2xl overflow-hidden transition-all active:scale-[0.98] ${
                    isTop3 ? 'bg-[#fffacd] border-3' : 'bg-white/90 border-2'
                  } ${
                    i === 0 ? 'border-[#ffd700] shadow-lg' :
                    i === 1 ? 'border-[#c0c0c0] shadow-md' :
                    i === 2 ? 'border-[#cd7f32] shadow-md' :
                    'border-[#daa520]/30'
                  }`}
                >
                  <div className="flex items-center gap-3 p-2.5">
                    {/* Rank */}
                    <div className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center font-bold shadow-sm ${
                      i === 0 ? 'bg-[#ffd700] text-[#5d4e37] text-lg' :
                      i === 1 ? 'bg-[#c0c0c0] text-[#5d4e37] text-lg' :
                      i === 2 ? 'bg-[#cd7f32] text-white text-lg' :
                      'bg-[#5d4e37]/10 text-[#5d4e37] text-sm'
                    }`}>
                      {rankEmoji}
                    </div>

                    {/* Thumbnail */}
                    <div className={`flex-shrink-0 rounded-xl overflow-hidden border-2 border-[#daa520]/50 ${
                      isTop3 ? 'w-14 h-14' : 'w-11 h-11'
                    }`}>
                      <Image
                        src={imageUrl}
                        alt=""
                        width={56}
                        height={56}
                        className="object-cover w-full h-full"
                      />
                    </div>

                    {/* Name + Heart Bar */}
                    <div className="flex-1 min-w-0">
                      <p className={`font-bold text-[#5d4e37] truncate ${isTop3 ? 'text-sm' : 'text-xs'}`}>
                        {post.users?.display_name || 'ゲスト'}
                      </p>
                      {/* Heart bar */}
                      <div className="mt-1 h-5 bg-[#5d4e37]/5 rounded-full overflow-hidden relative">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            i === 0 ? 'bg-gradient-to-r from-[#ff4567] to-[#ff6b8a]' :
                            i === 1 ? 'bg-gradient-to-r from-[#ff6b8a] to-[#ff8fa8]' :
                            i === 2 ? 'bg-gradient-to-r from-[#ff8fa8] to-[#ffb3c6]' :
                            'bg-gradient-to-r from-[#ffb3c6] to-[#ffd6e0]'
                          }`}
                          style={{ width: `${barWidth}%` }}
                        />
                        <div className="absolute inset-0 flex items-center px-2">
                          <span className="text-[10px] font-bold text-white drop-shadow-sm">
                            {hearts > 0 && '❤'.repeat(Math.min(hearts, 5))}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Heart Count - THE STAR */}
                    <div className="flex-shrink-0 text-right">
                      <div className={`font-black tabular-nums ${
                        i === 0 ? 'text-3xl text-[#ff4567]' :
                        i === 1 ? 'text-2xl text-[#ff6b8a]' :
                        i === 2 ? 'text-xl text-[#ff8fa8]' :
                        'text-lg text-[#ff8fa8]'
                      }`}>
                        {hearts}
                      </div>
                      <div className="text-[10px] text-[#8b7355] font-bold -mt-0.5">❤</div>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* PostCard Modal */}
      {selectedPost && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
          onClick={() => setSelectedPost(null)}
        >
          <div
            className="w-full max-w-md relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedPost(null)}
              className="absolute -top-12 right-0 bg-white/20 backdrop-blur-sm text-white p-2 rounded-full z-50"
            >
              <X className="w-6 h-6" />
            </button>
            {/* @ts-ignore */}
            <PostCard post={selectedPost.post} rank={selectedPost.rank} />
          </div>
        </div>
      )}
    </>
  )
}
