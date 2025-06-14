import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabaseClient'
import Confetti from 'react-confetti'

export default function ReceiptPage() {
  const [latestTx, setLatestTx] = useState<any>(null)
  const [showConfetti, setShowConfetti] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchLatest = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.push('/login')

      const { data, error } = await supabase
        .from('coin_activity')
        .select(`amount, created_at, coins(name, projected_cap, dividend_eligible)`)\
.eq('type', 'purchase') 
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)

      if (error) {
        console.error('Failed to load receipt:', error)
      } else {
        setLatestTx(data?.[0] || null)
        setTimeout(() => setShowConfetti(false), 4000) // confetti lasts 4 seconds
      }
    }

    fetchLatest()
  }, [])

  if (!latestTx) return <p style={{ color: '#fff', padding: '2rem' }}>Loading your receipt...</p>

  const { amount, created_at, coins } = latestTx

  return (
    <div style={{ backgroundColor: '#000', color: '#fff', minHeight: '100vh', padding: '2rem', position: 'relative' }}>
      {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} />}

      <h1 style={{ fontSize: '2rem', color: '#0f0' }}>✅ Purchase Successful</h1>
      <p style={{ fontSize: '1.2rem' }}>
        Thank you for investing in <strong>{coins?.name ?? 'Unnamed Coin'}</strong>.
      </p>

      <div style={{ background: '#111', padding: '1.5rem', borderRadius: '8px', marginTop: '1rem', border: '1px solid #333' }}>
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
