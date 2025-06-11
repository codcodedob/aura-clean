import React, { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

interface AuthFormProps {
  onAuth: () => void
}

export default function AuthForm({ onAuth }: AuthFormProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) return setError(error.message)
      onAuth()
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) return setError(error.message)
      onAuth()
    }
  }

  const handleForgot = async () => {
    setError('')
    if (!email) return setError('Enter your email first.')
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://aura.dmndx.live/update-password'
    })
    if (error) setError(error.message)
    else alert('✅ Check your inbox for the reset link.')
  }

  return (
    <div className="w-full max-w-md mx-auto p-8 bg-gray-900 rounded-xl shadow-xl">
      <div className="flex border-b border-gray-700 mb-6">
        {['login','signup'].map(m => (
          <button
            key={m}
            onClick={() => setMode(m as 'login'|'signup')}
            className={`flex-1 py-2 text-center font-semibold transition ${
              mode===m ? 'text-white border-b-2 border-cyan-500' : 'text-gray-400'
            }`}
          >
            {m==='login' ? 'Log In' : 'Sign Up'}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 text-gray-200">Email</label>
          <input
            type="email"
            value={email}
            onChange={e=>setEmail(e.target.value)}
            className="w-full bg-gray-800 text-white p-3 rounded-lg border border-gray-700"
            required
          />
        </div>

        <div>
          <label className="block mb-1 text-gray-200">Password</label>
          <input
            type="password"
            value={password}
            onChange={e=>setPassword(e.target.value)}
            className="w-full bg-gray-800 text-white p-3 rounded-lg border border-gray-700"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-lg"
        >
          {mode==='login' ? 'Log In' : 'Sign Up'}
        </button>

        {mode==='login' && (
          <button
            type="button"
            onClick={handleForgot}
            className="w-full text-center text-sm text-gray-400 hover:text-gray-200 underline"
          >
            Forgot password?
          </button>
        )}

        {error && <div className="text-red-500 text-center">{error}</div>}
      </form>
    </div>
  )
}
