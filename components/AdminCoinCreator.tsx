import React, { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function AdminCoinCreator() {
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState('')
  const [cap, setCap] = useState('')
  const [type, setType] = useState<'stock' | 'crypto' | ''>('')
  const [symbol, setSymbol] = useState('')
  const [status, setStatus] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('⏳ Inserting...')

    const { error } = await supabase.from('aura_coins').insert([
      {
        name,
        emoji,
        cap: cap ? parseFloat(cap) : null,
        type,
        symbol
      }
    ])

    if (error) {
      console.error(error)
      setStatus('❌ Failed to insert coin.')
    } else {
      setStatus('✅ Coin inserted successfully!')
      setName('')
      setEmoji('')
      setCap('')
      setType('')
      setSymbol('')
    }

    setTimeout(() => setStatus(''), 4000)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block font-medium">Name</label>
        <input
          className="border rounded w-full p-2"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block font-medium">Emoji</label>
        <input
          className="border rounded w-full p-2"
          value={emoji}
          onChange={e => setEmoji(e.target.value)}
        />
      </div>
      <div>
        <label className="block font-medium">Cap</label>
        <input
          type="number"
          className="border rounded w-full p-2"
          value={cap}
          onChange={e => setCap(e.target.value)}
        />
      </div>
      <div>
        <label className="block font-medium">Type</label>
        <select
          className="border rounded w-full p-2"
          value={type}
          onChange={e => setType(e.target.value as any)}
          required
        >
          <option value="">Select type</option>
          <option value="stock">Stock</option>
          <option value="crypto">Crypto</option>
        </select>
      </div>
      <div>
        <label className="block font-medium">Symbol (for API sync)</label>
        <input
          className="border rounded w-full p-2"
          value={symbol}
          onChange={e => setSymbol(e.target.value)}
          required
        />
      </div>
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Create Coin
      </button>
      {status && <p className="mt-2">{status}</p>}
    </form>
  )
}
