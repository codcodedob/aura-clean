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
        width: 300,
        height: 400,
        borderRadius: 12,
        border: "1.5px solid rgba(34,44,58,0.8)",
        overflow: "hidden",
        boxShadow: "0 3px 18px rgba(10,243,255,0.2)",
        display: "flex",
        flexDirection: "column",
        userSelect: "none",
      }}
    >
      {/* Top Image / Emoji */}
      <div
        style={{
          flex: 4,
          position: "relative",
          background: coin.img_Url
            ? `url(${coin.img_Url}) center/cover no-repeat`
            : "#333",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {!coin.img_Url && (
          <div
            style={{
              fontSize: 64,
              color: "white",
            }}
          >
            {coin.emoji ?? "🪙"}
          </div>
        )}
      </div>

      {/* Bottom Content */}
      <div
        style={{
          flex: 1,
          background: "rgba(0,0,0,0.75)",
          color: "var(--text-color)",
          padding: "0.75rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <strong>{coin.name}</strong>
        <p style={{ opacity: 0.85, margin: "4px 0" }}>
          ${coin.price.toFixed(2)} · cap {coin.cap.toLocaleString()}
        </p>
        <input
          type="number"
          value={localAmount}
          min={0}
          step="0.01"
          onChange={handleChange}
          style={{
            marginTop: 4,
            padding: "8px 12px",
            width: "85%",
            borderRadius: 8,
            border: "1.5px solid #222c",
            background: "var(--input-bg)",
            color: "var(--text-color)",
            fontSize: 14,
            fontWeight: 600,
            textAlign: "center",
          }}
        />
        <button
          onClick={() => onBuy(coin.id)}
          style={{
            marginTop: 6,
            padding: "8px 16px",
            borderRadius: 8,
            background: "#2563eb",
            color: "#fff",
            fontWeight: "700",
            fontSize: 14,
            border: "none",
            cursor: "pointer",
          }}
        >
          Buy
        </button>
      </div>
    </div>
  );
}
