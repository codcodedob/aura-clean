import React, { useState } from "react";

interface CoinCardProps {
  coin: {
    id: string;
    name: string;
    emoji?: string;
    price: number;
    cap: number;
    img_url?: string;
    tagline?: string;
    rarity?: string;
  };
  amount: number;
  onAmountChange: (coinId: string, amount: number) => void;
  onBuy: (coinId: string, amount: number) => void;
}

export default function CoinCard({
  coin,
  amount,
  onAmountChange,
  onBuy,
}: CoinCardProps) {
  const [expanded, setExpanded] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (!isNaN(val)) {
      onAmountChange(coin.id, val);
    }
  };

  const handleBuyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const inputEl = e.currentTarget.parentElement?.querySelector(
      "input"
    ) as HTMLInputElement | null;
    const latestAmount = inputEl ? parseFloat(inputEl.value) : amount;
    const minAmount = Math.max(0.5, coin.price);

    if (latestAmount >= minAmount) {
      onAmountChange(coin.id, latestAmount);
      onBuy(coin.id, latestAmount);
    } else {
      alert(`Minimum purchase must be at least $${minAmount.toFixed(2)}`);
    }
  };

  return (
    <div
      onClick={() => setExpanded(true)}
      style={{
        margin: "1rem 0",
        padding: "1rem",
        borderRadius: 10,
        border: "1px solid #333",
        background: "#181818",
        color: "#eee",
        cursor: "pointer",
        textAlign: "center",
        boxShadow: "0 2px 12px rgba(0,0,0,0.3)",
      }}
    >
      {coin.img_url && (
        <img
          src={coin.img_url}
          alt={coin.name}
          style={{
            width: "100%",
            borderRadius: 8,
            marginBottom: 8,
            objectFit: "cover",
            maxHeight: 120,
          }}
        />
      )}
      <strong style={{ fontSize: 18 }}>
        {coin.emoji ?? "🪙"} {coin.name}
      </strong>
      {coin.tagline && (
        <p style={{ color: "#aaa", fontSize: 13 }}>{coin.tagline}</p>
      )}
      <p style={{ marginTop: 4 }}>
        ${coin.price.toFixed(2)} · Cap {coin.cap}{" "}
        {coin.rarity && (
          <span style={{ fontSize: 12, color: "#0af" }}>
            ({coin.rarity})
          </span>
        )}
      </p>

      {expanded && (
        <>
          <input
            type="number"
            value={amount}
            min={Math.max(0.5, coin.price)}
            step="0.01"
            onChange={handleInputChange}
            onClick={(e) => e.stopPropagation()}
            style={{
              marginTop: 8,
              padding: 6,
              width: "80%",
              borderRadius: 4,
              border: "1px solid #555",
              background: "#222",
              color: "#fff",
            }}
          />
          <button
            onClick={handleBuyClick}
            style={{
              marginTop: 10,
              padding: "8px 16px",
              borderRadius: 6,
              background: "#0af",
              color: "#000",
              fontWeight: "bold",
              border: "none",
            }}
          >
            Buy
          </button>
        </>
      )}
    </div>
  );
}
