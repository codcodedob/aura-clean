// pages/api/coins.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

// ✅ Use the SERVICE ROLE KEY in API routes
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const limit = parseInt(req.query.limit as string, 10) || 20
  const offset = parseInt(req.query.offset as string, 10) || 0

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(500).json({ error: 'Service role key not found in env.' })
  }

  try {
    const { data, error } = await supabase
      .from('aura_coins')
      .select('*')
      .order('price', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    res.status(200).json(data)
  } catch (err: any) {
    console.error('❌ API /coins error:', err)
    res.status(500).json({ error: err.message || 'Unknown error' })
  }
}
