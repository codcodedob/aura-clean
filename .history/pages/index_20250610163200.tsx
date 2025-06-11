// pages/index.tsx

import React, { useState, useEffect, CSSProperties } from 'react'
import AuthForm from '@/components/AuthForm'
import { supabase } from '@/lib/supabaseClient'
import type { User } from '@supabase/supabase-js'

// Styles
const overlayStyle: CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  backgroundColor: 'rgba(0,0,0,0.6)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 100
}

const centerStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100vh'
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)

  // On mount: fetch current user and subscribe to changes
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user: u } }) => {
      setUser(u)
    })
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => setUser(session?.user ?? null)
    )
    return () => listener.subscription.unsubscribe()
  }, [])

  // Log out helper
  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  // If not signed in, show overlayed AuthForm
  if (!user) {
    return (
      <div style={{ background: '#000', minHeight: '100vh' }}>
        {/* Dashboard can live behind here if you like */}
        <div style={overlayStyle}>
          <AuthForm onAuth={() => {/* onAuth triggers getAuth listener */}} />
        </div>
      </div>
    )
  }

  // Once signed in, show a simple welcome
  return (
    <div style={{ background: '#000', color: '#fff', minHeight: '100vh', position: 'relative' }}>
      <button
        onClick={logout}
        style={{
          position: 'absolute',
          top: 20,
          right: 20,
          background: '#333',
          color: '#fff',
          border: 'none',
          borderRadius: 4,
          padding: '8px 12px',
          cursor: 'pointer'
        }}
      >
        Logout
      </button>

      <div style={centerStyle}>
        <h1 style={{ fontSize: 32, marginBottom: 16 }}>Welcome, {user.email}</h1>
        <p style={{ color: '#999' }}>You’re now signed in.</p>
      </div>
    </div>
  )
}

// Disable static export; use SSR so auth runs at request time
export async function getServerSideProps() {
  return { props: {} }
}
