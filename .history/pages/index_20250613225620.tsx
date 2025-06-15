import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import AvatarClothingSelector from '@/components/AvatarClothingSelector'
import type { User } from '@supabase/supabase-js'
import Link from 'next/link'
import { FixedSizeList as List } from 'react-window'
import AutoSizer from 'react-virtualized-auto-sizer'
// types/react-virtualized-auto-sizer.d.ts
//declare module 'react-virtualized-auto-sizer'

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

      // ✅ Log intent in coin_activity
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
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#000', color: '#fff', overflow: 'hidden' }}>
      {/* Left Panel: Coin Listings */}
      <div style={{ flex: 1, padding: 20, borderRight: '1px solid #333' }}>
        <h2 style={{ textAlign: 'center' }}>All Coins</h2>
        <div style={{ height: '80vh' }}>
  <AutoSizer>
    {({ height, width }) => (
      <List
        height={height}
        itemCount={othersCoins.length}
        itemSize={190}
        width={width}
      >
        {({ index, style }) => (
          <div style={style} key={othersCoins[index].id}>
            <CoinCard
              coin={othersCoins[index]}
              investmentAmounts={investmentAmounts}
              setInvestmentAmounts={setInvestmentAmounts}
              handleBuy={handleStripeBuy}
            />
          </div>
        )}
      </List>
    )}
  </AutoSizer>
</div>
      </div>

      {/* Center Panel: Avatar + Search + User Coin */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 20, borderLeft: '1px solid #333', borderRight: '1px solid #333', overflowY: 'auto', maxHeight: '100vh' }}>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search coins"
          style={{ width: '100%', padding: 8, marginBottom: 20, backgroundColor: '#000', color: '#fff', border: '1px solid #444', borderRadius: 6 }}
        />
        <h1>AURA</h1>
        <img
          src="aura-avatar.png" id="helmet-hud"
          alt="Aura Helmet HUD"
          onClick={() => {
            const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
            const helmet = document.getElementById('helmet-hud');
            if (helmet) helmet.style.filter = 'drop-shadow(0 0 20px #0f0)';
            recognition.onresult = (event) => {
              const transcript = event.results[0][0].transcript.toLowerCase();
              if (transcript.includes('logout')) {
                supabase.auth.signOut().then(() => window.location.reload());
              } else if (transcript.includes('buy')) {
                alert('Voice command recognized: buy');
              } else {
                alert('Voice recognized: ' + transcript);
              }
              if (helmet) helmet.style.filter = 'drop-shadow(0 0 8px #0f0)';
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
            filter: 'drop-shadow(0 0 8px #0f0)'
          }}
        />
        <div style={{ width: 300, height: 300, margin: '20px 0' }}>
          <aura-avatar style={{ width: '100%', height: '100%' }} />
          {!user ? (
  <div style={{
    position: 'absolute',
    top: '20%',
    left: '50%',
    transform: 'translateX(-50%)',
    background: '#111',
    padding: '2rem',
    borderRadius: 12,
    boxShadow: '0 0 30px #000',
    width: 320,
    textAlign: 'center',
    zIndex: 9999
  }}>
    <h2 style={{ color: '#0af', marginBottom: 12 }}>🔐 Log In</h2>
    <form onSubmit={async (e) => {
      e.preventDefault()
      const form = e.target as HTMLFormElement
      const email = (form.elements.namedItem('email') as HTMLInputElement).value
      const password = (form.elements.namedItem('password') as HTMLInputElement).value
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) alert(error.message)
      else window.location.reload()
    }}>
      <input name="email" type="email" placeholder="Email" required
        style={{ width: '100%', padding: 10, marginBottom: 10, background: '#222', color: '#fff', border: '1px solid #444', borderRadius: 6 }} />
      <input name="password" type="password" placeholder="Password" required
        style={{ width: '100%', padding: 10, marginBottom: 10, background: '#222', color: '#fff', border: '1px solid #444', borderRadius: 6 }} />
      <button type="submit"
        style={{ background: '#0af', color: '#000', padding: '10px 16px', borderRadius: 6, fontWeight: 'bold' }}>
        Login
      </button>
    </form>
  </div>
) : (
  <div style={{
    position: 'absolute',
    top: 20,
    right: 20,
    background: '#111',
    padding: '0.75rem 1rem',
    borderRadius: 8,
    border: '1px solid #333',
    zIndex: 9999
  }}>
    <p style={{ color: '#aaa', marginBottom: 6 }}>Signed in as<br /><strong>{user.email}</strong></p>
    <button onClick={async () => {
      await supabase.auth.signOut()
      window.location.reload()
    }} style={{ background: '#222', color: '#fff', padding: '6px 12px', borderRadius: 6, border: '1px solid #444' }}>
      Logout
    </button>
  </div>
)}

        </div>
        <AvatarClothingSelector />
        <p style={{ marginTop: 12 }}>{user?.email || 'Not signed in'}</p>
        <button onClick={async () => { await supabase.auth.signOut(); window.location.replace('/login'); }} style={{ marginTop: 8, padding: '6px 12px', background: '#222', color: '#fff', border: '1px solid #444', borderRadius: 6 }}>
          Logout
        </button>
       
        {userCoin ? (
          <CoinCard
            coin={userCoin}
            investmentAmounts={investmentAmounts}
            setInvestmentAmounts={setInvestmentAmounts}
            handleBuy={handleStripeBuy}
          />
        ) : (
          <p>You don't have a coin yet.</p>
        )}
        <Link href="/transactions" style={{ color: '#0af', marginTop: 24 }}>
          View My Transactions
        </Link>
      </div>

      {/* Right Panel: Company Suite */}
      <div style={{ flex: 1, padding: 20, borderLeft: '1px solid #333', overflowY: 'auto', maxHeight: '100vh' }}>
  <h2 style={{ textAlign: 'center' }}>Company Suite</h2>
  {[' Art', ' Entertainment', ' Cuisine', ' Fashion', ' Health & Fitness', 'Science & Tech', ' Community Clipboard'].map((dept, i) => (
    <div key={i} style={{ background: 'linear-gradient(135deg, #1a1a1a, #222)', marginBottom: 16, padding: 16, borderRadius: 12, border: '1px solid #0f0', boxShadow: '0 0 12px rgba(0, 255, 0, 0.2)' }}>
      <h3 style={{ color: '#0af', marginBottom: 8 }}>{dept}</h3>
      <p style={{ color: '#aaa', fontSize: 14 }}>Explore tools, templates, or submit content in the {dept.split(' ')[1]} department.</p>
      <button style={{ marginTop: 10, padding: '10px 20px', background: '#0f0', color: '#000', borderRadius: 8, fontWeight: 'bold', border: 'none', boxShadow: '0 0 6px #0f0' }}>Open</button>
    </div>
  ))}
