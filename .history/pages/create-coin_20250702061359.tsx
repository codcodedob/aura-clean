// pages/create-coin.tsx
import React, { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const SCOPE_OPTIONS = [
  "Music Artist",
  "Multi-Medium Artist",
  "Streamer",
  "Content Public Figure",
  "Designer",
  "Inventor",
  "Producer (Film)",
  "Producer (Music)",
  "Writer (Film)",
  "Writer (Music)",
];

export default function CreateCoinPage() {
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [scopes, setScopes] = useState<string[]>([]);
  const [dividends, setDividends] = useState(false);
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState("");

  const handleScopeChange = (scope: string) => {
    setScopes(scopes =>
      scopes.includes(scope)
        ? scopes.filter(s => s !== scope)
        : [...scopes, scope]
    );
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setMessage("");
    const { data, error } = await supabase.from("aura_coins").insert([
      {
        name,
        symbol,
        scope: scopes,
        dividends_eligible: dividends,
      },
    ]);
    setCreating(false);
    setMessage(error ? error.message : "Coin created successfully!");
  };

  return (
    <div style={{ maxWidth: 520, margin: "40px auto", background: "#181825", padding: 32, borderRadius: 12, color: "#fff" }}>
      <h1>Create Your Coin</h1>
      <form onSubmit={handleCreate}>
        <label>Name</label>
        <input value={name} onChange={e => setName(e.target.value)} required style={{ width: "100%", marginBottom: 12 }} />
        <label>Symbol</label>
        <input value={symbol} onChange={e => setSymbol(e.target.value)} required style={{ width: "100%", marginBottom: 12 }} />
        <label>Scope (Select all that apply)</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
          {SCOPE_OPTIONS.map(scope => (
            <label key={scope} style={{ background: scopes.includes(scope) ? "#0af" : "#222", color: scopes.includes(scope) ? "#fff" : "#ccc", padding: "5px 10px", borderRadius: 6 }}>
              <input
                type="checkbox"
                checked={scopes.includes(scope)}
                onChange={() => handleScopeChange(scope)}
                style={{ marginRight: 5 }}
              />
              {scope}
            </label>
          ))}
        </div>
        <label>
          <input type="checkbox" checked={dividends} onChange={e => setDividends(e.target.checked)} />
          Enable Dividends (share profit with coin holders)
        </label>
        <button disabled={creating} type="submit" style={{ marginTop: 20, padding: "10px 24px", background: "#0af", color: "#000", fontWeight: "bold", borderRadius: 6, border: "none" }}>
          {creating ? "Creating..." : "Create Coin"}
        </button>
        {message && <div style={{ marginTop: 18 }}>{message}</div>}
      </form>
    </div>
  );
}
