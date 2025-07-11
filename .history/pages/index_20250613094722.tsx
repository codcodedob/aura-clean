import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import AvatarClothingSelector from '@/components/AvatarClothingSelector'
import type { User } from '@supabase/supabase-js'
import Link from 'next/link'

interface Coin {
  id: string
  name: string
  emoji?: string
  price: number
  cap: number
  user_id: string
}

export default function Home() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
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
      const userData = await supabase.auth.getUser()
      const userId = userData.data.user?.id

      if (!userId) {
        alert('You must be signed in.')
        return
      }

      // ✅ Log intent in coin_activity
      await supabase.from('coin_activity').insert({
        user_id: userId,
        coin_id: coin.id,
        type: 'purchase',
        amount,
        description: `Intent to purchase $${amount} of ${coin.name}`
      })

      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coinId: coin.id, amount: Math.round(amount * 100) })
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Checkout session failed')
      const stripe = (await import('@stripe/stripe-js')).loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
      ;(await stripe)?.redirectToCheckout({ sessionId: json.sessionId })
    } catch (err) {
      console.error('Buy error:', err)
      alert('Purchase failed')
    }
  }

  return (
    <>
    
    {!user && (
    <div style={{
      position: 'absolute', top: 100, right: 50, zIndex: 1000,
      background: '#111', padding: '2rem', borderRadius: '1rem',
      boxShadow: '0 0 20px #000', width: 300
    }}>
      <h2 style={{ marginBottom: '1rem', color: '#0af' }}>Log In</h2>
      <form onSubmit={async (e) => {
        e.preventDefault()
        setError('')
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) setError(error.message)
        else window.location.reload()
      }}>
        <input name="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" style={{ width: '100%', padding: 8, marginBottom: 8 }} required />
        <input name="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" style={{ width: '100%', padding: 8, marginBottom: 12 }} required />
        <button type="submit" style={{ width: '100%', padding: '8px 16px', background: '#0af', color: '#000', borderRadius: 6 }}>Login</button>
        {error && <p style={{ color: 'red', marginTop: 8 }}>{error}</p>}
      </form>
    </div>
  )}
  </>
  <div style={{ display: 'flex', height: '100vh', backgroundColor: '#000', color: '#fff' }}>
      {/* Left Panel: Coin Listings */}
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

      {/* Center Panel: Avatar + Search + User Coin */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 20, borderLeft: '1px solid #333', borderRight: '1px solid #333' }}>
        <h1>AURA</h1>
        <AvatarClothingSelector />
        <p style={{ marginTop: 12 }}>{user?.email || 'Not signed in'}</p>
        <button onClick={async () => { await supabase.auth.signOut(); window.location.href = '/auth'; }} style={{ marginTop: 8, padding: '6px 12px', background: '#222', color: '#fff', border: '1px solid #444', borderRadius: 6 }}>
          Logout
        </button>
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
        <Link href="/transactions" style={{ color: '#0af', marginTop: 24 }}>
          View My Transactions
        </Link>
      </div>

      {/* Right Panel: Company Suite */}
      <div style={{ flex: 1, padding: 20, borderLeft: '1px solid #333' }}>
        <h2 style={{ textAlign: 'center' }}>Company Suite</h2>
        {/* Add services, consulting, contracts here */}
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
