import { NextRequest, NextResponse } from 'next/server'

// Google Cloud Vision API でNSFWチェック
export async function POST(request: NextRequest) {
  try {
    const { imageBase64 } = await request.json()

    if (!imageBase64) {
      return NextResponse.json({ error: '画像が必要です' }, { status: 400 })
    }

    const apiKey = process.env.GOOGLE_CLOUD_VISION_KEY

    if (!apiKey) {
      // APIキーが設定されていない場合はスキップ（開発用）
      console.warn('GOOGLE_CLOUD_VISION_KEY is not set, skipping moderation')
      return NextResponse.json({ safe: true, skipped: true })
    }

    // Vision API呼び出し
    const response = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requests: [
            {
              image: { content: imageBase64 },
              features: [{ type: 'SAFE_SEARCH_DETECTION' }],
            },
          ],
        }),
      }
    )

    if (!response.ok) {
      console.error('Vision API error:', await response.text())
      // APIエラー時は通す（サービス停止を避けるため）
      return NextResponse.json({ safe: true, error: 'API error' })
    }

    const data = await response.json()
    const safeSearch = data.responses?.[0]?.safeSearchAnnotation

    if (!safeSearch) {
      return NextResponse.json({ safe: true, error: 'No result' })
    }

    // LIKELY または VERY_LIKELY の場合はブロック
    const blockLevels = ['LIKELY', 'VERY_LIKELY']
    const isUnsafe =
      blockLevels.includes(safeSearch.adult) ||
      blockLevels.includes(safeSearch.violence) ||
      blockLevels.includes(safeSearch.racy)

    return NextResponse.json({
      safe: !isUnsafe,
      details: {
        adult: safeSearch.adult,
        violence: safeSearch.violence,
        racy: safeSearch.racy,
        medical: safeSearch.medical,
        spoof: safeSearch.spoof,
      },
    })
  } catch (error: any) {
    console.error('Moderation error:', error)
    // エラー時は通す（サービス停止を避けるため）
    return NextResponse.json({ safe: true, error: error.message })
  }
}
