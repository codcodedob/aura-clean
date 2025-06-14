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
    supabase.auth.getSession().then(({ data }) => {
      console.log('[DEBUG] Supabase session:', data)
    })

    supabase.auth.getUser().then(({ data: { user } }) => {
      console.log('[DEBUG] Supabase user:', user)
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

  const handleBuy = async (coin: Coin) => {
    try {
      const stripe = await stripePromise
      if (!stripe) throw new Error('Stripe not loaded')

      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coinId: coin.id, amount: Math.round(coin.price * 100) })
      })

      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Checkout session failed')

      const { error: stripeError } = await stripe.redirectToCheckout({ sessionId: json.sessionId })
      if (stripeError) throw stripeError
    } catch (err) {
      alert('⚠️ Purchase failed')
      console.error(err)
    }
  }

  return (
    <div style={{ padding: '2rem', background: '#000', color: '#fff', minHeight: '100vh' }}>
      <h1>Welcome to AURA</h1>
      <p>User: {user?.email ?? 'Not signed in'}</p>

      <div style={{ marginTop: '2rem' }}>
        {coins.length === 0 ? (
          <p>No coins available yet.</p>
        ) : (
          coins.map(coin => (
            <div key={coin.id} style={{ padding: '1rem', marginBottom: '1rem', border: '1px solid #555' }}>
              <h3>{coin.emoji ?? '🪙'} {coin.name}</h3>
              <p>${coin.price.toFixed(2)} · Cap: {coin.cap}</p>
              {coin.tagline && <p><em>{coin.tagline}</em></p>}
              {coin.vision && <p>{coin.vision}</p>}
              <button onClick={() => handleBuy(coin)} style={{ marginTop: '0.5rem', padding: '0.5rem 1rem' }}>
                Buy
              </button>
            </div>
          ))
        )}
        {loading && <p>Loading more coins...</p>}
      </div>
    </div>
  )
}
