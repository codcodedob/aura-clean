// pages/index.tsx

import React, { useEffect, useState, Suspense, lazy } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabaseClient'
import AvatarClothingSelector from '@/components/AvatarClothingSelector'
import Link from 'next/link'
import { FixedSizeList as List } from 'react-window'
import AutoSizer from 'react-virtualized-auto-sizer'

// Placeholder: import these when you create them!
import LiveBanner from '@/components/LiveBanner'
import CompanyPanel from '@/components/CompanyPanel'

const ADMIN_EMAIL = "burks.donte@gmail.com"

const companyDepts = [
  { id: 'art', name: 'Art' },
  { id: 'entertainment', name: 'Entertainment' },
  { id: 'cuisine', name: 'Cuisine' },
  { id: 'fashion', name: 'Fashion' },
  { id: 'health', name: 'Health & Fitness' },
  { id: 'science', name: 'Science & Tech' },
  { id: 'community', name: 'Community Clipboard' }
]

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
  // Add more fields as needed
}

// For avatars
const FocusedAvatar = lazy(() => import('@/components/FocusedAvatar')) as React.LazyExoticComponent<React.ComponentType<{}>>;
const FullBodyAvatar = lazy(() => import('@/components/FullBodyAvatar')) as React.LazyExoticComponent<React.ComponentType<{ modelPaths: string[] }>>;

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
  const [hasMounted, setHasMounted] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [user, setUser] = useState<any>(null)
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
    setHasMounted(true)
    setWindowWidth(window.innerWidth)
    const handleResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // ...other useEffects (for theme, user, coins etc.)
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

  const filteredCoins = coins.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || (c.emoji ?? '').includes(search)
    const matchesType = filter === 'all' || c.type === filter
    return matchesSearch && matchesType
  })
  const othersCoins = filteredCoins.filter(c => c.user_id !== user?.id)
  const featuredCoin = filteredCoins.find(c => c.is_featured)

  const fullBodyModels = [
    '/models/F1VISIONBALNCICHROME.glb',
    '/models/top.glb',
    '/models/bottom.glb',
    '/models/base-inner.glb',
    '/models/base-outer.glb'
  ]

  const toggleMode = () => {
    setMode(prev => prev === 'focused' ? 'full-body' : 'focused')
    setAvatarKey(prev => prev + 1)
  }

  if (!hasMounted) return null

  return (
    <div
      style={{
        display: windowWidth < 800 ? 'block' : 'flex',
        height: '100vh',
        flexDirection: windowWidth < 800 ? 'column' : 'row'
      }}
    >
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
        <div
          style={{
            flex: 1,
            padding: 20,
            overflow: 'hidden',
            display: windowWidth < 800 && activePanel !== 'left' ? 'none' : 'block'
          }}
        >
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
                    const coin =
                      index === 0 && featuredCoin
                        ? featuredCoin
                        : othersCoins[index - (featuredCoin ? 1 : 0)];
                    return (
                      <div style={style} key={coin.id}>
                        <CoinCard
                          coin={coin}
                          amount={investmentAmounts[coin.id] || coin.price}
                          onAmountChange={(id, amt) => setInvestmentAmounts(prev => ({ ...prev, [id]: amt }))}
                          onBuy={() => {/* insert modal logic or direct buy */}}
                        />
                      </div>
                    );
                  }}
                </List>
              )}
            </AutoSizer>
          </div>
        </div>
      )}

      {/* CENTER PANEL */}
      {(windowWidth >= 800 || activePanel === 'center') && (
        <div
          style={{
            flex: 1.1,
            padding: 20,
            display: windowWidth < 800 && activePanel !== 'center' ? 'none' : 'block'
          }}
        >
          <LiveBanner dept="art" />
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

          {/* Wallet Panel */}
          <div style={{ marginTop: 24 }}>
            <h3>Wallet (Dynamic coming soon)</h3>
            {/* You can render wallet info here */}
          </div>
          <div style={{ marginTop: 12 }}>
            <button onClick={() => router.push('/agx-license')}>AGX License</button>
          </div>
          <div style={{ marginTop: 12 }}>
            <button onClick={() => router.push('/contracts')}>Contracts</button>
            <button onClick={() => router.push('/accounts')} style={{ marginLeft: 12 }}>Accounts</button>
            <button onClick={() => router.push('/inbox')} style={{ marginLeft: 12 }}>Inbox</button>
          </div>
          {/* Receipts and Transactions (bottom of panel for mobile/iOS) */}
          <div style={{ marginTop: 36, display: 'flex', justifyContent: 'space-between' }}>
            <button
              onClick={() => router.push('/transactions')}
              style={{
                background: '#0af',
                color: '#000',
                borderRadius: 6,
                padding: '8px 12px',
                fontWeight: 'bold',
                flex: 1,
                marginRight: 8
              }}>
              Transactions
            </button>
            <button
              onClick={() => router.push('/receipts')}
              style={{
                background: '#10b981',
                color: '#fff',
                borderRadius: 6,
                padding: '8px 12px',
                fontWeight: 'bold',
                flex: 1
              }}>
              Receipts
            </button>
          </div>
        </div>
      )}

      {/* RIGHT PANEL: Company Suite */}
      {(windowWidth >= 800 || activePanel === 'right') && (
        <div
          style={{
            flex: 1,
            padding: 20,
            display: windowWidth < 800 && activePanel !== 'right' ? 'none' : 'block'
          }}
        >
          <h2>Company Suite</h2>
          <LiveBanner dept="company" />
          {[
            {
              name: 'Art',
              desc: "Showcase, commission, and join launches from top creators and companies.",
              route: '/department/art'
            },
            {
              name: 'Entertainment',
              desc: "Watch, stream, and contribute to live shows, podcasts, or media projects.",
              route: '/department/entertainment'
            },
            {
              name: 'Cuisine',
              desc: "Find chef partners, popups, and gourmet launches.",
              route: '/department/cuisine'
            },
            {
              name: 'Fashion',
              desc: "Access design launches, order custom fits, or book collab.",
              route: '/department/fashion'
            },
            {
              name: 'Health & Fitness',
              desc: "Connect with trainers, health brands, and wellness events.",
              route: '/department/health'
            },
            {
              name: 'Science & Tech',
              desc: "Partner with tech teams, submit ideas, or find innovation challenges.",
              route: '/department/science'
            },
            {
              name: 'Community Clipboard',
              desc: "Collaborate on city events, education, and outreach.",
              route: '/department/community'
            }
          ].map((dept, i) => (
            <div
              key={i}
              onClick={() => router.push(dept.route)}
              style={{
                marginBottom: 16,
                padding: 16,
                background: '#eee',
                borderRadius: 10,
                cursor: 'pointer',
                boxShadow: '0 2px 8px #0002'
              }}
            >
              <h3 style={{ margin: 0 }}>{dept.name} <span style={{ color: '#0af', marginLeft: 8 }}><LiveBanner dept={dept.name.toLowerCase()} compact /></span></h3>
              <p style={{ margin: 0, fontSize: 15 }}>{dept.desc}</p>
            </div>
          ))}
          {/* Legal/Stripe-required info, always visible */}
          <div style={{ marginTop: 40, background: '#23272e', borderRadius: 12, padding: 18, color: '#fff', fontSize: 14 }}>
            <strong>Business Information</strong>
            <ul style={{ paddingLeft: 18, marginTop: 10 }}>
              <li>Business: <b>Adob Group / Dobe LLC</b></li>
              <li>Email: <a href="mailto:info@dobe.company" style={{ color: '#0af' }}>info@dobe.company</a></li>
              <li>Customer support: (646) 555-5555</li>
              <li>Refund/Return Policy: All digital goods final. Physical returns within 14 days. <a href="/terms" style={{ color: '#0af' }}>Terms</a></li>
              <li>Dispute/Cancel Policy: See our <a href="/terms" style={{ color: '#0af' }}>Terms</a></li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
