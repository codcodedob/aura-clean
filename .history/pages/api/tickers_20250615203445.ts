// pages/api/tickers.ts

export default function handler(req, res) {
  const tickers = [
        { symbol: 'AAPL', name: 'Apple Inc.', type: 'stock' },
        { symbol: 'GOOGL', name: 'Alphabet Inc.', type: 'stock' },
        { symbol: 'TSLA', name: 'Tesla Inc.', type: 'stock' },
        { symbol: 'MSFT', name: 'Microsoft Corp.', type: 'stock' },
        { symbol: 'NVDA', name: 'NVIDIA Corp.', type: 'stock' },
        { symbol: 'BTC', name: 'Bitcoin', type: 'crypto' },
        { symbol: 'ETH', name: 'Ethereum', type: 'crypto' },
        { symbol: 'SOL', name: 'Solana', type: 'crypto' },
        { symbol: 'DOGE', name: 'Dogecoin', type: 'crypto' },
        { symbol: 'AVAX', name: 'Avalanche', type: 'crypto' },
        { symbol: 'PEPE', name: 'Pepe Coin', type: 'crypto' },
        { symbol: 'BCH', name: 'Bitcoin Cash', type: 'crypto' },
        { symbol: 'AMZN', name: 'Amazon.com Inc.', type: 'stock' },
        { symbol: 'META', name: 'Meta Platforms Inc.', type: 'stock' },
        { symbol: 'NFLX', name: 'Netflix Inc.', type: 'stock' }
      ]

  res.status(200).json(tickers)
}
