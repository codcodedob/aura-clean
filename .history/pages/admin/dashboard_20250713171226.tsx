import React, { useEffect, useState, useCallback } from 'react'

type Visit = {
  id: string
  timestamp: string
  url: string
  ip: string
  user_agent: string
  country?: string
}

export default function Dashboard() {
  const [visits, setVisits] = useState<Visit[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchVisits = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/get-visits')
      if (!res.ok) throw new Error(`Failed to load: ${res.statusText}`)
      const data: Visit[] = await res.json()
      setVisits(data)
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Unknown error')
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchVisits()
  }, [fetchVisits])

  return (
    <div>
      <h1>Site Visits</h1>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <table>
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>URL</th>
            <th>IP</th>
            <th>User Agent</th>
            <th>Country</th>
          </tr>
        </thead>
        <tbody>
          {visits.map((visit) => (
            <tr key={visit.id}>
              <td>{new Date(visit.timestamp).toLocaleString()}</td>
              <td>{visit.url}</td>
              <td>{visit.ip}</td>
              <td>{visit.user_agent}</td>
              <td>{visit.country ?? '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
