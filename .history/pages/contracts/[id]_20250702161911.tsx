// pages/contracts/[id].tsx

import React, { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'

const MOCK_CONTRACT = {
  id: '1',
  title: 'AI Artist Hosting Deal',
  parties: [
    { id: 'u-111', username: 'donte', status: 'agreed' },
    { id: 'u-123', username: 'demo_user', status: 'viewed' }
  ],
  type: 'artist',
  amount: 100,
  revenueShare: 0.1,
  status: 'negotiation',
  terms: 'Host and promote all music, 10% platform royalty, payout monthly.',
  created_at: '2025-06-30',
  updated_at: '2025-06-30'
}

const statusEmoji = {
  'sent': '📨',
  'viewed': '👀',
  'agreed': '🤝',
  'counter': '🔁',
  'negotiation': '💬'
}

export default function ContractDetailPage() {
  const router = useRouter()
  const { id } = router.query

  // UseState for local (demo)
  const [contract, setContract] = useState(MOCK_CONTRACT)
  const [showEdit, setShowEdit] = useState(false)
  const [counterMode, setCounterMode] = useState(false)
  const [amount, setAmount] = useState(contract.amount)
  const [revenueShare, setRevenueShare] = useState(contract.revenueShare)
  const [terms, setTerms] = useState(contract.terms)

  // Demo: submit counter-offer
  function handleCounterOffer() {
    setContract({
      ...contract,
      amount,
      revenueShare,
      terms,
      status: 'counter'
    })
    setCounterMode(false)
  }

  // Demo: accept
  function handleAccept() {
    setContract({
      ...contract,
      status: 'agreed',
      parties: contract.parties.map(p => ({ ...p, status: 'agreed' }))
    })
  }

  // Demo: Compact contract creation form
  function handleNewContract(e: React.FormEvent) {
    e.preventDefault()
    // Would call API here
    alert('Demo: contract submitted!')
    setShowEdit(false)
  }

  return (
    <div style={{ maxWidth: 600, margin: '40px auto', padding: 24, background: '#fff', borderRadius: 14, boxShadow: '0 2px 16px #2221' }}>
      <h2 style={{ color: '#0af', marginBottom: 12 }}>{contract.title}</h2>
      <div style={{ marginBottom: 14 }}>
        <strong>Parties:</strong>{' '}
        {contract.parties.map(p =>
          <span key={p.id} style={{ marginRight: 12 }}>
            @{p.username} {statusEmoji[p.status as keyof typeof statusEmoji]}
          </span>
        )}
      </div>
      <div style={{ marginBottom: 10 }}>
        <strong>Type:</strong> {contract.type}
      </div>
      <div style={{ marginBottom: 10 }}>
        <strong>Amount:</strong> ${contract.amount}
      </div>
      <div style={{ marginBottom: 10 }}>
        <strong>Revenue Share:</strong> {contract.revenueShare * 100}%
      </div>
      <div style={{ marginBottom: 18 }}>
        <strong>Terms:</strong> {contract.terms}
      </div>
      <div style={{ marginBottom: 24 }}>
        <span style={{ fontWeight: 600, color: "#0af" }}>Status: {statusEmoji[contract.status as keyof typeof statusEmoji]} {contract.status}</span>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 32 }}>
        <button onClick={handleAccept} style={btnStyle}>Accept Contract</button>
        <button onClick={() => setCounterMode(!counterMode)} style={btnStyle}>Counter Offer</button>
        <button onClick={() => setShowEdit(!showEdit)} style={btnStyle}>New Contract</button>
      </div>

      {/* Counter-offer Form */}
      {counterMode && (
        <form onSubmit={e => { e.preventDefault(); handleCounterOffer() }} style={counterFormStyle}>
          <h4>Counter Offer</h4>
          <div>
            <label>Amount: <input type="number" value={amount} onChange={e=>setAmount(Number(e.target.value))} style={inputStyle} /></label>
          </div>
          <div>
            <label>Revenue %: <input type="number" value={revenueShare} step={0.01} onChange={e=>setRevenueShare(Number(e.target.value))} style={inputStyle} /></label>
          </div>
          <div>
            <label>Terms: <input value={terms} onChange={e=>setTerms(e.target.value)} style={inputStyle} /></label>
          </div>
          <button type="submit" style={{ ...btnStyle, background: "#2e49f1", color: "#fff" }}>Send Counter</button>
        </form>
      )}

      {/* New/Quick Contract Creation Compact Form */}
      {showEdit && (
        <form onSubmit={handleNewContract} style={counterFormStyle}>
          <h4>New Contract</h4>
          <div>
            <label>Title: <input type="text" defaultValue="" required style={inputStyle} /></label>
          </div>
          <div>
            <label>Amount: <input type="number" defaultValue={100} required style={inputStyle} /></label>
          </div>
          <div>
            <label>Revenue %: <input type="number" defaultValue={0.10} step={0.01} required style={inputStyle} /></label>
          </div>
          <div>
            <label>Terms: <input defaultValue="" required style={inputStyle} /></label>
          </div>
          <button type="submit" style={btnStyle}>Submit Contract</button>
        </form>
      )}

      <Link href="/contracts"><button style={{ ...btnStyle, marginTop: 38 }}>Back to Contracts</button></Link>
    </div>
  )
}

// Simple styling
const btnStyle: React.CSSProperties = {
  background: "#0af", color: "#fff", border: "none", padding: "10px 16px", borderRadius: 7, fontWeight: 600, cursor: "pointer"
}
const inputStyle: React.CSSProperties = { marginLeft: 6, marginBottom: 8, borderRadius: 4, border: "1px solid #ccc", padding: 4 }
const counterFormStyle: React.CSSProperties = { margin: "22px 0", background: "#f7f9fa", padding: 18, borderRadius: 9 }

