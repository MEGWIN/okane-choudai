export default function HomeLoading() {
  return (
    <div className="flex flex-col gap-6 animate-pulse">
      {/* TopicBanner skeleton */}
      <div className="ac-card bg-gradient-to-r from-[#3cb371] to-[#2e8b57] px-4 py-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-white/20" />
            <div className="h-5 w-32 rounded bg-white/30" />
          </div>
          <div className="h-7 w-20 rounded-full bg-white/20" />
        </div>
      </div>

      {/* PostCard skeleton */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="h-4 w-16 rounded bg-white/30" />
          <div className="h-4 w-20 rounded bg-white/30" />
        </div>
        <div className="w-full bg-[#fffacd] rounded-3xl overflow-hidden border-4 border-[#daa520]">
          {/* User header（画像の上） */}
          <div className="flex items-center justify-between px-3 py-2.5">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-[#3cb371]/50" />
              <div className="h-6 w-20 rounded-full bg-white/60" />
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-6 w-14 rounded-full bg-white/40" />
              <div className="h-6 w-12 rounded-full bg-white/40" />
            </div>
          </div>
          {/* Image area（正方形） */}
          <div className="aspect-square w-full bg-[#daa520]/20" />
          {/* Bottom buttons（画像の下） */}
          <div className="px-3 pb-3 pt-2.5 flex flex-col gap-2">
            <div className="flex gap-1.5 w-full">
              <div className="flex-1 h-10 rounded-xl bg-white/40" />
              <div className="flex-1 h-10 rounded-xl bg-white/40" />
              <div className="flex-1 h-10 rounded-xl bg-[#3cb371]/30" />
              <div className="flex-1 h-10 rounded-xl bg-white/40" />
            </div>
            <div className="h-9 w-full rounded-xl bg-white/40" />
          </div>
        </div>
        {/* Swipe hint */}
        <div className="flex flex-col items-center mt-4 gap-2">
          <div className="h-6 w-6 rounded bg-white/30" />
          <div className="h-4 w-32 rounded bg-white/30" />
        </div>
      </div>
    </div>
  )
}
