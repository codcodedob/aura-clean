// pages/index.tsx
import React, { useEffect, useState, Suspense, lazy } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabaseClient'
import AvatarClothingSelector from '@/components/AvatarClothingSelector'
import type { User } from '@supabase/supabase-js'
import Link from 'next/link'
import { FixedSizeList as List } from 'react-window'
import AutoSizer from 'react-virtualized-auto-sizer'
import '@/styles/styles.css' // <--- Make sure your styles.css is imported

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
    <div className="coin-card">
      <strong className="coin-card-title">{coin.emoji ?? '🪙'} {coin.name}</strong>
      <p className="coin-card-meta">${coin.price.toFixed(2)} · cap {coin.cap}</p>
      <input
        type="number"
        value={localAmount}
        min={0}
        step="0.01"
        onChange={handleChange}
        className="coin-card-input"
      />
      <button onClick={() => onBuy(coin.id)} className="coin-card-buy-btn">Buy</button>
    </div>
  )
}

export default function Home() {
  // ...state and hooks as before...
  // (Same state vars, fetch logic, etc.)

  // The UI below is classed up for your stylesheet!
  // ----
  // For brevity, here's just the panel structure and key spots to add classes.
  // Insert this into your Home() function render:

  return (
    <div className="home-root">
      {/* LEFT PANEL */}
      <div className="home-panel left-panel">
        {/* Search/filter input and coin list... */}
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="coin-search-input"
          placeholder="Search coins"
        />
        <div className="coin-filter-group">
          <button className="filter-btn" onClick={() => setFilter('all')}>All</button>
          <button className="filter-btn" onClick={() => setFilter('stock')}>Stocks</button>
          <button className="filter-btn" onClick={() => setFilter('crypto')}>Crypto</button>
        </div>
        <AutoSizer>
          {({ height, width }: { height: number; width: number }) => (
            <List
              height={height}
              itemCount={coins.length}
              itemSize={200}
              width={width}
            >
              {({ index, style }) => (
                <div style={style} key={coins[index].id}>
                  <CoinCard
                    coin={coins[index]}
                    amount={investmentAmounts[coins[index].id] || coins[index].price}
                    onAmountChange={(id, amt) => setInvestmentAmounts(prev => ({ ...prev, [id]: amt }))}
                    onBuy={handleBuy}
                  />
                </div>
              )}
            </List>
          )}
        </AutoSizer>
      </div>
      {/* CENTER PANEL */}
      <div className="home-panel center-panel">
        {/* ...avatar and auth panel ... (class up as needed) */}
      </div>
      {/* RIGHT PANEL */}
      <div className="home-panel right-panel">
        <div className="hipsessions-banner">
          <span className="hipsessions-banner-text">
            HIPSessions: Latest art & creative launches, awards, and live events...
          </span>
        </div>
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
          <div
            key={i}
            onClick={() => router.push(dept.path)}
            className="suite-dept-card"
          >
            <h3>{dept.label}</h3>
            <p>{dept.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
