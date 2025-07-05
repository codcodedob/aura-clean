// pages/api/create-checkout.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// Stripe and Supabase setup
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16', // Latest stable as of July 2025
});
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type UserProfile = {
  stripe_customer_id?: string;
  email?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');

  try {
    const { coinId, amount, userId, ...metadata } = req.body as {
      coinId: string;
      amount: number;
      userId: string;
      [key: string]: any;
    };

    if (!coinId || !amount || !userId) {
      return res.status(400).json({ error: 'Missing required params.' });
    }

    // 1. Fetch user profile from Supabase
    const { data: userProfileData, error: userProfileError } = await supabase
      .from('users')
      .select('stripe_customer_id, email')
      .eq('id', userId)
      .single();

    if (userProfileError || !userProfileData) {
      return res.status(404).json({ error: 'User not found.' });
    }
    // Type assertion
    const userProfile = userProfileData as UserProfile;

    // 2. Get or create Stripe customer
    let stripeCustomerId = userProfile.stripe_customer_id;
    if (!stripeCustomerId) {
      if (!userProfile.email) return res.status(400).json({ error: 'User missing email.' });
      const customer = await stripe.customers.create({ email: userProfile.email });
      stripeCustomerId = customer.id;
      // Save customer ID back to Supabase
      await supabase
        .from('users')
        .update({ stripe_customer_id: stripeCustomerId })
        .eq('id', userId);
    }

    // 3. Fetch product/coin info for display
    const { data: coinData } = await supabase
      .from('aura_coins')
      .select('id, name')
      .eq('id', coinId)
      .single();

    if (!coinData) {
      return res.status(404).json({ error: 'Coin/product not found.' });
    }

    // 4. Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer: stripeCustomerId,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: { name: `AuraCoin: ${coinData.name}` },
            unit_amount: Math.round(amount * 100), // cents
          },
          quantity: 1,
        },
      ],
      // This saves the card for off-session/recurrent billing
      setup_future_usage: 'off_session',
      metadata: {
        coinId,
        userId,
        ...metadata
      },
      success_url: `${req.headers.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/`,
    });

    return res.status(200).json({ sessionId: session.id });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('Stripe checkout error:', message);
    return res.status(500).json({ error: message });
  }
}
