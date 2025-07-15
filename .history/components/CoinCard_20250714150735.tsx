import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/lib/supabaseClient";
import AvatarClothingSelector from "@/components/AvatarClothingSelector";
import BusinessCarousel from "@/components/BusinessCarousel";
import { toast } from "react-hot-toast";

const ADMIN_EMAIL = "burks.donte@gmail.com";

interface Coin {
  id: string;
  name: string;
  emoji?: string;
  price: number;
  cap: number;
  user_id: string;
  img_Url?: string;
  is_featured?: boolean;
  symbol?: string;
  type?: "stock" | "crypto";
}

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
        margin: "1rem 0",
        padding: "1.2rem 1.5rem",
        borderRadius: 12,
        border: "1.5px solid rgba(34, 44, 58, 0.8)",
        background: "var(--card-bg)",
        color: "var(--text-color)",
        textAlign: "center",
        boxShadow: "0 3px 18px rgba(10, 243, 255, 0.2)",
        minHeight: 140,
        position: "relative",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        userSelect: "none",
      }}
    >
      {coin.img_Url && (
        <img
          src={coin.img_Url}
          alt={coin.name}
          style={{
            width: "100%",
            maxHeight: 140,
            objectFit: "cover",
            borderRadius: 8,
            marginBottom: 10,
            boxShadow: "0 0 10px rgba(0,0,0,0.4)",
          }}
        />
      )}
      <div style={{ position: "relative", width: "100%", height: 160, marginBottom: 12 }}>
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
        borderRadius: 12,
      }}
    />
  ) : (
    <div
      style={{
        width: "100%",
        height: "100%",
        borderRadius: 12,
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
</div>

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
          alignSelf: "center",
          borderRadius: 8,
          border: "1.5px solid #222c",
          background: "var(--input-bg)",
          color: "var(--text-color)",
          fontSize: 16,
          fontWeight: 600,
          textAlign: "center",
          outlineOffset: 2,
          outlineColor: "transparent",
          transition: "outline-color 0.2s ease",
        }}
        onFocus={(e) => (e.currentTarget.style.outlineColor = "#0af")}
        onBlur={(e) => (e.currentTarget.style.outlineColor = "transparent")}
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
          userSelect: "none",
          boxShadow: "0 0 10px #2563ebaa",
          transition: "background-color 0.3s ease",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#1e40af")}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#2563eb")}
        aria-label={`Buy ${coin.name}`}
      >
        Buy
      </button>
    </div>
  );
}

export default function Home() {
  const [hasMounted, setHasMounted] = useState(false);
  const [user, setUser] = useState(null);
  const [coins, setCoins] = useState<Coin[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "stock" | "crypto">("all");
  const [investmentAmounts, setInvestmentAmounts] = useState<{ [key: string]: number }>({});
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState("");
  const [activePanel, setActivePanel] = useState<"left" | "center" | "right">("center");
  const [windowWidth, setWindowWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1024);
  const [sceneMode, setSceneMode] = useState<"cart" | "closet">("cart");
  const router = useRouter();

  useEffect(() => {
    setHasMounted(true);
    setWindowWidth(window.innerWidth);
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const refreshMarketData = async () => {
    setRefreshing(true);
    setMessage("Refreshing market data...");
    try {
      const res = await fetch(
        "https://ofhpjvbmrfwbmboxibur.functions.supabase.co/admin_refresh_coins",
        { method: "POST" }
      );
      const text = await res.text();
      setMessage(res.ok ? `✅ Refreshed: ${text}` : `❌ Failed: ${text}`);
    } catch (err) {
      console.error(err);
      setMessage("❌ Error occurred while refreshing.");
    } finally {
      setRefreshing(false);
      setTimeout(() => setMessage(""), 5000);
    }
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data?.user ?? null));
  }, []);

  useEffect(() => {
    fetch("/api/coins")
      .then((res) => res.json())
      .then((data) => {
        setCoins(data || []);
        const initialAmounts: { [key: string]: number } = {};
        for (const coin of data || []) {
          initialAmounts[coin.id] = coin.price;
        }
        setInvestmentAmounts(initialAmounts);
      });
  }, []);

  const handleBuy = async (coinId: string) => {
    const amount = investmentAmounts[coinId] ?? 0;
    const userData = await supabase.auth.getUser();
    const userId = userData.data.user?.id;
    if (!userId) {
      alert("You must be signed in to purchase.");
      return;
    }

    const res = await fetch("/api/create-checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ coinId, amount, userId }),
    });

    const text = await res.text();

    let json;
    try {
      json = JSON.parse(text);
    } catch (err) {
      console.error("❌ JSON parsing failed", err);
      alert("Response was not valid JSON.");
      return;
    }

    if (!json.sessionId) {
      toast.error("Update the price to buy.");
      return;
    }

    const stripeModule = await import("@stripe/stripe-js");
    const stripePromise = stripeModule.loadStripe(
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
    );
    const stripe = await stripePromise;
    if (!stripe) throw new Error("Stripe failed to load");

    await stripe.redirectToCheckout({
      sessionId: json.sessionId,
    });
  };

  const filteredCoins = coins.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.emoji ?? "").includes(search);
    const matchesType = filter === "all" || c.type === filter;
    return matchesSearch && matchesType;
  });

  const othersCoins = filteredCoins.filter((c) => c.user_id !== user?.id);

  if (!hasMounted) return null;

  return (
    <div>
      {/* Render your panels */}
      <div>
        {othersCoins.map((coin) => (
          <CoinCard
            key={coin.id}
            coin={coin}
            amount={investmentAmounts[coin.id] ?? coin.price}
            onAmountChange={(id, amt) =>
              setInvestmentAmounts((prev) => ({ ...prev, [id]: amt }))
            }
            onBuy={handleBuy}
          />
        ))}
      </div>
    </div>
  );
}
