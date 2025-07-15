function CoinCard({
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
  const [localAmount, setLocalAmount] = React.useState(amount.toFixed(2));
  const [debounceTimer, setDebounceTimer] = React.useState<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
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
        width: "100%",
        borderRadius: 12,
        border: "1.5px solid rgba(34, 44, 58, 0.8)",
        overflow: "hidden",
        background: "var(--card-bg)",
        boxShadow: "0 3px 18px rgba(10, 243, 255, 0.2)",
        color: "var(--text-color)",
      }}
    >
      {/* Full-size image */}
      {coin.img_Url ? (
        <img
          src={coin.img_Url}
          alt={coin.name}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      ) : (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "#333",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 48,
          }}
        >
          {coin.emoji ?? "🪙"}
        </div>
      )}

      {/* Overlay content */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          padding: "1rem",
          background: "rgba(0,0,0,0.5)",
        }}
      >
        <div
          style={{
            fontSize: 18,
            fontWeight: 600,
            marginBottom: 4,
          }}
        >
          {coin.emoji} {coin.name}
        </div>
        <p style={{ marginBottom: 12 }}>
          ${coin.price.toFixed(2)} · cap {coin.cap.toLocaleString()}
        </p>
        <input
          type="number"
          value={localAmount}
          min={0}
          step="0.01"
          onChange={handleChange}
          style={{
            width: "100%",
            padding: "10px 12px",
            borderRadius: 8,
            border: "1.5px solid #222c",
            background: "var(--input-bg)",
            color: "var(--text-color)",
            fontSize: 16,
            fontWeight: 600,
            textAlign: "center",
            marginBottom: 12,
          }}
        />
        <button
          onClick={() => onBuy(coin.id)}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: 8,
            background: "#2563eb",
            color: "#fff",
            fontWeight: "700",
            fontSize: 16,
            border: "none",
            cursor: "pointer",
            boxShadow: "0 0 8px #2563ebaa",
          }}
        >
          Buy
        </button>
      </div>
    </div>
  );
}
