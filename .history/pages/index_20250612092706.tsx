// pages/index.tsx
import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { stripePromise } from '@/lib/stripe'
import type { User } from '@supabase/supabase-js'

interface Coin {
  id: string
  user_id: string
  name: string
  emoji?: string
  price: number
  cap: number
  visible?: boolean
  tagline?: string
  vision?: string
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [coins, setCoins] = useState<Coin[]>([])
  const [page, setPage] = useState(0)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user))
  }, [])

  useEffect(() => {
    if (!user) return
    loadMoreCoins(0)
  }, [user])

  const loadMoreCoins = async (pageToLoad: number) => {
    if (loadingMore || !hasMore) return
    setLoadingMore(true)
    try {
      const res = await fetch(`/api/coins?limit=20&offset=${pageToLoad * 20}`)
      const json = await res.json()
      if (!Array.isArray(json) || json.length === 0) {
        setHasMore(false)
      } else {
        setCoins(prev => [...prev, ...json])
        setPage(pageToLoad + 1)
      }
    } catch (err) {
      console.error('Load coins failed:', err)
    } finally {
      setLoadingMore(false)
    }
  }

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 100 &&
        !loadingMore && hasMore
      ) {
        loadMoreCoins(page)
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [page, loadingMore, hasMore])

  return (
    <div style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>
      <h1 style={{ textAlign: 'center', padding: '1rem' }}>Aura Marketplace</h1>
      <div style={{ padding: '1rem' }}>
        {coins.length === 0 && <p>No coins available yet.</p>}
        {coins.map((coin) => (
          <div key={coin.id} style={{ marginBottom: '1rem', padding: '1rem', border: '1px solid #333' }}>
            <strong>{coin.emoji ?? '🪙'} {coin.name}</strong>
            <p>Price: ${coin.price.toFixed(2)} | Cap: {coin.cap}</p>
            {coin.tagline && <p><em>{coin.tagline}</em></p>}
            {coin.vision && <p>{coin.vision}</p>}
          </div>
        ))}
        {loadingMore && <p style={{ textAlign: 'center' }}>Loading more coins...</p>}
      </div>
    </div>
  )
}
