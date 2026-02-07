import { createClient } from '@/utils/supabase/server'
import TopicBanner from '@/components/TopicBanner'
import SwipeFeed from '@/components/SwipeFeed'

export const dynamic = 'force-dynamic' // Always fetch fresh data

export default async function Home() {
  const supabase = await createClient()
  const now = new Date().toISOString()

  // 現在のユーザーを取得
  const { data: { user } } = await supabase.auth.getUser()

  // 現在のお題を取得
  const { data: currentTopic } = await supabase
    .from('hourly_topics')
    .select('id')
    .lte('starts_at', now)
    .gt('ends_at', now)
    .eq('is_active', true)
    .limit(1)
    .single()

  // フォロー中ユーザーを取得
  let followingIds: string[] = []
  if (user) {
    const { data: follows } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', user.id)
    followingIds = follows?.map(f => f.following_id) || []
  }

  // 現在のお題の投稿のみ取得
  let posts: any[] = []
  if (currentTopic) {
    const { data } = await supabase
      .from('posts')
      .select(`
        *,
        users (
          display_name,
          avatar_url,
          paypay_id,
          x_username,
          tiktok_username,
          is_sns_verified
        )
      `)
      .eq('topic_id', currentTopic.id)
      .gt('expires_at', now)
      .order('created_at', { ascending: false })
    posts = data || []
  }

  // ❤数でランクを計算
  const rankMap: Record<string, number> = {}
  if (posts.length > 0) {
    const sorted = [...posts].sort((a, b) => (b.heart_count || 0) - (a.heart_count || 0))
    sorted.forEach((p, i) => { rankMap[p.id] = i + 1 })
  }

  // フォロー中ユーザーの投稿を先に、その後その他（各グループ内は新着順のまま）
  const followingSet = new Set(followingIds)
  const followedPosts = posts.filter(p => followingSet.has(p.user_id))
  const otherPosts = posts.filter(p => !followingSet.has(p.user_id))
  const sortedPosts = [...followedPosts, ...otherPosts]

  return (
    <div className="flex flex-col gap-6">
      {/* Current Topic Banner */}
      <TopicBanner />

      {/* Swipe Feed */}
      <SwipeFeed
        posts={sortedPosts}
        rankMap={rankMap}
        currentUserId={user?.id ?? null}
        followingIds={followingIds}
      />
    </div>
  )
}
