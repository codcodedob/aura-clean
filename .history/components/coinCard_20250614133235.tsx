
import React, { useState, useRef, useEffect } from 'react'

interface CoinCardProps {
  coin: {
    id: string
    name: string
    emoji?: string
    price: number
    cap: number
    user_id: string
    img_url?: string
  }
  investmentAmounts: { [key: string]: number }
  setInvestmentAmounts: React.Dispatch<React.SetStateAction<{ [key: string]: number }>>
  handleBuy: (coin: any) => void
  router: any
}

export default function CoinCard({ coin, investmentAmounts, setInvestmentAmounts, handleBuy, router }: CoinCardProps) {
  const [showInput, setShowInput] = useState(false)
  const [tempAmount, setTempAmount] = useState<string>('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (showInput && inputRef.current) {
      inputRef.current.focus()
      const initial = investmentAmounts[coin.id]
      if (initial) {
        setTempAmount(initial.toString())
      }
    }
  }, [showInput])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setTempAmount(value)
    const numeric = parseFloat(value)
    if (!isNaN(numeric)) {
      setInvestmentAmounts(prev => ({ ...prev, [coin.id]: numeric }))
    }
  }

  const handleButtonClick = () => {
    if (!showInput) {
      setShowInput(true)
    } else {
      const amount = investmentAmounts[coin.id]
      if (!isNaN(amount) && amount >= coin.price) {
        handleBuy(coin)
        setShowInput(false) // Optional UX improvement
      } else {
        alert(`Please enter an amount >= $${coin.price}`)
      }
    }
  }

  return (
    <div
      style={{
        background: 'rgba(0, 0, 0, 0.4)',
        margin: '1rem 0',
        padding: '1rem',
        borderRadius: 8,
        border: '1px solid #555',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        backdropFilter: 'blur(8px)',
        boxShadow: '0 0 12px rgba(255,255,255,0.1)',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        cursor: 'pointer'
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = 'scale(1.02)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 0 18px rgba(0,255,255,0.3)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = 'scale(1.0)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 0 12px rgba(255,255,255,0.1)';
      }}
    >
      <div style={{ position: 'relative', zIndex: 1 }}>
        <strong style={{ fontSize: 18 }}>{coin.emoji ?? '🪙'} {coin.name}</strong>
        <p>${coin.price.toFixed(2)} · cap {coin.cap}</p>
        {showInput && (
          <input
            ref={inputRef}
            type="number"
            placeholder="Enter amount"
            min={coin.price}
            step="0.01"
            value={tempAmount}
            onChange={handleInputChange}
            onKeyDown={(e) => { if (e.key === 'Enter') handleButtonClick() }}
            style={{
              width: '80%',
              padding: 6,
              marginTop: 8,
              background: '#111',
              color: '#fff',
              border: '1px solid #666',
              borderRadius: 6
            }}
          />
        )}
        <button
          onClick={handleButtonClick}
          style={{
            marginTop: 12,
            padding: '6px 16px',
            background: '#0af',
            color: '#000',
            borderRadius: 6,
            border: 'none',
            fontWeight: 'bold'
          }}
        >
          {showInput ? 'Confirm Purchase' : 'Buy'}
        </button>
        <div style={{ marginTop: 10, display: 'flex', justifyContent: 'center', gap: '10px' }}>
          <span title="Live Stream" style={iconStyle}>📺</span>
          <span title="Music" style={iconStyle}>🎵</span>
          <span title="Movies" style={iconStyle}>🎬</span>
          <span title="Events" style={iconStyle}>🎟️</span>
        </div>
      </div>
    </div>
  )
}

const iconStyle = {
  width: 28,
  height: 28,
  borderRadius: '50%',
  background: '#222',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#0af'
}
