import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
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
  const router = useRouter()
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
    <div style={{ display: 'flex', minHeight: '100vh', background: 'url(/orchestra-bg.jpg) center/cover no-repeat', color: '#fff', overflow: 'hidden' }}>
      <div style={{ flex: 1, padding: 20, borderRight: '1px solid #333' }}>
        <h2 style={{ textAlign: 'center' }}>All Coins</h2>
        <div style={{ height: '80vh' }}>
          <AutoSizer>
            {({ height, width }) => (
              <List height={height} itemCount={othersCoins.length} itemSize={190} width={width}>
                {({ index, style }) => (
                  <div style={style} key={othersCoins[index].id}>
                    <CoinCard
                      coin={othersCoins[index]}
                      investmentAmounts={investmentAmounts}
                      setInvestmentAmounts={setInvestmentAmounts}
                      handleBuy={handleStripeBuy}
                      router={router}
                    />
                  </div>
                )}
              </List>
            )}
          </AutoSizer>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 20, borderLeft: '1px solid #333', borderRight: '1px solid #333', overflowY: 'auto', maxHeight: '100vh' }}>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search coins"
          style={{ width: '100%', padding: 8, marginBottom: 20, backgroundColor: '#000', color: '#fff', border: '1px solid #444', borderRadius: 6 }}
        />
        <h1>AURA</h1>
        <AvatarClothingSelector />
        {userCoin ? (
          <CoinCard
            coin={userCoin}
            investmentAmounts={investmentAmounts}
            setInvestmentAmounts={setInvestmentAmounts}
            handleBuy={handleStripeBuy}
            router={router}
          />
        ) : (
          <p>You don't have a coin yet.</p>
        )}
        <Link href="/transactions" style={{ color: '#0af', marginTop: 24 }}>
          View My Transactions
        </Link>
      </div>

      <div style={{ flex: 1, padding: 20, borderLeft: '1px solid #333', overflowY: 'auto', maxHeight: '100vh' }}>
        <h2 style={{ textAlign: 'center' }}>Company Suite</h2>
        {['Art', 'Entertainment', 'Cuisine', 'Fashion', 'Health & Fitness', 'Science & Tech', 'Community Clipboard'].map((dept, i) => (
          <div
            key={i}
            onClick={() => router.push(`/business/${dept.toLowerCase().replace(/ & | /g, '-')}`)}
            style={{
              background: '#000',
              marginBottom: 16,
              padding: 16,
              borderRadius: 12,
              border: '1px solid #444',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              cursor: 'pointer',
              boxShadow: '0 0 10px rgba(0,255,0,0.3)'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <h3 style={{ color: '#0af', marginBottom: 8 }}>{dept}</h3>
            <p style={{ color: '#aaa', fontSize: 14 }}>Explore tools or submit content for {dept}</p>
            <button style={{ marginTop: 10, padding: '10px 20px', background: '#0f0', color: '#000', borderRadius: 8, fontWeight: 'bold', border: 'none', boxShadow: '0 0 6px #0f0' }}>Open</button>
          </div>
        ))}
      </div>
    </div>
  )
}

function CoinCard({ coin, investmentAmounts, setInvestmentAmounts, handleBuy, router }: {
  coin: Coin,
  investmentAmounts: { [key: string]: number },
  setInvestmentAmounts: React.Dispatch<React.SetStateAction<{ [key: string]: number }>>,
  handleBuy: (coin: Coin) => void,
  router: any
}) {
  const [showInput, setShowInput] = useState(false)

  return (
    <div
      onClick={() => router.push(`/business/${coin.id}`)}
      onMouseEnter={() => setShowInput(true)}
      onMouseLeave={() => setShowInput(false)}
      style={{
        backgroundImage: `(/s${coin.name}.jpeg)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        border: '1px solid #444',
        borderRadius: 8,
        padding: '1rem',
        margin: '1rem 0',
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        boxShadow: showInput ? '0 0 15px #0f0' : 'none',
        transform: showInput ? 'scale(1.02)' : 'scale(1)',
        color: '#fff'
      }}
    >
      <strong style={{ fontSize: 18 }}>{coin.emoji ?? '🪙'} {coin.name}</strong>
      <p>${coin.price.toFixed(2)} · cap {coin.cap}</p>
      {showInput && (
        <>
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
        </>
      )}
      <div style={{ marginTop: 10, display: 'flex', justifyContent: 'center', gap: '10px' }}>
        <span title="Live Stream" style={{ width: 28, height: 28, borderRadius: '50%', background: '#222', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0af' }}>📺</span>
        <span title="Music" style={{ width: 28, height: 28, borderRadius: '50%', background: '#222', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f0f' }}>🎵</span>
        <span title="Movies" style={{ width: 28, height: 28, borderRadius: '50%', background: '#222', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ff0' }}>🎬</span>
        <span title="Events" style={{ width: 28, height: 28, borderRadius: '50%', background: '#222', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0f0' }}>🎟️</span>
      </div>
    </div>
  )
}
