import React, { useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
// You can use dynamic import for QRCode if SSR fails: 
const QRCode = dynamic(() => import('qrcode.react'), { ssr: false });
import WalletPanel from '@/components/WalletPanel';

// Sample activity state, in prod this is loaded from Supabase.
const onboardingSteps = [
  "Sign up & profile",
  "Select your role",
  "Set up AGX tools",
  "Connect wallet",
  "Launch or join Artgang"
];

// Sample user activities (in prod, query from Supabase)
const userActivity = {
  completed: [0, 1],
  inProgress: 2 // index of current step
};

const tickets = [
  {
    id: 'abc123',
    event: 'NeoNature Gallery Opening',
    date: 'July 12, 2025',
    qrValue: 'TICKET-abc123',
    status: 'active'
  },
  {
    id: 'def456',
    event: 'Live AR Art Battle',
    date: 'Aug 2, 2025',
    qrValue: 'TICKET-def456',
    status: 'upcoming'
  }
];

const famAwards = [
  {
    category: "Best New Artist",
    winner: "Lumi Genesis",
    image: "/fam/lumi-genesis.jpg",
    videoUrl: "https://youtube.com/embed/fam-award1"
  },
  {
    category: "Innovation - Modern",
    winner: "Pixel Syndicate",
    image: "/fam/pixel-syndicate.jpg",
    videoUrl: "https://youtube.com/embed/fam-award2"
  }
  // etc.
];

export default function ArtPage() {
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);

  // Onboarding horizontal timeline (focuses one state at a time)
  const renderOnboarding = () => (
    <div style={{ margin: "32px 0", overflowX: "auto" }}>
      <div style={{ display: "flex", alignItems: "center" }}>
        {onboardingSteps.map((step, idx) => (
          <div key={idx} style={{
            flex: "0 0 200px",
            textAlign: "center",
            opacity: idx < userActivity.inProgress ? 0.5 : 1,
            borderBottom: idx === userActivity.inProgress ? "4px solid #0af" : "2px solid #ddd"
          }}>
            <div style={{
              margin: "0 auto",
              width: 40, height: 40,
              borderRadius: 20,
              background: idx === userActivity.inProgress ? "#0af" : "#ddd",
              color: idx === userActivity.inProgress ? "#fff" : "#222",
              lineHeight: "40px",
              fontWeight: "bold",
              marginBottom: 8
            }}>
              {idx + 1}
            </div>
            <div style={{ fontWeight: idx === userActivity.inProgress ? "bold" : undefined }}>
              {step}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // FAM Awards panel as horizontal carousel
  const renderFamAwards = () => (
    <section style={{ margin: "38px 0" }}>
      <h2 style={{ marginBottom: 10 }}>FAM Awards — Best in Art</h2>
      <div style={{ display: "flex", overflowX: "auto", gap: 32 }}>
        {famAwards.map((award, i) => (
          <div key={i} style={{
            minWidth: 300, background: "#fff", borderRadius: 12, boxShadow: "0 2px 12px #0af2", padding: 16
          }}>
            <div style={{ fontWeight: "bold", marginBottom: 7 }}>{award.category}</div>
            <div style={{ color: "#16a34a", marginBottom: 3 }}>Winner: {award.winner}</div>
            {award.videoUrl ? (
              <iframe width="250" height="140" src={award.videoUrl} frameBorder={0} allow="autoplay; encrypted-media" allowFullScreen style={{ borderRadius: 7 }}></iframe>
            ) : (
              <img src={award.image} style={{ width: 250, height: 140, objectFit: "cover", borderRadius: 7 }} />
            )}
          </div>
        ))}
      </div>
    </section>
  );

  // Tickets panel with QR code enlarge
  const renderTickets = () => (
    <section style={{ margin: "38px 0" }}>
      <h2>Your Art Event Tickets</h2>
      <div style={{ display: "flex", gap: 24 }}>
        {tickets.map(ticket => (
          <div key={ticket.id} style={{
            minWidth: 220, background: "#f6f9fa", borderRadius: 10, padding: 18, position: "relative"
          }}>
            <b>{ticket.event}</b>
            <div>{ticket.date}</div>
            <div>Status: {ticket.status}</div>
            <div
              style={{ margin: "16px 0", cursor: "pointer" }}
              onClick={() => setSelectedTicket(ticket.id)}
              title="Click to enlarge QR"
            >
              <QRCode value={ticket.qrValue} size={64} />
            </div>
            {selectedTicket === ticket.id && (
              <div style={{
                position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
                background: "rgba(0,0,0,0.7)", display: "flex",
                alignItems: "center", justifyContent: "center", zIndex: 99
              }} onClick={() => setSelectedTicket(null)}>
                <QRCode value={ticket.qrValue} size={280} />
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: 24 }}>
      {/* FAM Awards (Hero) */}
      <div style={{
        background: "#181825", color: "#fff", borderRadius: 16,
        padding: "36px 32px 18px 32px", marginBottom: 24, boxShadow: "0 2px 20px #0af4"
      }}>
        <h1 style={{ fontSize: 36, margin: 0 }}>FAM Awards</h1>
        <p style={{ fontSize: 20, marginTop: 8 }}>Celebrating the best in art, innovation, and creators across Future, Archive, and Modern categories.</p>
      </div>

      {/* Onboarding Progress (horizontal timeline) */}
      {renderOnboarding()}

      {/* AGX/Worker Panel or Wallet */}
      {/* <AGXPanel />  If AGX logic needed */}
      <WalletPanel walletAgent={null} /> {/* Pluggable for agent/widget */}

      {/* Tickets (Purchased/Upcoming) */}
      {renderTickets()}

      {/* FAM Awards Carousel */}
      {renderFamAwards()}

      {/* Launchpad */}
      <section style={{ margin: "38px 0" }}>
        <h2>Artgang — Launch or Go Public</h2>
        <p>Ready to launch your art project, coin, or join Artgang?</p>
        <Link href="/contracts"><button style={{ padding: "14px 30px", borderRadius: 10, background: "#0af", color: "#fff", fontWeight: "bold", fontSize: 20 }}>Artgang</button></Link>
      </section>

      {/* Communications & Account */}
      <section style={{ margin: "32px 0" }}>
        <h2>Inbox & Support</h2>
        <Link href="/inbox"><button style={{ background: "#0af", color: "#fff", borderRadius: 6, padding: "8px 16px" }}>Go to Inbox</button></Link>
      </section>
      <section style={{ margin: "32px 0" }}>
        <h2>Account</h2>
        <Link href="/space"><button style={{ background: "#eee", color: "#222", borderRadius: 6, padding: "8px 16px" }}>Manage Account / Go to Space</button></Link>
      </section>
    </div>
  );
}
