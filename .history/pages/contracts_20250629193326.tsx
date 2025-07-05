// pages/contracts.tsx
import React from "react"

export default function Contracts() {
  return (
    <div style={{
      minHeight: '100vh',
      background: "#101017",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 40,
    }}>
      <div style={{
        display: "flex",
        gap: 40,
        maxWidth: 1100,
        width: "100%",
        justifyContent: "center"
      }}>
        {/* Hosting Plan */}
        <div style={{
          flex: 1,
          background: "#181825",
          borderRadius: 16,
          boxShadow: "0 8px 40px #0af2",
          padding: 32,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          minWidth: 340,
          border: "3px solid #0af6"
        }}>
          <h2 style={{ color: "#0af", marginBottom: 14, fontSize: 28 }}>Artist Hosting & Promotion</h2>
          <ul style={{ color: "#bbb", fontSize: 18, margin: "0 0 28px 0", paddingLeft: 24, textAlign: "left", width: "100%", listStyle: "disc" }}>
            <li>Host music/art on platform</li>
            <li>Real-time stats & analytics</li>
            <li>Automated royalty payouts</li>
            <li>Customizable artist page</li>
            <li>Featured on HIPSESSION launches</li>
            <li>Platform community access</li>
          </ul>
          <div style={{ marginBottom: 10, color: "#fff", fontSize: 18 }}>
            <strong>10% platform fee</strong>
            <br />
            <span style={{ color: "#0af", fontWeight: 700 }}>$99/year</span> hosting fee<br />
            <span style={{ fontSize: 14, color: "#bbb" }}>(waived for first 100 signups)</span>
          </div>
          <button style={{
            marginTop: "auto",
            background: "#0af",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "12px 32px",
            fontWeight: 700,
            fontSize: 18,
            cursor: "pointer",
            marginBottom: 8,
            boxShadow: "0 2px 10px #0af3"
          }}>
            Apply for Hosting
          </button>
        </div>

        {/* Custom App Plan */}
        <div style={{
          flex: 1,
          background: "#fff",
          borderRadius: 16,
          boxShadow: "0 8px 40px #3332",
          padding: 32,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          minWidth: 340,
          border: "3px solid #0af2"
        }}>
          <h2 style={{ color: "#181825", marginBottom: 14, fontSize: 28 }}>Custom Branded App</h2>
          <ul style={{ color: "#333", fontSize: 18, margin: "0 0 28px 0", paddingLeft: 24, textAlign: "left", width: "100%", listStyle: "disc" }}>
            <li>Fully branded app experience</li>
            <li>All platform hosting features</li>
            <li>White-glove onboarding</li>
            <li>Premium support & analytics</li>
            <li>Custom features & payment integration</li>
            <li>Priority HIPSESSION launch</li>
          </ul>
          <div style={{ marginBottom: 10, color: "#181825", fontSize: 18 }}>
            <strong>$1000 flat fee</strong>
            <br />
            <strong>+ 10% of app revenue</strong>
            <br />
            <span style={{ fontSize: 14, color: "#666" }}>(negotiable for major launches)</span>
          </div>
          <button style={{
            marginTop: "auto",
            background: "#0af",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "12px 32px",
            fontWeight: 700,
            fontSize: 18,
            cursor: "pointer",
            marginBottom: 8,
            boxShadow: "0 2px 10px #0af3"
          }}>
            Book Consultation
          </button>
        </div>
      </div>
    </div>
  )
}
