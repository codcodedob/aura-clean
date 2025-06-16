// pages/api/alpaca-order.ts
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' })

  const { symbol, qty = 1, side = 'buy' } = req.body

  if (!symbol) return res.status(400).json({ error: 'Missing symbol' })

  try {
    const response = await fetch('https://paper-api.alpaca.markets/v2/orders', {
      method: 'POST',
      headers: {
        'APCA-API-KEY-ID': process.env.ALPACA_KEY_ID!,
        'APCA-API-SECRET-KEY': process.env.ALPACA_SECRET_KEY!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        symbol,
        qty,
        side,
        type: 'market',
        time_in_force: 'gtc'
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return res.status(500).json({ error: data.message || 'Failed to place order' })
    }

    res.status(200).json({ success: true, data })
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', details: error })
  }
}
