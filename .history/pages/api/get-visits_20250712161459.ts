// pages/api/get-visits.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabaseClient'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  try {
    const { data, error } = await supabase
      .from('site_visits')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(50)

    if (error) throw error

    res.status(200).json(data)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch visits' })
  }
}
