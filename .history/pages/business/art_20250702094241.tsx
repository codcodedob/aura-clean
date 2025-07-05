// Final horizontal single-line onboarding with circular checkpoints and Motion integration

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

  const renderFlow = (flow, activeIndex, setActiveIndex, isBusiness = false) => (
    <div style={{ display: 'flex', justifyContent: 'center', gap: 20, padding: '12px 16px' }}>
      {flow.map((step, i) => (
        <MotionCard key={step.label} title="">
          <div
            onClick={() => {
              if (isBusiness && step.label === 'Go to Artgang Panel') router.push('/agx-license')
              else setActiveIndex(i)
            }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: i <= activeIndex ? 'pointer' : 'default',
              opacity: i > activeIndex ? 0.4 : 1,
              transition: 'all 0.2s ease-in-out'
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: i < activeIndex ? '#21f373' : i === activeIndex ? '#fecf2f' : '#333',
                color: '#111',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 16,
                boxShadow: i === activeIndex ? '0 0 12px #fecf2faa' : '',
                marginBottom: 6
              }}
            >
              {step.icon}
            </div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                textAlign: 'center',
                maxWidth: 90,
                lineHeight: 1.3
              }}
            >
              {step.label}
            </div>
          </div>
        </MotionCard>
      ))}
    </div>
  )

  return (
    <div style={{ padding: 0, background: '#000000', minHeight: '100vh', color: '#fff', position: 'relative' }}>
      <MotionSection>
        <div style={{ height: '18vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {renderFlow(businessFlow, onboardBusiness, setOnboardBusiness, true)}
          <div style={{ height: 1, background: '#444', width: '90%', margin: '6px auto' }} />
          {renderFlow(arcSessionFlow, onboardArc, setOnboardArc)}
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
    </div>
  )
}