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
    <div style={{
      margin: '1rem 0',
      padding: '1rem',
      borderRadius: 8,
      border: '1px solid #ccc',
      background: '#ffffff',
      color: '#1a1a1a',
      textAlign: 'center',
      boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
    }}>
      <div>
        <strong style={{ fontSize: 18 }}>{coin.emoji ?? '🪙'} {coin.name}</strong>
        <p>${coin.price.toFixed(2)} · cap {coin.cap}</p>
        <input
          type="number"
          value={localAmount}
          min={coin.price}
          step="0.01"
          onChange={handleChange}
          style={{
            marginTop: 8,
            padding: 8,
            width: '80%',
            borderRadius: 6,
            border: '1px solid #ccc',
            background: '#f3f4f6',
            color: '#111',
            fontSize: 16
          }}
        />
        <button
          onClick={() => onBuy(coin.id)}
          style={{
            marginTop: 12,
            padding: '10px 18px',
            borderRadius: 8,
            background: '#2563eb',
            color: '#ffffff',
            fontWeight: 'bold',
            fontSize: 16,
            border: 'none',
            cursor: 'pointer'
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

  const handleBuy = async (coinId: string) => {
    const amount = investmentAmounts[coinId]
    const coin = coins.find(c => c.id === coinId)
    if (!coin || !amount || amount < coin.price) {
      alert(`Enter an amount >= $${coin?.price ?? 0}`)
      return
    }
    const { data } = await supabase.auth.getUser()
    const userId = data.user?.id
    if (!userId) {
      alert('You must be signed in.')
      return
    }
    await supabase.from('coin_activity').insert({
      user_id: userId,
      coin_id: coinId,
      type: 'purchase',
      amount,
      description: `Intent to purchase $${amount} of ${coin.name}`
    })
    const res = await fetch('/api/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ coinId, amount: Math.round(amount * 100) })
    })
    const json = await res.json()
    const stripe = (await import('@stripe/stripe-js')).loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
    ;(await stripe)?.redirectToCheckout({ sessionId: json.sessionId })
  }

  const filteredCoins = coins.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.emoji ?? '').includes(search)
  )
  const featuredCoin = filteredCoins.find(c => c.is_featured)
  const otherCoins = filteredCoins.filter(c => c.user_id !== user?.id)

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f9fafb' }}>
      <div style={{ flex: 1, padding: 20, borderRight: '1px solid #e5e7eb', overflow: 'hidden' }}>
        <h2 style={{ textAlign: 'center', color: '#111827' }}>All Coins</h2>
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #d1d5db', marginBottom: 12 }}
        />
        <div style={{ height: 'calc(100vh - 160px)' }}>
          <AutoSizer>
            {({ height, width }) => (
              <List
                height={height}
                itemCount={otherCoins.length + (featuredCoin ? 1 : 0)}
                itemSize={220}
                width={width}
              >
                {({ index, style }) => {
                  const coin = index === 0 && featuredCoin ? featuredCoin : otherCoins[index - (featuredCoin ? 1 : 0)]
                  return (
                    <LazyRender style={style} key={coin.id}>
                      <CoinCard
                        coin={coin}
                        amount={investmentAmounts[coin.id] || coin.price}
                        onAmountChange={(id, amt) => setInvestmentAmounts(prev => ({ ...prev, [id]: amt }))}
                        onBuy={handleBuy}
                      />
                    </LazyRender>
                  )
                }}
              </List>
            )}
          </AutoSizer>
        </div>
      </div>

      <div style={{ flex: 1.1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 20, borderLeft: '1px solid #e5e7eb', borderRight: '1px solid #e5e7eb', overflowY: 'auto', height: '100vh', backgroundColor: '#ffffff' }}>
        <h1 style={{ color: '#111827' }}>AURA</h1>
        <h1 style={{ color: '#2563eb' }}>dmndx</h1>
        <img
          src="aura-avatar.png"
          id="helmet-hud"
          alt="Aura Helmet HUD"
          onClick={() => {
            const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
            const helmet = document.getElementById('helmet-hud');
            if (helmet) helmet.style.filter = 'drop-shadow(0 0 20px #2563eb)';
            recognition.onresult = (event) => {
              const transcript = event.results[0][0].transcript.toLowerCase();
              if (transcript.includes('logout')) {
                supabase.auth.signOut().then(() => window.location.reload());
              } else if (transcript.includes('buy')) {
                alert('Voice command recognized: buy');
              }
              if (helmet) helmet.style.filter = 'drop-shadow(0 0 8px #2563eb)';
            };
            recognition.start();
          }}
          style={{
            width: '100%',
            maxWidth: 300,
            objectFit: 'contain',
            margin: '20px 0',
            cursor: 'pointer',
            borderRadius: 12,
            filter: 'drop-shadow(0 0 8px #2563eb)'
          }}
        />
        <button onClick={() => {
          setMode(prev => prev === 'focused' ? 'full-body' : 'focused')
          setAvatarKey(prev => prev + 1)
        }} style={{ marginBottom: 20, padding: 8, background: '#f3f4f6', color: '#111827', borderRadius: 6 }}>Toggle Mode</button>
        <Suspense fallback={<div>Loading Avatar...</div>}>
          {mode === 'focused' ? <FocusedAvatar key={avatarKey} /> : <FullBodyAvatar key={avatarKey} />}
        </Suspense>
        <AvatarClothingSelector />

        {!user ? (
          <div style={{ background: '#f9fafb', padding: 20, borderRadius: 12, marginTop: 20, border: '1px solid #d1d5db', width: '100%', maxWidth: 360 }}>
            <h2 style={{ color: '#111827', marginBottom: 12 }}>🔐 Log In</h2>
            <form onSubmit={async (e) => {
              e.preventDefault()
              const form = e.target as HTMLFormElement
              const email = (form.elements.namedItem('email') as HTMLInputElement).value
              const password = (form.elements.namedItem('password') as HTMLInputElement).value
              const { error } = await supabase.auth.signInWithPassword({ email, password })
              if (error) alert(error.message)
              else window.location.reload()
            }}>
              <input name="email" type="email" placeholder="Email" required style={{ width: '100%', padding: 10, marginBottom: 10, border: '1px solid #d1d5db', borderRadius: 6 }} />
              <input name="password" type="password" placeholder="Password" required style={{ width: '100%', padding: 10, marginBottom: 10, border: '1px solid #d1d5db', borderRadius: 6 }} />
              <button type="submit" style={{ background: '#2563eb', color: '#fff', padding: '10px 16px', borderRadius: 6, fontWeight: 'bold' }}>
                Login
              </button>
            </form>
          </div>
        ) : (
          <div style={{ marginTop: 20, background: '#f9fafb', padding: 12, borderRadius: 10, textAlign: 'center', border: '1px solid #d1d5db' }}>
            <p style={{ color: '#111827', marginBottom: 6 }}>Signed in as<br /><strong>{user.email}</strong></p>
            <button onClick={async () => {
              await supabase.auth.signOut()
              window.location.reload()
            }} style={{ background: '#e5e7eb', color: '#111827', padding: '6px 12px', borderRadius: 6, border: '1px solid #d1d5db' }}>
              Logout
            </button>
          </div>
        )}

        <Link href="/transactions" style={{ color: '#2563eb', marginTop: 24 }}>
          View My Transactions
        </Link>
      </div>
    </div>
  )
}
