'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Share2, Copy, Check, X } from 'lucide-react'
import DonationModal from './DonationModal'
import HeartButton from './HeartButton'

interface Post {
  id: string
  image_url: string
  caption: string | null
  heart_count: number | null
  users: {
    display_name: string | null
    avatar_url: string | null
    paypay_id: string | null
  } | null
}

export default function PostCard({ post, rank }: { post: Post, rank: number }) {
  const [showModal, setShowModal] = useState(false)
  const [selectedAmount, setSelectedAmount] = useState(100)
  const [heartCount, setHeartCount] = useState(post.heart_count || 0)
  const [heartBounce, setHeartBounce] = useState(false)
  const [flyingHearts, setFlyingHearts] = useState<number[]>([])

  const handleDonate = (amount: number) => {
    setSelectedAmount(amount)
    setShowModal(true)
  }

  const handleVote = () => {
    setHeartCount(prev => prev + 1)
    setHeartBounce(true)
    setTimeout(() => setHeartBounce(false), 300)
    const id = Date.now()
    setFlyingHearts(prev => [...prev, id])
    setTimeout(() => setFlyingHearts(prev => prev.filter(h => h !== id)), 800)
  }

  const [showSharePanel, setShowSharePanel] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)

  const getShareData = () => {
    const name = post.users?.display_name || 'ゲスト'
    const shareUrl = `${window.location.origin}/posts/${post.id}`
    const shareText = `${name}さんの投稿に❤${heartCount}個！推しポチ❤️でチェック！ #推しポチ`
    return { shareUrl, shareText }
  }

  const shareToLine = () => {
    const { shareUrl, shareText } = getShareData()
    window.open(`https://line.me/R/share?text=${encodeURIComponent(shareText + '\n' + shareUrl)}`, '_blank', 'noopener')
  }

  const shareToX = () => {
    const { shareUrl, shareText } = getShareData()
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank', 'noopener')
  }

  const shareToInstagram = async () => {
    const { shareUrl } = getShareData()
    await navigator.clipboard.writeText(shareUrl)
    setLinkCopied(true)
    setTimeout(() => setLinkCopied(false), 2000)
    alert('リンクをコピーしました！\nInstagramのストーリーやDMに貼り付けてね')
  }

  const copyLink = async () => {
    const { shareUrl } = getShareData()
    await navigator.clipboard.writeText(shareUrl)
    setLinkCopied(true)
    setTimeout(() => setLinkCopied(false), 2000)
  }

  const imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/posts/${post.image_url}`

  return (
    <>
      <div className="relative w-full bg-[#fffacd] rounded-3xl overflow-hidden shadow-xl border-4 border-[#daa520]">

        {/* Header - ユーザー名のみ */}
        <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-[#3cb371] border-2 border-white flex items-center justify-center overflow-hidden shadow-md">
             {post.users?.avatar_url ? (
               <Image src={post.users.avatar_url} alt="" width={36} height={36} className="object-cover w-full h-full" />
             ) : (
               <span className="text-lg">🌱</span>
             )}
          </div>
          <div className="px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md border-2 border-[#daa520] text-xs font-bold text-[#5d4e37] shadow-md max-w-[120px] truncate">
            {post.users?.display_name || 'ゲスト'}
          </div>
        </div>

        {/* Image */}
        <div className="relative aspect-[3/4] w-full">
          <Image
            src={imageUrl}
            alt=""
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#5d4e37]/80 via-transparent to-transparent opacity-90" />

          {/* ❤トータル数 + ランキング順位バッジ */}
          <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5">
            <div
              className={`flex items-center gap-1 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-full transition-transform ${
                heartBounce ? 'scale-125' : 'scale-100'
              }`}
            >
              <span className={`text-base transition-all ${heartBounce ? 'text-red-300 scale-125' : 'text-red-400'}`}>❤</span>
              <span className="text-white font-bold text-base">{heartCount}</span>
            </div>
            <div className={`px-2.5 py-1 rounded-full font-bold text-xs shadow-md ${
              rank === 1 ? 'bg-[#ffd700] text-[#5d4e37]' :
              rank === 2 ? 'bg-[#c0c0c0] text-[#5d4e37]' :
              rank === 3 ? 'bg-[#cd7f32] text-white' :
              'bg-white/80 text-[#5d4e37]'
            }`}>
              {rank === 1 ? '👑' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '#'}{rank}位
            </div>
          </div>
        </div>

        {/* Flying hearts */}
        {flyingHearts.map(id => (
          <div
            key={id}
            className="flying-heart absolute z-30 pointer-events-none text-red-500 drop-shadow-lg"
          >
            ❤
          </div>
        ))}

        {/* Actions (Overlay at bottom) */}
        <div className="absolute bottom-0 left-0 w-full px-3 pb-3 pt-2 flex flex-col gap-2 z-20">

          {post.caption && (
             <div className="bg-white/90 backdrop-blur-sm rounded-xl px-3 py-1.5 border-2 border-[#daa520]">
               <p className="text-[#5d4e37] font-bold text-sm truncate">
                 {post.caption}
               </p>
             </div>
          )}

          {/* ハートボタン + 寄付ボタン */}
          <div className="flex gap-1.5 w-full items-stretch">
            <HeartButton postId={post.id} heartCount={heartCount} onVote={handleVote} />
            <DonateButton amount={10} onClick={() => handleDonate(10)} />
            <DonateButton amount={100} onClick={() => handleDonate(100)} featured />
            <DonateButton amount={500} onClick={() => handleDonate(500)} />
          </div>

          {/* シェアボタン */}
          {!showSharePanel ? (
            <button
              onClick={() => setShowSharePanel(true)}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-white/80 backdrop-blur-md text-[#5d4e37] font-bold text-sm border-2 border-[#daa520] active:scale-95 transition-all"
            >
              <Share2 className="w-4 h-4" />
              シェアする
            </button>
          ) : (
            <div className="bg-white/95 backdrop-blur-md rounded-xl border-2 border-[#daa520] p-2 space-y-1.5">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold text-[#5d4e37]">シェア先を選択</span>
                <button onClick={() => setShowSharePanel(false)} className="text-[#8b7355]">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                <button onClick={shareToLine} className="flex flex-col items-center gap-1 py-2 rounded-xl bg-[#06C755] text-white active:scale-95 transition-all">
                  <span className="text-lg">💬</span>
                  <span className="text-[10px] font-bold">LINE</span>
                </button>
                <button onClick={shareToX} className="flex flex-col items-center gap-1 py-2 rounded-xl bg-black text-white active:scale-95 transition-all">
                  <span className="text-lg">𝕏</span>
                  <span className="text-[10px] font-bold">X</span>
                </button>
                <button onClick={shareToInstagram} className="flex flex-col items-center gap-1 py-2 rounded-xl bg-gradient-to-br from-[#f09433] via-[#e6683c] to-[#bc1888] text-white active:scale-95 transition-all">
                  <span className="text-lg">📷</span>
                  <span className="text-[10px] font-bold">Insta</span>
                </button>
                <button onClick={copyLink} className="flex flex-col items-center gap-1 py-2 rounded-xl bg-[#5865F2] text-white active:scale-95 transition-all">
                  {linkCopied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  <span className="text-[10px] font-bold">{linkCopied ? 'OK!' : 'コピー'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        <style jsx>{`
          .flying-heart {
            bottom: 15%;
            left: 12%;
            font-size: 1.5rem;
            animation: flyToHeart 0.7s ease-out forwards;
          }
          @keyframes flyToHeart {
            0% {
              bottom: 15%;
              left: 12%;
              opacity: 1;
              transform: scale(1);
            }
            30% {
              opacity: 1;
              transform: scale(2);
            }
            100% {
              bottom: 90%;
              left: 65%;
              opacity: 0;
              transform: scale(0.4);
            }
          }
        `}</style>
      </div>

      <DonationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        amount={selectedAmount}
        paypayId={post.users?.paypay_id || ''}
      />
    </>
  )
}

function DonateButton({ amount, onClick, featured }: { amount: number, onClick: () => void, featured?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`
        relative flex-1 rounded-xl font-bold flex items-center justify-center py-2 transition-all active:scale-95 border-2 whitespace-nowrap min-w-0
        ${featured
          ? 'bg-gradient-to-b from-[#3cb371] to-[#2e8b57] text-white shadow-lg border-[#1a5c36]'
          : 'bg-white/90 backdrop-blur-md text-[#5d4e37] border-[#daa520] hover:bg-[#fffacd]'
        }
      `}
    >
      <div className="flex items-center gap-0.5">
        <span className="text-sm">{featured ? '🔔' : '💰'}</span>
        <span className="text-xs font-bold">¥{amount}</span>
      </div>
    </button>
  )
}
