// /pages/business/art.tsx
import React, { useState } from 'react'
import WalletPanel from '@/components/WalletPanel'
import AGXPanel from '@/components/AGXPanel'
import OnboardingPanel from '@/components/OnboardingPanel'
import Link from 'next/link'

export default function ArtDept() {
  const [onboardingComplete, setOnboardingComplete] = useState(false)
  const [alerts, setAlerts] = useState<string[]>([])

  return (
    <div style={{
      padding: 32,
      minHeight: '100vh',
      background: '#f8fafc',
      fontFamily: 'Inter, Arial, sans-serif'
    }}>
      <h1 style={{ fontWeight: 800, fontSize: 32, marginBottom: 12 }}>🎨 Art Department</h1>
      <p style={{ color: '#475569', marginBottom: 22, fontSize: 17, maxWidth: 650 }}>
        Showcase, launch, and join creative projects with live job tools and earnings. AGX professionals and creators find all tools here.
      </p>
      {/* Onboarding & AGX */}
      <div style={{ marginBottom: 32 }}>
        <OnboardingPanel onComplete={() => setOnboardingComplete(true)} />
      </div>
      <div style={{ marginBottom: 40 }}>
        <AGXPanel />
      </div>
      <div style={{ marginBottom: 24 }}>
        <WalletPanel />
      </div>
      {/* Quick links & support */}
      <div style={{
        display: 'flex',
        gap: 24,
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        <Link href="/contracts"><button style={quickBtnStyle}>Contracts & Payments</button></Link>
        <Link href="/inbox"><button style={quickBtnStyle}>Inbox</button></Link>
        <Link href="/agx-license"><button style={quickBtnStyle}>AGX Worker Dashboard</button></Link>
        <Link href="/"><button style={quickBtnStyle}>Back to Dashboard</button></Link>
      </div>
      <div style={{ marginTop: 38, color: '#64748b' }}>
        <b>HIPSESSION:</b> Latest art & creative launches. <Link href="/magazine"><span style={{ color: "#2563eb" }}>Read Now</span></Link>
      </div>
      {/* Optionally show any live alerts */}
      {alerts.length > 0 && (
        <div style={{
          background: '#fffbe6',
          color: '#f59e42',
          borderRadius: 12,
          padding: 18,
          marginTop: 26
        }}>
          <ul>
            {alerts.map((alert, i) => <li key={i}>{alert}</li>)}
          </ul>
        </div>
      )}
    </div>
  )
}

const quickBtnStyle: React.CSSProperties = {
  background: "#181825",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  padding: "14px 28px",
  fontWeight: 600,
  fontSize: 16,
  cursor: "pointer",
  marginBottom: 6
}
