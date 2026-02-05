import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

const BONUS_HEARTS = 5

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: '未ログインです' }, { status: 401 })
  }

  const { referralCode } = await request.json()
  if (!referralCode) {
    return NextResponse.json({ error: '招待コードが必要です' }, { status: 400 })
  }

  // Find inviter by referral code
  const { data: inviter } = await supabase
    .from('users')
    .select('id')
    .eq('referral_code', referralCode)
    .single()

  if (!inviter) {
    return NextResponse.json({ error: '無効な招待コードです' }, { status: 404 })
  }

  // Cannot invite yourself
  if (inviter.id === user.id) {
    return NextResponse.json({ error: '自分自身は招待できません' }, { status: 400 })
  }

  // Check if already referred
  const { data: existing } = await supabase
    .from('referrals')
    .select('id')
    .eq('invitee_id', user.id)
    .single()

  if (existing) {
    return NextResponse.json({ error: '既に招待済みです' }, { status: 409 })
  }

  // Create referral record
  const { error: refError } = await supabase
    .from('referrals')
    .insert({
      inviter_id: inviter.id,
      invitee_id: user.id,
      bonus_given: true,
    })

  if (refError) {
    return NextResponse.json({ error: '招待の処理に失敗しました' }, { status: 500 })
  }

  // Give bonus hearts to both users
  // Update invitee
  await supabase.rpc('increment_bonus_hearts', {
    target_user_id: user.id,
    amount: BONUS_HEARTS,
  }).then(async (res) => {
    // Fallback if RPC doesn't exist: use raw update
    if (res.error) {
      const { data: inviteeProfile } = await supabase
        .from('users')
        .select('bonus_hearts')
        .eq('id', user.id)
        .single()
      await supabase
        .from('users')
        .update({
          bonus_hearts: (inviteeProfile?.bonus_hearts || 0) + BONUS_HEARTS,
          referred_by: inviter.id,
        })
        .eq('id', user.id)
    }
  })

  // Update inviter
  await supabase.rpc('increment_bonus_hearts', {
    target_user_id: inviter.id,
    amount: BONUS_HEARTS,
  }).then(async (res) => {
    if (res.error) {
      const { data: inviterProfile } = await supabase
        .from('users')
        .select('bonus_hearts')
        .eq('id', inviter.id)
        .single()
      await supabase
        .from('users')
        .update({
          bonus_hearts: (inviterProfile?.bonus_hearts || 0) + BONUS_HEARTS,
        })
        .eq('id', inviter.id)
    }
  })

  return NextResponse.json({
    message: `招待ボーナス❤${BONUS_HEARTS}個を受け取りました！`,
    bonus: BONUS_HEARTS,
  })
}
