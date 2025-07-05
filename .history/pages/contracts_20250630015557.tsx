import React, { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function MintCoinModal({ user, onSuccess }: { user: any, onSuccess: () => void }) {
  const [name, setName] = useState(user ? `${user.name ?? user.email.split('@')[0]}` : '')
  const [desc, setDesc] = useState('')
  const [scope, setScope] = useState('')
  const [divEnabled, setDivEnabled] = useState(false)
  const [divTrigger, setDivTrigger] = useState('')
  const [divPercent, setDivPercent] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleMint() {
    setLoading(true)
    setError('')
    const { error } = await supabase.from('aura_coins').insert([{
      name: name + ' Coin',
      user_id: user.id,
      description: desc,
      scope,
      dividend_enabled: divEnabled,
      dividend_trigger: divEnabled ? divTrigger : null,
      dividend_percent: divEnabled ? divPercent : null,
      price: 1, // default launch price
      cap: 0
    }])
    setLoading(false)
    if (error) setError(error.message)
    else onSuccess()
  }

  return (
    <div style={{ padding: 28, background: '#222', color: '#fff', borderRadius: 12, width: 400 }}>
      <h2>Mint Your Name Coin</h2>
      <p>Create your own investment token that grows with your career and projects.</p>
      <input value={name} onChange={e => setName(e.target.value)} placeholder="Coin Name" style={{ width: '100%', marginBottom: 12, padding: 8 }} />
      <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Describe your scope, art, or mission" style={{ width: '100%', marginBottom: 12, padding: 8 }} />
      <input value={scope} onChange={e => setScope(e.target.value)} placeholder="Market / Genre / Scope" style={{ width: '100%', marginBottom: 12, padding: 8 }} />
      <label style={{ display: 'block', marginBottom: 12 }}>
        <input type="checkbox" checked={divEnabled} onChange={e => setDivEnabled(e.target.checked)} /> Enable Dividend Kicker?
      </label>
      {divEnabled && (
        <>
          <input value={divTrigger} onChange={e => setDivTrigger(e.target.value)} placeholder="Dividend Trigger (e.g., 10k market cap, 100 holders)" style={{ width: '100%', marginBottom: 12, padding: 8 }} />
          <input type="number" value={divPercent} onChange={e => setDivPercent(+e.target.value)} min={1} max={100} style={{ width: '100%', marginBottom: 12, padding: 8 }} placeholder="Dividend %" />
        </>
      )}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button onClick={handleMint} disabled={loading} style={{ width: '100%', padding: 12, background: '#0af', color: '#111', fontWeight: 600, borderRadius: 8 }}>
        {loading ? 'Minting...' : 'Mint Coin'}
      </button>
    </div>
  )
}
