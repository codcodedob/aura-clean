// pages/index.tsx
import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import AuthForm from '@/components/AuthForm'
import { supabase } from '@/lib/supabaseClient'
import type { User } from '@supabase/supabase-js'
import { stripePromise } from '@/lib/stripe'

interface Coin {
  id: string
  user_id: string
  name: string
  emoji?: string
  price: number
  cap: number
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [coins, setCoins] = useState<Coin[]>([])
  const [myCoin, setMyCoin] = useState<Coin | null>(null)
  const [buyingId, setBuyingId] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user: u } }) => setUser(u))
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_, session) => setUser(session?.user ?? null)
    )
    return () => listener.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    async function loadCoins() {
      const res = await fetch('/api/coins')
      const json = await res.json()
      setCoins(json || [])
    }
    loadCoins()
  }, [user])

  useEffect(() => {
    if (!user) return
    const mine = coins.find(c => c.user_id === user.id) || null
    setMyCoin(mine)
  }, [coins, user])

  const filtered = Array.isArray(coins) ? coins.filter(c => {
    const name = c.name?.toLowerCase?.() || ''
    const emoji = c.emoji || ''
    return name.includes(search.toLowerCase()) || emoji.includes(search)
  }) : []

  const handleStripeBuy = async (coin: Coin) => {
    setBuyingId(coin.id)
    try {
      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coinId: coin.id }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Checkout failed')
      const stripe = await stripePromise
      if (!stripe) throw new Error('Stripe failed to load')
      await stripe.redirectToCheckout({ sessionId: json.sessionId })
    } catch (err: any) {
      alert(err.message)
    } finally {
      setBuyingId(null)
    }
  }

  const createMyCoin = async () => {
    if (!user || myCoin) return
    try {
      const res = await fetch('/api/create-coin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, name: user.email!.split('@')[0] }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      alert('✨ AuraCoin created!')
      location.reload()
    } catch (err: any) {
      alert(err.message)
    }
  }

  if (!user) {
    return (
      <div style={{ background: '#000', minHeight: '100vh' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
          <AuthForm onAuth={() => {}} />
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: '#000', color: '#fff', minHeight: '100vh', padding: 24 }}>
      <h1 style={{ fontSize: 32, marginBottom: 16 }}>Aura Marketplace</h1>

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

      {!myCoin && (
        <button
          onClick={createMyCoin}
          style={{
            background: '#0a84ff',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            padding: '8px 12px',
            cursor: 'pointer',
            marginBottom: 16,
          }}
        >
          Create My AuraCoin
        </button>
      )}

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
              disabled={buyingId === c.id}
              onClick={() => handleStripeBuy(c)}
              style={{
                background: '#1e1',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                padding: '6px 12px',
                cursor: 'pointer',
              }}
            >
              {buyingId === c.id ? 'Processing…' : 'Buy'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
