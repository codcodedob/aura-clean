// /pages/contracts.tsx
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'

interface Contract {
  id: string
  client: string
  type: string
  status: string
  amount: number
  created_at: string
}

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([])
  const [loading, setLoading] = useState(true)
  const [onboarding, setOnboarding] = useState(false)
  const [income, setIncome] = useState<number>(0)

  useEffect(() => {
    // Fetch contracts
    supabase.from('contracts').select('*').then(({ data }) => {
      setContracts(data || [])
      setLoading(false)
    })
    // Fetch income - demo, replace with real query
    supabase.from('contracts')
      .select('amount')
      .eq('status', 'active')
      .then(({ data }) => setIncome((data || []).reduce((a, c) => a + c.amount, 0)))
  }, [])

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: 32 }}>
      <h1 style={{ fontWeight: 700, fontSize: 30, marginBottom: 14 }}>📄 Contracts & Consultation</h1>
      <p style={{ color: '#64748b', marginBottom: 28, fontSize: 17 }}>
        All legal agreements, client contracts, and consultation onboarding. Manage investments, track income, and review project documents.
      </p>
