// /pages/business/art.tsx
import React, { useState } from 'react';
import Link from 'next/link';
import WalletPanel from '@/components/WalletPanel';

const featuredArtEvents = [
  {
    title: "Hipsession: Art Week 2025",
    image: "/banner-artweek2025.jpg",
    desc: "Live now! Join top creators. Stream, vote, earn.",
    link: "/events/artweek2025"
  },
  {
    title: "Launch: 'NeoNature' NFT Collection",
    image: "/banner-neonature.jpg",
    desc: "New drop by Lumi Genesis. Mint open.",
    link: "/creator/lumi"
  }
];

const companies = [
  {
    name: "Lightspace Studios",
    desc: "AR/VR Art Commissions & Live Launches",
    projects: 9,
    image: "/company-lightspace.png",
    link: "/company/lightspace"
  },
  {
    name: "Pixel Syndicate",
    desc: "Streamed digital art, real-world murals",
    projects: 5,
    image: "/company-pixelsyndicate.png",
    link: "/company/pixelsyndicate"
  }
];

const onboardingSteps = [
  "Create your account",
  "Complete your profile & select your role",
  "Set up AGX/worker tools (if applicable)",
  "Connect your wallet",
  "Launch your first project/coin",
];

export default function ArtPage() {
  // Demo user logic: simulate onboarding or AGX worker status
  const [user, setUser] = useState({ isNew: true, isAGX: false, onboardingStep: 2 });
  const [showOnboard, setShowOnboard] = useState(user.isNew);

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: 24 }}>
      {/* Hipsession Banner */}
      <div style={{ marginBottom: 30 }}>
        <div style={{
          background: "#222",
          color: "#fff",
          borderRadius: 14,
          overflow: "hidden",
          position: "relative",
          height: 220,
          display: "flex",
          alignItems: "center"
        }}>
          <img src={featuredArtEvents[0].image} alt="" style={{ width: 250, height: "100%", objectFit: "cover" }} />
          <div style={{ padding: 32 }}>
            <h1 style={{ fontSize: 32, margin: 0 }}>Hipsession: Latest Art & Creative Launches</h1>
            <p style={{ margin: "18px 0" }}>{featuredArtEvents[0].desc}</p>
            <Link href={featuredArtEvents[0].link}><button style={{ padding: "8px 18px", borderRadius: 8, background: "#0af", color: "#fff", fontWeight: "bold" }}>View Event</button></Link>
          </div>
        </div>
      </div>

      {/* Onboarding Steps Panel */}
      {showOnboard && (
        <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 14px #0af2", padding: 30, marginBottom: 24 }}>
          <h2 style={{ color: "#0af", marginBottom: 12 }}>Getting Started</h2>
          <ol>
            {onboardingSteps.map((step, idx) => (
              <li key={idx} style={{
                marginBottom: 8,
                color: idx === user.onboardingStep ? "#16a34a" : "#555",
                fontWeight: idx === user.onboardingStep ? "bold" : undefined
              }}>
                {step} {idx === user.onboardingStep && <span>⬅️</span>}
              </li>
            ))}
          </ol>
          <button onClick={() => setShowOnboard(false)} style={{ marginTop: 12, background: "#eee", color: "#222", borderRadius: 6, padding: "8px 14px" }}>Hide</button>
        </div>
      )}

      {/* AGX Worker/Delivery Panel */}
      {user.isAGX && (
        <div style={{ background: "#f0f9ff", padding: 22, borderRadius: 10, marginBottom: 20 }}>
          <b>AGX Worker Dashboard</b>
          <p>View your upcoming routes, licenses, and commissions.</p>
          <Link href="/agx-license"><button>AGX Licenses</button></Link>
          <Link href="/agx-dashboard"><button style={{ marginLeft: 12 }}>Worker Panel</button></Link>
        </div>
      )}

      {/* Wallet */}
      <WalletPanel />

      {/* Live Events/Tickets */}
      <section style={{ margin: "32px 0" }}>
        <h2>Happening Now & Upcoming</h2>
        <div style={{ display: "flex", gap: 18 }}>
          {featuredArtEvents.map((evt, i) => (
            <div key={i} style={{ width: 260, background: "#222", color: "#fff", borderRadius: 10, padding: 18 }}>
              <img src={evt.image} alt="" style={{ width: "100%", borderRadius: 7, marginBottom: 8 }} />
              <div style={{ fontWeight: "bold", fontSize: 16 }}>{evt.title}</div>
              <div style={{ fontSize: 14 }}>{evt.desc}</div>
              <Link href={evt.link}><button style={{ marginTop: 7, background: "#0af", color: "#fff", borderRadius: 5, padding: "6px 12px" }}>See Details</button></Link>
            </div>
          ))}
        </div>
      </section>

      {/* LaunchPad */}
      <section style={{ margin: "32px 0" }}>
        <h2>LaunchPad / Go Public</h2>
        <p>Ready to launch your first project, coin, or campaign?</p>
        <Link href="/contracts"><button style={{ padding: "10px 18px", borderRadius: 8, background: "#0af", color: "#fff", fontWeight: "bold" }}>Get Started</button></Link>
      </section>

      {/* Company/Creator Showcase */}
      <section style={{ margin: "36px 0" }}>
        <h2>Showcase: Companies & Creators</h2>
        <div style={{ display: "flex", gap: 22, overflowX: "auto" }}>
          {companies.map((c, i) => (
            <div key={i} style={{ minWidth: 240, background: "#fff", borderRadius: 8, boxShadow: "0 1px 8px #ddd", padding: 15 }}>
              <img src={c.image} alt={c.name} style={{ width: "100%", borderRadius: 7 }} />
              <b style={{ fontSize: 17 }}>{c.name}</b>
              <p style={{ fontSize: 14, color: "#333" }}>{c.desc}</p>
              <div style={{ fontSize: 13, color: "#888" }}>{c.projects} Projects</div>
              <Link href={c.link}><button style={{ marginTop: 8, background: "#0af", color: "#fff", borderRadius: 5, padding: "6px 12px" }}>View</button></Link>
            </div>
          ))}
        </div>
      </section>

      {/* Communications Panel */}
      <section style={{ margin: "32px 0" }}>
        <h2>Inbox & Support</h2>
        <Link href="/inbox"><button style={{ background: "#0af", color: "#fff", borderRadius: 6, padding: "8px 16px" }}>Go to Inbox</button></Link>
      </section>

      {/* Account Management */}
      <section style={{ margin: "32px 0" }}>
        <h2>Account</h2>
        <Link href="/space"><button style={{ background: "#eee", color: "#222", borderRadius: 6, padding: "8px 16px" }}>Manage Account / Go to Space</button></Link>
        <button style={{ marginLeft: 14, background: "#ef4444", color: "#fff", borderRadius: 6, padding: "8px 16px" }}>Delete Account</button>
      </section>
    </div>
  );
}
