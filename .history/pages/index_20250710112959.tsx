import React, { useEffect, useState, Suspense, lazy } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/lib/supabaseClient";
import AvatarClothingSelector from "@/components/AvatarClothingSelector";
import type { User } from "@supabase/supabase-js";
import Link from "next/link";
import { FixedSizeList as List } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import { motion } from "framer-motion";
import BusinessCarousel from "@/components/BusinessCarousel";
import { Info } from "lucide-react";
import GravityScene from "@/components/GravityScene";

const ADMIN_EMAIL = "burks.donte@gmail.com";

interface Coin {
  id: string;
  name: string;
  emoji?: string;
  price: number;
  cap: number;
  user_id: string;
  img_url?: string;
  is_featured?: boolean;
  symbol?: string;
  type?: "stock" | "crypto";
}

const FocusedAvatar = lazy(() => import("@/components/FocusedAvatar")) as React.LazyExoticComponent<React.ComponentType<{}>>;
const FullBodyAvatar = lazy(() => import("@/components/FullBodyAvatar")) as React.LazyExoticComponent<React.ComponentType<{ modelPaths: string[] }>>;

function CoinCard({
  coin,
  amount,
  onAmountChange,
  onBuy,
}: {
  coin: Coin;
  amount: number;
  onAmountChange: (id: string, amt: number) => void;
  onBuy: (id: string, amount: number) => void;
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
        padding: "1rem",
        borderRadius: 8,
        border: "1px solid #222c",
        background: "var(--card-bg)",
        color: "var(--text-color)",
        textAlign: "center",
        boxShadow: "0 2px 12px #0af3",
        minHeight: 130,
        position: "relative",
      }}
    >
      <strong style={{ fontSize: 20 }}>
        {coin.emoji ?? "🪙"} {coin.name}
      </strong>
      <p style={{ opacity: 0.85 }}>${coin.price.toFixed(2)} · cap {coin.cap}</p>
      <input
        type="number"
        value={localAmount}
        min={0}
        step="0.01"
        onChange={handleChange}
        style={{
          marginTop: 8,
          padding: 8,
          width: "80%",
          borderRadius: 6,
          border: "1px solid #222",
          background: "var(--input-bg)",
          color: "var(--text-color)",
        }}
      />
      <button
        onClick={() => onBuy(coin.id, parseFloat(localAmount))}
        style={{
          marginTop: 12,
          padding: "10px 18px",
          borderRadius: 8,
          background: "#2563eb",
          color: "#fff",
          fontWeight: "bold",
          border: "none",
          cursor: "pointer",
        }}
      >
        Buy
      </button>
    </div>
  );
}

export default function Home() {
  const [hasMounted, setHasMounted] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [coins, setCoins] = useState<Coin[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "stock" | "crypto">("all");
  const [investmentAmounts, setInvestmentAmounts] = useState<{ [key: string]: number }>({});
  const [mode, setMode] = useState<"focused" | "full-body">("focused");
  const [gridMode, setGridMode] = useState(false);
  const [avatarKey, setAvatarKey] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState("");
  const [signupMode, setSignupMode] = useState(false);
  const [signupError, setSignupError] = useState("");
  const [activePanel, setActivePanel] = useState<"left" | "center" | "right">("center");
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1024
  );
  const [hoveredDept, setHoveredDept] = useState<string | null>(null);

  const [sceneMode, setSceneMode] = useState<"cart" | "closet">("cart");
  const router = useRouter();

  useEffect(() => {
    setHasMounted(true);
    setWindowWidth(window.innerWidth);
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty("--card-bg", darkMode ? "#1f2937" : "#fff");
    document.documentElement.style.setProperty("--text-color", darkMode ? "#f9fafb" : "#1a1a1a");
    document.documentElement.style.setProperty("--input-bg", darkMode ? "#374151" : "#f3f4f6");
    document.body.style.backgroundColor = darkMode ? "#111827" : "#f9fafb";
  }, [darkMode]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data?.user ?? null));
  }, []);

  useEffect(() => {
    fetch("/api/coins")
      .then((res) => res.json())
      .then((data) => setCoins(data || []));
  }, []);

  const handleBuy = async (coinId: string, amount: number) => {
    if (amount < 0.5) {
      alert("Minimum purchase amount is $0.50");
      return;
    }

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) {
      console.error("Supabase auth error:", userError);
      alert("Authentication error.");
      return;
    }

    const userId = userData.user?.id;
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
    console.log("⚠️ Raw response text:", text);

    let json;
    try {
      json = JSON.parse(text);
    } catch (err) {
      console.error("❌ JSON parsing failed", err);
      alert("Response was not valid JSON.");
      return;
    }

    console.log("✅ Parsed JSON:", json);

    if (!json.sessionId) {
      console.error("❌ sessionId is missing in API response");
      alert("Checkout sessionId is missing.");
      return;
    }

    const stripeModule = await import("@stripe/stripe-js");
    const stripePromise = stripeModule.loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
    const stripe = await stripePromise;
    if (!stripe) throw new Error("Stripe failed to load");

    await stripe.redirectToCheckout({
      sessionId: json.sessionId,
    });
  };

  const filteredCoins = coins.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || (c.emoji ?? "").includes(search);
    const matchesType = filter === "all" || c.type === filter;
    return matchesSearch && matchesType;
  });
  const othersCoins = filteredCoins.filter((c) => c.user_id !== user?.id);
  const featuredCoin = filteredCoins.find((c) => c.is_featured);

  if (!hasMounted) return null;

  return (
    <div>
      {/* ... your existing layout (LEFT/CENTER/RIGHT PANELS) ... */}
      <AutoSizer>
        {({ height, width }: { height: number; width: number }) => (
          <List
            height={height}
            itemCount={othersCoins.length + (featuredCoin ? 1 : 0)}
            itemSize={200}
            width={width}
          >
            {({ index, style }) => {
              const coin =
                index === 0 && featuredCoin
                  ? featuredCoin
                  : othersCoins[index - (featuredCoin ? 1 : 0)];
              return (
                <div style={style} key={coin.id}>
                  <CoinCard
                    coin={coin}
                    amount={investmentAmounts[coin.id] || coin.price}
                    onAmountChange={(id, amt) =>
                      setInvestmentAmounts((prev) => ({ ...prev, [id]: amt }))
                    }
                    onBuy={(id, amount) => handleBuy(id, amount)}
                  />
                </div>
              );
            }}
          </List>
        )}
      </AutoSizer>
    </div>
  );
}
