
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
  const [investAmounts, setInvestAmounts] = useState<Record<string, number>>({})
  const [buyingId, setBuyingId] = useState<string | null>(null)

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

  const handleStripeBuy = async (coin: Coin, amount: number) => {
    if (!amount || amount < coin.price) {
      alert(`Minimum investment is $${coin.price}`)
      return
    }
    setBuyingId(coin.id)
    try {
      const stripe = await stripePromise
      if (!stripe) throw new Error('Stripe not loaded')

      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          coinId: coin.id,
          amount: Math.round(amount * 100)
        })
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Checkout failed')
      const { error: stripeError } = await stripe.redirectToCheckout({ sessionId: json.sessionId })
      if (stripeError) throw stripeError
    } catch (err) {
      alert('⚠️ Purchase failed')
      console.error(err)
    } finally {
      setBuyingId(null)
    }
  }

  return (
    <div style={{ padding: '2rem', background: '#000', color: '#fff', minHeight: '100vh' }}>
      <h1>AURA Marketplace</h1>
      <p>User: {user?.email ?? 'Not signed in'}</p>

      <div style={{ display: 'flex', gap: '1rem' }}>
        <div style={{ flex: 1 }}>
          <h2 style={{ textAlign: 'center' }}>Coin Market</h2>
          {coins.map(coin => (
            <div key={coin.id} style={{ border: '1px solid #555', padding: '1rem', marginBottom: '1rem', borderRadius: '8px', textAlign: 'center' }}>
              <h3>{coin.emoji ?? '🪙'} {coin.name}</h3>
              <p>${coin.price.toFixed(2)} · Cap: {coin.cap}</p>
              {coin.tagline && <p><em>{coin.tagline}</em></p>}
              {coin.vision && <p>{coin.vision}</p>}
              <input
                type="number"
                min={coin.price}
                placeholder={`Invest $${coin.price} or more`}
                value={investAmounts[coin.id] ?? ''}
                onChange={e => setInvestAmounts(prev => ({ ...prev, [coin.id]: parseFloat(e.target.value) }))}
                style={{ width: '100%', padding: '0.4rem', margin: '0.5rem 0' }}
              />
              <button onClick={() => handleStripeBuy(coin, investAmounts[coin.id])} disabled={buyingId === coin.id}>
                {buyingId === coin.id ? 'Processing…' : 'Buy'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
