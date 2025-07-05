// pages/index.tsx
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

// Add all departments here:
const DEPARTMENTS = [
  { key: "art", label: "Art Department" },
  { key: "entertainment", label: "Entertainment" },
  { key: "cuisine", label: "Cuisine" },
  { key: "fashion", label: "Fashion" },
  { key: "health", label: "Health & Fitness" },
  { key: "science", label: "Science & Tech" },
  { key: "community", label: "Community Clipboard" }
];

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
    <div style={{ margin: "1rem 0", padding: "1rem", borderRadius: 8, border: "1px solid #ccc", background: "var(--card-bg)", color: "var(--text-color)", textAlign: "center" }}>
      <strong style={{ fontSize: 18 }}>{coin.emoji ?? "🪙"} {coin.name}</strong>
      <p>${coin.price.toFixed(2)} · cap {coin.cap}</p>
      <input
        type="number"
        value={localAmount}
        min={0}
        step="0.01"
        onChange={handleChange}
        style={{ marginTop: 8, padding: 8, width: "80%", borderRadius: 6, border: "1px solid #ccc", background: "var(--input-bg)", color: "var(--text-color)" }}
      />
      <button onClick={() => onBuy(coin.id)} style={{ marginTop: 12, padding: "10px 18px", borderRadius: 8, background: "#2563eb", color: "#fff", fontWeight: "bold", border: "none", cursor: "pointer" }}>Buy</button>
    </div>
  );
}

export default function Home() {
  // ... All previous state ...
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
  const [mediaByDepartment, setMediaByDepartment] = useState<{ [key: string]: any[] }>({});
  const router = useRouter();

  // All your effects: unchanged
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  // Fetch all department media and group by department
  useEffect(() => {
    const fetchMedia = async () => {
      const { data, error } = await supabase.from("department_media").select("*");
      if (error) {
        setMediaByDepartment({});
        return;
      }
      const grouped: { [key: string]: any[] } = {};
      data.forEach((m: any) => {
        if (!grouped[m.department]) grouped[m.department] = [];
        grouped[m.department].push(m);
      });
      setMediaByDepartment(grouped);
    };
    fetchMedia();
  }, []);

  // PATCH: Support $0 checkout
  const handleBuy = async (coinId: string) => {
    // ... unchanged
    // ... keep the full function as you have ...
  };

  // Filtering coins
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
    <div style={{ display: windowWidth < 800 ? "block" : "flex", height: "100vh", flexDirection: windowWidth < 800 ? "column" : "row" }}>
      {/* MOBILE TAB BAR */}
      {/* ... unchanged ... */}

      {/* LEFT PANEL */}
      {/* ... unchanged ... */}

      {/* CENTER PANEL */}
      {/* ... unchanged ... */}

      {/* RIGHT PANEL - ALL DEPARTMENT CAROUSELS and SUITE */}
      {(windowWidth >= 800 || activePanel === "right") && (
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 60 }}
          transition={{ duration: 0.4, type: "spring", stiffness: 90, damping: 20 }}
          style={{ flex: 1, padding: 20, display: windowWidth < 800 && activePanel !== "right" ? "none" : "block" }}
        >
          {/* --- PATCH: Render ALL Department Carousels --- */}
          {DEPARTMENTS.map(dept => (
            <div key={dept.key} style={{ marginBottom: 34 }}>
              <h2>{dept.label}</h2>
              <BusinessCarousel
                department={dept.key}
                aiPick={false}
                media={mediaByDepartment[dept.key] || []}
              />
            </div>
          ))}

          {/* Company Suite Cards (unchanged) */}
          <h2>Company Suite</h2>
          {DEPARTMENTS.map((dept, i) => (
            <motion.div
              key={dept.key}
              whileHover={{ scale: 1.025, y: -4, boxShadow: "0 6px 40px #0af5" }}
              onMouseEnter={() => setHoveredDept(dept.label)}
              onMouseLeave={() => setHoveredDept(null)}
              style={{
                marginBottom: 14,
                padding: 16,
                background: "#232a39",
                borderRadius: 12,
                cursor: "pointer",
                boxShadow: "0 1px 6px #0af1",
                position: "relative",
                minHeight: 76,
                transition: "background 0.22s, box-shadow 0.22s"
              }}
              onClick={() => router.push(`/business/${dept.key}`)}
            >
              <div style={{ display: "flex", alignItems: "center" }}>
                <h3 style={{ flex: 1, margin: 0 }}>{dept.label}</h3>
                {dept.key === "art" && (
                  <div style={{ marginLeft: 12, position: "relative", zIndex: 8 }}>
                    <Info size={22} color="#2ff6a8" style={{ verticalAlign: "middle", cursor: "pointer" }}
                      onClick={e => {
                        e.stopPropagation();
                        router.push("/business/art?about=1");
                      }}
                    />
                  </div>
                )}
              </div>
              {/* Description */}
              <p style={{ margin: "2px 0 0 0", opacity: 0.78 }}>{dept.desc}</p>
              {/* About message on hover (Art only) */}
              {dept.key === "art" && hoveredDept === "Art Department" && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  style={{
                    position: "absolute",
                    right: 28,
                    top: 8,
                    background: "#151a21",
                    color: "#fff",
                    padding: "10px 18px",
                    borderRadius: 12,
                    fontSize: 14,
                    boxShadow: "0 2px 18px #0af2",
                    maxWidth: 300,
                    zIndex: 20
                  }}
                >
                  the art of contracts, consulting, finance, communication, and planning and organization, all the important stuff artfully done all in one place for you.
                </motion.div>
              )}
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
