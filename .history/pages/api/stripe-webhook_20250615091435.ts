// pages/api/stripe-webhook.ts
import { buffer } from 'micro'
import Stripe from 'stripe'
import type { NextApiResponse } from 'next'
import type { IncomingMessage } from 'http'
import { createClient } from '@supabase/supabase-js'

export const config = {
  api: {
    bodyParser: false,
  },
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-05-28.basil',
})

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || ''
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

export default async function handler(
  req: IncomingMessage & { body: unknown },
  res: NextApiResponse
): Promise<void> {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    res.status(405).json({ error: 'Method Not Allowed' })
    return
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
    const amountStr = session.metadata?.amount
    const userId = session.metadata?.userId

    const amount = amountStr ? parseFloat(amountStr) : 0

    if (!coinId || !amount || !userId) {
      return res.status(400).json({ error: 'Missing required metadata' })
    }

    try {
      const [{ data: coin, error: coinError }, { error: updateError }, { error: logError }] = await Promise.all([
        supabase.from('aura_coins').select('cap').eq('id', coinId).single(),
        supabase.from('aura_coins').update({ cap: supabase.rpc('increment_cap', { coin_id: coinId, amount }) }).eq('id', coinId),
        supabase.from('coin_activity').insert({
          user_id: userId,
          coin_id: coinId,
          type: 'purchase',
          amount: amount,
          description: `Purchase via Stripe for $${amount}`
        })
      ])

      if (coinError) throw new Error(`Coin read failed: ${coinError.message}`)
      if (updateError) throw new Error(`Cap update failed: ${updateError.message}`)
      if (logError) throw new Error(`Activity log failed: ${logError.message}`)

    } catch (error: any) {
      console.error(error.message)
      return res.status(500).json({ error: error.message })
    }
  }

  res.status(200).json({ received: true })
}
