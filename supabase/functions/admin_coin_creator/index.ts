import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

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
    const body = await req.json()
    const { name, type, symbol, emoji = '💠', price = 0, cap = 0 } = body

    if (!name || !type || !symbol) {
      return new Response(JSON.stringify({ error: 'Missing name, type, or symbol' }), {
        status: 400,
        headers: corsHeaders,
      })
    }

    const { data, error } = await supabase.from('aura_coins').insert({
      name,
      type,
      symbol,
      emoji,
      price,
      cap,
      user_id: 'admin'
    })

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: corsHeaders,
      })
    }

    return new Response(JSON.stringify({ message: '✅ Coin inserted!', coin: data }), {
      status: 200,
      headers: corsHeaders,
    })
  } catch (err) {
    console.error('Insert error:', err)
    return new Response(JSON.stringify({ error: 'Unexpected error' }), {
      status: 500,
      headers: corsHeaders,
    })
  }
})
