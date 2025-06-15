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
      background: 'var(--card-bg)',
      color: 'var(--text-color)',
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
            background: 'var(--input-bg)',
            color: 'var(--text-color)',
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
  const [darkMode, setDarkMode] = useState(false)
  const router = useRouter()

  useEffect(() => {
    document.documentElement.style.setProperty('--card-bg', darkMode ? '#1f2937' : '#ffffff')
    document.documentElement.style.setProperty('--text-color', darkMode ? '#f9fafb' : '#1a1a1a')
    document.documentElement.style.setProperty('--input-bg', darkMode ? '#374151' : '#f3f4f6')
    document.body.style.backgroundColor = darkMode ? '#111827' : '#f9fafb'
  }, [darkMode])

  useEffect(() => {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)()
    recognition.continuous = true
    recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase()
      if (transcript.includes('let there be light')) {
        setDarkMode(false)
        const utterance = new SpeechSynthesisUtterance('Light mode activated')
        speechSynthesis.speak(utterance)
      } else if (transcript.includes('let there be dark')) {
        setDarkMode(true)
        const utterance = new SpeechSynthesisUtterance('Dark mode activated')
        speechSynthesis.speak(utterance)
      }
    }
    recognition.start()
    return () => recognition.stop()
  }, [])

  return (
    <div>
      <button
        onClick={() => setDarkMode(!darkMode)}
        style={{ position: 'fixed', top: 10, right: 10, zIndex: 1000 }}
      >
        Toggle {darkMode ? 'Light' : 'Dark'} Mode
      </button>
      {/* existing layout follows unchanged */}
    </div>
  )
}
