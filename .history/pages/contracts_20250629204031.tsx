import React, { useState, useEffect } from 'react'
// import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'

type User = {
  id: string
  username: string
  email: string
  agxId?: string
}

type Contract = {
  id: string
  parties: User[] // all users in contract
  title: string
  type: 'artist' | 'campaign' | 'pro_app' | 'custom'
  amount: number
  revenueShare?: number
  statusByParty: { [userId: string]: 'new' | 'viewed' | 'agreed' | 'counter' }
  created_at: string
  updated_at: string
}

const MOCK_USER: User = {
  id: 'u-123',
  username: 'demo_user',
  email: 'demo@email.com',
  agxId: 'AGX-555'
}

// DEMO CONTRACT DATA (replace w/ supabase or firebase fetch)
const MOCK_CONTRACTS: Contract[] = [
  {
    id: '1',
    parties: [
      { id: 'u-123', username: 'demo_user', email: 'demo@email.com', agxId: 'AGX-555' },
      { id: 'u-456', username: 'label_admin', email: 'label@email.com', agxId: 'AGX-666' }
    ],
    title: 'Artist Partner Hosting - Album: Summer Vibes',
    type: 'artist',
    amount: 100,
    statusByParty: {
      'u-123': 'agreed',
      'u-456': 'viewed'
    },
    created_at: '2025-06-30T12:00:00Z',
    updated_at: '2025-06-30T12:01:00Z'
  },
  {
    id: '2',
    parties: [
      { id: 'u-123', username: 'demo_user', email: 'demo@email.com', agxId: 'AGX-555' },
      { id: 'u-789', username: 'dev_admin', email: 'dev@email.com', agxId: 'AGX-999' }
    ],
    title: 'Pro App Build (AI Agent Music App)',
    type: 'pro_app',
    amount: 1000,
    revenueShare: 0.1,
    statusByParty: {
      'u-123': 'viewed',
      'u-789': 'new'
    },
    created_at: '2025-06-29T09:00:00Z',
    updated_at: '2025-06-29T09:02:00Z'
  }
]

const statusEmoji = {
  'new': '📨',
  'viewed': '👀',
  'agreed': '🤝',
  'counter': '🔁'
} as const

export default function ContractsPage() {
  // (TODO: Replace with Supabase fetch, auth etc)
  const [user] = useState<User>(MOCK_USER)
  const [contracts, setContracts] = useState<Contract[]>(MOCK_CONTRACTS)

  // Optionally: fetch contracts where user is a party, setContracts(...)

  // For demonstration: create contract dialog/modal state
  const [showNewContract, setShowNewContract] = useState(false)

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: "0 auto", color: "#111" }}>
      <h2 style={{ marginBottom: 18, color: "#0af" }}>Your Contracts</h2>
      {/* Quick contract create: */}
      <div style={{ marginBottom: 28, display: "flex", gap: 12 }}>
        <button style={quickBtnStyle} onClick={() => setShowNewContract(true)}>
          Artist Partner / Hosting
        </button>
        <button style={quickBtnStyle} onClick={() => setShowNewContract(true)}>
          Campaign / Marketing
        </button>
        <button style={quickBtnStyle} onClick={() => setShowNewContract(true)}>
          Pro/Custom AI App
        </button>
      </div>

      {/* Contract Table */}
      <table style={{ width: "100%", background: "#f8fafc", borderRadius: 8 }}>
        <thead>
          <tr style={{ background: "#dde6f7" }}>
            <th>Contract</th>
            <th>Type</th>
            <th>Amount</th>
            <th>Revenue %</th>
            <th>Parties</th>
            <th>Status</th>
            <th>Last Updated</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {contracts.map(c => (
            <tr key={c.id}>
              <td>
                <Link href={`/contracts/${c.id}`}>
                  <span style={{ color: "#0af", cursor: "pointer" }}>{c.title}</span>
                </Link>
              </td>
              <td>{c.type}</td>
              <td>${c.amount}</td>
              <td>{c.revenueShare ? `${(c.revenueShare * 100).toFixed(1)}%` : '-'}</td>
              <td>
                {c.parties.map(p =>
                  <span key={p.id} style={{ marginRight: 8 }}>
                    {p.username} {p.agxId && <span style={{ color: "#666", fontSize: 12 }}>({p.agxId})</span>}
                  </span>
                )}
              </td>
              <td>
                {c.parties.map(p => (
                  <span key={p.id} title={p.username}>
                    {statusEmoji[c.statusByParty[p.id] || 'new']}
                  </span>
                ))}
              </td>
              <td>{(new Date(c.updated_at)).toLocaleString()}</td>
              <td>
                <Link href={`/contracts/${c.id}`} style={{ color: "#0af" }}>View</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Simple create contract modal (demo): */}
      {showNewContract && (
        <div style={{
          position: "fixed", left: 0, top: 0, width: "100vw", height: "100vh",
          background: "rgba(0,0,0,0.38)", display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <div style={{ background: "#fff", borderRadius: 10, padding: 32, width: 480, boxShadow: "0 4px 20px #0af4" }}>
            <h3>Start New Contract (DEMO)</h3>
            {/* ... contract create fields, search users, invite, details, AI suggestion... */}
            <button onClick={() => setShowNewContract(false)} style={{ marginTop: 20 }}>Close</button>
          </div>
        </div>
      )}
    </div>
  )
}

const quickBtnStyle: React.CSSProperties = {
  background: "#fff",
  border: "2px solid #0af",
  color: "#0af",
  padding: "10px 18px",
  borderRadius: 8,
  fontWeight: 700,
  cursor: "pointer"
}
