import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  // エラーチェック
  if (error) {
    console.error('TikTok OAuth error:', error)
    return NextResponse.redirect(`${origin}/login?error=tiktok_auth_failed`)
  }

  // state 検証（CSRF対策）
  const savedState = request.cookies.get('tiktok_oauth_state')?.value
  if (!state || state !== savedState) {
    return NextResponse.redirect(`${origin}/login?error=invalid_state`)
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=no_code`)
  }

  const clientKey = process.env.TIKTOK_CLIENT_KEY
  const clientSecret = process.env.TIKTOK_CLIENT_SECRET
  const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL || origin}/api/auth/tiktok/callback`

  try {
    // 1. アクセストークンを取得
    const tokenResponse = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_key: clientKey!,
        client_secret: clientSecret!,
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }),
    })

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text()
      console.error('TikTok token error:', errorData)
      return NextResponse.redirect(`${origin}/login?error=token_failed`)
    }

    const tokenData = await tokenResponse.json()
    const accessToken = tokenData.access_token
    const openId = tokenData.open_id

    // 2. ユーザー情報を取得
    const userResponse = await fetch(
      'https://open.tiktokapis.com/v2/user/info/?fields=open_id,union_id,avatar_url,display_name,username',
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    )

    if (!userResponse.ok) {
      return NextResponse.redirect(`${origin}/login?error=profile_failed`)
    }

    const userData = await userResponse.json()
    const user = userData.data?.user || {}
    // user: { open_id, union_id, avatar_url, display_name, username }

    // 3. Supabase でユーザーを作成または取得
    const supabase = await createClient()

    const fakeEmail = `tiktok_${openId}@tiktok.local`
    const displayName = user.display_name || user.username || 'TikTokユーザー'
    const avatarUrl = user.avatar_url || null
    const username = user.username || null

    // 既存ユーザーを検索
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('tiktok_username', username)
      .single()

    if (existingUser) {
      // 既存ユーザー
      const response = NextResponse.redirect(`${origin}/auth/tiktok-complete?userId=${existingUser.id}`)
      response.cookies.delete('tiktok_oauth_state')
      return response
    } else {
      // 新規ユーザー
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: fakeEmail,
        password: `tiktok_${openId}_${Date.now()}`,
        options: {
          data: {
            display_name: displayName,
            avatar_url: avatarUrl,
            auth_provider: 'tiktok',
          },
        },
      })

      if (signUpError || !authData.user) {
        console.error('Supabase signup error:', signUpError)
        return NextResponse.redirect(`${origin}/login?error=signup_failed`)
      }

      // users テーブルに追加情報を保存
      await supabase.from('users').upsert({
        id: authData.user.id,
        display_name: displayName,
        avatar_url: avatarUrl,
        auth_provider: 'tiktok',
        tiktok_username: username,
        tiktok_avatar_url: avatarUrl,
        is_sns_verified: true, // TikTokログインは自動的にSNS認証済み
      })

      // 年齢確認ページへリダイレクト
      const response = NextResponse.redirect(`${origin}/verify-age`)
      response.cookies.delete('tiktok_oauth_state')
      return response
    }
  } catch (err: any) {
    console.error('TikTok callback error:', err)
    return NextResponse.redirect(`${origin}/login?error=callback_failed`)
  }
}
