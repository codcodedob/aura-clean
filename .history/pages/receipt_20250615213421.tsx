// pages/receipt.tsx
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { format } from 'date-fns'

interface Receipt {
  id: string
  coin_id: string
  user_id: string
  amount: number
  created_at: string
  status: string
}

export default function ReceiptPage() {
  const [receipts, setReceipts] = useState<Receipt[]>([])

  useEffect(() => {
    const fetchReceipts = async () => {
      const { data, error } = await supabase
        .from('coin_activity')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) console.error('Error fetching receipts:', error)
      else setReceipts(data || [])
    }

    fetchReceipts()
  }, [])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Transaction Receipts</h1>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr>
            <th className="border-b p-2">Coin ID</th>
            <th className="border-b p-2">Amount</th>
            <th className="border-b p-2">Status</th>
            <th className="border-b p-2">Date</th>
          </tr>
        </thead>
        <tbody>
          {receipts.map((r) => (
            <tr key={r.id}>
              <td className="border-b p-2">{r.coin_id}</td>
              <td className="border-b p-2">{r.amount}</td>
              <td className="border-b p-2">{r.status}</td>
              <td className="border-b p-2">{format(new Date(r.created_at), 'PPpp')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
