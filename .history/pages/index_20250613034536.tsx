import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface Transaction {
  id: string
  coin_id: string
  coin_name: string
  amount: number
  created_at: string
  dividend_eligible: boolean
  projected_cap: number
  projected_earnings: number
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [activeInput, setActiveInput] = useState<string | null>(null)

  useEffect(() => {
    const fetchTransactions = async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select(`id, coin_id, amount, created_at, coins (name, projected_cap, dividend_eligible)`)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Failed to load transactions:', error)
      } else {
        setTransactions(
          data.map((t: any) => ({
            id: t.id,
            coin_id: t.coin_id,
            coin_name: t.coins?.name || 'Unknown',
            amount: t.amount,
            created_at: t.created_at,
            projected_cap: t.coins?.projected_cap || 0,
            dividend_eligible: t.coins?.dividend_eligible || false,
            projected_earnings: t.coins?.dividend_eligible ? (t.amount / t.coins?.projected_cap) * 100 : 0
          }))
        )
      }
    }

    fetchTransactions()
  }, [])

  const totalInvested = transactions.reduce((sum, tx) => sum + tx.amount, 0)
  const totalProjectedEarnings = transactions.reduce((sum, tx) => sum + tx.projected_earnings, 0)

  const exportToCSV = () => {
    const header = ['Coin', 'Amount', 'Date', 'Projected Cap', 'Dividend Eligible', 'Projected Earnings']
    const rows = transactions.map(tx => [
      tx.coin_name,
      tx.amount.toFixed(2),
      new Date(tx.created_at).toLocaleString(),
      tx.projected_cap.toFixed(2),
      tx.dividend_eligible ? 'Yes' : 'No',
      `$${tx.projected_earnings.toFixed(2)}`
    ])
    const csvContent = [header, ...rows].map(e => e.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.setAttribute('download', 'aura_transactions.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const portfolioChartData = transactions.reduce((acc, tx) => {
    const date = new Date(tx.created_at).toLocaleDateString()
    const existing = acc.find(d => d.date === date)
    if (existing) {
      existing.total += tx.amount
    } else {
      acc.push({ date, total: tx.amount })
    }
    return acc
  }, [] as { date: string; total: number }[])

  return (
    <div style={{ padding: '2rem', backgroundColor: '#000', color: '#fff', minHeight: '100vh' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Investment Portfolio</h1>
      <p style={{ fontSize: '1.2rem' }}>Total Invested: ${totalInvested.toFixed(2)}</p>
      <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Projected Earnings: ${totalProjectedEarnings.toFixed(2)}</p>
      <button onClick={exportToCSV} style={{ marginBottom: '2rem', padding: '8px 16px', borderRadius: 8, background: '#0af', color: '#000', fontWeight: 'bold' }}>
        📥 Export CSV
      </button>

      <div style={{ height: 300, background: '#111', padding: '1rem', borderRadius: 8, marginBottom: '2rem' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={portfolioChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="date" stroke="#888" />
            <YAxis stroke="#888" />
            <Tooltip />
            <Line type="monotone" dataKey="total" stroke="#0af" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {transactions.length === 0 ? (
        <p>No transactions found.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ borderBottom: '1px solid #555', textAlign: 'left', padding: '0.5rem' }}>Coin</th>
              <th style={{ borderBottom: '1px solid #555', textAlign: 'right', padding: '0.5rem' }}>Amount</th>
              <th style={{ borderBottom: '1px solid #555', textAlign: 'right', padding: '0.5rem' }}>Date</th>
              <th style={{ borderBottom: '1px solid #555', textAlign: 'right', padding: '0.5rem' }}>Projected Cap</th>
              <th style={{ borderBottom: '1px solid #555', textAlign: 'center', padding: '0.5rem' }}>Dividends</th>
              <th style={{ borderBottom: '1px solid #555', textAlign: 'right', padding: '0.5rem' }}>Est. Earnings</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(tx => (
              <tr key={tx.id}>
                <td style={{ padding: '0.5rem' }}>{tx.coin_name}</td>
                <td style={{ padding: '0.5rem', textAlign: 'right' }}>
                  {activeInput === tx.id && (
                    <input
                      type="number"
                      min="1"
                      placeholder="Enter amount"
                      style={{ width: '100px', marginRight: '0.5rem' }}
                    />
                  )}
                  <button
                    onClick={() => setActiveInput(tx.id)}
                    style={{ padding: '4px 12px', background: '#0af', color: '#000', borderRadius: '6px', border: 'none' }}
                  >
                    Buy
                  </button>
                </td>
                <td style={{ padding: '0.5rem', textAlign: 'right' }}>{new Date(tx.created_at).toLocaleString()}</td>
                <td style={{ padding: '0.5rem', textAlign: 'right' }}>${tx.projected_cap.toFixed(2)}</td>
                <td style={{ padding: '0.5rem', textAlign: 'center' }}>{tx.dividend_eligible ? '✅' : '—'}</td>
                <td style={{ padding: '0.5rem', textAlign: 'right' }}>${tx.projected_earnings.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
