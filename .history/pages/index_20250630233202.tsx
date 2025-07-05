// pages/index.tsx
import React, { useEffect, useState, Suspense, lazy } from 'react'
import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'
import { supabase } from '@/lib/supabaseClient'
import AvatarClothingSelector from '@/components/AvatarClothingSelector'
import type { User } from '@supabase/supabase-js'
import Link from 'next/link'
import { FixedSizeList as List } from 'react-window'
import AutoSizer from 'react-virtualized-auto-sizer'
import { motion } from 'framer-motion'

const ADMIN_EMAIL = "burks.donte@gmail.com"

// 3D BG Layer (Three.js) - make sure ThreeBG.tsx is in components and accepts modelUrl!
const ThreeCanvas = dynamic<{ modelUrl: string }>(
  () => import('@/components/ThreeBG').then((mod) => mod.default),
  { ssr: false }
)

const FocusedAvatar = lazy(() => import('@/components/FocusedAvatar')) as React.LazyExoticComponent<React.ComponentType<{}>>
const FullBodyAvatar = lazy(() => import('@/components/FullBodyAvatar')) as React.LazyExoticComponent<React.ComponentType<{ modelPaths: string[] }>>

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

// --- About hover text per dept ---
const aboutMessages: Record<string, string> = {
  Art: "The art of contracts, consulting, finance, communication, and planning and organization, all the important stuff artfully done all in one place for you."
}

