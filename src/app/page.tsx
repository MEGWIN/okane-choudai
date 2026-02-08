import { createClient } from '@/utils/supabase/server'
import TopicBanner from '@/components/TopicBanner'
import SwipeFeed from '@/components/SwipeFeed'

// revalidate every 30 seconds instead of force-dynamic
export const revalidate = 30

export default async function Home() {
  const supabase = await createClient()
  const now = new Date().toISOString()

  // 並列実行: お題生成 + ユーザー取得を同時に
  const [, { data: { user } }] = await Promise.all([
    supabase.rpc('ensure_daily_topics'),
    supabase.auth.getUser(),
  ])

  // 現在のお題を取得
  const { data: currentTopic } = await supabase
    .from('hourly_topics')
    .select('id, title, ends_at')
    .lte('starts_at', now)
    .gt('ends_at', now)
    .eq('is_active', true)
    .limit(1)
    .single()

  // 並列実行: フォロー中 + 投稿取得を同時に
  const [followResult, postsResult] = await Promise.all([
    user
      ? supabase.from('follows').select('following_id').eq('follower_id', user.id)
      : Promise.resolve({ data: null }),
    currentTopic
      ? supabase
          .from('posts')
          .select(`
            id, image_url, caption, heart_count, user_id,
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
      : Promise.resolve({ data: null }),
  ])

  const followingIds = followResult.data?.map((f: any) => f.following_id) || []
  const posts: any[] = postsResult.data || []

  // ❤数でランクを計算
  const rankMap: Record<string, number> = {}
  if (posts.length > 0) {
    const sorted = [...posts].sort((a: any, b: any) => (b.heart_count || 0) - (a.heart_count || 0))
    sorted.forEach((p: any, i: number) => { rankMap[p.id] = i + 1 })
  }

  // フォロー中ユーザーの投稿を先に
  const followingSet = new Set(followingIds)
  const followedPosts = posts.filter((p: any) => followingSet.has(p.user_id))
  const otherPosts = posts.filter((p: any) => !followingSet.has(p.user_id))
  const sortedPosts = [...followedPosts, ...otherPosts]

  return (
    <div className="flex flex-col gap-6">
      <TopicBanner
        initialTopic={currentTopic ? { id: currentTopic.id, title: currentTopic.title, ends_at: currentTopic.ends_at } : null}
      />
      <SwipeFeed
        posts={sortedPosts as any}
        rankMap={rankMap}
        currentUserId={user?.id ?? null}
        followingIds={followingIds}
      />
    </div>
  )
}
