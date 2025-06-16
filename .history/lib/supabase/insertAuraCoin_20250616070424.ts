import { createServerComponentSupabaseClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

interface CoinInput {
  name: string
  price: number
  type: 'stock' | 'crypto'
  emoji: string
  symbol: string
}

export async function insertAuraCoin(coin: CoinInput) {
  const { name, price, type, emoji, symbol } = coin
  const supabase = createServerComponentSupabaseClient({ cookies })

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
