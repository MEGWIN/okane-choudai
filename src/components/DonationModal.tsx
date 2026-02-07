'use client'

import { useState } from 'react'
import { Copy, ExternalLink, X, Check, AlertTriangle, CheckCircle } from 'lucide-react'

interface DonationModalProps {
  isOpen: boolean
  onClose: () => void
  amount: number
  paypayId: string
  // なりすまし対策用
  xUsername?: string | null
  tiktokUsername?: string | null
  isSnsVerified?: boolean
}

export default function DonationModal({
  isOpen,
  onClose,
  amount,
  paypayId,
  xUsername,
  tiktokUsername,
  isSnsVerified
}: DonationModalProps) {
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

  const handleCopy = () => {
    navigator.clipboard.writeText(paypayId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleOpenPayPay = () => {
    // PayPayアプリを開く（スマホのみ動作）
    // PCの場合はApp Storeページにフォールバック
    const userAgent = navigator.userAgent.toLowerCase()
    const isIOS = /iphone|ipad|ipod/.test(userAgent)
    const isAndroid = /android/.test(userAgent)

    if (isIOS || isAndroid) {
      // スマホ: ディープリンクを試行
      window.location.href = 'paypay://'
      // フォールバック: 少し待ってからストアへ
      setTimeout(() => {
        if (isIOS) {
          window.location.href = 'https://apps.apple.com/jp/app/paypay/id1435783608'
        } else {
          window.location.href = 'https://play.google.com/store/apps/details?id=jp.ne.paypay.android.app'
        }
      }, 1500)
    } else {
      // PC: PayPay公式サイトへ
      window.open('https://paypay.ne.jp/', '_blank')
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      {/* Animal Crossing Style Modal */}
      <div
        className="w-full max-w-sm bg-gradient-to-b from-[#3cb371] to-[#2e8b57] border-4 border-[#1a5c36] rounded-3xl p-5 space-y-4 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >

        {/* Header */}
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="text-2xl">🔔</span> 送金をお願いします！
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Card */}
        <div className="bg-[#fffacd] rounded-2xl p-4 space-y-4 border-3 border-[#daa520]">

          {/* PayPay ID Section */}
          <div className="space-y-2">
            <p className="text-sm font-bold text-[#8b7355]">送付先 PayPay ID</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-white p-3 rounded-xl font-mono text-base text-[#5d4e37] border-2 border-[#daa520]">
                {paypayId || 'ID未設定'}
              </code>
              <button
                onClick={handleCopy}
                className={`p-3 rounded-xl transition-all border-2 ${
                  copied
                    ? 'bg-[#3cb371] text-white border-[#2e8b57]'
                    : 'bg-white text-[#5d4e37] border-[#daa520] hover:bg-[#fffacd]'
                }`}
              >
                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
            {copied && <p className="text-xs text-[#3cb371] text-right font-bold">コピーしました！</p>}
          </div>

          {/* Amount Display */}
          <div className="text-center py-2">
            <p className="text-sm text-[#8b7355]">金額</p>
            <p className="text-4xl font-bold text-[#3cb371]">¥{amount}</p>
          </div>

          {/* SNS認証ステータス（なりすまし対策） */}
          {isSnsVerified ? (
            // SNS連携済み（信頼度高）
            <div className="bg-[#e8f5e9] border-2 border-[#4caf50] rounded-xl p-3 space-y-1">
              <div className="flex items-center gap-2 text-[#2e7d32]">
                <CheckCircle className="w-5 h-5" />
                <span className="font-bold text-sm">SNS認証済みアカウント</span>
              </div>
              {xUsername && (
                <a href={`https://x.com/${xUsername}`} target="_blank" rel="noopener noreferrer" className="block text-sm text-[#2e7d32] pl-7 hover:underline">
                  𝕏 @{xUsername}
                </a>
              )}
              {tiktokUsername && (
                <a href={`https://www.tiktok.com/@${tiktokUsername}`} target="_blank" rel="noopener noreferrer" className="block text-sm text-[#2e7d32] pl-7 hover:underline">
                  TikTok @{tiktokUsername}
                </a>
              )}
              {!xUsername && !tiktokUsername && (
                <p className="text-sm text-[#2e7d32] pl-7">LINE認証済み</p>
              )}
            </div>
          ) : (
            // SNS未連携（注意喚起）
            <div className="bg-[#fff3e0] border-2 border-[#ff9800] rounded-xl p-3 space-y-1">
              <div className="flex items-center gap-2 text-[#e65100]">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-bold text-sm">なりすまし注意</span>
              </div>
              <p className="text-xs text-[#bf360c] pl-7">
                この投稿者はSNSアカウント未連携です。<br />
                送金前に本人かご確認ください。
              </p>
            </div>
          )}

        </div>

        {/* Action Button */}
        <div className="space-y-3">
          <button
            onClick={handleOpenPayPay}
            className="w-full py-4 bg-[#ff0033] text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity border-4 border-[#cc0029] shadow-lg"
          >
            <ExternalLink className="w-5 h-5" />
            PayPayアプリを開く
          </button>
          <p className="text-xs text-center text-white/80">
            ※ 上記ID宛に手動で送金してください。<br />
            ※ 送金完了後、自動で反映される機能は現在ありません。
          </p>
        </div>

      </div>
    </div>
  )
}
