// pages/api/refresh-market-data.ts
import { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'
import fetch from 'node-fetch'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const ALPACA_KEY = process.env.ALPACA_API_KEY!
const ALPACA_SECRET = process.env.ALPACA_API_SECRET!
const ALPACA_BASE = 'https://data.alpaca.markets/v2/stocks'

const COINGECKO_API = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { data: coins, error } = await supabase.from('coins').select('*')
    if (error) throw error

    const updatedCoins = await Promise.all(
      (coins || []).map(async (coin) => {
        if (coin.type === 'stock' && coin.symbol) {
          const alpacaRes = await fetch(`${ALPACA_BASE}/${coin.symbol}/quotes/latest`, {
            headers: {
              'APCA-API-KEY-ID': ALPACA_KEY,
              'APCA-API-SECRET-KEY': ALPACA_SECRET
            }
          })
          const alpacaData = await alpacaRes.json()
          const price = parseFloat(alpacaData.quote?.ap || '0')
          return { id: coin.id, price }
        }
        if (coin.type === 'crypto') {
          const cgRes = await fetch(COINGECKO_API)
          const cgData = await cgRes.json()
          const price = cgData[coin.name.toLowerCase()]?.usd || coin.price
          return { id: coin.id, price }
        }
        return { id: coin.id, price: coin.price }
      })
    )

    for (const coin of updatedCoins) {
      await supabase.from('coins').update({ price: coin.price }).eq('id', coin.id)
    }

    res.status(200).json({ updated: updatedCoins.length })
  } catch (err) {
    console.error('Failed to refresh market data:', err)
    res.status(500).json({ error: 'Internal error' })
  }
}
