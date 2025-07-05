// index.tsx
// Includes Alpaca trading integration

import React, { useEffect, useState, Suspense, lazy } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabaseClient'
import AvatarClothingSelector from '@/components/AvatarClothingSelector'
import type { User } from '@supabase/supabase-js'
import Link from 'next/link'
import { FixedSizeList as List } from 'react-window'
import AutoSizer from 'react-virtualized-auto-sizer'

const ADMIN_EMAIL = "burks.donte@gmail.com"

interface Coin {
  id: string
  name: string
  emoji?: string
  price: number
  cap: number
  user_id: string
  img_url?: string
  is_featured?: boolean
  symbol?: string
  type?: 'stock' | 'crypto'
}

const FocusedAvatar = lazy(() => import('@/components/FocusedAvatar'))
const FullBodyAvatar = lazy(() => import('@/components/FullBodyAvatar'))

function CoinCard({ coin, amount, onAmountChange, onBuy }: {
  coin: Coin,
  amount: number,
  onAmountChange: (id: string, amt: number) => void,
  onBuy: (id: string) => void
}) {
  const [localAmount, setLocalAmount] = useState(amount.toFixed(2))
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null)

  useEffect(() => {
    setLocalAmount(amount.toFixed(2))
  }, [amount])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setLocalAmount(val)

    if (debounceTimer) clearTimeout(debounceTimer)

    const newTimer = setTimeout(() => {
      const num = parseFloat(val)
      if (!isNaN(num)) {
        onAmountChange(coin.id, num)
      }
    }, 500)

    setDebounceTimer(newTimer)
  }

  return (
    <div style={{ margin: '1rem 0', padding: '1rem', borderRadius: 8, border: '1px solid #ccc', background: 'var(--card-bg)', color: 'var(--text-color)', textAlign: 'center' }}>
      <strong style={{ fontSize: 18 }}>{coin.emoji ?? '🪙'} {coin.name}</strong>
      <p>${coin.price.toFixed(2)} · cap {coin.cap}</p>
      <input
        type="number"
        value={localAmount}
        min={coin.price}
        step="0.01"
        onChange={handleChange}
        style={{ marginTop: 8, padding: 8, width: '80%', borderRadius: 6, border: '1px solid #ccc', background: 'var(--input-bg)', color: 'var(--text-color)' }}
      />
      <button onClick={() => onBuy(coin.id)} style={{ marginTop: 12, padding: '10px 18px', borderRadius: 8, background: '#2563eb', color: '#ffffff', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>Buy</button>
    </div>
  )
}

export default function Home() {
  // HYDRATION PATCH
  const [hasMounted, setHasMounted] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [coins, setCoins] = useState<Coin[]>([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'stock' | 'crypto'>('all')
  const [investmentAmounts, setInvestmentAmounts] = useState<{ [key: string]: number }>({})
  const [mode, setMode] = useState<'focused' | 'full-body'>('focused')
  const [gridMode, setGridMode] = useState(false)
  const [avatarKey, setAvatarKey] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const [message, setMessage] = useState('')
  const [signupMode, setSignupMode] = useState(false)
  const [signupError, setSignupError] = useState('')
  const router = useRouter()
  const [activePanel, setActivePanel] = useState<'left' | 'center' | 'right'>('center');
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, []);

  useEffect(() => {
    setHasMounted(true)
    setWindowWidth(window.innerWidth)
    const handleResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const fullBodyModels = [
    '/models/F1VISIONBALNCICHROME.glb',
    '/models/top.glb',
    '/models/bottom.glb',
    '/models/base-inner.glb',
    '/models/base-outer.glb'
  ]

  const refreshMarketData = async () => {
    setRefreshing(true)
    setMessage('Refreshing market data...')

    try {
      const res = await fetch('https://ofhpjvbmrfwbmboxibur.functions.supabase.co/admin_refresh_coins', {
        method: 'POST'
      })
      const text = await res.text()
      setMessage(res.ok ? `✅ Refreshed: ${text}` : `❌ Failed: ${text}`)
    } catch (err) {
      console.error(err)
      setMessage('❌ Error occurred while refreshing.')
    } finally {
      setRefreshing(false)
      setTimeout(() => setMessage(''), 5000)
    }
  }

  useEffect(() => {
    document.documentElement.style.setProperty('--card-bg', darkMode ? '#1f2937' : '#ffffff')
    document.documentElement.style.setProperty('--text-color', darkMode ? '#f9fafb' : '#1a1a1a')
    document.documentElement.style.setProperty('--input-bg', darkMode ? '#374151' : '#f3f4f6')
    document.body.style.backgroundColor = darkMode ? '#111827' : '#f9fafb'
  }, [darkMode])

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data?.user ?? null))
  }, [])

  useEffect(() => {
    fetch('/api/coins')
      .then(res => res.json())
      .then(data => setCoins(data || []))
  }, [])

  // PATCHED: Send userId in checkout POST body!
  const handleBuy = async (coinId: string) => {
    const amount = investmentAmounts[coinId]
    if (!amount) return

    const coin = coins.find(c => c.id === coinId)
    if (!coin || amount < coin.price) {
      alert(`Minimum investment is $${coin?.price ?? 0}`)
      return
    }

    const userData = await supabase.auth.getUser()
    const userId = userData.data.user?.id
    if (!userId) {
      alert('Sign in required')
      return
    }

    await supabase.from('coin_activity').insert({
      user_id: userId,
      coin_id: coinId,
      type: 'purchase',
      amount,
      description: `Intent to purchase $${amount}`
    })

    if (coin.symbol && coin.type === 'stock') {
      const alpacaRes = await fetch('/api/alpaca-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol: coin.symbol, qty: 1, side: 'buy' })
      })
      const alpacaJson = await alpacaRes.json()
      if (!alpacaRes.ok) {
        alert(`Alpaca order failed: ${alpacaJson.error || 'Unknown error'}`)
        return
      }
      alert(`✅ Stock order placed for ${coin.symbol}`)
    }

    // --- PATCH: Send userId in body!
    const res = await fetch('/api/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ coinId, amount: Math.round(amount * 100), userId })
    })
    const json = await res.json()
    const stripe = (await import('@stripe/stripe-js')).loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
    ;(await stripe)?.redirectToCheckout({ sessionId: json.sessionId })
  }

  const filteredCoins = coins.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || (c.emoji ?? '').includes(search)
    const matchesType = filter === 'all' || c.type === filter
    return matchesSearch && matchesType
  })

  const othersCoins = filteredCoins.filter(c => c.user_id !== user?.id)
  const featuredCoin = filteredCoins.find(c => c.is_featured)

  const toggleMode = () => {
    setMode(prev => prev === 'focused' ? 'full-body' : 'focused')
    setAvatarKey(prev => prev + 1)
  }

  if (!hasMounted) return null // --- PATCHED FOR HYDRATION

  return (
    <div style={{ display: windowWidth < 800 ? 'block' : 'flex', height: '100vh', flexDirection: windowWidth < 800 ? 'column' : 'row' }}>
      {/* MOBILE TAB BAR */}
      {windowWidth < 800 && (
        <div style={{ display: 'flex', justifyContent: 'space-around', background: '#181825', padding: 10 }}>
          <button onClick={() => setActivePanel('left')} style={{ color: activePanel === 'left' ? '#0af' : '#fff', fontWeight: 'bold', flex: 1 }}>Coins</button>
          <button onClick={() => setActivePanel('center')} style={{ color: activePanel === 'center' ? '#0af' : '#fff', fontWeight: 'bold', flex: 1 }}>Profile</button>
          <button onClick={() => setActivePanel('right')} style={{ color: activePanel === 'right' ? '#0af' : '#fff', fontWeight: 'bold', flex: 1 }}>Suite</button>
        </div>
      )}

      {/* LEFT PANEL */}
      {(windowWidth >= 800 || activePanel === 'left') && (
        <div style={{
          flex: 1,
          padding: 20,
          overflow: 'hidden',
          display: windowWidth < 800 && activePanel !== 'left' ? 'none' : 'block'
        }}>
          <div style={{ height: '100%' }}>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search coins"
              style={{ padding: 10, borderRadius: 6, width: '100%', marginBottom: 10 }}
            />
            <div style={{ marginBottom: 10 }}>
              <button onClick={() => setFilter('all')}>All</button>
              <button onClick={() => setFilter('stock')}>Stocks</button>
              <button onClick={() => setFilter('crypto')}>Crypto</button>
            </div>
            <AutoSizer>
              {({ height, width }: { height: number; width: number }) => (
                <List
                  height={height}
                  itemCount={othersCoins.length + (featuredCoin ? 1 : 0)}
                  itemSize={200}
                  width={width}
                >
                  {({ index, style }) => {
                    const coin = index === 0 && featuredCoin
                      ? featuredCoin
                      : othersCoins[index - (featuredCoin ? 1 : 0)]
                    return (
                      <div style={style} key={coin.id}>
                        <CoinCard
                          coin={coin}
                          amount={investmentAmounts[coin.id] || coin.price}
                          onAmountChange={(id, amt) => setInvestmentAmounts(prev => ({ ...prev, [id]: amt }))}
                          onBuy={handleBuy}
                        />
                      </div>
                    )
                  }}
                </List>
              )}
            </AutoSizer>
          </div>
        </div>
      )}

      {/* CENTER PANEL */}
      {(windowWidth >= 800 || activePanel === 'center') && (
        <div style={{
          flex: 1.1,
          padding: 20,
          display: windowWidth < 800 && activePanel !== 'center' ? 'none' : 'block'
        }}>
          <Suspense fallback={<div>Loading Avatar...</div>}>
            {mode === 'focused' ? <FocusedAvatar key={avatarKey} /> : (
              <FullBodyAvatar key={avatarKey} modelPaths={gridMode ? fullBodyModels : ['/models/full-body.glb']} />
            )}
          </Suspense>
          <button onClick={toggleMode} style={{ marginTop: 12 }}>Toggle Fit</button>
          {mode === 'full-body' && (
            <button onClick={() => setGridMode(!gridMode)} style={{ marginLeft: 10 }}>Layout/Grid View</button>
          )}
          <AvatarClothingSelector />

          {/* AUTH PANEL */}
          {!user ? (
            <div style={{ background: '#181825', padding: 20, borderRadius: 12, marginTop: 20, boxShadow: '0 0 20px #0af', width: '100%', maxWidth: 360 }}>
              <h2 style={{ color: '#0af', marginBottom: 12 }}>{signupMode ? "🟢 Create Account" : "🔐 Log In"}</h2>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setSignupError('');
                  const email = (e.currentTarget.elements.namedItem('email') as HTMLInputElement).value
                  const password = (e.currentTarget.elements.namedItem('password') as HTMLInputElement).value
                  if (signupMode) {
                    const { error } = await supabase.auth.signUp({ email, password })
                    if (error) setSignupError(error.message)
                    else window.location.reload()
                  } else {
                    const { error } = await supabase.auth.signInWithPassword({ email, password })
                    if (error) setSignupError(error.message)
                    else window.location.reload()
                  }
                }}
              >
                <input name="email" type="email" placeholder="Email" required style={{ width: '100%', padding: 10, marginBottom: 10, background: '#222', color: '#fff', border: '1px solid #444', borderRadius: 6 }} />
                <input name="password" type="password" placeholder="Password" required style={{ width: '100%', padding: 10, marginBottom: 10, background: '#222', color: '#fff', border: '1px solid #444', borderRadius: 6 }} />
                <button type="submit" style={{ background: '#0af', color: '#000', padding: '10px 16px', borderRadius: 6, fontWeight: 'bold', width: '100%' }}>
                  {signupMode ? "Create Account" : "Login"}
                </button>
                <button
                  type="button"
                  onClick={() => { setSignupMode(!signupMode); setSignupError('') }}
                  style={{ background: 'transparent', color: '#0af', marginTop: 8, width: '100%' }}
                >
                  {signupMode ? "← Back to Login" : "Need an account? Sign Up"}
                </button>
                {signupError && <div style={{ color: '#ff4d4f', marginTop: 10 }}>{signupError}</div>}
              </form>
            </div>
          ) : (
            // LOGGED IN PANEL
            <div style={{
              background: '#181825',
              padding: 24,
              borderRadius: 12,
              marginTop: 24,
              marginBottom: 24,
              boxShadow: '0 2px 24px #0af3',
              color: '#fff'
            }}>
              <h2 style={{ fontWeight: 600, fontSize: 20, marginBottom: 4 }}>
                👤 Welcome, {user?.email}
              </h2>
              <p style={{ margin: 0, color: '#aaa', fontSize: 14 }}>
                Account ID: <span style={{ fontFamily: 'monos
