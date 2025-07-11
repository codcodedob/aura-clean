import React, { useState, useEffect } from 'react'

type Visit = {
  id: string
  url: string
  ip: string
  user_agent: string
  timestamp: string
}

export default function AdminEndpointsPanel() {
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [visits, setVisits] = useState<Visit[]>([])
  const [loadingVisits, setLoadingVisits] = useState(false)

  const triggerScan = async () => {
    setLoading(true)
    const res = await fetch('/api/trigger-scan', { method: 'POST' })
    const json = await res.json()
    setMsg(json.message || json.error)
    setLoading(false)
  }

  const loadVisits = async () => {
    setLoadingVisits(true)
    const res = await fetch('/api/get-visits')
    const data = await res.json()
    setVisits(data)
    setLoadingVisits(false)
  }

  useEffect(() => {
    loadVisits()
  }, [])

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
          marginBottom: 24,
        }}
      >
        {loading ? 'Scanning…' : 'Run Vulnerability Scan Now'}
      </button>
      {msg && <p style={{ marginBottom: 24 }}>{msg}</p>}

      <h3>Recent Site Visits</h3>
      {loadingVisits ? (
        <p>Loading visits…</p>
      ) : visits.length === 0 ? (
        <p>No visits recorded yet.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', color: '#eee' }}>
          <thead>
            <tr>
              <th style={{ borderBottom: '1px solid #444', padding: 8, textAlign: 'left' }}>Timestamp</th>
              <th style={{ borderBottom: '1px solid #444', padding: 8, textAlign: 'left' }}>URL</th>
              <th style={{ borderBottom: '1px solid #444', padding: 8, textAlign: 'left' }}>IP</th>
              <th style={{ borderBottom: '1px solid #444', padding: 8, textAlign: 'left' }}>User Agent</th>
            </tr>
          </thead>
          <tbody>
            {visits.map((v) => (
              <tr key={v.id}>
                <td style={{ padding: 8 }}>{new Date(v.timestamp).toLocaleString()}</td>
                <td style={{ padding: 8, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.url}</td>
                <td style={{ padding: 8 }}>{v.ip}</td>
                <td style={{ padding: 8, maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.user_agent}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
