// pages/api/create-city-coin.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Only used in server-side files!
)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' })

  try {
    const { adminEmail } = req.body
    if (adminEmail !== 'burks.donte@gmail.com') return res.status(403).json({ error: 'Unauthorized' })

    const { data: existing } = await supabase
      .from('aura_coins')
      .select('id')
      .ilike('name', 'City%')

    const nextNum = (existing?.length || 0) + 1
    const coinName = `City ${nextNum}`
    const randomEmoji = ['🌆','🏙️','🌃','🌉','🌇'][Math.floor(Math.random() * 5)]

    const { error } = await supabase.from('aura_coins').insert({
      user_id: 'npc-city',
      name: coinName,
      emoji: randomEmoji,
      price: 1.25,
      cap: 0,
      visible: true,
      tagline: 'NPC Coin for testing',
      vision: 'This coin simulates an active digital region.'
    })

    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ success: true, name: coinName })
  } catch (err: any) {
    return res.status(500).json({ error: err.message })
  }
}
