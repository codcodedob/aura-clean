// Updated art.tsx with dual onboarding flows, full-screen map, directions fallback, times schedule panel, stacked IdeaFlight buttons, and refined layout

import React, { useState } from 'react'
import dynamic from 'next/dynamic'
import WalletPanel from '@/components/WalletPanel'
import MotionSection from '@/components/MotionSection'
import MotionCard from '@/components/MotionCard'
import { useRouter } from 'next/router'
import { QRCodeSVG as QRCode } from 'qrcode.react'

const GoogleMapReact = dynamic(() => import('google-map-react'), { ssr: false })

const famAwardsDemo = [
  { id: '1', title: 'Best New Artist', media: '/awards/artist1.jpg', winner: 'Jane D.' },
  { id: '2', title: 'Best Product', media: '/awards/product1.jpg', winner: 'CanvasX' },
]

const liveTicketsDemo = [
  { id: 'evt1', event: 'Future Fest 2025', date: '2025-08-21', venue: 'Metro Arena', seat: 'GA' },
  { id: 'evt2', event: 'Dobe Launch', date: '2025-09-10', venue: 'AI Gallery', seat: 'B12' },
]

const businessFlow = [ 'Register Business', 'Setup Wallet', 'List Services', 'Accept Payments', 'Launch' ]
const arcSessionFlow = [ 'Identity', 'Diet & Wellness', 'Purpose', 'Ethics', 'Time Practices', 'KYC Verified' ]

export default function ArtDepartment() {
  const [onboardBusiness, setOnboardBusiness] = useState(1)
  const [onboardArc, setOnboardArc] = useState(2)
  const [mapVisible, setMapVisible] = useState(true)
  const [showQR, setShowQR] = useState<{ [k: string]: boolean }>({})
  const router = useRouter()

  return (
    <div style={{ padding: 0, background: '#000000', minHeight: '100vh', color: '#fff', position: 'relative' }}>
      {/* Dual Onboarding Flows */}
      <MotionSection>
        <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 24, width: '100%' }}>
          {/* Business Onboarding */}
          <div>
            {businessFlow.map((step, i) => (
              <MotionCard key={step} title={step}>
                <div
                  style={{
                    background: i < onboardBusiness ? '#21f373' : (i === onboardBusiness ? '#fecf2f' : '#444'),
                    color: '#000',
                    padding: '10px 24px',
                    borderRadius: 18,
                    fontWeight: 700,
                    fontSize: 16,
                    marginBottom: 8,
                    cursor: i === onboardBusiness ? 'pointer' : 'default'
                  }}
                  onClick={() => setOnboardBusiness(i)}
                >
                  {step}
                </div>
              </MotionCard>
            ))}
          </div>

          {/* ArcSession Onboarding */}
          <div>
            {arcSessionFlow.map((step, i) => (
              <MotionCard key={step} title={step}>
                <div
                  style={{
                    background: i < onboardArc ? '#21f373' : (i === onboardArc ? '#fecf2f' : '#444'),
                    color: '#000',
                    padding: '10px 24px',
                    borderRadius: 18,
                    fontWeight: 700,
                    fontSize: 16,
                    marginBottom: 8,
                    cursor: i === onboardArc ? 'pointer' : 'default'
                  }}
                  onClick={() => setOnboardArc(i)}
                >
                  {step}
                </div>
              </MotionCard>
            ))}
            <button
              onClick={() => router.push('/agx-license')}
              style={{ marginTop: 14, background: '#21f373', color: '#111', fontWeight: 700, border: 'none', padding: '10px 20px', borderRadius: 10 }}
            >
              Artgang Panel
            </button>
          </div>
        </div>
      </MotionSection>

      {/* Directions or Map */}
      {mapVisible ? (
        <div style={{ width: '100%', height: '50vh' }}>
          <GoogleMapReact
            bootstrapURLKeys={{ key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY! }}
            defaultCenter={{ lat: 40.7128, lng: -74.0060 }}
            defaultZoom={12}
          >
            <div lat={40.7128} lng={-74.0060} style={{ fontSize: 36 }}>🎨</div>
          </GoogleMapReact>
        </div>
      ) : (
        <div style={{ width: '100%', padding: 24, background: '#111', color: '#0af', textAlign: 'center' }}>
          <h2>Directions Mode</h2>
          <p>“Turn right on Creative Ave., continue to Opportunity Blvd...”</p>
        </div>
      )}

      {/* 3-Column Layout */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 28, padding: '0 28px' }}>
        {/* Left Column */}
        <div style={{ flex: '1 1 300px', minWidth: 280 }}>
          <button
            onClick={() => setMapVisible(!mapVisible)}
            style={{ background: '#21f373', color: '#111', padding: '10px 20px', borderRadius: 10, marginBottom: 16 }}
          >
            {mapVisible ? 'Hide Map' : 'Show Map'}
          </button>

          <div style={{ marginBottom: 18, background: '#111', padding: 16, borderRadius: 12 }}>
            <h3>Times Table</h3>
            <p>(Coming soon…)</p>
          </div>

          <button
            style={{ background: '#fecf2f', color: '#111', padding: '10px 20px', borderRadius: 10, fontWeight: 700, marginBottom: 20 }}
          >
            Make Time
          </button>

          <WalletPanel />
        </div>

        {/* Middle Column */}
        <div style={{ flex: '1 1 360px', minWidth: 320 }}>
          <MotionSection>
            <h2>FAM Awards</h2>
            <div style={{ display: 'flex', overflowX: 'auto', gap: 16 }}>
              {famAwardsDemo.map(a => (
                <MotionCard key={a.id} title={a.title}>
                  <img src={a.media} alt={a.title} style={{ width: '100%', borderRadius: 10 }} />
                  <div style={{ fontSize: 13, color: '#fefc' }}>Winner: <b>{a.winner}</b></div>
                </MotionCard>
              ))}
            </div>
          </MotionSection>

          <MotionSection>
            <h2>Happening Now</h2>
            <div style={{ display: 'flex', overflowX: 'auto', gap: 16 }}>
              {liveTicketsDemo.map(t => (
                <MotionCard key={t.id} title={t.event}>
                  {showQR[t.id] ? (
                    <QRCode value={t.id} size={120} />
                  ) : (
                    <div onClick={() => setShowQR(prev => ({ ...prev, [t.id]: !prev[t.id] }))}>
                      <p>{t.date} · {t.venue}</p>
                      <p>Seat: {t.seat}</p>
                      <p style={{ color: '#ccc' }}>Tap to show QR</p>
                    </div>
                  )}
                </MotionCard>
              ))}
            </div>
          </MotionSection>
        </div>

        {/* Right Column */}
        <div style={{ flex: '1 1 240px', minWidth: 220 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
            <button style={{ padding: '10px 24px', borderRadius: 8, background: '#21f373', color: '#111', fontWeight: 700, border: 'none' }}>
              Create IdeaFlight
            </button>
            <button style={{ padding: '10px 24px', borderRadius: 8, background: '#141e30', color: '#21f373', fontWeight: 700, border: 'none' }}>
              Go to Space
            </button>
          </div>

          <MotionCard title="IdeaFlight">
            <p>Share, launch, and discover creative projects in the IdeaFlight ecosystem.</p>
          </MotionCard>
        </div>
      </div>
    </div>
  )
}
