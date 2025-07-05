// pages/contracts.tsx
import React, { useState } from 'react'
import { useRouter } from 'next/router'
import IncomeGraph from '@/components/IncomeGraph' // see previous messages
import Link from 'next/link'

const DEMO_CONTRACTS = [
  {
    id: 1,
    type: 'Artist Hosting',
    parties: ['you', 'admin'],
    status: 'pending',
    amount: 0,
    revenueShare: '10%',
    start: '2025-06-01'
  },
  {
    id: 2,
    type: 'Simple App',
    parties: ['you', 'admin'],
    status: 'active',
    amount: 100,
    revenueShare: null,
    start: '2025-04-20'
  }
]

const DEMO_GRAPH = [
  { month: 'Jan', amount: 200 },
  { month: 'Feb', amount: 1200 },
  { month: 'Mar', amount: 980 },
  { month: 'Apr', amount: 700 },
  { month: 'May', amount: 2300 },
  { month: 'Jun', amount: 1400 }
]

const optionHeroStyle: React.CSSProperties = {
  flex: 1,
  minWidth: 330,
  maxWidth: 400,
  background: "#181825",
  color: "#fff",
  borderRadius: 16,
  boxShadow: '0 4px 24px #0af2',
  padding: "32px 24px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  marginBottom: 18
}
const heroBtnStyle: React.CSSProperties = {
  marginTop: 24,
  background: "#0af",
  color: "#000",
  borderRadius: 8,
  padding: '14px 26px',
  fontWeight: 700,
  border: "none",
  fontSize: 18,
  cursor: 'pointer',
  boxShadow: '0 1px 8px #0af4'
}

