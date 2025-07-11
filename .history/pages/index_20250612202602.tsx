
// pages/index.tsx
import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { stripePromise } from '@/lib/stripe'
import type { User } from '@supabase/supabase-js'
import Link from 'next/link'
import Image from 'next/image'

interface Coin {
  id: string
  name: string
  emoji?: string
  price: number
  cap: number
  user_id: string
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [coins, setCoins] = useState<Coin[]>([])
  const [search, setSearch] = useState('')
  const [investmentAmounts, setInvestmentAmounts] = useState<{ [key: string]: number }>({})

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data?.user ?? null))
  }, [])

  useEffect(() => {
    fetch('/api/coins')
      .then(res => res.json())
      .then(data => setCoins(data || []))
      .catch(err => console.error('Failed to load coins', err))
  }, [])

  const filteredCoins = coins.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.emoji ?? '').includes(search)
  )

  const userCoin = filteredCoins.find(c => c.user_id === user?.id)
  const othersCoins = filteredCoins.filter(c => c.user_id !== user?.id)

  const handleStripeBuy = async (coin: Coin) => {
    const amount = investmentAmounts[coin.id]
    if (!amount || amount < coin.price) {
      alert(`Minimum investment is $${coin.price}`)
      return
    }

    try {
      const stripe = await stripePromise
      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coinId: coin.id, amount: Math.round(amount * 100) })
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Checkout session failed')
      await stripe?.redirectToCheckout({ sessionId: json.sessionId })
    } catch (err) {
      console.error('Buy error:', err)
      alert('Purchase failed')
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#000', color: '#fff' }}>
      {/* Left Panel */}
      <div style={{ flex: 1, padding: 20, borderRight: '1px solid #333' }}>
        <h2 style={{ textAlign: 'center' }}>All Coins</h2>
        {othersCoins.map(coin => (
          <CoinCard
            key={coin.id}
            coin={coin}
            investmentAmounts={investmentAmounts}
            setInvestmentAmounts={setInvestmentAmounts}
            handleBuy={handleStripeBuy}
          />
        ))}
      </div>

      {/* Center Panel */}
      <div style={{ flex: 1, padding: 20, borderLeft: '1px solid #333', borderRight: '1px solid #333', textAlign: 'center' }}>
        <h1>AURA</h1>
        <Image src="/aura-avatar.png" width={100} height={100} alt="avatar" style={{ borderRadius: '50%' }} />
        <p>{user?.email || 'Not signed in'}</p>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search coins"
          style={{ width: '100%', padding: 8, marginTop: 16, marginBottom: 20 }}
        />
        {userCoin ? (
          <CoinCard
            coin={userCoin}
            investmentAmounts={investmentAmounts}
            setInvestmentAmounts={setInvestmentAmounts}
            handleBuy={handleStripeBuy}
          />
        ) : (
          <p>You don't have a coin yet.</p>
        )}
        <Link href="/transactions" style={{ color: '#0af', marginTop: 24, display: 'inline-block' }}>
          View My Transactions
        </Link>
      </div>

      {/* Right Panel */}
      <div style={{ flex: 1, padding: 20, borderLeft: '1px solid #333' }}>
        <h2 style={{ textAlign: 'center' }}>Reserved</h2>
      </div>
    </div>
  )
}
import AvatarClothingSelector from '@/components/AvatarClothingSelector'

export default function Home() {
  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      
      {/* Left Panel */}
      <div style={{ flex: 1, borderRight: '1px solid #333' }}>
        {/* other content */}
      </div>

      {/* Center Panel */}
      <div style={{ flex: 1 }}>
        <AvatarClothingSelector />
      </div>

      {/* Right Panel */}
      <div style={{ flex: 1, borderLeft: '1px solid #333' }}>
        {/* company suite */}
      </div>

    </div>
  )
}

function CoinCard({
  coin,
  investmentAmounts,
  setInvestmentAmounts,
  handleBuy
}: {
  coin: Coin
  investmentAmounts: { [key: string]: number }
  setInvestmentAmounts: React.Dispatch<React.SetStateAction<{ [key: string]: number }>>
  handleBuy: (coin: Coin) => void
}) {
  return (
    <div style={{
      background: '#111', margin: '1rem 0', padding: '1rem',
      borderRadius: 8, border: '1px solid #555', textAlign: 'center'
    }}>
      <strong style={{ fontSize: 18 }}>{coin.emoji ?? '🪙'} {coin.name}</strong>
      <p>${coin.price.toFixed(2)} · cap {coin.cap}</p>
      <input
        type="number"
        placeholder="Enter amount"
        min={coin.price}
        value={investmentAmounts[coin.id] ?? ''}
        onChange={e => setInvestmentAmounts(prev => ({ ...prev, [coin.id]: parseFloat(e.target.value) }))}
        style={{ width: '80%', padding: 6, marginTop: 8 }}
      />
      <button onClick={() => handleBuy(coin)} style={{ marginTop: 10, padding: '6px 16px' }}>
        Buy
      </button>
    </div>
  )
}
