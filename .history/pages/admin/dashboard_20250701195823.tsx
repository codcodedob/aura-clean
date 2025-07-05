import React from "react";
import Link from "next/link";

const adminRoutes = [
  { path: "/admin/fam-awards", label: "FAM Awards Admin" },
  { path: "/admin/settings", label: "Site Settings" },
  { path: "/admin/coin-control", label: "Coin Control" },
  { path: "/admin/users", label: "User Management" },
  { path: "/admin/transactions", label: "Transactions" },
  { path: "/admin/analytics", label: "Site Analytics" },
  // Add more as needed
];

export default function AdminDashboard() {
  return (
    <div
      style={{
        maxWidth: 540,
        margin: "56px auto",
        padding: 32,
        background: "#151a23",
        borderRadius: 22,
        boxShadow: "0 4px 28px #0af3",
        color: "#fff",
      }}
    >
      <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 26 }}>Admin Dashboard</h1>
      <p style={{ marginBottom: 32, color: "#0af" }}>
        Quick access to all admin tools.
      </p>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {adminRoutes.map(({ path, label }) => (
          <li key={path} style={{ marginBottom: 20 }}>
            <Link
              href={path}
              style={{
                display: "block",
                padding: "16px 24px",
                background: "#232a39",
                borderRadius: 12,
                fontWeight: 600,
                color: "#0af",
                textDecoration: "none",
                fontSize: 19,
                boxShadow: "0 2px 10px #0008",
                transition: "background 0.23s, box-shadow 0.23s",
              }}
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
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
