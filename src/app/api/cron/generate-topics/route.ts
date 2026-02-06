import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// お題テンプレート（時間帯別）
const TOPIC_TEMPLATES = [
  { hour: 0, title: '深夜のひとりごと' },
  { hour: 1, title: '眠れない夜に' },
  { hour: 2, title: '真夜中の告白' },
  { hour: 3, title: '夜更かしの理由' },
  { hour: 4, title: '早起きさんへ' },
  { hour: 5, title: '朝焼けの空' },
  { hour: 6, title: '目覚めの一枚' },
  { hour: 7, title: '朝の一杯' },
  { hour: 8, title: '通勤・通学風景' },
  { hour: 9, title: '今日のデスク周り' },
  { hour: 10, title: '午前のおやつ' },
  { hour: 11, title: 'お昼ごはん' },
  { hour: 12, title: '午後のひととき' },
  { hour: 13, title: '推しグッズ自慢' },
  { hour: 14, title: '散歩で見つけたもの' },
  { hour: 15, title: '今日のおやつ' },
  { hour: 16, title: '夕焼けの空' },
  { hour: 17, title: '晩ごはん' },
  { hour: 18, title: '今日の推し活' },
  { hour: 19, title: '夜のリラックスタイム' },
  { hour: 20, title: '今日のベストショット' },
  { hour: 21, title: '寝る前の一枚' },
  { hour: 22, title: '深夜のお供' },
  { hour: 23, title: '今日のありがとう' },
]

export async function GET(request: Request) {
  // Security Check: Verify Cron Secret
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  const supabase = await createClient()

  try {
    // 日本時間で今日の日付を取得
    const now = new Date()
    const jstOffset = 9 * 60 * 60 * 1000 // UTC+9
    const jstNow = new Date(now.getTime() + jstOffset)
    const todayJST = new Date(jstNow.getFullYear(), jstNow.getMonth(), jstNow.getDate())

    // 今日のお題がすでに存在するか確認
    const todayStart = new Date(todayJST.getTime() - jstOffset) // UTC に戻す
    const tomorrowStart = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000)

    const { data: existingTopics } = await supabase
      .from('hourly_topics')
      .select('id')
      .gte('starts_at', todayStart.toISOString())
      .lt('starts_at', tomorrowStart.toISOString())
      .limit(1)

    if (existingTopics && existingTopics.length > 0) {
      return NextResponse.json({
        message: 'Topics for today already exist',
        skipped: true
      })
    }

    // 24時間分のお題を生成
    const topicsToInsert = TOPIC_TEMPLATES.map(template => {
      const startsAt = new Date(todayStart.getTime() + template.hour * 60 * 60 * 1000)
      const endsAt = new Date(startsAt.getTime() + 60 * 60 * 1000) // 1時間後

      return {
        title: template.title,
        starts_at: startsAt.toISOString(),
        ends_at: endsAt.toISOString(),
        is_active: true
      }
    })

    const { error: insertError } = await supabase
      .from('hourly_topics')
      .insert(topicsToInsert)

    if (insertError) throw insertError

    return NextResponse.json({
      message: 'Topics generated successfully',
      count: topicsToInsert.length,
      date: todayJST.toISOString().split('T')[0]
    })

  } catch (error: any) {
    console.error('Generate Topics Error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