export default function ContractsPage() {
  const [showCreate, setShowCreate] = useState(false)
  const [createType, setCreateType] = useState('')
  const [contracts, setContracts] = useState(DEMO_CONTRACTS)
  const router = useRouter()

  // --- Inline "Create Contract" logic ---
  const handleStartCreate = (type: string) => {
    setCreateType(type)
    setShowCreate(true)
  }
  const handleCreateContract = (e: React.FormEvent) => {
    e.preventDefault()
    // Demo only: add to local array
    setContracts(prev => [
      ...prev,
      { id: prev.length + 1, type: createType, parties: ['you', 'admin'], status: 'pending', amount: 0, start: '2025-07-01' }
    ])
    setShowCreate(false)
  }

  // --- Layout ---
  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: 32 }}>
      <h1 style={{ fontSize: 36, fontWeight: 900, marginBottom: 10 }}>Contracts & Opportunities</h1>
      <p style={{ color: '#888', marginBottom: 40 }}>
        Manage your deals, create new contracts, and track income and obligations.<br />
        <span style={{ color: '#0af' }}>HIPSESSION latest art and creative launches</span>
      </p>

      {/* Hero Options: Bigger if no contracts */}
      <div style={{
        display: 'flex',
        gap: 32,
        margin: contracts.length ? '24px 0 16px' : '40px 0 40px',
        justifyContent: 'center',
        flexWrap: 'wrap'
      }}>
        <div style={optionHeroStyle}>
          <h2>🚀 Artist Hosting</h2>
          <h3 style={{ color: '#0af' }}>$0 + 10% revenue</h3>
          <ul>
            <li>Professional hosting & promotion</li>
            <li>Royalty & stats dashboard</li>
            <li>Custom tools for listeners</li>
          </ul>
          <button style={heroBtnStyle} onClick={() => handleStartCreate('Artist Hosting')}>Onboard &rarr;</button>
        </div>
        <div style={optionHeroStyle}>
          <h2>🎧 Simple App</h2>
          <h3 style={{ color: '#0af' }}>$100 Flat Fee</h3>
          <ul>
            <li>One-page music app</li>
            <li>Stripe payments built-in</li>
            <li>Instant launch</li>
          </ul>
          <button style={heroBtnStyle} onClick={() => handleStartCreate('Simple App')}>Order App &rarr;</button>
        </div>
        <div style={optionHeroStyle}>
          <h2>🤖 Custom AI Agent App</h2>
          <h3 style={{ color: '#0af' }}>$1,000+ + 10% revenue</h3>
          <ul>
            <li>Complex/feature-rich builds</li>
            <li>Quote/negotiation & queue</li>
            <li>Custom AI onboarding</li>
          </ul>
          <button style={heroBtnStyle} onClick={() => handleStartCreate('Custom AI Agent App')}>Request Quote &rarr;</button>
        </div>
      </div>

      {/* Inline Modal or Panel for Creation */}
      {showCreate && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: '#000b',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            background: "#fff",
            borderRadius: 18,
            minWidth: 340, maxWidth: 420,
            padding: 32,
            boxShadow: '0 8px 48px #0004'
          }}>
            <h2 style={{ marginBottom: 14 }}>Create Contract: {createType}</h2>
            <form onSubmit={handleCreateContract}>
              <label style={{ display: 'block', marginBottom: 10 }}>
                Project Title
                <input type="text" required style={{ width: '100%', marginTop: 6, marginBottom: 14, padding: 10, borderRadius: 6, border: '1px solid #bbb' }} />
              </label>
              <label style={{ display: 'block', marginBottom: 10 }}>
                Details/Goals
                <textarea required rows={3} style={{ width: '100%', marginTop: 6, marginBottom: 14, padding: 10, borderRadius: 6, border: '1px solid #bbb' }} />
              </label>
              {createType === 'Custom AI Agent App' && (
                <label style={{ display: 'block', marginBottom: 10 }}>
                  What features do you need?
                  <input type="text" placeholder="E.g. Chat, music, scheduling, voice, payments..." required style={{ width: '100%', marginTop: 6, marginBottom: 14, padding: 10, borderRadius: 6, border: '1px solid #bbb' }} />
                </label>
              )}
              <button type="submit" style={{
                background: "#0af", color: "#000", borderRadius: 8,
                padding: '10px 20px', fontWeight: 700, border: "none", fontSize: 18, cursor: 'pointer', marginTop: 10
              }}>
                Submit
              </button>
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                style={{
                  background: "transparent", color: "#0af", border: "none",
                  fontSize: 16, marginLeft: 18, cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Income Line Graph */}
      <div style={{ margin: '36px 0 30px' }}>
        <IncomeGraph data={DEMO_GRAPH} />
      </div>

      {/* Contracts Table/List */}
      <h2 style={{ margin: '40px 0 12px' }}>Your Contracts</h2>
      <div style={{
        background: '#191929', borderRadius: 16, color: '#fff', padding: 20, minHeight: 100,
        boxShadow: '0 2px 20px #0af1', fontSize: 18
      }}>
        {contracts.length === 0 && (
          <div style={{ padding: 16, color: '#aaa', textAlign: 'center' }}>
            No contracts yet. Use the onboarding options above to get started!
          </div>
        )}
        {contracts.length > 0 && (
          <table style={{ width: '100%', background: 'transparent', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ color: '#0af', fontWeight: 700, fontSize: 16 }}>
                <th align="left" style={{ padding: 8 }}>Type</th>
                <th>Parties</th>
                <th>Status</th>
                <th>Revenue</th>
                <th>Start</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {contracts.map((c, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #222' }}>
                  <td style={{ padding: 8 }}>{c.type}</td>
                  <td style={{ textAlign: 'center' }}>{c.parties.join(', ')}</td>
                  <td style={{ textAlign: 'center' }}>{c.status}</td>
                  <td style={{ textAlign: 'center' }}>{c.revenueShare || (c.amount ? `$${c.amount}` : '-')}</td>
                  <td style={{ textAlign: 'center' }}>{c.start}</td>
                  <td>
                    <Link href={`/contracts/${c.id}`}>
                      <button style={{
                        background: '#0af',
                        color: '#000',
                        borderRadius: 6,
                        padding: '6px 16px',
                        fontWeight: 600,
                        fontSize: 15,
                        border: "none",
                        cursor: 'pointer'
                      }}>
                        View
                      </button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
