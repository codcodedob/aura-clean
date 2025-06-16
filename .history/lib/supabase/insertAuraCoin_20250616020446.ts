import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function insertAuraCoin({ name, price, type, emoji, symbol }) {
  const supabase = createServerSupabaseClient({ cookies })

  const { data, error } = await supabase.from('coins').insert([
    {
      name,
      price,
      type,
      emoji,
      symbol,
    },
  ])

  if (error) {
    console.error('Insert error:', error)
    throw new Error(error.message)
  }

  return data
}
