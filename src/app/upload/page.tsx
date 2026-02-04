'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Camera, Loader2, X } from 'lucide-react'
import Image from 'next/image'

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [caption, setCaption] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const supabase = createClient()

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

  const handleUpload = async () => {
    if (!file) return

    setIsUploading(true)
    try {
      // 1. Check User (Todo: Handle Auth)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        alert('ログインが必要です（まだ実装されていません）')
        setIsUploading(false)
        return
      }

      // 2. Upload Image
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('posts')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      // 3. Insert Post Record
      const { error: dbError } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          image_url: fileName,
          caption: caption,
          expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour from now
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

  return (
    <div className="flex flex-col gap-6">
      {/* Header - Animal Crossing Style */}
      <div className="ac-card bg-[#fffacd]/95 p-4">
        <h1 className="text-xl font-bold text-[#5d4e37] flex items-center gap-2">
          <span className="text-2xl">📸</span>
          写真を投稿して<br />お金をお願いする
        </h1>
      </div>

      <div className="space-y-4">
        {/* Image Dropzone - Animal Crossing Style */}
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

        {/* Caption Input - Animal Crossing Style */}
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

        {/* Submit Button - Animal Crossing Style */}
        <button
          onClick={handleUpload}
          disabled={!file || isUploading}
          className={`w-full py-4 rounded-2xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all border-4
            ${!file
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
              お金ちょうだい！
            </>
          )}
        </button>

        <p className="text-xs text-center text-[#5d4e37]/70 bg-[#fffacd]/50 rounded-xl p-3">
          ※ 投稿は1時間後に自動的に削除されます。<br />
          ※ 18歳未満の利用は禁止されています。
        </p>
      </div>
    </div>
  )
}
