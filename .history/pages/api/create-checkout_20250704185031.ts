// pages/api/create-checkout.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16', // Use current Stripe API version
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
    const body = req.body as {
      coinId: string;
      amount: number;
      resaleMode?: string;
      userId?: string;
    }
    const { coinId, amount, resaleMode, userId } = body

    if (!coinId || !amount || !userId) {
      return res.status(400).json({ error: 'Missing coinId, amount, or userId' })
    }

    // 1. Lookup coin for product name
    const { data: coin, error: coinError } = await supabase
      .from('aura_coins')
      .select('id, name')
      .eq('id', coinId)
      .single() as any;

    if (coinError || !coin) {
      return res.status(404).json({ error: 'Coin not found' })
    }

    // 2. Get user Stripe customer ID or create one if missing
    const { data: userProfile, error: userError } = await supabase
      .from('users')
      .select('stripe_customer_id, email')
      .eq('id', userId)
      .single() as any;

    if (userError || !userProfile) {
      return res.status(404).json({ error: 'User not found' })
    }

    let stripeCustomerId = userProfile.stripe_customer_id;
    const email = userProfile.email;

    // Create Stripe customer if missing
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email,
        metadata: { userId }
      });
      stripeCustomerId = customer.id;
      // Save back to user in Supabase
      await supabase.from('users')
        .update({ stripe_customer_id: stripeCustomerId })
        .eq('id', userId);
    }

    // 3. Create Stripe Checkout Session (with card save support)
    const unitAmount = Math.round(amount * 100);

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
      setup_future_usage: 'off_session', // <-- This enables card saving for recurring
      metadata: {
        coinId: coin.id,
        resaleMode: resaleMode || 'ai',
        amount: amount.toString(),
        userId,
      },
      success_url: `${req.headers.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/`,
    });

    res.status(200).json({ sessionId: session.id })
  } catch (err: any) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('❌ Checkout error:', message)
    res.status(500).json({ error: message })
  }
}
