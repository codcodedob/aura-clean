import React from 'react'
import Link from 'next/link'

export default function AgxLicensePage() {
  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 32 }}>
      <h1 style={{ fontWeight: 800, fontSize: 29, marginBottom: 10 }}>🔑 AGX License & Worker Dashboard</h1>
      <p style={{ color: '#64748b', marginBottom: 24 }}>
        Manage licenses, certifications, and job codes. Review your work history, pay, and onboarding documents.
      </p>
      <div style={{ background: "#f3f4f6", borderRadius: 14, marginBottom: 28, padding: 18 }}>
        <h3>Current Licenses</h3>
        <ul>
          <li>AGX General License <span style={{ color: "#059669" }}>Active</span></li>
        </ul>
        <button style={btn}>Apply for New License</button>
      </div>
      <div style={{ background: "#f3f4f6", borderRadius: 14, padding: 18, marginBottom: 28 }}>
        <h3>Job Codes & Work Assignments</h3>
        <ul>
          <li>#AGX-002 - Delivery - Scheduled 07/12</li>
          <li>#AGX-015 - Art Handler - Active</li>
        </ul>
      </div>
      <div style={{ background: "#f3f4f6", borderRadius: 14, padding: 18 }}>
        <h3>Pay & History (Demo)</h3>
        <ul>
          <li>Last Payment: $250 on 06/27</li>
          <li>Total Earnings: $6,800</li>
        </ul>
      </div>
      <div style={{ marginTop: 28 }}>
        <Link href="/business/art">
          <button style={btn}>⬅ Back to Art Dept</button>
        </Link>
      </div>
    </div>
  )
}
const btn: React.CSSProperties = { background: "#181825", color: "#fff", borderRadius: 8, border: 'none', padding: "12px 26px", fontWeight: 700, fontSize: 15, cursor: "pointer" }
