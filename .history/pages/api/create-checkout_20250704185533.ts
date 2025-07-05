// pages/api/create-checkout.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16', // Use your correct Stripe API version
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end('Method Not Allowed');
  }

  try {
    const body = req.body as {
      coinId: string;
      amount: number;
      resaleMode?: string;
      userId?: string;
    };
    const { coinId, amount, resaleMode, userId } = body;

    if (!coinId || !amount || !userId) {
      return res.status(400).json({ error: 'Missing coinId, amount, or userId' });
    }

    // Lookup user to get their Stripe customer ID & email
    const { data: userProfile, error: userError } = await supabase
      .from('users')
      .select('stripe_customer_id, email')
      .eq('id', userId)
      .single();

    if (userError || !userProfile) {
      return res.status(404).json({ error: 'User not found' });
    }

    let stripeCustomerId = userProfile.stripe_customer_id;
    const email = userProfile.email;

    // If user has no Stripe customer, create one
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({ email });
      stripeCustomerId = customer.id;
      // Save to Supabase for next time
      await supabase
        .from('users')
        .update({ stripe_customer_id: stripeCustomerId })
        .eq('id', userId);
    }

    // Lookup the coin/product info
    const { data: coin, error: coinError } = await supabase
      .from('aura_coins')
      .select('id, name')
      .eq('id', coinId)
      .single();

    if (coinError || !coin) {
      return res.status(404).json({ error: 'Coin not found' });
    }

    const unitAmount = Math.round(amount * 100); // cents

    // Create the Stripe Checkout Session
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
      payment_intent_data: {
        setup_future_usage: 'off_session', // <-- Save card for future!
      },
      metadata: {
        coinId: coin.id,
        resaleMode: resaleMode || 'ai',
        amount: amount.toString(),
        userId,
      },
      success_url: `${req.headers.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/`,
    });

    return res.status(200).json({ sessionId: session.id });
  } catch (err: any) {
    console.error('❌ Checkout error:', err.message);
    return res.status(500).json({ error: err.message || 'Unknown error' });
  }
}
