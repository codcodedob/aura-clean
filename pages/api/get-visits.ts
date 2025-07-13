import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabaseClient'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  const { startDate, endDate, sortBy = 'timestamp', sortOrder = 'desc' } = req.query

  const validSortColumns = ['timestamp', 'url', 'ip']
  const validSortOrders = ['asc', 'desc']

  if (!validSortColumns.includes(String(sortBy))) {
    return res.status(400).json({ error: 'Invalid sortBy parameter' })
  }
  if (!validSortOrders.includes(String(sortOrder))) {
    return res.status(400).json({ error: 'Invalid sortOrder parameter' })
  }

  try {
    let query = supabase.from('site_visits').select('*')

    if (startDate) {
      query = query.gte('timestamp', String(startDate))
    }
    if (endDate) {
      const end = new Date(String(endDate))
      end.setDate(end.getDate() + 1)
      query = query.lt('timestamp', end.toISOString())
    }

    query = query.order(String(sortBy), { ascending: sortOrder === 'asc' }).limit(50)

    const { data, error: queryError } = await query

    if (queryError) throw queryError

    res.status(200).json(data)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch visits' })
  }
}
