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

function CoinCard({ coin, amount, onAmountChange, onBuy, loading }: {
  coin: Coin,
  amount: number,
  onAmountChange: (id: string, amt: number) => void,
  onBuy: (id: string) => void,
  loading?: boolean
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
      position: 'relative',
      opacity: loading ? 0.6 : 1,
      pointerEvents: loading ? "none" : "auto",
    }}>
      <strong style={{ fontSize: 20 }}>{coin.emoji ?? "🪙"} {coin.name}</strong>
      <p style={{ opacity: 0.85 }}>${coin.price.toFixed(2)} · cap {coin.cap}</p>
      <input
        type="number"
        value={localAmount}
        min={0}
        step="0.01"
        onChange={handleChange}
        disabled={loading}
        style={{
          marginTop: 8, padding: 8, width: "80%",
          borderRadius: 6, border: "1px solid #222",
          background: "var(--input-bg)", color: "var(--text-color)",
        }}
      />
      <button
        onClick={() => onBuy(coin.id)}
        disabled={loading}
        style={{
          marginTop: 12, padding: "10px 18px", borderRadius: 8,
          background: loading ? "#999" : "#2563eb",
          color: "#fff", fontWeight: "bold",
          border: "none", cursor: loading ? "not-allowed" : "pointer"
        }}
      >
        {loading ? "Processing..." : "Buy"}
      </button>
    </div>
  );
}

function Toast({ message, type }: { message: string, type: "error" | "success" }) {
  return (
    <div style={{
      position: "fixed",
      bottom: 20,
      left: "50%",
      transform: "translateX(-50%)",
      backgroundColor: type === "error" ? "#ff4d4f" : "#10b981",
      color: "#fff",
      padding: "12px 24px",
      borderRadius: 8,
      boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
      zIndex: 1000,
      fontWeight: "bold",
      minWidth: 200,
      textAlign: "center",
    }}>
      {message}
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
  const [buyLoadingIds, setBuyLoadingIds] = useState<string[]>([]);
  const [toast, setToast] = useState<{ message: string; type: "error" | "success" } | null>(null);
  const router = useRouter();

  // Helper to show toast messages
  const showToast = (message: string, type: "error" | "success" = "success", duration = 4000) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), duration);
  };

  useEffect(() => {
    setHasMounted(true);
    setWindowWidth(window.innerWidth);
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Supabase auth listener to keep user state in sync
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Load coins from your API endpoint
  useEffect(() => {
    fetch("/api/coins")
      .then((res) => res.json())
      .then((data) => setCoins(data || []))
      .catch((err) => {
        console.error("Failed to fetch coins", err);
        showToast("Failed to load coins", "error");
      });
  }, []);

  // Refresh market data for admin
  const refreshMarketData = async () => {
    setRefreshing(true);
    setMessage("Refreshing market data...");
    try {
      const res = await fetch("https://ofhpjvbmrfwbmboxibur.functions.supabase.co/admin_refresh_coins", { method: "POST" });
      const text = await res.text();
      setMessage(res.ok ? `✅ Refreshed: ${text}` : `❌ Failed: ${text}`);
      if (res.ok) showToast("Market data refreshed!", "success");
      else showToast("Failed to refresh market data", "error");
    } catch (err) {
      console.error(err);
      setMessage("❌ Error occurred while refreshing.");
      showToast("Error refreshing market data", "error");
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

  // Buy with retry & confirmation modal scaffold
  const handleBuy = async (coinId: string, retries = 3) => {
    if (buyLoadingIds.includes(coinId)) return; // Prevent double clicks
    const amount = investmentAmounts[coinId] ?? 0;
    if (amount <= 0) {
      showToast("Please enter an amount greater than zero", "error");
      return;
    }
    const userData = await supabase.auth.getUser();
    const userId = userData.data.user?.id;
    if (!userId) {
      showToast("You must be signed in to purchase.", "error");
      return;
    }
    setBuyLoadingIds((prev) => [...prev, coinId]);
    try {
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
        throw new Error("Invalid JSON response from server");
      }

      if (!json.sessionId) {
        throw new Error("Checkout sessionId missing");
      }

      const stripeModule = await import("@stripe/stripe-js");
      const stripePromise = stripeModule.loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
      const stripe = await stripePromise;
      if (!stripe) throw new Error("Stripe failed to load");

      await stripe.redirectToCheckout({ sessionId: json.sessionId });
      showToast("Redirecting to checkout...", "success");
    } catch (error: any) {
      console.error("Buy failed:", error);
      showToast(`Purchase failed: ${error.message}`, "error");
      if (retries > 0) {
        setTimeout(() => handleBuy(coinId, retries - 1), 1500); // Retry with delay
      }
    } finally {
      setBuyLoadingIds((prev) => prev.filter((id) => id !== coinId));
    }
  };

  // Signup/login handler with loading state & storing stripe_customer_id in user metadata
  const handleSignupOrLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSignupError("");
    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;

    try {
      if (signupMode) {
        // SIGNUP FLOW
        const { data, error } = await supabase.auth.signUp({ email, password });

        if (error) {
          setSignupError(error.message);
          return;
        }

        if (data.user) {
          // After sign up, create user metadata row with stripe_customer_id here:
          // You can call a serverless function or API route that creates a Stripe customer and updates your DB accordingly.
          // For demo, we'll mock the stripe_customer_id creation and store it:

          // Mock example (replace with your actual backend call):
          const stripe_customer_id = `cus_${Math.random().toString(36).substring(2, 12)}`;

          // Call your API route to update user profile in Supabase with stripe_customer_id
          const res = await fetch("/api/update-user-stripe-id", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: data.user.id, stripe_customer_id }),
          });
          if (!res.ok) {
            setSignupError("Failed to save Stripe customer ID.");
            return;
          }
          showToast("Account created! Please check your email to confirm.", "success");
          form.reset();
          setSignupMode(false);
        }
      } else {
        // LOGIN FLOW
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          setSignupError(error.message);
          return;
        }
        showToast("Logged in successfully!", "success");
      }
    } catch (err: any) {
      setSignupError(err.message || "Unknown error");
    }
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
              {({ height, width }: { height: number; width:
