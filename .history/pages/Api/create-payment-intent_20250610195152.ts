// pages/api/create-payment-intent.ts
import { NextApiRequest, NextApiResponse } from 'next'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2022-11-15'
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { coinId, amount } = req.body as { coinId: string; amount: number }
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      metadata: { coinId }
    })
    res.status(200).json({ clientSecret: paymentIntent.client_secret })
  } catch (err: any) {
    console.error('⚠️ stripe error', err)
    res.status(500).json({ error: err.message })
  }
}
