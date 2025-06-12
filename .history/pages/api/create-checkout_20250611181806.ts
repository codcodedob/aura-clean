import { NextApiRequest, NextApiResponse } from 'next'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

// Stripe setup
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2022-11-15' as const,
})

// Supabase (optional if pulling coin data server-side)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  try {
    const { coinId } = req.body
    if (!coinId) {
      return res.status(400).json({ error: 'Missing coinId' })
    }

    // Fetch coin data from Supabase
    const { data: coin, error } = await supabase
      .from('aura_coins')
      .select('id, name, price')
      .eq('id', coinId)
      .single()

    if (error || !coin) {
      console.error('❌ Supabase coin lookup failed:', error)
      return res.status(404).json({ error: 'Coin not found' })
    }

    const unitAmount = Math.round(coin.price * 100)

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: `AuraCoin: ${coin.name}`,
          },
          unit_amount: unitAmount,
        },
        quantity: 1,
      }],
      mode: 'payment',
      metadata: {
        coinId: coin.id,
      },
      success_url: `${req.headers.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/`,
    })

    return res.status(200).json({ sessionId: session.id })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('❌ Stripe Checkout error:', err)
    return res.status(500).json({ error: message })
  }
}
