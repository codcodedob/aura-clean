import { NextApiRequest, NextApiResponse } from 'next'
import Stripe from 'stripe'
import { buffer } from 'micro'
import { createClient } from '@supabase/supabase-js'

export const config = {
  api: {
    bodyParser: false,
  },
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2022-11-15',
  })

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
  ): Promise<void> {
    if (req.method !== 'POST') {
      res.setHeader('Allow', ['POST'])
      res.status(405).json({ error: 'Method Not Allowed' })
      return
    }
  
    try {
      // Your logic here
      res.status(200).json({ success: true })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      res.status(500).json({ error: message })
    }
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
        .select('cap')
        .eq('id', coinId)
        .single()

      if (readError || !data) {
        console.error('Read failed:', readError)
        return res.status(500).json({ error: 'Failed to retrieve coin cap' })
      }

      const { error: updateError } = await supabase
        .from('aura_coins')
        .update({ cap: data.cap + 1 })
        .eq('id', coinId)

      if (updateError) {
        console.error('Supabase update failed:', updateError)
        return res.status(500).json({ error: 'Failed to update coin cap' })
      }
    }
  }

  res.status(200).json({ received: true })
}
