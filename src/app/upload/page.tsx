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
      <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500">
        写真を投稿して<br />お金をお願いする
      </h1>

      <div className="space-y-4">
        {/* Image Dropzone */}
        <div
          className={`relative w-full aspect-[3/4] rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center overflow-hidden
            ${previewUrl ? 'border-transparent' : 'border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/40'}
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
                className="object-cover"
              />
              <button 
                onClick={(e) => { e.stopPropagation(); clearFile(); }}
                className="absolute top-2 right-2 p-2 bg-black/50 rounded-full text-white hover:bg-black/70"
              >
                <X className="w-5 h-5" />
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-4 text-muted-foreground">
              <div className="p-4 rounded-full bg-white/5">
                <Camera className="w-8 h-8" />
              </div>
              <p className="text-sm">タップして写真を選択</p>
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
          <label className="text-sm text-muted-foreground ml-1">ひとこと (任意)</label>
          <input
            type="text"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="例: スタバ代ほしい..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
          />
        </div>

        {/* Submit Button */}
        <button
          onClick={handleUpload}
          disabled={!file || isUploading}
          className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all
            ${!file 
              ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' 
              : 'bg-gradient-to-r from-pink-600 to-violet-600 text-white hover:shadow-pink-500/25 active:scale-95'
            }
          `}
        >
          {isUploading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              アップロード中...
            </>
          ) : (
            'お金ちょうだい❤'
          )}
        </button>

        <p className="text-xs text-center text-muted-foreground">
          ※ 投稿は1時間後に自動的に削除されます。<br />
          ※ 18歳未満の利用は禁止されています。
        </p>
      </div>
    </div>
  )
}
