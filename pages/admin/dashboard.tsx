// pages/admin/dashboard.tsx
import AdminDashboard from '@/components/AdminDashboard'
import { useState, useEffect } from 'react'

export default function DashboardPage() {
  const [tickers, setTickers] = useState<{ symbol: string; name: string; type: 'stock' | 'crypto' }[]>([])

  useEffect(() => {
    // Fetch static list or call your API route to fetch stock & crypto tickers
    fetch('/api/tickers')
      .then(res => res.json())
      .then(data => setTickers(data))
      .catch(err => console.error('Failed to load tickers', err))
  }, [])

  return <AdminDashboard tickers={tickers} />
}
