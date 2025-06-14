import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

const ADMIN_USER_ID = 'your-admin-user-id-here' // replace this with your actual Supabase UID

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  const { coinId, hidden, adminId } = req.body
  if (adminId !== ADMIN_USER_ID) {
    return res.status(403).json({ error: 'Unauthorized' })
  }

  const { error } = await supabase
    .from('aura_coins')
    .update({ hidden })
    .eq('id', coinId)

  if (error) return res.status(500).json({ error: error.message })
  res.status(200).json({ success: true })
}