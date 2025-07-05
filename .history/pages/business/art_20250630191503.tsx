// pages/business/art.tsx
import React from 'react'
import WalletPanel from '@/components/WalletPanel'
import Link from 'next/link'
import '@/styles/styles.css'

const famAwardsDemo = [
  {
    id: 1,
    title: 'Best New Artist',
    image: '/demo/best-new-artist.jpg',
    video: '', // Can use video url if available
    winner: 'Nova Soundz'
  },
  {
    id: 2,
    title: 'Best Product',
    image: '/demo/best-product.jpg',
    video: '',
    winner: 'Aether Canvas'
  }
]

export default function ArtPage() {
  return (
    <div className="art-page">
      <header className="art-header">
        <h1 className="art-title">Art Department</h1>
        <div className="art-desc">
          AGX Onboarding · Creator Tools · Wallet · Live Tickets · FAM Awards
        </div>
      </header>

      {/* Onboarding Timeline */}
      <section className="art-onboard-timeline">
        <h3>Onboarding</h3>
        <div className="onboarding-timeline-bar">
          {/* Example timeline: add your timeline logic here */}
          <div className="timeline-step completed">Sign Up</div>
          <div className="timeline-step active">Complete Profile</div>
          <div className="timeline-step">Go Public</div>
        </div>
      </section>

      {/* AGX Delivery/Worker Panel */}
      <section className="agx-panel">
        <h3>AGX Worker Panel</h3>
        <Link href="/agx-license" className="agx-license-btn">
          Manage AGX License &amp; Job Codes
        </Link>
      </section>

      {/* Wallet/Finance */}
      <section>
        <WalletPanel />
      </section>

      {/* Tickets (demo) */}
      <section className="art-tickets">
        <h3>Live Tickets & Events</h3>
        {/* Replace this with a list from activity table */}
        <div className="ticket-card">
          <div>🎟️ <b>VIP Entry – AuraFest 2025</b></div>
          <div>Sat, July 10, 2025 — Section 101, Seat 7B</div>
          <div>QR code here (add your QR widget)</div>
        </div>
      </section>

      {/* FAM Awards Panel */}
      <section className="fam-awards">
        <h3>FAM Awards</h3>
        <div className="fam-awards-list">
          {famAwardsDemo.map(award => (
            <div key={award.id} className="fam-award-card">
              {award.image && <img src={award.image} alt={award.title} className="fam-award-img" />}
              <div>
                <div className="fam-award-title">{award.title}</div>
                <div className="fam-award-winner">🏆 {award.winner}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
