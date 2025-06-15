import React, { useEffect, useState, Suspense, lazy } from 'react'
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
  img_url?: string
  is_featured?: boolean
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
      background: 'var(--card-bg)',
      color: 'var(--text-color)',
      textAlign: 'center'
    }}>
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
          background: 'var(--input-bg)',
          color: 'var(--text-color)'
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
          border: 'none',
          cursor: 'pointer'
        }}
      >
        Buy
      </button>
    </div>
  )
}

export default function Home() {
  const [darkMode, setDarkMode] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [coins, setCoins] = useState<Coin[]>([])
  const [search, setSearch] = useState('')
  const [investmentAmounts, setInvestmentAmounts] = useState<{ [key: string]: number }>({})
  const [mode, setMode] = useState<'focused' | 'full-body'>('focused')
  const [gridMode, setGridMode] = useState(false)
  const [avatarKey, setAvatarKey] = useState(0)
  const router = useRouter()

  const fullBodyModels = [
    '/models/F1VISIONBALNCICHROME.glb',
    '/models/top.glb',
    '/models/bottom.glb',
    '/models/base-inner.glb',
    '/models/base-outer.glb'
  ]

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

  useEffect(() => {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)()
    recognition.continuous = true
    recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase()
      if (transcript.includes('let there be light')) {
        setDarkMode(false)
        speechSynthesis.speak(new SpeechSynthesisUtterance('Light mode activated'))
      } else if (transcript.includes('let there be dark')) {
        setDarkMode(true)
        speechSynthesis.speak(new SpeechSynthesisUtterance('Dark mode activated'))
      } else if (transcript.includes('logout')) {
        supabase.auth.signOut().then(() => window.location.reload())
      }
    }
    recognition.start()
    return () => recognition.stop()
  }, [])

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

  const othersCoins = filteredCoins.filter(c => c.user_id !== user?.id)
  const featuredCoin = filteredCoins.find(c => c.is_featured)

  const toggleMode = () => {
    setMode(prev => prev === 'focused' ? 'full-body' : 'focused')
    setAvatarKey(prev => prev + 1)
  }

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <div style={{ flex: 1, padding: 20, overflow: 'hidden' }}>
        <div style={{ height: '100%' }}>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search coins"
            style={{ padding: 10, borderRadius: 6, width: '100%', marginBottom: 10 }}
          />
          <AutoSizer>
            {({ height, width }) => (
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

      <div style={{ flex: 1.1, padding: 20 }}>
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

        {!user ? (
          <form onSubmit={async (e) => {
            e.preventDefault()
            const email = (e.currentTarget.elements.namedItem('email') as HTMLInputElement).value
            const password = (e.currentTarget.elements.namedItem('password') as HTMLInputElement).value
            const { error } = await supabase.auth.signInWithPassword({ email, password })
            if (error) alert(error.message)
            else window.location.reload()
          }}>
            <input name="email" type="email" required placeholder="Email" />
            <input name="password" type="password" required placeholder="Password" />
            <button type="submit">Login</button>
          </form>
        ) : (
          <button onClick={async () => {
            await supabase.auth.signOut()
            window.location.reload()
          }}>Logout</button>
        )}

        <Link href="/transactions">View Transactions</Link>
      </div>

      <div style={{ flex: 1, padding: 20 }}>
        <h2>Company Suite</h2>
        {['Art', 'Entertainment', 'Cuisine', 'Fashion', 'Health & Fitness', 'Science & Tech', 'Community Clipboard'].map((dept, i) => (
          <div key={i} onClick={() => router.push(`/business/${dept.toLowerCase().replace(/ & | /g, '-')}`)} style={{ marginBottom: 12, padding: 12, background: '#eee', borderRadius: 8 }}>
            <h3>{dept}</h3>
            <p>Explore or contribute to {dept}</p>
          </div>
        ))}
      </div>

      <button
        onClick={() => setDarkMode(!darkMode)}
        style={{ position: 'fixed', top: 10, right: 10, zIndex: 1000 }}
      >
        Toggle {darkMode ? 'Light' : 'Dark'} Mode
      </button>
    </div>
  )
}
