// pages/api/create-coin.ts
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

  const { userId, name, amount, tagline, vision } = req.body
  if (!userId || !name || typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({ error: 'Missing or invalid userId, name, or amount' })
  }

  const initialPrice = +(amount / 100).toFixed(2) // example logic: price based on amount
  const initialCap = Math.floor(amount / initialPrice)

  const { error } = await supabase.from('aura_coins').insert([
    {
      user_id: userId,
      name,
      emoji: '🪙',
      price: initialPrice,
      cap: initialCap,
      visible: true,
      rarity: 'common',
      owner_name: name,
      tagline: tagline || null,
      vision: vision || null,
    }
  ])

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  res.status(200).json({ success: true })
}
