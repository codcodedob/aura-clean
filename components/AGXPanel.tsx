import React, { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { Database } from "@/types/supabase";

export default function AdminCoinCreator() {
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("");
  const [cap, setCap] = useState("");
  const [type, setType] = useState<"stock" | "crypto" | "">("");
  const [symbol, setSymbol] = useState("");
  const [status, setStatus] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("⏳ Inserting...");

    // ✅ Load the current user from Supabase
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("Error getting user:", userError);
      setStatus("❌ No logged-in user.");
      return;
    }

    const insertData: Database["public"]["Tables"]["aura_coins"]["Insert"] = {
      name,
      user_id: user.id, // ✅ Now user is defined
      emoji: emoji || null,
      cap: cap ? parseFloat(cap) : 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      active: true,
      dividend_eligible: false,
      earnings_model: null,
      img_Url: null,
      is_featured: false,
      owner_name: null,
      price: 1.0,
      projected_cap: null,
      rarity: "common",
      scope: [],
      symbol: symbol || null,
      tagline: "",
      type: type || null,
      visible: true,
      vision: null,
    };

    const { error } = await supabase.from("aura_coins").insert([insertData]);

    if (error) {
      console.error(error);
      setStatus("❌ Failed to insert coin.");
    } else {
      setStatus("✅ Coin inserted successfully!");
      setName("");
      setEmoji("");
      setCap("");
      setType("");
      setSymbol("");
    }

    setTimeout(() => setStatus(""), 4000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto p-4 border rounded shadow">
      <div>
        <label className="block font-medium mb-1">Name</label>
        <input
          type="text"
          className="border rounded w-full p-2"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="Coin name"
        />
      </div>

      <div>
        <label className="block font-medium mb-1">Emoji</label>
        <input
          type="text"
          className="border rounded w-full p-2"
          value={emoji}
          onChange={(e) => setEmoji(e.target.value)}
          placeholder="Optional emoji"
        />
      </div>

      <div>
        <label className="block font-medium mb-1">Cap</label>
        <input
          type="number"
          className="border rounded w-full p-2"
          value={cap}
          onChange={(e) => setCap(e.target.value)}
          placeholder="Max supply (cap)"
        />
      </div>

      <div>
        <label className="block font-medium mb-1">Type</label>
        <select
          className="border rounded w-full p-2"
          value={type}
          onChange={(e) => setType(e.target.value as "stock" | "crypto" | "")}
          required
        >
          <option value="">Select type</option>
          <option value="stock">Stock</option>
          <option value="crypto">Crypto</option>
        </select>
      </div>

      <div>
        <label className="block font-medium mb-1">Symbol (for API sync)</label>
        <input
          type="text"
          className="border rounded w-full p-2"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          required
          placeholder="Ticker symbol"
        />
      </div>

      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mt-4"
      >
        Create Coin
      </button>

      {status && <p className="mt-2 text-center">{status}</p>}
    </form>
  );
}
