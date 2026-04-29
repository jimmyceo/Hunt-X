import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Hunt-X — Autonomous AI Career Agent'
export const size = { width: 1200, height: 630 }

export default async function Image() {
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
          backgroundColor: '#0B0B0F',
          color: '#E8E8ED',
          fontFamily: 'Inter, sans-serif',
          padding: 60,
        }}
      >
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: 16,
            backgroundColor: '#3B82F6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 40,
            fontSize: 40,
            fontWeight: 600,
          }}
        >
          X
        </div>
        <div
          style={{
            fontSize: 72,
            fontWeight: 600,
            letterSpacing: '-2px',
            lineHeight: 1.1,
            marginBottom: 20,
            textAlign: 'center',
          }}
        >
          Hunt-X
        </div>
        <div
          style={{
            fontSize: 32,
            color: '#8A8F98',
            textAlign: 'center',
            maxWidth: 800,
            lineHeight: 1.4,
          }}
        >
          Autonomous AI Career Agent
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            fontSize: 20,
            color: '#5A5E66',
          }}
        >
          hunt-x.app
        </div>
      </div>
    ),
    { ...size }
  )
}
