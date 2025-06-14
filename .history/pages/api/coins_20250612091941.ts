// pages/api/coins.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  // Parse limit and offset for pagination — must match frontend scroll logic default
  const limit = parseInt(req.query.limit as string, 10) || 20
  const offset = parseInt(req.query.offset as string, 10) || 0

  const { data, error } = await supabase
    .from('aura_coins')
    .select(`
      id,
      user_id,
      name,
      emoji,
      price,
      cap,
      visible,
      rarity,
      created_at,
      owner_name,
      tagline,
      vision
    `)
    .eq('visible', true)
    .order('price', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) return res.status(500).json({ error: error.message })

  // Ensure frontend handles end-of-data state to stop unnecessary fetches
  res.status(200).json(data ?? [])
}
