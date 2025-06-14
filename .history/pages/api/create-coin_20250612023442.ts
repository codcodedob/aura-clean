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

  const { userId, name } = req.body

  if (!userId || !name) {
    return res.status(400).json({ error: 'Missing userId or name' })
  }

  const { data: existing } = await supabase
    .from('aura_coins')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle()

  if (existing) {
    return res.status(400).json({ error: 'You already have an AuraCoin.' })
  }

  const { error } = await supabase.from('aura_coins').insert({
    user_id: userId,
    name,
    price: 1.0,
    cap: 0,
    hidden: false,
  })

  if (error) return res.status(500).json({ error: error.message })
  res.status(200).json({ success: true })
}