function CoinCard({ coin, amount, onAmountChange, onBuy }: {
  coin: Coin,
  amount: number,
  onAmountChange: (id: string, amt: number) => void,
  onBuy: (id: string) => void
}) {
  const [localAmount, setLocalAmount] = useState(amount.toFixed(2))
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null)

  useEffect(() => { setLocalAmount(amount.toFixed(2)) }, [amount])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setLocalAmount(val)
    if (debounceTimer) clearTimeout(debounceTimer)
    const newTimer = setTimeout(() => {
      const num = parseFloat(val)
      if (!isNaN(num)) onAmountChange(coin.id, num)
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
        min={0}
        step="0.01"
        onChange={handleChange}
        style={{ marginTop: 8, padding: 8, width: '80%', borderRadius: 6, border: '1px solid #ccc', background: 'var(--input-bg)', color: 'var(--text-color)' }}
      />
      <button onClick={() => onBuy(coin.id)} style={{ marginTop: 12, padding: '10px 18px', borderRadius: 8, background: '#2563eb', color: '#fff', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>Buy</button>
    </div>
  )
}

export default function Home() {
  // State
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
  const [activePanel, setActivePanel] = useState<'left' | 'center' | 'right'>('center')
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024)
  const [aboutHover, setAboutHover] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

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
      const res = await fetch('https://ofhpjvbmrfwbmboxibur.functions.supabase.co/admin_refresh_coins', { method: 'POST' })
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
    document.documentElement.style.setProperty('--card-bg', darkMode ? '#1f2937' : '#fff')
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

  // PATCH: Support $0 checkout
  const handleBuy = async (coinId: string) => {
    const amount = investmentAmounts[coinId] ?? 0
    const coin = coins.find(c => c.id === coinId)
    if (!coin) return

    const userData = await supabase.auth.getUser()
    const userId = userData.data.user?.id
    if (!userId) {
      alert('Sign in required')
      return
    }

    // Free/discounted/test purchase: Just log and route to receipt
    if (amount === 0) {
      await supabase.from('coin_activity').insert({
        user_id: userId,
        coin_id: coinId,
        type: 'purchase',
        amount,
        description: `Free/discounted purchase for $${amount}`
      })
      router.push('/receipt')
      return
    }

    // Paid: Stripe flow
    await supabase.from('coin_activity').insert({
      user_id: userId,
      coin_id: coinId,
      type: 'purchase',
      amount,
      description: `Intent to purchase $${amount}`
    })

    const res = await fetch('/api/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ coinId, amount, userId })
    })
    const json = await res.json()
    const stripe = (await import('@stripe/stripe-js')).loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
    ;(await stripe)?.redirectToCheckout({ sessionId: json.sessionId })
  }

  // Filtering coins
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

  if (!hasMounted) return null

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {/* --- Background Three.js Canvas --- */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <Suspense fallback={null}>
          <ThreeCanvas modelUrl="/xtime.glb" />
        </Suspense>
      </div>

      {/* LAYOUT */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        display: windowWidth < 800 ? 'block' : 'flex',
        height: '100vh',
        flexDirection: windowWidth < 800 ? 'column' : 'row'
      }}>
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
          <div style={{ flex: 1, padding: 20, overflow: 'hidden', display: windowWidth < 800 && activePanel !== 'left' ? 'none' : 'block' }}>
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
          <div style={{ flex: 1.1, padding: 20, display: windowWidth < 800 && activePanel !== 'center' ? 'none' : 'block' }}>
            <Suspense fallback={<div>Loading Avatar...</div>}>
              {mode === 'focused' ? (
                <FocusedAvatar key={avatarKey} />
              ) : (
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
                  Account ID: <span style={{ fontFamily: 'monospace', fontSize: 13 }}>{user?.id.slice(0, 12)}...</span>
                </p>
                <div style={{ margin: '20px 0' }}>
                  <Link href="/transactions" style={{ color: '#0af', marginRight: 24 }}>Transactions</Link>
                  <Link href="/receipt" style={{ color: '#0af', marginRight: 24 }}>Receipts</Link>
                  {user.email === ADMIN_EMAIL && (
                    <>
                      <Link href="/admin/dashboard" className="text-blue-500 hover:underline" style={{ marginRight: 24 }}>
                        Admin Dashboard
                      </Link>
                      <button
                        onClick={refreshMarketData}
                        disabled={refreshing}
                        style={{
                          padding: '10px 16px',
                          borderRadius: 6,
                          background: refreshing ? '#999' : '#10b981',
                          color: 'white',
                          fontWeight: 'bold',
                          border: 'none',
                          cursor: refreshing ? 'not-allowed' : 'pointer',
                          marginLeft: 12
                        }}
                      >
                        {refreshing ? 'Refreshing...' : 'Manual Market Refresh'}
                      </button>
                      {message && (
                        <p style={{ marginTop: 10, color: message.startsWith('✅') ? 'green' : 'red' }}>
                          {message}
                        </p>
                      )}
                    </>
                  )}
                </div>
                <button
                  onClick={async () => {
                    await supabase.auth.signOut()
                    window.location.reload()
                  }}
                  style={{
                    background: '#0af',
                    color: '#000',
                    borderRadius: 6,
                    padding: '10px 16px',
                    fontWeight: 'bold',
                    marginTop: 16
                  }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        )}

        {/* RIGHT PANEL - Business Suite/Departments */}
        {(windowWidth >= 800 || activePanel === 'right') && (
          <div style={{ flex: 1, padding: 20, display: windowWidth < 800 && activePanel !== 'right' ? 'none' : 'block' }}>
            <h2>Company Suite</h2>
            {[
              { label: 'Art', path: '/business/art', desc: 'Art, AGX, Onboarding, Wallet' },
              { label: 'Entertainment', path: '/business/entertainment', desc: 'Live Shows, Music, Venues' },
              { label: 'Cuisine', path: '/business/cuisine', desc: 'Restaurants, Food Delivery, Catering' },
              { label: 'Fashion', path: '/business/fashion', desc: 'Design, Modeling, Retail' },
              { label: 'Health & Fitness', path: '/business/health', desc: 'Health, Wellness, Fitness' },
              { label: 'Science & Tech', path: '/business/science', desc: 'Tech, R&D, Consulting' },
              { label: 'Community Clipboard', path: '/business/community', desc: 'Volunteer, Events, Forum' }
            ].map((dept, i) => (
              <motion.div
                key={i}
                onClick={() => router.push(dept.path)}
                whileHover={{
                  scale: 1.06,
                  boxShadow: '0 2px 32px #0af4',
                  zIndex: 10
                }}
                style={{
                  marginBottom: 16,
                  padding: 20,
                  background: '#eee',
                  borderRadius: 14,
                  cursor: 'pointer',
                  transition: 'background 0.18s, box-shadow 0.18s',
                  boxShadow: '0 1px 8px #0af2',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center'
                }}
                onMouseEnter={() => setAboutHover(dept.label)}
                onMouseLeave={() => setAboutHover(null)}
              >
                <div style={{ flex: 1 }}>
                  <h3 style={{ display: 'inline', marginRight: 14 }}>{dept.label}</h3>
                  {/* Info icon and tooltip */}
                  {dept.label === "Art" && (
                    <span
                      style={{ marginLeft: 10, color: '#0af', fontWeight: 700, cursor: 'pointer', position: 'relative' }}
                      onClick={e => {
                        e.stopPropagation()
                        router.push('/contracts')
                      }}
                    >
                      <span style={{ fontSize: 18, verticalAlign: 'middle' }}>ℹ️</span>
                      {aboutHover === "Art" && (
                        <span
                          style={{
                            position: 'absolute',
                            left: '130%',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: '#222',
                            color: '#fff',
                            borderRadius: 8,
                            padding: '8px 14px',
                            whiteSpace: 'nowrap',
                            zIndex: 30,
                            fontSize: 14,
                            fontWeight: 500,
                            boxShadow: '0 2px 12px #0003'
                          }}
                        >
                          {aboutMessages.Art}
                        </span>
                      )}
                    </span>
                  )}
                </div>
                <p style={{ margin: 0, color: '#222b' }}>{dept.desc}</p>
              </motion.div>
            ))}
            <Link href="/space">
              <button style={{ marginTop: 18, borderRadius: 8, padding: '8px 28px', background: '#0af', color: '#fff', fontWeight: 700 }}>
                My Space
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
