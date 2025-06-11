import React, { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) {
      setError(error.message)
    } else {
      onSuccess()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-sm mx-auto p-6 bg-gray-900 rounded">
      <h2 className="text-white mb-4">Create Account</h2>
      <input
        type="email" placeholder="you@example.com"
        value={email} onChange={e=>setEmail(e.target.value)}
        className="w-full mb-3 p-2 rounded" required
      />
      <input
        type="password" placeholder="password"
        value={password} onChange={e=>setPassword(e.target.value)}
        className="w-full mb-3 p-2 rounded" required
      />
      <button className="w-full bg-cyan-600 text-white py-2 rounded">Sign Up</button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </form>
  )
}
