import React, { useEffect, useState } from "react";

interface Coin {
  id: string;
  name: string;
  emoji?: string;
  price: number;
  cap: number;
  img_Url?: string;
}

export default function CoinCard({
  coin,
  amount,
  onAmountChange,
  onBuy,
}: {
  coin: Coin;
  amount: number;
  onAmountChange: (id: string, amt: number) => void;
  onBuy: (id: string) => void;
}) {
  const [localAmount, setLocalAmount] = useState(amount.toFixed(2));
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setLocalAmount(amount.toFixed(2));
  }, [amount]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalAmount(val);
    if (debounceTimer) clearTimeout(debounceTimer);
    const newTimer = setTimeout(() => {
      const num = parseFloat(val);
      if (!isNaN(num)) onAmountChange(coin.id, num);
    }, 500);
    setDebounceTimer(newTimer);
  };

  return (
    <div
      style={{
        borderRadius: 12,
        overflow: "hidden",
        boxShadow: "0 4px 18px rgba(0,0,0,0.3)",
        margin: "1rem 0",
        width: "100%",
        background: "#1e1e1e",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Top visual */}
      <div
        style={{
          width: "100%",
          height: 200,
          backgroundColor: "#111",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {coin.img_Url ? (
          <img
            src={coin.img_Url}
            alt={coin.name}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        ) : (
          <span style={{ fontSize: 72, color: "#fff" }}>
            {coin.emoji ?? "🪙"}
          </span>
        )}
      </div>

      {/* Bottom info */}
      <div
        style={{
          background: "rgba(0,0,0,0.8)",
          color: "#fff",
          padding: "12px 16px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <strong style={{ fontSize: 20 }}>{coin.name}</strong>
        <span style={{ fontSize: 14, opacity: 0.85 }}>
          ${coin.price.toFixed(2)} · cap {coin.cap.toLocaleString()}
        </span>

        <div style={{ marginTop: 10, display: "flex", gap: 6 }}>
          <input
            type="number"
            value={localAmount}
            min={0}
            step="0.01"
            onChange={handleChange}
            style={{
              padding: "6px 8px",
              width: 80,
              borderRadius: 6,
              border: "none",
              background: "rgba(255,255,255,0.9)",
              color: "#000",
              fontSize: 14,
              fontWeight: 600,
              textAlign: "center",
            }}
          />
          <button
            onClick={() => onBuy(coin.id)}
            style={{
              padding: "6px 8px",
              borderRadius: 6,
              background: "#2563eb",
              color: "#fff",
              fontWeight: 700,
              border: "none",
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            Pre-Order
          </button>
        </div>
      </div>
    </div>
  );
}
