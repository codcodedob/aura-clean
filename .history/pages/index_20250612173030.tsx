
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
  const [investAmounts, setInvestAmounts] = useState<Record<string, number>>({})

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user))
  }, [])

  useEffect(() => {
    if (!user) return
    fetch('/api/coins?limit=100&offset=0')
      .then(res => res.json())
      .then(json => {
        if (Array.isArray(json)) setCoins(json)
      })
      .catch(console.error)
  }, [user])

  const myCoin = coins.find(c => c.user_id === user?.id)

  const handleBuy = async (coin: Coin) => {
    const amount = investAmounts[coin.id]
    if (!amount || amount < coin.price) {
      alert(`Minimum investment is $${coin.price}`)
      return
    }

    const stripe = await stripePromise
    const res = await fetch('/api/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ coinId: coin.id, amount: Math.round(amount * 100) })
    })

    const json = await res.json()
    if (res.ok) {
      await stripe?.redirectToCheckout({ sessionId: json.sessionId })
    } else {
      alert(json.error || 'Purchase failed')
    }
  }

  const renderCard = (coin: Coin) => (
    <div key={coin.id} style={{
      border: '1px solid #444',
      borderRadius: 8,
      marginBottom: 16,
      padding: 16,
      background: '#111',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      width: '90%',
      margin: '0 auto 1rem auto'
    }}>
      <h3>{coin.emoji ?? '🪙'} {coin.name}</h3>
      <p>${coin.price.toFixed(2)} · cap: {coin.cap}</p>
      {coin.tagline && <p><em>{coin.tagline}</em></p>}
      {coin.vision && <p>{coin.vision}</p>}
      <input
        type="number"
        min={coin.price}
        value={investAmounts[coin.id] ?? ''}
        placeholder={`Invest (min $${coin.price})`}
        onChange={e => setInvestAmounts(prev => ({ ...prev, [coin.id]: parseFloat(e.target.value) }))}
        style={{ padding: 8, marginTop: 10, width: '80%' }}
      />
      <button onClick={() => handleBuy(coin)} style={{ marginTop: 8 }}>Buy</button>
    </div>
  )

  return (
    <div style={{ display: 'flex', background: '#000', color: '#fff', minHeight: '100vh' }}>
      <div style={{ flex: 1, padding: 16, borderRight: '1px solid #333' }}>
        <h2 style={{ textAlign: 'center' }}>–1000</h2>
        {coins.filter(c => c.price < 2.0).map(renderCard)}
      </div>
      <div style={{ flex: 1, padding: 16, textAlign: 'center' }}>
        <h1>AURA</h1>
        {myCoin ? renderCard(myCoin) : <p>No coin yet</p>}
      </div>
      <div style={{ flex: 1, padding: 16, borderLeft: '1px solid #333' }}>
        <h2 style={{ textAlign: 'center' }}>+1000</h2>
        {coins.filter(c => c.price >= 2.0 && c.user_id !== user?.id).map(renderCard)}
      </div>
    </div>
  )
}
