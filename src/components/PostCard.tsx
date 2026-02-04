'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Clock } from 'lucide-react'
import DonationModal from './DonationModal'

interface Post {
  id: string
  image_url: string
  caption: string | null
  expires_at: string
  users: {
    display_name: string | null
    avatar_url: string | null
    paypay_id: string | null
  } | null // Join might return null if user deleted?
}

export default function PostCard({ post }: { post: Post }) {
  const [timeLeft, setTimeLeft] = useState('')
  const [progress, setProgress] = useState(100)
  const [showModal, setShowModal] = useState(false)
  const [selectedAmount, setSelectedAmount] = useState(100)

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date().getTime()
      const expire = new Date(post.expires_at).getTime()
      const totalLife = 60 * 60 * 1000
      const remaining = expire - now

      if (remaining <= 0) {
        setTimeLeft('Expired')
        setProgress(0)
        return
      }

      const p = (remaining / totalLife) * 100
      setProgress(p)

      const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((remaining % (1000 * 60)) / 1000)
      setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`)
    }

    const timer = setInterval(calculateTime, 1000)
    calculateTime() // Initial
    return () => clearInterval(timer)
  }, [post.expires_at])

  if (timeLeft === 'Expired') return null

  const handleDonate = (amount: number) => {
    setSelectedAmount(amount)
    setShowModal(true)
  }

  const imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/posts/${post.image_url}`

  return (
    <>
      {/* Animal Crossing Style Card */}
      <div className="relative w-full bg-[#fffacd] rounded-3xl overflow-hidden shadow-xl border-4 border-[#daa520]">

        {/* Timer Bar - Leaf green style */}
        <div className="absolute top-0 left-0 w-full h-2 bg-[#daa520]/30 z-20">
          <div
            className="h-full bg-gradient-to-r from-[#3cb371] to-[#90ee90] transition-all duration-1000 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Header */}
        <div className="absolute top-4 left-4 z-20 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#3cb371] border-3 border-white flex items-center justify-center overflow-hidden shadow-md">
             {/* Avatar Placeholder - Leaf icon style */}
             <span className="text-xl">🌱</span>
          </div>
          <div className="px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md border-2 border-[#daa520] text-xs font-bold text-[#5d4e37] flex items-center gap-2 shadow-md">
            <span>{post.users?.display_name || 'ゲスト'}</span>
            <span className="w-1 h-1 rounded-full bg-[#daa520]" />
            <Clock className="w-3 h-3 text-[#daa520]" />
            <span className="font-mono text-[#daa520]">{timeLeft}</span>
          </div>
        </div>

        {/* Image */}
        <div className="relative aspect-[3/4] w-full">
          <Image
            src={imageUrl}
            alt="Give me money"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#5d4e37]/80 via-transparent to-transparent opacity-90" />
        </div>

        {/* Actions (Overlay at bottom) */}
        <div className="absolute bottom-0 left-0 w-full p-5 flex flex-col gap-4 z-20">

          {post.caption && (
             <div className="bg-white/90 backdrop-blur-sm rounded-2xl px-4 py-2 border-2 border-[#daa520]">
               <p className="text-[#5d4e37] font-bold text-base">
                 {post.caption}
               </p>
             </div>
          )}

          <div className="flex gap-2 w-full">
            <DonateButton amount={10} onClick={() => handleDonate(10)} />
            <DonateButton amount={100} onClick={() => handleDonate(100)} featured />
            <DonateButton amount={500} onClick={() => handleDonate(500)} />
          </div>
        </div>
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
        relative flex-1 rounded-2xl font-bold flex flex-col items-center justify-center py-3 transition-all active:scale-95 border-3
        ${featured
          ? 'bg-gradient-to-b from-[#3cb371] to-[#2e8b57] text-white shadow-lg border-[#1a5c36]'
          : 'bg-white/90 backdrop-blur-md text-[#5d4e37] border-[#daa520] hover:bg-[#fffacd]'
        }
      `}
    >
      <div className="flex items-center gap-1">
        <span className="text-base">{featured ? '🔔' : '💰'}</span>
        <span className="text-sm font-bold">¥{amount}</span>
      </div>
    </button>
  )
}
