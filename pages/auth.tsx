// pages/auth.tsx
import React from 'react'
import { useRouter } from 'next/router'
import AuthForm from '@/components/AuthForm'

export default function AuthPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <AuthForm onAuth={() => router.push('/')} />
    </div>
  )
}
