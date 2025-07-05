import React, { useState } from 'react';
import Link from 'next/link';

const heroOptions = [
  {
    key: 'artist-hosting',
    title: '🎤 Artist Hosting & Coin',
    price: 'No/Low Upfront • Investable Coin • Optional Dividends',
    desc: "Get your own coin, sell creations, monetize your brand. Suitable for musicians, streamers, content creators, etc.",
    action: "Get Started",
    onClick: () => { window.location.href = "/create-coin"; },
  },
  {
    key: 'simple-app',
    title: '🖥️ Simple App Site',
    price: '$500 - $1000 Flat Fee',
    desc: "Launch a personal branded site. Product sales, payments, and more. Low cost, simple setup.",
    action: "Request Simple App",
    onClick: () => { window.location.href = "/contracts/app-quote"; },
  },
  {
    key: 'pro-custom',
    title: '🚀 Pro/Custom App & Quote',
    price: '$1000+ & 10% Revenue Share',
    desc: "Premium custom app, full market entry, complex features, and partnership. Get a quote and negotiate.",
    action: "Request Custom Quote",
    onClick: () => { window.location.href = "/contracts/quote"; },
  },
];

const demoContracts = [
  { id: 1, title: "Artist Hosting Agreement", status: "Agreed", counterpart: "admin", amount: "$0" },
  { id: 2, title: "App Creation Deal", status: "Negotiation", counterpart: "devteam", amount: "$1,200" },
  { id: 3, title: "Sponsorship Collab", status: "Pending", counterpart: "brandX", amount: "$400" },
];

export default function ContractsPage() {
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div style={{
      padding: '32px 0',
      background: '#f8fafc',
      minHeight: '100vh',
    }}>
      <div style={{ maxWidth: 1024, margin: '0 auto' }}>
        <h1 style={{ fontSize: 36, fontWeight: 800, letterSpacing: -2 }}>Contracts & Onboarding</h1>
        <p style={{ color: '#555', marginBottom: 32 }}>
          Choose your onboarding path, manage agreements, or create a custom contract.
        </p>

        {/* HERO ONBOARDING OPTIONS */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 24,
          marginBottom: 40,
          justifyContent: 'center'
        }}>
          {heroOptions.map(opt => (
            <div key={opt.key}
              style={{
                background: '#fff',
                borderRadius: 18,
                boxShadow: '0 6px 40px #3331',
                padding: '32px 24px',
                minWidth: 300,
                maxWidth: 340,
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                marginBottom: 0,
                position: 'relative'
              }}>
              <h2 style={{ fontSize: 26, margin: '0 0 12px', fontWeight: 700 }}>{opt.title}</h2>
              <div style={{
                fontSize: 19, fontWeight: 700, color: '#0af', marginBottom: 12
              }}>{opt.price}</div>
              <p style={{ fontSize: 15, margin: '0 0 18px', color: '#444', minHeight: 62 }}>
                {opt.desc}
              </p>
              <button
                onClick={opt.onClick}
                style={{
                  padding: '12px 24px',
                  borderRadius: 10,
                  background: '#0af',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: 16,
                  border: 'none',
                  boxShadow: '0 2px 14px #0af2',
                  cursor: 'pointer'
                }}>
                {opt.action}
              </button>
            </div>
          ))}
        </div>

        {/* CONTRACTS LIST/TABLE */}
        <div style={{
          background: '#fff',
          borderRadius: 14,
          boxShadow: '0 2px 18px #0001',
          padding: 28,
          marginBottom: 32,
        }}>
          <h2 style={{ fontSize: 22, marginBottom: 16, fontWeight: 700 }}>Your Contracts</h2>
          {demoContracts.length === 0 && (
            <div style={{ color: '#999', marginBottom: 18 }}>No contracts yet. Choose an onboarding option or create a custom contract below.</div>
          )}
          <table style={{ width: '100%', borderSpacing: 0 }}>
            <thead>
              <tr style={{ color: '#444', fontWeight: 600 }}>
                <td style={{ padding: 6 }}>Title</td>
                <td style={{ padding: 6 }}>Status</td>
                <td style={{ padding: 6 }}>With</td>
                <td style={{ padding: 6 }}>Amount</td>
                <td style={{ padding: 6 }}>Details</td>
              </tr>
            </thead>
            <tbody>
              {demoContracts.map(contract => (
                <tr key={contract.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: 6 }}>{contract.title}</td>
                  <td style={{ padding: 6 }}>{contract.status}</td>
                  <td style={{ padding: 6 }}>{contract.counterpart}</td>
                  <td style={{ padding: 6 }}>{contract.amount}</td>
                  <td style={{ padding: 6 }}>
                    <Link href={`/contracts/${contract.id}`}>
                      <span style={{ color: '#0af', cursor: 'pointer' }}>View</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* CREATE CONTRACT MODAL */}
        <button
          style={{
            background: '#fff',
            border: '2px solid #0af',
            color: '#0af',
            padding: '16px 24px',
            borderRadius: 12,
            fontWeight: 700,
            fontSize: 18,
            boxShadow: '0 4px 18px #0af2',
            cursor: 'pointer',
            display: 'block',
            margin: '0 auto'
          }}
          onClick={() => setShowCreate(true)}
        >
          + Create Custom Contract
        </button>

        {showCreate && (
          <div style={{
            background: '#111c',
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            zIndex: 9999,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <div style={{
              background: '#fff',
              padding: 32,
              borderRadius: 18,
              minWidth: 350,
              maxWidth: 480
            }}>
              <h2>Create Custom Contract</h2>
              <p>Build your own agreement between two or more parties. This is a blank canvas—add details, parties, and terms as needed. (Demo placeholder form here.)</p>
              <button style={{
                background: '#0af',
                color: '#fff',
                padding: '10px 20px',
                borderRadius: 8,
                fontWeight: 700,
                border: 'none',
                marginTop: 12
              }} onClick={() => setShowCreate(false)}>Close</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
