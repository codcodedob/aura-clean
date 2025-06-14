import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

interface Transaction {
  id: string
  coin_id: string
  coin_name: string
  amount: number
  created_at: string
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])

  useEffect(() => {
    const fetchTransactions = async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select(`id, coin_id, amount, created_at, coins (name)`)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Failed to load transactions:', error)
      } else {
        setTransactions(
          data.map((t: any) => ({
            id: t.id,
            coin_id: t.coin_id,
            coin_name: t.coins?.name || 'Unknown',
            amount: t.amount,
            created_at: t.created_at
          }))
        )
      }
    }

    fetchTransactions()
  }, [])

  return (
    <div style={{ padding: '2rem', backgroundColor: '#000', color: '#fff', minHeight: '100vh' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Investment Portfolio</h1>

      {transactions.length === 0 ? (
        <p>No transactions found.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ borderBottom: '1px solid #555', textAlign: 'left', padding: '0.5rem' }}>Coin</th>
              <th style={{ borderBottom: '1px solid #555', textAlign: 'right', padding: '0.5rem' }}>Amount</th>
              <th style={{ borderBottom: '1px solid #555', textAlign: 'right', padding: '0.5rem' }}>Date</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(tx => (
              <tr key={tx.id}>
                <td style={{ padding: '0.5rem' }}>{tx.coin_name}</td>
                <td style={{ padding: '0.5rem', textAlign: 'right' }}>${tx.amount.toFixed(2)}</td>
                <td style={{ padding: '0.5rem', textAlign: 'right' }}>{new Date(tx.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
