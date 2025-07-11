"use client";

import React, { useEffect, useState, Suspense, lazy } from "react";
import { useRouter } from "next/navigation";
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

const DEPARTMENTS = [
  "Art",
  "Entertainment",
  "Fashion",
  "Health n Fitness",
  "Science",
  "Community Clipboard",
] as const;

type Department = typeof DEPARTMENTS[number];

type MediaItem = {
  id: string;
  department: string;
  title: string;
  description: string;
  img_url?: string;
  video_url?: string;
  link_url?: string;
};

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

  // -- next section continues below --
  // Fetch user on mount
  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Auth getUser error:", error);
        setUser(null);
        return;
      }
      if (data.user) setUser(data.user);
      else setUser(null);
    };
    fetchUser();
  }, []);

  // Fetch coins
  useEffect(() => {
    const loadCoins = async () => {
      const { data, error } = await supabase
        .from("coins")
        .select("*")
        .order("cap", { ascending: false });
      if (error) {
        console.error("Error loading coins:", error);
      } else {
        setCoins(data || []);
      }
    };
    loadCoins();
  }, [refreshing]);

  // Handle investment amount changes per coin
  const handleInvestmentAmountChange = (coinId: string, amount: number) => {
    setInvestmentAmounts((prev) => ({ ...prev, [coinId]: amount }));
  };

  // Handle buy button click
  const handleBuyCoin = async (coinId: string) => {
    const amount = investmentAmounts[coinId];
    if (!amount || amount <= 0) {
      setMessage("Please enter a valid amount to invest.");
      return;
    }
    if (!user) {
      setMessage("You must be logged in to buy coins.");
      return;
    }

    try {
      setMessage("Processing purchase...");
      // Here would be your Stripe payment intent and checkout session creation
      // For demo, simulate a success after 2 seconds
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setMessage(`Successfully purchased $${amount.toFixed(2)} of coin ${coinId}!`);
      // Optionally refresh user holdings or coin data here
      setInvestmentAmounts((prev) => ({ ...prev, [coinId]: 0 }));
    } catch (error) {
      console.error("Purchase error:", error);
      setMessage("Error processing purchase, please try again.");
    }
  };

  // Filter coins based on search and filter
  const filteredCoins = coins.filter((coin) => {
    const matchSearch = coin.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === "all" ? true : filter === coin.type;
    return matchSearch && matchFilter;
  });

  // Admin check
  const isAdmin = user?.email === ADMIN_EMAIL;

  // Render coin list item for react-window
  const renderCoinRow = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const coin = filteredCoins[index];
    const amount = investmentAmounts[coin.id] || 0;
    return (
      <div style={style} key={coin.id}>
        <CoinCard
          coin={coin}
          amount={amount}
          onAmountChange={handleInvestmentAmountChange}
          onBuy={handleBuyCoin}
        />
      </div>
    );
  };

  // Toggle dark mode (optional)
  const toggleDarkMode = () => setDarkMode(!darkMode);

  // Toggle grid mode
  const toggleGridMode = () => setGridMode(!gridMode);

  // Toggle avatar display mode
  const toggleAvatarMode = () =>
    setMode(mode === "focused" ? "full-body" : "focused");

  // Admin action: Reset all investments (example)
  const adminResetInvestments = () => {
    if (!isAdmin) return;
    setInvestmentAmounts({});
    setMessage("Investment amounts reset by admin.");
  };

  return (
    <main
      style={{
        display: "flex",
        gap: 20,
        padding: 24,
        background: darkMode ? "#121212" : "#0d1117",
        minHeight: "100vh",
        color: darkMode ? "#eee" : "#fff",
      }}
    >
      {/* Left Panel: Coins and Buy Flow */}
      <section
        style={{
          flex: 1,
          background: darkMode ? "#222" : "#161b22",
          borderRadius: 12,
          padding: 16,
          display: "flex",
          flexDirection: "column",
          height: "90vh",
          overflow: "hidden",
        }}
      >
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <h2>Your Coins</h2>
          <button
            onClick={toggleDarkMode}
            style={{
              background: darkMode ? "#ffcc00" : "#444",
              border: "none",
              borderRadius: 6,
              padding: "6px 12px",
              cursor: "pointer",
              color: darkMode ? "#000" : "#fff",
            }}
          >
            {darkMode ? "Light Mode" : "Dark Mode"}
          </button>
        </header>
        <input
          type="search"
          placeholder="Search coins..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: 8,
            borderRadius: 6,
            border: "1px solid #444",
            marginBottom: 12,
            background: darkMode ? "#333" : "#222",
            color: darkMode ? "#eee" : "#ddd",
          }}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "space-around",
            marginBottom: 12,
          }}
        >
          <button
            onClick={() => setFilter("all")}
            style={{
              background: filter === "all" ? "#0af" : "transparent",
              border: "none",
              borderRadius: 6,
              padding: "6px 12px",
              color: filter === "all" ? "#fff" : "#aaa",
              cursor: "pointer",
            }}
          >
            All
          </button>
          <button
            onClick={() => setFilter("stock")}
            style={{
              background: filter === "stock" ? "#0af" : "transparent",
              border: "none",
              borderRadius: 6,
              padding: "6px 12px",
              color: filter === "stock" ? "#fff" : "#aaa",
              cursor: "pointer",
            }}
          >
            Stocks
          </button>
          <button
            onClick={() => setFilter("crypto")}
            style={{
              background: filter === "crypto" ? "#0af" : "transparent",
              border: "none",
              borderRadius: 6,
              padding: "6px 12px",
              color: filter === "crypto" ? "#fff" : "#aaa",
              cursor: "pointer",
            }}
          >
            Crypto
          </button>
        </div>
        <div style={{ flex: 1 }}>
          <AutoSizer>
            {({ height, width }) => (
              <List
                height={height}
                itemCount={filteredCoins.length}
                itemSize={160}
                width={width}
              >
                {renderCoinRow}
              </List>
            )}
          </AutoSizer>
        </div>
        {isAdmin && (
          <button
            onClick={adminResetInvestments}
            style={{
              marginTop: 12,
              background: "crimson",
              color: "#fff",
              padding: "10px 16px",
              borderRadius: 8,
              border: "none",
              cursor: "pointer",
            }}
            title="Admin only: reset all investment amounts"
          >
            Reset Investments (Admin)
          </button>
        )}
        {message && (
          <p
            style={{
              marginTop: 16,
              padding: 8,
              borderRadius: 6,
              background: "#0a0a0a",
              color: "#0af",
            }}
          >
            {message}
          </p>
        )}
      </section>

      {/* Center Panel: Avatar & Scene */}
      <section
        style={{
          flex: 2,
          background: darkMode ? "#222" : "#161b22",
          borderRadius: 12,
          padding: 16,
          display: "flex",
          flexDirection: "column",
          height: "90vh",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          <h2>Immersive View</h2>
          <div>
            <button
              onClick={toggleAvatarMode}
              style={{
                marginRight: 8,
                background: mode === "focused" ? "#0af" : "transparent",
                border: "none",
                padding: "6px 12px",
                borderRadius: 6,
                color: mode === "focused" ? "#fff" : "#aaa",
                cursor: "pointer",
              }}
              title="Toggle focused/full body avatar"
            >
              {mode === "focused" ? "Focused" : "Full Body"}
            </button>
            <button
              onClick={() => setSceneMode(sceneMode === "cart" ? "closet" : "cart")}
              style={{
                background: "#0af",
                border: "none",
                borderRadius: 6,
                padding: "6px 12px",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              Toggle Scene Mode ({sceneMode})
            </button>
          </div>
        </div>
        <div
          style={{
            flex: 1,
            borderRadius: 12,
            overflow: "hidden",
            background: darkMode ? "#111" : "#121722",
          }}
        >
          {mode === "focused" ? (
            <Suspense fallback={<div>Loading avatar...</div>}>
              <FocusedAvatar key={avatarKey} />
            </Suspense>
          ) : (
            <Suspense fallback={<div>Loading full body avatar...</div>}>
              <FullBodyAvatar modelPaths={fullBodyModels} key={avatarKey} />
            </Suspense>
          )}
        </div>
      </section>

      {/* Right Panel: Departments */}
      <section
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 16,
          height: "90vh",
          overflowY: "auto",
        }}
      >
        {DEPARTMENTS.map((department) => {
          const deptMedia = depmedia.filter(
            (m) =>
              m.department?.toLowerCase() === department.toLowerCase()
          );
          const isArt = department === "Art";
          return (
            <div
              key={department}
              style={{
                background: darkMode ? "#222" : "#161b22",
                borderRadius: 12,
                padding: 12,
                boxShadow: "0 2px 12px rgba(0,0,0,0.4)",
              }}
              onMouseEnter={() => setHoveredDept(department)}
              onMouseLeave={() => setHoveredDept(null)}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <h3>{department}</h3>
                {isArt ? (
                  <button
                    onClick={() => router.push("/business/art")}
                    style={{
                      background: "#0af",
                      border: "none",
                      borderRadius: 6,
                      padding: "4px 8px",
                      cursor: "pointer",
                      color: "#fff",
                      fontSize: 14,
                    }}
                  >
                    Explore
                  </button>
                ) : (
                  <Countdown targetDate={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)} />
                )}
              </div>
              <BusinessCarousel
                department={department}
                media={deptMedia}
              />
            </div>
          );
        })}
      </section>
    </main>
  );
}
// Countdown Timer Component
function Countdown({ targetDate }: { targetDate: Date }) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(targetDate));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetDate));
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <div style={{ fontSize: 13, color: "#9ae6b4", userSelect: "none" }}>
      {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
    </div>
  );
}

// Helper to calculate remaining time
function calculateTimeLeft(targetDate: Date) {
  const now = new Date();
  const diff = targetDate.getTime() - now.getTime();
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}
