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
    <div style={{
      margin: "1rem 0",
      padding: "1rem",
      borderRadius: 8,
      border: "1px solid #222c",
      background: "var(--card-bg)",
      color: "var(--text-color)",
      textAlign: "center",
      boxShadow: "0 2px 12px #0af3",
      minHeight: 130,
      position: 'relative'
    }}>
      <strong style={{ fontSize: 20 }}>{coin.emoji ?? "🪙"} {coin.name}</strong>
      <p style={{ opacity: 0.85 }}>${coin.price.toFixed(2)} · cap {coin.cap}</p>
      <input
        type="number"
        value={localAmount}
        min={0}
        step="0.01"
        onChange={handleChange}
        style={{
          marginTop: 8, padding: 8, width: "80%",
          borderRadius: 6, border: "1px solid #222",
          background: "var(--input-bg)", color: "var(--text-color)",
        }}
      />
      <button
        onClick={() => onBuy(coin.id)}
        style={{
          marginTop: 12, padding: "10px 18px", borderRadius: 8,
          background: "#2563eb", color: "#fff", fontWeight: "bold",
          border: "none", cursor: "pointer"
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

  const fullBodyModels = [
    "/models/F1VISIONBALNCICHROME.glb",
    "/models/top.glb",
    "/models/bottom.glb",
    "/models/base-inner.glb",
    "/models/base-outer.glb",
  ];

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

  const handleBuy = async (coinId: string) => {
    const amount = investmentAmounts[coinId] ?? 0;
    const coin = coins.find((c) => c.id === coinId);
    if (!coin) return;

    const userData = await supabase.auth.getUser();
    const userId = userData.data.user?.id;
    if (!userId) {
      alert("Sign in required");
      return;
    }

    if (amount === 0) {
      await supabase.from("coin_activity").insert({
        user_id: userId,
        coin_id: coinId,
        type: "purchase",
        amount,
        description: `Free/discounted purchase for $${amount}`,
      });
      router.push("/receipt");
      return;
    }

    await supabase.from("coin_activity").insert({
      user_id: userId,
      coin_id: coinId,
      type: "purchase",
      amount,
      description: `Intent to purchase $${amount}`,
    });

    const res = await fetch("/api/create-checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ coinId, amount, userId }),
    });
    const json = await res.json();
    const stripe = (await import("@stripe/stripe-js")).loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
    (await stripe)?.redirectToCheckout({ sessionId: json.sessionId });
  };

  // ** New simple checkout handler without coin & amount for testing Stripe modal **
  const handleCheckoutSimple = async () => {
    const userData = await supabase.auth.getUser();
    const userId = userData.data.user?.id;
    if (!userId) {
      alert("Sign in required");
      return;
    }

    const res = await fetch("/api/create-checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });

    const json = await res.json();

    if (json.sessionId) {
      const stripe = await (await import("@stripe/stripe-js")).loadStripe(
        process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
      );
      await stripe?.redirectToCheckout({ sessionId: json.sessionId });
    } else {
      alert(json.error || "Failed to create checkout session");
    }
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
          <button onClick={() => setActivePanel("left")} style={{ color: activePanel === "left" ? "#0af" : "#fff", fontWeight: "bold", flex: 1 }}>Coins</button>
          <button onClick={() => setActivePanel("center")} style={{ color: activePanel === "center" ? "#0af" : "#fff", fontWeight: "bold", flex: 1 }}>Profile</button>
          <button onClick={() => setActivePanel("right")} style={{ color: activePanel === "right" ? "#0af" : "#fff", fontWeight: "bold", flex: 1 }}>Suite</button>
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
          borderRight: "1.5px solid #222c"
        }}>
          <div style={{ height: "100%" }}>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search coins"
              style={{ padding: 10, borderRadius: 6, width: "100%", marginBottom: 10, border: "1px solid #222", background: "#232a39", color: "#fff" }}
            />
            <div style={{ marginBottom: 10 }}>
              <button onClick={() => setFilter("all")} style={{ marginRight: 8, color: filter === "all" ? "#0af" : "#ccc" }}>All</button>
              <button onClick={() => setFilter("stock")} style={{ marginRight: 8, color: filter === "stock" ? "#0af" : "#ccc" }}>Stocks</button>
              <button onClick={() => setFilter("crypto")} style={{ color: filter === "crypto" ? "#0af" : "#ccc" }}>Crypto</button>
            </div>
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
                          onAmountChange={(id, amt) => setInvestmentAmounts((prev) => ({ ...prev, [id]: amt }))}
                          onBuy={handleBuy}
                        />
                      </div>
                    );
                  }}
                </List>
              )}
            </AutoSizer>
          </div>
          {user && user.email === ADMIN_EMAIL && (
            <div style={{ marginTop: 20 }}>
              <button
                onClick={refreshMarketData}
                disabled={refreshing}
                style={{
                  background: refreshing ? "#777" : "#0af",
                  borderRadius: 6,
                  color: "#000",
                  fontWeight: "bold",
                  width: "100%",
                  padding: 12,
                  marginTop: 10,
                  cursor: refreshing ? "not-allowed" : "pointer",
                }}
              >
                {refreshing ? "Refreshing..." : "Refresh Market Data (Admin)"}
              </button>
              {message && <p style={{ marginTop: 8, fontWeight: "bold", color: "#0f0" }}>{message}</p>}
            </div>
          )}
        </div>
      )}

      {/* CENTER PANEL */}
      {(windowWidth >= 800 || activePanel === "center") && (
        <div style={{
          flex: 1,
          padding: 20,
          overflowY: "auto",
          display: windowWidth < 800 && activePanel !== "center" ? "none" : "block",
          background: "rgba(12,12,24,0.98)",
          borderRight: "1.5px solid #222c",
          textAlign: "center"
        }}>
          {!user ? (
            <>
              <h2>Sign In</h2>
              <button
                onClick={() => supabase.auth.signInWithOAuth({ provider: "github" })}
                style={{
                  background: "#333",
                  padding: "10px 20px",
                  borderRadius: 6,
                  color: "#fff",
                  fontWeight: "bold",
                  marginTop: 12,
                  width: "100%",
                  cursor: "pointer",
                }}
              >
                Sign in with GitHub
              </button>
            </>
          ) : (
            <>
              <p>Welcome, {user.email}</p>
              <button
                onClick={() => supabase.auth.signOut().then(() => setUser(null))}
                style={{
                  background: "#333",
                  padding: "10px 20px",
                  borderRadius: 6,
                  color: "#fff",
                  fontWeight: "bold",
                  marginTop: 12,
                  width: "100%",
                  cursor: "pointer",
                }}
              >
                Logout
              </button>

              {/* Test Stripe checkout button */}
              <button
                onClick={handleCheckoutSimple}
                style={{
                  background: "#ff7f50",
                  color: "#000",
                  borderRadius: 6,
                  padding: "10px 16px",
                  fontWeight: "bold",
                  marginTop: 16,
                  width: "100%",
                }}
              >
                Test Stripe Checkout (No coin)
              </button>

              <Suspense fallback={<p>Loading avatar...</p>}>
                {mode === "focused" ? (
                  <FocusedAvatar key={avatarKey} />
                ) : (
                  <FullBodyAvatar key={avatarKey} modelPaths={fullBodyModels} />
                )}
              </Suspense>

              <button
                onClick={toggleMode}
                style={{
                  marginTop: 12,
                  background: "#0af",
                  color: "#fff",
                  padding: "8px 16px",
                  borderRadius: 6,
                  cursor: "pointer",
                }}
              >
                Toggle Avatar Mode
              </button>
            </>
          )}
        </div>
      )}

      {/* RIGHT PANEL */}
      {(windowWidth >= 800 || activePanel === "right") && (
        <div style={{
          flex: 1,
          padding: 20,
          overflowY: "auto",
          display: windowWidth < 800 && activePanel !== "right" ? "none" : "block",
          background: "rgba(24,24,37,0.98)",
          borderLeft: "1.5px solid #222c"
        }}>
          <h3>Company Suite</h3>
          <BusinessCarousel />
          <GravityScene />
          <p style={{ marginTop: 20, fontSize: 14, color: "#aaa" }}>
            Powered by Supabase + Stripe + Next.js
          </p>
        </div>
      )}
    </div>
  );
}
