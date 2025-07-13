import React, { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Database } from "@/types/supabase"

export default function AdminCoinCreator() {
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState('')
  const [cap, setCap] = useState('')
  const [type, setType] = useState<'stock' | 'crypto' | ''>('')
  const [symbol, setSymbol] = useState('')
  const [status, setStatus] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setStatus('⏳ Inserting...')

    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error("Error getting user:", userError)
      setStatus("❌ No logged-in user.")
      return
    }

    const parsedCap = cap.trim() !== '' ? parseFloat(cap) : null

    const insertData: Database["public"]["Tables"]["aura_coins"]["Insert"] = {
      name,
      user_id: user.id,
      emoji: emoji || null,
      cap: parsedCap ?? 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      active: true,
      dividend_eligible: false,
      earnings_model: null,
      img_Url: null,
      is_featured: false,
      owner_name: null,
      price: 1.0,
      projected_cap: null,
      rarity: "common",
      scope: [],
      symbol: symbol || null,
      tagline: "",
      type: type || null,
      visible: true,
      vision: null,
    }

    const { error } = await supabase.from("aura_coins").insert([insertData])

    if (error) {
      console.error(error)
      setStatus("❌ Failed to insert coin.")
    } else {
      setStatus("✅ Coin inserted successfully!")
      setName("")
      setEmoji("")
      setCap("")
      setType("")
      setSymbol("")
    }

    setTimeout(() => setStatus(""), 4000)
  }

  const isSaving = status === '⏳ Inserting...'

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block font-medium">Name</label>
        <input
          className="border rounded w-full p-2"
          value={name}
          onChange={e => setName(e.target.value)}
          required
          disabled={isSaving}
        />
      </div>
      <div>
        <label className="block font-medium">Emoji</label>
        <input
          className="border rounded w-full p-2"
          value={emoji}
          onChange={e => setEmoji(e.target.value)}
          disabled={isSaving}
        />
      </div>
      <div>
        <label className="block font-medium">Cap</label>
        <input
          type="number"
          min="0"
          className="border rounded w-full p-2"
          value={cap}
          onChange={e => setCap(e.target.value)}
          disabled={isSaving}
        />
      </div>
      <div>
        <label className="block font-medium">Type</label>
        <select
          className="border rounded w-full p-2"
          value={type}
          onChange={e => setType(e.target.value as 'stock' | 'crypto' | '')}
          required
          disabled={isSaving}
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
          disabled={isSaving}
        />
      </div>
      <button
        type="submit"
        disabled={isSaving}
        className={`px-4 py-2 rounded text-white ${
          isSaving ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {isSaving ? 'Creating...' : 'Create Coin'}
      </button>
      {status && (
        <p
          className={`mt-2 ${
            status.includes('❌') ? 'text-red-500' : status.includes('✅') ? 'text-green-500' : ''
          }`}
        >
          {status}
        </p>
      )}
    </form>
  )
}
