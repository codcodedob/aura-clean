import React, { Suspense, useState } from 'react'
import WalletPanel from '@/components/WalletPanel'
import AGXPanel from '@/components/AGXPanel'
import OnboardingPanel from '@/components/OnboardingPanel'
import Link from 'next/link'

export default function ArtDept() {
  const [onboardingComplete, setOnboardingComplete] = useState(false)

  return (
    <div style={{ padding: 32, minHeight: '100vh', background: '#fafaff' }}>
      <h1 style={{ fontWeight: 800, fontSize: 32, marginBottom: 8 }}>🎨 Art Department</h1>
      <OnboardingPanel onComplete={() => setOnboardingComplete(true)} />
      <AGXPanel />
      <WalletPanel />
      <div style={{ marginTop: 32, display: 'flex', gap: 24 }}>
        <Link href="/contracts"><button>Contracts & Payments</button></Link>
        <Link href="/inbox"><button>Inbox</button></Link>
        <Link href="/agx-license"><button>AGX Worker Dashboard</button></Link>
      </div>
    </div>
  )
}
