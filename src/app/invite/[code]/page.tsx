import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ code: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params
  const supabase = await createClient()

  const { data: inviter } = await supabase
    .from('users')
    .select('display_name')
    .eq('referral_code', code)
    .single()

  const name = inviter?.display_name || 'ゲスト'

  return {
    title: `${name}さんからの招待 | 推しポチ❤️`,
    description: `${name}さんの招待で登録すると、ボーナスハート❤5個もらえます！`,
    openGraph: {
      title: `${name}さんからの招待 | 推しポチ❤️`,
      description: `招待で登録してボーナスハート❤5個ゲット！`,
    },
  }
}

export default async function InvitePage({ params }: Props) {
  const { code } = await params
  const supabase = await createClient()

  const { data: inviter } = await supabase
    .from('users')
    .select('display_name, avatar_url')
    .eq('referral_code', code)
    .single()

  if (!inviter) {
    notFound()
  }

  return (
    <div className="flex flex-col items-center gap-6 py-8">
      {/* Invite Card */}
      <div className="ac-card bg-[#fffacd]/95 p-8 text-center w-full max-w-sm">
        <div className="text-5xl mb-4">💌</div>
        <h1 className="text-2xl font-bold text-[#5d4e37] mb-2">
          {inviter.display_name || 'ゲスト'}さんからの招待
        </h1>
        <p className="text-[#8b7355] mb-6">
          登録すると、あなたと{inviter.display_name || 'ゲスト'}さんの<br />
          両方に<span className="text-[#ff4567] font-bold">ボーナスハート❤5個</span>プレゼント！
        </p>

        {/* Bonus Preview */}
        <div className="flex justify-center gap-4 mb-6">
          <div className="bg-white rounded-2xl p-4 border-2 border-[#daa520] flex-1">
            <p className="text-xs text-[#8b7355] font-bold mb-1">あなた</p>
            <p className="text-2xl font-bold text-[#ff4567]">❤ +5</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border-2 border-[#daa520] flex-1">
            <p className="text-xs text-[#8b7355] font-bold mb-1">{inviter.display_name || 'ゲスト'}さん</p>
            <p className="text-2xl font-bold text-[#ff4567]">❤ +5</p>
          </div>
        </div>

        <Link
          href={`/login?ref=${code}`}
          className="block w-full py-4 bg-gradient-to-b from-[#3cb371] to-[#2e8b57] text-white font-bold text-lg rounded-2xl border-4 border-[#1a5c36] shadow-lg hover:scale-[1.02] active:scale-95 transition-all"
        >
          登録してハートをもらう
        </Link>

        <p className="text-xs text-[#8b7355] mt-4">
          既にアカウントをお持ちの方は<Link href="/login" className="underline text-[#3cb371]">ログイン</Link>
        </p>
      </div>
    </div>
  )
}
