// /pages/contracts.tsx
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'

interface Contract {
  id: string
  client: string
  type: string
  status: string
  amount: number
  created_at: string
}

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([])
  const [loading, setLoading] = useState(true)
  const [onboarding, setOnboarding] = useState(false)
  const [income, setIncome] = useState<number>(0)

  useEffect(() => {
    // Fetch contracts
    supabase.from('contracts').select('*').then(({ data }) => {
      setContracts(data || [])
      setLoading(false)
    })
    // Fetch income - demo, replace with real query
    supabase.from('contracts')
      .select('amount')
      .eq('status', 'active')
      .then(({ data }) => setIncome((data || []).reduce((a, c) => a + c.amount, 0)))
  }, [])

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: 32 }}>
      <h1 style={{ fontWeight: 700, fontSize: 30, marginBottom: 14 }}>📄 Contracts & Consultation</h1>
      <p style={{ color: '#64748b', marginBottom: 28, fontSize: 17 }}>
        All legal agreements, client contracts, and consultation onboarding. Manage investments, track income, and review project documents.
      </p>
      <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 24 }}>
        <button
          style={mainBtn}
          onClick={() => setOnboarding(v => !v)}
        >
          {onboarding ? 'Cancel Onboarding' : 'Start New Consultation/Contract'}
        </button>
        <Link href="/finance">
          <button style={mainBtn}>Financial Accounts</button>
        </Link>
      </div>
      <div style={{ marginBottom: 36 }}>
        <b>Projected Income:</b> <span style={{ color: "#059669" }}>${income.toLocaleString()}</span>
      </div>
      {/* Onboarding form */}
      {onboarding && (
        <div style={{
          border: "1.5px solid #cbd5e1",
          borderRadius: 10,
          padding: 24,
          background: "#f9fafb",
          marginBottom: 38
        }}>
          <h3 style={{ fontSize: 21, marginBottom: 14 }}>New Contract / Consultation Onboarding</h3>
          <form>
            <input placeholder="Client Name/Company" style={inputStyle} /><br />
            <input placeholder="Contract Type" style={inputStyle} /><br />
            <input placeholder="Amount ($)" type="number" style={inputStyle} /><br />
            <textarea placeholder="Agreement Terms / Notes" style={inputStyle}></textarea><br />
            {/* You can add NDA/waiver options, contract templates, etc. */}
            <button type="submit" style={mainBtn}>Submit Contract</button>
          </form>
        </div>
      )}
      {/* Contracts Table */}
      <div>
        <h3 style={{ fontSize: 20, marginBottom: 12 }}>Active Contracts</h3>
        {loading ? <p>Loading...</p> : (
          <table style={{
            width: "100%",
            borderCollapse: "collapse",
            marginBottom: 24,
            background: "#fff"
          }}>
            <thead>
              <tr style={{ background: "#f3f4f6" }}>
                <th style={thStyle}>Client</th>
                <th style={thStyle}>Type</th>
                <th style={thStyle}>Amount</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Created</th>
                <th style={thStyle}>Action</th>
              </tr>
            </thead>
            <tbody>
              {contracts.map(c => (
                <tr key={c.id}>
                  <td style={tdStyle}>{c.client}</td>
                  <td style={tdStyle}>{c.type}</td>
                  <td style={tdStyle}>${c.amount}</td>
                  <td style={tdStyle}>{c.status}</td>
                  <td style={tdStyle}>{new Date(c.created_at).toLocaleDateString()}</td>
                  <td style={tdStyle}>
                    <Link href={`/contracts/${c.id}`}>
                      <button style={actionBtn}>View</button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <div style={{ background: "#f3f4f6", padding: 24, borderRadius: 12 }}>
        <h3 style={{ fontWeight: 600 }}>Contract & Legal Info</h3>
        <ul>
          <li>All agreements can be generated as NDA, waiver, partnership, or sponsorship contracts.</li>
          <li>Legal terms, client objectives, and IP assignment options included per contract.</li>
          <li>Company and client signatures will be required upon submission.</li>
        </ul>
        <p style={{ color: "#64748b" }}>
          For advanced help, contact <Link href="/inbox"><span style={{ color: "#2563eb" }}>Support/Legal</span></Link>.
        </p>
      </div>
      <div style={{ marginTop: 34 }}>
        <Link href="/business/art">
          <button style={mainBtn}>⬅ Back to Art Dept</button>
        </Link>
      </div>
    </div>
  )
}

// Styles
const mainBtn: React.CSSProperties = {
  background: "#181825",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  padding: "12px 26px",
  fontWeight: 600,
  fontSize: 15,
  cursor: "pointer"
}
const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: 10,
  borderRadius: 6,
  marginBottom: 12,
  border: "1.2px solid #cbd5e1"
}
const thStyle: React.CSSProperties = {
  textAlign: "left", padding: 12, fontWeight: 600, fontSize: 15
}
const tdStyle: React.CSSProperties = {
  padding: 12, borderTop: "1px solid #e2e8f0", fontSize: 15
}
const actionBtn: React.CSSProperties = {
  padding: "6px 12px", background: "#0af", color: "#fff", borderRadius: 6, border: "none", cursor: "pointer"
}
