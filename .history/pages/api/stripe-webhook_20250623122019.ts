import { buffer } from 'micro'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
export const config = { api: { bodyParser: false } }
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' })
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    const rawBody = await buffer(req);
    event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret)
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err}`)
  }
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { coinId, userId, amount } = session.metadata || {};
    await supabase.from('receipts').insert([{
      user_id: userId,
      coin_id: coinId,
      amount: parseFloat(amount || "0"),
      stripe_session_id: session.id,
      email: session.customer_email,
      status: session.payment_status,
      paid_at: new Date().toISOString(),
    }])
  }
  res.status(200).json({ received: true });
}
