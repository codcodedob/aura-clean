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
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
    })
  }, [])

  useEffect(() => {
    if (!user) return
    loadCoins(0)
  }, [user])

  const loadCoins = async (pageNumber: number) => {
    if (loading || !hasMore) return
    setLoading(true)
    try {
      const res = await fetch('/api/coins?limit=100&offset=' + (pageNumber * 100))
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

  const myCoin = coins.find(c => c.user_id === user?.id && !c.name.startsWith('City'))
  const cityCoins = coins.filter(c => c.name.startsWith('City'))
  const userCoins = coins.filter(c => !c.name.startsWith('City') && c.user_id !== user?.id)

  const filteredCoins = [...cityCoins, ...userCoins].filter(
    c =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.tagline?.toLowerCase().includes(search.toLowerCase()) ||
      c.vision?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ display: 'flex', background: '#000', color: '#fff', minHeight: '100vh' }}>
      {/* Left Panel */}
      <div style={{ flex: 1, padding: '1rem', borderRight: '1px solid #333', overflowY: 'scroll' }}>
        <h2 style={{ textAlign: 'center' }}>–1000</h2>
        {filteredCoins.map(c => (
          <div key={c.id} style={{ margin: '1rem 0', padding: '1rem', border: '1px solid #a22', textAlign: 'center' }}>
            <strong>{c.emoji ?? '🪙'} {c.name}</strong>
            <p>${c.price.toFixed(2)} · Cap: {c.cap}</p>
            <p><em>{c.tagline ?? ''}</em></p>
            <p>{c.vision ?? ''}</p>
            <button style={{ marginTop: '0.5rem' }}>Buy</button>
          </div>
        ))}
      </div>

      {/* Center Panel */}
      <div style={{ flex: 1, padding: '1rem', textAlign: 'center', borderLeft: '1px solid #333', borderRight: '1px solid #333' }}>
        <h1>AURA</h1>
        <p><strong>{user?.email}</strong></p>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search coins"
          style={{ width: '80%', padding: '0.5rem', marginTop: '1rem', borderRadius: '4px' }}
        />
        {myCoin && (
          <div style={{ marginTop: '2rem', padding: '1rem', border: '1px solid #0ff', borderRadius: '8px' }}>
            <h3>{myCoin.emoji ?? '🌟'} {myCoin.name}</h3>
            <p>${myCoin.price.toFixed(2)} · Cap: {myCoin.cap}</p>
            <p><em>{myCoin.tagline}</em></p>
            <p>{myCoin.vision}</p>
          </div>
        )}
      </div>

      {/* Right Panel */}
      <div style={{ flex: 1, padding: '1rem', borderLeft: '1px solid #333', overflowY: 'scroll' }}>
        <h2 style={{ textAlign: 'center' }}>+1000</h2>
        {filteredCoins.map(c => (
          <div key={c.id} style={{ margin: '1rem 0', padding: '1rem', border: '1px solid #3a5', textAlign: 'center' }}>
            <strong>{c.emoji ?? '🪙'} {c.name}</strong>
            <p>${c.price.toFixed(2)} · Cap: {c.cap}</p>
            <p><em>{c.tagline ?? ''}</em></p>
            <p>{c.vision ?? ''}</p>
            <button style={{ marginTop: '0.5rem' }}>Buy</button>
          </div>
        ))}
      </div>
    </div>
  )
}