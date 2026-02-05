import type { Metadata } from 'next'
import { createClient } from '@/utils/supabase/server'

export async function generateMetadata(): Promise<Metadata> {
  const supabase = await createClient()
  const now = new Date().toISOString()

  // Get current topic
  const { data: currentTopic } = await supabase
    .from('hourly_topics')
    .select('id, title')
    .lte('starts_at', now)
    .gt('ends_at', now)
    .eq('is_active', true)
    .limit(1)
    .single()

  const topicTitle = currentTopic?.title || '推しポチ❤️'

  // Get top 3 for current topic
  let ogParams = new URLSearchParams({ topic: topicTitle })

  if (currentTopic) {
    const { data: topPosts } = await supabase
      .from('posts')
      .select('heart_count, users ( display_name )')
      .eq('topic_id', currentTopic.id)
      .order('heart_count', { ascending: false })
      .limit(3)

    topPosts?.forEach((post, i) => {
      const name = (post.users as any)?.display_name || 'ゲスト'
      ogParams.set(`top${i + 1}`, name)
      ogParams.set(`hearts${i + 1}`, String(post.heart_count || 0))
    })
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://oshipochi.com'

  return {
    title: `${topicTitle} ランキング | 推しポチ❤️`,
    description: `「${topicTitle}」のランキングをチェック！推しポチ❤️で応援しよう`,
    openGraph: {
      title: `🏆 ${topicTitle} ランキング | 推しポチ❤️`,
      description: `「${topicTitle}」のランキングをチェック！推しポチ❤️で応援しよう`,
      images: [`${baseUrl}/api/og/ranking?${ogParams.toString()}`],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `🏆 ${topicTitle} ランキング | 推しポチ❤️`,
      description: `「${topicTitle}」のランキングをチェック！`,
      images: [`${baseUrl}/api/og/ranking?${ogParams.toString()}`],
    },
  }
}

export default function RankingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
