// pages/index.tsx

import React, { useState, useEffect, CSSProperties } from 'react'
import AuthForm from '@/components/AuthForm'
import { supabase } from '@/lib/supabaseClient'
import type { User } from '@supabase/supabase-js'

interface Coin {
  id: string
  user_id: string
  name: string
  emoji?: string
  price: number
  cap: number
}

const overlayStyle: CSSProperties = {
  position: 'fixed', top: 0, left: 0,
  width: '100vw', height: '100vh',
  backgroundColor: 'rgba(0,0,0,0.6)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 100
}

const panelStyle: CSSProperties = {
  position: 'absolute', top: 0,
  width: '25%', height: '100%',
  padding: 16, overflowY: 'auto'
}

const centerStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100vh'
}

export default function Home() {
  const [user, setUser]     = useState<User | null>(null)
  const [coins, setCoins]   = useState<Coin[]>([])
  const [creating, setCreating] = useState(false)
  const [buyingId, setBuyingId] = useState<string | null>(null)

  // Auth state & subscription
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user: u } }) => setUser(u))
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_e, session) => setUser(session?.user ?? null)
    )
    return () => listener.subscription.unsubscribe()
  }, [])

  // Load coins whenever user changes
  useEffect(() => {
    if (!user) return setCoins([])
    supabase
      .from('aura_coins')
      .select('*')
      .order('price', { ascending: false })
      .then(({ data, error }) => {
        if (error) console.error('[AURA] fetch coins error:', error)
        setCoins(data ?? [])
      })
  }, [user])

  // Helpers
  const myCoin = coins.find(c => c.user_id === user?.id)
  const losers = coins.filter(c => c.price < 2.0)
  const gainers = coins.filter(c => c.price >= 2.0)

  const createMyCoin = async () => {
    if (!user) return
    setCreating(true)
    try {
      const { data, error } = await supabase
        .from('aura_coins')
        .insert([{ user_id: user.id, name: user.email!.split('@')[0], price: 1.0, cap: 0 }])
      if (error) {
        console.error('[AURA] createMyCoin error object:', error)
        alert(`Error creating coin: ${error.message}`)
      } else {
        console.log('[AURA] coin created:', data)
      }
    } catch (err: any) {
      console.error('[AURA] unexpected createMyCoin error:', err)
      alert(`Unexpected error: ${err.message || err}`)
    } finally {
      setCreating(false)
    }
  }

  const buyCoin = async (coin: Coin) => {
    setBuyingId(coin.id)
    try {
      const { data, error } = await supabase
        .from('aura_coins')
        .update({ cap: coin.cap + 1, price: +(coin.price + 0.01).toFixed(2) })
        .eq('id', coin.id)
      if (error) {
        console.error('[AURA] buyCoin error object:', error)
        alert(`Error buying coin: ${error.message}`)
      } else {
        console.log('[AURA] coin updated:', data)
      }
    } catch (err: any) {
      console.error('[AURA] unexpected buyCoin error:', err)
      alert(`Unexpected error: ${err.message || err}`)
    } finally {
      setBuyingId(null)
    }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  // Render
  if (!user) {
    return (
      <div style={{ background: '#000', minHeight: '100vh' }}>
        <div style={overlayStyle}>
          <AuthForm onAuth={() => { /* supabase listener will pick up */ }} />
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: '#000', color: '#fff', minHeight: '100vh', position: 'relative' }}>
      <button
        onClick={logout}
        style={{
          position: 'absolute', top: 16, right: 16,
          background: '#333', color: '#fff',
          border: 'none', borderRadius: 4,
          padding: '8px 12px', cursor: 'pointer', zIndex: 10
        }}
      >
        Logout
      </button>

      {!myCoin && (
        <button
          onClick={createMyCoin}
          disabled={creating}
          style={{
            position: 'absolute', top: 64, right: 16,
            background: '#0a84ff', color: '#fff',
            border: 'none', borderRadius: 4,
            padding: '8px 12px', cursor: 'pointer', zIndex: 10
          }}
        >
          {creating ? 'Creating…' : 'Create My AuraCoin'}
        </button>
      )}

      {/* Left Panel */}
      <div style={{ ...panelStyle, left: 0, background: 'rgba(255,0,0,0.03)', borderRight: '2px solid #fff2' }}>
        <div style={{
          fontFamily: `'Permanent Marker', cursive`,
          fontSize: 64, textAlign: 'center', marginBottom: 28,
          fontWeight: 900, letterSpacing: '-5px'
        }}>–1000</div>
        {losers.map(c => (
          <div key={c.id} style={{
            background: '#140e10', border: '1px solid #a22',
            borderRadius: 12, margin: '12px 0', padding: 16,
            boxShadow: '0 2px 14px #000a'
          }}>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{c.emoji ?? '👤'} {c.name}</div>
            <div style={{ fontSize: 13 }}>
              <b>${c.price.toFixed(2)}</b> · {c.cap} cap
              <button
                onClick={() => buyCoin(c)}
                disabled={buyingId === c.id}
                style={{
                  float: 'right', background: '#1e1', color: '#fff',
                  border: 'none', borderRadius: 6, padding: '3px 10px',
                  fontWeight: 600, cursor: 'pointer'
                }}
              >
                {buyingId === c.id ? 'Buying…' : 'Buy'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Right Panel */}
      <div style={{ ...panelStyle, right: 0, background: 'rgba(0,255,0,0.03)', borderLeft: '2px solid #fff2' }}>
        <div style={{
          fontFamily: `'Permanent Marker', cursive`,
          fontSize: 64, textAlign: 'center', marginBottom: 28,
          fontWeight: 900, letterSpacing: '-5px'
        }}>+1000</div>
        {gainers.map(c => (
          <div key={c.id} style={{
            background: '#101408', border: '1px solid #3a5',
            borderRadius: 12, margin: '12px 0', padding: 16,
            boxShadow: '0 2px 14px #000a'
          }}>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{c.emoji ?? '🔥'} {c.name}</div>
            <div style={{ fontSize: 13 }}>
              <b>${c.price.toFixed(2)}</b> · {c.cap} cap
              <button
                onClick={() => buyCoin(c)}
                disabled={buyingId === c.id}
                style={{
                  float: 'right', background: '#1e1', color: '#fff',
                  border: 'none', borderRadius: 6, padding: '3px 10px',
                  fontWeight: 600, cursor: 'pointer'
                }}
              >
                {buyingId === c.id ? 'Buying…' : 'Buy'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Center */}
      <div style={centerStyle}>
        <h1 style={{ fontSize: 32, marginBottom: 12 }}>AURA</h1>
        <img src="/aura-avatar.png" alt="AURA" style={{
          width: 120, height: 120, borderRadius: '50%',
          boxShadow: '0 0 40px #0ff', marginBottom: 12
        }} />
        <p style={{ fontSize: 16, color: '#0ff', marginBottom: 8 }}>
          Welcome, <b>{user.email}</b>
        </p>
      </div>
    </div>
  )
}

// SSR to ensure auth runs per-request
export async function getServerSideProps() {
  return { props: {} }
}
