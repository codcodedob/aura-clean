// pages/index.tsx
import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { stripePromise } from '@/lib/stripe'
import type { User } from '@supabase/supabase-js'

interface Coin {
  id: string
  user_id: string
  name: string
  emoji?: string
  price: number
  cap: number
  visible?: boolean
  tagline?: string
  vision?: string
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [coins, setCoins] = useState<Coin[]>([])
  const [page, setPage] = useState(0)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user))
  }, [])

  useEffect(() => {
    if (!user) return
    loadMoreCoins(0)
  }, [user])

  const loadMoreCoins = async (pageToLoad: number) => {
    if (loadingMore || !hasMore) return
    setLoadingMore(true)
    try {
      const res = await fetch(`/api/coins?limit=20&offset=${pageToLoad * 20}`)
      const json = await res.json()
      if (!Array.isArray(json) || json.length === 0) {
        setHasMore(false)
      } else {
        setCoins(prev => [...prev, ...json])
        setPage(pageToLoad + 1)
      }
    } catch (err) {
      console.error('Load coins failed:', err)
    } finally {
      setLoadingMore(false)
    }
  }

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 100 &&
        !loadingMore && hasMore
      ) {
        loadMoreCoins(page)
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [page, loadingMore, hasMore])

  const myCoin = coins.find(c => c.user_id === user?.id)
  const losers = coins.filter(c => c.price < 2.0 && c.user_id !== user?.id)
  const gainers = coins.filter(c => c.price >= 2.0 && c.user_id !== user?.id)

  const createCity1Coin = async () => {
    if (!user) return
    const { data: existing } = await supabase.from('aura_coins').select('id').ilike('name', 'City%')
    const nextNum = (existing?.length || 0) + 1
    const coinName = `City ${nextNum}`
    const randomEmoji = ['🌆','🏙️','🌃','🌉','🌇'][Math.floor(Math.random()*5)]
    const { error } = await supabase.from('aura_coins').insert({
      user_id: user.id,
      name: coinName,
      emoji: randomEmoji,
      price: 1.25,
      cap: 0,
      visible: true,
      tagline: 'NPC Coin for testing',
      vision: 'This coin simulates an active digital region.'
    })
    alert(error ? `❌ Error creating ${coinName}` : `✅ ${coinName} created`)
  }

  const handleStripeBuy = async (coin: Coin) => {
    try {
      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coinId: coin.id })
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Checkout session failed')
      const stripe = await stripePromise
      if (!stripe) throw new Error('Stripe not loaded')
      const { error: stripeError } = await stripe.redirectToCheckout({ sessionId: json.sessionId })
      if (stripeError) throw stripeError
    } catch (err) {
      alert('⚠️ Purchase failed')
      console.error(err)
    }
  }

  return (
    <div style={{ display: 'flex', background: '#000', color: '#fff', minHeight: '100vh' }}>
      {/* Left Panel */}
      <div style={{ flex: 1, padding: '1rem', borderRight: '1px solid #333' }}>
        <h2 style={{ textAlign: 'center' }}>–1000</h2>
        {losers.map(coin => (
          <div key={coin.id} style={{ margin: '1rem 0', padding: '1rem', border: '1px solid #a22' }}>
            <strong>{coin.emoji ?? '🪙'} {coin.name}</strong>
            <p>${coin.price.toFixed(2)} · cap {coin.cap}</p>
            <button onClick={() => handleStripeBuy(coin)} style={{ marginTop: '0.5rem' }}>Buy</button>
          </div>
        ))}
      </div>

      {/* Center HUD */}
      <div style={{ flex: 1, padding: '1rem', textAlign: 'center' }}>
        <h1 style={{ marginBottom: '1rem' }}>AURA</h1>
        <p><strong>{user?.email}</strong></p>
        {myCoin ? (
          <div style={{ padding: '1rem', border: '1px solid #444' }}>
            <h2>{myCoin.emoji ?? '🌟'} {myCoin.name}</h2>
            <p>${myCoin.price.toFixed(2)} · cap {myCoin.cap}</p>
            {myCoin.tagline && <p><em>{myCoin.tagline}</em></p>}
            {myCoin.vision && <p>{myCoin.vision}</p>}
          </div>
        ) : (
          <p>You don't have an AuraCoin yet.</p>
        )}

        {/* Admin-only "City" Generator */}
        {user?.email === 'burks.donte@gmail.com' && (
          <button onClick={createCity1Coin} style={{ marginTop: '1rem', padding: '0.5rem 1rem', background: '#0a84ff', border: 'none', borderRadius: 4, color: '#fff', cursor: 'pointer' }}>
            Generate City Test Coin
          </button>
        )}

        {loadingMore && <p style={{ marginTop: '2rem' }}>Loading more coins…</p>}
      </div>

      {/* Right Panel */}
      <div style={{ flex: 1, padding: '1rem', borderLeft: '1px solid #333' }}>
        <h2 style={{ textAlign: 'center' }}>+1000</h2>
        {gainers.map(coin => (
          <div key={coin.id} style={{ margin: '1rem 0', padding: '1rem', border: '1px solid #3a5' }}>
            <strong>{coin.emoji ?? '🔥'} {coin.name}</strong>
            <p>${coin.price.toFixed(2)} · cap {coin.cap}</p>
            <button onClick={() => handleStripeBuy(coin)} style={{ marginTop: '0.5rem' }}>Buy</button>
          </div>
        ))}
      </div>
    </div>
  )
}
