// pages/marketplace.tsx
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

interface Coin {
  id: string
  name: string
  emoji?: string
  price: number
  cap: number
}

export default function Marketplace() {
  const [coins, setCoins] = useState<Coin[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const router = useRouter()

  useEffect(() => {
    async function fetchCoins() {
      try {
        const res = await fetch('/api/coins')
        const json = await res.json()
        if (!res.ok) throw new Error(json.error || 'Failed to fetch coins')
        setCoins(json)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchCoins()
  }, [])

  const filtered = coins.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.emoji ?? '').includes(search)
  )

  return (
    <div style={{ background: '#000', color: '#fff', minHeight: '100vh', padding: 24 }}>
      <h1 style={{ fontSize: 32, marginBottom: 16 }}>AuraCoin Marketplace</h1>

      <input
        type="text"
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="🔍 Search coins"
        style={{
          padding: '10px 16px',
          borderRadius: 6,
          border: '1px solid #555',
          background: '#111',
          color: '#fff',
          width: '100%',
          maxWidth: 400,
          marginBottom: 24,
        }}
      />

      {loading ? (
        <p>Loading coins…</p>
      ) : error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : (
        <div style={{ display: 'grid', gap: 16 }}>
          {filtered.map(c => (
            <div key={c.id} style={{
              background: '#111',
              padding: 16,
              borderRadius: 12,
              border: '1px solid #444',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <div>
                <div style={{ fontSize: 20, fontWeight: 600 }}>{c.emoji ?? '🪙'} {c.name}</div>
                <div style={{ fontSize: 14, opacity: 0.8 }}>${c.price.toFixed(2)} · cap {c.cap}</div>
              </div>
              <button
                style={{
                  background: '#0a84ff',
                  border: 'none',
                  color: '#fff',
                  padding: '8px 12px',
                  borderRadius: 6,
                  cursor: 'pointer',
                }}
                onClick={() => router.push(`/?buy=${c.id}`)}
              >Buy</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
