import React, { useState } from "react";
import { stripePromise } from "@/lib/stripe";

interface Coin {
  id: string;
  name: string;
  emoji?: string;
  price: number;
  cap: number;
  user_id: string;
}

interface CoinCardProps {
  coin: Coin;
  amount: number;
  onAmountChange: (coinId: string, amount: number) => void;
  userId: string; // current logged in user ID
}

export default function CoinCard({
  coin,
  amount,
  onAmountChange,
  userId,
}: CoinCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (!isNaN(val)) {
      onAmountChange(coin.id, val);
    }
  };

  async function handleBuyClick(e: React.MouseEvent) {
    e.stopPropagation();

    const minAmount = Math.max(0.5, coin.price);
    if (amount < minAmount) {
      alert(`Minimum purchase must be at least $${minAmount.toFixed(2)}`);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          coinId: coin.id,
          amount,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        alert("Checkout error: " + errData.error);
        setLoading(false);
        return;
      }

      const { sessionId } = await res.json();

      const stripe = await stripePromise;
      if (!stripe) {
        alert("Stripe failed to load.");
        setLoading(false);
        return;
      }

      const { error } = await stripe.redirectToCheckout({ sessionId });
      if (error) {
        alert(error.message);
      }
    } catch (err) {
      console.error("Checkout error:", err);
      alert("Failed to start checkout.");
    } finally {
      setLoading(false);
    }
  }

  const handleCardClick = () => setExpanded(true);

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
        opacity: loading ? 0.6 : 1,
        pointerEvents: loading ? "none" : "auto",
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
              disabled={loading}
            >
              {loading ? "Loading..." : "Buy"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
