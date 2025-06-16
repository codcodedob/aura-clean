// pages/transactions.tsx
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Transaction {
  id: string
  coin_id: string
  amount: number
  status: string
  created_at: string
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])

  useEffect(() => {
    fetch('/api/transactions')
      .then(res => res.json())
      .then(data => setTransactions(data))
      .catch(err => console.error('Failed to load transactions', err))
  }, [])

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Transaction History</h1>
      <ul className="space-y-2">
        {transactions.map((tx: Transaction) => (
          <li key={tx.id} className="border rounded p-2">
            <div><strong>Coin:</strong> {tx.coin_id}</div>
            <div><strong>Amount:</strong> {tx.amount}</div>
            <div><strong>Status:</strong> {tx.status}</div>
            <div><strong>Date:</strong> {new Date(tx.created_at).toLocaleString()}</div>
          </li>
        ))}
      </ul>
      <div className="mt-4">
        <Link href="/">
          <span className="text-blue-500 underline cursor-pointer">Go back home</span>
        </Link>
      </div>
    </div>
  )
}
