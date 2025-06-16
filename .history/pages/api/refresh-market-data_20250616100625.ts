// Converted to Next.js-compatible Node API format
import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient, PostgrestResponse } from '@supabase/supabase-js'

interface Coin {
  id: string
  name: string
  symbol: string
  type: 'stock' | 'crypto'
}

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const ALPACA_KEY = process.env.ALPACA_API_KEY!
const ALPACA_SECRET = process.env.ALPACA_SECRET_KEY!

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { data: coins, error }: PostgrestResponse<Coin> = await supabase
    .from('aura_coins')
    .select('*')

  if (error || !coins) return res.status(500).send('Failed to load aura_coins')

  const updates = await Promise.all(
    coins.map(async (coin) => {
      try {
        let price: number | undefined

        if (coin.type === 'crypto') {
          const cgRes = await fetch(
            `https://api.coingecko.com/api/v3/simple/price?ids=${coin.symbol}&vs_currencies=usd`
          )
          const json = await cgRes.json()
          price = json[coin.symbol]?.usd
        } else if (coin.type === 'stock') {
          const stockRes = await fetch(
            `https://data.alpaca.markets/v2/stocks/${coin.symbol}/quotes/latest`,
            {
              headers: {
                'APCA-API-KEY-ID': ALPACA_KEY,
                'APCA-API-SECRET-KEY': ALPACA_SECRET
              }
            }
          )
          const json = await stockRes.json()
          price = json.quote?.ap
        }

        if (!price) return null

        const cap = Math.round(price * 1_000_000)
        return { id: coin.id, price, cap }
      } catch (err) {
        console.error(`Failed to update ${coin.name}:`, err)
        return null
      }
    })
  )

  for (const update of updates.filter(Boolean)) {
    await supabase
      .from('aura_coins')
      .update({ price: update!.price, cap: update!.cap })
      .eq('id', update!.id)
  }

  res.status(200).send('✅ Market data and cap refreshed!')
}
