import React, { useEffect, useState } from 'react'
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
  glb_model?: string
}

function LazyRender({ children, style }: { children: React.ReactNode, style: React.CSSProperties }) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.15 })
  return <div ref={ref} style={style}>{inView ? children : null}</div>
}

function CoinCard({
  coin,
  investmentAmounts,
  setInvestmentAmounts,
  handleBuy,
  router
}: {
  coin: Coin,
  investmentAmounts: { [key: string]: number },
  setInvestmentAmounts: React.Dispatch<React.SetStateAction<{ [key: string]: number }>>,
  handleBuy: (coin: Coin) => void,
  router: any
}) {
  const [showInput, setShowInput] = useState(false)
  return (
    <div style={{
      background: 'rgba(0,0,0,0.4)',
      backdropFilter: 'blur(8px)',
      padding: '1rem',
      margin: '1rem 0',
      borderRadius: 12,
      border: '1px solid #444',
      textAlign: 'center',
      position: 'relative',
      color: '#fff'
    }}>
      <div style={{ fontSize: 18, fontWeight: 'bold' }}>{coin.emoji ?? '🪙'} {coin.name}</div>
      <p>${coin.price.toFixed(2)} · cap {coin.cap}</p>

      {showInput && (
        <input
          type="number"
          placeholder="Enter amount"
          min={coin.price}
          value={investmentAmounts[coin.id] ?? ''}
          onChange={e => setInvestmentAmounts(prev => ({ ...prev, [coin.id]: parseFloat(e.target.value) }))}
          style={{ width: '80%', padding: 6, marginTop: 8 }}
        />
      )}

      <button onClick={() => showInput ? handleBuy(coin) : setShowInput(true)}
        style={{ marginTop: 10, padding: '6px 16px', background: '#0af', color: '#000', borderRadius: 6, border: 'none', fontWeight: 'bold' }}>
        {showInput ? 'Confirm Purchase' : 'Buy'}
      </button>

      <div style={{ marginTop: 10, display: 'flex', justifyContent: 'center', gap: '10px' }}>
        <span title="Live Stream" style={{ width: 28, height: 28, borderRadius: '50%', background: '#222', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0af' }}>📺</span>
        <span title="Music" style={{ width: 28, height: 28, borderRadius: '50%', background: '#222', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f0f' }}>🎵</span>
        <span title="Movies" style={{ width: 28, height: 28, borderRadius: '50%', background: '#222', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ff0' }}>🎬</span>
        <span title="Events" style={{ width: 28, height: 28, borderRadius: '50%', background: '#222', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0f0' }}>🎟️</span>
      </div>

      {coin.glb_model && (
        <model-viewer
          src={coin.glb_model}
          alt="3D Coin Model"
          auto-rotate
          camera-controls
          style={{ width: '100%', height: 240, marginTop: 12 }}
        />
      )}
    </div>
  )
}

export default function Home() {
  // ... rest of your code remains unchanged, including <CoinCard /> usage
}
