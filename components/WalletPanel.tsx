import React from 'react'

export default function WalletPanel() {
  // Demo values—plug in wallet connection/real data later
  const balance = 1234.56
  const recentTx = [
    { id: 1, type: 'Deposit', amount: 500, date: '06/20/25' },
    { id: 2, type: 'Event Ticket', amount: -55, date: '06/21/25' }
  ]
  return (
    <div style={{ background: "#f8fafc", borderRadius: 12, padding: 20, margin: "24px 0" }}>
      <h3 style={{ marginBottom: 10 }}>💳 Wallet Balance</h3>
      <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 10 }}>${balance.toLocaleString()}</div>
      <h4>Recent Activity</h4>
      <ul>
        {recentTx.map(tx => (
          <li key={tx.id}>{tx.date}: {tx.type} {tx.amount < 0 ? '-' : '+'}${Math.abs(tx.amount)}</li>
        ))}
      </ul>
    </div>
  )
}
