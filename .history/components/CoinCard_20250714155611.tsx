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
        margin: "1rem 0",
        borderRadius: 12,
        border: "1.5px solid rgba(34, 44, 58, 0.8)",
        overflow: "hidden",
        color: "var(--text-color)",
        textAlign: "center",
        boxShadow: "0 3px 18px rgba(10, 243, 255, 0.2)",
        minHeight: 250,
        userSelect: "none",
        background: coin.img_Url
          ? `url(${coin.img_Url}) center / cover no-repeat`
          : "var(--card-bg)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
      }}
    >
      {!coin.img_Url && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 64,
            background: "#333",
          }}
        >
          {coin.emoji ?? "🪙"}
        </div>
      )}

      <div
        style={{
          position: "relative",
          background: "rgba(0,0,0,0.6)",
          padding: "1rem",
        }}
      >
        <strong style={{ fontSize: 20 }}>{coin.name}</strong>
        <p style={{ opacity: 0.85, margin: "4px 0 12px 0" }}>
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
            padding: "10px 14px",
            width: "85%",
            maxWidth: 280,
            borderRadius: 8,
            border: "1.5px solid #222c",
            background: "var(--input-bg)",
            color: "var(--text-color)",
            fontSize: 16,
            fontWeight: 600,
            textAlign: "center",
          }}
        />
        <button
          onClick={() => onBuy(coin.id)}
          style={{
            marginTop: 14,
            padding: "12px 22px",
            borderRadius: 14,
            background: "#2563eb",
            color: "#fff",
            fontWeight: "700",
            fontSize: 16,
            border: "none",
            cursor: "pointer",
            boxShadow: "0 0 10px #2563ebaa",
          }}
        >
          Buy
        </button>
      </div>
    </div>
  );
}
