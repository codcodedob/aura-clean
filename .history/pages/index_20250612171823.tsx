// pages/index.tsx
import React, { useEffect, useState } from 'react'
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
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)

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
      const res = await fetch(`/api/coins?limit=100&offset=${pageNumber * 100}`)

      const json = await res.json()
      if (!Array.isArray(json) || json.length === 0) {
        setHasMore(false)
      } else {
        setCoins(prev => [...prev, ...json])
        setPage(pageNumber + 1)
      }
    } catch (err) {
      console.error('[Load Error]', err)
    } finally {
      setLoading(false)
    }
  }

  const renderCoin = ({ index, style }: { index: number, style: React.CSSProperties }) => {
    const coin = coins[index]
    return (
      <div key={coin.id} style={{ ...style, padding: '0.5rem', borderBottom: '1px solid #333' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            <strong>{coin.emoji ?? '🪙'} {coin.name}</strong>
            <p>${coin.price.toFixed(2)} · cap {coin.cap}</p>
            {coin.tagline && <p><em>{coin.tagline}</em></p>}
            {coin.vision && <p>{coin.vision}</p>}
          </div>
          <button style={{ padding: '0.5rem 1rem', background: '#0a84ff', border: 'none', borderRadius: 4, color: '#fff' }}>
            Buy
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', background: '#000', color: '#fff', minHeight: '100vh' }}>
      {/* Left Panel */}
      <div style={{ flex: 1, borderRight: '1px solid #333' }}>
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

      {/* Center Panel */}
      <div style={{ flex: 1, borderLeft: '1px solid #333', borderRight: '1px solid #333', padding: '1rem', textAlign: 'center' }}>
        <h1>AURA</h1>
        <p>{user?.email ?? 'Not signed in'}</p>
      </div>

      {/* Right Panel */}
      <div style={{ flex: 1 }}>
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
