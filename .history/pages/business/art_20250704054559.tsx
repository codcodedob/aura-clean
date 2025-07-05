// pages/business/art.tsx
import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import WalletPanel from '@/components/WalletPanel'
import { QRCodeSVG as QRCode } from 'qrcode.react'
import { useRouter } from 'next/router'
import MotionSection from '@/components/MotionSection'
import MotionCard from '@/components/MotionCard'

// Lazy-load Google Maps for SSR
const GoogleMapReact = dynamic(() => import('google-map-react'), { ssr: false })

const onboardingSteps = [
  'Create Account',
  'Complete Profile',
  'Choose Art Role',
  'Upload Portfolio',
  'Set Up Wallet',
  'Get Verified',
  'Go Public (Artgang)',
]

const famAwardsDemo = [
  { id: '1', title: 'Best New Artist', media: '/awards/artist1.jpg', winner: 'Jane D.' },
  { id: '2', title: 'Best Product', media: '/awards/product1.jpg', winner: 'CanvasX' },
]
const liveTicketsDemo = [
  { id: 'evt1', event: 'Future Fest 2025', date: '2025-08-21', venue: 'Metro Arena', seat: 'GA' },
  { id: 'evt2', event: 'Dobe Launch', date: '2025-09-10', venue: 'AI Gallery', seat: 'B12' },
]

export default function ArtDepartment() {
  const [onboardIndex, setOnboardIndex] = useState(2)
  const [showQR, setShowQR] = useState<Record<string, boolean>>({})
  const [mapCenter, setMapCenter] = useState({ lat: 40.7128, lng: -74.0060 })
  const router = useRouter()

  // Optional: fetch real data
  useEffect(() => {
    // fetch user progress, awards, tickets...
  }, [])

  return (
    <div style={{ padding: 0, background: '#191c24', minHeight: '100vh', color: '#fff' }}>

      {/* Onboarding Flow at Top (Slider) */}
      <MotionSection>
        <div style={{ display: 'flex', gap: 24, padding: '38px 0 10px', overflowX: 'auto' }}>
          {onboardingSteps.map((step, i) => (
            <MotionCard key={step} title={step}>
              <div
                onClick={() => setOnboardIndex(i)}
                style={{
                  background: i < onboardIndex ? '#0af' : i === onboardIndex ? '#fecf2f' : '#444',
                  color: i <= onboardIndex ? '#fff' : '#191c24',
                  padding: '8px 22px',
                  borderRadius: 18,
                  fontWeight: 700,
                  fontSize: 17,
                  cursor: 'pointer',
                  boxShadow: i === onboardIndex ? '0 2px 24px #fecf2f88' : '0 2px 8px #0004',
                  transform: i === onboardIndex ? 'scale(1.12)' : 'scale(1)',
                  transition: 'all 0.2s',
                }}
              >
                {step}
              </div>
            </MotionCard>
          ))}
        </div>
      </MotionSection>

      {/* Main Content Grid */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 28, padding: '0 28px' }}>

        {/* LEFT: Go Public / Map / Wallet */}
        <div style={{ flex: '1 1 340px', minWidth: 340 }}>

          <div style={{ marginBottom: 28 }}>
            <button
              onClick={() => router.push('/go-public')}
              style={{
                padding: '12px 26px',
                borderRadius: 10,
                background: '#0af',
                color: '#fff',
                fontWeight: 700,
                fontSize: 18,
                border: 'none',
              }}
            >
              Business Options
            </button>
          </div>

          <div style={{ height: 230, width: '100%', borderRadius: 16, overflow: 'hidden', marginBottom: 22 }}>
            <GoogleMapReact
              bootstrapURLKeys={{ key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY! }}
              defaultCenter={mapCenter}
              defaultZoom={12}
              options={{ styles: [{ featureType: 'all', stylers: [{ saturation: -70 }] }] }}
            >
              <div lat={mapCenter.lat} lng={mapCenter.lng} style={{ fontSize: 36 }}>🎨</div>
            </GoogleMapReact>
          </div>

          <div style={{ marginBottom: 32 }}>
            <WalletPanel />
            <div style={{ fontSize: 14, color: '#0af7', marginTop: 4 }}>
              Connect your agent wallet/API for payments, royalties, and digital assets.
            </div>
          </div>

        </div>

        {/* MIDDLE: FAM Awards & Live Tickets */}
        <div style={{ flex: '1 1 380px', minWidth: 360 }}>

          <MotionSection>
            <h2 style={{ fontWeight: 700, fontSize: 22, marginBottom: 10 }}>FAM Awards</h2>
            <div style={{ display: 'flex', gap: 16, overflowX: 'auto' }}>
              {famAwardsDemo.map(a => (
                <MotionCard key={a.id} title={a.title}>
                  <img src={a.media} alt={a.title} style={{ width: '100%', borderRadius: 10, marginBottom: 6 }} />
                  <div style={{ fontSize: 13, color: '#eee' }}>Winner: <b>{a.winner}</b></div>
                </MotionCard>
              ))}
            </div>
          </MotionSection>

          <MotionSection>
            <h2 style={{ fontWeight: 700, fontSize: 22, marginBottom: 10 }}>Happening Now & Upcoming</h2>
            <div style={{ display: 'flex', gap: 16, overflowX: 'auto' }}>
              {liveTicketsDemo.map(t => (
                <MotionCard key={t.id} title={t.event}>
                  {showQR[t.id] ? (
                    <>
                      <QRCode value={t.id} size={140} />
                      <div style={{ color: '#ccc', marginTop: 6, fontSize: 13 }}>Tap to hide QR</div>
                    </>
                  ) : (
                    <div onClick={() => setShowQR(prev => ({ ...prev, [t.id]: true }))} style={{ cursor: 'pointer' }}>
                      <div style={{ fontSize: 13, color: '#eee' }}>{t.date} · {t.venue}</div>
                      <div style={{ fontSize: 13, color: '#fecf2f', margin: '4px 0' }}>Seat: {t.seat}</div>
                      <div style={{ color: '#ccc', fontSize: 13 }}>Tap to show QR</div>
                    </div>
                  )}
                </MotionCard>
              ))}
            </div>
          </MotionSection>

        </div>

        {/* RIGHT: IdeaFlight Panel */}
        <div style={{ flex: '1 1 260px', minWidth: 240 }}>
          <MotionSection>
            <MotionCard title="IdeaFlight">
              <div style={{ background: '#222', borderRadius: 10, padding: 18, fontWeight: 600, textAlign: 'center', marginBottom: 18 }}>
                Share, launch, and discover creative projects with the IdeaFlight ecosystem.
              </div>
              <button style={{ padding: '10px 24px', borderRadius: 8, background: '#21f373', color: '#111', fontWeight: 700, marginRight: 12 }}>Create Idea Flight</button>
              <button style={{ padding: '10px 24px', borderRadius: 8, background: '#141e30', color: '#21f373', fontWeight: 700 }}>Go to Space</button>
            </MotionCard>
          </MotionSection>
        </div>

      </div>
    </div>
  )
}
