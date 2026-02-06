import { NextResponse } from 'next/server'

// TikTok ドメイン検証用
export async function GET() {
  return new NextResponse(
    'tiktok-developers-site-verification=5rXfrpbX83SDDSblEJKaH8jlk1U5tVwb',
    {
      headers: {
        'Content-Type': 'text/plain',
      },
    }
  )
}
