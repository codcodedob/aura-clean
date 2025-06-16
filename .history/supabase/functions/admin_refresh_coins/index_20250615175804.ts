import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

const ALPACA_KEY = Deno.env.get('ALPACA_API_KEY')!
const ALPACA_SECRET = Deno.env.get('ALPACA_SECRET_KEY')!

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json'
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    })
  }

  try {
    const { data: coins, error } = await supabase.from('aura_coins').select('*')
    if (error) {
      return new Response(JSON.stringify({ error: 'Failed to load coins' }), {
        status: 500,
        headers: corsHeaders,
      })
    }

    const updates = await Promise.all(coins.map(async (coin) => {
      try {
        if (coin.type === 'crypto') {
          const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coin.symbol}&vs_currencies=usd`)
          const json = await res.json()
          const price = json[coin.symbol]?.usd
          if (!price) return null
          return { id: coin.id, price }
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
          return { id: coin.id, price }
        }
      } catch (err) {
        console.error(`Failed to update ${coin.name}:`, err)
        return null
      }
    }))

    for (const update of updates.filter(Boolean)) {
      await supabase.from('aura_coins').update({ price: update!.price }).eq('id', update!.id)
    }

    return new Response(JSON.stringify({ message: '✅ Market data refreshed!' }), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Cache-Control': 'no-store',
        'Access-Control-Allow-Origin': '*'
      },
    })
  } catch (err) {
    console.error('Function error:', err)
    return new Response(JSON.stringify({ error: 'Unexpected error occurred' }), {
      status: 500,
      headers: corsHeaders,
    })
  }
})
