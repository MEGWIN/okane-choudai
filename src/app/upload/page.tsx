'use client'

import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Camera, Loader2, X, Clock, ChevronDown } from 'lucide-react'
import Image from 'next/image'

interface Topic {
  id: string
  title: string
  starts_at: string
  ends_at: string
}

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [caption, setCaption] = useState('')
  const [topics, setTopics] = useState<Topic[]>([])
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null)
  const [loadingTopics, setLoadingTopics] = useState(true)
  const [topicOpen, setTopicOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const supabase = createClient()

  // 24時間以内のお題を取得（現在 + 未来）
  // DB に無ければ ensure_daily_topics RPC で自動生成してリトライ
  useEffect(() => {
    async function fetchTopics() {
      const now = new Date()
      const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000)

      let { data } = await supabase
        .from('hourly_topics')
        .select('id, title, starts_at, ends_at')
        .gt('ends_at', now.toISOString())
        .lte('starts_at', in24h.toISOString())
        .eq('is_active', true)
        .order('starts_at', { ascending: true })

      // お題が無ければ自動生成してリトライ
      if (!data || data.length === 0) {
        await supabase.rpc('ensure_daily_topics')
        const retry = await supabase
          .from('hourly_topics')
          .select('id, title, starts_at, ends_at')
          .gt('ends_at', now.toISOString())
          .lte('starts_at', in24h.toISOString())
          .eq('is_active', true)
          .order('starts_at', { ascending: true })
        data = retry.data
      }

      if (data && data.length > 0) {
        setTopics(data)
        // 現在開催中のお題があればデフォルト選択
        const current = data.find(t =>
          new Date(t.starts_at) <= now && new Date(t.ends_at) > now
        )
        setSelectedTopic(current || data[0])
      }
      setLoadingTopics(false)
    }
    fetchTopics()
  }, [supabase])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setPreviewUrl(URL.createObjectURL(selectedFile))
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const droppedFile = e.dataTransfer.files?.[0]
    if (droppedFile) {
      setFile(droppedFile)
      setPreviewUrl(URL.createObjectURL(droppedFile))
    }
  }

  const clearFile = () => {
    setFile(null)
    setPreviewUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // ファイルをBase64に変換
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        // data:image/xxx;base64, の部分を除去
        const base64 = result.split(',')[1]
        resolve(base64)
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const handleUpload = async () => {
    if (!file || !selectedTopic) return

    setIsUploading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        alert('ログインが必要です')
        setIsUploading(false)
        return
      }

      // NSFW画像チェック
      const base64 = await fileToBase64(file)
      const moderationRes = await fetch('/api/moderate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64 }),
      })
      const moderation = await moderationRes.json()

      if (!moderation.safe) {
        alert('不適切な画像が検出されました。別の画像をお試しください。')
        setIsUploading(false)
        return
      }

      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('posts')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      // お題の終了時刻を投稿の有効期限にする
      const { error: dbError } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          image_url: fileName,
          caption: caption,
          topic_id: selectedTopic.id,
          expires_at: selectedTopic.ends_at,
        })

      if (dbError) throw dbError

      router.push('/')
    } catch (error: any) {
      console.error('Upload Error:', error)
      alert('アップロードに失敗しました: ' + error.message)
    } finally {
      setIsUploading(false)
    }
  }

  // お題の状態を判定
  function getTopicStatus(topic: Topic) {
    const now = Date.now()
    const start = new Date(topic.starts_at).getTime()
    const end = new Date(topic.ends_at).getTime()
    if (now >= start && now < end) return 'now'
    if (now < start) return 'future'
    return 'past'
  }

  // 時刻フォーマット
  function formatTime(dateStr: string) {
    return new Date(dateStr).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="ac-card bg-[#fffacd]/95 p-4">
        <h1 className="text-xl font-bold text-[#5d4e37] flex items-center gap-2">
          <span className="text-2xl">📸</span>
          写真を投稿して<br />お金をお願いする
        </h1>
      </div>

      {/* お題セレクター（折りたたみ） */}
      {loadingTopics ? (
        <div className="flex justify-center py-4">
          <Loader2 className="animate-spin text-[#3cb371] w-6 h-6" />
        </div>
      ) : topics.length === 0 ? (
        <div className="ac-card bg-[#8b7355]/80 p-4 text-white">
          <p className="text-sm font-bold">📝 現在お題がありません</p>
          <p className="text-xs text-white/70 mt-1">次のお題が始まるまでお待ちください</p>
        </div>
      ) : (
        <div className="relative">
          {/* 選択中のお題（タップで開閉） */}
          <button
            onClick={() => setTopicOpen(!topicOpen)}
            className="w-full text-left p-3 rounded-2xl border-3 bg-gradient-to-r from-[#3cb371] to-[#2e8b57] text-white border-[#1a5c36] shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white/70">📝 お題</span>
                {selectedTopic && getTopicStatus(selectedTopic) === 'now' && (
                  <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">NOW</span>
                )}
              </div>
              <ChevronDown className={`w-5 h-5 text-white/80 transition-transform ${topicOpen ? 'rotate-180' : ''}`} />
            </div>
            {selectedTopic && (
              <div className="flex items-center justify-between mt-1">
                <span className="font-bold text-lg">{selectedTopic.title}</span>
                <span className="text-xs text-white/80">{formatTime(selectedTopic.starts_at)} 〜 {formatTime(selectedTopic.ends_at)}</span>
              </div>
            )}
          </button>

          {/* ドロップダウンリスト */}
          {topicOpen && (
            <div className="mt-2 flex flex-col gap-1.5 bg-white/90 backdrop-blur-md rounded-2xl border-3 border-[#daa520] p-2 shadow-xl">
              {topics.map(topic => {
                const status = getTopicStatus(topic)
                const isSelected = selectedTopic?.id === topic.id
                return (
                  <button
                    key={topic.id}
                    onClick={() => { setSelectedTopic(topic); setTopicOpen(false) }}
                    className={`w-full text-left px-3 py-2.5 rounded-xl transition-all ${
                      isSelected
                        ? 'bg-[#3cb371] text-white'
                        : 'text-[#5d4e37] hover:bg-[#fffacd]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {status === 'now' && (
                          <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">NOW</span>
                        )}
                        <span className="font-bold text-sm">{topic.title}</span>
                      </div>
                      <span className={`text-xs ${isSelected ? 'text-white/80' : 'text-[#8b7355]'}`}>
                        {formatTime(topic.starts_at)}〜{formatTime(topic.ends_at)}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}

      <div className="space-y-4">
        {/* Image Dropzone */}
        <div
          className={`relative w-full aspect-[3/4] rounded-3xl border-4 border-dashed transition-all flex flex-col items-center justify-center overflow-hidden
            ${previewUrl ? 'border-transparent' : 'border-[#daa520] bg-[#fffacd]/80 hover:bg-[#fffacd]'}
          `}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => !previewUrl && fileInputRef.current?.click()}
        >
          {previewUrl ? (
            <>
              <Image
                src={previewUrl}
                alt="Preview"
                fill
                className="object-cover rounded-3xl"
              />
              <button
                onClick={(e) => { e.stopPropagation(); clearFile(); }}
                className="absolute top-3 right-3 p-2 bg-[#5d4e37]/80 rounded-full text-white hover:bg-[#5d4e37]"
              >
                <X className="w-5 h-5" />
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-4 text-[#8b7355]">
              <div className="p-5 rounded-full bg-[#daa520]/20">
                <Camera className="w-10 h-10 text-[#daa520]" />
              </div>
              <p className="font-bold">タップして写真を選択</p>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        {/* Caption Input */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-[#5d4e37] ml-1">ひとこと (任意)</label>
          <input
            type="text"
            className="w-full bg-[#fffacd] border-3 border-[#daa520] rounded-2xl px-4 py-3 placeholder-[#8b7355]/50 text-[#5d4e37] focus:outline-none focus:ring-2 focus:ring-[#3cb371]"
            placeholder="例: スタバ代ほしい..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
          />
        </div>

        {/* Submit Button */}
        <button
          onClick={handleUpload}
          disabled={!file || !selectedTopic || isUploading}
          className={`w-full py-4 rounded-2xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all border-4
            ${!file || !selectedTopic
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed border-gray-400'
              : 'bg-gradient-to-b from-[#3cb371] to-[#2e8b57] text-white border-[#1a5c36] hover:scale-[1.02] active:scale-95'
            }
          `}
        >
          {isUploading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              アップロード中...
            </>
          ) : (
            <>
              <span className="text-xl">🔔</span>
              {selectedTopic ? `「${selectedTopic.title}」に投稿する` : 'お題を選んでね'}
            </>
          )}
        </button>

        <p className="text-xs text-center text-[#5d4e37]/70 bg-[#fffacd]/50 rounded-xl p-3">
          ※ 投稿はお題終了時に自動的に削除されます。<br />
          ※ 18歳未満の利用は禁止されています。
        </p>
      </div>
    </div>
  )
}
