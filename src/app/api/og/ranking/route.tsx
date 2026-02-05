import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const topic = searchParams.get('topic') || '推しポチ❤️ ランキング'
  const top1 = searchParams.get('top1') || ''
  const hearts1 = searchParams.get('hearts1') || ''
  const top2 = searchParams.get('top2') || ''
  const hearts2 = searchParams.get('hearts2') || ''
  const top3 = searchParams.get('top3') || ''
  const hearts3 = searchParams.get('hearts3') || ''

  const podium = [
    { name: top1, hearts: hearts1, emoji: '👑', bg: '#ffd700', size: '180px' },
    { name: top2, hearts: hearts2, emoji: '🥈', bg: '#c0c0c0', size: '140px' },
    { name: top3, hearts: hearts3, emoji: '🥉', bg: '#cd7f32', size: '120px' },
  ].filter(p => p.name)

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
            background: '#fffacd',
            borderRadius: '40px',
            border: '8px solid #daa520',
            padding: '40px 50px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            width: '1060px',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
            <span style={{ fontSize: '36px' }}>🏆</span>
            <span style={{ fontSize: '40px', fontWeight: 'bold', color: '#5d4e37' }}>
              ランキング
            </span>
          </div>

          {/* Topic */}
          <div
            style={{
              background: '#3cb371',
              color: 'white',
              padding: '8px 32px',
              borderRadius: '20px',
              fontSize: '28px',
              fontWeight: 'bold',
              marginBottom: '32px',
              border: '4px solid #2e8b57',
            }}
          >
            {topic}
          </div>

          {/* Podium */}
          {podium.length > 0 ? (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '24px' }}>
              {podium.map((p, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <span style={{ fontSize: '48px' }}>{p.emoji}</span>
                  <div
                    style={{
                      background: p.bg,
                      width: p.size,
                      height: p.size,
                      borderRadius: '24px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '4px solid #5d4e37',
                    }}
                  >
                    <span style={{ fontSize: '32px', fontWeight: 'bold', color: '#5d4e37' }}>
                      ❤{p.hearts}
                    </span>
                  </div>
                  <span style={{ fontSize: '22px', fontWeight: 'bold', color: '#5d4e37', maxWidth: p.size, textAlign: 'center' }}>
                    {p.name}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: '32px', color: '#8b7355' }}>
              投票受付中！
            </div>
          )}

          {/* CTA */}
          <div
            style={{
              marginTop: '28px',
              fontSize: '22px',
              color: '#3cb371',
              fontWeight: 'bold',
            }}
          >
            推しポチ❤️ oshipochi.com
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
