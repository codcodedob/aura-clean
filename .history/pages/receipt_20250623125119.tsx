import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { format } from 'date-fns'

interface Receipt {
  id: string
  amount: number
  created_at: string
}

export default function ReceiptPage() {
  const [receipts, setReceipts] = useState<Receipt[]>([])

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('coin_activity').select('*')
      setReceipts(data as Receipt[])
    }
    load()
  }, [])

  return (
    <div>
      <h1>Receipt History</h1>
      <ul>
        {receipts.map(r => (
          <li key={r.id}>
            {format(new Date(r.created_at), 'yyyy-MM-dd HH:mm')} – ${r.amount}
          </li>
        ))}
      </ul>
    </div>
  )
}
