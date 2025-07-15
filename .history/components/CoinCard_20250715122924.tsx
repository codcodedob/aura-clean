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
      }}
    >
      {/* Background image */}
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
        <div
          style={{
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

      {/* Bottom info strip */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
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
      </div>

      {/* Buy overlay (optional) */}
      <div
        style={{
          position: "absolute",
          top: 8,
          right: 8,
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}
      >
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
  );
}
