
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
  const otherCoins = coins.filter(c => c.user_id !== user?.id)

  return (
    <div style={{ display: 'flex', background: '#000', color: '#fff', minHeight: '100vh' }}>
      {/* Left Panel */}
      <div style={{ flex: 1, padding: '1rem', borderRight: '1px solid #333' }}>
        <h2 style={{ textAlign: 'center' }}>Other Coins</h2>
        {otherCoins.map(coin => (
          <div key={coin.id} style={{ padding: '1rem', margin: '1rem 0', border: '1px solid #444', textAlign: 'center' }}>
            <h3>{coin.emoji ?? '🪙'} {coin.name}</h3>
            <p>${coin.price.toFixed(2)} · Cap: {coin.cap}</p>
            {coin.tagline && <p><em>{coin.tagline}</em></p>}
            {coin.vision && <p>{coin.vision}</p>}
          </div>
        ))}
      </div>

      {/* Center Panel */}
      <div style={{ flex: 1, padding: '1rem', textAlign: 'center', borderLeft: '1px solid #333', borderRight: '1px solid #333' }}>
        <h2>My Coin</h2>
        {myCoin ? (
          <div style={{ padding: '1rem', border: '1px solid #666' }}>
            <h3>{myCoin.emoji ?? '🌟'} {myCoin.name}</h3>
            <p>${myCoin.price.toFixed(2)} · Cap: {myCoin.cap}</p>
            {myCoin.tagline && <p><em>{myCoin.tagline}</em></p>}
            {myCoin.vision && <p>{myCoin.vision}</p>}
          </div>
        ) : (
          <p>No personal coin found.</p>
        )}
        <div style={{ marginTop: '2rem' }}>
          <h3>Purchase History</h3>
          <p>(Feature coming soon...)</p>
        </div>
      </div>

      {/* Right Panel */}
      <div style={{ flex: 1, padding: '1rem' }}>
        <h2 style={{ textAlign: 'center' }}>Market View</h2>
        {otherCoins.map(coin => (
          <div key={coin.id} style={{ padding: '1rem', margin: '1rem 0', border: '1px solid #555', textAlign: 'center' }}>
            <h3>{coin.emoji ?? '🪙'} {coin.name}</h3>
            <p>${coin.price.toFixed(2)} · Cap: {coin.cap}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
