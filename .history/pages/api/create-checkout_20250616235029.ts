// pages/api/create-checkout.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-05-28.basil', // Use a valid, current Stripe API version
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).end('Method Not Allowed')
  }

  try {
    const body = req.body as { coinId: string; amount: number; resaleMode?: string; userId?: string }
    const { coinId, amount, resaleMode, userId } = body

    // Sanity checks
    if (!coinId || !amount || !userId) {
      return res.status(400).json({ error: 'Missing coinId, amount, or userId' })
    }

    const { data: coin, error } = await supabase
      .from('aura_coins')
      .select('id, name')
      .eq('id', coinId)
      .single()

    if (error || !coin) {
      return res.status(404).json({ error: 'Coin not found' })
    }

    const unitAmount = Math.round(amount * 100) // Stripe expects cents

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `AuraCoin: ${coin.name}`,
            },
            unit_amount: unitAmount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      metadata: {
        coinId: coin.id,
        resaleMode: resaleMode || 'ai',
        amount: amount.toString(),
        userId,
      },
      success_url: `${req.headers.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/`,
    })

    res.status(200).json({ sessionId: session.id })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('❌ Checkout error:', message)
    res.status(500).json({ error: message })
  }
}
