// components/AdminEndpointsPanel.tsx
import React, { useState } from 'react'

export default function AdminEndpointsPanel() {
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<string|null>(null)

  const triggerScan = async () => {
    setLoading(true)
    const res = await fetch('/api/trigger-scan', { method: 'POST' })
    const json = await res.json()
    setMsg(json.message || json.error)
    setLoading(false)
  }

  return (
    <div style={{ padding: 24, background: '#111', color: '#fff', borderRadius: 8 }}>
      <h2>Vulnerability Scans</h2>
      <button
        onClick={triggerScan}
        disabled={loading}
        style={{
          background: '#39ff14',
          color: '#000',
          padding: '10px 16px',
          border: 'none',
          borderRadius: 6,
          cursor: loading ? 'not-allowed' : 'pointer',
        }}
      >
        {loading ? 'Scanning…' : 'Run Vulnerability Scan Now'}
      </button>
      {msg && <p style={{ marginTop: 12 }}>{msg}</p>}
    </div>
  )
}
