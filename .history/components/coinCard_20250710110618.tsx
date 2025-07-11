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

  const handleCardClick = () => {
    setExpanded(true);
  };

  return (
    <div
      onClick={handleCardClick}
      style={{
        margin: "1rem 0",
        padding: "1rem",
        borderRadius: 8,
        border: "1px solid #999",
        background: "#111",
        color: "#fff",
        textAlign: "center",
        cursor: "pointer",
      }}
    >
      <div>
        <strong style={{ fontSize: 18 }}>
          {coin.emoji ?? "🪙"} {coin.name}
        </strong>
        <p>
          ${coin.price.toFixed(2)} · cap {coin.cap}
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
              onClick={(e) => {
                e.stopPropagation();

                // Get latest input value directly
                const inputEl = e.currentTarget.parentElement?.querySelector(
                  "input"
                ) as HTMLInputElement | null;
                const latestAmount = inputEl
                  ? parseFloat(inputEl.value)
                  : amount;

                const minAmount = Math.max(0.5, coin.price);
                if (latestAmount >= minAmount) {
                  onAmountChange(coin.id, latestAmount);
                  onBuy(coin.id);
                } else {
                  alert(
                    `Minimum purchase must be at least $${minAmount.toFixed(
                      2
                    )}`
                  );
                }
              }}
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
    </div>
  );
}
