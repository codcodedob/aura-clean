
// pages/index.tsx
import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

interface Coin {
  id: string
  name: string
  emoji?: string
  price: number
  cap: number
  user_id: string
}

export default function Home() {
  const [user, setUser] = useState<any>(null)
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

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#000', color: '#fff' }}>
      {/* Left Panel */}
      <div style={{ flex: 1, padding: 20, borderRight: '1px solid #333' }}>
        <h2 style={{ textAlign: 'center' }}>–1000</h2>
        {filteredCoins.map(coin => (
          <CoinCard key={coin.id} coin={coin} investmentAmounts={investmentAmounts} setInvestmentAmounts={setInvestmentAmounts} />
        ))}
      </div>

      {/* Center Panel */}
      <div style={{ flex: 1, padding: 20, borderLeft: '1px solid #333', borderRight: '1px solid #333' }}>
        <h1 style={{ textAlign: 'center' }}>AURA</h1>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search coins"
          style={{ width: '100%', padding: 8, marginBottom: 20 }}
        />
        {user ? (
          <p style={{ textAlign: 'center' }}>User: {user.email}</p>
        ) : (
          <p style={{ textAlign: 'center' }}>Not signed in</p>
        )}
      </div>

      {/* Right Panel */}
      <div style={{ flex: 1, padding: 20, borderLeft: '1px solid #333' }}>
        <h2 style={{ textAlign: 'center' }}>+1000</h2>
        {/* Right panel intentionally left blank */}
      </div>
    </div>
  )
}

function CoinCard({ coin, investmentAmounts, setInvestmentAmounts }: {
  coin: Coin
  investmentAmounts: { [key: string]: number }
  setInvestmentAmounts: React.Dispatch<React.SetStateAction<{ [key: string]: number }>>
}) {
  return (
    <div style={{
      background: '#111', margin: '1rem 0', padding: '1rem', borderRadius: 8, border: '1px solid #555',
      display: 'flex', flexDirection: 'column', alignItems: 'center'
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
      <button style={{ marginTop: 10, padding: '6px 16px' }}>Buy</button>
    </div>
  )
}
