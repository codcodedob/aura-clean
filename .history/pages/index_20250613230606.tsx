import React, { useEffect, useState, useRef } from 'react'
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
  const appRef = useRef<HTMLDivElement>(null)
  const [inactive, setInactive] = useState(false)
  const [activeInputs, setActiveInputs] = useState<{ [key: string]: boolean }>({})

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data?.user ?? null))
  }, [])

  useEffect(() => {
    fetch('/api/coins')
      .then(res => res.json())
      .then(data => setCoins(data || []))
      .catch(err => console.error('Failed to load coins', err))
  }, [])

  useEffect(() => {
    let timeout: NodeJS.Timeout
    const resetTimer = () => {
      clearTimeout(timeout)
      setInactive(false)
      timeout = setTimeout(() => setInactive(true), 60000)
    }
    window.addEventListener('mousemove', resetTimer)
    window.addEventListener('keydown', resetTimer)
    resetTimer()
    return () => {
      window.removeEventListener('mousemove', resetTimer)
      window.removeEventListener('keydown', resetTimer)
    }
  }, [])

  const filteredCoins = coins.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.emoji ?? '').includes(search)
  )

  const userCoin = filteredCoins.find(c => c.user_id === user?.id)
  const sponsoredCoin = filteredCoins.find(c => c.name.toLowerCase().includes('sponsored'))
  const othersCoins = filteredCoins.filter(c => c.user_id !== user?.id && c !== sponsoredCoin)

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

  return (
    <div ref={appRef} style={{ opacity: inactive ? 0.25 : 1, transition: 'opacity 0.5s ease-in-out', display: 'flex', minHeight: '100vh', backgroundColor: '#000', color: '#fff', overflow: 'hidden' }}>
      {/* Left Panel */}
      <div style={{ flex: 1, padding: 20, borderRight: '1px solid #333' }}>
        <h2 style={{ textAlign: 'center' }}>All Coins</h2>
        {sponsoredCoin && (
          <div style={{ marginBottom: '1rem' }}>
            <CoinCard
              coin={sponsoredCoin}
              investmentAmounts={investmentAmounts}
              setInvestmentAmounts={setInvestmentAmounts}
              handleBuy={handleStripeBuy}
              isSponsored
              activeInputs={activeInputs}
              setActiveInputs={setActiveInputs}
            />
          </div>
        )}
        <div style={{ height: '80vh' }}>
          <AutoSizer>
            {({ height, width }) => (
              <List
                height={height}
                itemCount={othersCoins.length}
                itemSize={180}
                width={width}
              >
                {({ index, style }) => (
                  <div style={style} key={othersCoins[index].id}>
                    <CoinCard
                      coin={othersCoins[index]}
                      investmentAmounts={investmentAmounts}
                      setInvestmentAmounts={setInvestmentAmounts}
                      handleBuy={handleStripeBuy}
                      activeInputs={activeInputs}
                      setActiveInputs={setActiveInputs}
                    />
                  </div>
                )}
              </List>
            )}
          </AutoSizer>
        </div>
      </div>

      {/* Center Panel */}
      <div style={{ flex: 1, padding: 20, borderLeft: '1px solid #333', borderRight: '1px solid #333', overflowY: 'auto' }}>
        <h1 style={{ textAlign: 'center' }}>AURA</h1>
        <AvatarClothingSelector />
        {userCoin ? (
          <CoinCard
            coin={userCoin}
            investmentAmounts={investmentAmounts}
            setInvestmentAmounts={setInvestmentAmounts}
            handleBuy={handleStripeBuy}
            activeInputs={activeInputs}
            setActiveInputs={setActiveInputs}
          />
        ) : (
          <p style={{ textAlign: 'center' }}>You don&apos;t have a coin yet.</p>
        )}
        <Link href="/transactions" style={{ color: '#0af', display: 'block', textAlign: 'center', marginTop: 24 }}>
          View My Transactions
        </Link>
      </div>

      {/* Right Panel */}
      <div style={{ flex: 1, padding: 20, borderLeft: '1px solid #333', overflowY: 'auto' }}>
        <h2 style={{ textAlign: 'center' }}>Company Suite</h2>
        {["Art", "Entertainment", "Cuisine", "Fashion", "Health & Fitness", "Science & Tech", "Community Clipboard"].map((dept, i) => (
          <div key={i} style={{ background: '#222', marginBottom: 16, padding: 16, borderRadius: 10, border: '1px solid #0af' }}>
            <h3 style={{ color: '#0af' }}>{dept}</h3>
            <p style={{ color: '#ccc', fontSize: 14 }}>Sponsored tool for {dept} development.</p>
            <button style={{ marginTop: 10, padding: '8px 16px', background: '#0af', color: '#000', borderRadius: 6 }}>Open</button>
          </div>
        ))}
      </div>
    </div>
  )
}

function CoinCard({ coin, investmentAmounts, setInvestmentAmounts, handleBuy, isSponsored, activeInputs, setActiveInputs }: { coin: Coin; investmentAmounts: { [key: string]: number }; setInvestmentAmounts: React.Dispatch<React.SetStateAction<{ [key: string]: number }>>; handleBuy: (coin: Coin) => void; isSponsored?: boolean; activeInputs: { [key: string]: boolean }; setActiveInputs: React.Dispatch<React.SetStateAction<{ [key: string]: boolean }>> }) {
  return (
    <div style={{ background: '#111', padding: '1rem', borderRadius: 8, border: '1px solid #444', position: 'relative' }}>
      {isSponsored && (
        <div style={{ position: 'absolute', top: 8, right: 12, fontSize: 12, color: '#888' }}>Featured • Sponsored</div>
      )}
      <strong style={{ fontSize: 18 }}>{coin.name}</strong>
      <p>${coin.price.toFixed(2)} · cap {coin.cap}</p>
      {activeInputs[coin.id] && (
        <input
          type="number"
          placeholder="Enter amount"
          min={coin.price}
          value={investmentAmounts[coin.id] ?? ''}
          onChange={e => setInvestmentAmounts(prev => ({ ...prev, [coin.id]: parseFloat(e.target.value) }))}
          style={{ width: '100%', padding: 6, marginTop: 8 }}
        />
      )}
      <button onClick={() => setActiveInputs(prev => ({ ...prev, [coin.id]: true }))} style={{ marginTop: 10, padding: '6px 16px', width: '100%' }}>
        Buy
      </button>
      <div style={{ marginTop: 10, display: 'flex', justifyContent: 'center', gap: '10px' }}>
        <span title="Live Stream" style={{ width: 28, height: 28, borderRadius: '50%', background: '#222', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0af' }}>📺</span>
        <span title="Music" style={{ width: 28, height: 28, borderRadius: '50%', background: '#222', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f0f' }}>🎵</span>
        <span title="Movies" style={{ width: 28, height: 28, borderRadius: '50%', background: '#222', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ff0' }}>🎬</span>
        <span title="Events" style={{ width: 28, height: 28, borderRadius: '50%', background: '#222', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0f0' }}>🎟️</span>
      </div>
    </div>
  )
}
