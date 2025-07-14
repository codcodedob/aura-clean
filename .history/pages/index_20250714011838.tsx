// index.tsx
import React, { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/lib/supabaseClient";
import AvatarClothingSelector from "@/components/AvatarClothingSelector";
import type { User } from "@supabase/supabase-js";
import { FixedSizeList as List } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import BusinessCarousel from "@/components/BusinessCarousel";
import dynamic from "next/dynamic";
import { toast } from "react-hot-toast";

const GravityScene = dynamic(() => import("@/components/GravityScene"), { ssr: false });

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
      padding: "1.2rem 1.5rem",
      borderRadius: 12,
      border: "1.5px solid rgba(34,44,58,0.8)",
      background: "var(--card-bg)",
      color: "var(--text-color)",
      textAlign: "center",
      boxShadow: "0 3px 18px rgba(10,243,255,0.2)",
      minHeight: 140,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      userSelect: 'none'
    }}>
      <strong style={{ fontSize: 22 }}>{coin.emoji ?? "🪙"} {coin.name}</strong>
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
          borderRadius: 8,
          border: "1.5px solid #222c",
          background: "var(--input-bg)",
          color: "var(--text-color)",
          fontSize: 16,
          fontWeight: 600,
          textAlign: "center"
        }}
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
          cursor: "pointer"
        }}
      >
        Buy
      </button>
    </div>
  );
}

export default function Home() {
  const [hasMounted, setHasMounted] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [coins, setCoins] = useState<Coin[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "stock" | "crypto">("all");
  const [investmentAmounts, setInvestmentAmounts] = useState<{ [key: string]: number }>({});
  const [activePanel, setActivePanel] = useState<"left" | "center" | "right">("center");
  const [windowWidth, setWindowWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1024);
  const [sceneMode, setSceneMode] = useState<"cart" | "closet">("cart");
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState("");

  const router = useRouter();

  useEffect(() => {
    setHasMounted(true);
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
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

  const filteredCoins = coins.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || (c.emoji ?? "").includes(search);
    const matchesType = filter === "all" || c.type === filter;
    return matchesSearch && matchesType;
  });

  const othersCoins = filteredCoins.filter((c) => c.user_id !== user?.id);
  const featuredCoin = filteredCoins.find((c) => c.is_featured);

  if (!hasMounted) return null;

  return (
    <div style={{
      display: "flex",
      flexDirection: windowWidth < 800 ? "column" : "row",
      minHeight: "100vh",
      background: "linear-gradient(120deg, #181825 40%, #111827 100%)",
      color: "var(--text-color)"
    }}>
      {/* MOBILE TABS */}
      {windowWidth < 800 && (
        <div style={{
          display: "flex",
          justifyContent: "space-around",
          background: "#181825",
          padding: "12px 0",
          borderBottom: "1.5px solid #222"
        }}>
          <button onClick={() => setActivePanel("left")} style={{ color: activePanel === "left" ? "#0af" : "#ccc", fontWeight: "700" }}>Coins</button>
          <button onClick={() => setActivePanel("center")} style={{ color: activePanel === "center" ? "#0af" : "#ccc", fontWeight: "700" }}>Profile</button>
          <button onClick={() => setActivePanel("right")} style={{ color: activePanel === "right" ? "#0af" : "#ccc", fontWeight: "700" }}>Suite</button>
        </div>
      )}

      {/* LEFT PANEL */}
      {(windowWidth >= 800 || activePanel === "left") && (
        <div style={{ flex: 1, padding: 24, borderRight: "1.5px solid #222c" }}>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search coins" style={{ width: "100%", marginBottom: 16 }} />
          <AutoSizer>
            {({ height, width }: { height: number; width: number }) => (
              <List height={height} itemCount={othersCoins.length} itemSize={210} width={width}>
                {({ index, style }) => {
                  const coin = othersCoins[index];
                  return (
                    <div style={style} key={coin.id}>
                      <CoinCard
                        coin={coin}
                        amount={investmentAmounts[coin.id] || coin.price}
                        onAmountChange={(id, amt) => setInvestmentAmounts((prev) => ({ ...prev, [id]: amt }))}
                        onBuy={() => {}}
                      />
                    </div>
                  );
                }}
              </List>
            )}
          </AutoSizer>
        </div>
      )}

      {/* CENTER PANEL */}
      {(windowWidth >= 800 || activePanel === "center") && (
        <div style={{ flex: 1.1, padding: 24, overflowY: "auto" }}>
          {featuredCoin && (
            <CoinCard
              coin={featuredCoin}
              amount={investmentAmounts[featuredCoin.id] || featuredCoin.price}
              onAmountChange={(id, amt) => setInvestmentAmounts((prev) => ({ ...prev, [id]: amt }))}
              onBuy={() => {}}
            />
          )}
          <button
            onClick={() => setSceneMode(sceneMode === "cart" ? "closet" : "cart")}
            style={{
              marginTop: 12,
              padding: "10px 18px",
              borderRadius: 10,
              background: "#444",
              color: "#eee",
              border: "none"
            }}
          >
            Toggle Scene
          </button>
          <div style={{ height: 440, width: "100%", borderRadius: 16 }}>
            <Suspense fallback={<div style={{ textAlign: "center", padding: "50px" }}>Loading 3D scene...</div>}>
              <GravityScene mode={sceneMode} />
            </Suspense>
          </div>
          <AvatarClothingSelector />
        </div>
      )}

      {/* RIGHT PANEL */}
      {(windowWidth >= 800 || activePanel === "right") && (
        <div style={{ flex: 1, padding: 24 }}>
          <BusinessCarousel />
          {user?.email === ADMIN_EMAIL && (
            <div style={{ marginTop: 24 }}>
              <button
                onClick={refreshMarketData}
                disabled={refreshing}
                style={{
                  padding: "10px 16px",
                  borderRadius: 8,
                  background: "#0af",
                  color: "#fff",
                  border: "none",
                  fontWeight: 700
                }}
              >
                {refreshing ? "Refreshing..." : "Refresh Market Data"}
              </button>
              {message && <p style={{ marginTop: 8 }}>{message}</p>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
