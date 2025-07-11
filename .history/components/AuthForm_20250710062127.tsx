// components/AuthForm.tsx
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

    let res
    if (mode === 'login') {
      res = await supabase.auth.signInWithPassword({ email, password })
    } else {
      res = await supabase.auth.signUp({ email, password })
    }

    if (res.error) {
      setError(res.error.message)
    } else {
      onAuth()
    }
  }

  const handleReset = async () => {
    setError('')
    if (!email) return setError('Please enter your email first.')
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://aura.dmndx.live/update-password'
    })
    if (error) {
      setError(error.message)
    } else {
      alert('✅ Check your inbox for the password reset link.')
    }
  }

  return (
    <div className="w-full max-w-md mx-auto p-8 bg-gray-900 rounded-xl shadow-lg">
      {/* Mode Tabs */}
      <div className="flex mb-6">
        <button
          onClick={() => setMode('login')}
          className={`flex-1 py-2 font-semibold rounded-l ${
            mode === 'login'
              ? 'bg-cyan-600 text-white'
              : 'bg-gray-800 text-gray-400'
          }`}
        >
          Log In
        </button>
        <button
          onClick={() => setMode('signup')}
          className={`flex-1 py-2 font-semibold rounded-r ${
            mode === 'signup'
              ? 'bg-cyan-600 text-white'
              : 'bg-gray-800 text-gray-400'
          }`}
        >
          Create Account
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-300 mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full p-3 rounded bg-gray-800 text-white border border-gray-700"
            required
          />
        </div>

        <div>
          <label className="block text-gray-300 mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full p-3 rounded bg-gray-800 text-white border border-gray-700"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-semibold"
        >
          {mode === 'login' ? 'Log In' : 'Create Account'}
        </button>

        {mode === 'login' && (
          <button
            type="button"
            onClick={handleReset}
            className="w-full text-center text-sm text-gray-400 hover:text-gray-200 underline"
          >
            Forgot password?
          </button>
        )}

        {error && <p className="text-red-500 text-center mt-2">{error}</p>}
      </form>
    </div>
)
}
