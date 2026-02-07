import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  // The `/auth/callback` route is required for the server-side auth flow to work properly.
  // The Code Exchange that happens here exchanges an auth code for the user's session,
  // which is set as a cookie for future requests made to Supabase
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      console.error('Auth callback error:', error.message, error)
    }
    if (!error) {
      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'

      // ユーザー情報を取得
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // X (Twitter) 連携の場合、ユーザー名をDBに保存
        const identities = user.identities || []
        const twitterIdentity = identities.find(i => i.provider === 'twitter')

        if (twitterIdentity) {
          const xUsername = twitterIdentity.identity_data?.user_name ||
                           twitterIdentity.identity_data?.preferred_username ||
                           null
          const xAvatarUrl = twitterIdentity.identity_data?.avatar_url || null

          if (xUsername) {
            await supabase
              .from('users')
              .update({
                x_username: xUsername,
                x_avatar_url: xAvatarUrl,
                is_sns_verified: true,
                auth_provider: 'x',
              })
              .eq('id', user.id)
          }
        }

        // 18+確認が済んでいるかチェック
        const { data: profile } = await supabase
          .from('users')
          .select('is_verified_adult')
          .eq('id', user.id)
          .single()

        // 年齢確認が済んでいない場合は /verify-age へリダイレクト
        if (!profile?.is_verified_adult) {
          const redirectUrl = isLocalEnv
            ? `${origin}/verify-age`
            : forwardedHost
              ? `https://${forwardedHost}/verify-age`
              : `${origin}/verify-age`
          return NextResponse.redirect(redirectUrl)
        }
      }

      if (isLocalEnv) {
        // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
