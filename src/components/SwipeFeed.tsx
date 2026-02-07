'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import PostCard from './PostCard'
import Link from 'next/link'

interface FeedPost {
  id: string
  image_url: string
  caption: string | null
  heart_count: number | null
  user_id: string
  users: {
    display_name: string | null
    avatar_url: string | null
    paypay_id: string | null
    x_username?: string | null
    tiktok_username?: string | null
    is_sns_verified?: boolean | null
  } | null
}

const SEEN_KEY = 'oshipochi_seen_posts'

function getSeenPosts(): Set<string> {
  if (typeof window === 'undefined') return new Set()
  try {
    const raw = localStorage.getItem(SEEN_KEY)
    return raw ? new Set(JSON.parse(raw)) : new Set()
  } catch {
    return new Set()
  }
}

function markSeen(postId: string) {
  const seen = getSeenPosts()
  seen.add(postId)
  // 古いエントリを掃除（最大200件保持）
  const arr = Array.from(seen)
  if (arr.length > 200) arr.splice(0, arr.length - 200)
  localStorage.setItem(SEEN_KEY, JSON.stringify(arr))
}

export default function SwipeFeed({
  posts,
  rankMap,
  currentUserId,
  followingIds,
}: {
  posts: FeedPost[]
  rankMap: Record<string, number>
  currentUserId: string | null
  followingIds: string[]
}) {
  // seen投稿をフィルタ
  const [seenSet, setSeenSet] = useState<Set<string>>(new Set())
  const [currentIndex, setCurrentIndex] = useState(0)
  const [swipeY, setSwipeY] = useState(0)
  const [isSwiping, setIsSwiping] = useState(false)
  const touchStartY = useRef(0)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setSeenSet(getSeenPosts())
  }, [])

  // seen済みを除いた投稿リスト
  const unseenPosts = posts.filter(p => !seenSet.has(p.id))
  const currentPost = unseenPosts[currentIndex]

  const goNext = useCallback(() => {
    if (!currentPost) return
    markSeen(currentPost.id)
    setSeenSet(prev => new Set([...prev, currentPost.id]))
    setCurrentIndex(prev => prev + 1)
    setSwipeY(0)
  }, [currentPost])

  // タッチイベント
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY
    setIsSwiping(true)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    if (!isSwiping) return
    const diff = touchStartY.current - e.touches[0].clientY
    // 上方向のみ（diff > 0）
    if (diff > 0) {
      setSwipeY(diff)
    }
  }

  const onTouchEnd = () => {
    setIsSwiping(false)
    // 80px以上スワイプしたら次へ
    if (swipeY > 80) {
      goNext()
    } else {
      setSwipeY(0)
    }
  }

  // 空ステート
  if (!currentPost || currentIndex >= unseenPosts.length) {
    return (
      <div className="ac-card flex flex-col items-center justify-center py-16 px-6 text-center space-y-5 bg-[#fffacd]/95">
        <div className="text-6xl">👀</div>
        <h2 className="text-xl font-bold text-[#5d4e37]">
          全部見たよ！
        </h2>
        <p className="text-[#8b7355] text-sm">
          新しい投稿が来るまで待ってね。<br />
          自分も投稿してみよう！
        </p>
        <Link
          href="/upload"
          className="ac-button px-8 py-4 text-lg"
        >
          投稿する
        </Link>
      </div>
    )
  }

  const followingSet = new Set(followingIds)

  return (
    <div className="relative">
      {/* 残り枚数 */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          {followingSet.has(currentPost.user_id) && (
            <span className="px-2 py-0.5 rounded-full bg-[#3cb371] text-white text-[10px] font-bold">
              フォロー中
            </span>
          )}
        </div>
        <span className="text-xs text-[#8b7355] font-bold">
          残り {unseenPosts.length - currentIndex} 枚
        </span>
      </div>

      {/* カード */}
      <div
        ref={cardRef}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{
          transform: swipeY > 0 ? `translateY(-${swipeY}px) scale(${1 - swipeY / 1000})` : undefined,
          opacity: swipeY > 0 ? 1 - swipeY / 400 : 1,
          transition: isSwiping ? 'none' : 'all 0.3s ease-out',
        }}
      >
        {/* @ts-ignore */}
        <PostCard
          post={currentPost}
          rank={rankMap[currentPost.id] || 1}
          currentUserId={currentUserId}
          isFollowing={followingSet.has(currentPost.user_id)}
        />
      </div>

      {/* スワイプヒント */}
      <div className="flex flex-col items-center mt-4 gap-2">
        <div className="animate-bounce text-[#8b7355]">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 19V5M5 12l7-7 7 7" />
          </svg>
        </div>
        <span className="text-xs text-[#8b7355] font-bold">上にスワイプで次へ</span>

        {/* PCユーザー向け：ボタンでも次へ */}
        <button
          onClick={goNext}
          className="mt-1 px-6 py-2 rounded-2xl bg-white/80 text-[#5d4e37] font-bold text-sm border-2 border-[#daa520] active:scale-95 transition-all"
        >
          次の投稿へ →
        </button>
      </div>
    </div>
  )
}
