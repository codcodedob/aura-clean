// pages/api/stripe-webhook.ts
import { buffer } from 'micro'
import Stripe from 'stripe'
import type { NextApiResponse } from 'next'
import type { IncomingMessage } from 'http'
import { createClient } from '@supabase/supabase-js'

export const config = { api: { bodyParser: false } }

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
) {
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
      // (1) Insert receipt for this purchase
      const { error: receiptError } = await supabase.from('receipts').insert({
        user_id: userId,
        coin_id: coinId,
        amount,
        stripe_session_id: session.id,
        email: session.customer_email,
        status: session.payment_status,
        paid_at: new Date().toISOString(),
      })
      if (receiptError) throw new Error(`Receipt insert failed: ${receiptError.message}`)

      // (2) Log coin_activity for purchase
      const { error: logError } = await supabase.from('coin_activity').insert({
        user_id: userId,
        coin_id: coinId,
        type: 'purchase',
        amount: amount,
        description: `Purchase via Stripe for $${amount}`
      })
      if (logError) throw new Error(`Activity log failed: ${logError.message}`)

      // (3) (Optional) Atomic cap update (replace with your actual increment RPC or logic)
      // await supabase.rpc('increment_cap', { coin_id: coinId, amount })

    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      console.error(message)
      return res.status(500).json({ error: message })
    }
  }

  res.status(200).json({ received: true })
}
