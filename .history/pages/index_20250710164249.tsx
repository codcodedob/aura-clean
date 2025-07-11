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
      <p style={{ opacity: 0.85 }}>
        ${coin.price.toFixed(2)} · cap {coin.cap}
      </p>
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
        onClick={() => onBuy(coin.id)}
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
  // USER + AUTH STATE
  const [user, setUser] = useState<User | null>(null);
  const [signupMode, setSignupMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  // UI + DATA STATES
  const [hasMounted, setHasMounted] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [coins, setCoins] = useState<Coin[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "stock" | "crypto">("all");
  const [investmentAmounts, setInvestmentAmounts] = useState<{ [key: string]: number }>({});
  const [activePanel, setActivePanel] = useState<"left" | "center" | "right">("center");
  const [windowWidth, setWindowWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1024);
  const [message, setMessage] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setHasMounted(true);
    setWindowWidth(window.innerWidth);
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Dark mode CSS vars
  useEffect(() => {
    document.documentElement.style.setProperty("--card-bg", darkMode ? "#1f2937" : "#fff");
    document.documentElement.style.setProperty("--text-color", darkMode ? "#f9fafb" : "#1a1a1a");
    document.documentElement.style.setProperty("--input-bg", darkMode ? "#374151" : "#f3f4f6");
    document.body.style.backgroundColor = darkMode ? "#111827" : "#f9fafb";
  }, [darkMode]);

  // Supabase auth session check
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data?.user ?? null));
  }, []);

  // Fetch coins data
  useEffect(() => {
    fetch("/api/coins")
      .then((res) => res.json())
      .then((data) => setCoins(data || []));
  }, []);

  // Signup flow
  const handleSignup = async (email: string, password: string) => {
    setLoading(true);
    setAuthError("");

    const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
    if (signUpError) {
      setAuthError(signUpError.message);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/create-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, userId: data.user?.id }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to create user");
    } catch (e: any) {
      setAuthError("Failed to create Stripe user: " + e.message);
      setLoading(false);
      return;
    }

    alert("Account created! Please check your email to confirm and then login.");
    setSignupMode(false);
    setLoading(false);
  };

  // Login flow
  const handleLogin = async (email: string, password: string) => {
    setLoading(true);
    setAuthError("");

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setAuthError(signInError.message);
      setLoading(false);
      return;
    }

    const { data } = await supabase.auth.getUser();
    setUser(data?.user ?? null);
    setLoading(false);
  };

  // Logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  // Handle Buy coin
  const handleBuy = async (coinId: string) => {
    const amount = investmentAmounts[coinId] ?? 0;
    if (!user) {
      alert("You must be signed in to purchase.");
      return;
    }

    const res = await fetch("/api/create-checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ coinId, amount, userId: user.id }),
    });

    const text = await res.text();

    let json;
    try {
      json = JSON.parse(text);
    } catch (err) {
      alert("Response was not valid JSON.");
      return;
    }

    if (!json.sessionId) {
      alert("Checkout sessionId is missing.");
      return;
    }

    const stripeModule = await import("@stripe/stripe-js");
    const stripePromise = stripeModule.loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
    const stripe = await stripePromise;
    if (!stripe) throw new Error("Stripe failed to load");

    await stripe.redirectToCheckout({ sessionId: json.sessionId });
  };

  // Filter coins for display
  const filteredCoins = coins.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || (c.emoji ?? "").includes(search);
    const matchesType = filter === "all" || c.type === filter;
    return matchesSearch && matchesType;
  });
  const othersCoins = filteredCoins.filter((c) => c.user_id !== user?.id);
  const featuredCoin = filteredCoins.find((c) => c.is_featured);

  if (!hasMounted) return null;

  return (
    <div
      style={{
        display: windowWidth < 800 ? "block" : "flex",
        height: "100vh",
        flexDirection: windowWidth < 800 ? "column" : "row",
        background: "linear-gradient(120deg, #181825 40%, #111827 100%)",
      }}
    >
      {/* MOBILE TAB BAR */}
      {windowWidth < 800 && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-around",
            background: "#181825",
            padding: 10,
            borderBottom: "1px solid #222",
          }}
        >
          <button
            onClick={() => setActivePanel("left")}
            style={{ color: activePanel === "left" ? "#0af" : "#fff", fontWeight: "bold", flex: 1 }}
          >
            Coins
          </button>
          <button
            onClick={() => setActivePanel("center")}
            style={{ color: activePanel === "center" ? "#0af" : "#fff", fontWeight: "bold", flex: 1 }}
          >
            Profile
          </button>
          <button
            onClick={() => setActivePanel("right")}
            style={{ color: activePanel === "right" ? "#0af" : "#fff", fontWeight: "bold", flex: 1 }}
          >
            Suite
          </button>
        </div>
      )}

      {/* LEFT PANEL */}
      {(windowWidth >= 800 || activePanel === "left") && (
        <div
          style={{
            flex: 1,
            padding: 20,
            overflow: "hidden",
            display: windowWidth < 800 && activePanel !== "left" ? "none" : "block",
            background: "rgba(24,24,37,0.98)",
            borderRight: "1.5px solid #222c",
          }}
        >
          <div style={{ height: "100%" }}>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search coins"
              style={{ padding: 10, borderRadius: 6, width: "100%", marginBottom: 10, border: "1px solid #222", background: "#232a39", color: "#fff" }}
            />
            <div style={{ marginBottom: 10 }}>
              <button onClick={() => setFilter("all")} style={{ marginRight: 8, color: filter === "all" ? "#0af" : "#ccc" }}>
                All
              </button>
              <button onClick={() => setFilter("stock")} style={{ marginRight: 8, color: filter === "stock" ? "#0af" : "#ccc" }}>
                Stocks
              </button>
              <button onClick={() => setFilter("crypto")} style={{ color: filter === "crypto" ? "#0af" : "#ccc" }}>
                Crypto
              </button>
            </div>
            <AutoSizer>
              {({ height, width }: { height: number; width: number }) => (
                <List height={height} itemCount={othersCoins.length + (featuredCoin ? 1 : 0)} itemSize={140} width={width}>
                  {({ index, style }) => {
                    if (featuredCoin && index === 0) {
                      return (
                        <div style={style} key={featuredCoin.id}>
                          <CoinCard
                            coin={featuredCoin}
                            amount={investmentAmounts[featuredCoin.id] ?? 0}
                            onAmountChange={(id, amt) => setInvestmentAmounts((prev) => ({ ...prev, [id]: amt }))}
                            onBuy={handleBuy}
                          />
                        </div>
                      );
                    }
                    const coin = featuredCoin ? othersCoins[index - 1] : othersCoins[index];
                    return (
                      <div style={style} key={coin.id}>
                        <CoinCard
                          coin={coin}
                          amount={investmentAmounts[coin.id] ?? 0}
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
        </div>
      )}

      {/* CENTER PANEL */}
      {(windowWidth >= 800 || activePanel === "center") && (
        <div
          style={{
            flex: 1,
            padding: 20,
            borderLeft: "1.5px solid #222c",
            borderRight: "1.5px solid #222c",
            overflowY: "auto",
            display: windowWidth < 800 && activePanel !== "center" ? "none" : "block",
          }}
        >
          {!user ? (
            <div
              style={{
                maxWidth: 360,
                margin: "auto",
                background: "#222",
                borderRadius: 8,
                padding: 20,
                color: "#fff",
              }}
            >
              <h2>{signupMode ? "Create Account" : "Login"}</h2>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const form = e.currentTarget;
                  const email = (form.elements.namedItem("email") as HTMLInputElement).value;
                  const password = (form.elements.namedItem("password") as HTMLInputElement).value;

                  if (signupMode) {
                    await handleSignup(email, password);
                  } else {
                    await handleLogin(email, password);
                  }
                }}
              >
                <input
                  name="email"
                  type="email"
                  placeholder="Email"
                  required
                  style={{ width: "100%", padding: 8, marginBottom: 12, borderRadius: 4, border: "none" }}
                />
                <input
                  name="password"
                  type="password"
                  placeholder="Password"
                  required
                  style={{ width: "100%", padding: 8, marginBottom: 12, borderRadius: 4, border: "none" }}
                />
                <button
                  type="submit"
                  disabled={loading}
                  style={{ width: "100%", padding: 10, borderRadius: 4, background: "#0af", color: "#000", fontWeight: "bold" }}
                >
                  {loading ? "Please wait..." : signupMode ? "Create Account" : "Login"}
                </button>
              </form>
              <button
                onClick={() => {
                  setAuthError("");
                  setSignupMode(!signupMode);
                }}
                style={{ marginTop: 12, background: "transparent", color: "#0af", border: "none", cursor: "pointer" }}
              >
                {signupMode ? "← Back to Login" : "Need an account? Sign Up"}
              </button>
              {authError && <div style={{ marginTop: 12, color: "#f33" }}>{authError}</div>}
            </div>
          ) : (
            <div>
              <h2 style={{ marginBottom: 12, color: "#0af" }}>Welcome, {user.email}</h2>
              <button
                onClick={handleLogout}
                style={{
                  background: "#f33",
                  padding: "8px 14px",
                  borderRadius: 8,
                  color: "#fff",
                  fontWeight: "bold",
                  border: "none",
                  cursor: "pointer",
                  marginBottom: 20,
                }}
              >
                Logout
              </button>
              <Suspense fallback={<div>Loading avatar...</div>}>
                <AvatarClothingSelector userId={user.id} />
              </Suspense>
            </div>
          )}
        </div>
      )}

      {/* RIGHT PANEL */}
      {(windowWidth >= 800 || activePanel === "right") && (
        <div
          style={{
            flex: 1,
            padding: 20,
            background: "rgba(24,24,37,0.98)",
            borderLeft: "1.5px solid #222c",
            overflowY: "auto",
            display: windowWidth < 800 && activePanel !== "right" ? "none" : "block",
          }}
        >
          <h3 style={{ color: "#0af" }}>Business Departments</h3>
          {/* Example hardcoded departments - replace with dynamic fetch if you want */}
          {["art", "marketing", "sales", "finance", "operations", "hr", "legal"].map((department) => (
            <div key={department} style={{ marginBottom: 20 }}>
              <h4 style={{ color: "#9ae6b4", marginBottom: 6 }}>{department.toUpperCase()}</h4>
              <BusinessCarousel department={department} />
            </div>
          ))}
          <GravityScene />
        </div>
      )}
    </div>
  );
}
