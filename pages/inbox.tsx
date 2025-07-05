import React, { useState } from 'react'
import Link from 'next/link'

export default function InboxPage() {
  const [messages] = useState([
    { id: 1, from: 'Support', subject: 'Welcome to HipSession!', unread: true },
    { id: 2, from: 'Admin', subject: 'Your AGX License Approved', unread: false },
    { id: 3, from: 'Stripe', subject: 'Payment Complete: $50', unread: false },
  ])

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: 32 }}>
      <h1 style={{ fontWeight: 800, fontSize: 28, marginBottom: 8 }}>📬 Inbox & Support</h1>
      <p style={{ color: '#64748b', marginBottom: 18 }}>
        Direct support, company messages, alerts. For urgent issues, <b>reply directly here</b>.
      </p>
      <ul style={{ background: "#f3f4f6", borderRadius: 10, padding: 16 }}>
        {messages.map(msg => (
          <li key={msg.id} style={{
            borderBottom: "1px solid #e5e7eb",
            padding: 12,
            background: msg.unread ? "#e0f2fe" : "transparent"
          }}>
            <b>{msg.from}:</b> {msg.subject}
          </li>
        ))}
      </ul>
      <div style={{ marginTop: 22 }}>
        <Link href="/business/art">
          <button style={btn}>⬅ Back to Art Dept</button>
        </Link>
      </div>
    </div>
  )
}
const btn: React.CSSProperties = { background: "#181825", color: "#fff", borderRadius: 8, border: 'none', padding: "12px 26px", fontWeight: 700, fontSize: 15, cursor: "pointer" }
