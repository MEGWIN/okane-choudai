import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import PostCard from '@/components/PostCard'
import type { Metadata } from 'next'
import Link from 'next/link'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()

  const { data: post } = await supabase
    .from('posts')
    .select(`
      id, heart_count, caption,
      users ( display_name )
    `)
    .eq('id', id)
    .single()

  if (!post) {
    return { title: '投稿が見つかりません | 推しポチ❤️' }
  }

  const name = (post.users as any)?.display_name || 'ゲスト'
  const hearts = post.heart_count || 0
  const caption = post.caption || ''

  const ogParams = new URLSearchParams({
    hearts: String(hearts),
    name,
    ...(caption && { caption }),
  })

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://oshipochi.com'

  return {
    title: `${name}さんの投稿 ❤${hearts} | 推しポチ❤️`,
    description: caption || `${name}さんが推しポチ❤️で❤${hearts}個もらいました！`,
    openGraph: {
      title: `❤${hearts}個もらいました！ | 推しポチ❤️`,
      description: caption || `${name}さんの投稿に推しポチしよう！`,
      images: [`${baseUrl}/api/og/post?${ogParams.toString()}`],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `❤${hearts}個もらいました！ | 推しポチ❤️`,
      description: caption || `${name}さんの投稿に推しポチしよう！`,
      images: [`${baseUrl}/api/og/post?${ogParams.toString()}`],
    },
  }
}

export default async function PostDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: post } = await supabase
    .from('posts')
    .select(`
      id, image_url, caption, heart_count, created_at, topic_id,
      users ( display_name, avatar_url, paypay_id )
    `)
    .eq('id', id)
    .single()

  if (!post) {
    notFound()
  }

  // Get rank within the same topic
  let rank = 1
  if (post.topic_id) {
    const { data: higherPosts } = await supabase
      .from('posts')
      .select('id')
      .eq('topic_id', post.topic_id)
      .gt('heart_count', post.heart_count || 0)

    rank = (higherPosts?.length || 0) + 1
  }

  return (
    <div className="flex flex-col gap-4">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm font-bold text-[#5d4e37] bg-white/80 rounded-full px-4 py-2 w-fit border-2 border-[#daa520]"
      >
        ← ホームに戻る
      </Link>

      {/* @ts-ignore */}
      <PostCard post={post} rank={rank} />
    </div>
  )
}
