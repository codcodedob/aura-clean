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

function CoinCard({ coin, amount, onAmountChange, onBuy }: {
  coin: Coin,
  amount: number,
  onAmountChange: (id: string, amt: number) => void,
  onBuy: (id: string) => void
}) {
  const [localAmount, setLocalAmount] = useState(amount.toFixed(2));
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => { setLocalAmount(amount.toFixed(2)); }, [amount]);

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
        borderRadius: 12,
        border: "1.5px solid #222c",
        background: "var(--card-bg)",
        color: "var(--text-color)",
        textAlign: "center",
        boxShadow: "0 3px 18px #0af3",
        minHeight: 140,
        position: 'relative',
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <strong style={{ fontSize: 22, marginBottom: 6 }}>{coin.emoji ?? "🪙"} {coin.name}</strong>
      <p style={{ opacity: 0.85, fontWeight: "600" }}>
        Price: ${coin.price.toFixed(2)} &nbsp;&middot;&nbsp; Cap: {coin.cap}
      </p>
      <input
        type="number"
        value={localAmount}
        min={0}
        step="0.01"
        onChange={handleChange}
        style={{
          marginTop: 12,
          padding: "8px 10px",
          width: "100%",
          borderRadius: 8,
          border: "1px solid #222",
          background: "var(--input-bg)",
          color: "var(--text-color)",
          fontSize: 16,
          fontWeight: "600",
          textAlign: "center",
        }}
      />
      <button
        onClick={() => onBuy(coin.id)}
        style={{
          marginTop: 14,
          padding: "12px 20px",
          borderRadius: 12,
          background: "#2563eb",
          color: "#fff",
          fontWeight: "bold",
          border: "none",
          cursor: "pointer",
          fontSize: 16,
          letterSpacing: "0.04em",
          transition: "background 0.3s ease",
        }}
        onMouseEnter={e => (e.currentTarget.style.background = "#1e40af")}
        onMouseLeave={e => (e.currentTarget.style.background = "#2563eb")}
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
  const [windowWidth, setWindowWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1024);
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

  const refreshMarketData = async () => {
    setRefreshing(true);
    setMessage("Refreshing market data...");
    try {
      const res = await fetch("https://ofhpjvbmrfwbmboxibur.functions.supabase.co/admin_refresh_coins", { method: "POST" });
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

  const toggleMode = () => {
    setMode((prev) => (prev === "focused" ? "full-body" : "focused"));
    setAvatarKey((prev) => prev + 1);
  };

  if (!hasMounted) return null;

  return (
    <div style={{
      display: windowWidth < 800 ? "block" : "flex",
      height: "100vh",
      flexDirection: windowWidth < 800 ? "column" : "row",
      background: "linear-gradient(120deg, #181825 40%, #111827 100%)"
    }}>
      {/* MOBILE TAB BAR */}
      {windowWidth < 800 && (
        <div style={{
          display: "flex",
          justifyContent: "space-around",
          background: "#181825",
          padding: 10,
          borderBottom: "1px solid #222"
        }}>
          <button
            onClick={() => setActivePanel("left")}
            style={{
              color: activePanel === "left" ? "#0af" : "#fff",
              fontWeight: "bold",
              flex: 1,
              border: "none",
              background: "transparent",
              fontSize: 16,
              padding: 8,
              cursor: "pointer"
            }}
          >
            Coins
          </button>
          <button
            onClick={() => setActivePanel("center")}
            style={{
              color: activePanel === "center" ? "#0af" : "#fff",
              fontWeight: "bold",
              flex: 1,
              border: "none",
              background: "transparent",
              fontSize: 16,
              padding: 8,
              cursor: "pointer"
            }}
          >
            Profile
          </button>
          <button
            onClick={() => setActivePanel("right")}
            style={{
              color: activePanel === "right" ? "#0af" : "#fff",
              fontWeight: "bold",
              flex: 1,
              border: "none",
              background: "transparent",
              fontSize: 16,
              padding: 8,
              cursor: "pointer"
            }}
          >
            Suite
          </button>
        </div>
      )}

      {/* LEFT PANEL */}
      {(windowWidth >= 800 || activePanel === "left") && (
        <div style={{
          flex: 1,
          padding: 20,
          overflow: "hidden",
          display: windowWidth < 800 && activePanel !== "left" ? "none" : "block",
          background: "rgba(24,24,37,0.98)",
          borderRight: "1.5px solid #222c",
          boxSizing: "border-box",
        }}>
          <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search coins"
              style={{
                padding: 12,
                borderRadius: 8,
                width: "100%",
                marginBottom: 12,
                border: "1.5px solid #222",
                background: "#232a39",
                color: "#fff",
                fontSize: 16,
                boxSizing: "border-box",
                fontWeight: "600"
              }}
            />
            <div style={{ marginBottom: 12 }}>
              <button
                onClick={() => setFilter("all")}
                style={{
                  marginRight: 12,
                  color: filter === "all" ? "#0af" : "#ccc",
                  background: "transparent",
                  border: "none",
                  fontSize: 16,
                  cursor: "pointer",
                  fontWeight: filter === "all" ? "bold" : "normal",
                  padding: "6px 12px",
                  borderRadius: 8,
                  transition: "color 0.2s ease"
                }}
              >
                All
              </button>
              <button
                onClick={() => setFilter("stock")}
                style={{
                  marginRight: 12,
                  color: filter === "stock" ? "#0af" : "#ccc",
                  background: "transparent",
                  border: "none",
                  fontSize: 16,
                  cursor: "pointer",
                  fontWeight: filter === "stock" ? "bold" : "normal",
                  padding: "6px 12px",
                  borderRadius: 8,
                  transition: "color 0.2s ease"
                }}
              >
                Stocks
              </button>
              <button
                onClick={() => setFilter("crypto")}
                style={{
                  color: filter === "crypto" ? "#0af" : "#ccc",
                  background: "transparent",
                  border: "none",
                  fontSize: 16,
                  cursor: "pointer",
                  fontWeight: filter === "crypto" ? "bold" : "normal",
                  padding: "6px 12px",
                  borderRadius: 8,
                  transition: "color 0.2s ease"
                }}
              >
                Crypto
              </button>
            </div>
            <div style={{ flex: 1, minHeight: 0 }}>
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
                            amount={investmentAmounts[coin.id] ?? coin.price}
                            onAmountChange={(id, amt) =>
                              setInvestmentAmounts((prev) => ({ ...prev, [id]: amt }))
                            }
                            onBuy={handleBuy}
                          />
                        </div>
                      );
                    }}
                  </List>
                )}
              </AutoSizer>
            </div>
          </div>
        </div>
      )}

      {/* CENTER PANEL */}
      {(windowWidth >= 800 || activePanel === "center") && (
        <div
          style={{
            flex: 1.1,
            padding: 20,
            display: windowWidth < 800 && activePanel !== "center" ? "none" : "block",
            background: "rgba(28,34,49,0.99)",
            position: "relative",
            boxSizing: "border-box",
            overflowY: "auto",
          }}
        >
          {/* --- CART/CLOSET TOGGLE BUTTON --- */}
          <button
            onClick={() => setSceneMode(sceneMode === "cart" ? "closet" : "cart")}
            style={{
              position: "absolute",
              top: 16,
              right: 32,
              zIndex: 22,
              background: "#18181b",
              color: "#f3ba2f",
              fontWeight: 900,
              fontFamily: "monospace",
              fontSize: 20,
              border: "2.5px solid #ffe14a",
              borderRadius: 14,
              padding: "10px 30px",
              boxShadow: "0 4px 24px #0af4, 0 2px 18px #ffe14a20",
              letterSpacing: "0.22em",
              transition: "background 0.22s, color 0.22s",
              cursor: "pointer",
            }}
            title="Toggle 3D Cart & Closet"
          >
            C.A.RT
          </button>

          {/* --- 3D MAGNETIC SCENE --- */}
          <div
            style={{
              height: 440,
              width: "100%",
              margin: "0 auto",
              marginBottom: 20,
              borderRadius: 14,
              boxShadow: "0 0 30px #0af3",
              overflow: "hidden",
            }}
          >
            <GravityScene mode={sceneMode} />
          </div>

          <AvatarClothingSelector />

          {/* AUTH PANEL */}
          {!user ? (
            <div
              style={{
                background: "#181825",
                padding: 24,
                borderRadius: 12,
                marginTop: 20,
                boxShadow: "0 0 30px #0af",
                width: "100%",
                maxWidth: 380,
                marginLeft: "auto",
                marginRight: "auto",
                color: "#fff",
              }}
            >
              <h2 style={{ color: "#0af", marginBottom: 16 }}>
                {signupMode ? "🟢 Create Account" : "🔐 Log In"}
              </h2>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setSignupError("");
                  const email = (e.currentTarget.elements.namedItem
