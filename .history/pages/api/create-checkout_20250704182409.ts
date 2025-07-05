// pages/api/create-checkout.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16', // Use the latest stable API!
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

type UserProfile = {
  stripe_customer_id?: string
  email?: string
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).end('Method Not Allowed')
  }

  try {
    const body = req.body as { coinId?: string; amount?: number; userId?: string; resaleMode?: string }
    const { coinId, amount, userId, resaleMode } = body

    if (!coinId || !amount || !userId) {
      return res.status(400).json({ error: 'Missing coinId, amount, or userId' })
    }

    // Get user profile (type assertion to avoid deep type recursion)
    const { data } = await supabase
      .from('users')
      .select('stripe_customer_id, email')
      .eq('id', userId)
      .single()
    const userProfile = data as UserProfile | null
    const email = userProfile?.email

    // Get or create Stripe Customer
    let stripeCustomerId = userProfile?.stripe_customer_id
    if (!stripeCustomerId) {
      // Create Stripe customer
      const customer = await stripe.customers.create({
        email,
        metadata: { supabase_user_id: userId }
      })
      stripeCustomerId = customer.id

      // Save to Supabase
      await supabase.from('users').update({ stripe_customer_id: stripeCustomerId }).eq('id', userId)
    }

    // Get coin info (for the line item)
    const { data: coinData } = await supabase
      .from('aura_coins')
      .select('id, name')
      .eq('id', coinId)
      .single()
    const coin = coinData as { id: string; name: string } | null
    if (!coin) return res.status(404).json({ error: 'Coin not found' })

    const unitAmount = Math.round(amount * 100) // convert dollars to cents

    // Stripe Checkout session with card save for recurring/off-session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer: stripeCustomerId,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: { name: `AuraCoin: ${coin.name}` },
            unit_amount: unitAmount,
          },
          quantity: 1,
        },
      ],
      // Ask Stripe to save the card for future off-session payments
      setup_future_usage: 'off_session',
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
