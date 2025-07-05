// pages/contracts.tsx

import React, { useState, useEffect } from 'react'
import Link from 'next/link'

// Placeholder data for fast iteration
type User = { id: string, username: string }
type Contract = {
  id: string, title: string, type: 'artist'|'campaign'|'pro_app', amount: number, revenueShare?: number,
  parties: User[], statusByParty: { [userId: string]: string }, created_at: string, updated_at: string
}
type Payment = { id: string, type: 'credit'|'debit', amount: number, date: string, description: string, status: 'paid'|'pending' }

const MOCK_USER: User = { id: 'u-123', username: 'demo_user' }
const MOCK_CONTRACTS: Contract[] = []
const MOCK_PAYMENTS: Payment[] = [
  { id: '1', type: 'credit', amount: 50, date: '2025-06-01', description: 'Royalties', status: 'paid' },
  { id: '2', type: 'credit', amount: 75, date: '2025-06-13', description: 'App Revenue', status: 'paid' },
  { id: '3', type: 'debit', amount: 100, date: '2025-07-15', description: 'Subscription', status: 'pending' }
]

// For bar chart, use a simple SVG for now (swap with chartjs/recharts for real)
const PaymentBarChart = ({ payments }: { payments: Payment[] }) => {
  const paid = payments.filter(p => p.status === 'paid')
  if (!paid.length) return <div style={{ color: '#bbb' }}>No payments yet</div>
  // Demo: group by month, sum
  const byMonth: { [k: string]: number } = {}
  paid.forEach(p => {
    const month = p.date.slice(0, 7)
    byMonth[month] = (byMonth[month] || 0) + p.amount
  })
  const months = Object.keys(byMonth)
  const max = Math.max(...Object.values(byMonth), 1)
  return (
    <svg width={300} height={120}>
      {months.map((m, i) => (
        <g key={m}>
          <rect x={i*60+10} y={100 - byMonth[m]} width={40} height={byMonth[m]} fill="#0af" />
          <text x={i*60+30} y={115} textAnchor="middle" fontSize={12}>{m}</text>
        </g>
      ))}
      <text x={150} y={10} textAnchor="middle" fontWeight="bold" fill="#333">Lifetime Payments</text>
    </svg>
  )
}

export default function ContractsPage() {
  const [user] = useState<User>(MOCK_USER)
  const [contracts, setContracts] = useState<Contract[]>(MOCK_CONTRACTS)
  const [payments, setPayments] = useState<Payment[]>(MOCK_PAYMENTS)
  const [showNewContract, setShowNewContract] = useState(false)

  // Show hero options if no contracts, else show quick buttons
  const showHeroOptions = contracts.length === 0

  return (
    <div style={{ padding: 24, maxWidth: 960, margin: "0 auto", color: "#111" }}>
      <h2 style={{ marginBottom: 18, color: "#0af" }}>Contracts & Earnings</h2>
      
      {/* HERO contract creation options (big, for new users) */}
      {showHeroOptions ? (
        <div style={{ display: 'flex', gap: 32, marginBottom: 32, justifyContent: 'center' }}>
          <HeroContractOption
            color="#19d1ad"
            title="Artist Partner / Hosting"
            desc="Host your music, earn royalties, get promoted. Quick setup & support."
            onClick={() => setShowNewContract(true)}
          />
          <HeroContractOption
            color="#ebc834"
            title="Campaign / Marketing"
            desc="Promote your brand, album or event with expert campaign management."
            onClick={() => setShowNewContract(true)}
          />
          <HeroContractOption
            color="#2e49f1"
            title="Pro/Custom AI App"
            desc="Get your own branded app, AI agent features, custom deals. Quote or revenue share."
            onClick={() => setShowNewContract(true)}
          />
        </div>
      ) : (
        <div style={{ marginBottom: 20, display: "flex", gap: 12 }}>
          <button style={quickBtnStyle} onClick={() => setShowNewContract(true)}>New Artist Contract</button>
          <button style={quickBtnStyle} onClick={() => setShowNewContract(true)}>New Campaign</button>
          <button style={quickBtnStyle} onClick={() => setShowNewContract(true)}>Custom App</button>
        </div>
      )}

      {/* Payment chart and link to all payment history */}
      <div style={{ background: "#f8fafc", borderRadius: 8, padding: 24, marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <PaymentBarChart payments={payments} />
          <div>
            <div style={{ fontWeight: 600, fontSize: 20, color: "#111" }}>
              Total: ${payments.filter(p=>p.status==='paid').reduce((sum, p)=>sum+p.amount, 0)}
            </div>
            <Link href="/payments">
              <button style={quickBtnStyle}>View All Payments</button>
            </Link>
          </div>
        </div>
      </div>

      {/* Table of scheduled payments */}
      <h3 style={{ margin: "28px 0 8px" }}>Scheduled Payments</h3>
      <table style={{ width: "100%", background: "#fff", borderRadius: 8 }}>
        <thead>
          <tr style={{ background: "#dde6f7" }}>
            <th>Date</th>
            <th>Amount</th>
            <th>Description</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {payments.filter(p=>p.status==='pending').map(p => (
            <tr key={p.id}>
              <td>{p.date}</td>
              <td>${p.amount}</td>
              <td>{p.description}</td>
              <td><span style={{color:"#ebc834"}}>Pending</span></td>
            </tr>
          ))}
          {payments.filter(p=>p.status==='pending').length === 0 && (
            <tr>
              <td colSpan={4} style={{ color: '#aaa', textAlign: 'center' }}>No scheduled payments</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* List/table of contracts (after chart, below the fold) */}
      <h3 style={{ margin: "32px 0 8px" }}>Your Contracts</h3>
      {contracts.length === 0 ? (
        <div style={{ color: "#666", margin: 18 }}>No contracts yet. Get started above!</div>
      ) : (
        <table style={{ width: "100%", background: "#f8fafc", borderRadius: 8 }}>
          <thead>
            <tr style={{ background: "#dde6f7" }}>
              <th>Contract</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Revenue %</th>
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
                  {Object.values(c.statusByParty).map((s,i)=><span key={i}>{statusEmoji[s as keyof typeof statusEmoji]}</span>)}
                </td>
                <td>{(new Date(c.updated_at)).toLocaleString()}</td>
                <td>
                  <Link href={`/contracts/${c.id}`} style={{ color: "#0af" }}>View</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* New Contract Modal */}
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

function HeroContractOption({ color, title, desc, onClick }:{
  color: string, title: string, desc: string, onClick: ()=>void
}) {
  return (
    <div style={{
      flex: 1,
      background: color,
      color: '#fff',
      borderRadius: 14,
      minHeight: 220,
      padding: "30px 20px",
      boxShadow: "0 2px 18px #1112",
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      cursor: 'pointer',
      transition: 'transform 0.12s',
      fontWeight: 600,
      fontSize: 20,
      alignItems: 'flex-start'
    }}
      onClick={onClick}
    >
      <div>{title}</div>
      <div style={{fontWeight:400, fontSize:17, margin: "20px 0 0 0"}}>{desc}</div>
      <button style={{
        background: "#fff",
        color: color,
        padding: "10px 18px",
        border: "none",
        borderRadius: 6,
        fontWeight: 700,
        marginTop: 24,
        fontSize: 18,
        cursor: 'pointer'
      }}>Start</button>
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

const statusEmoji = {
  'new': '📨',
  'viewed': '👀',
  'agreed': '🤝',
  'counter': '🔁'
}
