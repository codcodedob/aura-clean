
// pages/index.tsx
import React, { useState, useEffect, useRef } from 'react'
import { FixedSizeList as List } from 'react-window'
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
      console.error('Failed to load coins:', err)
    } finally {
      setLoading(false)
    }
  }

  const renderCoin = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const coin = coins[index]
    return (
      <div key={coin.id} style={{ ...style, padding: '1rem', borderBottom: '1px solid #444', boxSizing: 'border-box' }}>
        <h3>{coin.emoji ?? '🪙'} {coin.name}</h3>
        <p>${coin.price.toFixed(2)} · Cap: {coin.cap}</p>
        {coin.tagline && <p><em>{coin.tagline}</em></p>}
        {coin.vision && <p>{coin.vision}</p>}
        <button style={{ marginTop: '0.5rem' }}>Buy</button>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#000', color: '#fff' }}>
      <div style={{ flex: 1, borderRight: '1px solid #333', overflow: 'hidden' }}>
        <h2 style={{ textAlign: 'center' }}>–1000</h2>
        <List
          height={window.innerHeight - 100}
          itemCount={coins.length}
          itemSize={140}
          width={'100%'}
        >
          {renderCoin}
        </List>
      </div>

      <div style={{ flex: 1, padding: '1rem', textAlign: 'center' }}>
        <h1>AURA</h1>
        <p>{user?.email ?? 'Not signed in'}</p>
      </div>

      <div style={{ flex: 1, borderLeft: '1px solid #333', overflow: 'hidden' }}>
        <h2 style={{ textAlign: 'center' }}>+1000</h2>
        <List
          height={window.innerHeight - 100}
          itemCount={coins.length}
          itemSize={140}
          width={'100%'}
        >
          {renderCoin}
        </List>
      </div>
    </div>
  )
}
