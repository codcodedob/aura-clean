import React, { useEffect, useState, Suspense, lazy } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabaseClient'
import AvatarClothingSelector from '@/components/AvatarClothingSelector'
import type { User } from '@supabase/supabase-js'
import Link from 'next/link'
import { FixedSizeList as List } from 'react-window'
import AutoSizer from 'react-virtualized-auto-sizer'
import { useInView } from 'react-intersection-observer'

interface Coin {
  id: string
  name: string
  emoji?: string
  price: number
  cap: number
  user_id: string
  img_url?: string
  is_featured?: boolean
}

function LazyRender({ children, style }: { children: React.ReactNode, style: React.CSSProperties }) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.15 })
  return <div ref={ref} style={style}>{inView ? children : null}</div>
}

const FocusedAvatar = lazy(() => import('@/components/FocusedAvatar'))
const FullBodyAvatar = lazy(() => import('@/components/FullBodyAvatar'))

function CoinCard({ coin, amount, onAmountChange, onBuy }: {
  coin: Coin,
  amount: number,
  onAmountChange: (id: string, amt: number) => void,
  onBuy: (id: string) => void
}) {
  return (
    <div style={{
      margin: '1rem 0',
      padding: '1rem',
      borderRadius: 8,
      border: '1px solid #999',
      background: '#111',
      color: '#fff',
      textAlign: 'center'
    }}>
      <div>
        <strong style={{ fontSize: 18 }}>{coin.emoji ?? '🪙'} {coin.name}</strong>
        <p>${coin.price.toFixed(2)} · cap {coin.cap}</p>
        <input
          type="number"
          value={amount.toString()}
          min={coin.price}
          step="0.01"
          onChange={(e) => {
            const val = parseFloat(e.target.value)
            if (!isNaN(val)) onAmountChange(coin.id, val)
          }}
          onClick={(e) => e.stopPropagation()}
          style={{
            marginTop: 8,
            padding: 6,
            width: '80%',
            borderRadius: 4,
            border: '1px solid #555',
            background: '#222',
            color: '#fff'
          }}
        />
        <button
          onClick={() => onBuy(coin.id)}
          style={{
            marginTop: 10,
            padding: '8px 16px',
            borderRadius: 6,
            background: '#0af',
            color: '#000',
            fontWeight: 'bold',
            border: 'none'
          }}
        >
          Buy
        </button>
      </div>
    </div>
  )
}

export default function Home() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [coins, setCoins] = useState<Coin[]>([])
  const [search, setSearch] = useState('')
  const [investmentAmounts, setInvestmentAmounts] = useState<{ [key: string]: number }>({})
  const [mode, setMode] = useState<'focused' | 'full-body'>('focused')
  const [avatarKey, setAvatarKey] = useState(0)

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

  const othersCoins = filteredCoins.filter(c => c.user_id !== user?.id)
  const featuredCoin = filteredCoins.find(c => c.is_featured)

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
    <div style={{ display: 'flex', height: '100vh', background: '#fff', color: '#000' }}>
      <div style={{ flex: 1, padding: 20, borderRight: '1px solid #ccc', overflow: 'hidden' }}>
        <h2 style={{ textAlign: 'center' }}>All Coins</h2>
        <div style={{ height: 'calc(100vh - 80px)' }}>
          <AutoSizer>
            {({ height, width }) => (
              <List
                height={height}
                itemCount={othersCoins.length + (featuredCoin ? 1 : 0)}
                itemSize={210}
                width={width}
              >
                {({ index, style }) => {
                  const coin = index === 0 && featuredCoin
                    ? featuredCoin
                    : othersCoins[index - (featuredCoin ? 1 : 0)]
                  return (
                    <LazyRender style={style} key={coin.id}>
                      <CoinCard
                        coin={coin}
                        amount={investmentAmounts[coin.id] || coin.price}
                        onAmountChange={(id, amt) => setInvestmentAmounts(prev => ({ ...prev, [id]: amt }))}
                        onBuy={(id) => {
                          const coinToBuy = coins.find(c => c.id === id)
                          if (coinToBuy) handleStripeBuy(coinToBuy)
                        }}
                      />
                    </LazyRender>
                  )
                }}
              </List>
            )}
          </AutoSizer>
        </div>
      </div>

      <div style={{ flex: 1.1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 20, borderLeft: '1px solid #ccc', borderRight: '1px solid #ccc', overflowY: 'auto', height: '100vh' }}>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search coins"
          style={{ width: '100%', padding: 8, marginBottom: 20, backgroundColor: '#fff', color: '#000', border: '1px solid #ccc', borderRadius: 6 }}
        />
        <h1>AURA</h1>
        <AvatarClothingSelector />
      </div>

      <div style={{ flex: 1, padding: 20, borderLeft: '1px solid #ccc', overflowY: 'auto', height: '100vh' }}>
        <h2 style={{ textAlign: 'center' }}>Company Suite</h2>
        {['Art', 'Entertainment', 'Cuisine', 'Fashion', 'Health & Fitness', 'Science & Tech', 'Community Clipboard'].map((dept, i) => (
          <div
            key={i}
            onClick={() => router.push(`/business/${dept.toLowerCase().replace(/ & | /g, '-')}`)}
            style={{
              background: '#fff',
              marginBottom: 16,
              padding: 16,
              borderRadius: 12,
              border: '1px solid #ccc',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              cursor: 'pointer',
              boxShadow: '0 0 10px rgba(0,0,0,0.1)'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <h3 style={{ color: '#0af', marginBottom: 8 }}>{dept}</h3>
            <p style={{ color: '#333', fontSize: 14 }}>Explore tools or submit content for {dept}</p>
            <button style={{ marginTop: 10, padding: '10px 20px', background: '#0f0', color: '#000', borderRadius: 8, fontWeight: 'bold', border: 'none', boxShadow: '0 0 6px #0f0' }}>Open</button>
          </div>
        ))}
      </div>
    </div>
  )
}
