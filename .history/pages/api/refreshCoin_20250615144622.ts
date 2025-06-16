// pages/api/refresh-coins.ts

import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).send('Method Not Allowed')

  // Optional: check for admin auth if needed

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL}/admin_refresh_coins`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY}`
      }
    })

    const text = await response.text()
    res.status(200).send(text)
  } catch (err) {
    res.status(500).send('Error refreshing market data')
  }
}
