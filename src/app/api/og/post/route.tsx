import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const hearts = searchParams.get('hearts') || '0'
  const name = searchParams.get('name') || 'ゲスト'
  const rank = searchParams.get('rank') || ''
  const caption = searchParams.get('caption') || ''

  const rankEmoji = rank === '1' ? '👑' : rank === '2' ? '🥈' : rank === '3' ? '🥉' : ''
  const rankText = rank ? `${rankEmoji} ${rank}位` : ''

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(180deg, #87ceeb 0%, #98d8c8 40%, #7cb342 100%)',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Card */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#fffacd',
            borderRadius: '40px',
            border: '8px solid #daa520',
            padding: '40px 60px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            maxWidth: '1000px',
          }}
        >
          {/* App Name */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '20px',
            }}
          >
            <span style={{ fontSize: '28px', color: '#3cb371', fontWeight: 'bold' }}>
              推しポチ❤️
            </span>
          </div>

          {/* Heart Count - Hero */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              marginBottom: '16px',
            }}
          >
            <span style={{ fontSize: '80px' }}>❤️</span>
            <span
              style={{
                fontSize: '120px',
                fontWeight: 'bold',
                color: '#ff4567',
                lineHeight: 1,
              }}
            >
              {hearts}
            </span>
          </div>

          {/* User Name */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: '36px',
              color: '#5d4e37',
              fontWeight: 'bold',
            }}
          >
            <span>{name}</span>
            {rankText && (
              <span
                style={{
                  background: rank === '1' ? '#ffd700' : rank === '2' ? '#c0c0c0' : rank === '3' ? '#cd7f32' : '#3cb371',
                  color: rank === '3' ? '#fff' : '#5d4e37',
                  padding: '4px 16px',
                  borderRadius: '20px',
                  fontSize: '28px',
                }}
              >
                {rankText}
              </span>
            )}
          </div>

          {/* Caption */}
          {caption && (
            <div
              style={{
                marginTop: '16px',
                fontSize: '24px',
                color: '#8b7355',
              }}
            >
              {caption}
            </div>
          )}

          {/* CTA */}
          <div
            style={{
              marginTop: '24px',
              background: 'linear-gradient(180deg, #3cb371, #2e8b57)',
              color: 'white',
              padding: '12px 40px',
              borderRadius: '20px',
              fontSize: '22px',
              fontWeight: 'bold',
              border: '4px solid #1a5c36',
            }}
          >
            あなたも推しポチしよう！
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  )
}
