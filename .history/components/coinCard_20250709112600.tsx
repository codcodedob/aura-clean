import React, { useState } from "react";

interface CoinCardProps {
  coin: {
    id: string;
    name: string;
    emoji?: string;
    price: number;
    cap: number;
    user_id: string;
  };
  amount: number;
  onAmountChange: (coinId: string, amount: number) => void;
  onBuy: (coinId: string) => void;
}

export default function CoinCard({ coin, amount, onAmountChange, onBuy }: CoinCardProps) {
  const [expanded, setExpanded] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (!isNaN(val)) {
      onAmountChange(coin.id, val);
    }
  };

  const handleBuyClick = () => {
    if (amount <= 0) {
      alert("Enter an amount greater than 0.");
      return;
    }

    if (amount < coin.price) {
      alert(`Minimum purchase amount is $${coin.price.toFixed(2)}.`);
      return;
    }

    onBuy(coin.id);
  };

  return (
    <div
      onClick={() => setExpanded(true)}
      style={{
        margin: "1rem 0",
        padding: "1rem",
        borderRadius: 8,
        border: "1px solid #999",
        background: "#111",
        color: "#fff",
        textAlign: "center",
        cursor: "pointer"
      }}
    >
      <div>
        <strong style={{ fontSize: 18 }}>
          {coin.emoji ?? "🪙"} {coin.name}
        </strong>
        <p>${coin.price.toFixed(2)} · cap {coin.cap}</p>
        {expanded && (
          <>
            <input
              type="number"
              value={amount}
              min={0}
              step="0.01"
              onChange={handleInputChange}
              style={{
                marginTop: 8,
                padding: 6,
                width: "80%",
                borderRadius: 4,
                border: "1px solid #555",
                background: "#222",
                color: "#fff"
              }}
            />
            {amount === 0 && (
              <div style={{ color: "#10b981", fontWeight: "bold", marginTop: 4 }}>Free!</div>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation(); // prevent collapsing
                handleBuyClick();
              }}
              style={{
                marginTop: 10,
                padding: "8px 16px",
                borderRadius: 6,
                background: "#0af",
                color: "#000",
                fontWeight: "bold",
                border: "none"
              }}
            >
              Buy
            </button>
          </>
        )}
        {!expanded && (
          <div style={{ marginTop: 6, fontSize: "0.9em", opacity: 0.7 }}>
            Click to enter amount
          </div>
        )}
      </div>
    </div>
  );
}
