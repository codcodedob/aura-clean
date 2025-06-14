import { NextApiRequest, NextApiResponse } from 'next'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-05-28.basil',
})

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ofhpjvbmrfwbmboxibur.supabase.co'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseKey) {
  throw new Error('supabaseKey is required.')
}

const supabase = createClient(supabaseUrl, supabaseKey)

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  try {
    const { coinId } = req.body as { coinId: string }
    if (!coinId) {
      return res.status(400).json({ error: 'Missing coinId' })
    }

    const { data: coin, error } = await supabase
      .from('aura_coins')
      .select('id, name, price')
      .eq('id', coinId)
      .single()

    if (error || !coin) {
      return res.status(404).json({ error: 'Coin not found' })
    }

    const { coinId, amount } = req.body

    const { data: coin, error } = await supabase
      .from('aura_coins')
      .select('name, id')
      .eq('id', coinId)
      .single()
    
    if (error || !coin) {
      return res.status(400).json({ error: 'Coin not found' })
    }
    
    const unitAmount = parseInt(amount, 10) // ✅ use user's input
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `AuraCoin: ${coin.name}`,
            },
            unit_amount: unitAmount, // ✅ now reflects chosen investment
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      metadata: { coinId: coin.id },
      success_url: `${req.headers.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/`,
    })
    
    res.status(200).json({ sessionId: session.id })
    

    res.status(200).json({ sessionId: session.id })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    res.status(500).json({ error: message })
  }
}