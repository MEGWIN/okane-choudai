import { createClient } from '@/utils/supabase/server'
import PostCard from '@/components/PostCard'
import Link from 'next/link'
import { Plus } from 'lucide-react'

export const revalidate = 60 // Revalidate every minute

export default async function Home() {
  const supabase = await createClient()

  // Fetch active posts
  const { data: posts } = await supabase
    .from('posts')
    .select(`
      *,
      users (
        display_name,
        avatar_url,
        paypay_id
      )
    `)
    // .eq('is_active', true) // Temporarily commented out to show all for debug if cron not running
    .gt('expires_at', new Date().toISOString()) // Only show non-expired
    .order('created_at', { ascending: false })

  return (
    <div className="flex flex-col gap-6">

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

      {/* Post Stream */}
      <div className="flex flex-col gap-6">
        {posts?.map((post) => (
          // @ts-ignore
          <PostCard key={post.id} post={post} />
        ))}
      </div>

       {/* Floating Action Button (Mobile) - Animal Crossing Style */}
       <Link
        href="/upload"
        className="fixed bottom-28 right-4 z-40 bg-[#fffacd] text-[#5d4e37] p-4 rounded-full shadow-xl border-4 border-[#daa520] hover:scale-110 active:scale-90 transition-all md:hidden"
      >
        <Plus className="w-6 h-6" />
      </Link>

    </div>
  )
}
