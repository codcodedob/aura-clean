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
  apiVersion: '2022-11-15' as const,
})

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).end('Method Not Allowed')
  }

  const sig = req.headers['stripe-signature']
  if (!sig) return res.status(400).send('Missing Stripe signature')

  const rawBody = await buffer(req)
  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret)
  } catch (err: any) {
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  // Handle the checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const coinId = session.metadata?.coinId

    if (coinId) {
      const { error } = await supabase
        .from('aura_coins')
        .update({
          cap: (await supabase
            .from('aura_coins')
            .select('cap')
            .eq('id', coinId)
            .single()).data?.cap + 1,
        })
        .eq('id', coinId)

      if (error) {
        console.error('Supabase update failed:', error)
      }
    }
  }

  res.json({ received: true })
}
