// /components/AdminDashboard.tsx
import React from "react"

export type Ticker = {
  symbol: string
  name: string
  type: "stock" | "crypto"
}

interface AdminDashboardProps {
  tickers?: Ticker[]
}

export default function AdminDashboard({ tickers = [] }: AdminDashboardProps) {
  return (
    <div style={{ padding: 32 }}>
      <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 24 }}>
        Admin Dashboard
      </h2>

      {/* Section: Tickers Table */}
      <div
        style={{
          background: "#191c24",
          borderRadius: 16,
          padding: 24,
          marginBottom: 36,
          boxShadow: "0 4px 32px #0af3",
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
          <table style={{ width: "100%", color: "#fff" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left" }}>Symbol</th>
                <th style={{ textAlign: "left" }}>Name</th>
                <th style={{ textAlign: "left" }}>Type</th>
              </tr>
            </thead>
            <tbody>
              {tickers.map((ticker) => (
                <tr key={ticker.symbol}>
                  <td>{ticker.symbol}</td>
                  <td>{ticker.name}</td>
                  <td>{ticker.type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Admin Shortcuts */}
      <div style={{ marginTop: 24 }}>
        <h3 style={{ fontWeight: 700, color: "#0af" }}>Admin Shortcuts</h3>
        <ul>
          <li>
            <a href="/admin/fam-awards" style={{ color: "#0af" }}>
              FAM Awards Manager
            </a>
          </li>
          <li>
            <a href="/admin/settings" style={{ color: "#0af" }}>
              Settings Manager
            </a>
          </li>
          <li>
            <a href="/admin/coin-market" style={{ color: "#0af" }}>
              Coin Market Manager
            </a>
          </li>
          {/* Add more links as needed */}
        </ul>
      </div>
    </div>
  )
}
