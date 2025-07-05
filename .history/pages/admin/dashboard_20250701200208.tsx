import Link from "next/link";
import type { Ticker } from "@/pages/admin/dashboard";

interface AdminDashboardProps {
  tickers: Ticker[];
}

export default function AdminDashboard({ tickers }: AdminDashboardProps) {
  const adminRoutes = [
    { path: "/admin/fam-awards", label: "FAM Awards Admin" },
    { path: "/admin/settings", label: "Site Settings" },
    { path: "/admin/coin-control", label: "Coin Control" },
    { path: "/admin/users", label: "User Management" },
    { path: "/admin/transactions", label: "Transactions" },
    { path: "/admin/analytics", label: "Site Analytics" },
  ];

  return (
    <div
      style={{
        maxWidth: 680,
        margin: "40px auto",
        padding: 32,
        background: "#151a23",
        borderRadius: 22,
        boxShadow: "0 4px 28px #0af3",
        color: "#fff",
      }}
    >
      <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 26 }}>Admin Dashboard</h1>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 22, marginBottom: 12 }}>Admin Tools</h2>
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {adminRoutes.map(({ path, label }) => (
            <li key={path} style={{ marginBottom: 18 }}>
              <Link
                href={path}
                style={{
                  display: "block",
                  padding: "12px 22px",
                  background: "#232a39",
                  borderRadius: 12,
                  fontWeight: 600,
                  color: "#0af",
                  textDecoration: "none",
                  fontSize: 17,
                  boxShadow: "0 2px 10px #0008",
                  transition: "background 0.23s, box-shadow 0.23s",
                }}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div style={{ margin: "38px 0 30px 0" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h2 style={{ fontSize: 22, marginBottom: 6 }}>Tickers</h2>
          <Link
            href="/admin/ticker-creator"
            style={{
              background: "#0af",
              color: "#151a23",
              fontWeight: 700,
              padding: "10px 20px",
              borderRadius: 9,
              textDecoration: "none",
              fontSize: 16,
              boxShadow: "0 1px 8px #0af8",
              marginLeft: 12,
            }}
          >
            + Add Ticker
          </Link>
        </div>
        <div style={{
          background: "#222a39",
          borderRadius: 11,
          padding: "18px 18px 10px 18px",
          marginTop: 4,
          marginBottom: 0,
          minHeight: 80,
        }}>
          {tickers.length === 0 && (
            <div style={{ color: "#888", fontStyle: "italic" }}>No tickers found.</div>
          )}
          {tickers.length > 0 && (
            <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
              {tickers.map(t => (
                <li key={t.symbol} style={{ marginBottom: 6 }}>
                  <span style={{ fontWeight: 600, color: t.type === "crypto" ? "#0f8" : "#0af" }}>
                    {t.symbol}
                  </span>
                  <span style={{ marginLeft: 12 }}>{t.name}</span>
                  <span style={{ marginLeft: 16, color: "#8af", fontSize: 12 }}>{t.type}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <Link
        href="/"
        style={{
          marginTop: 38,
          display: "inline-block",
          color: "#fff",
          textDecoration: "underline",
        }}
      >
        ← Return to Site
      </Link>
    </div>
  );
}
