import { NextRequest, NextResponse } from 'next/server'

// TikTok ドメイン検証用のファイルを提供
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params

  // TikTok検証ファイル
  if (filename === 'tiktok5rXfrpbX83SDDSblEJKaH8jlk1U5tVwb.txt') {
    return new NextResponse(
      'tiktok-developers-site-verification=5rXfrpbX83SDDSblEJKaH8jlk1U5tVwb',
      {
        headers: {
          'Content-Type': 'text/plain',
        },
      }
    )
  }

  return NextResponse.json({ error: 'Not found' }, { status: 404 })
}
