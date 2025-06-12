import { NextApiRequest, NextApiResponse } from 'next'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { coinId, amount } = req.body as { coinId: string; amount: number }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      metadata: { coinId },
    })

    res.status(200).json({ clientSecret: paymentIntent.client_secret })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('❌ Stripe error:', err)
    res.status(500).json({ error: message })
  }
}
