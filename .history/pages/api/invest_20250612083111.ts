import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  const { coinId, amount } = req.body
  if (!coinId || typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({ error: 'Missing or invalid coinId or amount' })
  }

  const { data, error: readError } = await supabase
    .from('aura_coins')
    .select('price, cap')
    .eq('id', coinId)
    .single()

  if (readError || !data) {
    return res.status(500).json({ error: 'Coin not found' })
  }

  const { price, cap } = data
  const shares = Math.floor(amount / price)

  if (shares < 1) {
    return res.status(400).json({ error: 'Investment too small for at least 1 share' })
  }

  const updatedCap = cap + shares
  const newPrice = +(price + shares * 0.01).toFixed(2)

  const { error: updateError } = await supabase
    .from('aura_coins')
    .update({
      cap: updatedCap,
      price: newPrice
    })
    .eq('id', coinId)

  if (updateError) {
    return res.status(500).json({ error: 'Failed to update coin' })
  }

  res.status(200).json({ success: true, sharesPurchased: shares, newPrice })
}
