// /components/AdminDashboard.tsx
import React, { useState } from "react";
import { useRouter } from "next/router";
import AdminEndpointsPanel from "@/components/AdminEndpointsPanel";
import AdminAuditTrailPanel from "@/components/AdminAuditTrailPanel";
import AdminSLAPanel from "@/components/AdminSLAPanel";
import ActivityWidget from "@/components/ActivityWidget";

import type { Ticker } from "@/pages/admin/dashboard";

interface AdminDashboardProps {
  tickers?: Ticker[];
}

export default function AdminDashboard({ tickers = [] }: AdminDashboardProps) {
  const router = useRouter();

  // Example activities - replace with your real activity data source
  const [activities] = useState([
    { id: "1", title: "Review SLA Compliance", status: "pending", link: "/admin/sla" },
    { id: "2", title: "Audit Logs Update", status: "done", link: "/admin/audit" },
    { id: "3", title: "Add New Coin to Market", status: "future", link: "/admin/coin-market" },
    { id: "4", title: "Check Network Endpoints", status: "pending", link: "/admin/endpoints" },
  ]);

  return (
    <div style={{ padding: 32, background: "#101827", minHeight: "100vh", color: "#fff" }}>
      <h1 style={{ fontSize: 32, fontWeight: "bold", marginBottom: 24 }}>Admin Dashboard</h1>

      {/* Navigation Buttons */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 32,
        }}
      >
        {[
          { label: "FAM Awards", href: "/admin/fam-awards" },
          { label: "Settings", href: "/admin/settings" },
          { label: "Coin Market", href: "/admin/coin-market" },
          { label: "Department Media", href: "/admin/department-media" },
          { label: "View Endpoints", href: "/admin/endpoints" },
          { label: "Audit Trail", href: "/admin/audit" },
          { label: "SLA Compliance", href: "/admin/sla" },
          { label: "Video Settings", href: "/admin/video" },
        ].map(({ label, href }) => (
          <button
            key={href}
            onClick={() => router.push(href)}
            style={{
              background: "#222",
              color: "#0af",
              padding: "10px 16px",
              borderRadius: 8,
              border: "none",
              cursor: "pointer",
              fontWeight: 600,
              boxShadow: href === "/admin/endpoints" ? "0 2px 12px rgba(10,175,255,0.3)" : undefined,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Market Tickers Section */}
      <section
        style={{
          background: "#1f2937",
          borderRadius: 16,
          padding: 24,
          marginBottom: 36,
          boxShadow: "0 4px 32px rgba(10, 175, 255, 0.2)",
          minHeight: 120,
          color: "#fff",
        }}
      >
        <h2 style={{ color: "#0af", fontWeight: 700, marginBottom: 12 }}>Market Tickers</h2>
        {tickers.length === 0 ? (
          <div style={{ color: "#888", fontStyle: "italic" }}>No tickers found.</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: "8px" }}>Symbol</th>
                <th style={{ textAlign: "left", padding: "8px" }}>Name</th>
                <th style={{ textAlign: "left", padding: "8px" }}>Type</th>
              </tr>
            </thead>
            <tbody>
              {tickers.map((ticker) => (
                <tr key={ticker.symbol} style={{ borderBottom: "1px solid #2e3a4e" }}>
                  <td style={{ padding: "8px" }}>{ticker.symbol}</td>
                  <td style={{ padding: "8px" }}>{ticker.name}</td>
                  <td style={{ padding: "8px" }}>{ticker.type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* Panels Section */}
      <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
        <div>
          <AdminSLAPanel />
          <div style={{ marginTop: 32 }}>
            <AdminEndpointsPanel />
          </div>
        </div>

        <div>
          <AdminAuditTrailPanel />
          {/* Other panels can go here, e.g., Video Settings, FAM Awards, Coin Market, etc. */}
        </div>
      </section>

      {/* Activity Widget */}
      <ActivityWidget activities={activities} />
    </div>
  );
}
