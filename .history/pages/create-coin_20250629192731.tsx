import React, { useState } from "react"

export default function CreateCoin() {
  const [musicFile, setMusicFile] = useState<File | null>(null)
  const [coinName, setCoinName] = useState("")
  const [marketScope, setMarketScope] = useState("global")
  const [marketCap, setMarketCap] = useState("1000000")

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) setMusicFile(e.target.files[0])
  }

  return (
    <div style={{ maxWidth: 400, margin: "60px auto", background: "#222", borderRadius: 12, padding: 24 }}>
      <h2 style={{ color: "#0af" }}>Create Your Coin</h2>
      <form>
        <input type="file" accept="audio/*" onChange={handleFile} style={{ marginBottom: 16, color: "#fff" }} />
        <input value={coinName} onChange={e => setCoinName(e.target.value)} placeholder="Coin Name" required style={{ width: "100%", marginBottom: 12, padding: 10, borderRadius: 6, background: "#1b1c20", color: "#fff", border: "1px solid #333" }} />
        <label style={{ color: "#aaa" }}>Market Scope:</label>
        <select value={marketScope} onChange={e => setMarketScope(e.target.value)} style={{ width: "100%", marginBottom: 12, padding: 10, borderRadius: 6 }}>
          <option value="global">Global</option>
          <option value="regional">Regional</option>
          <option value="niche">Niche</option>
        </select>
        <label style={{ color: "#aaa" }}>Market Cap:</label>
        <input value={marketCap} onChange={e => setMarketCap(e.target.value)} type="number" min={100} step={100} style={{ width: "100%", marginBottom: 16, padding: 10, borderRadius: 6 }} />
        <button type="submit" style={{ background: "#0af", color: "#000", borderRadius: 6, padding: 12, width: "100%" }}>Create Coin</button>
      </form>
    </div>
  )
}
