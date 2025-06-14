import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import AvatarClothingSelector from '@/components/AvatarClothingSelector'
import type { User } from '@supabase/supabase-js'
import Link from 'next/link'
import { FixedSizeList as List } from 'react-window'
import AutoSizer from 'react-virtualized-auto-sizer'

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
  const [activeInput, setActiveInput] = useState<string | null>(null)

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

  return <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#000', color: '#fff' }}>
    <header style={{ padding: '1rem 2rem', borderBottom: '1px solid #222', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <h1 style={{ fontSize: 24, color: '#0af' }}>🌀 AURA</h1>
      <nav>
        <ul style={{ display: 'flex', gap: '1rem', listStyle: 'none', color: '#aaa', fontSize: 14 }}>
          <li style={{ cursor: 'pointer' }}>Home</li>
          <li style={{ cursor: 'pointer' }}>Explore</li>
          <li style={{ cursor: 'pointer' }}>Profile</li>
        </ul>
      </nav>
    </header>

    <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
      {/* Left Panel */}
      <div style={{ flex: 1, padding: 20, borderRight: '1px solid #333' }}>
        <h2 style={{ textAlign: 'center' }}>All Coins</h2>
        <div style={{ height: '80vh' }}>
          <AutoSizer>
            {({ height, width }) => (
              <List
                height={height}
                itemCount={othersCoins.length}
                itemSize={190}
                width={width}
              >
                {({ index, style }) => (
                  <div style={style} key={othersCoins[index].id}>
                    <CoinCard
                      coin={othersCoins[index]}
                      investmentAmounts={investmentAmounts}
                      setInvestmentAmounts={setInvestmentAmounts}
                      handleBuy={handleStripeBuy}
                      activeInput={activeInput}
                      setActiveInput={setActiveInput}
                    />
                  </div>
                )}
              </List>
            )}
          </AutoSizer>
        </div>
      </div>

      {/* Center + Right Panels omitted for brevity */}
    </div>
  </div>
}

function CoinCard({ coin, investmentAmounts, setInvestmentAmounts, handleBuy, activeInput, setActiveInput }: {
  coin: Coin
  investmentAmounts: { [key: string]: number }
  setInvestmentAmounts: React.Dispatch<React.SetStateAction<{ [key: string]: number }>>
  handleBuy: (coin: Coin) => void
  activeInput: string | null
  setActiveInput: React.Dispatch<React.SetStateAction<string | null>>
}) {
  return (
    <div style={{ background: '#111', margin: '1rem 0', padding: '1rem', borderRadius: 8, border: '1px solid #555', textAlign: 'center' }}>
      <strong style={{ fontSize: 18 }}>{coin.name}</strong>
      <p>${coin.price.toFixed(2)} · cap {coin.cap}</p>
      {activeInput === coin.id && (
        <input
          type="number"
          placeholder="Enter amount"
          min={coin.price}
          value={investmentAmounts[coin.id] ?? ''}
          onChange={e => setInvestmentAmounts(prev => ({ ...prev, [coin.id]: parseFloat(e.target.value) }))}
          style={{ width: '80%', padding: 6, marginTop: 8 }}
        />
      )}
      <button onClick={() => setActiveInput(coin.id)} style={{ marginTop: 10, padding: '6px 16px' }}>
        Buy
      </button>
    </div>
  )
}
