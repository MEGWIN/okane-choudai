import { createClient } from '@/utils/supabase/server'
import PostCard from '@/components/PostCard'
import TopicBanner from '@/components/TopicBanner'
import Link from 'next/link'

export const dynamic = 'force-dynamic' // Always fetch fresh data

export default async function Home() {
  const supabase = await createClient()
  const now = new Date().toISOString()

  // 現在のお題を取得
  const { data: currentTopic } = await supabase
    .from('hourly_topics')
    .select('id')
    .lte('starts_at', now)
    .gt('ends_at', now)
    .eq('is_active', true)
    .limit(1)
    .single()

  // 現在のお題の投稿のみ取得
  let posts = null
  if (currentTopic) {
    const { data } = await supabase
      .from('posts')
      .select(`
        *,
        users (
          display_name,
          avatar_url,
          paypay_id
        )
      `)
      .eq('topic_id', currentTopic.id)
      .gt('expires_at', now)
      .order('created_at', { ascending: false })
    posts = data
  }

  // ❤数でランクを計算（表示順は新着のまま）
  const rankMap = new Map<string, number>()
  if (posts) {
    const sorted = [...posts].sort((a, b) => (b.heart_count || 0) - (a.heart_count || 0))
    sorted.forEach((p, i) => rankMap.set(p.id, i + 1))
  }

  return (
    <div className="flex flex-col gap-6">

      {/* Current Topic Banner */}
      <TopicBanner />

      {/* Hero / Welcome for empty state - Animal Crossing Style */}
      {(!posts || posts.length === 0) && (
        <div className="ac-card flex flex-col items-center justify-center py-12 px-6 text-center space-y-5 bg-[#fffacd]/95">
          <div className="text-6xl bell-animate">🔔</div>
          <h2 className="text-2xl font-bold text-[#5d4e37]">まだ投稿がありません</h2>
          <p className="text-[#8b7355]">
            一番乗りでお金をお願いしてみましょう！<br />
            写真は1時間で消えるので安心です。
          </p>
          <Link
            href="/upload"
            className="ac-button px-8 py-4 text-lg"
          >
            投稿する
          </Link>
        </div>
      )}

      {/* Post Stream（新着順、ランクは❤数順） */}
      <div className="flex flex-col gap-6">
        {posts?.map((post) => (
          // @ts-ignore
          <PostCard key={post.id} post={post} rank={rankMap.get(post.id) || 1} />
        ))}
      </div>

    </div>
  )
}
