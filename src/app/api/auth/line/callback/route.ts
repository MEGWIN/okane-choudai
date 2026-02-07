import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  // エラーチェック
  if (error) {
    console.error('LINE OAuth error:', error)
    return NextResponse.redirect(`${origin}/login?error=line_auth_failed`)
  }

  // state 検証（CSRF対策）
  const savedState = request.cookies.get('line_oauth_state')?.value
  if (!state || state !== savedState) {
    return NextResponse.redirect(`${origin}/login?error=invalid_state`)
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=no_code`)
  }

  const clientId = process.env.LINE_CLIENT_ID
  const clientSecret = process.env.LINE_CLIENT_SECRET
  const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL || origin}/api/auth/line/callback`

  try {
    // 1. アクセストークンを取得
    const tokenResponse = await fetch('https://api.line.me/oauth2/v2.1/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: clientId!,
        client_secret: clientSecret!,
      }),
    })

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text()
      console.error('LINE token error:', errorData)
      return NextResponse.redirect(`${origin}/login?error=token_failed`)
    }

    const tokenData = await tokenResponse.json()
    const accessToken = tokenData.access_token

    // 2. プロフィール情報を取得
    const profileResponse = await fetch('https://api.line.me/v2/profile', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    if (!profileResponse.ok) {
      return NextResponse.redirect(`${origin}/login?error=profile_failed`)
    }

    const profile = await profileResponse.json()
    // profile: { userId, displayName, pictureUrl, statusMessage }

    // 3. Supabase でユーザーを作成または取得
    const supabase = await createClient()

    // LINE の userId をメールアドレスとパスワードの代わりに使用
    const fakeEmail = `line_${profile.userId}@line.local`
    const password = `line_auth_${profile.userId}_secret_key`

    // まずサインインを試みる（既存ユーザー）
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: fakeEmail,
      password,
    })

    if (signInData?.user) {
      // 既存ユーザー: プロフィール更新
      await supabase.from('users').upsert({
        id: signInData.user.id,
        display_name: profile.displayName,
        avatar_url: profile.pictureUrl,
        auth_provider: 'line',
        line_user_id: profile.userId,
        is_sns_verified: true,
      })

      // 年齢確認チェック
      const { data: userProfile } = await supabase
        .from('users')
        .select('is_verified_adult')
        .eq('id', signInData.user.id)
        .single()

      const redirectPath = userProfile?.is_verified_adult ? '/' : '/verify-age'
      const response = NextResponse.redirect(`${origin}${redirectPath}`)
      response.cookies.delete('line_oauth_state')
      return response
    }

    // 新規ユーザー: Supabase Auth に登録
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: fakeEmail,
      password,
      options: {
        data: {
          display_name: profile.displayName,
          avatar_url: profile.pictureUrl,
          auth_provider: 'line',
        },
      },
    })

    if (signUpError || !authData.user) {
      console.error('Supabase signup error:', signUpError?.message, signUpError)
      return NextResponse.redirect(`${origin}/login?error=signup_failed`)
    }

    // users テーブルに追加情報を保存
    await supabase.from('users').upsert({
      id: authData.user.id,
      display_name: profile.displayName,
      avatar_url: profile.pictureUrl,
      auth_provider: 'line',
      line_user_id: profile.userId,
      is_sns_verified: true,
    })

    // 年齢確認ページへリダイレクト
    const response = NextResponse.redirect(`${origin}/verify-age`)
    response.cookies.delete('line_oauth_state')
    return response
  } catch (err: any) {
    console.error('LINE callback error:', err)
    return NextResponse.redirect(`${origin}/login?error=callback_failed`)
  }
}
