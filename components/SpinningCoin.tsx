// components/SpinningCoin.tsx
import React from 'react'

export default function SpinningCoin({
  emoji = '🪙',
  size = 100,
}: {
  emoji?: string
  size?: number
}) {
  return (
    <div className="coin-container">
      <div className="coin">{emoji}</div>
      <style jsx>{`
        .coin-container {
          perspective: 600px;
        }
        .coin {
          width: ${size}px;
          height: ${size}px;
          border-radius: 50%;
          background: radial-gradient(circle at 30% 30%, #ffd700, #c49100);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: ${size / 2}px;
          animation: spin 4s linear infinite;
          box-shadow: 0 4px 10px rgba(0,0,0,0.5);
        }
        @keyframes spin {
          from { transform: rotateY(0deg); }
          to   { transform: rotateY(360deg); }
        }
      `}</style>
    </div>
  )
}
