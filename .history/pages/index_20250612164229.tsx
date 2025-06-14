// pages/index.tsx
import React, { useState, useEffect, useCallback } from 'react'
import { FixedSizeList as List } from 'react-window'
import { supabase } from '@/lib/supabaseClient'
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
      const res = await fetch(`/api/coins?limit=100&offset=${pageNumber * 100}`)
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

  const renderCoin = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const coin = coins[index]
    return (
      <div key={coin.id} style={{ ...style, padding: '0.5rem', borderBottom: '1px solid #333' }}>
        <strong>{coin.emoji ?? '🪙'} {coin.name}</strong>
        <p>${coin.price.toFixed(2)} · cap {coin.cap}</p>
        {coin.tagline && <p><em>{coin.tagline}</em></p>}
        {coin.vision && <p>{coin.vision}</p>}
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', background: '#000', color: '#fff', minHeight: '100vh' }}>
      {/* Left Panel */}
      <div style={{ flex: 1, padding: '1rem', height: '100vh', overflow: 'auto' }}>
        <h2 style={{ textAlign: 'center' }}>–1000</h2>
        <List
          height={window.innerHeight - 100}
          itemCount={coins.length}
          itemSize={120}
          width={'100%'}
        >
          {renderCoin}
        </List>
      </div>

      {/* Center HUD */}
      <div style={{ flex: 1, padding: '1rem', height: '100vh', overflow: 'auto' }}>
        <h1 style={{ marginBottom: '1rem', textAlign: 'center' }}>AURA</h1>
        {user?.email ? <p><strong>{user.email}</strong></p> : <p>Not signed in</p>}
      </div>

      {/* Right Panel */}
      <div style={{ flex: 1, padding: '1rem', height: '100vh', overflow: 'auto' }}>
        <h2 style={{ textAlign: 'center' }}>+1000</h2>
        <List
          height={window.innerHeight - 100}
          itemCount={coins.length}
          itemSize={120}
          width={'100%'}
        >
          {renderCoin}
        </List>
      </div>
    </div>
  )
}