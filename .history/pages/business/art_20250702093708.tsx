// Final horizontal compact onboarding with improved layout

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

const businessFlow = [ 'Register Business', 'Setup Wallet', 'List Services', 'Accept Payments', 'Launch', 'Go to Artgang Panel' ]
const arcSessionFlow = [ 'Identity', 'Diet & Wellness', 'Purpose', 'Ethics', 'Time Practices', 'KYC Verified' ]

export default function ArtDepartment() {
  const [onboardBusiness, setOnboardBusiness] = useState(1)
  const [onboardArc, setOnboardArc] = useState(2)
  const [mapVisible, setMapVisible] = useState(true)
  const [showQR, setShowQR] = useState<{ [k: string]: boolean }>({})
  const router = useRouter()

  return (
    <div style={{ padding: 0, background: '#000000', minHeight: '100vh', color: '#fff', position: 'relative' }}>
      {/* Combined Onboarding Row */}
      <MotionSection>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '12px 16px', maxWidth: '100vw' }}>
          {/* Business */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
            {businessFlow.map((step, i) => (
              <MotionCard key={step} title="">
                <div
                  style={{
                    background: i < onboardBusiness ? '#21f373' : (i === onboardBusiness ? '#fecf2f' : '#222'),
                    color: '#000',
                    padding: '4px 14px',
                    borderRadius: 16,
                    fontWeight: 600,
                    fontSize: 13,
                    minWidth: 120,
                    textAlign: 'center',
                    cursor: i <= onboardBusiness ? 'pointer' : 'default',
                  }}
                  onClick={() => {
                    if (step === 'Go to Artgang Panel') router.push('/agx-license')
                    else setOnboardBusiness(i)
                  }}
                >
                  {step}
                </div>
              </MotionCard>
            ))}
          </div>

          {/* ArcSession */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
            {arcSessionFlow.map((step, i) => (
              <MotionCard key={step} title="">
                <div
                  style={{
                    background: i < onboardArc ? '#21f373' : (i === onboardArc ? '#fecf2f' : '#222'),
                    color: '#000',
                    padding: '4px 14px',
                    borderRadius: 16,
                    fontWeight: 600,
                    fontSize: 13,
                    minWidth: 120,
                    textAlign: 'center',
                    cursor: i <= onboardArc ? 'pointer' : 'default',
                  }}
                  onClick={() => setOnboardArc(i)}
                >
                  {step}
                </div>
              </MotionCard>
            ))}
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

      {/* The rest of the page layout continues unchanged... */}
    </div>
  )
}
