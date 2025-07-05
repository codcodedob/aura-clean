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
