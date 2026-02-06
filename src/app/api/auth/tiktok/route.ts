import { NextRequest, NextResponse } from 'next/server'

// TikTok OAuth 認可URLへリダイレクト（2024-02 update）
export async function GET(request: NextRequest) {
  const clientKey = process.env.TIKTOK_CLIENT_KEY

  // デバッグ: 環境変数の確認
  console.log('TIKTOK_CLIENT_KEY exists:', !!clientKey)
  const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin}/api/auth/tiktok/callback`

  if (!clientKey) {
    // デバッグ: 全環境変数のキー一覧（値は表示しない）
    const envKeys = Object.keys(process.env).filter(k => k.includes('TIKTOK')).join(', ')
    return NextResponse.json({
      error: 'TIKTOK_CLIENT_KEY is not configured',
      debug: `Available TIKTOK keys: ${envKeys || 'none'}`,
      nodeEnv: process.env.NODE_ENV
    }, { status: 500 })
  }

  // state パラメータ（CSRF対策）
  const state = Math.random().toString(36).substring(2, 15)

  // TikTok の認可URL（Login Kit v2）
  const authUrl = new URL('https://www.tiktok.com/v2/auth/authorize/')
  authUrl.searchParams.set('client_key', clientKey)
  authUrl.searchParams.set('response_type', 'code')
  authUrl.searchParams.set('scope', 'user.info.basic')
  authUrl.searchParams.set('redirect_uri', redirectUri)
  authUrl.searchParams.set('state', state)

  // state を Cookie に保存（コールバックで検証用）
  const response = NextResponse.redirect(authUrl.toString())
  response.cookies.set('tiktok_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 10, // 10分
  })

  return response
}
