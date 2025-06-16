// pages/admin/dashboard.tsx
import AdminDashboard from '@/components/AdminDashboard'
import { useState, useEffect } from 'react'

export type Ticker = {
  symbol: string
  name: string
  type: 'stock' | 'crypto'
}

export default function DashboardPage() {
  const [tickers, setTickers] = useState<Ticker[]>([])

  useEffect(() => {
    fetch('/api/tickers')
      .then(res => res.json())
      .then(data => setTickers(data))
      .catch(err => console.error('Failed to load tickers', err))
  }, [])

  return <AdminDashboard tickers={tickers} />
}

// Example ticker data for /api/tickers endpoint
// You can add this to pages/api/tickers.ts
// export default function handler(req, res) {
//   const tickers = [
//     { symbol: 'AAPL', name: 'Apple Inc.', type: 'stock' },
//     { symbol: 'GOOGL', name: 'Alphabet Inc.', type: 'stock' },
//     { symbol: 'TSLA', name: 'Tesla Inc.', type: 'stock' },
//     { symbol: 'MSFT', name: 'Microsoft Corp.', type: 'stock' },
//     { symbol: 'NVDA', name: 'NVIDIA Corp.', type: 'stock' },
//     { symbol: 'BTC', name: 'Bitcoin', type: 'crypto' },
//     { symbol: 'ETH', name: 'Ethereum', type: 'crypto' },
//     { symbol: 'SOL', name: 'Solana', type: 'crypto' },
//     { symbol: 'DOGE', name: 'Dogecoin', type: 'crypto' },
//     { symbol: 'AVAX', name: 'Avalanche', type: 'crypto' },
//     { symbol: 'PEPE', name: 'Pepe Coin', type: 'crypto' },
//     { symbol: 'BCH', name: 'Bitcoin Cash', type: 'crypto' },
//     { symbol: 'AMZN', name: 'Amazon.com Inc.', type: 'stock' },
//     { symbol: 'META', name: 'Meta Platforms Inc.', type: 'stock' },
//     { symbol: 'NFLX', name: 'Netflix Inc.', type: 'stock' },
//     { symbol: 'XRP', name: 'XRP', type: 'crypto' },
//     { symbol: 'ADA', name: 'Cardano', type: 'crypto' },
//     { symbol: 'LTC', name: 'Litecoin', type: 'crypto' }
//   ]
//   res.status(200).json(tickers)
// }
