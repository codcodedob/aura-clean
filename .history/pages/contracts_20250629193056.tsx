// pages/contracts.tsx
import React from "react"

export default function Contracts() {
  return (
    <div style={{ maxWidth: 620, margin: "60px auto", background: "#181825", padding: 36, borderRadius: 14 }}>
      <h2 style={{ color: "#0af", fontWeight: 700 }}>Artist Hosting & Custom App Contracts</h2>
      <div style={{ margin: "28px 0" }}>
        <h3 style={{ color: "#fff" }}>Hosting & Promotion</h3>
        <ul style={{ color: "#bbb", marginBottom: 16 }}>
          <li>Get your music/art hosted on the platform</li>
          <li>Real-time stats, listener analytics, and earnings dashboard</li>
          <li>Automated royalty payouts per stream</li>
          <li>Customizable artist page, branding, and profile tools</li>
          <li>Featured on HIPSESSION and platform launches</li>
        </ul>
        <p style={{ color: "#fff" }}>
          <b>Revenue share:</b> 10% platform fee<br />
          <b>Hosting & promo fee:</b> <span style={{ color: "#0af" }}>$99/year</span> (waived for first 100 signups)
        </p>
        <button style={{ background: "#0af", color: "#000", borderRadius: 6, padding: "10px 16px", fontWeight: 700, marginTop: 8 }}>
          Apply for Hosting
        </button>
      </div>
      <hr style={{ border: "1px solid #222", margin: "36px 0 28px 0" }} />
      <div>
        <h3 style={{ color: "#fff" }}>Custom Branded App</h3>
        <ul style={{ color: "#bbb", marginBottom: 16 }}>
          <li>Your own fully branded music/app experience</li>
          <li>All hosting/promo features included</li>
          <li>White-glove onboarding and launch support</li>
          <li>Custom features, payment integration, and more</li>
        </ul>
        <p style={{ color: "#fff" }}>
          <b>Pricing:</b> $1000 flat fee +<br />
          <b>10% of all app revenue</b> (negotiable for large launches)
        </p>
        <button style={{ background: "#fff", color: "#0af", border: "2px solid #0af", borderRadius: 6, padding: "10px 16px", fontWeight: 700, marginTop: 8 }}>
          Start Custom App Consultation
        </button>
      </div>
    </div>
  )
}
