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
      
      {/* Hero / Welcome for empty state */}
      {(!posts || posts.length === 0) && (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-6 opacity-80">
          <div className="text-6xl">💸</div>
          <h2 className="text-2xl font-bold">まだ投稿がありません</h2>
          <p className="text-muted-foreground">
            一番乗りでお金をお願いしてみましょう！<br />
            写真は1時間で消えるので安心です。
          </p>
          <Link href="/upload" className="px-6 py-3 bg-white text-black rounded-full font-bold shadow-lg hover:scale-105 transition-transform">
            投稿する
          </Link>
        </div>
      )}

      {/* Post Stream */}
      <div className="flex flex-col">
        {posts?.map((post) => (
          // @ts-ignore
          <PostCard key={post.id} post={post} />
        ))}
      </div>

       {/* Floating Action Button (Mobile) */}
       <Link 
        href="/upload"
        className="fixed bottom-24 right-4 z-40 bg-white text-black p-4 rounded-full shadow-2xl shadow-white/20 hover:scale-110 active:scale-90 transition-all md:hidden"
      >
        <Plus className="w-6 h-6" />
      </Link>

    </div>
  )
}
