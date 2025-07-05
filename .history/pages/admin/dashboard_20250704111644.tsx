// /components/AdminDashboard.tsx
import React from "react"
import { useRouter } from 'next/router'

export type Ticker = {
  symbol: string
  name: string
  type: "stock" | "crypto"
}

interface AdminDashboardProps {
  tickers?: Ticker[]
}

export default function AdminDashboard({ tickers = [] }: AdminDashboardProps) {
  const router = useRouter()

  return (
    <div style={{ padding: 32, background: '#101827', minHeight: '100vh' }}>
      <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 24, color: '#fff' }}>
        Admin Dashboard
      </h2>

      {/* Market Tickers Section */}
      <div
        style={{
          background: "#1f2937",
          borderRadius: 16,
          padding: 24,
          marginBottom: 36,
          boxShadow: "0 4px 32px rgba(10, 175, 255, 0.2)",
          minHeight: 120,
        }}
      >
        <h3 style={{ color: "#0af", fontWeight: 700, marginBottom: 12 }}>
          Market Tickers
        </h3>
        {tickers.length === 0 ? (
          <div style={{ color: "#888", fontStyle: "italic" }}>
            No tickers found.
          </div>
        ) : (
          <table style={{ width: "100%", color: "#fff", borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: '8px' }}>Symbol</th>
                <th style={{ textAlign: "left", padding: '8px' }}>Name</th>
                <th style={{ textAlign: "left", padding: '8px' }}>Type</th>
              </tr>
            </thead>
            <tbody>
              {tickers.map((ticker) => (
                <tr key={ticker.symbol} style={{ borderBottom: '1px solid #2e3a4e' }}>
                  <td style={{ padding: '8px' }}>{ticker.symbol}</td>
                  <td style={{ padding: '8px' }}>{ticker.name}</td>
                  <td style={{ padding: '8px' }}>{ticker.type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Admin Shortcuts */}
      <div>
        <h3 style={{ fontWeight: 700, color: "#0af", marginBottom: 16 }}>Admin Shortcuts</h3>
        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <li>
            <button
              onClick={() => router.push('/admin/fam-awards')}
              style={{
                background: '#222',
                color: '#0af',
                padding: '10px 16px',
                borderRadius: 8,
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              FAM Awards
            </button>
          </li>
          <li>
            <button
              onClick={() => router.push('/admin/settings')}
              style={{
                background: '#222',
                color: '#0af',
                padding: '10px 16px',
                borderRadius: 8,
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              Settings
            </button>
          </li>
          <li>
            <button
              onClick={() => router.push('/admin/coin-market')}
              style={{
                background: '#222',
                color: '#0af',
                padding: '10px 16px',
                borderRadius: 8,
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              Coin Market
            </button>
          </li>
          <li>
            <button
              onClick={() => router.push('/admin/department-media')}
              style={{
                background: '#222',
                color: '#0af',
                padding: '10px 16px',
                borderRadius: 8,
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              Department Media
            </button>
          </li>
          <li>
            <button
              onClick={() => router.push('/admin/endpoints')}
              style={{
                background: '#222',
                color: '#0af',
                padding: '10px 16px',
                borderRadius: 8,
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600,
                boxShadow: '0 2px 12px rgba(10,175,255,0.3)'
              }}
            >
              View Endpoints
            </button>
          </li>
        </ul>
      </div>
    </div>
  )
}
