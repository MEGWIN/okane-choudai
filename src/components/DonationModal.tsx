'use client'

import { useState } from 'react'
import { Copy, ExternalLink, X, Check } from 'lucide-react'

interface DonationModalProps {
  isOpen: boolean
  onClose: () => void
  amount: number
  paypayId: string
}

export default function DonationModal({ isOpen, onClose, amount, paypayId }: DonationModalProps) {
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

  const handleCopy = () => {
    navigator.clipboard.writeText(paypayId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleOpenPayPay = () => {
    // This is a deep link attempt. If it fails, it usually just does nothing or opens app store.
    // Standard URL scheme: paypay://
    window.location.href = 'paypay://' 
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-sm bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 space-y-6 animate-in fade-in zoom-in-95" onClick={e => e.stopPropagation()}>
        
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold">送金をお願いします❤</h3>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-white/5 rounded-xl p-4 space-y-2">
          <p className="text-sm text-muted-foreground">送付先 PayPay ID</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-black/50 p-3 rounded-lg font-mono text-lg">{paypayId || 'ID未設定'}</code>
            <button 
              onClick={handleCopy}
              className={`p-3 rounded-lg transition-all ${copied ? 'bg-green-500 text-white' : 'bg-white/10 hover:bg-white/20'}`}
            >
              {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            </button>
          </div>
          {copied && <p className="text-xs text-green-500 text-right">コピーしました！</p>}
        </div>

        <div className="text-center space-y-1">
          <p className="text-sm text-muted-foreground">金額</p>
          <p className="text-4xl font-bold text-pink-500">¥{amount}</p>
        </div>

        <div className="space-y-3">
          <button 
            onClick={handleOpenPayPay}
            className="w-full py-4 bg-[#ff0033] text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
          >
            <ExternalLink className="w-5 h-5" />
            PayPayアプリを開く
          </button>
          <p className="text-xs text-center text-muted-foreground">
            ※ 上記ID宛に手動で送金してください。<br />
            ※ 送金完了後、自動で反映される機能は現在ありません。
          </p>
        </div>

      </div>
    </div>
  )
}
