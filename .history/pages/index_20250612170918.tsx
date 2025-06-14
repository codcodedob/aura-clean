
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
      console.error('[DEBUG] Failed to load coins:', err)
    } finally {
      setLoading(false)
    }
  }

  const renderCoin = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const coin = coins[index]
    return (
      <div key={coin.id} style={{ ...style, padding: '0.75rem', borderBottom: '1px solid #333' }}>
        <div style={{ background: '#111', borderRadius: '8px', padding: '1rem', textAlign: 'center' }}>
          <div><strong>{coin.emoji ?? '🪙'} {coin.name}</strong></div>
          <div>${coin.price.toFixed(2)} · Cap: {coin.cap}</div>
          {coin.tagline && <div><em>{coin.tagline}</em></div>}
          {coin.vision && <div style={{ fontSize: '0.9em', marginBottom: '0.5em' }}>{coin.vision}</div>}
          <button style={{
            marginTop: '0.5rem',
            padding: '0.4rem 0.8rem',
            background: '#0a84ff',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer'
          }}>
            Buy
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#000', color: '#fff' }}>
      <div style={{ flex: 1, borderRight: '1px solid #333', padding: '1rem' }}>
        <h2 style={{ textAlign: 'center' }}>–1000</h2>
        <List
          height={window.innerHeight - 100}
          itemCount={coins.length}
          itemSize={150}
          width={'100%'}
        >
          {renderCoin}
        </List>
      </div>

      <div style={{ flex: 1, borderLeft: '1px solid #333', padding: '1rem' }}>
        <h2 style={{ textAlign: 'center' }}>+1000</h2>
        <List
          height={window.innerHeight - 100}
          itemCount={coins.length}
          itemSize={150}
          width={'100%'}
        >
          {renderCoin}
        </List>
      </div>
    </div>
  )
}
