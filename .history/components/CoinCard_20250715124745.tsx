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
        position: "relative",
        borderRadius: 12,
        overflow: "hidden",
        boxShadow: "0 4px 18px rgba(0,0,0,0.3)",
        margin: "1rem 0",
        minHeight: 220,
        cursor: "pointer",
        userSelect: "none",
        background: coin.img_Url
          ? `url(${coin.img_Url}) center/cover no-repeat`
          : "#333",
        display: "flex",
        alignItems: "flex-end",
      }}
    >
      {/* If no image URL, show emoji */}
      {!coin.img_Url && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%,-50%)",
            fontSize: 64,
            color: "white",
          }}
        >
          {coin.emoji ?? "🪙"}
        </div>
      )}

      {/* Bottom info strip */}
      <div
        style={{
          width: "100%",
          background: "rgba(0,0,0,0.7)",
          color: "#fff",
          padding: "12px 16px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <strong style={{ fontSize: 18 }}>{coin.name}</strong>
        <span style={{ fontSize: 14, opacity: 0.85 }}>
          ${coin.price.toFixed(2)} · cap {coin.cap.toLocaleString()}
        </span>

        <div style={{ marginTop: 8, display: "flex", gap: 6 }}>
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
            Buy
          </button>
        </div>
      </div>
    </div>
  );
}
