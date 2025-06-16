// supabase/functions/admin_refresh_coins/index.ts

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

const ALPACA_KEY = Deno.env.get('ALPACA_API_KEY')!
const ALPACA_SECRET = Deno.env.get('ALPACA_SECRET_KEY')!

serve(async () => {
  const { data: coins, error } = await supabase.from('aura_coins').select('*')
  if (error) return new Response('Failed to load coins', { status: 500 })

  const updates = await Promise.all(coins.map(async (coin) => {
    try {
      if (coin.type === 'crypto') {
        const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coin.symbol}&vs_currencies=usd`)
        const json = await res.json()
        const price = json[coin.symbol]?.usd
        const cap = json[coin.symbol]?.usd_market_cap
        if (!price || !cap) return null
        return { id: coin.id, price, cap }
      } else if (coin.type === 'stock') {
        const res = await fetch(`https://data.alpaca.markets/v2/stocks/${coin.symbol}/quotes/latest`, {
          headers: {
            'APCA-API-KEY-ID': ALPACA_KEY,
            'APCA-API-SECRET-KEY': ALPACA_SECRET
          }
        })
        const json = await res.json()
        const price = json.quote?.ap
        if (!price) return null
        return { id: coin.id, price, cap: 0 }
      }
    } catch (err) {
      console.error(`Failed to update ${coin.name}:`, err)
      return null
    }
  }))

  for (const update of updates.filter(Boolean)) {
    await supabase
      .from('aura_coins')
      .update({
        price: update!.price,
        cap: update!.cap,
        updated_at: new Date().toISOString()
      })
      .eq('id', update!.id)
  }

  return new Response('✅ Market data manually refreshed.', { status: 200 })
})
