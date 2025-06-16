// pages/api/admin_refresh_coins.ts
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const response = await fetch('https://ofhpjvbmrfwbmboxibur.functions.supabase.co/admin_refresh_coins', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}` // Make sure this is in your .env.local
      }
    })

    const text = await response.text()
    if (!response.ok) {
      return res.status(response.status).send(`❌ Error: ${text}`)
    }

    return res.status(200).send(`✅ Success: ${text}`)
  } catch (error) {
    console.error('Failed to refresh coins:', error)
    return res.status(500).send('❌ Internal server error.')
  }
}
