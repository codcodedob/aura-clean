// pages/api/create-checkout.ts
import { NextApiRequest, NextApiResponse } from 'next'
import Stripe from 'stripe'


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-05-28.basil',
})

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ofhpjvbmrfwbmboxibur.supabase.co'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseKey) {
  throw new Error('supabaseKey is required.')
}

const supabase = require('@supabase/supabase-js').createClient(supabaseUrl, supabaseKey)

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  try {
    const { coinId } = req.body as { coinId: string }
    if (!coinId) {
      return res.status(400).json({ error: 'Missing coinId' })
    }

    const { data: coin, error } = await supabase
      .from('aura_coins')
      .select('id, name, price, hidden')
      .eq('id', coinId)
      .single()

    if (error || !coin) {
      return res.status(404).json({ error: 'Coin not found' })
    }

    if (coin.hidden) {
      return res.status(403).json({ error: 'Coin is not available for purchase' })
    }

    const unitAmount = Math.round(coin.price * 100)

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
      metadata: { coinId: coin.id },
      success_url: `${req.headers.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/`,
    })

    res.status(200).json({ sessionId: session.id })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    res.status(500).json({ error: message })
  }
}


// pages/api/stripe-webhook.ts
import { buffer } from 'micro'
import Stripe from 'stripe'
import type { NextApiResponse } from 'next'
import type { IncomingMessage } from 'http'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export const config = {
  api: {
    bodyParser: false,
  },
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-05-28.basil',
})

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || ''
const supabase = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ofhpjvbmrfwbmboxibur.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

export default async function handler(
  req: IncomingMessage & { body: unknown },
  res: NextApiResponse
): Promise<void> {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    res.status(405).json({ error: 'Method Not Allowed' }); return
  }

  const sig = req.headers['stripe-signature'] as string | undefined
  if (!sig) return res.status(400).send('Missing Stripe signature')

  let event: Stripe.Event

  try {
    const rawBody = await buffer(req)
    event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown webhook error'
    return res.status(400).send(`Webhook Error: ${message}`)
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const coinId = session.metadata?.coinId

    if (coinId) {
      const { data, error: readError } = await supabase
        .from('aura_coins')
        .select('cap, price')
        .eq('id', coinId)
        .single()

      if (readError || !data) {
        console.error('Read failed:', readError)
        return res.status(500).json({ error: 'Failed to retrieve coin cap' })
      }

      const { error: updateError } = await supabase
        .from('aura_coins')
        .update({
          cap: data.cap + 1,
          price: +(data.price + 0.05).toFixed(2),
        })
        .eq('id', coinId)

      if (updateError) {
        console.error('Supabase update failed:', updateError)
        return res.status(500).json({ error: 'Failed to update coin cap' })
      }
    }
  }

  res.status(200).json({ received: true })
}
