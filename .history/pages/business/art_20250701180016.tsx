// pages/business/art.tsx
import React, { useState } from 'react'
import Link from 'next/link'
import WalletPanel from '@/components/WalletPanel'
import { QRCodeSVG as QRCode } from 'qrcode.react'
import { GoogleMap, useLoadScript, Marker } from '@react-google-maps/api'
import { useRouter } from 'next/router'

const famAwardsDemo = [
  {
    id: '1',
    title: 'Best New Artist',
    media: '/awards/artist1.jpg',
    winner: 'Jane D.',
    video: '',
  },
  {
    id: '2',
    title: 'Best Product',
    media: '/awards/product1.jpg',
    winner: 'CanvasX',
    video: '',
  },
  // Add more...
]

const onboardingSteps = [
  'Create Account',
  'Complete Profile',
  'Choose Art Role',
  'Upload Portfolio',
  'Set Up Wallet',
  'Get Verified',
  'Business Options',
]

const liveTicketsDemo = [
  {
    id: 'evt1',
    event: 'Future Fest 2025',
    date: '2025-08-21',
    venue: 'Metro Arena',
    seat: 'GA',
  },
  {
    id: 'evt2',
    event: 'Dobe Launch',
    date: '2025-09-10',
    venue: 'AI Gallery',
    seat: 'B12',
  },
]

const MAP_CENTER = { lat: 37.7749, lng: -122.4194 } // Demo: San Francisco

export default function ArtDepartment() {
  const [onboardIndex, setOnboardIndex] = useState(2) // Demo: user on step 3
  const [showQR, setShowQR] = useState<{ [k: string]: boolean }>({})
  const router = useRouter()

  // --- Google Maps ---
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || '',
  })

  return (
    <div style={{ padding: 28, background: '#191c24', minHeight: '100vh', color: '#fff' }}>
      {/* Main Grid */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 28 }}>
        {/* Left: Onboarding + Business Options */}
        <div style={{ flex: '1 1 340px', minWidth: 340 }}>
          {/* Onboarding Timeline */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 12 }}>Onboarding</div>
            <div style={{ display: 'flex', alignItems: 'center', overflowX: 'auto' }}>
              {onboardingSteps.map((step, i) => (
                <React.Fragment key={step}>
                  <div style={{
                    background: i < onboardIndex ? '#0af' : (i === onboardIndex ? '#fecf2f' : '#444'),
                    color: i < onboardIndex ? '#fff' : '#111',
                    padding: '7px 17px',
                    borderRadius: 20,
                    fontWeight: 600,
                    fontSize: 15,
                    minWidth: 100,
                    textAlign: 'center',
                    marginRight: 4,
                  }}>
                    {step}
                  </div>
                  {i < onboardingSteps.length - 1 && (
                    <div style={{ width: 30, height: 3, background: i < onboardIndex ? '#0af' : '#333', borderRadius: 2 }} />
                  )}
                </React.Fragment>
              ))}
            </div>
            <div style={{ textAlign: 'right', marginTop: 14 }}>
              <button
                style={{
                  padding: '8px 18px', borderRadius: 8, background: '#0af', color: '#fff',
                  fontWeight: 700, fontSize: 16, border: 'none', marginLeft: 8,
                }}
                onClick={() => router.push('/go-public')}
              >
                Business Options
              </button>
            </div>
          </div>

          {/* Artgang Button (was AGX License) */}
          <div style={{ marginBottom: 18 }}>
            <button
              style={{
                padding: '10px 22px', borderRadius: 8, background: '#10b981', color: '#fff',
                fontWeight: 700, fontSize: 16, border: 'none', marginRight: 14
              }}
              onClick={() => router.push('/agx-license')}
            >
              Artgang
            </button>
            <Link href="/contracts" style={{ color: '#0af', fontWeight: 700, fontSize: 16, marginLeft: 8 }}>
              Contracts & Consultation
            </Link>
          </div>

          {/* Google Map Panel */}
          <div style={{ borderRadius: 14, overflow: 'hidden', marginBottom: 28, boxShadow: '0 0 16px #0af2' }}>
            {isLoaded ? (
              <GoogleMap
                mapContainerStyle={{ width: '100%', height: '220px' }}
                center={MAP_CENTER}
                zoom={12}
              >
                <Marker position={MAP_CENTER} />
              </GoogleMap>
            ) : (
              <div style={{ height: 220, background: '#15151b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>Loading map...</div>
            )}
          </div>

          {/* Wallet Panel */}
          <div style={{ marginBottom: 32 }}>
            <WalletPanel />
            <div style={{ fontSize: 14, color: '#0af7', marginTop: 4 }}>Connect your agent wallet/API for payments, royalties, and digital assets.</div>
          </div>
        </div>

        {/* Middle: Fam Awards & Happenings */}
        <div style={{ flex: '1 1 380px', minWidth: 360 }}>
          {/* Fam Awards (Horizontal Scroll) */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 10 }}>FAM Awards</div>
            <div style={{ display: 'flex', gap: 16, overflowX: 'auto' }}>
              {famAwardsDemo.map(a => (
                <div key={a.id} style={{
                  minWidth: 200, background: '#222', borderRadius: 14, padding: 12, boxShadow: '0 2px 16px #0af1'
                }}>
                  <div style={{ fontWeight: 600 }}>{a.title}</div>
                  <img src={a.media} alt={a.title} style={{ width: '100%', borderRadius: 10, margin: '10px 0' }} />
                  <div style={{ fontSize: 13, color: '#fefc' }}>Winner: <b>{a.winner}</b></div>
                  {/* Add video player or image carousel here */}
                </div>
              ))}
            </div>
          </div>

          {/* Happening Now & Upcoming Panel */}
          <div>
            <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 10 }}>Happening Now & Upcoming</div>
            <div style={{ display: 'flex', gap: 16, overflowX: 'auto' }}>
              {liveTicketsDemo.map(t => (
                <div
                  key={t.id}
                  style={{
                    minWidth: 200, background: '#191c24', border: '1px solid #222',
                    borderRadius: 14, padding: 12, cursor: 'pointer'
                  }}
                  onClick={() => setShowQR(prev => ({ ...prev, [t.id]: !prev[t.id] }))}
                >
                  {showQR[t.id] ? (
                    <div>
                      <QRCode value={t.id} size={140} />
                      <div style={{ color: '#ccc', marginTop: 6, fontSize: 13 }}>Tap for details</div>
                    </div>
                  ) : (
                    <div>
                      <div style={{ fontWeight: 600 }}>{t.event}</div>
                      <div style={{ fontSize: 13, color: '#eee' }}>{t.date} · {t.venue}</div>
                      <div style={{ fontSize: 13, color: '#fecf2f', margin: '4px 0' }}>Seat: {t.seat}</div>
                      <div style={{ color: '#ccc', fontSize: 13 }}>Tap to show QR</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Quick Actions, Coming Soon */}
        <div style={{ flex: '1 1 260px', minWidth: 240 }}>
          {/* Quick action panels here */}
          <div style={{
            background: '#292c38', borderRadius: 12, padding: 14, marginBottom: 22,
            fontWeight: 600, textAlign: 'center'
          }}>
            <span>Agent Plug-In API Coming Soon</span>
          </div>
          {/* Manage Account/Settings */}
          <div style={{
            background: '#222', borderRadius: 10, padding: 12, fontSize: 15, marginTop: 24,
            color: '#0af', textAlign: 'center', cursor: 'pointer'
          }}>
            <Link href="/space">Go to My Space</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
