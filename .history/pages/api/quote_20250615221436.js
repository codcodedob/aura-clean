// pages/api/refresh-coins.ts

import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed')

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL}/admin_refresh_coins`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY}`,
      },
    })

    const text = await response.text()
    res.status(response.status).send(text)
  } catch (err) {
    console.error('Refresh error:', err)
    res.status(500).send('Error calling Supabase function')
  }
}
