// Final horizontal compact onboarding with dual stacked layout and icon support

import React, { useState } from 'react'
import dynamic from 'next/dynamic'
import WalletPanel from '@/components/WalletPanel'
import MotionSection from '@/components/MotionSection'
import MotionCard from '@/components/MotionCard'
import { useRouter } from 'next/router'
import { QRCodeSVG as QRCode } from 'qrcode.react'
import { FaBusinessTime, FaWallet, FaList, FaMoneyBill, FaRocket, FaUserShield, FaHeartbeat, FaBrain, FaBalanceScale, FaClock } from 'react-icons/fa'

const GoogleMapReact = dynamic(() => import('google-map-react'), { ssr: false })

const famAwardsDemo = [
  { id: '1', title: 'Best New Artist', media: '/awards/artist1.jpg', winner: 'Jane D.' },
  { id: '2', title: 'Best Product', media: '/awards/product1.jpg', winner: 'CanvasX' },
]

const liveTicketsDemo = [
  { id: 'evt1', event: 'Future Fest 2025', date: '2025-08-21', venue: 'Metro Arena', seat: 'GA' },
  { id: 'evt2', event: 'Dobe Launch', date: '2025-09-10', venue: 'AI Gallery', seat: 'B12' },
]

const businessFlow = [
  { label: 'Register Business', icon: <FaBusinessTime /> },
  { label: 'Setup Wallet', icon: <FaWallet /> },
  { label: 'List Services', icon: <FaList /> },
  { label: 'Accept Payments', icon: <FaMoneyBill /> },
  { label: 'Launch', icon: <FaRocket /> },
  { label: 'Go to Artgang Panel', icon: <FaUserShield /> }
]

const arcSessionFlow = [
  { label: 'Identity', icon: <FaUserShield /> },
  { label: 'Diet & Wellness', icon: <FaHeartbeat /> },
  { label: 'Purpose', icon: <FaBrain /> },
  { label: 'Ethics', icon: <FaBalanceScale /> },
  { label: 'Time Practices', icon: <FaClock /> },
  { label: 'KYC Verified', icon: <FaUserShield /> }
]

export default function ArtDepartment() {
  const [onboardBusiness, setOnboardBusiness] = useState(1)
  const [onboardArc, setOnboardArc] = useState(2)
  const [mapVisible, setMapVisible] = useState(true)
  const [showQR, setShowQR] = useState<{ [k: string]: boolean }>({})
  const router = useRouter()

  return (
    <div style={{ padding: 0, background: '#000000', minHeight: '100vh', color: '#fff', position: 'relative' }}>
      <div style={{ height: '20vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <MotionSection>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '8px 16px', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 6, flexWrap: 'wrap' }}>
              {businessFlow.map((step, i) => (
                <MotionCard key={step.label} title="">
                  <div
                    style={{
                      background: i < onboardBusiness ? '#21f373' : (i === onboardBusiness ? '#fecf2f' : '#222'),
                      color: '#000',
                      padding: '4px 10px',
                      borderRadius: 16,
                      fontWeight: 600,
                      fontSize: 12,
                      minWidth: 120,
                      textAlign: 'center',
                      cursor: i <= onboardBusiness ? 'pointer' : 'default',
                    }}
                    onClick={() => {
                      if (step.label === 'Go to Artgang Panel') router.push('/agx-license')
                      else setOnboardBusiness(i)
                    }}
                  >
                    <div style={{ fontSize: 18 }}>{step.icon}</div>
                    {step.label}
                  </div>
                </MotionCard>
              ))}
            </div>

            <div style={{ height: 1, background: '#444', width: '90%', margin: '0 auto' }} />

            <div style={{ display: 'flex', justifyContent: 'center', gap: 6, flexWrap: 'wrap' }}>
              {arcSessionFlow.map((step, i) => (
                <MotionCard key={step.label} title="">
                  <div
                    style={{
                      background: i < onboardArc ? '#21f373' : (i === onboardArc ? '#fecf2f' : '#222'),
                      color: '#000',
                      padding: '4px 10px',
                      borderRadius: 16,
                      fontWeight: 600,
                      fontSize: 12,
                      minWidth: 120,
                      textAlign: 'center',
                      cursor: i <= onboardArc ? 'pointer' : 'default',
                    }}
                    onClick={() => setOnboardArc(i)}
                  >
                    <div style={{ fontSize: 18 }}>{step.icon}</div>
                    {step.label}
                  </div>
                </MotionCard>
              ))}
            </div>
          </div>
        </MotionSection>
      </div>

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
    </div>
  )
}
