import React from 'react'

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
        boxShadow: '0 0 12px rgba(255,255,255,0.1)'
      }}
    >
      {coin.img_url && (
        <img
          src={coin.img_url}
          alt={`${coin.name} background`}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: 0.15,
            zIndex: 0
          }}
        />
      )}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <strong style={{ fontSize: 18 }}>{coin.emoji ?? '🪙'} {coin.name}</strong>
        <p>${coin.price.toFixed(2)} · cap {coin.cap}</p>
        <div style={{ marginTop: 10, display: 'flex', justifyContent: 'center', gap: '10px' }}>
          <span title="Live Stream" style={iconStyle}>📺</span>
          <span title="Music" style={iconStyle}>🎵</span>
          <span title="Movies" style={iconStyle}>🎬</span>
          <span title="Events" style={iconStyle}>🎟️</span>
        </div>
        <button
          onClick={() => handleBuy(coin)}
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
          Buy
        </button>
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
