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
      background: '#f9f9f9',
      color: '#222',
      textAlign: 'center'
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
            padding: 6,
            width: '80%',
            borderRadius: 4,
            border: '1px solid #aaa',
            background: '#fff',
            color: '#000'
          }}
        />
        <button
          onClick={() => onBuy(coin.id)}
          style={{
            marginTop: 10,
            padding: '8px 16px',
            borderRadius: 6,
            background: '#007bff',
            color: '#fff',
            fontWeight: 'bold',
            border: 'none'
          }}
        >
          Buy
        </button>
      </div>
    </div>
  )
}

// The rest of the Home component remains unchanged
