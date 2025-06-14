
// pages/index.tsx
import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { stripePromise } from '@/lib/stripe'
import type { User } from '@supabase/supabase-js'

interface Coin {
  id: string
  user_id: string
  name: string
  price: number
  cap: number
  emoji?: string
  visible?: boolean
  tagline?: string
  vision?: string
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [coins, setCoins] = useState<Coin[]>([])
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user))
  }, [])

  useEffect(() => {
    if (!user) return
    loadCoins(0)
  }, [user])

  const loadCoins = async (pageNumber: number) => {
    if (loading || !hasMore) return
    setLoading(true)
    try {
      const res = await fetch(\`/api/coins?limit=100&offset=\${pageNumber * 100}\`)
      const json = await res.json()
      if (!Array.isArray(json) || json.length === 0) {
        setHasMore(false)
      } else {
        setCoins(prev => [...prev, ...json])
        setPage(pageNumber + 1)
      }
    } catch (err) {
      console.error('[DEBUG] Failed to load coins:', err)
    } finally {
      setLoading(false)
    }
  }

  const myCoin = coins.find(c => c.user_id === user?.id)

  return (
    <div style={{ display: 'flex', background: '#000', color: '#fff', minHeight: '100vh' }}>
      {/* Left Panel */}
      <div style={{ flex: 1, padding: '1rem', borderRight: '1px solid #333', overflowY: 'auto' }}>
        <h2 style={{ textAlign: 'center' }}>–1000</h2>
        {coins.map(coin => (
          <div key={coin.id} style={{
            margin: '1rem auto',
            width: '90%',
            maxWidth: 400,
            background: '#111',
            border: '1px solid #444',
            borderRadius: 8,
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
              {coin.emoji ?? '🪙'} {coin.name}
            </div>
            <div style={{ fontSize: '1rem', margin: '0.5rem 0' }}>
              ${coin.price.toFixed(2)} · Cap: {coin.cap}
            </div>
            {coin.tagline && <p style={{ fontStyle: 'italic', textAlign: 'center' }}>{coin.tagline}</p>}
            {coin.vision && <p style={{ textAlign: 'center', color: '#aaa' }}>{coin.vision}</p>}
            <button
              style={{
                marginTop: '0.75rem',
                padding: '0.5rem 1rem',
                borderRadius: 6,
                background: '#0a84ff',
                color: '#fff',
                border: 'none',
                cursor: 'pointer'
              }}
              onClick={() => alert('Buy logic to be implemented')}
            >
              Buy
            </button>
          </div>
        ))}
        {loading && <p style={{ textAlign: 'center' }}>Loading more coins...</p>}
      </div>

      {/* Center Panel */}
      <div style={{ flex: 1, padding: '1rem', textAlign: 'center', borderRight: '1px solid #333' }}>
        <h1>AURA</h1>
        {user ? <p>{user.email}</p> : <p>Not signed in</p>}
        {myCoin && (
          <div style={{ padding: '1rem', border: '1px solid #555', borderRadius: 6, marginTop: '2rem' }}>
            <h2>{myCoin.emoji ?? '🌟'} {myCoin.name}</h2>
            <p>${myCoin.price.toFixed(2)} · Cap: {myCoin.cap}</p>
            {myCoin.tagline && <p><em>{myCoin.tagline}</em></p>}
            {myCoin.vision && <p>{myCoin.vision}</p>}
          </div>
        )}
      </div>

      {/* Right Panel */}
      <div style={{ flex: 1, padding: '1rem', overflowY: 'auto' }}>
        <h2 style={{ textAlign: 'center' }}>+1000</h2>
        {/* Optional mirrored coin view if needed */}
      </div>
    </div>
  )
}