</div>
    </div>
  )
}

function CoinCard({
  coin,
  investmentAmounts,
  setInvestmentAmounts,
  handleBuy
}: {
  coin: Coin
  investmentAmounts: { [key: string]: number }
  setInvestmentAmounts: React.Dispatch<React.SetStateAction<{ [key: string]: number }>>
  handleBuy: (coin: Coin) => void
}) {
  return (
    <div style={{
      background: '#111', margin: '1rem 0', padding: '1rem',
      borderRadius: 8, border: '1px solid #555', textAlign: 'center'
    }}>
      <strong style={{ fontSize: 18 }}>{coin.emoji ?? '🪙'} {coin.name}</strong>
      <p>${coin.price.toFixed(2)} · cap {coin.cap}</p>
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
      <div style={{ marginTop: 10, display: 'flex', justifyContent: 'center', gap: '10px' }}>
        <span title="Live Stream" style={{ width: 28, height: 28, borderRadius: '50%', background: '#222', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0af' }}>📺</span>
        <span title="Music" style={{ width: 28, height: 28, borderRadius: '50%', background: '#222', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f0f' }}>🎵</span>
        <span title="Movies" style={{ width: 28, height: 28, borderRadius: '50%', background: '#222', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ff0' }}>🎬</span>
        <span title="Events" style={{ width: 28, height: 28, borderRadius: '50%', background: '#222', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0f0' }}>🎟️</span>
      </div>
    </div>
  )
}
