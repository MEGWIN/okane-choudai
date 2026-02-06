import { NextRequest, NextResponse } from 'next/server'

// TikTok OAuth 認可URLへリダイレクト
export async function GET(request: NextRequest) {
  const clientKey = process.env.TIKTOK_CLIENT_KEY
  const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin}/api/auth/tiktok/callback`

  if (!clientKey) {
    return NextResponse.json({ error: 'TIKTOK_CLIENT_KEY is not configured' }, { status: 500 })
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
