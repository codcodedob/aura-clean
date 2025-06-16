import React from 'react'
import AdminCoinCreator from '@/components/AdminCoinCreator'

export default function AdminDashboard() {
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <AdminCoinCreator />
    </div>
  )
}
