import React from "react"

export default function Contracts() {
  return (
    <div style={{ maxWidth: 560, margin: "80px auto", background: "#1b1c20", padding: 32, borderRadius: 18 }}>
      <h2 style={{ color: "#0af" }}>Artist Hosting & Custom App Contracts</h2>
      <div style={{ marginBottom: 36 }}>
        <h3 style={{ color: "#fff" }}>Host as an Artist / Invest</h3>
        <p style={{ color: "#bbb" }}>
          Join our platform, get hosted as an artist, split revenue, or invest in the app. Easy onboarding and legal agreements for revenue split, project collaboration, and more.
        </p>
        <button style={{ background: "#0af", color: "#000", padding: 10, borderRadius: 8, fontWeight: "bold" }}>Get Hosted / Invest</button>
      </div>
      <div>
        <h3 style={{ color: "#fff" }}>Request Custom App</h3>
        <p style={{ color: "#bbb" }}>
          Need your own branded app or advanced features? Book a premium consultation and get a custom contract/quote.
        </p>
        <button style={{ background: "#fff", color: "#0af", padding: 10, borderRadius: 8, border: "2px solid #0af", fontWeight: "bold" }}>Request Custom App</button>
      </div>
    </div>
  )
}
