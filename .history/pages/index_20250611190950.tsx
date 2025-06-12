import React, { useState, useEffect, CSSProperties } from 'react'
import Image from 'next/image'
import AuthForm from '@/components/AuthForm'
import { supabase } from '@/lib/supabaseClient'
import type { User } from '@supabase/supabase-js'
import { stripePromise } from '@/lib/stripe'

interface Coin {
  id: string
  user_id: string
  name: string
  emoji?: string
  price: number
  cap: number
}

const overlayStyle: CSSProperties = {
  position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
}

const panelStyle: CSSProperties = {
  position: 'absolute', top: 0, width: '25%', height: '100%', padding: 16, overflowY: 'auto',
}

const centerStyle: CSSProperties = {
  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh',
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [coins, setCoins] = useState<Coin[]>([])
  const [creating, setCreating] = useState(false)
  const [buyingId, setBuyingId] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user: u } }) => setUser(u))
    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => setUser(session?.user ?? null))
    return () => listener?.subscription?.unsubscribe()
  }, [])

  useEffect(() => {
    if (!user) return setCoins([])
    void supabase
      .from('aura_coins')
      .select('*')
      .order('price', { ascending: false })
      .then(({ data, error }) => {
        if (error) console.error('[AURA] fetch coins error:', error)
        setCoins(data ?? [])
      })
  }, [user])

  const filtered: Coin[] = coins.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) || (c.emoji ?? '').includes(search)
  )
  const myCoin = user ? filtered.find(c => c.user_id === user.id) : undefined
  const losers = filtered.filter(c => c.price < 2.0)
  const gainers = filtered.filter(c => c.price >= 2.0)

  const createMyCoin = async () => {
    if (!user || myCoin) return alert('You already have an AuraCoin!')
    setCreating(true)
    try {
      const { error } = await supabase.from('aura_coins').insert([{ user_id: user.id, name: user.email!.split('@')[0], price: 1.0, cap: 0 }])
      if (error) throw error
      alert('✨ AuraCoin created!')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      alert(`Error: ${msg}`)
    } finally {
      setCreating(false)
    }
  }

  const handleStripeBuy = async (coin: Coin) => {
    setBuyingId(coin.id)
    try {
      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coinId: coin.id }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Checkout session failed')
      const stripe = await stripePromise
      if (!stripe) throw new Error('Stripe not loaded')
      const { error: stripeError } = await stripe.redirectToCheckout({ sessionId: json.sessionId })
      if (stripeError) throw stripeError
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      alert(`Checkout failed: ${msg}`)
    } finally {
      setBuyingId(null)
    }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  if (!user) {
    return (
      <div style={{ background: '#000', minHeight: '100vh' }}>
        <div style={overlayStyle} role="dialog" aria-modal="true">
          <AuthForm onAuth={() => {}} />
        </div>
      </div>
    )
  }

  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh', position: 'relative' }}>
      <input
        type="text"
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="🔍 Search coins or emoji"
        style={{ position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)', width: '40%', maxWidth: 400, padding: '8px 12px', borderRadius: 6, border: '1px solid #555', background: '#111', color: '#fff', zIndex: 20 }}
      />

      <button
        type="button"
        onClick={logout}
        style={{ position: 'absolute', top: 16, right: 16, background: '#333', color: '#fff', border: 'none', borderRadius: 4, padding: '8px 12px', cursor: 'pointer', zIndex: 10 }}
      >Logout</button>

      {!myCoin && (
        <button
          type="button"
          onClick={createMyCoin}
          disabled={creating}
          style={{ position: 'absolute', top: 64, right: 16, background: '#0a84ff', color: '#fff', border: 'none', borderRadius: 4, padding: '8px 12px', cursor: 'pointer', zIndex: 10 }}
        >{creating ? 'Creating…' : 'Create My AuraCoin'}</button>
      )}

      <section style={{ ...panelStyle, left: 0, background: 'rgba(255,0,0,0.03)', borderRight: '2px solid #fff2' }}>
        <h2 style={{ fontFamily: `'Permanent Marker', cursive`, fontSize: 64, textAlign: 'center', marginBottom: 28, fontWeight: 900, letterSpacing: '-5px' }}>–1000</h2>
        {losers.map(c => (
          <div key={c.id} style={{ background: '#140e10', border: '1px solid #a22', borderRadius: 12, margin: '12px 0', padding: 16, boxShadow: '0 2px 14px #000a' }}>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{c.emoji ?? '👤'} {c.name}</div>
            <div style={{ fontSize: 13 }}>
              <b>${c.price.toFixed(2)}</b> · {c.cap} cap
              <button
                type="button"
                onClick={() => handleStripeBuy(c)}
                disabled={buyingId === c.id}
                style={{ float: 'right', background: '#1e1', color: '#fff', border: 'none', borderRadius: 6, padding: '3px 10px', fontWeight: 600, cursor: 'pointer' }}
              >{buyingId === c.id ? 'Processing…' : 'Buy'}</button>
            </div>
          </div>
        ))}
      </section>

      <section style={{ ...panelStyle, right: 0, background: 'rgba(0,255,0,0.03)', borderLeft: '2px solid #fff2' }}>
        <h2 style={{ fontFamily: `'Permanent Marker', cursive`, fontSize: 64, textAlign: 'center', marginBottom: 28, fontWeight: 900, letterSpacing: '-5px' }}>+1000</h2>
        {gainers.map(c => (
          <div key={c.id} style={{ background: '#101408', border: '1px solid #3a5', borderRadius: 12, margin: '12px 0', padding: 16, boxShadow: '0 2px 14px #000a' }}>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{c.emoji ?? '🔥'} {c.name}</div>
            <div style={{ fontSize: 13 }}>
              <b>${c.price.toFixed(2)}</b> · {c.cap} cap
              <button
                type="button"
                onClick={() => handleStripeBuy(c)}
                disabled={buyingId === c.id}
                style={{ float: 'right', background: '#1e1', color: '#fff', border: 'none', borderRadius: 6, padding: '3px 10px', fontWeight: 600, cursor: 'pointer' }}
              >{buyingId === c.id ? 'Processing…' : 'Buy'}</button>
            </div>
          </div>
        ))}
      </section>

      <div style={centerStyle}>
        <h1 style={{ fontSize: 32, marginBottom: 12 }}>AURA</h1>
        <Image src="/aura-avatar.png" alt="AURA Avatar" width={120} height={120} className="rounded-full" />
        <p style={{ fontSize: 16, color: '#0ff', marginTop: 8 }}>Welcome, <b>{user.email}</b></p>
      </div>
    </main>
  )
}

export async function getServerSideProps() {
  return { props: {} }
}
