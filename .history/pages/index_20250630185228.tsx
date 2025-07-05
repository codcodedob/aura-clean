// pages/index.tsx
import React, { useEffect, useState, Suspense, lazy } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabaseClient'
import AvatarClothingSelector from '@/components/AvatarClothingSelector'
import type { User } from '@supabase/supabase-js'
import Link from 'next/link'
import { FixedSizeList as List } from 'react-window'
import AutoSizer from 'react-virtualized-auto-sizer'
import MotionSection from '@/components/MotionSection'
import MotionCard from '@/components/MotionCard'
import '@/styles/motion.css'

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

const FocusedAvatar = lazy(() => import('@/components/FocusedAvatar')) as React.LazyExoticComponent<React.ComponentType<{}>>
const FullBodyAvatar = lazy(() => import('@/components/FullBodyAvatar')) as React.LazyExoticComponent<React.ComponentType<{ modelPaths: string[] }>>

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
    <MotionCard title={coin.name}>
      <div style={{ textAlign: 'center' }}>
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
        <button onClick={() => onBuy(coin.id)} style={{ marginTop: 12, padding: '10px 18px', borderRadius: 8, background: '#2563eb', color: '#ffffff', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>Buy</button>
      </div>
    </MotionCard>
  )
}
export default function Home() {
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

  // PATCH: $0 purchases OK
  const handleBuy = async (coinId: string) => {
    const amount = investmentAmounts[coinId] ?? 0
    const coin = coins.find(c => c.id === coinId)
    if (!coin) return
    // ...existing handleBuy logic unchanged...
    // (Insert your real Stripe/cashapp/etc code here as before)
  }

  if (!hasMounted) return null
  return (
    <main>
      <MotionSection>
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
          <MotionCard title="Market Coins">
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
                  itemCount={coins.length}
                  itemSize={200}
                  width={width}
                >
                  {({ index, style }) => {
                    const coin = coins[index]
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
          </MotionCard>
        )}

        {/* CENTER PANEL */}
        {(windowWidth >= 800 || activePanel === 'center') && (
          <MotionCard title="Your Profile">
            <Suspense fallback={<div>Loading Avatar...</div>}>
              {mode === 'focused' ? (
                <FocusedAvatar key={avatarKey} />
              ) : (
                <FullBodyAvatar key={avatarKey} modelPaths={gridMode ? fullBodyModels : ['/models/full-body.glb']} />
              )}
            </Suspense>
            <button onClick={() => setMode(mode === 'focused' ? 'full-body' : 'focused')} style={{ marginTop: 12 }}>
              Toggle Fit
            </button>
            {mode === 'full-body' && (
              <button onClick={() => setGridMode(!gridMode)} style={{ marginLeft: 10 }}>Layout/Grid View</button>
            )}
            <AvatarClothingSelector />

            {!user ? (
              <MotionCard title="Sign In or Create Account">
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
              </MotionCard>
            ) : (
              <MotionCard title="Account">
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
                </button><div className="hipsession-banner">
  <div className="hipsession-banner-inner">
    📰 HIPSessions: Latest launches & news in {dept.label}
  </div>
</div>

              </MotionCard>
            )}
          </MotionCard>
        )}

        {/* RIGHT PANEL - Animated Department Suite */}
        {(windowWidth >= 800 || activePanel === 'right') && (
          <MotionSection>
            
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
              <MotionCard
                title={dept.label}
                key={i}
              >
                <p>{dept.desc}</p>
                <Link href={dept.path}>
                  <span style={{
                    color: '#0af',
                    textDecoration: 'underline',
                    cursor: 'pointer'
                  }}>
                    Explore {dept.label}
                  </span>
                </Link>
                {/* HIPSessions News Banner */}
                <div style={{ marginTop: 8, background: '#0af2', padding: 8, borderRadius: 6 }}>
                  <strong>HIPSessions:</strong> Latest launches &amp; news in {dept.label}
                </div>
              </MotionCard>
            ))}
          </MotionSection>
        )}
      </MotionSection>
    </main>
  )
}
