import React from 'react'

interface CoinCardProps {
  coin: {
    id: string
    name: string
    emoji?: string
    price: number
    cap: number
    user_id: string
  }
  amount: number
  onAmountChange: (coinId: string, amount: number) => void
  onBuy: (coinId: string) => void
}

export default function CoinCard({ coin, amount, onAmountChange, onBuy }: CoinCardProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value)
    if (!isNaN(val)) {
      onAmountChange(coin.id, val)
    }
  }

  const handleBuyClick = () => {
    if (amount >= coin.price) {
      onBuy(coin.id)
    } else {
      alert(`Enter an amount >= $${coin.price}`)
    }
  }

  return (
    <div style={{
      margin: '1rem 0',
      padding: '1rem',
      borderRadius: 8,
      border: '1px solid #999',
      background: '#111',
      color: '#fff',
      textAlign: 'center'
    }}>
      <div>
        <strong style={{ fontSize: 18 }}>{coin.emoji ?? '🪙'} {coin.name}</strong>
        <p>${coin.price.toFixed(2)} · cap {coin.cap}</p>
        <input
          type="number"
          value={amount}
          min={coin.price}
          step="0.01"
          onChange={handleInputChange}
          style={{
            marginTop: 8,
            padding: 6,
            width: '80%',
            borderRadius: 4,
            border: '1px solid #555',
            background: '#222',
            color: '#fff'
          }}
        />
        <button
          onClick={handleBuyClick}
          style={{
            marginTop: 10,
            padding: '8px 16px',
            borderRadius: 6,
            background: '#0af',
            color: '#000',
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
