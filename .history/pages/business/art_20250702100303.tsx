// Final horizontal onboarding with magnetic animated rail behind circles

import React, { useState } from 'react'
import dynamic from 'next/dynamic'
import WalletPanel from '@/components/WalletPanel'
import MotionSection from '@/components/MotionSection'
import MotionCard from '@/components/MotionCard'
import { useRouter } from 'next/router'
import { QRCodeSVG as QRCode } from 'qrcode.react'
import { motion } from 'framer-motion'
import { FaBusinessTime, FaWallet, FaList, FaMoneyBill, FaRocket, FaUserShield, FaHeartbeat, FaBrain, FaBalanceScale, FaClock } from 'react-icons/fa'

const GoogleMapReact = dynamic(() => import('google-map-react'), { ssr: false })

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
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)
  const router = useRouter()

  const renderFlow = (flow, activeIndex, setActiveIndex, isBusiness = false) => (
    <div style={{ position: 'relative', marginBottom: 24, padding: '0 20px' }}>
      <motion.div
        initial={{ scaleX: 0.9, opacity: 0.2 }}
        animate={{ scaleX: 1, opacity: 0.4 }}
        whileHover={{ opacity: 0.6 }}
        transition={{ duration: 0.4, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          top: 18,
          left: 0,
          right: 0,
          height: 4,
          background: '#444',
          transformOrigin: 'center'
        }}
      />
      <div style={{ display: 'flex', justifyContent: 'center', gap: 32, position: 'relative', zIndex: 2 }}>
        {flow.map((step, i) => (
          <MotionCard key={step.label} title="">
            <div
              onMouseEnter={() => setHoverIndex(i)}
              onMouseLeave={() => setHoverIndex(null)}
              onClick={() => {
                if (isBusiness && step.label === 'Go to Artgang Panel') router.push('/agx-license')
                else setActiveIndex(i)
              }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: i <= activeIndex ? 'pointer' : 'default',
                opacity: i > activeIndex ? 0.35 : 1,
                transition: 'all 0.2s ease-in-out'
              }}
            >
              <motion.div
                whileHover={{ scale: 1.15, boxShadow: '0 0 20px #fff2' }}
                transition={{ type: 'spring', stiffness: 300 }}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: i < activeIndex ? '#21f373' : i === activeIndex ? '#fecf2f' : '#333',
                  color: '#111',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 18,
                  marginBottom: 6,
                }}
              >
                {step.icon}
              </motion.div>
              <div style={{ fontSize: 12, fontWeight: 600, textAlign: 'center', maxWidth: 90 }}>{step.label}</div>
            </div>
          </MotionCard>
        ))}
      </div>
    </div>
  )

  return (
    <div style={{ padding: 0, background: '#000000', minHeight: '100vh', color: '#fff', position: 'relative' }}>
      <MotionSection>
        <div style={{ height: '20vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {renderFlow(businessFlow, onboardBusiness, setOnboardBusiness, true)}
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
