import React, { useState, useEffect } from 'react'
import LoginForm from '@/components/LoginForm'
import { supabase } from '@/lib/supabaseClient'

export default function Home() {
  const [user, setUser] = useState(supabase.auth.getUser()?.data.user ?? null)

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <LoginForm onSuccess={() => {/* listener will update */}} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="space-y-4 text-center">
        <h1>Welcome, {user.email}</h1>
        <button
          onClick={() => supabase.auth.signOut()}
          className="bg-gray-700 px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>
    </div>
  )
}
