'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Heart, Clock } from 'lucide-react'
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
      const created = expire - (60 * 60 * 1000) // Assuming 1 hour life
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
      <div className="relative w-full bg-zinc-900 rounded-2xl overflow-hidden shadow-2xl mb-8 border border-white/5">
        
        {/* Timer Bar */}
        <div className="absolute top-0 left-0 w-full h-1 bg-white/10 z-20">
          <div 
            className="h-full bg-gradient-to-r from-pink-500 to-red-500 transition-all duration-1000 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Header */}
        <div className="absolute top-4 left-4 z-20 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center overflow-hidden">
             {/* Avatar Placeholder */}
             <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-500" />
          </div>
          <div className="px-3 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-xs font-bold text-white flex items-center gap-2">
            <span>{post.users?.display_name || 'Guest User'}</span>
            <span className="w-1 h-1 rounded-full bg-white/50" />
            <Clock className="w-3 h-3 text-red-400" />
            <span className="font-mono text-red-400">{timeLeft}</span>
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
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90" />
        </div>

        {/* Actions (Overlay at bottom) */}
        <div className="absolute bottom-0 left-0 w-full p-6 flex flex-col gap-4 z-20">
          
          {post.caption && (
             <p className="text-white/90 font-medium text-lg drop-shadow-md">
               {post.caption}
             </p>
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
        relative flex-1 rounded-xl font-bold flex flex-col items-center justify-center py-3 transition-all active:scale-95
        ${featured 
          ? 'bg-gradient-to-br from-pink-500 to-rose-600 text-white shadow-lg shadow-pink-500/20 ring-1 ring-white/20' 
          : 'bg-white/10 backdrop-blur-md text-white border border-white/10 hover:bg-white/20'
        }
      `}
    >
      <div className="flex items-center gap-1">
        <Heart className={`w-4 h-4 ${featured ? 'fill-white' : 'fill-pink-500 text-pink-500'}`} />
        <span className="text-sm">¥{amount}</span>
      </div>
    </button>
  )
}
