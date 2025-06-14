import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabaseClient'

export default function ReceiptPage() {
  const [latestTx, setLatestTx] = useState(null)
  const router = useRouter()

  useEffect(() => {
    const fetchLatest = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.push('/login')

      const { data, error } = await supabase
        .from('transactions')
        .select(`*, coins(name, projected_cap, dividend_eligible)`)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)

      if (error) {
        console.error('Failed to load receipt:', error)
      } else {
        setLatestTx(data?.[0] || null)
      }
    }

    fetchLatest()
  }, [])

  if (!latestTx) return <p style={{ color: '#fff', padding: '2rem' }}>Loading your receipt...</p>

  const { amount, created_at, coins } = latestTx

  return (
    <div style={{ backgroundColor: '#000', color: '#fff', minHeight: '100vh', padding: '2rem' }}>
      <h1>✅ Purchase Successful</h1>
      <p>Thank you for investing in <strong>{coins?.name ?? 'Unnamed Coin'}</strong>.</p>

      <div style={{ background: '#111', padding: '1rem', borderRadius: '8px', marginTop: '1rem' }}>
        <p><strong>Amount:</strong> ${amount.toFixed(2)}</p>
        <p><strong>Date:</strong> {new Date(created_at).toLocaleString()}</p>
        <p><strong>Projected Cap:</strong> ${coins?.projected_cap?.toFixed(2)}</p>
        <p><strong>Dividend Eligible:</strong> {coins?.dividend_eligible ? 'Yes' : 'No'}</p>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <a href="/transactions" style={{ color: '#0af', textDecoration: 'underline' }}>📊 View My Portfolio</a>
      </div>
    </div>
  )
}
