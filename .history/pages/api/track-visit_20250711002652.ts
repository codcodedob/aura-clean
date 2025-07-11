// pages/api/track-visit.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabaseClient'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  try {
    const { url } = req.body
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown'
    const userAgent = req.headers['user-agent'] || 'unknown'

    const { error } = await supabase.from('site_visits').insert([
      {
        url,
        ip,
        user_agent: userAgent,
        timestamp: new Date().toISOString(),
      },
    ])

    if (error) throw error

    res.status(200).json({ message: 'Visit tracked' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to track visit' })
  }
}
