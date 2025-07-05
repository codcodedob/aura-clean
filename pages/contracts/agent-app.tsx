// pages/contracts/agent-app.tsx
import React, { useState } from 'react'

export default function AgentAppContract() {
  const [form, setForm] = useState({
    appType: '',
    features: [] as string[],
    description: '',
    budget: '',
    contact: ''
  })
  const [submitted, setSubmitted] = useState(false)

  const appTypes = [
    "One-Page Music Host",
    "Custom Chatbot",
    "NFT Mint App",
    "Portfolio Site",
    "eCommerce",
    "Other"
  ]
  const features = [
    "Audio Upload & Stream",
    "Payments & Subscriptions",
    "Messaging/Chat",
    "Analytics Dashboard",
    "Downloads",
    "User Login/Auth",
    "Push Notifications",
    "Admin Panel"
  ]

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value, type, checked } = e.target
    if (type === "checkbox") {
      setForm(f =>
        checked
          ? { ...f, features: [...f.features, value] }
          : { ...f, features: f.features.filter(feat => feat !== value) }
      )
    } else {
      setForm(f => ({ ...f, [name]: value }))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    // TODO: send to Supabase/Firebase/db
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div style={{ padding: 36, maxWidth: 600, margin: "60px auto", background: "#191924", borderRadius: 12, color: "#fff" }}>
        <h2>Thank you! 🙌</h2>
        <p>Your request is in the queue.<br />Please check your inbox and contracts panel for your custom quote soon.</p>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        background: "#191924",
        maxWidth: 700,
        margin: "60px auto",
        padding: 36,
        borderRadius: 16,
        color: "#fff",
        boxShadow: "0 2px 24px #0af3"
      }}
    >
      <h2 style={{ color: "#0af", marginBottom: 18 }}>AI Agent App Creation Contract</h2>

      <label style={{ display: "block", marginBottom: 12 }}>
        App Type<br />
        <select
          name="appType"
          value={form.appType}
          onChange={handleChange}
          required
          style={{ padding: 10, borderRadius: 6, width: "100%", marginTop: 5 }}
        >
          <option value="">Select...</option>
          {appTypes.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </label>

      <label style={{ display: "block", marginBottom: 12 }}>
        App Features (select all that apply):<br />
        {features.map(f => (
          <label key={f} style={{ marginRight: 14 }}>
            <input
              type="checkbox"
              name="features"
              value={f}
              checked={form.features.includes(f)}
              onChange={handleChange}
            /> {f}
          </label>
        ))}
      </label>

      <label style={{ display: "block", marginBottom: 12 }}>
        Describe your needs & goals<br />
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={4}
          required
          style={{ width: "100%", padding: 10, borderRadius: 6, marginTop: 5 }}
        />
      </label>

      <label style={{ display: "block", marginBottom: 12 }}>
        Estimated Budget (optional)<br />
        <input
          type="text"
          name="budget"
          value={form.budget}
          onChange={handleChange}
          placeholder="$"
          style={{ padding: 10, borderRadius: 6, width: "100%", marginTop: 5 }}
        />
      </label>

      <label style={{ display: "block", marginBottom: 24 }}>
        Contact Email (required for follow-up)<br />
        <input
          type="email"
          name="contact"
          value={form.contact}
          onChange={handleChange}
          required
          style={{ padding: 10, borderRadius: 6, width: "100%", marginTop: 5 }}
        />
      </label>

      <button type="submit" style={{
        background: "#0af",
        color: "#fff",
        padding: "12px 32px",
        fontWeight: 700,
        fontSize: 18,
        border: "none",
        borderRadius: 8,
        boxShadow: "0 2px 10px #0af3",
        cursor: "pointer"
      }}>
        Request a Quote
      </button>
    </form>
  )
}
