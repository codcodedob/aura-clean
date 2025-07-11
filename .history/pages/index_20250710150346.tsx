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

  if (!hasMounted) return null;

  return (
    <div style={{ padding: 20 }}>
      {!user ? (
        <div style={{ maxWidth: 400, margin: "0 auto", padding: 20, background: "#181825", borderRadius: 12 }}>
          <h2 style={{ color: "#0af" }}>{signupMode ? "🟢 Create Account" : "🔐 Log In"}</h2>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setSignupError("");

              const email = (e.currentTarget.elements.namedItem("email") as HTMLInputElement).value;
              const password = (e.currentTarget.elements.namedItem("password") as HTMLInputElement).value;

              if (signupMode) {
                const res = await fetch("/api/create-user", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ email, password }),
                });

                const data = await res.json();

                if (!res.ok) {
                  setSignupError(data.error ?? "An unknown error occurred.");
                } else {
                  alert("✅ Account created! You can now log in.");
                  setSignupMode(false);
                }
              } else {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) {
                  setSignupError(error.message);
                } else {
                  alert("✅ Logged in successfully.");
                  window.location.reload();
                }
              }
            }}
          >
            <input name="email" type="email" placeholder="Email" required />
            <input name="password" type="password" placeholder="Password" required />
            <button type="submit">{signupMode ? "Create Account" : "Login"}</button>
            <button
              type="button"
              onClick={() => { setSignupMode(!signupMode); setSignupError(""); }}
            >
              {signupMode ? "← Back to Login" : "Need an account? Sign Up"}
            </button>
            {signupError && <div style={{ color: "#f55" }}>{signupError}</div>}
          </form>
        </div>
      ) : (
        <div style={{ color: "#fff" }}>
          👋 Welcome, {user.email}
        </div>
      )}
    </div>
  );
}
